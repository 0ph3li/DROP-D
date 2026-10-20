/* =========================================================
   DROP D — artist.js
   one page per artist (artist.html?a=slug) + the index
   concept, design & code by ghostly.grl ♥
   ========================================================= */
(() => {
  const DD = window.DD; if (!DD) return;
  const { $, $$ } = DD;
  const T = DD.data.tracks, P = DD.player;
  const motion = DD.motion;
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg>';
  const ISSUE = { '01': 'index.html', '02': 'issue02.html', '03': 'mixtape.html' };

  /* ---------- who is this page about ---------- */
  const A = (DD.data.artists || []).map((a) => {
    // oldest record first; inside a record, keep the order of the crate
    const songs = T.map((t, i) => (DD.slug(t.artist) === a.slug ? i : -1)).filter((i) => i > -1)
      .sort((x, y) => ((+T[x].year || 9999) - (+T[y].year || 9999)) || x - y);
    const fromIssue02 = T.find((t) => DD.slug(t.artist) === a.slug && t.bio);
    return { ...a, songs, bio: a.bio || fromIssue02?.bio || '' };
  }).filter((a) => a.songs.length);
  const slug = new URLSearchParams(location.search).get('a');
  const k = A.findIndex((a) => a.slug === slug);
  const art = A[k];
  if (!art) document.body.classList.add('is-index');

  // dark accents get paper text, light accents get ink text
  const inkOn = (hex) => { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r * .299 + g * .587 + b * .114) > 140 ? '#0b0b0b' : '#f2f0eb'; };
  if (art) {
    document.documentElement.style.setProperty('--acc', art.accent);
    document.documentElement.style.setProperty('--acc-ink', inkOn(art.accent));
    document.title = `${art.name} — DROP D`;
    $('meta[name="description"]')?.setAttribute('content', `${art.name} on DROP D: ${art.songs.length} songs, their records, and who to listen to next.`);
  }

  /* ---------- photos: img/ARTISTS/<slug>.jpg wins, then the data photo, then a cover ---------- */
  const firstThatLoads = (paths) => new Promise((res) => {
    const list = paths.filter(Boolean);
    const next = () => {
      const p = list.shift(); if (!p) return res('');
      const im = new Image(); im.onload = () => res(p); im.onerror = next; im.src = p;
    };
    next();
  });
  const photoOf = (a) => firstThatLoads([`img/ARTISTS/${a.slug}.jpg`, a.photo, T[a.songs[0]].cover]);
  // riso print: two inks (their colour + black), the black slightly out of register
  const riso = (slot) => DD.onSlot(slot, (img) => {
    if ($('.riso', slot)) return;
    const r = document.createElement('div'); r.className = 'riso';
    const a = img.cloneNode(), b = img.cloneNode(), scan = document.createElement('i');
    a.className = 'riso__a'; b.className = 'riso__b'; scan.className = 'riso__scan';
    r.append(a, b, scan); slot.append(r);
    if (!motion) return;
    // the photocopier: a bar of light runs down and leaves the print behind it
    gsap.timeline({ delay: document.body.classList.contains('is-loading') ? 1.2 : .1 })
      .fromTo(r, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'power2.inOut' })
      .fromTo(scan, { top: '-30%', opacity: 1 }, { top: '105%', duration: 1.5, ease: 'power2.inOut' }, 0)
      .to(scan, { opacity: 0, duration: .3 })
      .fromTo(b, { '--mx': '40px', '--my': '-30px' }, { '--mx': '7px', '--my': '-5px', duration: 1.2, ease: 'expo.out' }, .8);
  });

  /* =========================================================
     THE ARTIST
     ========================================================= */
  if (art) {
    const name = $('#ahName');
    // letters animate one by one, but a word never breaks in the middle
    name.innerHTML = art.name.split(' ').map((w) => `<span class="wd">${[...w].map((c) => `<span class="ch">${c}</span>`).join('')}</span>`).join(' ');
    name.classList.toggle('is-long', art.name.length > 13);
    // the longest word must fit the screen
    name.style.setProperty('--len', Math.max(...art.name.split(' ').map((w) => w.length)));
    $('#ldName').textContent = art.name;
    $('#ldKick').textContent = `artist file ${DD.pad(k + 1)} / ${A.length}`;
    $('#ahBg').textContent = `${art.name} · ${art.name} · `;
    $('#ahNum').textContent = `${DD.pad(k + 1)} / ${A.length}`;
    $('#ahFrom').textContent = art.from;
    $('#ahSince').textContent = art.since ? `since ${art.since}` : 'now';
    $('#ahGenre').textContent = art.genre;
    const issues = [...new Set(art.songs.map((i) => T[i].issue))].sort();
    $('#ahIssues').innerHTML = issues.map((n) => `<a href="${ISSUE[n]}">in issue ${n} ↗</a>`).join('');
    $('#ahCount').textContent = art.songs.length;
    $('#ahTime').textContent = DD.fmt(art.songs.reduce((s, i) => s + DD.secs(T[i].time), 0));
    DD.setSlot($('#ahLabel'), T[art.songs[0]].cover, art.name[0]);
    photoOf(art).then((p) => { const s = $('#ahPhoto'); DD.setSlot(s, p); riso(s); });

    // songs
    const tape = () => DD.store.json('tape', { ids: [] });
    $('#asList').innerHTML = art.songs.map((i, n) => {
      const t = T[i];
      return `<li data-play="${i}" data-queue="${art.songs.join(',')}" data-cursor="play">
        <span class="sl__no">${DD.pad(n + 1)}</span>
        <span class="slot slot--mini" data-img="${t.cover}" data-n="${DD.pad(n + 1)}"></span>
        <span class="sl__ti"><b>${t.title}</b><small>${t.genre}</small></span>
        <span class="sl__al">${t.album}${t.year ? `<span class="pix">${t.year}</span>` : ''}</span>
        <span class="sl__is">issue ${t.issue}</span>
        <span class="sl__wave">${DD.wave(i, 30).map((h) => `<i style="height:${(h * 100).toFixed(0)}%"></i>`).join('')}</span>
        <span class="sl__tm">${t.time}</span>
        <button class="sl__add" data-add="${i}" aria-label="add to my tape" data-cursor="add to tape">+</button>
        <span class="sl__go">${PLAY}</span>
      </li>`;
    }).join('');
    DD.slots($('#asList'));
    const paintAdds = () => { const ids = tape().ids || []; $$('[data-add]').forEach((b) => { const on = ids.includes(+b.dataset.add); b.classList.toggle('is-on', on); b.textContent = on ? '✓' : '+'; }); };
    paintAdds();
    // capture phase, so the + never also starts the song
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]'); if (!b) return;
      e.stopPropagation(); e.preventDefault();
      const st = { ids: [], name: '', by: '', theme: 'pink', ...tape() }, i = +b.dataset.add, at = st.ids.indexOf(i);
      if (at > -1) { st.ids.splice(at, 1); DD.toast('taken off your tape.'); }
      else if (st.ids.length >= 10) { DD.toast('your tape is full (10). make room on the mixtape page.'); return; }
      else { st.ids.push(i); DD.toast(`on your tape (${st.ids.length}/10). find it in issue 03 → mixtape.`); }
      DD.store.set('tape', JSON.stringify(st)); paintAdds();
    }, true);

    // records: one sleeve per album
    const albums = [];
    art.songs.forEach((i) => { const t = T[i]; let a = albums.find((x) => x.album === t.album && x.cover === t.cover); if (!a) albums.push(a = { album: t.album, year: t.year, cover: t.cover, vinyl: t.vinyl, ids: [] }); a.ids.push(i); });
    $('#arRow').innerHTML = albums.map((a) => `
      <article class="rc" data-play="${a.ids[0]}" data-queue="${a.ids.join(',')}" data-cursor="play the record" data-reveal>
        <div class="rc__art"><i class="rc__vinyl v-${a.vinyl || 'black'}"></i><span class="slot" data-img="${a.cover}" data-label="${a.cover.replace('img/', '')} · cover"></span></div>
        <p class="rc__cap"><b>${a.album === 'single' ? T[a.ids[0]].title + ' (single)' : a.album}</b><span>${a.year || ''}${a.year ? ' · ' : ''}${a.ids.length} song${a.ids.length > 1 ? 's' : ''}</span><a class="rc__room" href="room.html?r=${DD.slug(art.name + '-' + (a.album === 'single' ? T[a.ids[0]].title + ' (single)' : a.album))}" data-cursor="lights off">in the room ↗</a></p>
      </article>`).join('');
    DD.slots($('#arRow'));

    // about + for fans of (links when that band has a page here)
    $('#abBio').textContent = art.bio;
    const fans = (art.ffo || []).map((sl) => A.find((a) => a.slug === sl)).filter(Boolean);
    $('#abFfo').innerHTML = fans.map((m) => `<a href="artist.html?a=${m.slug}" style="--fa:${m.accent}">${m.name} →</a>`).join('') || '<span>everyone else on this page</span>';

    // next artist
    const nx = A[(k + 1) % A.length];
    const nxA = $('#nx');
    nxA.href = `artist.html?a=${nx.slug}`;
    nxA.style.setProperty('--nx-acc', nx.accent);
    $('#nxName').textContent = nx.name;
    photoOf(nx).then((p) => DD.setSlot($('#nxPhoto'), p));

    // play / pause them
    const ah = $('#ah');
    const mark = () => {
      const i = P.index(), mine = art.songs.includes(i);
      ah.classList.toggle('is-playing', mine && P.isPlaying());
      $$('#asList li').forEach((li) => li.classList.toggle('is-on', +li.dataset.play === i));
    };
    window.addEventListener('dd:track', mark); window.addEventListener('dd:state', mark); mark();
    $('#ahPlay').addEventListener('click', () => {
      const mine = art.songs.includes(P.index());
      if (mine && P.isPlaying()) P.pause(); else if (mine) P.toggle(); else P.play(art.songs[0], art.songs);
    });

    // the black ink drifts out of register with the mouse, and shakes with the music
    const mis = { x: 7, y: -5 };
    ah.addEventListener('pointermove', (e) => {
      const b = ah.getBoundingClientRect();
      gsap.to(mis, { x: ((e.clientX - b.left) / b.width - .5) * 30, y: ((e.clientY - b.top) / b.height - .5) * 22, duration: .8, ease: 'power3.out' });
    });
    ah.addEventListener('pointerleave', () => gsap.to(mis, { x: 7, y: -5, duration: 1.2, ease: 'elastic.out(1, .4)' }));

    // the half record turns with the music, or slowly with the scroll
    const vin = $('#ahVinyl'), ahOn = DD.visible(ah);
    let idle = 0;
    gsap.ticker.add(() => {
      if (!ahOn.on) return;
      const mine = art.songs.includes(P.index()) && P.isPlaying();
      idle += .15;
      vin.style.transform = `rotate(${(mine ? DD.spin.angle : idle + scrollY * .2).toFixed(1)}deg)`;
      const rb = $('.riso__b');
      if (rb && !gsap.isTweening(rb)) {
        const kick = mine ? DD.level * 16 : 0;
        rb.style.setProperty('--mx', (mis.x + kick).toFixed(1) + 'px'); rb.style.setProperty('--my', (mis.y - kick * .6).toFixed(1) + 'px');
      }
    });
  }

  /* =========================================================
     ALL ARTISTS
     ========================================================= */
  $('#axCount').textContent = A.length;
  $('#axGrid').innerHTML = A.map((a, n) => `
    <li><a href="artist.html?a=${a.slug}" class="${art && a.slug === art.slug ? 'is-here' : ''}" style="--a:${a.accent}" data-cursor="open the file" data-reveal>
      <span class="ax__img slot" data-k="${n}" data-n="${a.name}"></span>
      <span class="ax__name">${a.name}</span>
      <span class="ax__n">${a.songs.length} song${a.songs.length > 1 ? 's' : ''} · ${a.genre}</span>
    </a></li>`).join('');
  $$('.ax__img').forEach((s) => photoOf(A[+s.dataset.k]).then((p) => DD.setSlot(s, p)));
  if (!art) {
    $('#ldName').textContent = `${A.length} artists`;
    document.title = 'DROP D — all artists';
  }
  DD.mag();

  /* =========================================================
     LOADER — the sleeve slides out
     ========================================================= */
  const loader = $('#loader');
  const finish = () => { document.body.classList.remove('is-loading'); window.dispatchEvent(new Event('dd:ready')); };
  if (!loader) finish();
  else if (!motion) { loader.remove(); finish(); }
  else {
    const o = { p: 0 }, pct = $('#ldPct');
    const ln = $('#ldName');
    ln.innerHTML = [...ln.textContent].map((c) => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    const loaded = new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true })));
    gsap.from('.ld-name .ch', { yPercent: 110, opacity: 0, duration: .9, stagger: .03, ease: 'expo.out' });
    const cnt = gsap.to(o, { p: 86, duration: 1.3, ease: 'power2.inOut', onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') });
    Promise.all([loaded, document.fonts ? document.fonts.ready : 0, new Promise((r) => setTimeout(r, 1400))]).then(() => {
      cnt.kill();
      gsap.timeline({ onComplete: () => loader.remove() })
        .to(o, { p: 100, duration: .3, onUpdate: () => (pct.textContent = DD.pad(Math.round(o.p), 3) + '%') })
        .to('.ld-name .ch', { yPercent: -120, opacity: 0, duration: .5, stagger: .02, ease: 'power3.in' }, '+=.15')
        .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: .9, ease: 'expo.inOut' }, '-=.3')
        .add(() => { finish(); intro(); }, '-=.55');
    });
  }
  const intro = () => {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } }).from('.hdr > *', { y: -20, opacity: 0, duration: 1, stagger: .06 });
    if (art) {
      tl.from('#ahVinyl', { xPercent: -60, rotate: -180, duration: 1.8 }, '<')
        .from('#ahPhoto', { y: 80, rotate: 3, opacity: 0, duration: 1.4 }, '<.2')
        .from('.ah__name .ch', { yPercent: 100, opacity: 0, duration: 1, stagger: .025 }, '<.2')
        .from(['.ah__k', '.ah__meta', '.ah__issues', '.ah__btns'], { y: 24, opacity: 0, duration: .9, stagger: .07 }, '<.3');
    } else tl.from('.ax__t', { y: 60, opacity: 0, duration: 1.2 }, '<');
    tl.from('.bar', { y: 120, opacity: 0, duration: 1.2 }, '<');
  };

  /* =========================================================
     SCROLL SCENES
     ========================================================= */
  DD.ready.then(() => {
    if (!motion) return;
    const scrub = (target, vars, trigger, start = 'top bottom', end = 'bottom top') =>
      gsap.to(target, { ...vars, ease: 'none', scrollTrigger: { trigger: trigger || target, start, end, scrub: true } });
    if (art) {
      scrub('#ahBg', { xPercent: -25 }, '.ah', 'top top');
      scrub('#ahPhoto', { yPercent: -12 }, '.ah', 'top top');
      gsap.from('#asList li', { x: -30, opacity: 0, duration: .8, stagger: .05, ease: 'expo.out', scrollTrigger: { trigger: '#asList', start: 'top 85%' } });
      $$('.rc').forEach((r) => gsap.from($('.rc__vinyl', r), { xPercent: -30, rotate: -200, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: r, start: 'top 85%' } }));
      gsap.from('.ab__bio', { y: 50, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.ab', start: 'top 75%' } });
      gsap.from('#nxName', { xPercent: 20, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: '.nx', start: 'top 85%' } });
    }
    scrub('.ft__big', { yPercent: -10, letterSpacing: '.03em' }, '.ft', 'top bottom', 'bottom bottom');
    setTimeout(() => ScrollTrigger.refresh(), 500);
  });
})();
