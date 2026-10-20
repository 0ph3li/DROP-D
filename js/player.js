/* =========================================================
   DROP D — player.js (the deck, every page)
   real files from /SONGS when they exist, a polite pretend when they don't.
   33 or 45 rpm, scratchable, and one secret tuning.
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$ } = DD;
  const T = DD.data.tracks;
  if (!T.length) return;
  const root = document.documentElement;
  const http = /^https?:/.test(location.protocol);

  const audio = new Audio();
  audio.preload = 'metadata';
  if (http) audio.crossOrigin = 'anonymous';
  audio.preservesPitch = false; audio.mozPreservesPitch = false; audio.webkitPreservesPitch = false;

  const S = {
    i: 0, queue: T.map((_, k) => k), qi: 0,
    playing: false, shuffle: DD.store.get('shuffle') === '1', loop: +(DD.store.get('loop') || 0), // 0 off · 1 all · 2 one
    sim: false, simT: 0, simAt: 0, warned: {},
    rpm: 33, semis: 0,
    plays: DD.store.json(DD.page + '-plays', {}),
  };

  const P = (DD.player = {});
  P.track = () => T[S.i];
  P.index = () => S.i;
  P.isPlaying = () => S.playing;
  P.plays = (i = S.i) => S.plays[i] || 0;
  P.rate = () => (S.rpm === 45 ? 45 / 33 : 1) * Math.pow(2, S.semis / 12);
  P.dur = () => (S.sim || !isFinite(audio.duration) || !audio.duration ? DD.secs(T[S.i].time) : audio.duration);
  P.cur = () => (S.sim ? S.simT + (S.playing ? ((performance.now() - S.simAt) / 1000) * P.rate() : 0) : audio.currentTime);

  const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
  const setPlaying = (on) => {
    S.playing = on;
    root.classList.toggle('is-playing', on);
    $$('#playBtn, [data-act="toggle"]').forEach((b) => b.setAttribute('aria-label', on ? 'pause' : 'play'));
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = on ? 'playing' : 'paused';
    emit('dd:state', { playing: on, i: S.i });
  };
  const applyRate = () => {
    if (S.sim && S.playing) { S.simT = P.cur(); S.simAt = performance.now(); }
    audio.playbackRate = P.rate();
  };

  /* ---------- every song keeps its own waveform ---------- */
  DD.wave = (i, n = 90) => {
    const r = DD.seeded(1000 + i * 7919);
    let prev = .5;
    return Array.from({ length: n }, (_, k) => {
      const env = .35 + .65 * Math.sin(Math.PI * (k + 1) / (n + 1)) ** .6;
      prev = prev * .45 + r() * .55;
      return Math.max(.12, Math.min(1, prev * env * 1.25));
    });
  };
  const bars = (el, i, n) => { if (el) el.innerHTML = DD.wave(i, n).map((h) => `<i style="height:${(h * 100).toFixed(1)}%"></i>`).join(''); };

  /* ---------- loading a record ---------- */
  const load = (i, { count = true } = {}) => {
    S.i = (i + T.length) % T.length;
    const t = T[S.i];
    S.sim = false; S.simT = 0;
    audio.src = t.src;
    applyRate();
    if (count) { S.plays[S.i] = (S.plays[S.i] || 0) + 1; DD.store.set(DD.page + '-plays', JSON.stringify(S.plays)); }
    P.title = `${t.title} — ${t.artist} · DROP D`;
    if (!document.hidden) document.title = P.title;
    paint();
    if ('mediaSession' in navigator) {
      try { navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, album: t.album, artwork: [{ src: t.cover, sizes: '512x512', type: 'image/jpeg' }] }); } catch (e) {}
    }
    DD.store.set(DD.page + '-last', String(S.i));
    emit('dd:track', { i: S.i, t });
  };

  const warn = () => {
    if (S.warned[S.i]) return;
    S.warned[S.i] = 1;
    DD.toast(`${T[S.i].src} isn't there yet — playing it in your head instead.`, 4200);
  };
  // missing file → the deck "plays it in your head": time moves, the viz pretends
  audio.addEventListener('error', () => {
    if (!audio.src || S.sim) return;
    S.sim = true; S.simT = 0; S.simAt = performance.now();
    if (S.playing) warn();
  });
  audio.addEventListener('ended', () => end());
  audio.addEventListener('loadedmetadata', () => { applyRate(); paintTime(); });

  const start = () => {
    ctxInit();
    setPlaying(true);
    if (S.sim) { S.simAt = performance.now(); warn(); return; }
    const p = audio.play();
    if (p && p.catch) p.catch((err) => {
      if (err && err.name === 'NotAllowedError') { setPlaying(false); return; }
      if (!S.sim) { S.sim = true; S.simT = 0; S.simAt = performance.now(); warn(); }
    });
  };
  const pause = () => {
    if (S.sim) S.simT = P.cur(); else audio.pause();
    setPlaying(false);
  };

  P.play = (i = S.i, queue) => {
    if (queue && queue.length) { S.queue = queue.slice(); S.qi = Math.max(0, S.queue.indexOf(i)); }
    else if (!S.queue.includes(i)) { S.queue = T.map((_, k) => k); S.qi = i; }
    else S.qi = S.queue.indexOf(i);
    if (i !== S.i || !audio.src) load(i);
    else if (P.cur() >= P.dur() - .2) P.seek(0);
    start();
  };
  P.toggle = () => { if (!audio.src) { P.play(S.i); return; } S.playing ? pause() : start(); };
  P.pause = pause;
  P.seek = (sec) => {
    sec = Math.max(0, Math.min(P.dur() - .05, sec));
    if (S.sim) { S.simT = sec; S.simAt = performance.now(); }
    else if (isFinite(audio.duration)) audio.currentTime = sec;
    paintTime();
  };
  P.nudge = (sec) => P.seek(P.cur() + sec);
  P.rpm = (r) => { if (r) { S.rpm = r; applyRate(); emit('dd:rpm', { rpm: r }); } return S.rpm; };
  P.tune = (semis) => { S.semis = semis; applyRate(); };
  const step = (dir) => {
    if (S.shuffle && S.queue.length > 1) { let n; do { n = (Math.random() * S.queue.length) | 0; } while (n === S.qi); S.qi = n; }
    else S.qi = (S.qi + dir + S.queue.length) % S.queue.length;
    const was = S.playing;
    load(S.queue[S.qi]);
    if (was) start(); else paintTime();
  };
  P.next = () => step(1);
  P.prev = () => { if (P.cur() > 3) P.seek(0); else step(-1); };
  const end = () => {
    if (S.loop === 2) { P.seek(0); start(); return; }
    const last = !S.shuffle && S.qi === S.queue.length - 1;
    if (last && S.loop === 0) { pause(); P.seek(0); DD.toast('side over. flip it, or pick another record.'); return; }
    step(1);
  };
  P.upNext = (n = 4) => Array.from({ length: Math.min(n, S.queue.length - 1) }, (_, k) => S.queue[(S.qi + k + 1) % S.queue.length]);

  /* ---------- painting the bar ---------- */
  const fill = $('#progFill'), knob = $('#progKnob'), mProg = $('#mProg'), tCur = $('#tCur'), tDur = $('#tDur');
  const paint = () => {
    const t = T[S.i];
    const set = (id, v) => { const el = $('#' + id); if (el) el.textContent = v; };
    set('barTitle', t.title); set('barArtist', `${t.artist} · ${t.album}`);
    set('hdrNow', `${t.artist} — ${t.title}`);
    DD.setSlot($('#barCover'), t.cover, DD.pad(S.i + 1));
    bars($('#progBars'), S.i, 70); bars(fill, S.i, 70);
    paintTime();
  };
  let dragging = false;
  const paintTime = (cur = P.cur()) => {
    const d = P.dur(), p = d ? Math.min(1, Math.max(0, cur / d)) : 0;
    if (fill) fill.style.clipPath = `inset(0 ${(100 - p * 100).toFixed(2)}% 0 0)`;
    if (knob) knob.style.left = p * 100 + '%';
    if (mProg) mProg.style.transform = `scaleX(${p})`;
    if (tCur) tCur.textContent = DD.fmt(cur);
    if (tDur) tDur.textContent = DD.fmt(d) === '0:00' ? T[S.i].time : DD.fmt(d);
    emit('dd:time', { cur, dur: d, p });
  };
  P.paintTime = paintTime;

  /* ---------- controls ---------- */
  $('#playBtn')?.addEventListener('click', () => P.toggle());
  $('#nextBtn')?.addEventListener('click', () => P.next());
  $('#prevBtn')?.addEventListener('click', () => P.prev());
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'toggle') P.toggle();
    if (act === 'next') P.next();
    if (act === 'prev') P.prev();
    if (act === 'shuffle') $('#shuffleBtn')?.click();
  });
  const shuffleBtn = $('#shuffleBtn'), loopBtn = $('#loopBtn');
  const paintModes = () => {
    $$('#shuffleBtn, [data-act="shuffle"]').forEach((b) => b.classList.toggle('is-on', S.shuffle));
    loopBtn?.classList.toggle('is-on', S.loop > 0);
    loopBtn?.classList.toggle('is-one', S.loop === 2);
  };
  shuffleBtn?.addEventListener('click', () => {
    S.shuffle = !S.shuffle; DD.store.set('shuffle', S.shuffle ? '1' : '');
    paintModes(); DD.toast(S.shuffle ? 'shuffle on. the crate is upside down.' : 'shuffle off. back in order.');
  });
  loopBtn?.addEventListener('click', () => {
    S.loop = (S.loop + 1) % 3; DD.store.set('loop', S.loop);
    paintModes(); DD.toast(['repeat off.', 'repeating the whole crate.', 'repeating one song. we all have one.'][S.loop]);
  });
  paintModes();

  // anything with data-play="i" (and optional data-queue="0,3,5") puts that record on
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-play]'); if (!b) return;
    const link = e.target.closest('a[href]');
    if (link && link !== b && b.contains(link)) return; // a link inside a playable row wins
    e.preventDefault();
    const i = +b.dataset.play;
    const queue = b.dataset.queue ? b.dataset.queue.split(',').map(Number) : null;
    if (i === S.i && audio.src && !queue) P.toggle();
    else P.play(i, queue);
  });

  // progress: click + drag
  const prog = $('#prog');
  DD.seekable = (el) => {
    if (!el) return;
    let drag = false;
    const at = (e) => { const r = el.getBoundingClientRect(); return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * P.dur(); };
    el.addEventListener('pointerdown', (e) => { drag = dragging = true; el.classList.add('is-drag'); el.setPointerCapture(e.pointerId); paintTime(at(e)); });
    el.addEventListener('pointermove', (e) => { if (drag) paintTime(at(e)); });
    el.addEventListener('pointerup', (e) => { if (!drag) return; drag = dragging = false; el.classList.remove('is-drag'); P.seek(at(e)); });
    el.addEventListener('pointercancel', () => { drag = dragging = false; el.classList.remove('is-drag'); });
  };
  DD.seekable(prog);

  // volume
  const vol = $('#vol'), volBox = $('.vol');
  const setVol = (v) => {
    audio.volume = v; if (vol) { vol.value = v; vol.style.setProperty('--v', v * 100 + '%'); }
    volBox?.classList.toggle('is-muted', v === 0);
    DD.store.set('vol', v);
  };
  let lastVol = +(DD.store.get('vol') ?? .8) || .8;
  setVol(+(DD.store.get('vol') ?? .8));
  vol?.addEventListener('input', () => { setVol(+vol.value); if (+vol.value > 0) lastVol = +vol.value; });
  $('#muteBtn')?.addEventListener('click', () => setVol(audio.volume > 0 ? 0 : lastVol || .8));

  // keyboard
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.code === 'Space' && !e.target.closest('button, a')) { e.preventDefault(); P.toggle(); }
    else if (e.key === 'ArrowRight') P.nudge(5);
    else if (e.key === 'ArrowLeft') P.nudge(-5);
    else if (e.key === 'n') P.next();
    else if (e.key === 'p') P.prev();
  });

  if ('mediaSession' in navigator) {
    try {
      navigator.mediaSession.setActionHandler('play', () => start());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('nexttrack', () => P.next());
      navigator.mediaSession.setActionHandler('previoustrack', () => P.prev());
    } catch (e) {}
  }

  /* ---------- visualizer + the platter's spin (shared with the deck) ---------- */
  let ctx, analyser, freq, silent = 0, real = false;
  const ctxInit = () => {
    if (ctx || !http) return; // on file:// web audio would mute the song, so we fake the bars there
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser(); analyser.fftSize = 128; analyser.smoothingTimeConstant = .8;
      src.connect(analyser); analyser.connect(ctx.destination);
      freq = new Uint8Array(analyser.frequencyBinCount);
      real = true;
    } catch (e) { ctx = null; }
  };
  const viz = $('#viz'), vc = viz?.getContext('2d');
  const BARS = 22, lv = new Float32Array(BARS);
  DD.level = 0; DD.bands = lv;
  DD.spin = { angle: 0, speed: 0 }; // degrees · degrees per second
  let last = performance.now(), pinkC = '#f4a3c6', fc = 0;
  const readPink = () => (pinkC = getComputedStyle(root).getPropertyValue('--pink').trim() || '#f4a3c6');
  readPink(); new MutationObserver(readPink).observe(root, { attributes: true, attributeFilter: ['class'] });
  const vizOn = DD.visible ? DD.visible(viz) : { on: true };
  const frame = (now) => {
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (S.playing && ctx?.state === 'suspended') ctx.resume();
    // the platter: 33⅓ rpm = 200°/s, spins up and down like a real motor
    const target = S.playing ? 200 * P.rate() : 0;
    DD.spin.speed += (target - DD.spin.speed) * Math.min(1, dt * (S.playing ? 2.2 : 1.3));
    if (!DD.spin.hold) DD.spin.angle = (DD.spin.angle + DD.spin.speed * dt) % 360;

    let got = false;
    if (S.playing && real && !S.sim && analyser) {
      analyser.getByteFrequencyData(freq);
      let sum = 0;
      for (let b = 0; b < BARS; b++) { const v = freq[Math.floor(b * (freq.length * .75) / BARS)] / 255; lv[b] += (v - lv[b]) * .5; sum += v; }
      silent = sum === 0 ? silent + 1 : 0;
      got = silent < 40;
    }
    if (!got) {
      for (let b = 0; b < BARS; b++) {
        const tg = S.playing ? (.3 + .6 * Math.abs(Math.sin(now / (150 + b * 21) + b * 1.9)) * (1 - b / BARS * .5)) * (.7 + Math.random() * .3) : .05;
        lv[b] += (tg - lv[b]) * .2;
      }
    }
    let avg = 0; for (let b = 0; b < BARS; b++) avg += lv[b];
    DD.level = avg / BARS;
    if (vc && vizOn.on && viz.offsetWidth) {
      const w = viz.width, h = viz.height, bw = w / BARS;
      vc.clearRect(0, 0, w, h);
      const pink = pinkC;
      for (let b = 0; b < BARS; b++) {
        const bh = Math.max(2, lv[b] * h);
        vc.fillStyle = b % 6 === 2 ? pink : 'rgba(242,240,235,.75)';
        vc.fillRect(b * bw + 1, h - bh, bw - 2, bh);
      }
    }
    if (S.playing && !dragging) {
      if (S.sim && P.cur() >= P.dur()) { S.simT = P.dur(); end(); }
      if (++fc % 2 === 0) paintTime();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  /* ---------- wake up with the last record you left on the deck ---------- */
  const lastI = +(DD.store.get(DD.page + '-last') ?? 0);
  load(isFinite(lastI) && T[lastI] ? lastI : 0, { count: false });
  S.qi = S.queue.indexOf(S.i);
})();
