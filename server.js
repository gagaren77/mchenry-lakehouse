// Zero-dependency web server for the McHenry lakehouse site.
// Serves /public, exposes /api/availability (from VRBO/Airbnb iCal feeds or data/bookings.json)
// and /api/inquiry (stores inquiries and optionally forwards them to a webhook).
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const ICAL_URLS = (process.env.ICAL_URLS || process.env.ICAL_URL || '').split(/[\s,]+/).filter(Boolean);
const CACHE_MS = (parseInt(process.env.ICAL_CACHE_MINUTES || '30', 10)) * 60 * 1000;
const WEBHOOK = process.env.INQUIRY_WEBHOOK_URL || '';
const BUILD = Date.now().toString(36); // cache-buster for css/js, changes on every deploy

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };

// ---------- iCal ----------
function parseIcs(text) {
  const lines = text.replace(/\r\n[ \t]/g, '').split(/\r?\n/);
  const out = []; let ev = null;
  const toDate = v => { const m = /(\d{4})(\d{2})(\d{2})/.exec(v); return m ? `${m[1]}-${m[2]}-${m[3]}` : null; };
  for (const l of lines) {
    if (l === 'BEGIN:VEVENT') ev = {};
    else if (l === 'END:VEVENT') { if (ev && ev.start && ev.end) out.push(ev); ev = null; }
    else if (ev) {
      const i = l.indexOf(':'); if (i < 0) continue;
      const key = l.slice(0, i).split(';')[0]; const val = l.slice(i + 1);
      if (key === 'DTSTART') ev.start = toDate(val);
      if (key === 'DTEND') ev.end = toDate(val); // exclusive: checkout day
    }
  }
  return out;
}
let cache = { at: 0, data: null };
async function availability() {
  if (cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;
  let booked = [], source = 'manual';
  if (ICAL_URLS.length) {
    try {
      const texts = await Promise.all(ICAL_URLS.map(u => fetch(u, { headers: { 'User-Agent': 'mchenry-lakehouse/1.0' } }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })));
      booked = texts.flatMap(parseIcs); source = 'ical';
    } catch (e) { console.error('iCal fetch failed:', e.message); }
  }
  if (source === 'manual') {
    try { booked = JSON.parse(fs.readFileSync(path.join(DATA, 'bookings.json'), 'utf8')).booked || []; } catch { booked = []; }
  }
  booked = booked.map(b => ({ start: b.start, end: b.end })).filter(b => b.start && b.end).sort((a, b) => a.start.localeCompare(b.start));
  cache = { at: Date.now(), data: { source, updated: new Date().toISOString(), booked } };
  return cache.data;
}

// ---------- helpers ----------
function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
function readBody(req, limit = 20000) {
  return new Promise((resolve, reject) => {
    let d = ''; req.on('data', c => { d += c; if (d.length > limit) { reject(new Error('too large')); req.destroy(); } });
    req.on('end', () => resolve(d)); req.on('error', reject);
  });
}
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now(); const arr = (hits.get(ip) || []).filter(t => now - t < 3600e3);
  arr.push(now); hits.set(ip, arr); return arr.length > 5;
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/api/availability') return send(res, 200, await availability());
    if (url.pathname === '/healthz') return send(res, 200, { ok: true });
    if (url.pathname === '/api/inquiry' && req.method === 'POST') {
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
      if (rateLimited(ip)) return send(res, 429, { ok: false, error: 'Too many requests, please try later.' });
      let b; try { b = JSON.parse(await readBody(req)); } catch { return send(res, 400, { ok: false, error: 'Bad request' }); }
      if (b.website) return send(res, 200, { ok: true }); // honeypot
      const clean = s => String(s || '').slice(0, 2000).trim();
      const inq = { at: new Date().toISOString(), name: clean(b.name), email: clean(b.email), phone: clean(b.phone),
        checkin: clean(b.checkin), checkout: clean(b.checkout), guests: clean(b.guests), pets: clean(b.pets), message: clean(b.message) };
      if (!inq.name || !/^\S+@\S+\.\S+$/.test(inq.email)) return send(res, 400, { ok: false, error: 'Please add your name and a valid email.' });
      try { fs.mkdirSync(DATA, { recursive: true }); fs.appendFileSync(path.join(DATA, 'inquiries.jsonl'), JSON.stringify(inq) + '\n'); } catch (e) { console.error(e.message); }
      console.log('New inquiry:', JSON.stringify(inq));
      if (WEBHOOK) {
        const text = `New McHenry Lakehouse inquiry from ${inq.name} <${inq.email}> ${inq.phone}\n${inq.checkin} → ${inq.checkout}, ${inq.guests} guests, pets: ${inq.pets}\n${inq.message}`;
        fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, content: text, ...inq }) }).catch(e => console.error('webhook', e.message));
      }
      return send(res, 200, { ok: true });
    }
    // static
    let p = decodeURIComponent(url.pathname); if (p.endsWith('/')) p += 'index.html';
    const file = path.normalize(path.join(PUBLIC, p));
    if (!file.startsWith(PUBLIC)) return send(res, 403, 'Forbidden', 'text/plain');
    fs.stat(file, (err, st) => {
      const ext = path.extname(file).toLowerCase();
      if (err || !st.isFile() || ext === '.html') {
        const html = fs.readFileSync(path.join(PUBLIC, err || !st.isFile() ? 'index.html' : path.relative(PUBLIC, file)), 'utf8').replace(/__V__/g, BUILD);
        res.writeHead(err || !st.isFile() ? 404 : 200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        return res.end(html);
      }
      res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
      fs.createReadStream(file).pipe(res);
    });
  } catch (e) { console.error(e); send(res, 500, { ok: false }); }
}).listen(PORT, () => console.log(`McHenry Lakehouse on :${PORT} (iCal feeds: ${ICAL_URLS.length})`));
