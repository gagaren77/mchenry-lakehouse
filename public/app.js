(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const PHOTOS = window.PHOTOS || [];

  /* ---------- Nav ---------- */
  const nav = $('.nav'), menu = $('#menu'), menuBtn = $('.menu-btn');
  const isHome = document.body.classList.contains('home');
  const onScroll = () => nav.classList.toggle('solid', !isHome || window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const setMenu = o => { menu.classList.toggle('open', o); nav.classList.toggle('menu-open', o); menuBtn.setAttribute('aria-expanded', o); };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) setMenu(false); });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  if (lb && PHOTOS.length) {
    const lbImg = $('img', lb), lbCap = $('figcaption', lb);
    let idx = 0, lastFocus = null;
    const show = i => { idx = (i + PHOTOS.length) % PHOTOS.length; lbImg.src = PHOTOS[idx].src; lbImg.alt = PHOTOS[idx].cap; lbCap.textContent = `${PHOTOS[idx].cap} · ${idx + 1} of ${PHOTOS.length}`; };
    const open = i => { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
    const close = () => { lb.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); };
    $('.lb-close', lb).onclick = close; $('.lb-prev', lb).onclick = () => show(idx - 1); $('.lb-next', lb).onclick = () => show(idx + 1);
    lb.addEventListener('click', e => { if (e.target === lb || e.target.tagName === 'FIGURE') close(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
    let tx = null; lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); tx = null; });
    document.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) open(+b.dataset.i); });
  }

  /* ---------- Reviews ---------- */
  const moreBtn = $('#reviews-more');
  if (moreBtn) moreBtn.addEventListener('click', () => { $$('.review.extra').forEach(r => r.classList.add('show')); moreBtn.parentElement.remove(); });

  /* ---------- Calendar ---------- */
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayIso = iso(today);
  const calWrap = $('#cal-months');
  if (calWrap) {
    const bookedNights = new Set();
    let monthOffset = 0, selIn = null, selOut = null;
    const MAX_MONTHS_AHEAD = 18;
    const isBooked = s => bookedNights.has(s);
    const rangeFree = (a, b) => { for (let d = parse(a); iso(d) < b; d = addDays(d, 1)) if (isBooked(iso(d))) return false; return true; };

    const renderCal = () => {
      calWrap.innerHTML = '';
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
            if (!isBooked(prev) || canCheckout) { cls.push('booked', 'co'); label += ', check-out only'; }
            else { cls.push('booked'); label += ', booked'; }
            if (!canCheckout) disabled = true;
          } else label += ', available';
          if (s === todayIso) cls.push('today');
          if (selIn && s === selIn) cls.push('sel', 'sel-in');
          if (selOut && s === selOut) cls.push('sel', 'sel-out');
          if (selIn && selOut && s > selIn && s < selOut) cls.push('in-range');
          html += `<button type="button" class="${cls.join(' ')}" data-d="${s}" ${disabled ? 'disabled' : ''} aria-label="${label}">${d}</button>`;
        }
        sec.innerHTML = html + '</div>';
        calWrap.appendChild(sec);
      }
      $('#cal-prev').disabled = monthOffset <= 0;
      $('#cal-next').disabled = monthOffset >= MAX_MONTHS_AHEAD;
      updatePick();
    };
    const fmt = s => parse(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    function updatePick() {
      const go = $('#cal-go');
      if (selIn && selOut) {
        const n = Math.round((parse(selOut) - parse(selIn)) / 864e5);
        $('#cal-pick').innerHTML = `<b>${fmt(selIn)} → ${fmt(selOut)}</b> · ${n} night${n > 1 ? 's' : ''}`;
        go.removeAttribute('aria-disabled');
      } else {
        $('#cal-pick').textContent = selIn ? `Check-in ${fmt(selIn)}. Now pick your check-out day.` : 'Pick a check-in day.';
        go.setAttribute('aria-disabled', 'true');
      }
    }
    const syncForm = () => { if (selIn && selOut) { $('#f-in').value = selIn; $('#f-out').value = selOut; } };
    calWrap.addEventListener('click', e => {
      const b = e.target.closest('button.day'); if (!b || b.disabled) return;
      const s = b.dataset.d;
      if (!selIn || selOut || s <= selIn) { if (isBooked(s)) return; selIn = s; selOut = null; }
      else if (rangeFree(selIn, s)) selOut = s;
      else { if (isBooked(s)) return; selIn = s; selOut = null; }
      renderCal(); syncForm();
      const again = $(`button.day[data-d="${s}"]`); again && again.focus();
    });
    $('#cal-prev').onclick = () => { if (monthOffset > 0) { monthOffset--; renderCal(); } };
    $('#cal-next').onclick = () => { if (monthOffset < MAX_MONTHS_AHEAD) { monthOffset++; renderCal(); } };
    $('#cal-clear').onclick = () => { selIn = selOut = null; renderCal(); };
    $('#cal-go').addEventListener('click', syncForm);

    // Hero quick-book: carry dates and guests into the calendar and form.
    const qb = $('#quick-book');
    if (qb) {
      qb.elements.in.min = qb.elements.out.min = todayIso;
      qb.elements.in.addEventListener('change', () => { const v = qb.elements.in.value; if (v) { qb.elements.out.min = iso(addDays(parse(v), 1)); if (qb.elements.out.value && qb.elements.out.value <= v) qb.elements.out.value = ''; } });
      qb.addEventListener('submit', e => {
        e.preventDefault();
        const a = qb.elements.in.value, b = qb.elements.out.value;
        if (a && a >= todayIso) {
          selIn = a; selOut = b && b > a && rangeFree(a, b) ? b : null;
          const d = parse(a); monthOffset = Math.max(0, Math.min(MAX_MONTHS_AHEAD, (d.getFullYear() - today.getFullYear()) * 12 + d.getMonth() - today.getMonth()));
          renderCal(); syncForm();
        }
        $('#f-guests').value = qb.elements.guests.value;
        $('#availability').scrollIntoView({ behavior: 'smooth' });
        if (a && b && !selOut) $('#cal-pick').textContent = 'Some of those nights are booked. Pick another check-out day.';
      });
    }

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
  }

  /* ---------- Inquiry form ---------- */
  const form = $('#inquiry-form');
  if (form) {
    const msg = $('#form-msg');
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
  }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px' });
    $$('.section h2, .hl, .amenity-group, .review, .season, .place, .explore, .m, .photo-group').forEach(el => { el.classList.add('reveal'); io.observe(el); });
  }
})();
