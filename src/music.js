// Original music: tanpura drone + santoor, phone mein hi banta hai (0 KB download, no copyright).
window.Music = (() => {
  let ctx, out, echo, timer, player, next = 0, step = 0;
  let wanted = false;
  const notes = new Map();

  // Raag Yaman ke sur, Sa = D
  const SCALE = [0, 2, 4, 6, 7, 9, 11];
  const hz = n => 293.66 * 2 ** ((SCALE[((n % 7) + 7) % 7] + 12 * Math.floor(n / 7)) / 12);
  const _ = null;
  const TUNE = [
    -1, _, 1, 2, 3, _, 2, _, 4, _, 3, 2, 1, _, _, _,
    2, _, 3, 5, 6, _, 5, _, 4, 3, 2, _, 1, _, 0, _,
    4, _, 5, 6, 8, _, 7, _, 6, 5, 4, _, 3, 4, 2, _,
    1, 2, 3, _, 2, 1, -1, _, 0, _, _, _, _, _, _, _,
  ];

  // Karplus-Strong: khinche hue taar ki awaaz
  function pluck(freq, seconds) {
    const key = `${freq}:${seconds}`;
    if (notes.has(key)) return notes.get(key);
    const sr = ctx.sampleRate, len = Math.floor(sr * seconds), N = Math.max(2, Math.round(sr / freq));
    const buffer = ctx.createBuffer(1, len, sr), d = buffer.getChannelData(0);
    const decay = .001 ** (1 / (freq * seconds));
    let soft = 0;
    for (let i = 0; i < N; i++) d[i] = soft += (Math.random() * 2 - 1 - soft) * .55;
    for (let i = N; i < len; i++) d[i] = (d[i - N] + d[i - N + 1]) * .5 * decay;
    for (let i = 1; i <= 2000; i++) d[len - i] *= i / 2000;
    notes.set(key, buffer);
    return buffer;
  }

  function play(freq, at, gain, seconds, wet) {
    const src = ctx.createBufferSource(), vol = ctx.createGain();
    src.buffer = pluck(freq, seconds);
    vol.gain.value = gain;
    src.connect(vol);
    vol.connect(out);
    if (wet) vol.connect(echo);
    src.start(at);
  }

  function schedule() {
    if (ctx.state !== 'running') return;
    if (next < ctx.currentTime) next = ctx.currentTime + .08;
    while (next < ctx.currentTime + .7) {
      const i = step % TUNE.length, n = TUNE[i];
      if (n !== null) {
        play(hz(n), next, .34, 2, true);
        play(hz(n), next + .07, .09, 2, true);
      }
      if (i % 4 === 0) play([110, 146.83, 146.83, 73.42][(i / 4) % 4], next, .2, 4, false);
      step++;
      next += .39;
    }
  }

  function create() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    out = ctx.createGain();
    out.gain.setValueAtTime(0, ctx.currentTime);
    out.gain.linearRampToValueAtTime(.65, ctx.currentTime + 2.5);
    out.connect(ctx.destination);

    echo = ctx.createDelay(1);
    echo.delayTime.value = .39;
    const feedback = ctx.createGain(), tone = ctx.createBiquadFilter(), wet = ctx.createGain();
    feedback.gain.value = .36;
    tone.type = 'lowpass';
    tone.frequency.value = 2400;
    wet.gain.value = .4;
    echo.connect(tone);
    tone.connect(feedback);
    feedback.connect(echo);
    tone.connect(wet);
    wet.connect(out);
    timer = setInterval(schedule, 150);
  }

  function apply() {
    const on = wanted && !document.hidden;
    if (player) {
      if (on) player.play().catch(() => {});
      else player.pause();
    } else if (ctx) {
      if (on) ctx.resume().then(schedule).catch(() => {});
      else ctx.suspend();
    }
  }

  function set(on, file) {
    wanted = on;
    try {
      if (on && !ctx && !player) {
        if (file) {
          player = new Audio(file);
          player.loop = true;
          player.volume = .7;
        } else create();
      }
      apply();
    } catch (err) {
      console.warn('Music unavailable', err);
      clearInterval(timer);
    }
  }

  document.addEventListener('visibilitychange', apply);
  return { set };
})();
