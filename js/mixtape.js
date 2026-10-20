/* =========================================================
   DROP D — mixtape.js
   issue 03 is yours: make a mixtape
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$ } = DD;
  const T = DD.data.tracks, P = DD.player;
  const motion = DD.motion;
  const MAX = 10, SIDE = 5, C90 = 90 * 60;
  const n2 = (i) => DD.pad(i + 1);

  /* ---------- the tape: from the link, or from last time ---------- */
  const S = { ids: [], name: '', by: '', theme: 'pink', flipped: false };
  const fromHash = () => {
    const h = new URLSearchParams(location.hash.slice(1));
    if (!h.get('t')) return false;
    S.ids = h.get('t').split('.').map(Number).filter((i) => T[i]).slice(0, MAX);
    S.name = h.get('n') || ''; S.by = h.get('b') || ''; S.theme = h.get('c') || 'pink';
    return true;
  };
  if (!fromHash()) Object.assign(S, DD.store.json('tape', {}), { flipped: false });
  S.ids = (S.ids || []).filter((i) => T[i]);
  const save = () => DD.store.set('tape', JSON.stringify({ ids: S.ids, name: S.name, by: S.by, theme: S.theme }));
  const secsOf = (ids) => ids.reduce((a, i) => a + DD.secs(T[i].time), 0);

  /* =========================================================
     PICK — twenty cards
     ========================================================= */
  const grid = $('#pickGrid');
  grid.innerHTML = T.map((t, i) => `
    <li class="mc" data-i="${i}" data-issue="${t.issue}" data-genre="${t.genre}" data-artist="${t.artist.toLowerCase()}" data-cursor="add to tape" data-reveal>
      <div class="mc__art">
        <span class="slot" data-img="${t.cover}" data-n="${n2(i)}"></span>
        <p class="mc__tags"><span>issue ${t.issue}</span><span>${t.genre}</span></p>
        <b class="mc__n"></b>
        <button class="mc__add" aria-label="add ${t.title} to the tape">+</button>
      </div>
      <p class="mc__t">${t.title.replace(/ \(.*\)/, '')}</p>
      <p class="mc__a"><a href="${DD.artistUrl(t.artist)}" class="to-artist">${t.artist}</a><span class="pix">${t.time}</span></p>
    </li>`).join('');
  DD.slots(grid);

  const toggle = (i) => {
    const k = S.ids.indexOf(i);
    if (k > -1) S.ids.splice(k, 1);
    else if (S.ids.length >= MAX) { DD.toast('a tape only has two sides. take one off first.'); return; }
    else S.ids.push(i);
    save(); paint();
    const card = $(`.mc[data-i="${i}"] .mc__art`);
    if (motion && card) gsap.fromTo(card, { scale: .94 }, { scale: 1, duration: .6, ease: 'back.out(3)' });
    if (S.ids.length === MAX) DD.toast('ten songs. that\'s a full c90 of feelings. name it below ↓');
  };
  grid.addEventListener('click', (e) => { if (e.target.closest('a[href]')) return; const c = e.target.closest('.mc'); if (c) toggle(+c.dataset.i); });

  $$('#pickFilter .cat').forEach((b) => b.addEventListener('click', () => {
    $$('#pickFilter .cat').forEach((x) => x.classList.toggle('is-on', x === b));
    const f = b.dataset.f;
    const cards = $$('.mc', grid);
    cards.forEach((c) => (c.hidden = !(f === 'all' || c.dataset.issue === f || c.dataset.genre === f || c.dataset.artist === f)));
    if (motion) gsap.fromTo(cards.filter((c) => !c.hidden), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .03, ease: 'expo.out' });
    if (DD.hasGsap) ScrollTrigger.refresh();
  }));

  /* =========================================================
     YOUR TAPE + J-CARD
     ========================================================= */
  const nameIn = $('#tapeName'), byIn = $('#tapeBy');
  nameIn.value = S.name; byIn.value = S.by;
  nameIn.addEventListener('input', () => { S.name = nameIn.value; save(); paintNames(); });
  byIn.addEventListener('input', () => { S.by = byIn.value; save(); paintNames(); });
  const title = () => S.name.trim() || 'untitled tape';

  const paintNames = () => {
    $('#bigTitle').textContent = title();
    $('#jTitle').textContent = title();
    $('#jBy').textContent = S.by.trim() || 'you';
    $('#jSpine').textContent = `${title()} — DROP/D`;
    $('.cassette--hero .cassette__title').textContent = S.name.trim() || 'issue 03';
  };

  const row = (i, k) => `
    <li data-i="${i}">
      <span class="tl__n">${k + 1}</span>
      <span class="tl__t"><b data-go="${k}">${T[i].title}</b><small>${T[i].artist} · ${T[i].time}</small></span>
      <span class="tl__x"><button data-up="${k}" aria-label="move up">↑</button><button data-down="${k}" aria-label="move down">↓</button><button data-rm="${k}" aria-label="remove">✕</button></span>
    </li>`;
  const paint = () => {
    const a = S.ids.slice(0, SIDE), b = S.ids.slice(SIDE);
    $('#sideA').innerHTML = a.map((i, k) => row(i, k)).join('');
    $('#sideB').innerHTML = b.map((i, k) => row(i, k + SIDE)).join('');
    $('#tape').classList.toggle('has-songs', S.ids.length > 0);
    // cards
    $$('.mc', grid).forEach((c) => {
      const k = S.ids.indexOf(+c.dataset.i);
      c.classList.toggle('is-on', k > -1);
      $('.mc__n', c).textContent = k > -1 ? (k < SIDE ? 'A' : 'B') + ((k % SIDE) + 1) : '';
      $('.mc__add', c).textContent = k > -1 ? '✓' : '+';
    });
    $('#pickCount').textContent = S.ids.length;
    // times
    const tot = secsOf(S.ids);
    $('#tapeTime').textContent = DD.fmt(tot);
    $('#tapeLeft').textContent = DD.fmt(Math.max(0, C90 - tot));
    // j-card
    const li = (i) => `<li>${T[i].title.replace(/ \(.*\)/, '')} <span>${T[i].artist.toLowerCase()}</span></li>`;
    $('#jA').innerHTML = a.map(li).join('') || '<li>…</li>';
    $('#jB').innerHTML = b.map(li).join('') || '<li>…</li>';
    $('#jFoot').textContent = `${DD.fmt(tot)} · ${S.ids.length} songs · tuned to d`;
    const first = S.ids[0];
    DD.setSlot($('#jArt'), first != null ? T[first].cover : '', '');
    $('#tapeBg').style.backgroundImage = first != null ? `url("${T[first].cover}")` : 'none';
    // label colour follows the j-card
    const col = { pink: 'var(--pink)', paper: '#f2f0eb', ink: '#f2f0eb', mood: 'var(--mood)', 'type-o': '#2fd36b' }[S.theme] || 'var(--pink)';
    $$('.cassette').forEach((c) => c.style.setProperty('--tape-label', col));
    paintNames(); markNow();
  };

  // list buttons
  $('#tape').addEventListener('click', (e) => {
    const t = e.target;
    const go = t.closest('[data-go]'), up = t.closest('[data-up]'), down = t.closest('[data-down]'), rm = t.closest('[data-rm]');
    if (go) { started = true; P.play(S.ids[+go.dataset.go], S.ids); return; }
    const k = +(up?.dataset.up ?? down?.dataset.down ?? rm?.dataset.rm ?? -1);
    if (k < 0) return;
    if (up && k > 0) [S.ids[k - 1], S.ids[k]] = [S.ids[k], S.ids[k - 1]];
    if (down && k < S.ids.length - 1) [S.ids[k + 1], S.ids[k]] = [S.ids[k], S.ids[k + 1]];
    if (rm) S.ids.splice(k, 1);
    save(); paint(); started = false;
  });

  // play / shuffle / flip / erase
  let started = false;
  const playTape = () => {
    if (!S.ids.length) { DD.toast('the tape is blank. pick some songs first ↑'); DD.scrollTo('#pick'); return; }
    const onTape = started && S.ids.includes(P.index());
    if (onTape && P.isPlaying()) { P.pause(); return; }
    if (onTape) { P.toggle(); return; }
    started = true;
    P.play(S.ids[S.flipped ? Math.min(SIDE, S.ids.length - 1) : 0], S.ids);
  };
  $('#tapePlay').addEventListener('click', playTape);
  $('#heroTape').addEventListener('click', () => (S.ids.length ? playTape() : DD.scrollTo('#pick')));
  $('#tapeShuffle').addEventListener('click', () => {
    for (let k = S.ids.length - 1; k > 0; k--) { const j = (Math.random() * (k + 1)) | 0; [S.ids[k], S.ids[j]] = [S.ids[j], S.ids[k]]; }
    save(); paint(); DD.toast('shuffled. the order is fate now.');
  });
  $('#tapeFlip').addEventListener('click', () => {
    S.flipped = !S.flipped;
    $('#bigSide').textContent = S.flipped ? 'B' : 'A';
    $('#tapeFlip').textContent = S.flipped ? 'flip to side a' : 'flip to side b';
    if (motion) gsap.fromTo('#bigTape', { rotateY: 0 }, { rotateY: 180, duration: .45, ease: 'power2.in', yoyo: true, repeat: 1, transformPerspective: 900 });
  });
  $('#tapeClear').addEventListener('click', () => {
    if (!S.ids.length) return;
    S.ids = []; save(); paint(); DD.toast('erased. the best tapes were recorded over something.');
  });

  // j-card colour, print, share
  $$('.sw').forEach((b) => b.addEventListener('click', () => {
    S.theme = b.dataset.c; save();
    $$('.sw').forEach((x) => x.classList.toggle('is-on', x === b));
    $('#jPaper').dataset.theme = S.theme; paint();
  }));
  $$('.sw').forEach((x) => x.classList.toggle('is-on', x.dataset.c === S.theme));
  $('#jPaper').dataset.theme = S.theme;
  $('#jPrint').addEventListener('click', () => { if (!S.ids.length) DD.toast('it prints blank. pick songs first ↑'); window.print(); });
  $('#jShare').addEventListener('click', async () => {
    const h = new URLSearchParams({ t: S.ids.join('.'), n: S.name, b: S.by, c: S.theme }).toString();
    history.replaceState(null, '', '#' + h);
    try { await navigator.clipboard.writeText(location.href); DD.toast('link copied. send it to someone who needs a tape.'); }
    catch (e) { DD.toast('the link is in the address bar now. copy it from there.'); }
  });

  /* ---------- reels: they spin with the music and the tape moves from left to right ---------- */
  const reels = $$('.reel');
  const reelL = $('#reelL'), reelR = $('#reelR');
  const tapeOn = DD.visible($('#tape')), heroOn = DD.visible($('#mx'));
  let tapeP = 0;
  const markNow = () => {
    const i = P.index(), on = S.ids.includes(i);
    $$('.tape__list li').forEach((li) => li.classList.toggle('is-on', +li.dataset.i === i));
    $('#tape').classList.toggle('is-tape-playing', on && P.isPlaying());
  };
  window.addEventListener('dd:track', markNow);
  window.addEventListener('dd:state', markNow);
  window.addEventListener('dd:time', (e) => {
    const k = S.ids.indexOf(P.index()); if (k < 0) return;
    const tot = secsOf(S.ids) || 1;
    tapeP = Math.min(1, (secsOf(S.ids.slice(0, k)) + e.detail.cur) / tot);
  });
  gsap.ticker.add(() => {
    if (!tapeOn.on && !heroOn.on) return;
    const a = DD.spin.angle;
    reels.forEach((r, k) => (r.style.transform = `rotate(${k % 2 ? a * 1.3 : a}deg)`));
    if (tapeOn.on && reelL) {
      // the left reel empties, the right one fills
      reelL.style.setProperty('--tape', (4 + (1 - tapeP) * 16).toFixed(1) + 'px');
      reelR.style.setProperty('--tape', (4 + tapeP * 16).toFixed(1) + 'px');
    }
  });

  /* =========================================================
     EVANESCENCE — the one album we won't cut up
     ========================================================= */
  const eva = $('#eva');
  const ALBUM = T.map((t, i) => (t.issue === '03' && t.group === 'album' ? i : -1)).filter((i) => i > -1);
  if (eva && ALBUM.length) {
    $('#evaList').innerHTML = ALBUM.map((i, k) => `<li data-i="${i}" data-cursor="play from here"><span class="el__n">${DD.pad(k + 1)}</span><span class="el__t">${T[i].title}</span><span class="el__tm">${T[i].time}</span></li>`).join('');
    $('#evaLen').textContent = DD.fmt(secsOf(ALBUM));
    // bubbles: each one its own size, lane and speed
    $$('.eva__bubbles i').forEach((b) => {
      b.style.setProperty('--x', DD.rand(2, 98).toFixed(1) + '%'); b.style.setProperty('--s', DD.rand(4, 16).toFixed(0) + 'px');
      b.style.setProperty('--d', DD.rand(7, 15).toFixed(1) + 's'); b.style.setProperty('--dl', '-' + DD.rand(0, 15).toFixed(1) + 's');
      b.style.setProperty('--dx', DD.rand(-60, 60).toFixed(0) + 'px');
    });
    const evaOn = DD.visible(eva);
    new IntersectionObserver(([en]) => eva.classList.toggle('is-off', !en.isIntersecting)).observe(eva);
    const playAlbum = (i = ALBUM[0]) => { started = false; P.play(i, ALBUM); };
    $('#evaPlay').addEventListener('click', () => {
      const on = ALBUM.includes(P.index());
      if (on && P.isPlaying()) P.pause(); else if (on) P.toggle(); else playAlbum();
    });
    $('#evaJewel').addEventListener('click', () => $('#evaPlay').click());
    $('#evaList').addEventListener('click', (e) => { const li = e.target.closest('li'); if (li) playAlbum(+li.dataset.i); });
    $('#evaTape').addEventListener('click', () => {
      S.ids = ALBUM.slice(0, MAX); if (!S.name.trim()) { S.name = 'evanescence, front to back'; nameIn.value = S.name; }
      save(); paint();
      DD.toast('recorded. "never go back" and "swimming home" didn\'t fit on a c90 of ten. that\'s what side c is for.', 4600);
      DD.scrollTo('#tape');
    });
    $('#evaFilter').addEventListener('click', () => { $('#pickFilter .cat[data-f="evanescence"]').click(); DD.scrollTo('#pick'); });
    const mark = () => {
      const i = P.index(), on = ALBUM.includes(i);
      eva.classList.toggle('is-playing', on && P.isPlaying());
      $$('#evaList li').forEach((li) => { li.classList.toggle('is-on', +li.dataset.i === i); if (+li.dataset.i !== i) li.style.setProperty('--p', 0); });
      $('#evaPlay span').textContent = on && P.isPlaying() ? 'pause' : 'play front to back';
    };
    window.addEventListener('dd:track', mark); window.addEventListener('dd:state', mark); mark();
    window.addEventListener('dd:time', (e) => { if (evaOn.on) $(`#evaList li[data-i="${P.index()}"]`)?.style.setProperty('--p', e.detail.p.toFixed(3)); });
    const cd = $('#evaCd');
    gsap.ticker.add(() => { if (evaOn.on && eva.classList.contains('is-playing')) cd.style.rotate = DD.spin.angle.toFixed(1) + 'deg'; });
  }

  /* ---------- issue ticker ---------- */
  const nt = $('#nextTrack');
  if (nt) {
    const names = [...new Set(T.map((t) => t.artist.toUpperCase()))];
    const r = names.map((n) => `<span>${n}</span><i>✦</i>`).join('');
    nt.innerHTML = r + r;
  }
  paint();
  DD.mag();

  /* =========================================================
     LOADER — rewinding with a pencil
     ========================================================= */
  const loader = $('#loader');
  const finish = () => { document.body.classList.remove('is-loading'); window.dispatchEvent(new Event('dd:ready')); };
  if (!loader) finish();
  else if (!motion) { loader.remove(); finish(); }
  else {
    const o = { p: 0 }, pct = $('#ldPct');
    const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
    gsap.from('.ld-03 span', { yPercent: 100, opacity: 0, duration: 1.1, stagger: .12, ease: 'expo.out' });
    gsap.to('.ld-03 span:first-child', { rotate: -360, duration: 1.6, ease: 'power2.inOut', delay: .4 });
    const cnt = gsap.to(o, { p: 86, duration: 1.5, ease: 'power2.inOut', onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') });
    Promise.all([loaded, document.fonts ? document.fonts.ready : 0, new Promise((r) => setTimeout(r, 1600))]).then(() => {
      cnt.kill();
      DD.scramble($('#ldLine'), 'press record.', 400);
      gsap.timeline({ onComplete: () => loader.remove() })
        .to(o, { p: 100, duration: .35, onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') })
        .to('.ld-03 span', { yPercent: -120, opacity: 0, duration: .6, stagger: .05, ease: 'power3.in' }, '+=.2')
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=.3')
        .add(() => { finish(); intro(); }, '-=.6');
    });
  }
  const intro = () => {
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hdr > *', { y: -20, opacity: 0, duration: 1, stagger: .06 })
      .from('.mx__l', { xPercent: -60, opacity: 0, duration: 1.4 }, '<')
      .from('.mx__r', { xPercent: 60, opacity: 0, duration: 1.4 }, '<')
      .from('.cassette--hero', { y: 140, rotate: 20, opacity: 0, duration: 1.4 }, '<.15')
      .from(['.mx__p', '.mx__go'], { y: 30, opacity: 0, duration: 1, stagger: .08 }, '<.3')
      .from('.bar', { y: 120, opacity: 0, duration: 1.2 }, '<');
    const wires = $$('.mx__wires path');
    wires.forEach((w, k) => { const l = w.getTotalLength(); gsap.fromTo(w, { strokeDasharray: l, strokeDashoffset: l }, { strokeDashoffset: 0, duration: 2.4, delay: .2 + k * .15, ease: 'power2.inOut' }); });
  };

  /* =========================================================
     SCROLL SCENES
     ========================================================= */
  DD.ready.then(() => {
    if (!motion) return;
    const scrub = (target, vars, trigger, start = 'top bottom', end = 'bottom top') =>
      gsap.to(target, { ...vars, ease: 'none', scrollTrigger: { trigger: trigger || target, start, end, scrub: true } });
    // the word splits wider as you leave, the cassette drops into the next section
    scrub('.mx__l', { xPercent: -30 }, '.mx', 'top top');
    scrub('.mx__r', { xPercent: 30 }, '.mx', 'top top');
    scrub('.cassette--hero', { y: 160, rotate: 8 }, '.mx', 'top top');
    // the big cassette slides in from the left like it's going into a deck
    gsap.from('#bigTape', { x: -200, rotate: -10, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.tape', start: 'top 70%' } });
    gsap.from('.tape__name', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.tape', start: 'top 70%' } });
    // evanescence: the name surfaces, the list rises like bubbles
    gsap.from('.eva__t', { y: 60, opacity: 0, filter: 'blur(12px)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.eva', start: 'top 70%' } });
    gsap.from('#evaList li', { y: 40, opacity: 0, duration: 1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: '#evaList', start: 'top 80%' } });
    gsap.from('.jewel', { rotate: -12, y: 80, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.eva__objects', start: 'top 85%' } });
    // the j-card unfolds
    gsap.fromTo('.jc--cover', { rotateY: -160 }, { rotateY: 0, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.jcard__paper', start: 'top 80%' } });
    gsap.fromTo('.jc--back', { rotateY: 160 }, { rotateY: 0, duration: 1.4, delay: .25, ease: 'expo.inOut', scrollTrigger: { trigger: '.jcard__paper', start: 'top 80%' } });
    // ticker
    const nx = gsap.to('#nextTrack', { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    $('.next__band')?.addEventListener('mouseenter', () => gsap.to(nx, { timeScale: .2, duration: .6 }));
    $('.next__band')?.addEventListener('mouseleave', () => gsap.to(nx, { timeScale: 1, duration: .6 }));
    scrub('.ft__big', { yPercent: -10, letterSpacing: '.03em' }, '.ft', 'top bottom', 'bottom bottom');
    setTimeout(() => ScrollTrigger.refresh(), 500);
  });
})();
