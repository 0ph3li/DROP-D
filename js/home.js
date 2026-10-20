/* =========================================================
   DROP D — home.js
   issue 01: put a record on
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$, data: D } = DD;
  const T = D.tracks, P = DD.player;
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg>';
  const n2 = (i) => DD.pad(i + 1);
  const motion = DD.motion;

  /* =========================================================
     RENDER
     ========================================================= */
  // the crate (music2d "favourite playlists")
  const crate = $('#crate');
  if (crate) {
    crate.innerHTML = T.map((t, i) => `
      <li data-play="${i}" data-genre="${t.genre}">
        <span class="slot slot--mini" data-img="${t.cover}" data-n="${n2(i)}"></span>
        <span><b>${t.title}</b><small><a href="${DD.artistUrl(t.artist)}" class="to-artist">${t.artist}</a> · ${t.year}</small></span>
        <span class="crate__go">${PLAY}</span>
      </li>`).join('');
    DD.slots(crate);
    $$('.cat').forEach((c) => c.addEventListener('click', () => {
      $$('.cat').forEach((x) => x.classList.toggle('is-on', x === c));
      const g = c.dataset.genre;
      const rows = $$('li', crate);
      rows.forEach((r) => (r.hidden = g !== 'all' && r.dataset.genre !== g));
      const shown = rows.filter((r) => !r.hidden);
      $('#crateCount').textContent = shown.length;
      if (motion) gsap.fromTo(shown, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: .6, stagger: .04, ease: 'expo.out' });
    }));
  }

  // the ad strip: every cover in a row, twice, for the loop
  const track = $('#stripTrack');
  if (track) {
    const cells = T.map((t, i) => `<div class="strip__cell" data-play="${i}" data-cursor="play"><span class="slot slot--mini" data-img="${t.cover}" data-n="${n2(i)}"></span><b>${t.artist}</b></div>`).join('');
    track.innerHTML = cells + cells;
    DD.slots(track);
  }

  // five ways to listen
  const ways = $('#ways');
  if (ways) {
    ways.innerHTML = D.ways.map((w, k) => `
      <button class="way${k === 2 ? ' is-on' : ''}" data-way="${k}" data-cursor="${k === 2 ? 'play' : ''}">
        <span class="way__name">${w.name}</span>
        <span class="way__n">(${w.n})</span>
        <i class="way__disc"></i>
        <span class="way__line">${w.line}</span>
      </button>`).join('');
  }

  // rare pressings
  const press = $('#press');
  if (press) {
    press.innerHTML = D.pressings.map((i) => {
      const t = T[i];
      return `
      <article class="rec" data-play="${i}" data-cursor="play" data-reveal>
        <div class="rec__art">
          <i class="rec__vinyl v-${t.vinyl}"></i>
          <span class="slot" data-img="${t.cover}" data-label="${t.cover.replace('img/', '')} · the album cover, square"></span>
        </div>
        <p class="rec__cap"><small>${t.artist}</small><b>${t.album}</b><span class="pix">${t.vinyl} vinyl · ${t.year}</span></p>
      </article>`;
    }).join('');
    DD.slots(press);
  }

  // hot 100
  const chart = $('#chartList');
  if (chart) {
    chart.innerHTML = D.chart.map((c) => {
      const t = T[c.play];
      return `
      <li data-play="${c.play}" data-reveal>
        <span class="chart__rank"><sup>#</sup>${c.peak}</span>
        <span class="slot slot--mini" data-img="${t.cover}" data-n="${n2(c.play)}"></span>
        <span class="chart__ti"><b>${t.title}</b><small><a href="${DD.artistUrl(t.artist)}" class="to-artist">${t.artist}</a> · ${t.album}</small></span>
        <span class="chart__note">${c.note}</span>
        <span class="chart__yr">${c.released}</span>
        <span class="chart__go">${PLAY}</span>
      </li>`;
    }).join('');
    DD.slots(chart);
  }

  // faces + sticky notes
  const faces = $('#facesGrid');
  const SMILES = [
    '<svg viewBox="0 0 34 22"><path d="M6 2v6M20 2v6M2 13c8 8 22 8 30 0" /><path d="M18 17c0 4 6 4 6 0" /></svg>',
    '<svg viewBox="0 0 34 22"><path d="M6 3v5M22 3v5M4 16h26" /></svg>',
    '<svg viewBox="0 0 34 22"><path d="M5 4l4 3-4 3M27 4l-4 3 4 3M8 18c6-5 12-5 18 0" /></svg>',
  ];
  if (faces) {
    faces.innerHTML = D.faces.map((f, k) => `
      <li class="face" data-play="${f.play}" data-mood="${f.mood}" data-cursor="put it on" data-reveal>
        <div class="face__img slot" data-img="${f.img}" data-label="${f.img.replace('img/', '')} · band photo, landscape"><i class="face__glitch"></i></div>
        <div class="face__note" style="--r:${[-5, 4, -3, 6, -6, 3][k]}deg"><small>current mood:</small><b>${f.mood}</b>${SMILES[k % 3]}</div>
        <p class="face__cap"><b><a href="${DD.artistUrl(f.name)}" class="to-artist" data-cursor="artist file">${f.name}</a></b><span>${f.from}</span></p>
      </li>`).join('');
    DD.slots(faces);
    $$('.face', faces).forEach((f) => {
      f.addEventListener('mouseenter', () => DD.scramble($('#moodTxt'), f.dataset.mood, 500));
      f.addEventListener('mouseleave', () => DD.scramble($('#moodTxt'), 'heavy', 400));
      pixelate(f);
    });
  }
  DD.mag();

  /* ---------- HEAVY: halftone over a soft blur ---------- */
  const heavySlot = $('.clip__img');
  DD.onSlot(heavySlot, (img) => {
    const ht = document.createElement('div'); ht.className = 'clip__ht';
    ht.append(img.cloneNode());
    heavySlot.append(ht);
  });

  /* ---------- faces: the picture arrives pixelated, hover resolves it ---------- */
  function pixelate(face) {
    const slot = $('.face__img', face);
    DD.onSlot(slot, (img) => {
      const cv = document.createElement('canvas');
      const ctx = cv.getContext('2d');
      slot.append(cv);
      const o = { px: 14 };
      const draw = () => {
        const w = slot.clientWidth, h = slot.clientHeight;
        if (!w || !h) return;
        cv.width = w; cv.height = h;
        const s = Math.max(1, Math.round(o.px));
        const sw = Math.max(1, Math.ceil(w / s)), sh = Math.max(1, Math.ceil(h / s));
        // cover-fit the source
        const r = Math.max(sw / img.naturalWidth, sh / img.naturalHeight);
        const dw = img.naturalWidth * r, dh = img.naturalHeight * r;
        ctx.imageSmoothingEnabled = true;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, (sw - dw) / 2, (sh - dh) * .22, dw, dh);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(cv, 0, 0, sw, sh, 0, 0, w, h);
        cv.style.opacity = s <= 1 ? 0 : 1;
      };
      draw();
      addEventListener('resize', draw);
      const to = (px) => { if (motion) gsap.to(o, { px, duration: px > 1 ? .7 : .9, ease: px > 1 ? 'power2.in' : 'steps(8)', onUpdate: draw }); else { o.px = px; draw(); } };
      face.addEventListener('mouseenter', () => to(1));
      face.addEventListener('mouseleave', () => to(14));
    });
  }

  /* =========================================================
     THE DECK
     ========================================================= */
  const record = $('#record'), arm = $('#arm'), label = $('#recordLabel');
  const hwBars = $('#hwBars'), hwFill = $('#hwFill');
  const bars = (el, i) => { if (el) el.innerHTML = DD.wave(i, 96).map((h) => `<i style="height:${(h * 100).toFixed(1)}%"></i>`).join(''); };
  let firstPaint = true;
  const paintHero = (i) => {
    const t = T[i];
    const title = $('#heroTitle');
    if (title) {
      if (motion && !firstPaint) {
        gsap.timeline()
          .to(title, { yPercent: -30, opacity: 0, duration: .3, ease: 'power2.in' })
          .add(() => { title.textContent = t.title; })
          .fromTo(title, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .8, ease: 'expo.out' });
      } else title.textContent = t.title;
    }
    $('#heroArtist').textContent = t.artist;
    $('#heroAlbum').textContent = t.album;
    DD.scramble($('#heroYear'), String(t.year), 600);
    $('#heroPlays').textContent = P.plays(i);
    DD.setSlot(label, t.cover, n2(i));
    bars(hwBars, i); bars(hwFill, i);
    $$('#crate li').forEach((li) => li.classList.toggle('is-on', +li.dataset.play === i));
    $$('#chartList li').forEach((li) => li.classList.toggle('is-on', +li.dataset.play === i));
    $$('.face').forEach((f) => f.classList.toggle('is-on', +f.dataset.play === i));
    // the label drops onto the platter
    if (motion && !firstPaint) gsap.fromTo(label, { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, ease: 'back.out(2)' });
    firstPaint = false;
  };
  window.addEventListener('dd:track', (e) => paintHero(e.detail.i));
  paintHero(P.index());
  window.addEventListener('dd:state', () => { $('#heroPlays').textContent = P.plays(); });

  // waveform + timers
  let prog = 0;
  window.addEventListener('dd:time', (e) => {
    prog = e.detail.p;
    if (hwFill) hwFill.style.clipPath = `inset(0 ${(100 - prog * 100).toFixed(2)}% 0 0)`;
    $('#hwCur').textContent = DD.fmt(e.detail.cur);
    $('#hwDur').textContent = DD.fmt(e.detail.dur);
  });
  DD.seekable($('#heroWave'));
  P.paintTime();

  // platter + tonearm: read the shared spin every frame
  let armA = -6;
  const heroOn = DD.visible($('#hero'));
  const tickDeck = () => {
    if (!heroOn.on) return;
    if (record) record.style.transform = `rotate(${DD.spin.angle.toFixed(2)}deg)`;
    const playing = P.isPlaying();
    const target = playing ? 13 + prog * 15 : -6;
    armA += (target - armA) * (playing ? .06 : .08);
    if (arm) arm.style.transform = `rotate(${armA.toFixed(2)}deg)`;
  };
  if (window.gsap) gsap.ticker.add(tickDeck); else { const r = () => { tickDeck(); requestAnimationFrame(r); }; requestAnimationFrame(r); }

  // scratch: drag the record, the needle follows (one turn ≈ 1.8 s at 33⅓)
  if (record) {
    let on = false, lastA = 0, moved = 0;
    const ang = (e) => { const r = record.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    record.addEventListener('pointerdown', (e) => {
      on = true; moved = 0; lastA = ang(e); DD.spin.hold = true; record.classList.add('is-scratch');
      record.setPointerCapture(e.pointerId); DD.lock(true);
    });
    record.addEventListener('pointermove', (e) => {
      if (!on) return;
      let d = ang(e) - lastA; lastA += d;
      if (d > 180) d -= 360; if (d < -180) d += 360;
      moved += Math.abs(d);
      DD.spin.angle = (DD.spin.angle + d + 360) % 360;
      P.nudge((d / 360) * 1.8 * (P.rpm() === 45 ? 45 / 33 : 1));
    });
    const up = () => {
      if (!on) return; on = false; DD.spin.hold = false; record.classList.remove('is-scratch'); DD.lock(false);
      if (moved < 4) P.toggle();
      else if (!sessionStorage.getItem('dd-scratched')) { try { sessionStorage.setItem('dd-scratched', '1'); } catch (e) {} DD.toast('scratching a record you don\'t own. very nu metal of you.'); }
    };
    record.addEventListener('pointerup', up);
    record.addEventListener('pointercancel', up);
  }

  // start · stop + 33 / 45
  $('#deckStart')?.addEventListener('click', () => P.toggle());
  const knob = $('#pitchKnob');
  $$('[data-rpm]').forEach((b) => b.addEventListener('click', () => {
    const r = +b.dataset.rpm;
    P.rpm(r);
    $$('[data-rpm]').forEach((x) => x.classList.toggle('is-on', x === b));
    if (knob) knob.style.left = r === 45 ? '82%' : '50%';
    if (r === 45) DD.toast('45 rpm: the whole genre just turned into a cartoon. you\'re welcome.');
  }));

  /* ---------- five circles: one is always listening ---------- */
  if (ways) {
    const all = $$('.way', ways);
    let cur = 2, auto;
    const set = (k) => {
      cur = k;
      all.forEach((w, j) => { w.classList.toggle('is-on', j === k); w.dataset.cursor = j === k ? 'play' : 'listen'; });
    };
    all.forEach((w, k) => {
      w.addEventListener('mouseenter', () => { clearInterval(auto); set(k); });
      w.addEventListener('click', () => {
        clearInterval(auto);
        if (cur !== k) { set(k); return; }
        const way = D.ways[k];
        P.play(way.play);
        DD.toast(`listening ${way.name}: ${T[way.play].artist} — ${T[way.play].title}`);
      });
    });
    set(2);
    if (motion) auto = setInterval(() => set((cur + 1) % all.length), 3600);
  }

  /* =========================================================
     LOADER — tuning the low E down to D
     ========================================================= */
  const loader = $('#loader');
  const finish = () => { document.body.classList.remove('is-loading'); window.dispatchEvent(new Event('dd:ready')); };
  if (!loader) finish();
  else if (!motion) { loader.remove(); finish(); }
  else {
    const o = { p: 0 }, pct = $('#ldPct');
    const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
    const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
    gsap.from('.ld-tune > *', { yPercent: 100, opacity: 0, duration: 1, stagger: .06, ease: 'expo.out' });
    gsap.from(['.ld-top', '.ld-line', '.ld-foot'], { opacity: 0, y: 12, duration: .9, stagger: .08, ease: 'expo.out', delay: .2 });
    const count = gsap.to(o, { p: 84, duration: 1.8, ease: 'power2.inOut', onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') });
    // the string slackens: E wobbles, then drops to D
    const low = $('#ldTune b');
    gsap.to(low, { x: 3, duration: .05, repeat: 22, yoyo: true, ease: 'none', delay: .9 });
    setTimeout(() => DD.scramble($('#ldLine'), 'now we loosen the low e string…', 500), 900);
    Promise.all([loaded, fonts, new Promise((r) => setTimeout(r, 2100))]).then(() => {
      count.kill();
      DD.scramble(low, 'D', 300);
      DD.scramble($('#ldLine'), 'one step down, e becomes d. this is drop d.', 600);
      gsap.timeline({ onComplete: () => loader.remove() })
        .to(o, { p: 100, duration: .4, onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') })
        .fromTo(low, { y: 0 }, { y: 30, duration: .5, ease: 'bounce.out' }, '<')
        .to('.ld-tune > *', { yPercent: -110, opacity: 0, duration: .6, stagger: .04, ease: 'power3.in' }, '+=.9')
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=.2')
        .add(() => { finish(); intro(); }, '-=.6');
    });
  }

  const intro = () => {
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hdr > *', { y: -20, opacity: 0, duration: 1, stagger: .06 })
      .from('.deck', { y: 120, rotateX: 40, opacity: 0, duration: 1.6, transformPerspective: 1200 }, '<')
      .from('.deck__record', { scale: 1.25, opacity: 0, duration: 1.2 }, '<.4')
      .from('.hero__tag', { clipPath: 'inset(0 100% 0 0)', duration: 1.6, ease: 'power3.inOut' }, '<')
      .from('.hero__info > *', { y: 40, opacity: 0, duration: 1.1, stagger: .07 }, '<.1')
      .from('.bar', { y: 120, opacity: 0, duration: 1.2 }, '<.4');
  };

  /* =========================================================
     HEAVY — five letters that drop and headbang over a photo that melts
     ========================================================= */
  function heavy() {
    const g = $('#heavyLetters'), word = $('#clipWord');
    if (!g || !word) return;
    const NS = 'http://www.w3.org/2000/svg', L = [...'HEAVY'];
    // measure Anton at 520px, then stretch the five letters across the full 1000 units
    const mc = document.createElement('canvas').getContext('2d');
    mc.font = '520px Anton';
    const ws = L.map((c) => mc.measureText(c).width), gap = 6, total = ws.reduce((a, b) => a + b, 0) + gap * (L.length - 1);
    g.innerHTML = '';
    g.setAttribute('transform', `scale(${(1000 / total).toFixed(4)} 1)`);
    let x = 0;
    const letters = L.map((c, k) => {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x); t.setAttribute('y', 385); t.textContent = c;
      g.append(t);
      const o = { el: t, cx: x + ws[k] / 2, dy: 0, rot: 0, drop: -620 };
      x += ws[k] + gap;
      return o;
    });
    // they fall in, one by one, like amps being dropped on a stage
    ScrollTrigger.create({
      trigger: word, start: 'top 80%', once: true,
      onEnter: () => letters.forEach((o, k) => gsap.to(o, { drop: 0, duration: 1.1, delay: k * .12, ease: 'bounce.out' })),
    });
    // headbang: with the music, each letter nods on its own frequency band
    let kick = 0;
    const wordOn = DD.visible(word);
    gsap.ticker.add(() => {
      if (!wordOn.on) return;
      const playing = DD.player?.isPlaying();
      letters.forEach((o, k) => {
        const band = DD.bands ? DD.bands[(k * 4 + 1) % DD.bands.length] : 0;
        const ty = playing ? -band * 70 : 0, tr = playing ? (k % 2 ? 1 : -1) * band * 6 : 0;
        o.dy += (ty - o.dy) * .25; o.rot += (tr - o.rot) * .2;
        o.el.setAttribute('transform', `translate(0 ${(o.dy + o.drop - kick * (k % 2 ? 40 : 70)).toFixed(1)}) rotate(${o.rot.toFixed(2)} ${o.cx.toFixed(0)} 385)`);
      });
    });
    // the halftone: dots get finer as you scroll in, and swell with the music
    const dot = { s: 14 };
    gsap.to(dot, { s: 7, ease: 'none', scrollTrigger: { trigger: word, start: 'top bottom', end: 'center center', scrub: true } });
    let lastDot = 0;
    gsap.ticker.add(() => {
      if (!wordOn.on || !heavySlot) return;
      const v = Math.round((dot.s + (DD.player?.isPlaying() ? DD.level * 6 : 0)) * 2) / 2; // half-pixel steps: no repaint for tiny changes
      if (v !== lastDot) { lastDot = v; heavySlot.style.setProperty('--dot', v + 'px'); }
    });
    // click: everybody jumps
    word.addEventListener('click', () => {
      gsap.fromTo({ v: 1 }, { v: 1 }, { v: 0, duration: .9, ease: 'bounce.out', onUpdate() { kick = this.targets()[0].v; } });
      if (!DD.player?.isPlaying()) DD.toast('heavier with the music on. press play.');
    });
    // melt: hover and the photo bends like hot metal; the music keeps it moving; a click sends a shockwave
    const noise = $('#meltNoise'), map = $('#meltMap');
    const m = { s: 0, f: 1 };
    let t = 0, wasOn = false;
    gsap.ticker.add((time, dt) => {
      if (!wordOn.on && !wasOn) return;
      const music = DD.player?.isPlaying() && wordOn.on ? DD.level * 38 : 0;
      const sc = m.s + music;
      const on = sc > .5;
      if (on !== wasOn) { heavySlot.classList.toggle('is-melt', on); wasOn = on; }
      if (!on) return;
      t += dt / 1000;
      noise.setAttribute('baseFrequency', `${(0.006 * m.f + Math.sin(t * .8) * .0018).toFixed(4)} ${(0.02 * m.f + Math.cos(t * .6) * .006).toFixed(4)}`);
      map.setAttribute('scale', sc.toFixed(1));
    });
    word.addEventListener('pointerenter', () => gsap.to(m, { s: 46, duration: 1.2, ease: 'power2.out' }));
    word.addEventListener('pointerleave', () => gsap.to(m, { s: 0, f: 1, duration: 1.4, ease: 'power2.inOut' }));
    word.addEventListener('pointermove', (e) => {
      const b = word.getBoundingClientRect();
      gsap.to(m, { f: .7 + ((e.clientX - b.left) / b.width) * .9, duration: .8, ease: 'power3.out' });
    });
    word.addEventListener('pointerdown', () => gsap.fromTo(m, { s: 150 }, { s: word.matches(':hover') ? 46 : 0, duration: 1.6, ease: 'elastic.out(1, .3)' }));
  }

  /* =========================================================
     SCROLL SCENES
     ========================================================= */
  DD.ready.then(() => {
    if (!motion) return;
    const scrub = (target, vars, trigger, start = 'top bottom', end = 'bottom top') =>
      gsap.to(target, { ...vars, ease: 'none', scrollTrigger: { trigger: trigger || target, start, end, scrub: true } });

    // hero
    scrub('.hero__tag', { yPercent: 60, rotate: -14 }, '.hero', 'top top');
    scrub('.deck', { y: 80, rotate: -3 }, '.hero', 'top top');

    // heavy: the picture drifts inside the letters, and follows the mouse a little
    scrub('.clip__img', { yPercent: 12 }, '.clip__word');
    const cw = $('#clipWord');
    cw?.addEventListener('pointermove', (e) => {
      const r = cw.getBoundingClientRect();
      gsap.to('.clip__img', { xPercent: ((e.clientX - r.left) / r.width - .5) * -6, duration: 1.2, ease: 'power3.out' });
    });
    heavy();
    gsap.from('.clip__cols p', { y: 40, opacity: 0, duration: 1.1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.clip__cols', start: 'top 85%' } });

    // strip: the ad title slides, the covers run (faster when you scroll faster)
    scrub('.strip__t', { xPercent: -14 }, '.strip');
    const run = gsap.to('#stripTrack', { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    ScrollTrigger.create({
      trigger: '.strip', start: 'top bottom', end: 'bottom top',
      onUpdate: (st) => { const v = Math.min(6, 1 + Math.abs(st.getVelocity()) / 400); gsap.to(run, { timeScale: v * (st.direction || 1), duration: .3, overwrite: true }); gsap.to(run, { timeScale: 1, duration: 1.2, delay: .3 }); },
    });

    // dark: the big letters lean in, circles line up, vinyls slide out of their sleeves
    gsap.from('.dark__side b', { yPercent: 40, opacity: 0, duration: 1.4, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.dark__head', start: 'top 80%' } });
    scrub('.dark__tag--1', { yPercent: -80, rotate: -4 }, '.dark');
    scrub('.dark__tag--2', { yPercent: -60 }, '.dark');
    gsap.from('.way', { xPercent: (k) => (k - 2) * -60, opacity: 0, duration: 1.4, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: '.ways', start: 'top 80%' } });
    $$('.rec').forEach((r) => gsap.from($('.rec__vinyl', r), { xPercent: -30, rotate: -200, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 80%' } }));

    // poster
    const card = $('.poster__card');
    if (card) {
      gsap.from(card, { rotateX: 16, y: 80, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 92%' } });
      gsap.from('.poster__word span', { xPercent: 120, opacity: 0, duration: 1.2, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 75%' } });
      gsap.fromTo('#posterBand', { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'expo.inOut', scrollTrigger: { trigger: card, start: 'top 60%' } });
      $$('.poster__word span').forEach((s, k) => scrub(s, { xPercent: (k % 2 ? -1 : 1) * 12 }, card));
      const band = $('#posterBand');
      const cardOn = DD.visible(card);
      gsap.ticker.add(() => { if (band && cardOn.on) band.style.setProperty('--lv', (1 + DD.level * .6).toFixed(3)); });
    }

    // hot 100: the pink words fall into place like the people poster
    gsap.from('.chart__w', { y: (k) => [-60, 40, 80][k], rotate: (k) => [-4, 3, -2][k], opacity: 0, duration: 1.6, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.chart__head', start: 'top 80%' } });
    $$('.chart__rank').forEach((r) => {
      const num = r.lastChild, to = +num.textContent;
      ScrollTrigger.create({ trigger: r, start: 'top 92%', once: true, onEnter: () => { const o = { v: 100 }; gsap.to(o, { v: to, duration: 1.4, ease: 'expo.out', onUpdate: () => (num.textContent = Math.round(o.v)) }); } });
    });

    // faces: the notes get stuck on, one by one
    ScrollTrigger.create({
      trigger: '#facesGrid', start: 'top 75%', once: true,
      onEnter: () => gsap.from('.face__note', { y: -80, rotate: 30, opacity: 0, duration: 1, stagger: .1, ease: 'back.out(1.6)', delay: .4 }),
    });

    // zine: the earphone wire draws itself, the cut-outs drift apart
    const wire = $('#wire');
    if (wire) {
      const len = wire.getTotalLength();
      gsap.fromTo(wire, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.zine__spread', start: 'top 80%', end: 'bottom 60%', scrub: true } });
    }
    scrub('.zine__a', { y: -50 }, '.zine'); scrub('.zine__b', { y: 40, rotate: 25 }, '.zine'); scrub('.zine__c', { y: -24 }, '.zine');
    gsap.from('.zine__t span', { xPercent: 30, opacity: 0, duration: 1.4, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.zine__spread', start: 'top 70%' } });

    // arc: drawn like a needle crossing the record
    const ap = $('#arcPath');
    if (ap) {
      const len = ap.getTotalLength();
      gsap.fromTo(ap, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: '.arc', start: 'top 70%' } });
      gsap.from('.arc__n', { scale: 0, opacity: 0, duration: 1, stagger: .25, ease: 'back.out(2)', delay: .5, scrollTrigger: { trigger: '.arc', start: 'top 70%' } });
    }
    scrub('.arc__bg', { yPercent: -20 }, '.arc');
    const nx = gsap.to('#nextTrack', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
    $('.next__band')?.addEventListener('mouseenter', () => gsap.to(nx, { timeScale: .2, duration: .6 }));
    $('.next__band')?.addEventListener('mouseleave', () => gsap.to(nx, { timeScale: 1, duration: .6 }));
    scrub('.ft__big', { yPercent: -10, letterSpacing: '.03em' }, '.ft', 'top bottom', 'bottom bottom');

    setTimeout(() => ScrollTrigger.refresh(), 500);
  });
})();
