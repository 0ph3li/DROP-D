/* =========================================================
   DROP D — main.js (shared engine, every page)
   heavy music, soft paper
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = (window.DD = {});
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  DD.$ = $; DD.$$ = $$;
  DD.data = window.DD_DATA || { tracks: [] };
  DD.page = document.body.dataset.page || 'home';
  DD.data.home = DD.data.tracks;
  // every issue spins its own crate
  if (DD.page === 'issue02' && DD.data.issue02) DD.data.tracks = DD.data.issue02;
  // the mixtape page plays from both crates
  if (['mixtape', 'artist', 'tuning', 'room', 'profile'].includes(DD.page)) DD.data.tracks = [...DD.data.home.map((t) => ({ ...t, issue: '01' })), ...(DD.data.issue02 || []).map((t) => ({ ...t, issue: '02' })), ...(DD.data.issue03 || []).map((t) => ({ ...t, issue: '03' }))];
  DD.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  DD.fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  DD.hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  DD.motion = DD.hasGsap && !DD.reduced;
  document.documentElement.classList.toggle('motion', DD.motion);
  // every artist has a page: artist.html?a=<slug>
  DD.slug = (name) => String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  DD.artistUrl = (name) => `artist.html?a=${DD.slug(name)}`;
  DD.rand = (a, b) => a + Math.random() * (b - a);
  DD.pad = (n, l = 2) => String(n).padStart(l, '0');
  DD.fmt = (s) => (isFinite(s) && s > 0 ? `${Math.floor(s / 60)}:${DD.pad(Math.floor(s % 60))}` : '0:00');
  DD.secs = (t) => { const [m, s] = String(t).split(':').map(Number); return m * 60 + (s || 0); };
  // a tiny seeded random, so every song keeps its own waveform
  DD.seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // storage that never throws
  DD.store = {
    get(k) { try { return localStorage.getItem('dd-' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('dd-' + k, v); } catch (e) {} },
    json(k, fb) { try { return JSON.parse(localStorage.getItem('dd-' + k)) ?? fb; } catch (e) { return fb; } },
  };

  if (DD.hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  if (window.Lenis && !DD.reduced) {
    DD.lenis = new Lenis({ lerp: .1, smoothWheel: true });
    if (DD.hasGsap) {
      DD.lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => DD.lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { DD.lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  DD.scrollTo = (target) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (DD.lenis) DD.lenis.scrollTo(el ?? 0, { duration: 1.8 });
    else (el || document.body).scrollIntoView({ behavior: 'smooth' });
  };
  DD.lock = (on) => { if (DD.lenis) on ? DD.lenis.stop() : DD.lenis.start(); };

  /* ---------- toast: a sticky note ---------- */
  const toastEl = $('#toast');
  let toastT;
  DD.toast = (msg, ms = 3200) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('is-on'); void toastEl.offsetWidth;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  };
  document.addEventListener('click', (e) => { const t = e.target.closest('[data-toast]'); if (t) DD.toast(t.dataset.toast); });

  /* ---------- image slots: drop a file at data-img and it shows up ---------- */
  DD.slot = (slot) => {
    if (slot.dataset.ratio) slot.style.setProperty('--ratio', slot.dataset.ratio.replace('/', ' / '));
    if (slot.dataset.label && !$('.slot-label', slot)) {
      const [file, ...rest] = slot.dataset.label.split(' · ');
      const lab = document.createElement('span');
      lab.className = 'slot-label';
      lab.innerHTML = `${file}<small>${rest.join(' · ')}</small>`;
      slot.append(lab);
    }
    const src = slot.dataset.img; if (!src || slot.dataset.loaded === src) return;
    slot.dataset.loaded = src;
    $(':scope > img', slot)?.remove();
    slot.classList.remove('has-img');
    const img = new Image();
    img.decoding = 'async'; img.draggable = false;
    img.alt = slot.dataset.alt || '';
    if (slot.dataset.pos) img.style.objectPosition = slot.dataset.pos;
    img.onload = () => {
      if (slot.dataset.img !== src) return;
      slot.prepend(img);
      slot.classList.add('has-img');
      slot.dispatchEvent(new CustomEvent('slot:loaded', { detail: { img } }));
      if (DD.hasGsap) ScrollTrigger.refresh();
    };
    img.src = src;
  };
  DD.setSlot = (slot, src, n = '') => {
    if (!slot) return;
    slot.dataset.img = src || '';
    if (n !== '') slot.dataset.n = n;
    if (src) DD.slot(slot);
  };
  DD.slots = (root = document) => $$('.slot', root).forEach(DD.slot);
  DD.slots();
  DD.onSlot = (slot, fn) => {
    if (!slot) return;
    const img = slot.querySelector(':scope > img');
    if (slot.classList.contains('has-img') && img) fn(img);
    else slot.addEventListener('slot:loaded', (e) => fn(e.detail.img), { once: true });
  };

  /* ---------- on screen? (so per-frame work only runs when it can be seen) ---------- */
  DD.visible = (el) => {
    const o = { on: false };
    if (el && 'IntersectionObserver' in window) new IntersectionObserver(([en]) => (o.on = en.isIntersecting), { rootMargin: '100px' }).observe(el);
    else o.on = true;
    return o;
  };

  /* ---------- split ---------- */
  DD.split = (el) => {
    if (el.dataset.splitDone) return $$('.w > i', el);
    el.dataset.splitDone = '1';
    el.innerHTML = el.innerHTML.trim().split(/\s+(?![^<]*>)/).map((w) => `<span class="w"><i>${w}</i></span>`).join(' ');
    return $$('.w > i', el);
  };

  /* ---------- reveals (on the home they wait for the loader) ---------- */
  DD.ready = new Promise((res) => {
    if (!$('#loader')) res();
    else window.addEventListener('dd:ready', res, { once: true });
  });
  if (DD.motion) {
    DD.ready.then(() => {
      $$('[data-split]').forEach((el) => {
        const words = DD.split(el);
        gsap.fromTo(words, { yPercent: 115 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: el, start: 'top 90%' } });
      });
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 92%',
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: .07 }),
      });
    });
  }

  /* ---------- scramble: letters run through the strings first ---------- */
  const GLYPHS = 'DADGBE#♭×/';
  DD.scramble = (el, to = el.dataset.text || el.textContent, dur = 700) => {
    if (!el) return;
    el.dataset.text = to;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const n = Math.floor(p * to.length);
      el.textContent = to.slice(0, n) + [...to.slice(n)].map((c) => (c === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join('');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  $$('[data-scramble]').forEach((a) => {
    const t = a.querySelector('span') || a;
    a.addEventListener('mouseenter', () => DD.scramble(t, t.dataset.text || t.textContent, 420));
  });
  if (DD.motion) DD.ready.then(() => $$('.kicker[data-kick]').forEach((k) => ScrollTrigger.create({ trigger: k, start: 'top 92%', once: true, onEnter: () => DD.scramble(k, k.textContent, 900) })));

  /* ---------- count-up numbers ---------- */
  DD.count = (el) => {
    const to = +el.dataset.count;
    if (!DD.motion) { el.textContent = to; return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.8, ease: 'expo.out', onUpdate: () => (el.textContent = Math.round(o.v)) });
  };
  DD.ready.then(() => $$('[data-count]').forEach((el) => {
    if (DD.hasGsap) ScrollTrigger.create({ trigger: el, start: 'top 95%', once: true, onEnter: () => DD.count(el) });
    else DD.count(el);
  }));

  /* ---------- cursor: a guitar pick, a halftone trail, a sticky-note label ---------- */
  const cursor = $('#cursor');
  DD.cursorLabel = (t = '') => { const l = $('#cursorLabel'); if (l) l.textContent = t; };
  if (cursor && DD.fine && !DD.reduced) {
    document.documentElement.classList.add('has-cursor');
    const pick = $('.cursor__pick', cursor), tag = $('.cursor__tag', cursor), trail = $$('.cursor__trail', cursor);
    let tx = innerWidth / 2, ty = innerHeight / 2, px = tx, py = ty, vx = 0;
    const pts = trail.map((el, k) => { el.style.setProperty('--s', (9 - k * 1.2).toFixed(1) + 'px'); el.style.setProperty('--o', (.7 - k * .1).toFixed(2)); return { x: tx, y: ty, el }; });
    addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    let still = 0;
    const loop = () => {
      requestAnimationFrame(loop);
      if (Math.abs(tx - px) < .1 && Math.abs(ty - py) < .1 && Math.abs(pts[pts.length - 1].x - px) < .1 && Math.abs(pts[pts.length - 1].y - py) < .1) { if (++still > 2) return; } else still = 0;
      vx += ((tx - px) - vx) * .3; px = tx; py = ty; // the pick sits exactly on the pointer, only the dots lag
      pick.style.transform = `translate3d(${px}px,${py}px,0)`;
      pick.style.setProperty('--tilt', (-24 + Math.max(-30, Math.min(30, vx * 2))).toFixed(1) + 'deg');
      tag.style.transform = `translate3d(${px}px,${py}px,0)`;
      // each dot chases the one before it: a halftone comet
      let lx = px, ly = py;
      pts.forEach((p, k) => { p.x += (lx - p.x) * (.42 - k * .04); p.y += (ly - p.y) * (.42 - k * .04); p.el.style.transform = `translate3d(${p.x}px,${p.y}px,0)`; lx = p.x; ly = p.y; });
    };
    requestAnimationFrame(loop);
    document.addEventListener('pointerover', (e) => {
      const hit = e.target.closest('a, button, input, [data-cursor], [data-play]');
      cursor.classList.toggle('is-hover', !!hit);
      cursor.classList.toggle('has-label', !!hit?.dataset.cursor);
      DD.cursorLabel(hit?.dataset.cursor || '');
    });
    addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    window.addEventListener('dd:state', (e) => cursor.classList.toggle('is-playing', e.detail.playing));
  }

  /* ---------- magnetic buttons ---------- */
  DD.mag = (root = document) => {
    if (!DD.fine || !DD.motion) return;
    $$('.mag', root).forEach((b) => {
      if (b.dataset.magDone) return;
      b.dataset.magDone = '1';
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .35, duration: .5, ease: 'power3.out' });
      });
      b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .9, ease: 'elastic.out(1, .35)' }));
    });
  };
  DD.mag();

  /* ---------- header hides on the way down ---------- */
  const hdr = $('#hdr');
  let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    hdr?.classList.toggle('is-hidden', y > lastY && y > innerHeight * .6);
    lastY = y;
  }, { passive: true });

  /* ---------- links: jumps + pages still in print ---------- */
  const SOON = {
    'issues.html': 'this is issue 01. there are no back issues. yet.',
    'submit.html': 'make your own issue instead: mixtape.html',
  };
  document.addEventListener('click', (e) => {
    const soon = e.target.closest('[data-soon]');
    if (soon) { e.preventDefault(); DD.toast(SOON[soon.getAttribute('href')] || 'this page is still at the printer. soon.'); return; }
    const jump = e.target.closest('[data-jump]');
    if (jump) { e.preventDefault(); DD.scrollTo(jump.getAttribute('href')); }
  });

  /* ---------- your profile chip, in every header ---------- */
  const chipHost = $('.hdr__now') || $('.room__clock');
  if (chipHost) {
    const chip = document.createElement('a');
    chip.className = 'me-chip'; chip.href = 'profile.html';
    chipHost.parentNode.insertBefore(chip, chipHost);
    const paintChip = () => {
      const me = DD.store.json('profile', null);
      if (!me || !me.name) { chip.innerHTML = '<span class="me-chip__dot">+</span><span>sign in</span>'; chip.dataset.cursor = 'join the zine'; return; }
      const a = (DD.data.artists || []).find((x) => x.slug === me.face);
      chip.innerHTML = `<span class="me-chip__dot${a ? ' has-img' : ''}">${a ? `<img src="img/ARTISTS/${a.slug}.jpg" alt="" onerror="this.onerror=null;this.src='${a.photo}'">` : me.name[0].toUpperCase()}</span><span>${me.name}</span>`;
      chip.dataset.cursor = 'your card';
    };
    paintChip();
    window.addEventListener('dd:profile', paintChip);
  }

  /* ---------- clock ---------- */
  const clocks = $$('[data-clock]');
  const tick = () => { const d = new Date(); clocks.forEach((c) => (c.textContent = `${DD.pad(d.getHours())}:${DD.pad(d.getMinutes())}`)); };
  tick(); setInterval(tick, 10000);

  /* ---------- tab title ---------- */
  const baseTitle = document.title;
  document.addEventListener('visibilitychange', () => {
    const playing = document.documentElement.classList.contains('is-playing');
    if (document.hidden) document.title = playing ? '♪ the record is still spinning…' : 'the needle is up. come back.';
    else {
      document.title = 'welcome back. side b is better anyway. ♥';
      setTimeout(() => (document.title = DD.player?.title || baseTitle), 2400);
    }
  });

  /* ---------- easter eggs ---------- */
  // konami: drop c — the whole page (and the music) goes one more step down
  const KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';
  DD.dropC = () => {
    const on = document.documentElement.classList.toggle('drop-c');
    DD.player?.tune(on ? -2 : 0);
    DD.toast(on ? 'drop c unlocked. everything is a whole step lower now. the pink went red.' : 'back to drop d. the polite version.', 3800);
  };
  let keys = [], typed = '';
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    keys = [...keys, e.key].slice(-10);
    if (keys.join(',') === KONAMI) DD.dropC();
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-12);
    const hit = (w) => typed.endsWith(w);
    if (hit('mosh')) { DD.toast('circle pit opened. please mind the paper.'); document.body.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-1.5deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'rotate(0)' }], { duration: 400, iterations: 3 }); }
    if (hit('nu')) DD.toast('nu metal: never say it out loud. always mean it.');
    if (hit('ghostly')) DD.toast('concept, design & code by ghostly.grl ♥');
    if (hit('meow')) DD.toast('/ᐠ｡ꞈ｡ᐟ\\  the cat is on the platter. it\'s 45 rpm now.', 3600);
  });

  /* ---------- console ---------- */
  const css = 'font-family:monospace;color:#0b0b0b;background:#f4a3c6;padding:6px 10px;line-height:1.4';
  console.log(`%c
   *    /\\_/\\      +
       ( o.o )   <3  ghostly.grl
   +    > ^ <          *

  DROP D — heavy music, soft paper.
  type dropd.help() for the liner notes`, css);
  DD.help = () => {
    console.log('%cdropd.player.play(i)   — put record i on the deck\ndropd.player.toggle()   — start / stop (or space)\ndropd.player.rpm(45)    — chipmunk metal\ndropd.dropC()           — konami code: a whole step lower\ndropd.toast(msg)        — leave a sticky note\n← → seek · n next · p previous\ntype "mosh", "nu", "meow"', 'font-family:monospace;color:#0b0b0b;background:#f2f0eb;padding:8px');
    return '♥';
  };
  window.dropd = DD;
})();
