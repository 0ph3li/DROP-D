/* =========================================================
   DROP D — profile.js
   join the zine · your member card · your plays
   (a concept: no password, no account, nothing leaves the browser)
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$ } = DD;
  const T = DD.data.tracks, P = DD.player, D = DD.data;
  const motion = DD.motion;
  const body = document.body;
  const A = D.artists || [];

  /* ---------- faces + records to choose from ---------- */
  const facePhoto = (slug) => { const a = A.find((x) => x.slug === slug); return a ? a.photo : ''; };
  const FACES = A.filter((a) => a.photo).slice(0, 11);
  const RECS = [];
  T.forEach((t, i) => {
    const name = t.album === 'single' ? `${t.title} (single)` : t.album, slug = DD.slug(`${t.artist}-${name}`);
    if (!RECS.find((r) => r.slug === slug)) RECS.push({ slug, name, artist: t.artist, i });
  });
  RECS.sort((a, b) => a.artist.localeCompare(b.artist));

  $('#jFaces').innerHTML = FACES.map((a) => `<button type="button" class="fc" data-face="${a.slug}" aria-label="${a.name}" data-cursor="${a.name}"><span class="slot slot--mini" data-img="img/ARTISTS/${a.slug}.jpg"></span></button>`).join('') + '<button type="button" class="fc fc--pink" data-face="pink" aria-label="no face, just pink" data-cursor="no face">?</button>';
  // img/ARTISTS overrides first, then the photo we already have
  $$('#jFaces .slot').forEach((s) => { const im = new Image(); const slug = s.closest('.fc').dataset.face; im.onerror = () => DD.setSlot(s, facePhoto(slug)); im.onload = () => DD.setSlot(s, im.src); im.src = `img/ARTISTS/${slug}.jpg`; });
  $('#jRec').innerHTML = RECS.map((r) => `<option value="${r.slug}">${r.artist} — ${r.name}</option>`).join('');
  let face = 'pink';
  $('#jFaces').addEventListener('click', (e) => { const b = e.target.closest('.fc'); if (!b) return; face = b.dataset.face; $$('.fc').forEach((x) => x.classList.toggle('is-on', x === b)); });

  /* ---------- the profile (localStorage, nowhere else) ---------- */
  let me = DD.store.json('profile', null);
  const hash = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9973; return h; };
  $('#joinForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#jName').value.trim(); if (!name) return;
    const since = me?.since || new Date().toISOString().slice(0, 10);
    me = { name, face, rec: $('#jRec').value, since, no: me?.no || hash(name + since) };
    DD.store.set('profile', JSON.stringify(me));
    render(true);
    DD.toast(`welcome to the zine, ${name}. your card is printed.`);
    window.dispatchEvent(new Event('dd:profile'));
  });

  /* =========================================================
     STATS — everything you played, on every page
     ========================================================= */
  const merged = T;
  const LISTS = { home: D.home, about: D.home, issue02: D.issue02, mixtape: merged, artist: merged, tuning: merged, room: merged, profile: merged };
  const plays = () => {
    const m = new Map();
    Object.entries(LISTS).forEach(([page, list]) => {
      const p = DD.store.json(page + '-plays', {});
      Object.entries(p).forEach(([i, n]) => {
        const t = list && list[+i]; if (!t) return;
        const k = `${t.artist}|${t.title}`, cur = m.get(k) || { t, n: 0 };
        cur.n += n; m.set(k, cur);
      });
    });
    return [...m.values()].sort((a, b) => b.n - a.n);
  };

  const render = (fresh) => {
    if (!me) { body.classList.remove('is-member'); return; }
    body.classList.add('is-member');
    const tun = DD.store.json('tuning', null);
    const TUN = { e: 'standard e', d: 'drop d', c: 'drop c', b: 'drop b', a: 'drop a' };
    const rec = RECS.find((r) => r.slug === me.rec);
    $('#cName').textContent = me.name; $('#hiName').textContent = me.name.toLowerCase();
    $('#cNo').textContent = DD.pad(me.no, 4);
    $('#cSince').textContent = me.since.split('-').reverse().join('.');
    $('#cTune').innerHTML = tun ? TUN[tun.key] : '<a href="tuning.html" class="to-artist">not yet →</a>';
    $('#cRec').textContent = rec ? `${rec.name}` : '—';
    const cf = $('#cFace');
    cf.classList.toggle('is-pink', me.face === 'pink');
    if (me.face === 'pink') { cf.dataset.n = me.name[0].toUpperCase(); DD.setSlot(cf, ''); $(':scope > img', cf)?.remove(); cf.classList.remove('has-img'); }
    else { const im = new Image(); im.onload = () => DD.setSlot(cf, im.src); im.onerror = () => DD.setSlot(cf, facePhoto(me.face)); im.src = `img/ARTISTS/${me.face}.jpg`; }
    // a barcode that is only yours
    const r = DD.seeded(me.no * 13 + 7);
    $('#cBar').style.background = `linear-gradient(90deg, ${Array.from({ length: 34 }, (_, k) => { const c = r() > .45 ? '#0b0b0b' : 'transparent'; return `${c} ${(k / 34 * 100).toFixed(2)}% ${((k + 1) / 34 * 100).toFixed(2)}%`; }).join(',')})`;

    // numbers
    const list = plays(), total = list.reduce((s, x) => s + x.n, 0), mins = Math.round(list.reduce((s, x) => s + x.n * DD.secs(x.t.time), 0) / 60);
    const tape = DD.store.json('tape', { ids: [] }).ids || [], set = DD.store.json('issue02-played', []);
    $('#stats').innerHTML = [[total, 'records put on'], [list.length, 'different songs'], [mins, 'minutes (about)'], [`${tape.length}/10`, 'songs on your tape']]
      .map(([n, l]) => `<div class="st"><b>${n}</b><span>${l}</span></div>`).join('');

    // on repeat
    const findI = (t) => T.findIndex((x) => x.title === t.title && x.artist === t.artist);
    $('#topSongs').innerHTML = list.length ? list.slice(0, 5).map((x, k) => `<li data-play="${findI(x.t)}" data-cursor="play"><span class="n">${DD.pad(k + 1)}</span><span class="slot slot--mini" data-img="${x.t.cover}"></span><span><b>${x.t.title}</b><small>${x.t.artist}</small></span><span class="pix">${x.n}×</span></li>`).join('')
      : '<li class="me__empty">nothing yet. go put a record on: <a href="index.html" class="to-artist">issue 01</a></li>';
    DD.slots($('#topSongs'));

    // your ghosts
    const byArtist = new Map(); list.forEach((x) => byArtist.set(x.t.artist, (byArtist.get(x.t.artist) || 0) + x.n));
    const ghosts = [...byArtist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    $('#topArtists').innerHTML = ghosts.length ? ghosts.map(([name, n]) => { const a = A.find((x) => x.name === name); return `<a href="${DD.artistUrl(name)}"><span class="slot" data-img="${a ? a.photo : ''}"></span>${name}<span class="pix">${n}</span></a>`; }).join('') : '<p class="me__empty">your ghosts show up once you start listening.</p>';
    DD.slots($('#topArtists'));

    // shortcuts
    const roomLast = DD.store.get('room-last');
    $('#meLinks').innerHTML = `
      <a class="ml" href="mixtape.html#tape"><span class="pix">your tape</span><b>${tape.length ? `${tape.length} songs` : 'blank'}</b><small>${tape.length ? 'play it →' : 'make one →'}</small></a>
      <a class="ml" href="tuning.html${tun ? '#t=' + tun.key : ''}"><span class="pix">your tuning</span><b>${tun ? TUN[tun.key] : 'unknown'}</b><small>${tun ? 'see it again →' : 'take the quiz →'}</small></a>
      <a class="ml" href="room.html${roomLast ? '?r=' + roomLast : (rec ? '?r=' + rec.slug : '')}"><span class="pix">the listening room</span><b>${rec ? rec.name : 'lights off'}</b><small>${set.length ? `setlist: ${set.length}/9 crossed out` : 'put it on →'}</small></a>`;

    if (fresh && motion) {
      gsap.fromTo('#card', { y: -500, rotate: -25 }, { y: 0, rotate: 0, duration: 1.6, ease: 'elastic.out(1, .45)' });
      gsap.from('.me__copy > *', { y: 30, opacity: 0, duration: .9, stagger: .07, ease: 'expo.out', delay: .3 });
    }
  };

  /* ---------- the card: swing it, the hologram follows you ---------- */
  const card = $('#card');
  const sw = { a: 0 };
  let drag = false, sx = 0;
  card.addEventListener('pointerdown', (e) => { drag = true; sx = e.clientX; card.setPointerCapture(e.pointerId); gsap.killTweensOf(sw); });
  card.addEventListener('pointermove', (e) => {
    const b = card.getBoundingClientRect();
    card.style.setProperty('--hx', ((e.clientX - b.left) / b.width * 100).toFixed(0) + '%');
    card.style.setProperty('--hy', ((e.clientY - b.top) / b.height * 100).toFixed(0) + '%');
    if (drag) { sw.a = Math.max(-35, Math.min(35, (e.clientX - sx) * .2)); card.style.rotate = sw.a + 'deg'; }
  });
  const let_go = () => { if (!drag) return; drag = false; gsap.to(sw, { a: 0, duration: 2.4, ease: 'elastic.out(1.2, .18)', onUpdate: () => (card.style.rotate = sw.a.toFixed(2) + 'deg') }); };
  card.addEventListener('pointerup', let_go); card.addEventListener('pointercancel', let_go);
  // it never hangs perfectly still
  if (motion) gsap.to(card, { rotateY: 6, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  /* ---------- edit · sign out · forget ---------- */
  $('#edit').addEventListener('click', () => {
    $('#jName').value = me.name; $('#jRec').value = me.rec; face = me.face;
    $$('.fc').forEach((x) => x.classList.toggle('is-on', x.dataset.face === face));
    body.classList.remove('is-member'); DD.scrollTo(0);
  });
  $('#signout').addEventListener('click', () => {
    DD.store.set('profile', ''); localStorage.removeItem('dd-profile'); me = null;
    render(); window.dispatchEvent(new Event('dd:profile'));
    DD.toast('signed out. your plays stay, the card goes in a drawer.');
  });
  $('#forget').addEventListener('click', () => {
    if (!confirm('forget everything? your card, your plays, your tape, your tuning. this can\'t be undone.')) return;
    Object.keys(localStorage).filter((k) => k.startsWith('dd-')).forEach((k) => localStorage.removeItem(k));
    me = null; render(); window.dispatchEvent(new Event('dd:profile'));
    DD.toast('forgotten. you were never here.');
  });

  render(false);
  DD.mag();

  /* ---------- loader ---------- */
  const loader = $('#loader');
  const done = () => { body.classList.remove('is-loading'); window.dispatchEvent(new Event('dd:ready')); };
  if (!loader) done();
  else if (!motion) { loader.remove(); done(); }
  else {
    const o = { p: 0 }, pct = $('#ldPct');
    gsap.from('.ld-pass', { yPercent: 60, opacity: 0, duration: 1, ease: 'expo.out' });
    gsap.to(o, { p: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') });
    Promise.all([document.fonts ? document.fonts.ready : 0, new Promise((r) => setTimeout(r, 1400))]).then(() => {
      gsap.timeline({ onComplete: () => loader.remove() })
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' })
        .add(() => { done(); if (me) render(true); else gsap.from('.join__form', { y: 60, rotate: 3, opacity: 0, duration: 1.2, ease: 'expo.out' }); }, '-=.5')
        .from('.hdr > *', { y: -20, opacity: 0, duration: 1, stagger: .06, ease: 'expo.out' }, '<')
        .from('.bar', { y: 120, opacity: 0, duration: 1.2, ease: 'expo.out' }, '<');
    });
  }
})();
