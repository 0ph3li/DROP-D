/* =========================================================
   DROP D — tuning.js
   find your tuning: six questions, one per string
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$ } = DD;
  const T = DD.data.tracks, P = DD.player;
  const motion = DD.motion;
  const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  /* ---------- six strings, low to high ---------- */
  const STR = [
    { note: 4, name: 'low e', freq: 82.41, peg: [40, 250], post: [95, 250] },
    { note: 9, name: 'a', freq: 110.0, peg: [40, 170], post: [95, 170] },
    { note: 2, name: 'd', freq: 146.83, peg: [40, 90], post: [95, 90] },
    { note: 7, name: 'g', freq: 196.0, peg: [260, 90], post: [205, 90] },
    { note: 11, name: 'b', freq: 246.94, peg: [260, 170], post: [205, 170] },
    { note: 4, name: 'high e', freq: 329.63, peg: [260, 250], post: [205, 250] },
  ].map((s, k) => ({ ...s, nut: 105 + k * 18 }));

  /* ---------- six questions (one per string), every answer turns that peg 0–3 steps down ---------- */
  const Q = [
    { q: 'it\'s 3am. you are…', a: ['asleep, like a normal person', 'staring at the ceiling', 'on the kitchen floor with headphones', 'driving nowhere with the windows down'] },
    { q: 'pick a colour', a: ['white', 'pink', 'black', 'blood red'] },
    { q: 'a song should end…', a: ['on the chorus', 'quietly', 'with a breakdown', 'never'] },
    { q: 'your perfect venue', a: ['a stadium', 'your bedroom', 'a basement', 'a cemetery at night'] },
    { q: 'what do you scream along to?', a: ['nothing, i hum', 'the chorus', 'the bridge', 'all of it'] },
    { q: 'pick a mask', a: ['no mask', 'sleep token\'s', 'slipknot\'s', 'a bedsheet with two holes'] },
  ];

  /* ---------- five tunings (a mood, not music theory) ---------- */
  const byTitle = (t) => T.findIndex((x) => x.title === t);
  const TUN = [
    { key: 'e', name: 'STANDARD E', notes: 'E A D G B E', semis: 0, line: 'tuned to the radio', text: 'you still believe in choruses. that\'s not a flaw, it\'s a starting point. the rest of this crate is waiting a whole step below you.', songs: ['Lit Up', 'Bring Me to Life', 'In the End', 'I Don\'t Care', 'Your Face'] },
    { key: 'd', name: 'DROP D', notes: 'D A D G B E', semis: -1, line: 'the classic', text: 'one string down and everything sounds like 2001. you\'re the reason this zine is called what it\'s called.', songs: ['Change (In the House of Flies)', 'Chop Suey!', 'Freak on a Leash', 'Heaven\'s a Lie', 'Kiss the Ladder'] },
    { key: 'c', name: 'DROP C', notes: 'C G C F A D', semis: -2, line: 'heavier, still singing', text: 'you scream in the car but you still know every word. two steps down, both feet in the pit.', songs: ['Duality', 'Last Resort', 'Can You Feel My Heart', 'Walk', 'My Heart Is Broken'] },
    { key: 'b', name: 'DROP B', notes: 'B F# B E G# C#', semis: -3, line: 'the low end', text: 'the strings are loose, the songs are long and you like it like that. you hear the bass before the melody.', songs: ['Blind', 'My Own Summer (Shove It)', 'The Summoning', 'Granite', 'Cemetery Sweetheart'] },
    { key: 'a', name: 'DROP A', notes: 'A E A D F# B', semis: -5, line: 'basement', text: 'the lowest we go. the strings are flapping, the lights are off, and you\'re happiest down here.', songs: ['Black No. 1 (Little Miss Scare-All)', 'Love You to Death', 'Sick', 'My Way', 'Erase This'] },
  ].map((t) => ({ ...t, ids: t.songs.map(byTitle).filter((i) => i > -1) }));
  const tuningFor = (score) => TUN[score <= 3 ? 0 : score <= 7 ? 1 : score <= 11 ? 2 : score <= 15 ? 3 : 4];

  /* =========================================================
     THE HEADSTOCK
     ========================================================= */
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v)); parent?.append(e); return e; };
  const pegsG = $('#pegs'), strG = $('#strings');
  const strPath = (s, off = 0) => `M${s.post[0]} ${s.post[1]} L${s.nut} 338 Q${s.nut + off} 550 ${s.nut} 760`;
  STR.forEach((s, k) => {
    const g = mk('g', { class: 'peg', id: `peg${k}` }, pegsG);
    mk('line', { class: 'peg__key', x1: s.peg[0], y1: s.peg[1], x2: s.post[0], y2: s.post[1] }, pegsG);
    mk('circle', { class: 'peg__post', cx: s.post[0], cy: s.post[1], r: 7 }, pegsG);
    mk('ellipse', { class: 'peg__btn', cx: s.peg[0], cy: s.peg[1], rx: 18, ry: 13 }, g);
    mk('line', { x1: s.peg[0] - 12, y1: s.peg[1], x2: s.peg[0] + 12, y2: s.peg[1], stroke: '#8d8d8b', 'stroke-width': 2 }, g);
    s.path = mk('path', { class: 'str', d: strPath(s) }, strG);
    s.hit = mk('path', { class: 'str--hit', d: strPath(s), 'data-cursor': s.name }, strG);
    s.hit.addEventListener('click', () => pluck(k));
  });
  $('#notes').innerHTML = STR.map((s, k) => `<li id="note${k}">${NOTES[s.note]}</li>`).join('');
  // on a phone the strings are cut shorter so the questions stay on screen
  const svg = $('.head__svg'), narrow = matchMedia('(max-width: 1000px)');
  const fitHead = () => svg.setAttribute('viewBox', narrow.matches ? '0 0 300 450' : '0 0 300 760');
  fitHead(); narrow.addEventListener?.('change', fitHead);

  /* ---------- sound: a small plucked string, made in the browser ---------- */
  let ac;
  const down = Array(6).fill(0);
  const pluck = (k) => {
    const s = STR[k], f = s.freq * Math.pow(2, -down[k] / 12);
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      const now = ac.currentTime, out = ac.createGain(), lp = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(f * 8, now); lp.frequency.exponentialRampToValueAtTime(f * 1.5, now + 1.2);
      out.gain.setValueAtTime(.0001, now); out.gain.exponentialRampToValueAtTime(.28, now + .008); out.gain.exponentialRampToValueAtTime(.0001, now + 2.2);
      [[1, 'triangle', 1], [2, 'sine', .35], [3, 'sine', .12]].forEach(([h, type, v]) => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.value = f * h; g.gain.value = v; o.connect(g); g.connect(lp); o.start(now); o.stop(now + 2.3);
      });
      lp.connect(out); out.connect(ac.destination);
    } catch (e) {}
    // the string shakes, then settles
    if (!motion) return;
    const o = { t: 0 };
    gsap.to(o, { t: 1, duration: 1.1, ease: 'none', onUpdate: () => {
      const off = Math.sin(o.t * 60) * 14 * (1 - o.t) ** 2;
      s.path.setAttribute('d', strPath(s, off));
    } });
  };
  const paintString = (k) => {
    const s = STR[k], n = (s.note - down[k] + 12) % 12;
    const li = $(`#note${k}`);
    li.textContent = NOTES[n]; li.classList.toggle('is-down', down[k] > 0);
    s.path.classList.toggle('is-down', down[k] > 0);
    const peg = $(`#peg${k}`);
    if (motion) gsap.to(peg, { rotation: down[k] * -90, svgOrigin: `${STR[k].peg[0]} ${STR[k].peg[1]}`, duration: .8, ease: 'back.out(2)' });
  };
  const nowString = (k) => STR.forEach((s, j) => s.path.classList.toggle('is-now', j === k));

  /* =========================================================
     THE QUIZ
     ========================================================= */
  const answers = [];
  let qi = 0;
  const show = (id) => {
    $$('.tn__panel').forEach((p) => p.classList.toggle('is-on', p.id === id));
    if (motion) gsap.fromTo(`#${id}`, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'expo.out' });
  };
  const ask = (k) => {
    qi = k; const q = Q[k];
    $('#qNum').textContent = `string ${k + 1} / 6`;
    $('#qString').textContent = `${STR[k].name} · ${NOTES[STR[k].note]}`;
    $('#qText').textContent = q.q;
    $('#qAnswers').innerHTML = q.a.map((a, i) => `<button class="ans${answers[k] === i ? ' is-picked' : ''}" data-a="${i}" style="--r:${[-1.5, 1, -.5, 1.8][i]}deg" data-cursor="${i ? i + ' down' : 'stay'}"><b>${'ABCD'[i]}</b>${a}</button>`).join('');
    $('#qBack').hidden = k === 0;
    nowString(k);
    if (motion) {
      gsap.from('#qText', { yPercent: 40, opacity: 0, duration: .7, ease: 'expo.out' });
      gsap.from('.ans', { y: 30, opacity: 0, duration: .6, stagger: .06, ease: 'expo.out' });
    }
  };
  $('#qAnswers').addEventListener('click', (e) => {
    const b = e.target.closest('.ans'); if (!b) return;
    const a = +b.dataset.a;
    answers[qi] = a; down[qi] = a;
    $$('.ans').forEach((x) => x.classList.toggle('is-picked', x === b));
    paintString(qi); pluck(qi);
    setTimeout(() => (qi < 5 ? ask(qi + 1) : finish(true)), motion ? 520 : 0);
  });
  $('#qBack').addEventListener('click', () => qi > 0 && ask(qi - 1));
  $('#start').addEventListener('click', () => { show('quiz'); ask(0); });

  /* =========================================================
     THE RESULT
     ========================================================= */
  let cur = null;
  const finish = (fresh) => {
    const score = answers.reduce((s, a) => s + (a || 0), 0);
    cur = fresh ? tuningFor(score) : cur;
    if (fresh) DD.store.set('tuning', JSON.stringify({ key: cur.key, answers }));
    const t = cur;
    show('result'); nowString(-1);
    $('#rName').textContent = t.name;
    $('#rNotes').textContent = t.notes;
    $('#rLine').textContent = t.line;
    $('#rText').textContent = t.text;
    $('#rMeter').style.setProperty('--m', ((TUN.indexOf(t) + 1) / TUN.length * 100) + '%');
    $('#rPitchTxt').textContent = t.semis ? `${Math.abs(t.semis)} step${Math.abs(t.semis) > 1 ? 's' : ''} down` : 'exactly as they are';
    $('#rList').innerHTML = t.ids.map((i) => `<li data-play="${i}" data-queue="${t.ids.join(',')}" data-cursor="play"><span class="slot slot--mini" data-img="${T[i].cover}" data-n="${DD.pad(i + 1)}"></span><span><b>${T[i].title.replace(/ \(.*\)/, '')}</b><small><a href="${DD.artistUrl(T[i].artist)}" class="to-artist">${T[i].artist}</a></small></span><span class="pix">${T[i].time}</span></li>`).join('');
    DD.slots($('#rList'));
    $('#ftTune').textContent = t.notes;
    $$('#tList li').forEach((li) => li.classList.toggle('is-you', li.dataset.k === t.key));
    if (motion) {
      DD.scramble($('#rName'), t.name, 900);
      gsap.fromTo('.res__band', { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'expo.inOut', delay: .2 });
      gsap.fromTo('#rMeter', { width: 0 }, { width: ((TUN.indexOf(t) + 1) / TUN.length * 100) + '%', duration: 1.4, ease: 'expo.out', delay: .4 });
      gsap.from('#rList li', { x: 30, opacity: 0, duration: .7, stagger: .07, ease: 'expo.out', delay: .3 });
    }
    if (fresh) DD.toast(`${t.name.toLowerCase()}. ${t.line}.`);
  };
  const markRes = () => { const i = P.index(); $$('#rList li').forEach((li) => li.classList.toggle('is-on', +li.dataset.play === i)); };
  window.addEventListener('dd:track', markRes);

  // hear it tuned down: the deck really plays lower
  $('#rPitch').addEventListener('change', (e) => { P.tune(e.target.checked && cur ? cur.semis : 0); DD.toast(e.target.checked ? 'the deck is tuned down to you now.' : 'back to the record as it was pressed.'); });
  $('#rPlay').addEventListener('click', () => { if (!cur) return; P.play(cur.ids[0], cur.ids); });
  $('#rTape').addEventListener('click', () => {
    if (!cur) return;
    const st = { ids: [], name: '', by: '', theme: 'pink', ...DD.store.json('tape', {}) };
    let added = 0;
    cur.ids.forEach((i) => { if (!st.ids.includes(i) && st.ids.length < 10) { st.ids.push(i); added++; } });
    if (!st.name) st.name = `${cur.name.toLowerCase()} for the bus`;
    DD.store.set('tape', JSON.stringify(st));
    DD.toast(added ? `${added} songs on your tape. it's on the mixtape page (issue 03).` : 'they\'re already on your tape, or the tape is full.');
  });
  $('#rShare').addEventListener('click', async () => {
    history.replaceState(null, '', '#t=' + cur.key);
    try { await navigator.clipboard.writeText(location.href); DD.toast('link copied. make them take it too.'); } catch (e) { DD.toast('the link is in the address bar. copy it from there.'); }
  });
  $('#rAgain').addEventListener('click', () => {
    answers.length = 0; down.fill(0); STR.forEach((_, k) => paintString(k)); P.tune(0); $('#rPitch').checked = false;
    history.replaceState(null, '', location.pathname); show('quiz'); ask(0);
  });

  /* ---------- the five tunings ---------- */
  $('#tList').innerHTML = TUN.map((t, k) => `<li data-k="${t.key}"><span class="c5__n">0${k + 1} · ${['polite', 'classic', 'heavier', 'low', 'basement'][k]}</span><span class="c5__name">${t.name}</span><span class="c5__notes">${t.notes}</span><span class="c5__line">${t.line}. ${t.songs.slice(0, 2).join(', ').toLowerCase()}…</span><span class="c5__you">you ↓</span></li>`).join('');

  /* ---------- coming back: a shared link, or last time's result ---------- */
  const hashKey = (location.hash.match(/t=([a-e])/) || [])[1];
  const saved = DD.store.json('tuning', null);
  if (hashKey) { cur = TUN.find((t) => t.key === hashKey); finish(false); }
  else if (saved) {
    const t = TUN.find((x) => x.key === saved.key);
    if (t) {
      $('#lastResult').innerHTML = `last time you were <a href="#" id="seeLast">${t.name.toLowerCase()}</a>. still?`;
      $('#seeLast').addEventListener('click', (e) => {
        e.preventDefault(); cur = t;
        (saved.answers || []).forEach((a, k) => { answers[k] = a; down[k] = a || 0; paintString(k); });
        finish(false);
      });
    }
  }
  DD.mag();

  /* =========================================================
     LOADER — six strings come in
     ========================================================= */
  const loader = $('#loader');
  const done = () => { document.body.classList.remove('is-loading'); window.dispatchEvent(new Event('dd:ready')); };
  if (!loader) done();
  else if (!motion) { loader.remove(); done(); }
  else {
    const o = { p: 0 }, pct = $('#ldPct');
    const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
    gsap.from('.ld-tune > *', { yPercent: 100, opacity: 0, duration: .9, stagger: .07, ease: 'expo.out' });
    const cnt = gsap.to(o, { p: 86, duration: 1.3, ease: 'power2.inOut', onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') });
    Promise.all([loaded, document.fonts ? document.fonts.ready : 0, new Promise((r) => setTimeout(r, 1400))]).then(() => {
      cnt.kill();
      gsap.timeline({ onComplete: () => loader.remove() })
        .to(o, { p: 100, duration: .3, onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') })
        .to('.ld-tune > *', { yPercent: (k) => [40, -40, 30, -30, 20, -20][k], opacity: 0, duration: .6, stagger: .04, ease: 'power3.in' }, '+=.15')
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, '-=.3')
        .add(() => { done(); intro(); }, '-=.55');
    });
  }
  const intro = () => {
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.hdr > *', { y: -20, opacity: 0, duration: 1, stagger: .06 })
      .from('.head', { y: -120, rotate: -8, opacity: 0, duration: 1.6 }, '<')
      .from('.str', { opacity: 0, duration: .8, stagger: .06 }, '<.4')
      .from('.tn__t span', { yPercent: 100, opacity: 0, duration: 1.1, stagger: .08 }, '<')
      .from(['.tn__intro .kicker', '.tn__p', '.tn__go'], { y: 24, opacity: 0, duration: .9, stagger: .07 }, '<.3')
      .from('.bar', { y: 120, opacity: 0, duration: 1.2 }, '<');
  };
  DD.ready.then(() => {
    if (!motion) return;
    gsap.from('#tList li', { y: 60, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '#tList', start: 'top 85%' } });
    gsap.to('.ft__big', { yPercent: -10, letterSpacing: '.03em', ease: 'none', scrollTrigger: { trigger: '.ft', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  });
})();
