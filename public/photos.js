// Shared photo list and lightbox used by index.html and photos.html
window.PHOTOS = [
  { src: '/photos/pool-lake-view.jpg', cap: 'Pool with the lake beyond', group: 'Outdoors & the lake' },
  { src: '/photos/pool-house.jpg', cap: 'Heated pool and the back of the house', group: 'Outdoors & the lake' },
  { src: '/photos/gazebo-summer.jpg', cap: 'Lakeside gazebo and the path up to the house', group: 'Outdoors & the lake' },
  { src: '/photos/front-summer.jpg', cap: 'The cabin in summer', group: 'Outdoors & the lake' },
  { src: '/photos/pool-night.jpg', cap: 'The pool lit up at night', group: 'Outdoors & the lake' },
  { src: '/photos/patio-lake-night.jpg', cap: 'Patio over the lake at night', group: 'Outdoors & the lake' },
  { src: '/photos/hot-tub-patio.jpg', cap: 'Hot tub on the lower patio', group: 'Outdoors & the lake' },
  { src: '/photos/hot-tub.jpg', cap: 'Hot tub', group: 'Outdoors & the lake' },
  { src: '/photos/front-porch.jpg', cap: 'Front porch', group: 'Outdoors & the lake' },
  { src: '/photos/great-room.jpg', cap: 'Great room with stone fireplace and loft', group: 'Living spaces' },
  { src: '/photos/kitchen-island.jpg', cap: 'Kitchen island with seating', group: 'Living spaces' },
  { src: '/photos/kitchen.jpg', cap: 'Kitchen with double ovens', group: 'Living spaces' },
  { src: '/photos/dining-room.jpg', cap: 'Dining room', group: 'Living spaces' },
  { src: '/photos/loft.jpg', cap: 'Loft lounge with fitness corner', group: 'Living spaces' },
  { src: '/photos/kitchenette.jpg', cap: 'Retro diner kitchenette', group: 'Living spaces' },
  { src: '/photos/office.jpg', cap: 'Home office', group: 'Living spaces' },
  { src: '/photos/bar.jpg', cap: 'Downstairs bar and game table', group: 'Bar & game level' },
  { src: '/photos/family-room.jpg', cap: 'Lower-level family room with fireplace', group: 'Bar & game level' },
  { src: '/photos/game-table.jpg', cap: 'Game table and bar', group: 'Bar & game level' },
  { src: '/photos/bar-lounge.jpg', cap: 'Bar lounge with sofa and arcade', group: 'Bar & game level' },
  { src: '/photos/pub-table.jpg', cap: 'Pub table by the bar', group: 'Bar & game level' },
  { src: '/photos/king-bedroom.jpg', cap: 'King bedroom with vaulted ceiling', group: 'Bedrooms & baths' },
  { src: '/photos/bear-bedroom.jpg', cap: 'Bear-themed king bedroom', group: 'Bedrooms & baths' },
  { src: '/photos/bedroom-tv.jpg', cap: 'King bedroom with en-suite bath', group: 'Bedrooms & baths' },
  { src: '/photos/queen-bedroom.jpg', cap: 'Bedroom with two queen beds', group: 'Bedrooms & baths' },
  { src: '/photos/jetted-bath.jpg', cap: 'Bath with jetted tub and walk-in shower', group: 'Bedrooms & baths' },
  { src: '/photos/bath-vanity.jpg', cap: 'Bathroom with walk-in shower', group: 'Bedrooms & baths' },
  { src: '/photos/half-bath.jpg', cap: 'Half bath', group: 'Bedrooms & baths' },
  { src: '/photos/deck-sunset.jpg', cap: 'Winter sunset from the deck', group: 'Winter at the lake' },
  { src: '/photos/deck-winter-lake.jpg', cap: 'Lake view from the deck in winter', group: 'Winter at the lake' },
  { src: '/photos/winter-gazebo.jpg', cap: 'Lakeside gazebo on a winter night', group: 'Winter at the lake' },
  { src: '/photos/winter-gazebo-dock.jpg', cap: 'Gazebo and dock in winter', group: 'Winter at the lake' },
  { src: '/photos/winter-lake.jpg', cap: 'The private lake in winter', group: 'Winter at the lake' },
  { src: '/photos/winter-back.jpg', cap: 'Back of the cabin after a snowfall', group: 'Winter at the lake' },
  { src: '/photos/winter-hill.jpg', cap: 'The cabin on the hill in winter', group: 'Winter at the lake' },
  { src: '/photos/winter-house.jpg', cap: 'The cabin glowing on a snowy evening', group: 'Winter at the lake' },
  { src: '/photos/winter-front.jpg', cap: 'Front of the cabin on a winter night', group: 'Winter at the lake' },
  { src: '/photos/winter-yard.jpg', cap: 'The house across the snowy yard', group: 'Winter at the lake' },
  { src: '/photos/winter-firepit.jpg', cap: 'Fire pit and the house on a snowy night', group: 'Winter at the lake' },
  { src: '/photos/winter-deck.jpg', cap: 'The deck on a winter evening', group: 'Winter at the lake' },
  { src: '/photos/winter-steps.jpg', cap: 'Lit steps down to the lake in winter', group: 'Winter at the lake' },
];
window.initLightbox = function (PHOTOS) {
  const $ = (s, el = document) => el.querySelector(s);
  const lb = $('#lightbox'), lbImg = $('img', lb), lbCap = $('figcaption', lb);
  let idx = 0, lastFocus = null;
  function show(i) { idx = (i + PHOTOS.length) % PHOTOS.length; lbImg.src = PHOTOS[idx].src; lbImg.alt = PHOTOS[idx].cap; lbCap.textContent = `${PHOTOS[idx].cap} · ${idx + 1} of ${PHOTOS.length}`; }
  function open(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); }
  function close() { lb.hidden = true; document.body.style.overflow = ''; lastFocus && lastFocus.focus(); }
  $('.lb-close', lb).onclick = close; $('.lb-prev', lb).onclick = () => show(idx - 1); $('.lb-next', lb).onclick = () => show(idx + 1);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
  });
  let tx = null; lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); tx = null; });
  return open;
};
