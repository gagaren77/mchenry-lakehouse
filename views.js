// Server-side page templates. Every piece of property content comes from site.config.json,
// so the same code can power a site for any rental: edit the config, swap the photos.
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dirUrl = (c, origin) => `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}&destination=${c.location.lat},${c.location.lng}&travelmode=driving`;

const ICON = {
  pool: '<path d="M2 18c2 0 2-1.5 4-1.5S8 18 10 18s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5"/><path d="M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 0-4 0M8 9h8"/>',
  spa: '<path d="M3 13h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M8 9c0-1.5 1-1.5 1-3M12 9c0-1.5 1-1.5 1-3M16 9c0-1.5 1-1.5 1-3"/>',
  dock: '<path d="M3 10h18M6 10v9M18 10v9M12 10v9"/><path d="M2 20c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1 2-1 4-1"/>',
  canoe: '<path d="M2 14c4 3 16 3 20 0"/><path d="M6 6l12 12M17 4l3 3"/>',
  deck: '<path d="M3 20h18M5 20V10h14v10M9 10V6h6v4"/>',
  leaf: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l7-7"/>',
  dining: '<path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 3c-2 2-2 6 0 8v10"/>',
  kitchen: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M8 6h.01M12 6h.01M10 13h4"/>',
  bar: '<path d="M6 3h12l-6 8zM12 11v8M8 21h8"/>',
  office: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  gym: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  bath: '<path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0"/>',
  car: '<path d="M5 16l1.5-5h11L19 16M4 16h16v3H4zM7 19v2M17 19v2"/>',
  dog: '<path d="M10 5L6 3 4 8l3 2M14 5l4-2 2 5-3 2"/><path d="M7 10c0 6 2 10 5 10s5-4 5-10c0-3-2-5-5-5s-5 2-5 5z"/><path d="M10 13h.01M14 13h.01M11 16h2"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 15c3 0 5 2 5 4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21l2-4M16 21l-2-4M9 14h.01M15 14h.01"/>',
  bed: '<path d="M3 18V8M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
};
const icon = (k, cls = 'ico') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k] || ''}</svg>`;
const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 23c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8 18v-6l8-6 8 6v6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';

function credit(img) {
  if (!img || !img.author) return '';
  const u = s => `${s}${s.includes('?') ? '&' : '?'}utm_source=mchenry_lakehouse&utm_medium=referral`;
  return `<span class="credit">Photo: <a href="${esc(u(img.authorUrl))}" target="_blank" rel="noopener">${esc(img.author)}</a> / <a href="${esc(u('https://unsplash.com'))}" target="_blank" rel="noopener">Unsplash</a></span>`;
}

function layout(c, { title, description, path, body, bodyClass = '', head = '', scripts = '', v }) {
  const nav = [['/#stay', 'The house'], ['/photos', 'Photos'], ['/#amenities', 'Amenities'], ['/#availability', 'Availability'], ['/#reviews', 'Reviews'], ['/area', 'The area'], ['/info', 'Rules & FAQ']];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(c.domain + path)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(c.seo.ogImage)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#10262b">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css?v=${v}">
${head}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="nav${bodyClass.includes('home') ? '' : ' solid'}">
  <div class="nav-in">
    <a class="brand" href="/" aria-label="${esc(c.name)} home">${LOGO}<span>${esc(c.name)}</span></a>
    <nav aria-label="Main">
      <button class="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span></span><span></span></button>
      <ul id="menu">
        ${nav.map(([h, t]) => `<li><a href="${h}"${h === path ? ' aria-current="page"' : ''}>${esc(t)}</a></li>`).join('')}
        <li class="nav-cta"><a class="btn btn-sm" href="/#inquire">Request dates</a></li>
      </ul>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="footer">
  <div class="wrap foot-top">
    <div class="foot-brand">
      <a class="brand" href="/">${LOGO}<span>${esc(c.name)}</span></a>
      <p>${esc(c.tagline)} · ${esc(c.location.locality)}, ${esc(c.location.regionName)}</p>
      <a class="btn btn-light btn-sm" href="/#availability">Check availability</a>
    </div>
    <div class="foot-cols">
      <div><h4>Stay</h4><a href="/#stay">The house</a><a href="/photos">All photos</a><a href="/#amenities">Amenities</a><a href="/#reviews">Reviews</a></div>
      <div><h4>Plan</h4><a href="/#availability">Availability</a><a href="/area">The area</a><a href="/area#directions">Directions</a><a href="/info">Rules &amp; FAQ</a></div>
      <div><h4>Book</h4><a href="/#inquire">Request dates</a><a href="${esc(c.booking.vrbo)}" target="_blank" rel="noopener">Book on ${esc(c.booking.label)} ↗</a></div>
    </div>
  </div>
  <div class="wrap foot-base"><span>© ${new Date().getFullYear()} ${esc(c.name)}</span><span>${esc(c.location.area)} · ${esc(c.location.locality)}, ${esc(c.location.region)}</span></div>
</footer>
<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Photo viewer">
  <button class="lb-close" aria-label="Close">×</button>
  <button class="lb-nav lb-prev" aria-label="Previous photo">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button class="lb-nav lb-next" aria-label="Next photo">›</button>
</div>
<script>window.PHOTOS=${JSON.stringify(c.photos).replace(/</g, '\\u003c')};</script>
<script src="/app.js?v=${v}" defer></script>
${scripts}
</body>
</html>`;
}

const sectionHead = (eyebrow, title, extra = '') => `<p class="eyebrow">${esc(eyebrow)}</p><h2>${title}</h2>${extra}`;

function home(c, v) {
  const r = c.rating, P = c.photos;
  const ld = {
    '@context': 'https://schema.org', '@type': 'VacationRental', name: c.name, description: c.seo.description, image: c.seo.ogImage, url: c.domain,
    address: { '@type': 'PostalAddress', addressLocality: c.location.locality, addressRegion: c.location.region, addressCountry: c.location.country },
    geo: { '@type': 'GeoCoordinates', latitude: c.location.lat, longitude: c.location.lng },
    containsPlace: { '@type': 'Accommodation', numberOfBedrooms: c.sleeping.filter(s => /bedroom/i.test(s[0])).length, occupancy: { '@type': 'QuantitativeValue', value: c.booking.maxGuests } },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: r.score, bestRating: r.outOf, reviewCount: r.count },
    petsAllowed: c.booking.pets.length > 1,
  };
  const mosaic = [0, 9, 2, 19, 21].map(i => P[i]).filter(Boolean);
  const body = `
<section class="hero">
  <img class="hero-img" src="${esc(c.hero.image)}" alt="${esc(c.hero.alt)}" fetchpriority="high" onerror="this.onerror=null;this.src='${esc(c.hero.fallback)}'">
  <div class="hero-shade"></div>
  <div class="wrap hero-in">
    <p class="eyebrow light">${esc(c.hero.eyebrow)}</p>
    <h1>${esc(c.hero.title)}<br><em>${esc(c.hero.titleAccent)}</em></h1>
    <p class="lede">${esc(c.hero.lede)}</p>
    <form class="quick-book" id="quick-book" action="/#availability">
      <label><span>Check-in</span><input type="date" name="in" id="q-in"></label>
      <label><span>Check-out</span><input type="date" name="out" id="q-out"></label>
      <label><span>Guests</span><select name="guests" id="q-guests">${Array.from({ length: c.booking.maxGuests }, (_, i) => `<option value="${i + 1}"${i === 5 ? ' selected' : ''}>${i + 1} guest${i ? 's' : ''}</option>`).join('')}</select></label>
      <button class="btn" type="submit">Check availability</button>
    </form>
  </div>
  <ul class="hero-facts wrap" aria-label="Quick facts">${c.facts.map(([n, l]) => `<li><strong>${esc(n)}</strong><span>${esc(l)}</span></li>`).join('')}</ul>
</section>

<section id="stay" class="section">
  <div class="wrap intro">
    <div class="intro-text">
      ${sectionHead(c.intro.eyebrow, esc(c.intro.title))}
      ${c.intro.body.map(p => `<p>${esc(p)}</p>`).join('')}
    </div>
    <aside class="sleep card" aria-labelledby="sleep-h">
      <h3 id="sleep-h">Sleeping arrangements</h3>
      <ul class="sleep-list">${c.sleeping.map(([a, b]) => `<li>${icon('bed')}<div><b>${esc(a)}</b><span>${esc(b)}</span></div></li>`).join('')}</ul>
      <h3>Bathrooms</h3>
      <ul class="bath-list">${c.baths.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    </aside>
  </div>
</section>

<section id="gallery" class="section tight">
  <div class="wrap head-row">
    <div>${sectionHead('Photos', 'Take a look around')}</div>
    <a class="link-arrow" href="/photos">View all ${P.length} photos ${icon('arrow')}</a>
  </div>
  <div class="wrap mosaic">
    ${mosaic.map((p, i) => `<button type="button" class="m m${i}" data-i="${P.indexOf(p)}" aria-label="Open photo: ${esc(p.cap)}"><img src="${esc(p.src)}" alt="${esc(p.cap)}" loading="lazy"><span class="cap">${esc(p.cap)}</span>${i === mosaic.length - 1 ? `<span class="more">+${P.length - mosaic.length} photos</span>` : ''}</button>`).join('')}
  </div>
</section>

<section class="section dark highlights">
  <div class="wrap">
    ${sectionHead('Signature spaces', 'Three reasons groups <em>come back</em>')}
    <div class="hl-grid">
      ${c.highlights.map((h, i) => `<article class="hl"><div class="hl-img"><img src="${esc(h.photo)}" alt="" loading="lazy"></div><span class="hl-n">0${i + 1}</span><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p></article>`).join('')}
    </div>
  </div>
</section>

<section id="amenities" class="section">
  <div class="wrap">
    ${sectionHead('Amenities', 'Everything for a full house')}
    <div class="amenity-grid">
      ${c.amenities.map(g => `<div class="amenity-group"><h3>${esc(g.group)}</h3><ul>${g.items.map(([k, t]) => `<li>${icon(k)}<span>${esc(t)}</span></li>`).join('')}</ul></div>`).join('')}
    </div>
  </div>
</section>

<section class="section tight seasons-sec">
  <div class="wrap">
    ${sectionHead('All year', 'Two seasons, <em>one lake</em>')}
    <div class="seasons">
      ${c.seasons.map(s => `<article class="season"><img src="${esc(s.photo)}" alt="" loading="lazy"><div class="season-txt"><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p></div></article>`).join('')}
    </div>
  </div>
</section>

<section id="availability" class="section band">
  <div class="wrap">
    <div class="head-row">
      <div>${sectionHead('Availability', 'Find your dates', '<p class="muted">Pick a check-in day, then a check-out day. We carry them into your request.</p>')}</div>
      <div class="legend" aria-label="Calendar legend"><span><i class="sw sw-free"></i>Available</span><span><i class="sw sw-booked"></i>Booked</span><span><i class="sw sw-sel"></i>Your stay</span></div>
    </div>
    <div class="cal card">
      <div class="cal-bar">
        <button class="icon-btn" id="cal-prev" aria-label="Previous month">‹</button>
        <div class="cal-status" id="cal-status" aria-live="polite">Loading calendar…</div>
        <button class="icon-btn" id="cal-next" aria-label="Next month">›</button>
      </div>
      <div class="cal-months" id="cal-months"></div>
      <div class="cal-foot">
        <p id="cal-pick" class="cal-pick">Pick a check-in day.</p>
        <div class="cal-actions"><button class="btn btn-quiet" id="cal-clear" type="button">Clear</button><a class="btn" id="cal-go" href="#inquire">Request these dates</a></div>
      </div>
      <p class="tiny muted" id="cal-source"></p>
    </div>
  </div>
</section>

<section id="reviews" class="section">
  <div class="wrap">
    <div class="reviews-top">
      <div>${sectionHead('Reviews', 'What guests <em>remember</em>')}</div>
      <div class="score card" aria-label="Guest rating summary">
        <div class="score-big"><span>${r.score}</span><small>/${r.outOf}</small></div>
        <p class="score-label"><b>${esc(r.label)}</b> · ${r.count} verified ${esc(r.source)} reviews</p>
        <dl class="score-bars">${r.categories.map(([k, val]) => `<div class="sb" title="${esc(k)}: ${val} out of ${r.outOf}"><dt>${esc(k)}</dt><dd class="bar" role="img" aria-label="${esc(k)} ${val} out of ${r.outOf}"><span style="width:${(val / r.outOf) * 100}%"></span></dd><dd class="val">${val.toFixed(1)}</dd></div>`).join('')}</dl>
      </div>
    </div>
    <div class="review-grid" id="review-grid">
      ${c.reviews.map((rv, i) => `<article class="review card${i >= 6 ? ' extra' : ''}"><div class="stars" aria-label="5 out of 5 stars">${icon('star', 'st').repeat(5)}</div><h3>${esc(rv.title)}</h3><p>“${esc(rv.text)}”</p><footer><span class="avatar" aria-hidden="true">${esc(rv.name[0])}</span><span><b>${esc(rv.name)}</b>${esc(rv.when)}</span></footer></article>`).join('')}
    </div>
    ${c.reviews.length > 6 ? `<p class="center"><button class="btn btn-outline" id="reviews-more" type="button">Read ${c.reviews.length - 6} more reviews</button></p>` : ''}
    <p class="tiny muted center">Summarized from verified guest reviews on <a href="${esc(c.booking.vrbo)}" target="_blank" rel="noopener">${esc(c.booking.label)}</a>.</p>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <div class="head-row"><div>${sectionHead('Plan your stay', 'Everything else you need')}</div></div>
    <div class="explore-grid">
      <a class="explore" href="/area"><img src="/photos/winter-lake.jpg" alt="" loading="lazy"><div><b>About the area</b><span>Lakes, parks, the Volo museum, Six Flags and Lake Geneva, with drive times.</span></div></a>
      <a class="explore" href="/area#directions"><img src="/photos/front-summer.jpg" alt="" loading="lazy"><div><b>How to get here</b><span>Map and one-click directions from O'Hare, Chicago, Milwaukee and the Metra.</span></div></a>
      <a class="explore" href="/info"><img src="/photos/front-porch.jpg" alt="" loading="lazy"><div><b>House rules &amp; FAQ</b><span>Check-in times, pets, pool season, safety notes and common questions.</span></div></a>
    </div>
  </div>
</section>

<section id="inquire" class="section inquire">
  <div class="wrap inq">
    <div class="inq-copy">
      ${sectionHead('Request dates', 'Plan your <em>lake getaway</em>')}
      <p>Tell us when you'd like to come and who's coming. We usually answer within a day with a quote and anything else you need to know.</p>
      <ul class="inq-points"><li>A personal answer from the owner, usually within a day</li><li>A clear quote for your exact dates and group</li><li>Celebrations and reunions welcome, just ask first</li></ul>
      <p class="muted">Prefer to book right away?</p>
      <a class="btn btn-light" href="${esc(c.booking.vrbo)}" target="_blank" rel="noopener">Book instantly on ${esc(c.booking.label)} ↗</a>
    </div>
    <form class="card form" id="inquiry-form" novalidate>
      <div class="row"><label>Name<input name="name" required autocomplete="name"></label><label>Email<input name="email" type="email" required autocomplete="email"></label></div>
      <div class="row"><label>Check-in<input name="checkin" type="date" id="f-in"></label><label>Check-out<input name="checkout" type="date" id="f-out"></label></div>
      <div class="row"><label>Guests<select name="guests" id="f-guests"><option value="">Select</option>${Array.from({ length: c.booking.maxGuests }, (_, i) => `<option value="${i + 1}">${i + 1} guest${i ? 's' : ''}</option>`).join('')}</select></label>
        <label>Dogs<select name="pets">${c.booking.pets.map(p => `<option>${esc(p)}</option>`).join('')}</select></label></div>
      <label>Phone (optional)<input name="phone" type="tel" autocomplete="tel"></label>
      <label>Message<textarea name="message" rows="4" placeholder="Celebrating something? Questions about the pool or boats?"></textarea></label>
      <label class="hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
      <button class="btn btn-block" type="submit">Send request</button>
      <p class="form-msg" id="form-msg" role="status"></p>
    </form>
  </div>
</section>`;
  return layout(c, { title: c.seo.title, description: c.seo.description, path: '/', body, bodyClass: 'home', v,
    head: `<script type="application/ld+json">${JSON.stringify(ld)}</script>` });
}

function pageHead(eyebrow, title, intro, bg) {
  return `<header class="page-head${bg ? ' has-bg' : ''}">${bg || ''}<div class="wrap"><p class="eyebrow${bg ? ' light' : ''}"><a href="/">${esc(eyebrow)}</a></p><h1>${title}</h1>${intro ? `<p class="lede">${esc(intro)}</p>` : ''}</div></header>`;
}

function photos(c, v) {
  const groups = [...new Set(c.photos.map(p => p.group))];
  const body = `${pageHead('← Back to the house', 'All photos', `${c.photos.length} photos. Tap any photo to view it full size.`)}
<div class="wrap photos-page">
  <nav class="chips" aria-label="Photo groups">${groups.map(g => `<a href="#${g.toLowerCase().replace(/[^a-z]+/g, '-')}">${esc(g)}</a>`).join('')}</nav>
  ${groups.map(g => `<section class="photo-group" id="${g.toLowerCase().replace(/[^a-z]+/g, '-')}"><h2>${esc(g)}</h2><div class="photo-grid">${c.photos.map((p, i) => p.group !== g ? '' : `<button type="button" data-i="${i}" aria-label="Open photo: ${esc(p.cap)}"><img src="${esc(p.src)}" alt="${esc(p.cap)}" loading="lazy"><span class="cap">${esc(p.cap)}</span></button>`).join('')}</div></section>`).join('')}
</div>`;
  return layout(c, { title: `Photos · ${c.name}`, description: `All ${c.photos.length} photos of ${c.name}: pool, private lake, gazebo, bar level, bedrooms and winter views.`, path: '/photos', body, v });
}

function area(c, v) {
  const imgs = (c.unsplash && c.unsplash.images) || {};
  const banner = imgs.banner;
  const bg = banner && banner.url ? `<img class="ph-bg" src="${esc(banner.url)}" alt="" fetchpriority="high"><div class="ph-shade"></div>${credit(banner)}` : '';
  const body = `${pageHead('← Back to the house', 'The area and <em>getting here</em>', `Lakes, parks, classic cars and coasters nearby, plus directions from wherever you're starting.`, bg)}
<section id="area" class="section">
  <div class="wrap">
    ${sectionHead('About the area', `Life on the ${esc(c.location.area)}`)}
    <p class="intro-p">${esc(c.area.intro)}</p>
    <div class="area-grid">
      ${c.area.places.map(p => { const im = imgs[p.img]; return `<article class="place${im && im.url ? ' has-img' : ''}">${im && im.url ? `<div class="place-img"><img src="${esc(im.url)}" alt="${esc(im.alt || p.name)}" loading="lazy">${credit(im)}</div>` : ''}<div class="place-body"><span class="dist">${icon('pin')}${esc(p.dist)}</span><h3>${esc(p.name)}</h3><p>${esc(p.text)}</p></div></article>`; }).join('')}
    </div>
  </div>
</section>
<section id="directions" class="section band">
  <div class="wrap">
    ${sectionHead('How to get there', 'Getting to the lake')}
    <div class="dir">
      <div class="map card"><iframe title="Map of the ${esc(c.name)} area" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${c.location.lat},${c.location.lng}&z=13&output=embed"></iframe></div>
      <div>
        <ul class="routes">${c.area.routes.map(rt => `<li><b>${esc(rt.from)}</b><span>${esc(rt.text)}</span><a href="${esc(dirUrl(c, rt.origin))}" target="_blank" rel="noopener">${esc(rt.link || 'Directions')} ↗</a></li>`).join('')}</ul>
        <a class="btn" href="${esc(dirUrl(c))}" target="_blank" rel="noopener">Directions from my location</a>
        <p class="tiny muted">The map shows the neighborhood. The exact street address and arrival instructions are sent after booking.</p>
      </div>
    </div>
  </div>
</section>`;
  return layout(c, { title: `Area & directions · ${c.name}`, description: `About ${c.location.locality} and the ${c.location.area}, nearby attractions with drive times, and directions from Chicago, O'Hare and Milwaukee.`, path: '/area', body, v });
}

function info(c, v) {
  const body = `${pageHead('← Back to the house', 'House rules <em>&amp; FAQ</em>', 'The practical details, so there are no surprises when you arrive.')}
<section id="rules" class="section">
  <div class="wrap two-col">
    <div>${sectionHead('House rules', 'Good to know before you arrive')}<ul class="rules">${c.rules.map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join('')}</ul></div>
    <div>${sectionHead('Important information', 'Safety and the water')}<ul class="info-list">${c.safety.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div>
  </div>
</section>
<section id="faq" class="section band">
  <div class="wrap narrow">
    ${sectionHead('FAQ', 'Questions guests ask')}
    <div class="faq">${c.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    <p class="center"><a class="btn" href="/#inquire">Ask us anything</a></p>
  </div>
</section>`;
  return layout(c, { title: `House rules & FAQ · ${c.name}`, description: `House rules, check-in and check-out times, pet policy, safety information and answers to common questions about ${c.name}.`, path: '/info', body, v });
}

function notFound(c, v) {
  const body = `${pageHead('← Back to the house', 'Page not found', 'That page drifted off. Try the home page or the photos.')}<div class="wrap section tight"><a class="btn" href="/">Go to the home page</a></div>`;
  return layout(c, { title: `Not found · ${c.name}`, description: c.seo.description, path: '/404', body, v });
}

function sitemap(c) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/photos', '/area', '/info'].map(p => `<url><loc>${esc(c.domain + p)}</loc></url>`).join('')}</urlset>`;
}

module.exports = { home, photos, area, info, notFound, sitemap };
