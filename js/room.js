/* =========================================================
   DROP D — room.js
   the listening room: lights off, one record, front to back
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$ } = DD;
  const T = DD.data.tracks, P = DD.player;
  const motion = DD.motion;
  const body = document.body;

  /* ---------- the records: every song grouped into its album ---------- */
  const RECS = [];
  T.forEach((t, i) => {
    const name = t.album === 'single' ? `${t.title} (single)` : t.album;
    const slug = DD.slug(`${t.artist}-${name}`);
    let r = RECS.find((x) => x.slug === slug);
    if (!r) RECS.push(r = { slug, artist: t.artist, album: name, year: t.year, cover: t.cover, ids: [] });
    r.ids.push(i);
  });
  RECS.sort((a, b) => b.ids.length - a.ids.length || (+a.year || 0) - (+b.year || 0)); // full albums first
  const secs = (ids) => ids.reduce((s, i) => s + DD.secs(T[i].time), 0);
  let rec = null;
  const ridges = []; // the visualizer's line history (ridges mode)

  /* ---------- ambient colour: the average colour of the cover (needs http; pink otherwise) ---------- */
  const ambient = (src) => {
    const im = new Image();
    im.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 12;
        const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, 12, 12);
        const d = x.getImageData(0, 0, 12, 12).data; let r = 0, g = 0, b = 0, n = 0;
        for (let k = 0; k < d.length; k += 4) { const m = Math.max(d[k], d[k + 1], d[k + 2]); if (m < 30) continue; r += d[k]; g += d[k + 1]; b += d[k + 2]; n++; }
        if (!n) return;
        // push it brighter and more saturated, so it glows in the dark
        let [R, G, B] = [r / n, g / n, b / n]; const mx = Math.max(R, G, B) || 1, k = 235 / mx;
        [R, G, B] = [R, G, B].map((v) => Math.min(255, v * k));
        document.documentElement.style.setProperty('--amb', `rgb(${R | 0},${G | 0},${B | 0})`);
        ambRGB = [R, G, B];
      } catch (e) { /* file:// won't let us read pixels: stay pink */ }
    };
    im.src = src;
  };
  let ambRGB = [244, 163, 198];

  /* ---------- put a record on ---------- */
  const load = (r, play = true) => {
    rec = r;
    $('#album').textContent = r.album;
    const a = $('#artist'); a.textContent = r.artist; a.href = DD.artistUrl(r.artist);
    $('#year').textContent = r.year || '';
    $('#tAll').textContent = DD.fmt(secs(r.ids));
    DD.setSlot($('#label'), r.cover, r.artist);
    $('#roomBg').style.backgroundImage = `url("${r.cover}")`;
    ambient(r.cover);
    $('#tracks').innerHTML = r.ids.map((i, k) => `<li data-i="${i}"><span>${DD.pad(k + 1)}</span><b>${T[i].title}</b><span>${T[i].time}</span></li>`).join('');
    $$('.sleeve').forEach((s) => s.classList.toggle('is-on', s.dataset.slug === r.slug));
    document.title = `${r.album} — ${r.artist} · the listening room`;
    DD.store.set('room-last', r.slug);
    history.replaceState(null, '', `?r=${r.slug}`);
    if (play) P.play(r.ids[0], r.ids);
    paint();
    if (motion) {
      gsap.fromTo('#vinyl', { scale: .85, opacity: .3 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out' });
      gsap.fromTo(['#album', '.room__artist', '.room__track'], { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .06, ease: 'expo.out' });
    }
  };
  const onRec = () => rec && rec.ids.includes(P.index());
  const paint = () => {
    if (!rec) return;
    const i = P.index(), k = rec.ids.indexOf(i);
    $('#rPlay').setAttribute('aria-label', P.isPlaying() ? 'pause' : 'play');
    if (k < 0) { $('#track').textContent = 'press play to start the record'; $('#trackN').textContent = `0/${rec.ids.length}`; return; }
    $('#track').textContent = T[i].title;
    $('#trackN').textContent = `${k + 1}/${rec.ids.length}`;
    $('#side').textContent = k < Math.ceil(rec.ids.length / 2) ? 'side a' : 'side b';
    $$('#tracks li').forEach((li, j) => { li.classList.toggle('is-on', j === k); li.classList.toggle('is-done', j < k); });
  };
  window.addEventListener('dd:track', paint);
  window.addEventListener('dd:state', paint);
  window.addEventListener('dd:time', (e) => {
    $('#roomFill').style.transform = `scaleX(${e.detail.p})`;
    if (!rec) return;
    const k = rec.ids.indexOf(P.index()); if (k < 0) return;
    $('#tNow').textContent = DD.fmt(secs(rec.ids.slice(0, k)) + e.detail.cur);
  });
  DD.seekable($('#roomProg'));

  const playPause = () => {
    if (!rec) { openCrate(true); return; }
    if (onRec()) P.toggle(); else P.play(rec.ids[0], rec.ids);
  };
  $('#rPlay').addEventListener('click', playPause);
  $('#disc').addEventListener('click', playPause);
  $('#tracks').addEventListener('click', (e) => { const li = e.target.closest('li'); if (li && rec) P.play(+li.dataset.i, rec.ids); });

  /* =========================================================
     THE CRATE
     ========================================================= */
  const row = $('#crateRow');
  row.innerHTML = RECS.map((r) => `<div class="sleeve" data-slug="${r.slug}" data-cursor="put it on"><span class="slot" data-img="${r.cover}" data-n="${r.album}"></span><p><b>${r.album}</b><small>${r.artist} · ${r.ids.length} song${r.ids.length > 1 ? 's' : ''}</small></p></div>`).join('');
  DD.slots(row);
  $('#crateCount').textContent = RECS.length;
  const openCrate = (on) => {
    body.classList.toggle('crate-open', on ?? !body.classList.contains('crate-open'));
    $('#crateBtn').classList.toggle('is-on', body.classList.contains('crate-open'));
    if (motion && body.classList.contains('crate-open')) gsap.fromTo('.sleeve', { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .025, ease: 'expo.out', delay: .2 });
  };
  $('#crateBtn').addEventListener('click', () => openCrate());
  $('#crateClose').addEventListener('click', () => openCrate(false));
  // dig: drag, or turn the wheel
  let dn = false, mv = 0, sx = 0, sl = 0;
  row.addEventListener('pointerdown', (e) => { dn = true; mv = 0; sx = e.clientX; sl = row.scrollLeft; });
  addEventListener('pointermove', (e) => { if (!dn) return; mv = Math.max(mv, Math.abs(e.clientX - sx)); if (mv > 5) row.classList.add('is-drag'); row.scrollLeft = sl - (e.clientX - sx); });
  addEventListener('pointerup', () => { dn = false; setTimeout(() => row.classList.remove('is-drag'), 0); });
  row.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { row.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  row.addEventListener('click', (e) => {
    if (mv > 5) return;
    const s = e.target.closest('.sleeve'); if (!s) return;
    load(RECS.find((r) => r.slug === s.dataset.slug)); openCrate(false);
  });

  /* =========================================================
     LIGHTS · SLEEP · FULLSCREEN · MODES · KEYS
     ========================================================= */
  const lights = () => { body.classList.toggle('is-dark'); $('#lightsBtn').classList.toggle('is-on', body.classList.contains('is-dark')); DD.toast(body.classList.contains('is-dark') ? 'lights off. move the mouse to find the switch again.' : 'lights on.'); };
  $('#lightsBtn').addEventListener('click', lights);
  // the room goes dark by itself when you stop moving and the music is on
  let idleT;
  const wake = () => { body.classList.remove('is-idle'); clearTimeout(idleT); idleT = setTimeout(() => { if (P.isPlaying() && !body.classList.contains('crate-open')) body.classList.add('is-idle'); }, 3500); };
  ['pointermove', 'pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, wake, { passive: true }));
  wake();

  const SLEEP = [0, 15, 30, 60];
  let si = 0, sleepT, sleepAt = 0;
  $('#sleepBtn').addEventListener('click', () => {
    si = (si + 1) % SLEEP.length; clearTimeout(sleepT);
    const m = SLEEP[si];
    $('#sleepBtn').classList.toggle('is-on', m > 0);
    if (!m) { $('#sleepBtn').textContent = 'sleep: off'; DD.toast('sleep timer off. stay up.'); return; }
    sleepAt = Date.now() + m * 60000;
    DD.toast(`the record stops in ${m} minutes. goodnight in advance.`);
    sleepT = setTimeout(() => { P.pause(); body.classList.add('is-dark'); si = 0; $('#sleepBtn').classList.remove('is-on'); $('#sleepBtn').textContent = 'sleep: off'; DD.toast('goodnight. ♥', 6000); }, m * 60000);
  });
  setInterval(() => { if (SLEEP[si]) $('#sleepBtn').textContent = `sleep: ${Math.max(0, Math.ceil((sleepAt - Date.now()) / 60000))}m`; }, 5000);

  const full = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => DD.toast('this browser won\'t go fullscreen. press f11.'));
    else document.exitFullscreen?.();
  };
  $('#fullBtn').addEventListener('click', full);
  document.addEventListener('fullscreenchange', () => $('#fullBtn').classList.toggle('is-on', !!document.fullscreenElement));

  let mode = DD.store.get('room-mode') || 'rings';
  const setMode = (m) => { mode = m; DD.store.set('room-mode', m); $$('.rc__mode').forEach((b) => b.classList.toggle('is-on', b.dataset.mode === m)); ridges.length = 0; };
  $$('.rc__mode').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
  setMode(mode);

  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 'c') openCrate();
    if (k === 'l') lights();
    if (k === 'f') full();
    if (k === '1') setMode('rings'); if (k === '2') setMode('ridges'); if (k === '3') setMode('dots');
    if (k === 'escape') openCrate(false);
  });

  /* =========================================================
     THE VISUALIZER — rings, ridges, dots
     ========================================================= */
  const cv = $('#roomViz'), cx = cv.getContext('2d');
  let W = 0, H = 0;
  const size = () => { const d = Math.min(1.5, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); ridges.length = 0; };
  addEventListener('resize', size); size();
  // a smooth value for any position 0..1 across the spectrum
  const band = (x, t) => {
    const b = DD.bands; if (!b || !b.length) return 0;
    const f = Math.min(.999, Math.max(0, x)) * (b.length - 1), i = f | 0, r = f - i;
    const v = b[i] * (1 - r) + b[Math.min(b.length - 1, i + 1)] * r;
    return P.isPlaying() ? v : .06 + .04 * Math.sin(t / 900 + x * 9);
  };
  const disc = $('#disc'), vinyl = $('#vinyl');
  const frame = (now) => {
    requestAnimationFrame(frame);
    vinyl.style.transform = `rotate(${DD.spin.angle.toFixed(1)}deg)`;
    const [r, g, b] = ambRGB, col = (a) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
    cx.clearRect(0, 0, W, H);
    const db = disc.getBoundingClientRect(), ox = db.left + db.width / 2, oy = db.top + db.height / 2, R = db.width / 2;
    const lvl = P.isPlaying() ? DD.level : .05;

    if (mode === 'rings') {
      const N = 160;
      for (let ring = 0; ring < 2; ring++) {
        cx.beginPath();
        for (let k = 0; k <= N; k++) {
          const a = (k / N) * Math.PI * 2 - Math.PI / 2, x = Math.abs((k / N) * 2 - 1); // mirrored: bass at the top
          const v = band(1 - x, now) * (ring ? .55 : 1);
          const rr = R * (1.06 + ring * .1) + v * R * (ring ? .45 : .8);
          const px = ox + Math.cos(a) * rr, py = oy + Math.sin(a) * rr;
          k ? cx.lineTo(px, py) : cx.moveTo(px, py);
        }
        cx.closePath();
        cx.strokeStyle = col(ring ? .35 : .85); cx.lineWidth = ring ? 1 : 2;
        cx.shadowColor = col(.8); cx.shadowBlur = ring ? 0 : 24;
        cx.stroke();
      }
      cx.shadowBlur = 0;
      // spokes
      for (let k = 0; k < 120; k++) {
        const a = (k / 120) * Math.PI * 2, x = Math.abs((k / 120) * 2 - 1), v = band(1 - x, now);
        const r0 = R * 1.02, r1 = r0 + 6 + v * R * .35;
        cx.beginPath(); cx.moveTo(ox + Math.cos(a) * r0, oy + Math.sin(a) * r0); cx.lineTo(ox + Math.cos(a) * r1, oy + Math.sin(a) * r1);
        cx.strokeStyle = col(.25 + v * .6); cx.lineWidth = 2; cx.stroke();
      }
    }

    if (mode === 'ridges') {
      // unknown pleasures: a new line every frame, the old ones move back
      const P2 = 90, line = [];
      for (let k = 0; k < P2; k++) {
        const x = k / (P2 - 1), env = Math.exp(-((x - .5) ** 2) / .025);
        line.push(env * (band(Math.abs(x - .5) * 2, now) * 1.4 + Math.random() * .08));
      }
      if ((now | 0) % 2 === 0 || !ridges.length) ridges.unshift(line);
      const max = 34; if (ridges.length > max) ridges.length = max;
      const w = Math.min(W * .62, 900), left = (W - w) / 2, gap = Math.min(H * .012, 10), base = oy + R * .9;
      for (let j = ridges.length - 1; j >= 0; j--) {
        const y0 = base - j * gap * 1.6, L = ridges[j];
        cx.beginPath(); cx.moveTo(left, y0);
        L.forEach((v, k) => cx.lineTo(left + (k / (P2 - 1)) * w, y0 - v * H * .16));
        cx.lineTo(left + w, y0); cx.closePath();
        cx.fillStyle = '#050505'; cx.fill();
        cx.strokeStyle = j === 0 ? col(1) : `rgba(242,240,235,${.75 - j / max * .6})`; cx.lineWidth = j === 0 ? 2 : 1.2; cx.stroke();
      }
    }

    if (mode === 'dots') {
      const step = 26;
      for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
        const dx = x - ox, dy = y - oy, d = Math.hypot(dx, dy), ang = (Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2);
        if (d < R * 1.02) continue;
        const v = band(Math.abs(ang * 2 - 1), now), wave = Math.sin(d / 40 - now / 260) * .5 + .5;
        const rr = Math.max(.6, (v * 7 + wave * lvl * 6) * Math.max(0, 1 - d / Math.max(W, H)) * 1.6);
        cx.beginPath(); cx.arc(x, y, rr, 0, Math.PI * 2);
        cx.fillStyle = col(.15 + Math.min(.75, v + lvl * .6) * wave); cx.fill();
      }
    }
    // the disc breathes with the bass
    disc.style.scale = (1 + lvl * .04).toFixed(3);
  };
  requestAnimationFrame(frame);

  /* =========================================================
     START: a shared link, the last record, or the crate
     ========================================================= */
  const want = new URLSearchParams(location.search).get('r') || DD.store.get('room-last');
  const first = RECS.find((r) => r.slug === want);
  if (first) load(first, false); else setTimeout(() => openCrate(true), 2600);

  /* ---------- loader ---------- */
  const loader = $('#loader');
  const done = () => { body.classList.remove('is-loading'); window.dispatchEvent(new Event('dd:ready')); };
  if (!loader) { done(); body.classList.add('is-in'); }
  else if (!motion) { loader.remove(); done(); body.classList.add('is-in'); }
  else {
    const o = { p: 0 }, pct = $('#ldPct');
    gsap.from('.ld-room', { opacity: 0, filter: 'blur(14px)', duration: 1.4, ease: 'power2.out' });
    gsap.to(o, { p: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') });
    Promise.all([document.fonts ? document.fonts.ready : 0, new Promise((r) => setTimeout(r, 1700))]).then(() => {
      gsap.timeline({ onComplete: () => loader.remove() })
        .to(loader, { opacity: 0, duration: 1.2, ease: 'power2.inOut' })
        .add(() => done(), '-=.8')
        .from('#disc', { scale: .4, rotate: -180, opacity: 0, duration: 1.8, ease: 'expo.out' }, '-=.9')
        .add(() => body.classList.add('is-in'), '-=1.1');
    });
  }
})();
