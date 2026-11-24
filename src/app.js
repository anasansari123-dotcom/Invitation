(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const data = JSON.parse($('#data').textContent);
  const { state, burst, firework, wish } = window.World;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  const guest = (new URLSearchParams(location.search).get('to') || '').trim().slice(0, 70);
  if (guest) {
    $('#guest').textContent = guest;
    $('#rsvp').elements.name.value = guest;
  }

  // Mohar todna
  const open = $('#open');
  open.addEventListener('click', () => {
    open.disabled = true;
    const r = open.getBoundingClientRect();
    burst(r.x + r.width / 2, r.y + r.height / 2);
    window.Music.set(true, data.music);
    navigator.vibrate?.(35);
    $('#entrance').classList.add('opening');

    setTimeout(() => {
      state.open = true;
      burst(innerWidth / 2, innerHeight * .4, 60);
    }, still ? 0 : 1000);
    setTimeout(() => document.body.classList.add('entered'), still ? 0 : 1900);
    setTimeout(() => {
      $('#entrance').remove();
      document.body.classList.remove('closed');
      $('#card').inert = false;
      measure();
    }, still ? 50 : 3300);
  });

  const sound = $('#sound');
  sound.addEventListener('click', () => {
    const on = sound.getAttribute('aria-pressed') !== 'true';
    sound.setAttribute('aria-pressed', on);
    sound.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on');
    window.Music.set(on, data.music);
  });

  // Scroll se camera
  const hero = $('.hero-copy'), cue = $('.cue'), chapters = $$('.chapter');
  const cards = $$('.event-in'), holders = $$('.event');
  let H, vh, journeyTop, journeySpan, detailsTop, finaleTop, deckTop, deckEnd;

  function measure() {
    const y = scrollY, top = el => el.getBoundingClientRect().top + y;
    H = innerHeight;
    vh = $('#world').clientHeight;
    journeyTop = top($('#journey'));
    journeySpan = $('#journey').offsetHeight - vh;
    detailsTop = top($('#details'));
    finaleTop = top($('#finale'));
    deckTop = top($('.deck'));
    deckEnd = deckTop + $('.deck').offsetHeight;
    update();
  }

  function update() {
    const y = scrollY;
    const end = journeyTop + journeySpan, p = clamp(y / end);
    state.cam = p * 5.2;
    state.finale = clamp((y + H - finaleTop - H * .2) / (H * .6));
    state.dim = clamp((y + H - detailsTop) / (H * .6)) * .68 * (1 - state.finale);

    const fade = clamp(1 - y / (H * .55));
    hero.style.opacity = fade;
    hero.style.transform = `translate3d(0,${y * .35}px,0) scale(${1 + (1 - fade) * .18})`;
    cue.style.opacity = fade === 1 ? 1 : 0;

    const q = clamp((y - journeyTop + H * .35) / (journeySpan + H * .35));
    chapters.forEach((el, i) => {
      const local = q * chapters.length - i;
      const last = i === chapters.length - 1;
      el.style.opacity = clamp(Math.min(local * 4, last ? 1 : (1 - local) * 4));
      el.style.transform = `scale(${.86 + clamp(local) * .22})`;
    });

    // Neeche wala card peeche khisakta hai
    if (!still && y + H > deckTop && y < deckEnd) {
      const tops = holders.map(el => el.getBoundingClientRect().top);
      cards.forEach((el, i) => {
        const cover = i + 1 < tops.length ? clamp(1 - (tops[i + 1] - tops[i] - 12) / (H * .7)) : 0;
        el.style.transform = `scale(${1 - cover * .07})`;
      });
    }
  }

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, { passive: true });
  addEventListener('resize', measure);
  addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  measure();

  const seen = new IntersectionObserver(list => list.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    seen.unobserve(e.target);
  }), { threshold: .12 });
  $$('.reveal').forEach(el => seen.observe(el));

  const flip = $('#flip');
  flip.addEventListener('click', () => flip.setAttribute('aria-pressed', flip.getAttribute('aria-pressed') !== 'true'));

  // Sone ke sikke khurchna
  const coins = $$('.coin');
  function reveal(coin) {
    if (coin.classList.contains('done')) return;
    coin.classList.add('done');
    const r = coin.getBoundingClientRect();
    burst(r.x + r.width / 2, r.y + r.height / 2, 22);
    navigator.vibrate?.(20);
    if (!coins.every(c => c.classList.contains('done'))) return;
    $('.date').classList.add('revealed');
    $('#scratch-note').textContent = 'It is written. See you there!';
    for (let i = 0; i < 6; i++) setTimeout(() => firework(), i * 380);
  }

  coins.forEach(coin => {
    const c = coin.querySelector('canvas'), g = c.getContext('2d'), N = 240;
    c.width = c.height = N;
    const gold = g.createLinearGradient(0, 0, N, N);
    [[0, '#8f5f25'], [.25, '#f9e3a3'], [.5, '#bd8940'], [.75, '#ffefbd'], [1, '#966329']].forEach(s => gold.addColorStop(...s));
    g.fillStyle = gold;
    g.fillRect(0, 0, N, N);
    g.strokeStyle = 'rgba(98,56,14,.5)';
    g.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      g.save();
      g.translate(N / 2, N / 2);
      g.rotate(i * Math.PI / 8);
      g.beginPath(); g.ellipse(58, 0, 40, 12, 0, 0, Math.PI * 2); g.stroke();
      g.restore();
    }
    g.globalCompositeOperation = 'destination-out';
    g.strokeStyle = '#000';
    g.lineWidth = 62;
    g.lineCap = g.lineJoin = 'round';

    const hit = new Set();
    let from = null;
    const point = e => {
      const r = c.getBoundingClientRect();
      return [(e.clientX - r.x) / r.width * N, (e.clientY - r.y) / r.height * N];
    };
    const rub = to => {
      g.beginPath(); g.moveTo(...from); g.lineTo(to[0] + .1, to[1]); g.stroke();
      const n = Math.ceil(Math.hypot(to[0] - from[0], to[1] - from[1]) / 12) + 1;
      for (let i = 0; i <= n; i++) {
        const px = from[0] + (to[0] - from[0]) * i / n, py = from[1] + (to[1] - from[1]) * i / n;
        for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++)
          if (Math.hypot(a * 24 + 12 - px, b * 24 + 12 - py) < 31) hit.add(a * 10 + b);
      }
      from = to;
      if (hit.size > 34) { from = null; reveal(coin); }
    };
    c.addEventListener('pointerdown', e => {
      c.setPointerCapture(e.pointerId);
      from = point(e);
      rub(from);
    });
    c.addEventListener('pointermove', e => { if (from) rub(point(e)); });
    const stop = () => { from = null; };
    c.addEventListener('pointerup', stop);
    c.addEventListener('pointercancel', stop);
  });
  $('#reveal-date').addEventListener('click', () => coins.forEach(reveal));

  // Countdown
  const count = $('#countdown'), digits = $$('#countdown b');
  let interval;
  function tick() {
    const s = Math.floor((data.start - Date.now()) / 1000);
    if (s <= 0) {
      count.classList.add('over');
      count.textContent = 'The celebration has begun';
      clearInterval(interval);
      return;
    }
    [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60]
      .forEach((v, i) => { digits[i].textContent = String(v).padStart(2, '0'); });
  }
  interval = setInterval(tick, 1000);
  tick();

  // iPhone par Apple Calendar, baaki sab par Google Calendar
  if (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    $$('[data-ics]').forEach(a => { a.href = a.dataset.ics; a.removeAttribute('target'); });
  }

  // RSVP
  const form = $('#rsvp');
  form.addEventListener('change', () => {
    const no = form.elements.answer.value === 'no';
    $('#count-field').hidden = no;
    form.elements.count.disabled = no;
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const { name, answer, count: n, wish: note } = form.elements;
    const yes = answer.value === 'yes';
    const lines = [
      `*Wedding RSVP: ${data.couple}*`, '',
      `Name: ${name.value.trim()}`,
      yes ? 'We joyfully accept!' : 'Sorry, I cannot attend, but I send all my love.',
    ];
    if (yes) lines.push(`Guests: ${n.value}`);
    if (note.value.trim()) lines.push('', note.value.trim());
    const url = `https://wa.me/${data.phone}?text=${encodeURIComponent(lines.join('\n'))}`;
    // WhatsApp ka in-app browser popup rok de to usi tab mein kholo
    const tab = window.open(url, '_blank');
    if (tab) tab.opener = null;
    else location.href = url;
  });

  $('#release').addEventListener('click', () => {
    wish(guest ? `With love, ${guest}` : 'With love and blessings');
    $('#wish-note').textContent = 'Your blessing is on its way to the stars';
    setTimeout(() => firework(), 1600);
  });
})();
