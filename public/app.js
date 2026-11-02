(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const IMG = id => `https://media.vrbo.com/lodging/84000000/83450000/83448000/83447985/${id}.jpg?impolicy=resizecrop&rw=1600&ra=fit`;

  /* ---------- Content ---------- */
  const PHOTOS = window.PHOTOS;
  const GRID_COUNT = 5;
  const SCORES = [['Cleanliness', 9.4], ['Check-in', 9.4], ['Communication', 9.4], ['Location', 9.4], ['Accuracy', 9.2]];
  const REVIEWS = [
    { name: 'Lori P.', when: 'July 2026', title: 'Second stay, still perfect', text: 'Came back for a second visit. Loads of space, spotless, great fishing off the dock, and front-row views of the Fourth of July fireworks.' },
    { name: 'Emily M.', when: 'July 2025', title: 'Pool, private lake and a canoe', text: 'We spent our days between the pool and the private lake, took the canoe out, and rented a boat nearby for a day on the Chain.' },
    { name: 'Marisa B.', when: 'August 2023', title: 'A 60th birthday to remember', text: 'Eight adults, three kids and two babies celebrated a 60th birthday here. Everyone loved the pool and the downstairs bar.' },
    { name: 'Justin G.', when: 'July 2026', title: 'Fantastic, unique property', text: 'A one-of-a-kind place. We would book it again without a second thought.' },
    { name: 'Nancy P.', when: 'July 2024', title: 'A spectacular setting', text: 'Our family getaway was boating, swimming and bonfires in a spectacular lakeside setting.' },
    { name: 'Martha T.', when: 'January 2026', title: 'Room for the whole family', text: 'Loved the big backyard, the open layout and the fun bear-themed decor. Plenty of room for everyone.' },
    { name: 'Megan R.', when: 'August 2025', title: 'The kids never wanted to leave', text: 'Our family vacation was all pool time and fishing. The kids had the best week.' },
    { name: 'Verified guest', when: 'July 2025', title: 'Plenty of beds and baths', text: 'Seven adults and nobody was ever waiting. Lots of sleeping space and bathrooms for a group.' },
    { name: 'Frank G.', when: 'July 2026', title: 'Clean and well kept', text: 'We gathered for a family celebration. The house was clean and well maintained, and the pool was great.' },
    { name: 'AC G.', when: 'August 2023', title: 'Thoughtful details', text: 'Bathrooms with the bedrooms, a great kitchen, the pool and the dock. Everything a group needs.' },
    { name: 'Annie G.', when: 'September 2024', title: 'Attentive owner', text: 'We enjoyed the pool and the fishing, and the owner was attentive and quick to respond.' },
    { name: 'David A.', when: 'August 2026', title: 'Beautiful and very clean', text: 'Four nights in a very clean, beautiful home. We enjoyed every minute.' },
  ];

  /* ---------- Icons ---------- */
  const P = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICONS = {
    pool: P('<path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 0-4 0M8 9h8"/>'),
    spa: P('<path d="M3 13h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M8 9c0-1.5 1-1.5 1-3M12 9c0-1.5 1-1.5 1-3M16 9c0-1.5 1-1.5 1-3"/>'),
    dock: P('<path d="M3 10h18M6 10v9M18 10v9M12 10v9"/><path d="M2 20c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>'),
    canoe: P('<path d="M2 14c4 3 16 3 20 0"/><path d="M6 6l12 12M17 4l3 3"/>'),
    deck: P('<path d="M3 20h18M5 20V10h14v10M9 10V6h6v4"/>'),
    leaf: P('<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l7-7"/>'),
    dining: P('<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 2-2 6 0 8v10"/>'),
    kitchen: P('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M8 6h.01M12 6h.01M10 13h4"/>'),
    bar: P('<path d="M6 3h12l-6 8zM12 11v8M8 21h8"/>'),
    office: P('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
    gym: P('<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>'),
    bath: P('<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0"/>'),
    car: P('<path d="M5 16l1.5-5h11L19 16M4 16h16v3H4zM7 19v2M17 19v2"/>'),
    dog: P('<path d="M10 5L6 3 4 8l3 2M14 5l4-2 2 5-3 2"/><path d="M7 10c0 6 2 10 5 10s5-4 5-10c0-3-2-5-5-5s-5 2-5 5z"/><path d="M10 13h.01M14 13h.01M11 16h2"/>'),
    people: P('<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15c3 0 5 2 5 4"/>'),
    clock: P('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    train: P('<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4M9 14h.01M15 14h.01"/>'),
  };
  $$('i[data-ico]').forEach(i => { i.innerHTML = ICONS[i.dataset.ico] || ''; });

  /* ---------- Nav ---------- */
  const nav = $('.nav'), menu = $('#menu'), menuBtn = $('.menu-btn');
  const onScroll = () => nav.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  menuBtn.addEventListener('click', () => { const o = menu.classList.toggle('open'); menuBtn.setAttribute('aria-expanded', o); });
  menu.addEventListener('click', e => { if (e.target.closest('a')) { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); } });

  /* ---------- Gallery + lightbox ---------- */
  const grid = $('#gallery-grid');
  PHOTOS.slice(0, GRID_COUNT).forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', `Open photo: ${p.cap}`);
    b.innerHTML = `<img src="${p.src}" alt="${p.cap}" ${i ? 'loading="lazy"' : ''}><span class="cap">${p.cap}</span>`;
    if (i === GRID_COUNT - 1 && PHOTOS.length > GRID_COUNT) b.innerHTML += `<span class="more">See all ${PHOTOS.length} photos</span>`;
    b.addEventListener('click', () => openLb(i));
    grid.appendChild(b);
  });
  const allBtn = $('#gallery-all'); if (allBtn) allBtn.textContent = `View all ${PHOTOS.length} photos`;
  const openLb = window.initLightbox(PHOTOS);

  /* ---------- Reviews ---------- */
  $('#score-bars').innerHTML = SCORES.map(([k, v]) =>
    `<dt>${k}</dt><dd class="bar" role="img" aria-label="${k} ${v} out of 10"><span style="width:${v * 10}%"></span></dd><dd>${v.toFixed(1)}</dd>`).join('');
  const REVIEW_PREVIEW = 6;
  const reviewHtml = r => `
    <article class="review card">
      <div class="stars" aria-label="10 out of 10">★★★★★</div>
      <h3>${r.title}</h3>
      <p>${r.text}</p>
      <footer><span class="avatar" aria-hidden="true">${r.name[0]}</span><span><b>${r.name}</b>${r.when}</span></footer>
    </article>`;
  const rg = $('#review-grid'), moreBtn = $('#reviews-more');
  rg.innerHTML = REVIEWS.slice(0, REVIEW_PREVIEW).map(reviewHtml).join('');
  moreBtn.textContent = `Read ${REVIEWS.length - REVIEW_PREVIEW} more reviews`;
  moreBtn.addEventListener('click', () => { rg.innerHTML = REVIEWS.map(reviewHtml).join(''); moreBtn.parentElement.remove(); });

  /* ---------- Calendar ---------- */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayIso = iso(today);
  const bookedNights = new Set();
  let monthOffset = 0, selIn = null, selOut = null;
  const MAX_MONTHS_AHEAD = 18;

  const isBooked = s => bookedNights.has(s);
  const rangeFree = (a, b) => { for (let d = parse(a); iso(d) < b; d = addDays(d, 1)) if (isBooked(iso(d))) return false; return true; };

  function renderCal() {
    const wrap = $('#cal-months'); wrap.innerHTML = '';
    for (let m = 0; m < 2; m++) {
      const first = new Date(today.getFullYear(), today.getMonth() + monthOffset + m, 1);
      const sec = document.createElement('div'); sec.className = 'cal-month';
      let html = `<h3>${MONTHS[first.getMonth()]} ${first.getFullYear()}</h3><div class="cal-grid" role="grid">`;
      html += ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => `<div class="cal-dow" aria-hidden="true">${d}</div>`).join('');
      for (let i = 0; i < first.getDay(); i++) html += '<span class="day empty"></span>';
      const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const date = new Date(first.getFullYear(), first.getMonth(), d), s = iso(date), prev = iso(addDays(date, -1));
        const cls = ['day']; let disabled = false, label = date.toDateString();
        if (s < todayIso) { cls.push('past'); disabled = true; }
        else if (isBooked(s)) {
          // A booked night whose previous night is free is still a valid checkout day.
          const canCheckout = selIn && !selOut && s > selIn && rangeFree(selIn, s);
          if (!isBooked(prev) || canCheckout) { cls.push('booked', 'co'); label += ', check-out only'; if (!canCheckout) disabled = true; }
          else { cls.push('booked'); disabled = true; label += ', booked'; }
          if (!canCheckout) disabled = true;
        } else label += ', available';
        if (s === todayIso) cls.push('today');
        if (selIn && s === selIn) cls.push('sel');
        if (selOut && s === selOut) cls.push('sel');
        if (selIn && selOut && s > selIn && s < selOut) cls.push('in-range');
        html += `<button type="button" class="${cls.join(' ')}" data-d="${s}" ${disabled ? 'disabled' : ''} aria-label="${label}">${d}</button>`;
      }
      sec.innerHTML = html + '</div>';
      wrap.appendChild(sec);
    }
    $('#cal-prev').disabled = monthOffset <= 0;
    $('#cal-next').disabled = monthOffset >= MAX_MONTHS_AHEAD;
    updatePick();
  }
  function updatePick() {
    const fmt = s => parse(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    const go = $('#cal-go');
    if (selIn && selOut) {
      const n = Math.round((parse(selOut) - parse(selIn)) / 864e5);
      $('#cal-pick').textContent = `${fmt(selIn)} → ${fmt(selOut)} · ${n} night${n > 1 ? 's' : ''}`;
      go.removeAttribute('aria-disabled');
    } else {
      $('#cal-pick').textContent = selIn ? `Check-in ${fmt(selIn)}. Now pick your check-out day.` : 'Pick a check-in day.';
      go.setAttribute('aria-disabled', 'true');
    }
  }
  $('#cal-months').addEventListener('click', e => {
    const b = e.target.closest('button.day'); if (!b || b.disabled) return;
    const s = b.dataset.d;
    if (!selIn || selOut || s <= selIn) { if (isBooked(s)) return; selIn = s; selOut = null; }
    else if (rangeFree(selIn, s)) selOut = s;
    else { if (isBooked(s)) return; selIn = s; selOut = null; }
    renderCal();
    const again = $(`button.day[data-d="${s}"]`); again && again.focus();
  });
  $('#cal-prev').onclick = () => { if (monthOffset > 0) { monthOffset--; renderCal(); } };
  $('#cal-next').onclick = () => { if (monthOffset < MAX_MONTHS_AHEAD) { monthOffset++; renderCal(); } };
  $('#cal-clear').onclick = () => { selIn = selOut = null; renderCal(); };
  $('#cal-go').addEventListener('click', () => { if (selIn && selOut) { $('#f-in').value = selIn; $('#f-out').value = selOut; } });

  fetch('/api/availability').then(r => r.ok ? r.json() : Promise.reject()).then(data => {
    data.booked.forEach(b => { for (let d = parse(b.start); iso(d) < b.end; d = addDays(d, 1)) bookedNights.add(iso(d)); });
    $('#cal-status').textContent = 'Live availability';
    const when = new Date(data.updated).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    $('#cal-source').textContent = data.source === 'ical'
      ? `Synced with our booking calendar · updated ${when}. Final availability is confirmed when you book.`
      : 'Availability is updated by the owner. Final availability is confirmed when you book.';
  }).catch(() => {
    $('#cal-status').textContent = 'Calendar unavailable right now';
    $('#cal-source').textContent = 'Send a request with your dates and we will confirm availability.';
  }).finally(renderCal);
  renderCal();

  /* ---------- Inquiry form ---------- */
  const form = $('#inquiry-form'), msg = $('#form-msg');
  const gs = form.elements.guests; for (let i = 1; i <= 12; i++) gs.add(new Option(`${i} guest${i > 1 ? 's' : ''}`, i));
  form.elements.checkin.min = form.elements.checkout.min = todayIso;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    msg.className = 'form-msg';
    if (!data.name || !/^\S+@\S+\.\S+$/.test(data.email)) { msg.textContent = 'Please add your name and a valid email.'; msg.classList.add('err'); return; }
    if (data.checkin && data.checkout && data.checkout <= data.checkin) { msg.textContent = 'Check-out needs to be after check-in.'; msg.classList.add('err'); return; }
    const btn = $('button[type=submit]', form); btn.disabled = true; msg.textContent = 'Sending…';
    try {
      const r = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'Something went wrong.');
      form.reset(); msg.textContent = 'Thanks! Your request is in. We usually reply within a day.'; msg.classList.add('ok');
    } catch (err) { msg.textContent = `${err.message} You can also book directly on VRBO.`; msg.classList.add('err'); }
    finally { btn.disabled = false; }
  });

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.section h2, .card, .place, .amenity-group, .review').forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }
})();
