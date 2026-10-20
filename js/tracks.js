/* =========================================================
   DROP D — tracks.js (the data: every page reads it)
   heavy music, soft paper
   concept, design & code by ghostly.grl ♥

   HOW TO ADD YOUR SONGS
   1. drop the audio file in /SONGS with the exact name in `src`
      (or change `src` to whatever your file is called)
   2. put the album cover in /img/RECORDS with the name in `cover`
   3. reload. a missing file never breaks anything — the deck
      "plays it in your head" and tells you which file it wanted.
   ========================================================= */
window.DD_DATA = {
  tracks: [
    { title: 'Freak on a Leash', artist: 'Korn', album: 'Follow the Leader', year: 1998, time: '4:15', genre: 'nu metal',
      src: 'SONGS/01-korn-freak-on-a-leash.mp3', cover: 'img/RECORDS/follow-the-leader.jpg', vinyl: 'lime' },
    { title: 'Change (In the House of Flies)', artist: 'Deftones', album: 'White Pony', year: 2000, time: '4:59', genre: 'alt metal',
      src: 'SONGS/02-deftones-change.mp3', cover: 'img/RECORDS/white-pony.jpg', vinyl: 'marble' },
    { title: 'Chop Suey!', artist: 'System of a Down', album: 'Toxicity', year: 2001, time: '3:30', genre: 'alt metal',
      src: 'SONGS/03-soad-chop-suey.mp3', cover: 'img/RECORDS/toxicity.jpg', vinyl: 'blood' },
    { title: 'In the End', artist: 'Linkin Park', album: 'Hybrid Theory', year: 2000, time: '3:36', genre: 'nu metal',
      src: 'SONGS/04-linkin-park-in-the-end.mp3', cover: 'img/RECORDS/hybrid-theory.jpg', vinyl: 'smoke' },
    { title: 'Duality', artist: 'Slipknot', album: 'Vol. 3: (The Subliminal Verses)', year: 2004, time: '4:12', genre: 'nu metal',
      src: 'SONGS/05-slipknot-duality.mp3', cover: 'img/RECORDS/vol-3.jpg', vinyl: 'black' },
    { title: 'My Way', artist: 'Limp Bizkit', album: 'Chocolate Starfish and the Hot Dog Flavored Water', year: 2000, time: '4:33', genre: 'nu metal',
      src: 'SONGS/06-limp-bizkit-my-way.mp3', cover: 'img/RECORDS/chocolate-starfish.jpg', vinyl: 'red' },
    { title: 'Bring Me to Life', artist: 'Evanescence', album: 'Fallen', year: 2003, time: '3:57', genre: 'alt metal',
      src: 'SONGS/07-evanescence-bring-me-to-life.mp3', cover: 'img/RECORDS/fallen.jpg', vinyl: 'smoke' },
    { title: 'Last Resort', artist: 'Papa Roach', album: 'Infest', year: 2000, time: '3:20', genre: 'nu metal',
      src: 'SONGS/08-papa-roach-last-resort.mp3', cover: 'img/RECORDS/infest.jpg', vinyl: 'black' },
    { title: 'Can You Feel My Heart', artist: 'Bring Me the Horizon', album: 'Sempiternal', year: 2013, time: '3:48', genre: 'metalcore',
      src: 'SONGS/09-bmth-can-you-feel-my-heart.mp3', cover: 'img/RECORDS/sempiternal.jpg', vinyl: 'marble' },
    { title: 'The Summoning', artist: 'Sleep Token', album: 'Take Me Back to Eden', year: 2023, time: '6:35', genre: 'alt metal',
      src: 'SONGS/10-sleep-token-the-summoning.mp3', cover: 'img/RECORDS/take-me-back-to-eden.jpg', vinyl: 'pink' },
    { title: 'Numb', artist: 'Linkin Park', album: 'Meteora', year: 2003, time: '3:07', genre: 'nu metal',
      src: 'SONGS/11-linkin-park-numb.mp3', cover: 'img/RECORDS/meteora.jpg', vinyl: 'smoke' },
  ],

  // "five ways to listen" — the circles
  ways: [
    { n: '01', name: 'loud', line: 'windows down, at a red light, making eye contact with nobody.', play: 2 },
    { n: '02', name: 'alone', line: 'headphones on, lights off. the record does the talking.', play: 1 },
    { n: '03', name: 'again', line: 'the same four minutes, until the bus stop, until it\'s yours.', play: 3 },
    { n: '04', name: 'at 3am', line: 'six and a half minutes for when the house is asleep and you aren\'t.', play: 9 },
    { n: '05', name: 'angry', line: 'for slamming a door you\'ll apologise to tomorrow.', play: 4 },
  ],

  // "rare pressings" — the records with the vinyl sliding out
  pressings: [0, 1, 2, 9],

  // billboard hot 100 peak positions (the crossover moment)
  chart: [
    { play: 3, peak: 2, released: 2001, note: 'nu metal at its highest on the hot 100' },
    { play: 6, peak: 5, released: 2003, note: 'from the daredevil soundtrack' },
    { play: 10, peak: 11, released: 2003, note: 'the one everyone knew the words to' },
    { play: 7, peak: 57, released: 2000, note: 'from rock radio to pop radio' },
    { play: 2, peak: 76, released: 2001, note: 'played everywhere, peaked anyway' },
  ],

  // faces + the sticky note on each one
  faces: [
    { name: 'Korn', from: 'bakersfield, 1993', mood: 'adidas, head to toe', img: 'img/FACES/korn.jpg', play: 0 },
    { name: 'Deftones', from: 'sacramento, 1988', mood: 'pink & half asleep', img: 'img/FACES/deftones.jpg', play: 1 },
    { name: 'System of a Down', from: 'glendale, 1994', mood: 'too fast to argue', img: 'img/FACES/soad.jpg', play: 2 },
    { name: 'Slipknot', from: 'des moines, 1995', mood: 'nine masks, zero faces', img: 'img/FACES/slipknot.jpg', play: 4 },
    { name: 'Linkin Park', from: 'agoura hills, 1996', mood: 'hybrid', img: 'img/FACES/linkin-park.jpg', play: 3 },
    { name: 'Sleep Token', from: 'london, 2016', mood: 'worship, softly', img: 'img/FACES/sleep-token.jpg', play: 9 },
  ],

  /* =========================================================
     ISSUE 02 — the ones your friends haven't heard yet
     (issue02.html plays this list instead of the one above)
     `photo` = the artist picture (cut-out in the hero, dots in the index)
     `time` is only a fallback: the real file's length wins
     ========================================================= */
  issue02: [
    { title: 'I Don\'t Care', artist: 'Violent Vira', album: 'single', year: 2021, time: '2:55', genre: 'grunge pop',
      src: 'SONGS/ISSUE02/01-violent-vira-i-dont-care.mp3', cover: 'img/RECORDS/violent-vira.jpg', photo: 'img/ISSUE02/violent-vira.jpg', vinyl: 'pink',
      from: 'boise, idaho', ffo: 'hole, evanescence',
      bio: 'a grunge-pop singer from idaho who went viral in 2021 with "i don\'t care" and then kept getting heavier. her debut album is called lover of a ghost.' },
    { title: 'Your Face', artist: 'Wisp', album: 'Pandora', year: 2024, time: '3:48', genre: 'nu-gaze',
      src: 'SONGS/ISSUE02/02-wisp-your-face.mp3', cover: 'img/RECORDS/pandora.jpg', photo: 'img/ISSUE02/wisp.jpg', vinyl: 'smoke',
      from: 'san francisco', ffo: 'deftones, slowdive',
      bio: 'natalie lu made "your face" as a teenager and the internet decided it was shoegaze, then decided it was the future of it.' },
    { title: 'Walk', artist: 'Pantera', album: 'Vulgar Display of Power', year: 1992, time: '5:15', genre: 'groove metal',
      src: 'SONGS/ISSUE02/03-pantera-walk.mp3', cover: 'img/RECORDS/vulgar-display-of-power.jpg', photo: 'img/ISSUE02/pantera.jpg', vinyl: 'black',
      from: 'arlington, texas', ffo: 'slipknot, sepultura',
      bio: 'the oldest band in this issue and the reason half the others exist. you know this riff even if you never knew its name.' },
    { title: 'Black No. 1 (Little Miss Scare-All)', artist: 'Type O Negative', album: 'Bloody Kisses', year: 1993, time: '11:18', genre: 'gothic doom',
      src: 'SONGS/ISSUE02/04-type-o-negative-black-no-1.mp3', cover: 'img/RECORDS/bloody-kisses.jpg', photo: 'img/ISSUE02/type-o-negative.jpg', vinyl: 'green',
      from: 'brooklyn, new york', ffo: 'deftones, the cure',
      bio: 'green vinyl, black humour, and peter steele\'s voice coming from the bottom of the ocean. eleven minutes. you won\'t notice.' },
    { title: 'Cemetery Sweetheart', artist: 'Babyteeth', album: 'Cemetery Sweetheart', year: 2025, time: '3:10', genre: 'sad girl metal',
      src: 'SONGS/ISSUE02/05-babyteeth-cemetery-sweetheart.mp3', cover: 'img/RECORDS/cemetery-sweetheart.jpg', photo: 'img/ISSUE02/babyteeth.jpg', vinyl: 'pink',
      from: 'sad girl gang', ffo: 'violent vira, evanescence',
      bio: 'self-declared leader of the sad girl gang. cemetery sweetheart is her 2025 album: gothic, glittery, a little bit haunted. the newest record in the crate.' },
    { title: 'Lit Up', artist: 'Buckcherry', album: 'Buckcherry', year: 1999, time: '3:36', genre: 'hard rock',
      src: 'SONGS/ISSUE02/06-buckcherry-lit-up.mp3', cover: 'img/RECORDS/buckcherry.jpg', photo: 'img/ISSUE02/buckcherry.jpg', vinyl: 'blood',
      from: 'california', ffo: 'guns n\' roses, mötley crüe',
      bio: 'sleaze rock that sounds like a leather jacket left out in the sun. the odd one out here, which is exactly why it\'s here.' },
    { title: 'Kiss the Ladder', artist: 'Fleshwater', album: 'We\'re Not Here to Be Loved', year: 2022, time: '1:29', genre: 'alt metal',
      src: 'SONGS/ISSUE02/07-fleshwater-kiss-the-ladder.mp3', cover: 'img/RECORDS/were-not-here-to-be-loved.jpg', photo: 'img/ISSUE02/fleshwater.jpg', vinyl: 'marble',
      from: 'massachusetts', ffo: 'deftones, hum',
      bio: 'members of vein.fm making 90s alternative out of hardcore. "kiss the ladder" is over in under ninety seconds. play it twice.' },
    { title: 'obsessixn', artist: 'whatsaheart', album: 'single', year: '', time: '1:55', genre: 'internet emo',
      src: 'SONGS/ISSUE02/08-whatsaheart-obsessixn.mp3', cover: 'img/RECORDS/whatsaheart.jpg', photo: 'img/ISSUE02/whatsaheart.jpg', vinyl: 'pink',
      from: 'the internet', ffo: 'bring me the horizon, your sad playlist',
      bio: 'an internet artist with song titles spelled like passwords. found on someone\'s weekly chart, kept forever.' },
    { title: 'Heaven\'s a Lie', artist: 'Lacuna Coil', album: 'Comalies', year: 2002, time: '4:50', genre: 'gothic metal',
      src: 'SONGS/ISSUE02/09-lacuna-coil-heavens-a-lie.mp3', cover: 'img/RECORDS/comalies.jpg', photo: 'img/ISSUE02/lacuna-coil.jpg', vinyl: 'smoke',
      from: 'milan, italy', ffo: 'evanescence, within temptation',
      bio: 'two voices, one gothic metal band, from milan. the most italian thing in this zine (sorry, the paper).' },
  ],

  /* =========================================================
     ISSUE 03 — yours (mixtape.html)
     the whole Evanescence album (2011), more Evanescence, more from the crate
     `time` is only a fallback: the real file's length wins
     ========================================================= */
  issue03: [
    { title: 'What You Want', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '3:41', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/01-what-you-want.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'Made of Stone', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '4:29', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/02-made-of-stone.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'The Change', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '3:44', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/03-the-change.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'My Heart Is Broken', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '4:31', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/04-my-heart-is-broken.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'The Other Side', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '4:05', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/05-the-other-side.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'Erase This', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '3:52', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/06-erase-this.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'Lost in Paradise', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '4:41', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/07-lost-in-paradise.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'Sick', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '3:30', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/08-sick.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'End of the Dream', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '3:44', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/09-end-of-the-dream.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'Oceans', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '3:30', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/10-oceans.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'Never Go Back', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '4:26', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/11-never-go-back.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'Swimming Home', artist: 'Evanescence', album: 'Evanescence', year: 2011, time: '3:41', genre: 'alt metal', group: 'album',
      src: 'SONGS/ISSUE03/EVANESCENCE-ALBUM/12-swimming-home.mp3', cover: 'img/RECORDS/evanescence-2011.jpg', vinyl: 'smoke' },
    { title: 'Going Under', artist: 'Evanescence', album: 'Fallen', year: 2003, time: '3:35', genre: 'alt metal', group: 'extra',
      src: 'SONGS/ISSUE03/EVANESCENCE-EXTRA/01-going-under.mp3', cover: 'img/RECORDS/fallen.jpg', vinyl: 'smoke' },
    { title: 'My Immortal', artist: 'Evanescence', album: 'Fallen', year: 2003, time: '4:30', genre: 'alt metal', group: 'extra',
      src: 'SONGS/ISSUE03/EVANESCENCE-EXTRA/02-my-immortal.mp3', cover: 'img/RECORDS/fallen.jpg', vinyl: 'smoke' },
    { title: 'Call Me When You\'re Sober', artist: 'Evanescence', album: 'The Open Door', year: 2006, time: '3:36', genre: 'alt metal', group: 'extra',
      src: 'SONGS/ISSUE03/EVANESCENCE-EXTRA/03-call-me-when-youre-sober.mp3', cover: 'img/RECORDS/the-open-door.jpg', vinyl: 'smoke' },
    { title: 'My Own Summer (Shove It)', artist: 'Deftones', album: 'Around the Fur', year: 1997, time: '3:45', genre: 'alt metal', group: 'others',
      src: 'SONGS/ISSUE03/OTHERS/01-deftones-my-own-summer.mp3', cover: 'img/RECORDS/around-the-fur.jpg', vinyl: 'smoke' },
    { title: 'Blind', artist: 'Korn', album: 'Korn', year: 1994, time: '4:16', genre: 'nu metal', group: 'others',
      src: 'SONGS/ISSUE03/OTHERS/02-korn-blind.mp3', cover: 'img/RECORDS/korn-1994.jpg', vinyl: 'smoke' },
    { title: 'Crawling', artist: 'Linkin Park', album: 'Hybrid Theory', year: 2000, time: '3:28', genre: 'nu metal', group: 'others',
      src: 'SONGS/ISSUE03/OTHERS/03-linkin-park-crawling.mp3', cover: 'img/RECORDS/hybrid-theory.jpg', vinyl: 'smoke' },
    { title: 'Love You to Death', artist: 'Type O Negative', album: 'October Rust', year: 1996, time: '4:49', genre: 'gothic doom', group: 'others',
      src: 'SONGS/ISSUE03/OTHERS/04-type-o-negative-love-you-to-death.mp3', cover: 'img/RECORDS/october-rust.jpg', vinyl: 'smoke' },
    { title: 'Our Truth', artist: 'Lacuna Coil', album: 'Karmacode', year: 2006, time: '4:03', genre: 'gothic metal', group: 'others',
      src: 'SONGS/ISSUE03/OTHERS/05-lacuna-coil-our-truth.mp3', cover: 'img/RECORDS/karmacode.jpg', vinyl: 'smoke' },
    { title: 'Saccharine', artist: 'Violent Vira', album: 'Lover of a Ghost', year: 2025, time: '3:23', genre: 'grunge pop', group: 'others',
      src: 'SONGS/ISSUE03/OTHERS/06-violent-vira-saccharine.mp3', cover: 'img/RECORDS/lover-of-a-ghost.jpg', vinyl: 'smoke' },
    { title: 'Granite', artist: 'Sleep Token', album: 'Take Me Back to Eden', year: 2023, time: '3:45', genre: 'alt metal', group: 'others',
      src: 'SONGS/ISSUE03/OTHERS/07-sleep-token-granite.mp3', cover: 'img/RECORDS/take-me-back-to-eden.jpg', vinyl: 'smoke' },
    { title: 'Enough for You', artist: 'Wisp', album: 'Pandora', year: 2024, time: '3:04', genre: 'nu-gaze', group: 'others',
      src: 'SONGS/ISSUE03/OTHERS/08-wisp-enough-for-you.mp3', cover: 'img/RECORDS/pandora.jpg', vinyl: 'smoke' },
  ],

  /* =========================================================
     ARTISTS — one page each (artist.html?a=slug)
     photo: their picture · accent: the colour of their page
     put a new photo at img/ARTISTS/<slug>.jpg to override any of these
     ========================================================= */
  artists: [
    { slug: 'korn', name: 'Korn', from: 'bakersfield, california', since: 1993, genre: 'nu metal', photo: 'img/FACES/korn.jpg', accent: '#b7f05a', ffo: ['slipknot', 'limp-bizkit', 'deftones'],
      bio: 'the band that turned seven-string guitars, a dj and jonathan davis\'s bagpipes into a genre. everything in this zine is a little bit their fault.' },
    { slug: 'deftones', name: 'Deftones', from: 'sacramento, california', since: 1988, genre: 'alt metal', photo: 'img/FACES/deftones.jpg', accent: '#f4a3c6', ffo: ['wisp', 'fleshwater', 'sleep-token'],
      bio: 'the art-school wing of heavy music. chino moreno whispers, the guitars don\'t, and white pony made it okay for metal to be beautiful.' },
    { slug: 'system-of-a-down', name: 'System of a Down', from: 'glendale, california', since: 1994, genre: 'alt metal', photo: 'img/FACES/soad.jpg', accent: '#e0233a', ffo: ['slipknot', 'pantera', 'korn'],
      bio: 'four armenian-american musicians who play like they\'re arguing with each other, and win every time.' },
    { slug: 'linkin-park', name: 'Linkin Park', from: 'agoura hills, california', since: 1996, genre: 'nu metal', photo: 'img/FACES/linkin-park.jpg', accent: '#d9d9d9', ffo: ['papa-roach', 'bring-me-the-horizon', 'evanescence'],
      bio: 'rap verses, screamed choruses, a turntable and a sampler. hybrid theory became the best-selling debut album of the century.' },
    { slug: 'slipknot', name: 'Slipknot', from: 'des moines, iowa', since: 1995, genre: 'nu metal', photo: 'img/FACES/slipknot.jpg', accent: '#c4001b', ffo: ['korn', 'pantera', 'system-of-a-down'],
      bio: 'nine members, nine masks, one number each. the loudest thing to ever come out of iowa.' },
    { slug: 'limp-bizkit', name: 'Limp Bizkit', from: 'jacksonville, florida', since: 1994, genre: 'nu metal', photo: 'img/ARTISTS/limp-bizkit.jpg', accent: '#d7261e', ffo: ['korn', 'papa-roach', 'linkin-park'],
      bio: 'a red cap worn backwards, wes borland in face paint, and riffs built for jumping. nu metal at its most ridiculous and most fun.' },
    { slug: 'evanescence', name: 'Evanescence', from: 'little rock, arkansas', since: 1995, genre: 'alt metal', photo: 'img/ISSUE03/amy-lee.jpg', accent: '#8fb2e8', ffo: ['lacuna-coil', 'type-o-negative', 'sleep-token'], hero: 'img/ISSUE03/evanescence-band.jpg',
      bio: 'amy lee\'s voice, a piano and a wall of guitars. bring me to life won them a grammy in 2004, and the self-titled 2011 album is the one we never cut up.' },
    { slug: 'papa-roach', name: 'Papa Roach', from: 'vacaville, california', since: 1993, genre: 'nu metal', photo: 'img/ARTISTS/papa-roach.jpg', accent: '#f2c14e', ffo: ['linkin-park', 'limp-bizkit', 'buckcherry'],
      bio: 'a band from a small california town that wrote one of the most shouted-along choruses of the year 2000.' },
    { slug: 'bring-me-the-horizon', name: 'Bring Me the Horizon', from: 'sheffield, england', since: 2004, genre: 'metalcore', photo: 'img/ARTISTS/bring-me-the-horizon.jpg', accent: '#9b8cff', ffo: ['sleep-token', 'linkin-park', 'babyteeth'],
      bio: 'they started as a deathcore band from sheffield and kept changing shape. sempiternal is where everybody started listening.' },
    { slug: 'sleep-token', name: 'Sleep Token', from: 'london, england', since: 2016, genre: 'alt metal', photo: 'img/FACES/sleep-token.jpg', accent: '#c9a96a', ffo: ['bring-me-the-horizon', 'deftones', 'evanescence'],
      bio: 'anonymous, masked, led by someone called vessel. half ballad, half breakdown, and a fanbase that treats it like a religion.' },
    { slug: 'violent-vira', name: 'Violent Vira', from: 'boise, idaho', since: null, genre: 'grunge pop', photo: 'img/ISSUE02/violent-vira.jpg', accent: '#ec5f9e', ffo: ['babyteeth', 'evanescence', 'wisp'], bio: null }, // bio comes from issue 02
    { slug: 'wisp', name: 'Wisp', from: 'san francisco, california', since: null, genre: 'nu-gaze', photo: 'img/ISSUE02/wisp.jpg', accent: '#b8c4d6', ffo: ['deftones', 'fleshwater', 'violent-vira'], bio: null }, // bio comes from issue 02
    { slug: 'pantera', name: 'Pantera', from: 'arlington, texas', since: 1981, genre: 'groove metal', photo: 'img/ISSUE02/pantera.jpg', accent: '#e6e6e6', ffo: ['slipknot', 'system-of-a-down', 'type-o-negative'], bio: null }, // bio comes from issue 02
    { slug: 'type-o-negative', name: 'Type O Negative', from: 'brooklyn, new york', since: 1989, genre: 'gothic doom', photo: 'img/ISSUE02/type-o-negative.jpg', accent: '#2fd36b', ffo: ['deftones', 'lacuna-coil', 'evanescence'], bio: null }, // bio comes from issue 02
    { slug: 'babyteeth', name: 'Babyteeth', from: 'the sad girl gang', since: null, genre: 'sad girl metal', photo: 'img/ISSUE02/babyteeth.jpg', accent: '#ff9ccf', ffo: ['violent-vira', 'whatsaheart', 'evanescence'], bio: null }, // bio comes from issue 02
    { slug: 'buckcherry', name: 'Buckcherry', from: 'anaheim, california', since: 1995, genre: 'hard rock', photo: 'img/ISSUE02/buckcherry.jpg', accent: '#ff6b35', ffo: ['papa-roach', 'pantera', 'limp-bizkit'], bio: null }, // bio comes from issue 02
    { slug: 'fleshwater', name: 'Fleshwater', from: 'massachusetts', since: null, genre: 'alt metal', photo: 'img/ISSUE02/fleshwater.jpg', accent: '#a3e4d7', ffo: ['deftones', 'wisp', 'korn'], bio: null }, // bio comes from issue 02
    { slug: 'whatsaheart', name: 'whatsaheart', from: 'the internet', since: null, genre: 'internet emo', photo: 'img/ISSUE02/whatsaheart.jpg', accent: '#ff7eb6', ffo: ['babyteeth', 'bring-me-the-horizon', 'violent-vira'], bio: null }, // bio comes from issue 02
    { slug: 'lacuna-coil', name: 'Lacuna Coil', from: 'milan, italy', since: 1994, genre: 'gothic metal', photo: 'img/ISSUE02/lacuna-coil.jpg', accent: '#b1121d', ffo: ['evanescence', 'type-o-negative', 'sleep-token'], bio: null }, // bio comes from issue 02
  ],
};
