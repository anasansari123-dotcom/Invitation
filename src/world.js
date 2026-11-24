// Peeche ki duniya: aasmaan, mahal, jheel, mehraab, lanterns aur phool.
window.World = (() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const back = document.getElementById('world');
  const front = document.getElementById('fx');
  const g = back.getContext('2d', { alpha: false });
  const x = front.getContext('2d');

  // app.js yeh values badalta hai
  const state = { cam: 0, dim: 0, open: false, finale: 0 };
  const view = { cam: -0.8, dim: 0, finale: 0 };

  let W, H, HOR, dpr, quality = Math.min(devicePixelRatio || 1, 1.75);
  let sky, lake, stars = [];
  const sprite = {};

  const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: Math.ceil(w), height: Math.ceil(h) });

  // SVG ko ek baar bitmap bana lete hain, taaki har frame halka rahe
  function load(name, w, h) {
    const img = new Image();
    img.onload = () => {
      const c = canvas(w, h);
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      sprite[name] = c;
    };
    img.src = `art/${name}.svg`;
  }
  load('palace', 1100, 688);
  ['teal', 'plum', 'rose'].forEach(n => load(`gate-${n}`, 700, 1100));
  load('lantern', 100, 130);
  load('diya', 80, 70);

  const glow = (() => {
    const c = canvas(64, 64), q = c.getContext('2d'), r = q.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, '#fff6cc');
    r.addColorStop(.18, 'rgba(255,205,110,.75)');
    r.addColorStop(1, 'rgba(255,180,70,0)');
    q.fillStyle = r;
    q.fillRect(0, 0, 64, 64);
    return c;
  })();

  const petalArt = [['#ffb3c1', '#c92f5d'], ['#ffd76a', '#e5701d'], ['#fff3d6', '#e9a7a0'], ['#ef5675', '#7d1234']].map(([a, b]) => {
    const c = canvas(32, 40), q = c.getContext('2d'), l = q.createLinearGradient(4, 0, 24, 40);
    l.addColorStop(0, a);
    l.addColorStop(1, b);
    q.fillStyle = l;
    q.beginPath();
    q.moveTo(16, 39);
    q.bezierCurveTo(-8, 22, 2, 0, 14, 4);
    q.quadraticCurveTo(16, 8, 19, 3);
    q.bezierCurveTo(32, 2, 38, 24, 16, 39);
    q.fill();
    return c;
  });

  function size() {
    const w = back.clientWidth, h = back.clientHeight;
    if (w === W && h === H && dpr === quality) return;
    W = w; H = h; HOR = H * .74; dpr = quality;
    for (const c of [back, front]) { c.width = W * dpr; c.height = H * dpr; }
    paintSky();
    paintLake();
  }

  function paintSky() {
    sky = canvas(W * dpr, HOR * dpr);
    const q = sky.getContext('2d');
    q.scale(dpr, dpr);
    const l = q.createLinearGradient(0, 0, 0, HOR);
    [[0, '#030a1c'], [.36, '#0b2140'], [.68, '#3b2858'], [.88, '#8a3f61'], [1, '#d77f63']].forEach(s => l.addColorStop(...s));
    q.fillStyle = l;
    q.fillRect(0, 0, W, HOR + 2);

    // Chaand aur uska noor
    const mx = W * .17, my = H * .075, r = Math.min(30, W * .06);
    const halo = q.createRadialGradient(mx, my, r * .5, mx, my, r * 6);
    halo.addColorStop(0, 'rgba(255,230,185,.36)');
    halo.addColorStop(1, 'rgba(255,230,185,0)');
    q.fillStyle = halo;
    q.fillRect(mx - r * 6, my - r * 6, r * 12, r * 12);
    q.fillStyle = '#fff0cf';
    q.beginPath(); q.arc(mx, my, r, 0, TAU); q.fill();
    q.fillStyle = 'rgba(190,150,130,.18)';
    [[-.3, -.2, .26], [.25, .3, .2], [.35, -.35, .13], [-.15, .45, .12]].forEach(([a, b, c]) => {
      q.beginPath(); q.arc(mx + a * r, my + b * r, c * r, 0, TAU); q.fill();
    });

    // Door ke pahaad
    [['#4d2c58', .075], ['#2b1c46', .04]].forEach(([color, amp], k) => {
      q.fillStyle = color;
      q.beginPath();
      q.moveTo(0, HOR + 1);
      for (let i = 0; i <= 50; i++)
        q.lineTo(W * i / 50, HOR - H * amp * (.5 + .25 * Math.sin(i * .37 + k * 2) + .18 * Math.sin(i * .91 + k)));
      q.lineTo(W, HOR + 1);
      q.fill();
    });

    stars = Array.from({ length: Math.min(230, W * H / 2600) }, () => ({
      x: rand(0, W), y: rand(0, HOR * .8), r: rand(.4, 1.4), p: rand(0, TAU),
    }));
  }

  function paintLake() {
    lake = g.createLinearGradient(0, HOR, 0, H);
    [[0, '#9b5468'], [.2, '#36254f'], [1, '#04101f']].forEach(s => lake.addColorStop(...s));
  }

  // ---------- particles ----------
  const lamps = Array.from({ length: 34 }, () => ({
    x: Math.random(), y: Math.random(), z: rand(.18, 1), p: rand(0, TAU),
  })).sort((a, b) => a.z - b.z);
  const petals = [], sparks = [], wishes = [];

  function petal(px = rand(0, W), py = -30, vx = rand(-12, 18), vy = rand(28, 55), burst = false) {
    petals.push({ age: 0, x: px, y: py, vx, vy, burst, r: rand(0, TAU), spin: rand(-2, 2), s: rand(.3, .72), img: petalArt[Math.random() * 4 | 0] });
  }

  function burst(px, py, n = 90) {
    if (still) return;
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), v = rand(80, 560);
      petal(px, py, Math.cos(a) * v, Math.sin(a) * v - 90, true);
    }
  }

  function firework(px = rand(W * .15, W * .85), py = rand(H * .12, H * .4)) {
    if (still) return;
    const color = ['#ffe08a', '#ff8fab', '#8ff0dc', '#fff6dc'][Math.random() * 4 | 0];
    for (let i = 0; i < 64; i++) {
      const a = i / 64 * TAU, v = i % 2 ? rand(70, 110) : rand(140, 210);
      sparks.push({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(1, 1.7), color });
    }
  }

  function wish(label) {
    wishes.push({ t: 0, label, drift: rand(-.22, .22) });
  }

  // ---------- drawing ----------
  function drawPalace(t) {
    const p = sprite.palace;
    if (!p) return;
    const travel = clamp(view.cam / 5) * (1 - view.finale);
    const w = Math.min(W * .88, H * .52) * (1 + travel * .55);
    const h = w * .625, left = (W - w) / 2;
    g.drawImage(p, left, HOR - h, w, h);

    // Paani mein hilti parchhai
    const n = 22, rh = Math.min(h * .62, H - HOR);
    g.globalAlpha = .3;
    for (let i = 0; i < n; i++) {
      const wave = Math.sin(t * 2.2 + i * .9) * (1 + i * .22);
      g.drawImage(p, 0, p.height * (1 - (i + 1) / n), p.width, p.height / n, left + wave, HOR + rh * i / n, w, rh / n + .5);
    }
    g.globalAlpha = 1;
  }

  function drawWater(t) {
    g.fillStyle = '#f5c98c';
    for (let i = 0; i < 46; i++) {
      const p = i / 46, w = (5 + p * 34) * (.6 + .4 * Math.sin(t + i));
      g.globalAlpha = .07 + .1 * Math.abs(Math.sin(t * 1.4 + i * 2));
      g.fillRect((i * .618 % 1) * W + Math.sin(t * .6 + i) * 8, HOR + p * p * (H - HOR), w, 1);
    }
    g.globalAlpha = 1;
  }

  function drawPath(t) {
    const depth = H - HOR, half = Math.min(W * .34, H * .22);
    g.fillStyle = 'rgba(255,214,150,.09)';
    g.beginPath();
    g.moveTo(W / 2 - 7, HOR); g.lineTo(W / 2 + 7, HOR);
    g.lineTo(W / 2 + half * 1.1, H); g.lineTo(W / 2 - half * 1.1, H);
    g.fill();
    if (!sprite.diya) return;

    const shift = ((view.cam * 2) % 1 + 1) % 1;
    for (let i = 12; i >= 0; i--) {
      const d = i - shift + 1;
      if (d < .55) continue;
      const s = 1 / (.45 + d * .55), px = half * s, py = HOR + depth * .94 * s;
      const size = 46 * s * (1 + .07 * Math.sin(t * 9 + i));
      g.drawImage(sprite.diya, W / 2 - px - size / 2, py - size * .6, size, size * .875);
      g.drawImage(sprite.diya, W / 2 + px - size / 2, py - size * .6, size, size * .875);
    }
  }

  function drawLamps(t, dt) {
    const img = sprite.lantern;
    if (!img) return;
    const n = Math.round(14 + 20 * view.finale);
    for (let i = 0; i < n; i++) {
      const l = lamps[i * 7 % lamps.length];
      if (!still) l.y = (l.y - dt * .022 * (.4 + l.z) + 1) % 1;
      const s = 12 + l.z * 30;
      // Naam ke peeche lanterns halke
      const behindText = l.y < .68 && Math.abs(l.x - .5) < .3 ? .22 : 1;
      g.globalAlpha = Math.min(1, l.y * 6, (1 - l.y) * 6) * (.35 + l.z * .65) * behindText;
      g.drawImage(img, l.x * W + Math.sin(t * .5 + l.p) * 15 - s / 2, l.y * HOR - s / 2, s, s * 1.3);
    }
    g.globalAlpha = 1;
  }

  function drawGates() {
    const names = ['teal', 'plum', 'rose', 'teal', 'plum'];
    const gw = W < H * .75 ? W * 1.16 : H * .92;
    const gh = H * 1.06, top = -H * .05;
    for (let i = names.length - 1; i >= 0; i--) {
      const img = sprite[`gate-${names[i]}`];
      const d = 1 + i - view.cam;
      if (!img || d <= .22) continue;
      let alpha = clamp((d - .22) / .28) * clamp(1.25 - d * .17) * (1 - view.finale);
      if (i) alpha *= clamp(view.cam * 2.2);
      if (alpha < .01) continue;
      const s = 1 / d;
      g.globalAlpha = alpha;
      g.drawImage(img, W / 2 - gw * s / 2, HOR + (top - HOR) * s, gw * s, gh * s);
    }
    g.globalAlpha = 1;
  }

  function drawWishes(dt) {
    for (let i = wishes.length - 1; i >= 0; i--) {
      const w = wishes[i];
      if ((w.t += dt / 7) >= 1) { wishes.splice(i, 1); continue; }
      const e = 1 - (1 - w.t) ** 2, s = 108 * (1 - e * .65);
      const px = W / 2 + w.drift * W * e + Math.sin(w.t * 9) * 12, py = H * .86 - e * H * .84;
      g.globalAlpha = Math.min(1, (1 - w.t) * 4);
      if (sprite.lantern) g.drawImage(sprite.lantern, px - s / 2, py - s / 2, s, s * 1.3);
      g.fillStyle = '#fff0c4';
      g.font = `italic ${Math.max(13, s * .2)}px Serif, serif`;
      g.textAlign = 'center';
      g.fillText(w.label, px, py + s * .85);
    }
    g.globalAlpha = 1;
  }

  function drawFx(t, dt) {
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, W, H);
    if (state.open && !still && petals.length < 16 && Math.random() < dt * 2) petal();

    for (let i = petals.length - 1; i >= 0; i--) {
      const p = petals[i];
      p.age += dt;
      if (p.burst) {
        const k = Math.exp(-dt * 1.7);
        p.vx *= k;
        p.vy = p.vy * k + 120 * dt;
      }
      p.x += (p.vx + Math.sin(t + p.r) * 12) * dt;
      p.y += p.vy * dt;
      p.r += p.spin * dt;
      if (p.y > H + 40 || (p.burst && p.age > 3.4) || p.x < -90 || p.x > W + 90) { petals.splice(i, 1); continue; }
      // rotate + flip, bina save/restore ke
      const c = Math.cos(p.r) * p.s, s = Math.sin(p.r) * p.s, f = Math.cos(p.r * 1.7);
      // Udte phool text ke peeche, sirf dhamake wale aage
      const layer = p.burst ? x : g;
      layer.globalAlpha = p.burst ? clamp((3.4 - p.age) / 1.2) : .85;
      layer.setTransform(c * dpr, s * dpr, -s * f * dpr, c * f * dpr, p.x * dpr, p.y * dpr);
      layer.drawImage(p.img, -16, -20);
    }

    g.globalAlpha = x.globalAlpha = 1;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      if ((p.life -= dt) <= 0) { sparks.splice(i, 1); continue; }
      const k = Math.exp(-dt * 1.5);
      p.vx *= k;
      p.vy = p.vy * k + 45 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      x.globalAlpha = Math.min(1, p.life);
      x.strokeStyle = p.color;
      x.lineWidth = 2;
      x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x - p.vx * .07, p.y - p.vy * .07); x.stroke();
    }
    x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over';
  }

  let last = 0, clockT = 0, slow = 0, nextShow = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const raw = (now - last) / 1000, dt = clamp(raw, 0, .05);
    last = now;
    clockT += dt;
    const t = still ? 0 : clockT;

    // Kamzor phone par resolution khud kam ho jata hai
    if (raw < .2) slow = raw > .024 ? slow + 1 : Math.max(0, slow - 1);
    if (slow > 75 && quality > 1) { quality = Math.max(1, quality - .35); slow = 0; size(); }

    const ease = still ? 1 : 1 - Math.exp(-dt * 6);
    const cam = still ? 0 : state.open ? state.cam : -.8;
    view.cam += (cam - view.cam) * (state.cam < .02 && !still ? ease * .3 : ease);
    view.dim += (state.dim - view.dim) * ease;
    view.finale += (state.finale - view.finale) * ease;

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.drawImage(sky, 0, 0, W, HOR + 1);
    g.fillStyle = lake;
    g.fillRect(0, HOR, W, H - HOR);
    for (const s of stars) {
      g.globalAlpha = .45 + .45 * Math.sin(t * 1.5 + s.p);
      g.drawImage(glow, s.x - s.r * 3, s.y - s.r * 3, s.r * 6, s.r * 6);
    }
    g.globalAlpha = 1;
    drawPalace(t);
    drawWater(t);
    drawPath(t);
    drawLamps(t, dt);
    drawGates();
    if (view.dim > .005) {
      g.fillStyle = `rgba(4,14,27,${view.dim})`;
      g.fillRect(0, 0, W, H);
    }
    drawWishes(dt);

    if (view.finale > .7 && t > nextShow) { firework(W * (Math.random() < .5 ? rand(.06, .2) : rand(.8, .94)), H * rand(.2, .5)); nextShow = t + rand(1.4, 2.6); }
    drawFx(t, dt);
  }

  size();
  addEventListener('resize', size);
  requestAnimationFrame(frame);

  return { state, burst, firework, wish };
})();
