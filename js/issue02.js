/* =========================================================
   DROP D — issue02.js
   issue 02: inspired by the fear of being average
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$ } = DD;
  const T = DD.data.tracks, P = DD.player;
  const motion = DD.motion;
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg>';
  const EQ = '<span class="eq" aria-hidden="true"><i></i><i></i><i></i></span>';
  const n2 = (i) => DD.pad(i + 1);

  /* =========================================================
     1 · THE CROWD — nine cut-outs scattered like people from above
     ========================================================= */
  const SPOTS = [
    { x: 5, y: 15, w: 1, r: -4 }, { x: 41, y: 9, w: .9, r: 3 }, { x: 63, y: 17, w: 1.05, r: -2 },
    { x: 85, y: 10, w: .85, r: 5 }, { x: 31, y: 41, w: .95, r: 2 }, { x: 4, y: 47, w: .9, r: -6 },
    { x: 52, y: 55, w: 1.1, r: -3 }, { x: 76, y: 66, w: .9, r: 4 }, { x: 33, y: 73, w: .95, r: -2 },
  ];
  const crowd = $('#crowd');
  if (crowd) {
    crowd.innerHTML = T.map((t, i) => {
      const s = SPOTS[i % SPOTS.length];
      return `
      <div class="cut" data-i="${i}" data-cursor="drag · play" style="left:${s.x}%;top:${s.y}%;--w:calc(clamp(78px, 9vw, 150px) * ${s.w});rotate:${s.r}deg">
        <div class="cut__in" style="--dx:${DD.rand(-26, 26).toFixed(0)}px;--dy:${DD.rand(-20, 20).toFixed(0)}px;--d:${DD.rand(5, 9).toFixed(1)}s;--dl:-${DD.rand(0, 6).toFixed(1)}s">
          <i class="tape" style="--tr:${DD.rand(-9, 9).toFixed(0)}deg"></i>
          <span class="slot" data-img="${t.photo}" data-n="${t.artist}" data-alt="${t.artist}"></span>
          <b class="cut__num pix">${n2(i)}</b>
          <svg class="cut__circle" viewBox="0 0 120 150" preserveAspectRatio="none"><path pathLength="1" d="M58 8 C 22 6, 4 42, 7 82 S 38 146, 70 143 S 117 110, 113 68 S 92 6, 46 14" /></svg>
          <p class="cut__cap">${EQ}${t.artist}</p>
        </div>
      </div>`;
    }).join('');
    DD.slots(crowd);

    let top = 10;
    $$('.cut', crowd).forEach((cut) => {
      const i = +cut.dataset.i;
      let down = false, moved = 0, sx = 0, sy = 0, ox = 0, oy = 0, vx = 0, vy = 0, lx = 0, ly = 0, lt = 0;
      const pos = { x: 0, y: 0 };
      cut.addEventListener('pointerdown', (e) => {
        down = true; moved = 0; sx = lx = e.clientX; sy = ly = e.clientY; lt = performance.now();
        pos.x = gsap.getProperty(cut, 'x'); pos.y = gsap.getProperty(cut, 'y'); ox = pos.x; oy = pos.y;
        cut.style.zIndex = ++top; cut.classList.add('is-drag'); cut.setPointerCapture(e.pointerId);
        if (motion) gsap.to(cut, { scale: 1.08, duration: .3, ease: 'power3.out' });
      });
      cut.addEventListener('pointermove', (e) => {
        if (!down) return;
        const now = performance.now(), dt = Math.max(1, now - lt);
        vx = (e.clientX - lx) / dt * 16; vy = (e.clientY - ly) / dt * 16; lx = e.clientX; ly = e.clientY; lt = now;
        moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy));
        pos.x = ox + e.clientX - sx; pos.y = oy + e.clientY - sy;
        gsap.set(cut, { x: pos.x, y: pos.y, rotate: Math.max(-14, Math.min(14, vx * .8)) });
      });
      const up = () => {
        if (!down) return; down = false; cut.classList.remove('is-drag');
        if (moved < 5) { P.play(i); return gsap.to(cut, { scale: 1, duration: .5, ease: 'back.out(2)' }); }
        if (!motion) return;
        gsap.to(cut, { x: pos.x + vx * 12, y: pos.y + vy * 12, rotate: 0, scale: 1, duration: 1.2, ease: 'expo.out' });
      };
      cut.addEventListener('pointerup', up);
      cut.addEventListener('pointercancel', up);
    });
  }

  /* =========================================================
     2 · DOTS — a halftone portrait that rebuilds itself
     ========================================================= */
  const cv = $('#dotsCv'), ctx = cv?.getContext('2d');
  const photos = T.map((t) => { const im = new Image(); im.src = t.photo; return im; });
  let W = 0, H = 0, step = 8, cols = 0, rows = 0, cur, tgt, mode = 'size', sel = 0, fade = 1, mouse = { x: -999, y: -999 };
  const off = document.createElement('canvas'), octx = off.getContext('2d', { willReadFrequently: true });

  const sizeCanvas = () => {
    if (!cv) return;
    const r = cv.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    step = W < 600 ? 6 : 8;
    cols = Math.ceil(W / step); rows = Math.ceil(H / step);
    cur = new Float32Array(cols * rows); tgt = new Float32Array(cols * rows);
    target(sel);
  };
  // the dot sizes for artist i: from the photo's darkness, or from their name if the photo isn't there
  const target = (i) => {
    if (!cols) return;
    off.width = cols; off.height = rows;
    octx.clearRect(0, 0, cols, rows);
    const im = photos[i];
    let fromPhoto = im.complete && im.naturalWidth > 0;
    if (fromPhoto) {
      const s = Math.max(cols / im.naturalWidth, rows / im.naturalHeight);
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      octx.fillStyle = '#fff'; octx.fillRect(0, 0, cols, rows);
      octx.drawImage(im, (cols - dw) / 2, (rows - dh) * .3, dw, dh);
    } else {
      octx.fillStyle = '#fff'; octx.fillRect(0, 0, cols, rows);
      octx.fillStyle = '#000'; octx.textAlign = 'center'; octx.textBaseline = 'middle';
      const name = T[i].artist.toUpperCase();
      let fs = rows * .8; octx.font = `${fs}px Anton, Impact, sans-serif`;
      while (octx.measureText(name).width > cols * .92 && fs > 6) { fs -= 1; octx.font = `${fs}px Anton, Impact, sans-serif`; }
      octx.fillText(name, cols / 2, rows * .58);
    }
    try {
      const d = octx.getImageData(0, 0, cols, rows).data;
      for (let k = 0; k < cols * rows; k++) {
        const lum = (d[k * 4] * .3 + d[k * 4 + 1] * .59 + d[k * 4 + 2] * .11) / 255;
        tgt[k] = Math.pow(1 - lum, 1.15) * step * .62;
      }
      mode = 'size';
    } catch (e) {
      // file:// won't let us read pixels: fall back to a dot-masked photo
      mode = 'mask'; fade = 0;
    }
  };
  const drawDots = () => {
    if (!ctx || !W) return;
    ctx.clearRect(0, 0, W, H);
    if (mode === 'mask') {
      fade = Math.min(1, fade + .04);
      const im = photos[sel];
      ctx.save();
      ctx.beginPath();
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const cx = x * step + step / 2, cy = y * step + step / 2;
        const dm = Math.hypot(cx - mouse.x, cy - mouse.y);
        const r = step * .42 * (dm < 90 ? dm / 90 : 1);
        ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      }
      ctx.clip();
      ctx.globalAlpha = fade;
      ctx.filter = 'grayscale(1) contrast(1.3)';
      const s = Math.max(W / im.naturalWidth, H / im.naturalHeight), dw = im.naturalWidth * s, dh = im.naturalHeight * s;
      if (im.naturalWidth) ctx.drawImage(im, (W - dw) / 2, (H - dh) * .3, dw, dh);
      ctx.restore();
      return;
    }
    const pink = document.documentElement.classList.contains('drop-c') ? '#c4001b' : '#ec5f9e';
    ctx.fillStyle = '#0b0b0b';
    ctx.beginPath();
    const hot = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const k = y * cols + x;
      cur[k] += (tgt[k] - cur[k]) * .09;
      const cx = x * step + step / 2, cy = y * step + step / 2;
      const dm = Math.hypot(cx - mouse.x, cy - mouse.y);
      let r = cur[k];
      if (dm < 110) { r *= .35 + .65 * (dm / 110); if (r > 1.2) hot.push([cx, cy, r]); continue; }
      if (r < .35) continue;
      ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    }
    ctx.fill();
    if (hot.length) {
      ctx.fillStyle = pink; ctx.beginPath();
      hot.forEach(([cx, cy, r]) => { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, Math.PI * 2); });
      ctx.fill();
    }
  };
  if (cv) {
    sizeCanvas();
    addEventListener('resize', () => { clearTimeout(cv._t); cv._t = setTimeout(sizeCanvas, 150); });
    photos.forEach((im, i) => im.addEventListener('load', () => { if (i === sel) target(sel); }));
    document.fonts?.ready.then(() => target(sel));
    const stage = $('.dots__stage');
    stage.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    stage.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    // only draw while the section is on screen
    let vis = false;
    new IntersectionObserver(([en]) => (vis = en.isIntersecting)).observe(stage);
    const loop = () => { if (vis) drawDots(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  // the boxed list (01. violent vira …)
  const list = $('#dotsList');
  const OFFS = ['0%', '22%', '8%', '30%', '14%', '36%', '4%', '26%', '12%'];
  if (list) {
    list.innerHTML = T.map((t, i) => `<li style="--x:${OFFS[i % OFFS.length]}" data-i="${i}"><button data-cursor="play"><span>${n2(i)}.</span>${t.artist}</button></li>`).join('');
  }
  const select = (i) => {
    if (i === sel && $('#dotsBio').textContent !== '—') return;
    sel = i; const t = T[i];
    target(i); if (mode === 'mask') fade = 0;
    const name = $('#dotsName');
    name.textContent = t.artist;
    if (motion) gsap.fromTo(name, { clipPath: 'inset(-20% 100% -40% -5%)' }, { clipPath: 'inset(-20% -5% -40% -5%)', duration: 1.1, ease: 'power2.inOut' });
    $('#dotsFrom').textContent = `${n2(i)} · ${t.from} · ${t.genre}`;
    $('#dotsBio').textContent = t.bio;
    $('#dotsFfo').textContent = t.ffo;
    $('#dotsPlay').dataset.play = i;
    const df = $('#dotsFile'); if (df) { df.href = DD.artistUrl(t.artist); df.textContent = `the ${t.artist.toLowerCase()} file →`; }
    $$('#dotsList li').forEach((li) => li.classList.toggle('is-on', +li.dataset.i === i));
  };
  $$('#dotsList li').forEach((li) => {
    const i = +li.dataset.i;
    li.addEventListener('mouseenter', () => select(i));
    li.addEventListener('click', () => { select(i); P.play(i); });
  });
  select(0);

  /* =========================================================
     4 · SETLIST — songs get crossed out once you've really listened
     ========================================================= */
  const setRows = $('#setRows');
  const played = new Set(DD.store.json('issue02-played', []));
  if (setRows) {
    setRows.innerHTML = T.map((t, i) => `
      <li data-play="${i}" class="${played.has(i) ? 'is-done' : ''}" data-cursor="play">
        <span class="sl__n">${i + 1}.</span>
        <span class="sl__t">${t.title.replace(/ \(.*\)/, '')}</span>
        <span class="sl__m"><a href="${DD.artistUrl(t.artist)}" class="to-artist">${t.artist}</a> · ${t.time}</span>
        <svg class="sl__strike" viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 12 C 80 5, 160 17, 240 9 S 360 15, 398 7" /></svg>
      </li>`).join('');
  }
  const cross = (i) => {
    if (played.has(i)) return;
    played.add(i); DD.store.set('issue02-played', JSON.stringify([...played]));
    $(`#setRows li[data-play="${i}"]`)?.classList.add('is-done');
    if (played.size === T.length) DD.toast('the whole set, crossed out. you were there. ♥');
  };
  window.addEventListener('dd:time', (e) => { if (P.isPlaying() && (e.detail.cur > 30 || e.detail.p > .6)) cross(P.index()); });
  $('#setReset')?.addEventListener('click', (e) => {
    e.stopPropagation(); played.clear(); DD.store.set('issue02-played', '[]');
    $$('#setRows li').forEach((li) => li.classList.remove('is-done'));
    DD.toast('fresh setlist. the show starts again.');
  });

  // back-to-issue-01 ticker: everybody you already know
  const nt = $('#nextTrack');
  if (nt) {
    const names = [...new Set(DD.data.home.map((t) => t.artist.toUpperCase()))];
    const row = names.map((n) => `<span>${n}</span><i>✦</i>`).join('');
    nt.innerHTML = row + row;
  }
  DD.mag();

  /* ---------- who's on the deck ---------- */
  const mark = () => {
    const i = P.index(), on = P.isPlaying();
    $$('.cut').forEach((c) => c.classList.toggle('is-on', on && +c.dataset.i === i));
    $$('#setRows li').forEach((li) => li.classList.toggle('is-on', +li.dataset.play === i));
    $$('#dotsList li').forEach((li) => li.classList.toggle('is-playing', on && +li.dataset.i === i));
  };
  window.addEventListener('dd:track', (e) => { mark(); select(e.detail.i); });
  window.addEventListener('dd:state', mark);
  mark();

  /* =========================================================
     3 · BLACK NO. 1 — the counter runs with the scroll, or with the song
     ========================================================= */
  const LONG = 3, LEN = DD.secs(T[LONG].time);
  const count = $('#blackCount'), ring = $('#blackRing'), vinyl = $('#blackVinyl');
  DD.setSlot($('#blackLabel'), T[LONG].cover, n2(LONG));
  let scrollP = 0, songP = -1;
  const paintBlack = () => {
    const live = P.index() === LONG && (P.isPlaying() || P.cur() > 0);
    const p = live ? songP : scrollP;
    const secs = live ? P.cur() : p * LEN;
    if (count) count.textContent = DD.fmt(secs);
    if (ring) ring.style.strokeDashoffset = (301.6 * (1 - Math.max(0, Math.min(1, p)))).toFixed(2);
    if (vinyl) vinyl.style.transform = `rotate(${live ? DD.spin.angle : p * 900}deg)`;
  };
  window.addEventListener('dd:time', (e) => { if (P.index() === LONG) songP = e.detail.p; });
  const blackOn = DD.visible($('.black'));
  const tickBlack = () => { if (blackOn.on) paintBlack(); };
  if (window.gsap) gsap.ticker.add(tickBlack); else setInterval(tickBlack, 50);

  /* =========================================================
     2 · THE MAW CALLS — a desktop left open at 2:59 am
     ========================================================= */
  const desk = $('#desk');
  const wide = matchMedia('(min-width: 1001px)');
  if (desk) {
    // the two windows + the photo stack
    const setWin = (n, i) => {
      DD.setSlot($(`#win${n}Img`), T[i].photo, T[i].artist);
      $(`#win${n}Title`).textContent = `${T[i].artist.toLowerCase()} — oct 19th, 2026 at ${n === 1 ? '2:59:07' : '3:03:22'} am`;
      $(`[data-win="${n}"]`).dataset.i = i;
    };
    setWin(1, 1); setWin(2, 3);
    $$('.win').forEach((w) => {
      w.addEventListener('dblclick', () => P.play(+w.dataset.i));
      $$('.win__top i', w)[0].addEventListener('click', (e) => { e.stopPropagation(); DD.toast('you can\'t close it. it\'s 2:59 am.'); });
    });
    const stack = $('#deskStack');
    let order = [4, 0, 8];
    const paintStack = () => {
      stack.innerHTML = order.map((i, k) => `<span class="slot" data-img="${T[i].photo}" data-n="${T[i].artist}" style="z-index:${3 - k};transform:rotate(${[4, -6, 9][k]}deg) translate(${k * 8}px, ${k * 6}px)"></span>`).join('');
      DD.slots(stack);
    };
    paintStack();
    stack.addEventListener('click', () => {
      const top = $('.slot', stack);
      const next = () => { order.push(order.shift()); paintStack(); };
      if (motion) gsap.to(top, { x: 160, rotate: 25, opacity: 0, duration: .45, ease: 'power2.in', onComplete: next }); else next();
    });
    stack.addEventListener('dblclick', () => P.play(order[0]));

    // drag anything with data-drag (only where it's a real desktop)
    let z = 10;
    $$('[data-drag]', desk).forEach((el) => {
      let on = false, sx = 0, sy = 0, ox = 0, oy = 0;
      el.addEventListener('pointerdown', (e) => {
        el.style.zIndex = ++z;
        if (!wide.matches || e.target.closest('button, input')) return;
        on = true; sx = e.clientX; sy = e.clientY; ox = gsap.getProperty(el, 'x'); oy = gsap.getProperty(el, 'y');
        el.classList.add('is-drag'); el.setPointerCapture(e.pointerId);
      });
      el.addEventListener('pointermove', (e) => { if (on) gsap.set(el, { x: ox + e.clientX - sx, y: oy + e.clientY - sy }); });
      const up = () => { on = false; el.classList.remove('is-drag'); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });

    // emoji toolbar: reactions float up
    $$('[data-emo]').forEach((b) => b.addEventListener('click', () => {
      for (let k = 0; k < 7; k++) {
        const f = document.createElement('span');
        f.textContent = b.dataset.emo; f.style.cssText = `position:fixed;z-index:120;pointer-events:none;font-size:${DD.rand(18, 34)}px;left:${b.getBoundingClientRect().left}px;top:${b.getBoundingClientRect().top}px`;
        document.body.append(f);
        gsap.to(f, { x: DD.rand(-120, 120), y: DD.rand(-260, -120), rotate: DD.rand(-90, 90), opacity: 0, duration: DD.rand(1.2, 2), ease: 'power2.out', onComplete: () => f.remove() });
      }
      DD.toast({ '🎱': 'the 8-ball says: play pantera.', '💀': 'type o negative approves.', '🦴': 'babyteeth\'s favourite snack.', '♥': 'sent to the sad girl gang.', '🎵': 'louder.', '+': 'more reactions in issue 03.' }[b.dataset.emo]);
    }));

    // volume hud = the real mute
    const hud = $('#deskHud');
    const paintHud = () => { const m = $('.vol')?.classList.contains('is-muted'); hud.classList.toggle('is-muted', !!m); $('#deskHudTxt').textContent = m ? 'ミュート' : 'オン'; };
    hud.addEventListener('click', () => { $('#muteBtn')?.click(); paintHud(); });
    paintHud();

    // notifications from the artists
    const MSG = ['i don\'t care. (listen anyway)', 'your face is stuck on repeat again', 'walk.', 'it\'s friday. got the black dye?', 'sad girl gang meets at the cemetery', 'lit up. no further questions.', 'ninety seconds. you have time.', 'obsessixn (the typo is on purpose)', 'heaven\'s a lie. milan says hi'];
    const notes = $('#deskNotes');
    let ni = 0, minute = 59, noteT;
    const push = () => {
      const i = [3, 4, 1, 6, 2, 8, 0, 5, 7][ni++ % 9];
      const li = document.createElement('li');
      li.className = 'note glass'; li.dataset.play = i; li.dataset.cursor = 'reply';
      li.innerHTML = `<span class="slot slot--mini" data-img="${T[i].photo}" data-n="${n2(i)}"></span><span><b>${T[i].artist.toLowerCase()}</b><small>${MSG[i]}</small></span><span class="note__t">${minute > 59 ? 3 : 2}:${DD.pad(minute++ % 60)} am</span>`;
      notes.prepend(li); DD.slots(li);
      if (motion) gsap.from(li, { y: -30, opacity: 0, scale: .9, duration: .6, ease: 'back.out(2)' });
      const all = $$('.note', notes);
      if (all.length > 4) { const old = all[all.length - 1]; motion ? gsap.to(old, { opacity: 0, x: 40, duration: .3, onComplete: () => old.remove() }) : old.remove(); }
    };
    new IntersectionObserver(([en]) => {
      clearInterval(noteT);
      if (en.isIntersecting) { if (!notes.children.length) push(); noteT = setInterval(push, 2600); }
    }, { threshold: .25 }).observe(desk);

    // the music widget mirrors the deck
    const paintW = () => { const t = P.track(); $('#wTitle').textContent = t.title; $('#wArtist').textContent = t.artist; DD.setSlot($('#wCover'), t.cover, n2(P.index())); };
    window.addEventListener('dd:track', paintW); paintW();
    window.addEventListener('dd:time', (e) => { $('#wProg').style.transform = `scaleX(${e.detail.p})`; $('#wTime').textContent = DD.fmt(e.detail.cur); });

    // brightness
    const br = $('#deskBright');
    br?.addEventListener('input', () => { desk.style.filter = `brightness(${br.value / 100})`; br.nextElementSibling.style.setProperty('--b', ((br.value - 40) / 90 * 100) + '%'); });

    // search
    const ds = $('#deskSearch');
    ds?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const q = ds.value.trim().toLowerCase(); if (!q) return;
      const i = T.findIndex((t) => (t.artist + ' ' + t.title + ' ' + t.album + ' ' + t.genre).toLowerCase().includes(q));
      if (i > -1) { P.play(i); DD.toast(`found it: ${T[i].artist} — ${T[i].title}`); } else DD.toast('not in this issue. maybe issue 03.');
      ds.blur();
    });

    // slide to unlock the record
    const knob = $('#unlockKnob'), track = $('#unlock');
    if (knob) {
      let on = false, sx = 0, max = 0;
      knob.addEventListener('pointerdown', (e) => { on = true; sx = e.clientX - gsap.getProperty(knob, 'x'); max = track.clientWidth - knob.offsetWidth - 10; knob.setPointerCapture(e.pointerId); });
      knob.addEventListener('pointermove', (e) => { if (on) gsap.set(knob, { x: Math.max(0, Math.min(max, e.clientX - sx)) }); });
      const up = () => {
        if (!on) return; on = false;
        if (gsap.getProperty(knob, 'x') > max * .85) { P.play(sel); DD.toast(`unlocked: ${T[sel].artist} — ${T[sel].title}`); }
        gsap.to(knob, { x: 0, duration: .6, ease: 'elastic.out(1, .5)' });
      };
      knob.addEventListener('pointerup', up); knob.addEventListener('pointercancel', up);
    }
  }

  /* =========================================================
     4 · SPREADS — nine artist pages, sideways
     ========================================================= */
  const spTrack = $('#spreadsTrack');
  const THEMES = ['paper', 'ink', 'pink', 'grey'];
  if (spTrack) {
    spTrack.innerHTML = T.map((t, i) => `
      <article class="sp sp--${THEMES[i % THEMES.length]}" data-i="${i}">
        <div class="sp__rec"><div class="sp__vinyl"><span class="sp__label slot" data-img="${t.cover}" data-n="${n2(i)}"></span><i class="sp__hole"></i></div></div>
        <div class="sp__copy">
          <p class="sp__k">${n2(i)} / ${n2(T.length - 1)} · ${t.from}</p>
          <h3 class="sp__name">${t.artist.split(' ').map((w) => `<span>${w}</span>`).join('')}</h3>
          <p class="sp__genre">${t.genre}${t.year ? ' · ' + t.year : ''}</p>
          <div class="sp__pop"><span class="kicker">popular in this issue</span>
            <div class="sp__row" data-play="${i}"><span class="pix">01</span><span class="slot slot--mini" data-img="${t.cover}" data-n="${n2(i)}"></span><span><b>${t.title}</b><small>${t.album}</small></span><span class="pix">${t.time}</span><span class="sp__go">${PLAY}</span></div>
          </div>
          <p class="sp__bio">${t.bio}</p>
          <p class="sp__ffo"><span class="pix">for fans of</span>${t.ffo}</p>
          <a class="sp__file" href="${DD.artistUrl(t.artist)}" data-cursor="artist file">open the ${t.artist.toLowerCase()} file →</a>
        </div>
        <p class="sp__n" aria-hidden="true">${n2(i)}</p>
      </article>`).join('');
    DD.slots(spTrack);
  }

  /* =========================================================
     5 · WAVELENGTH — a blurred waveform that wakes up with the music
     ========================================================= */
  const wcv = $('#waveCv'), wctx = wcv?.getContext('2d');
  if (wcv) {
    let ww = 0, wh = 0, vis = false;
    const size = () => { const r = wcv.getBoundingClientRect(), d = .35; ww = r.width; wh = r.height; wcv.width = Math.max(1, ww * d); wcv.height = Math.max(1, wh * d); wctx.setTransform(d, 0, 0, d, 0, 0); };
    size(); addEventListener('resize', size);
    new IntersectionObserver(([en]) => (vis = en.isIntersecting)).observe(wcv);
    const N = 110, amp = new Float32Array(N);
    let wf = false;
    const draw = (now) => {
      requestAnimationFrame(draw);
      if (!vis || !ww || (wf = !wf)) return;
      const playing = P.isPlaying(), bands = DD.bands || [];
      wctx.clearRect(0, 0, ww, wh);
      const bw = ww / N;
      for (let k = 0; k < N; k++) {
        const x = k / N;
        const env = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, (x - .04) / .5))), 1.4) * (x < .55 ? 1 : .25);
        const b = playing ? (bands[(k * 3) % (bands.length || 1)] || 0) : .25 + .2 * Math.sin(now / 900 + k * .3);
        const tgt = env * (.25 + b * .9) * (.75 + .25 * Math.sin(k * 1.7 + now / 300));
        amp[k] += (tgt - amp[k]) * .15;
        const h = amp[k] * wh * .42;
        wctx.fillStyle = x < .3 ? 'rgba(255,255,255,.9)' : x < .45 ? 'rgba(255,190,140,.9)' : 'rgba(160,200,255,.85)';
        wctx.fillRect(k * bw, wh / 2 - h, bw * .7, h * 2);
        wctx.fillStyle = 'rgba(255,255,255,.35)';
        wctx.fillRect(k * bw, wh / 2 - h * 1.35, bw * .7, h * 2.7);
      }
    };
    requestAnimationFrame(draw);
    const wn = () => { const t = P.track(); $('#waveNow').textContent = `${P.isPlaying() ? 'now: ' : 'paused: '}${t.artist} — ${t.title}`; };
    window.addEventListener('dd:track', wn); window.addEventListener('dd:state', wn); wn();
  }

  /* =========================================================
     7 · TICKET — a qr made of the issue's own noise
     ========================================================= */
  const qr = $('#cardQr');
  if (qr) {
    const n = 25, r = DD.seeded(2026), cells = [];
    const finder = (x, y) => { for (let a = 0; a < 7; a++) for (let b = 0; b < 7; b++) { const edge = a === 0 || a === 6 || b === 0 || b === 6, core = a > 1 && a < 5 && b > 1 && b < 5; if (edge || core) cells.push([x + a, y + b]); } };
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
      if (!inF && r() > .52) cells.push([x, y]);
    }
    qr.innerHTML = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" style="width:100%;height:100%;display:block;stroke:none">${cells.map(([x, y]) => `<rect x="${x}" y="${y}" width="1" height="1" fill="#0b0b0b"/>`).join('')}</svg>`;
  }
  const tc = $('#ticketCards');
  tc?.addEventListener('pointermove', (e) => {
    if (!motion) return;
    const b = tc.getBoundingClientRect();
    gsap.to('.card', { rotateY: ((e.clientX - b.left) / b.width - .5) * 14, rotateX: -((e.clientY - b.top) / b.height - .5) * 10, duration: .8, ease: 'power3.out' });
  });
  tc?.addEventListener('pointerleave', () => motion && gsap.to('.card', { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, .5)' }));

  /* =========================================================
     LOADER — issue 02 comes off the printer
     ========================================================= */
  const loader = $('#loader');
  const finish = () => { document.body.classList.remove('is-loading'); window.dispatchEvent(new Event('dd:ready')); };
  if (!loader) finish();
  else if (!motion) { loader.remove(); finish(); }
  else {
    const o = { p: 0 }, pct = $('#ldPct');
    const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
    gsap.from('.ld-02 span', { yPercent: 100, opacity: 0, duration: 1.1, stagger: .12, ease: 'expo.out' });
    gsap.from(['.ld-top', '.ld-line', '.ld-foot'], { opacity: 0, y: 12, duration: .9, stagger: .08, ease: 'expo.out', delay: .2 });
    const cnt = gsap.to(o, { p: 86, duration: 1.6, ease: 'power2.inOut', onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') });
    Promise.all([loaded, document.fonts ? document.fonts.ready : 0, new Promise((r) => setTimeout(r, 1700))]).then(() => {
      cnt.kill();
      DD.scramble($('#ldLine'), 'nobody asked. here they are.', 500);
      gsap.timeline({ onComplete: () => loader.remove() })
        .to(o, { p: 100, duration: .4, onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') })
        .to('.ld-02 span', { rotate: (k) => (k ? 12 : -12), yPercent: 20, duration: .4, ease: 'power2.in' }, '+=.2')
        .to('.ld-02 span', { yPercent: 160, opacity: 0, duration: .6, stagger: .05, ease: 'power3.in' })
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=.3')
        .add(() => { finish(); intro(); }, '-=.6');
    });
  }

  const intro = () => {
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hdr > *', { y: -20, opacity: 0, duration: 1, stagger: .06 })
      .from('.cut', { y: () => -innerHeight * DD.rand(.6, 1.1), rotate: () => DD.rand(-60, 60), opacity: 0, duration: 1.6, stagger: { each: .07, from: 'random' }, ease: 'bounce.out' }, '<.1')
      .from('.fear__w', { y: 40, opacity: 0, duration: 1.2, stagger: .18 }, '<.5')
      .from(['.fear__k', '.fear__hint'], { opacity: 0, duration: 1 }, '<.3')
      .from('.bar', { y: 120, opacity: 0, duration: 1.2 }, '<');
  };

  /* =========================================================
     SCROLL SCENES
     ========================================================= */
  DD.ready.then(() => {
    if (!motion) return;
    const scrub = (target, vars, trigger, start = 'top bottom', end = 'bottom top') =>
      gsap.to(target, { ...vars, ease: 'none', scrollTrigger: { trigger: trigger || target, start, end, scrub: true } });

    // the crowd disperses as you leave
    $$('.cut__in').forEach((c, k) => scrub(c, { yPercent: (k % 3 - 1) * 60 - 40, xPercent: (k % 2 ? 1 : -1) * 30 }, '.fear', 'top top'));
    scrub('.fear__w--1', { yPercent: -60 }, '.fear', 'top top');
    scrub('.fear__w--3', { yPercent: 40 }, '.fear', 'top top');
    // the camera flies up: the crossing and the crowd get smaller
    scrub('.fear__zebra', { scale: .7, yPercent: 30 }, '.fear', 'top top');
    // the setlist lands on the floor and the tape gets pressed down
    gsap.from('.setlist', { y: -140, rotate: 8, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.stage', start: 'top 70%' } });
    gsap.from('.setlist .tape', { scaleX: 0, duration: .6, stagger: .15, ease: 'back.out(2)', delay: .7, scrollTrigger: { trigger: '.stage', start: 'top 70%' } });
    gsap.from('#setRows li', { x: -30, opacity: 0, duration: .8, stagger: .06, ease: 'expo.out', delay: .9, scrollTrigger: { trigger: '.stage', start: 'top 70%' } });

    // dots: the boxes join the line one by one
    gsap.from('#dotsList li', { x: 60, opacity: 0, duration: 1, stagger: .07, ease: 'expo.out', scrollTrigger: { trigger: '#dotsList', start: 'top 80%' } });
    gsap.from('.dots__line span', { yPercent: 100, opacity: 0, duration: 1.2, stagger: .12, ease: 'expo.out', scrollTrigger: { trigger: '.dots', start: 'top 70%' } });

    // black no. 1: pinned — scrolling plays through all eleven minutes
    ScrollTrigger.create({
      trigger: '.black', start: 'top top', end: '+=140%', pin: '.black__pin', scrub: true,
      onUpdate: (st) => { scrollP = st.progress; },
    });
    gsap.from('.black__rec', { scale: .6, rotate: -90, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.black', start: 'top 70%' } });
    gsap.from('.black__count', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.black', start: 'top 70%' } });

    // desktop: windows and widgets land one by one
    gsap.from('.desk .win, .desk__stack, .desk__hud, .widget, .desk__bar, .desk__search, .unlock, .desk__bright', { y: 80, scale: .9, opacity: 0, duration: 1.1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.desk', start: 'top 70%' } });

    // spreads: pinned and sideways on a real screen, vinyls turn as you go
    const spT = $('#spreadsTrack');
    const vin = $$('.sp__vinyl'), sps = $$('.sp');
    ScrollTrigger.matchMedia({
      '(min-width: 1001px)': () => {
        const dist = () => spT.scrollWidth - innerWidth;
        gsap.to(spT, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: {
            trigger: '.spreads', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, invalidateOnRefresh: true,
            onUpdate: (st) => {
              vin.forEach((v, k) => (v.style.transform = `rotate(${(st.progress * 1440 + k * 40).toFixed(1)}deg)`));
              const a = Math.round(st.progress * (sps.length - 1));
              sps.forEach((p, k) => p.classList.toggle('is-on', k === a));
            },
          },
        });
      },
      '(max-width: 1000px)': () => {
        vin.forEach((v) => gsap.fromTo(v, { rotate: 0 }, { rotate: 540, ease: 'none', scrollTrigger: { trigger: v.closest('.sp'), start: 'top bottom', end: 'bottom top', scrub: true } }));
      },
    });

    // wavelength: the card slides up out of the blur
    gsap.from('.wave__card', { y: 120, filter: 'blur(20px)', opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.wave', start: 'top 75%' } });

    // ticket: the graffiti tag draws itself, the cards deal in
    gsap.to('.card__tag text', { strokeDashoffset: 0, duration: 3.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.ticket', start: 'top 70%' } });
    gsap.from('.card', { y: 140, rotate: (k) => (k ? 8 : -6), opacity: 0, duration: 1.3, stagger: .15, ease: 'expo.out', scrollTrigger: { trigger: '.ticket', start: 'top 75%' } });

    // issue 01 ticker
    const nx = gsap.to('#nextTrack', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
    $('.next__band')?.addEventListener('mouseenter', () => gsap.to(nx, { timeScale: .2, duration: .6 }));
    $('.next__band')?.addEventListener('mouseleave', () => gsap.to(nx, { timeScale: 1, duration: .6 }));
    scrub('.ft__big', { yPercent: -10, letterSpacing: '.03em' }, '.ft', 'top bottom', 'bottom bottom');
    ScrollTrigger.sort();
    setTimeout(() => { ScrollTrigger.sort(); ScrollTrigger.refresh(); }, 500);
  });
})();
