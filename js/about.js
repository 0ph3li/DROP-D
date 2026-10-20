/* =========================================================
   DROP D — about.js
   the page that explains the other pages
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$ } = DD;
  const motion = DD.motion;
  const D = DD.data;

  /* =========================================================
     WHAT IS DROP D — turn the peg, pluck the string
     ========================================================= */
  const E2 = 82.41;
  const peg = $('#peg'), str = $('#oneString'), noteName = $('#noteName'), noteHz = $('#noteHz'), msg = $('#pegMsg');
  let semis = 0, ac;
  const freq = () => E2 * Math.pow(2, -semis / 12);
  const paint = () => {
    const f = freq(), d = semis > 1.5, mid = semis > .25 && !d;
    noteName.textContent = d ? 'D' : mid ? (semis < 1 ? 'E♭' : 'D♯') : 'E';
    noteName.classList.toggle('is-d', d);
    noteHz.textContent = `${f.toFixed(1)} hz`;
    msg.textContent = d ? 'drop d. one whole step down. heavy.' : mid ? 'loosening… keep going' : 'standard tuning';
    msg.classList.toggle('is-d', d);
    peg.style.setProperty('--p', (semis / 2 * 100) + '%');
  };
  peg.addEventListener('input', () => { semis = +peg.value; paint(); });
  peg.addEventListener('change', () => { if (semis > 1.9) { semis = 2; peg.value = 2; paint(); pluck(); } });
  const pluck = () => {
    const f = freq();
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const t = ac.currentTime, out = ac.createGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 10, t); lp.frequency.exponentialRampToValueAtTime(f * 1.4, t + 1.6);
      out.gain.setValueAtTime(.0001, t); out.gain.exponentialRampToValueAtTime(.32, t + .01); out.gain.exponentialRampToValueAtTime(.0001, t + 3);
      [[1, 'sawtooth', .5], [2, 'triangle', .4], [3, 'sine', .15]].forEach(([h, ty, v]) => {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = ty; o.frequency.value = f * h; g.gain.value = v; o.connect(g); g.connect(lp); o.start(t); o.stop(t + 3.1);
      });
      lp.connect(out); out.connect(ac.destination);
    } catch (e) {}
    // the string shakes: lower notes shake slower and wider
    const o = { t: 0 }, speed = 38 * (freq() / E2), amp = 26 + semis * 6;
    if (!motion) return;
    gsap.to(o, { t: 1, duration: 1.8, ease: 'none', onUpdate: () => str.setAttribute('d', `M30 80 Q 450 ${80 + Math.sin(o.t * speed) * amp * (1 - o.t) ** 2} 870 80`) });
  };
  $('#pluck').addEventListener('click', pluck);
  $('.tune1__svg').addEventListener('click', pluck);
  paint();

  /* =========================================================
     LIVE NUMBERS (counted from the zine itself)
     ========================================================= */
  const all = [...(D.home || D.tracks), ...(D.issue02 || []), ...(D.issue03 || [])];
  const secs = all.reduce((s, t) => s + DD.secs(t.time), 0);
  const nums = [
    [all.length, 'songs on the deck'],
    [new Set(all.map((t) => t.artist)).size, 'artists'],
    [new Set(all.map((t) => t.album + t.artist)).size, 'records'],
    [Math.round(secs / 60), 'minutes of music'],
    [3, 'issues so far'],
    [Math.min(...all.map((t) => +t.year || 9999)) + '–' + Math.max(...all.map((t) => +t.year || 0)), 'years covered'],
  ];
  $('#nums').innerHTML = nums.map(([n, l]) => `<div class="num" data-reveal><b class="pix" ${typeof n === 'number' ? `data-count="${n}"` : ''}>${typeof n === 'number' ? 0 : n}</b><span>${l}</span></div>`).join('');
  $$('#nums [data-count]').forEach((el) => { if (DD.hasGsap) ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => DD.count(el) }); else DD.count(el); });
  DD.mag();

  /* =========================================================
     LOADER + INTRO
     ========================================================= */
  const loader = $('#loader');
  const done = () => { document.body.classList.remove('is-loading'); window.dispatchEvent(new Event('dd:ready')); };
  if (!loader) done();
  else if (!motion) { loader.remove(); done(); }
  else {
    const o = { p: 0 }, pct = $('#ldPct');
    gsap.from('.ld-about span', { yPercent: 100, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out' });
    gsap.to(o, { p: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') });
    Promise.all([document.fonts ? document.fonts.ready : 0, new Promise((r) => setTimeout(r, 1600))]).then(() => {
      gsap.timeline({ onComplete: () => loader.remove() })
        .to('.ld-about span', { yPercent: -110, opacity: 0, duration: .5, stagger: .05, ease: 'power3.in' })
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, '-=.2')
        .add(() => { done(); intro(); }, '-=.55');
    });
  }
  const intro = () => {
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hdr > *', { y: -20, opacity: 0, duration: 1, stagger: .06 })
      .from('.mf__l', { xPercent: (k) => (k ? 30 : -30), opacity: 0, duration: 1.4, stagger: .1 }, '<')
      .from('.mf__stamp', { scale: 2.4, rotate: 40, opacity: 0, duration: .9, ease: 'back.out(1.6)' }, '<.6')
      .from('.mf__cols p', { y: 30, opacity: 0, duration: 1, stagger: .08 }, '<')
      .from('.bar', { y: 120, opacity: 0, duration: 1.2 }, '<');
  };

  DD.ready.then(() => {
    if (!motion) return;
    const scrub = (t, v, trig, s = 'top bottom', e = 'bottom top') => gsap.to(t, { ...v, ease: 'none', scrollTrigger: { trigger: trig || t, start: s, end: e, scrub: true } });
    scrub('.mf__l:first-child', { xPercent: -14 }, '.mf', 'top top');
    scrub('.mf__l--r', { xPercent: 14 }, '.mf', 'top top');
    gsap.from('.tune1__rig', { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.tune1', start: 'top 75%' } });
    // the rules slam in one at a time
    $$('#rulesList li').forEach((li) => gsap.from(li.children, { y: 50, opacity: 0, duration: .9, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: li, start: 'top 90%' } }));
    gsap.from('.colo__dl dt, .colo__dl dd', { y: 16, opacity: 0, duration: .7, stagger: .03, ease: 'expo.out', scrollTrigger: { trigger: '.colo__dl', start: 'top 85%' } });
    gsap.from('.toc__list a', { x: -30, opacity: 0, duration: .8, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '.toc__list', start: 'top 85%' } });
    gsap.from('.toc__note', { y: -80, rotate: 30, opacity: 0, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.toc', start: 'top 70%' } });
    gsap.to('.ft__big', { yPercent: -10, letterSpacing: '.03em', ease: 'none', scrollTrigger: { trigger: '.ft', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  });
})();
