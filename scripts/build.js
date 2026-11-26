const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'src');
const out = path.join(root, 'dist');
const C = require(path.join(root, 'wedding.config.js'));

const fail = msg => { console.error(`\n  GALTI: ${msg}\n`); process.exit(1); };
const esc = v => String(v ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function moment(date, time, label) {
  if (time && !/^\d{2}:\d{2}$/.test(time)) fail(`${label}: time "${time}" sahi nahi hai`);
  const d = new Date(`${date}T${time || '00:00'}:00${C.timezone}`);
  const day = new Date(`${date}T00:00:00Z`);
  if (isNaN(d) || isNaN(day) || day.toISOString().slice(0, 10) !== date)
    fail(`${label}: date "${date}" ya time "${time}" sahi nahi hai`);
  return d;
}
const fmt = (date, opts) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });
const DAYS = ['Itwar', 'Peer', 'Mangal', 'Budh', 'Jumeraat', 'Juma', 'Hafta'];
const MONTHS = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const weekday = date => DAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];
const monthName = date => MONTHS[+date.slice(5, 7) - 1];
const clock = time => {
  const [h, m] = time.split(':').map(Number);
  const part = h < 12 ? 'Subah' : h < 16 ? 'Dopahar' : h < 19 ? 'Shaam' : 'Raat';
  return `${part} ${h % 12 || 12}:${String(m).padStart(2, '0')}`;
};
const stamp = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
const dayStamp = (date, add = 0) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10).replace(/-/g, '');
};
const icsText = v => String(v).replace(/([\\,;])/g, '\\$1').replace(/\r?\n/g, '\\n');

const BLESSINGS = {
  neutral: ['', '', 'Apne parivaar ke saath'],
  muslim: ['بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', 'ar', 'Allah ke fazl o karam se'],
  hindu: ['॥ श्री गणेशाय नमः ॥', 'hi', 'Shri Ganesh ji ke aashirwad se'],
  sikh: ['ੴ ਸਤਿ ਨਾਮੁ', 'pa', 'Waheguru ji di kirpa naal'],
};
if (!BLESSINGS[C.tradition]) fail(`tradition "${C.tradition}" sahi nahi hai`);
if (!C.weddings?.length) fail('kam se kam ek shaadi chahiye');

const art = require('./art')();
const W = C.weddings.map((w, i) => {
  for (const k of ['groom', 'bride', 'date', 'venue']) if (!w[k]) fail(`shaadi ${i + 1}: "${k}" khaali hai`);
  const short = [w.groomShort || w.groom, w.brideShort || w.bride];
  const full = [w.groom, w.bride];
  const label = ['Dulha', 'Dulhan'];
  if (w.brideFirst) [short, full, label].forEach(a => a.reverse());
  return {
    ...w, short, full, label,
    pair: `${short[0]} & ${short[1]}`,
    weds: `${full[0]} weds ${full[1]}`,
    place: [w.venue, w.address].filter(Boolean).join(', '),
    start: moment(w.date, w.time, `shaadi ${i + 1}`),
  };
});
const couple = W.map(w => w.pair).join(' aur ');
const initials = W.map(w => w.short.map(n => Array.from(n.trim())[0] || ''));

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });
fs.mkdirSync(path.join(out, 'art'));
fs.mkdirSync(path.join(out, 'calendar'));
for (const [name, body] of Object.entries(art)) fs.writeFileSync(path.join(out, 'art', `${name}.svg`), body);

const dateLine = w => `${weekday(w.date)}, ${+w.date.slice(8)} ${monthName(w.date)} ${w.date.slice(0, 4)}`;

const events = W.map((w, i) => {
  const title = `Shaadi: ${w.weds}`;
  const live = /^https?:\/\//.test(w.map || '')
    ? w.map
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(w.place)}`;
  const to = new Date(+w.start + (w.hours || 6) * 36e5);
  const range = w.time ? [stamp(w.start), stamp(to)] : [dayStamp(w.date), dayStamp(w.date, 1)];
  const google = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE', text: title, dates: range.join('/'), location: w.place,
  });

  fs.writeFileSync(path.join(out, 'calendar', `${i}.ics`), [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN', 'BEGIN:VEVENT',
    `UID:${range[0]}-${i}@wedding-invitation`, `DTSTAMP:${stamp(new Date())}`,
    w.time ? `DTSTART:${range[0]}` : `DTSTART;VALUE=DATE:${range[0]}`,
    w.time ? `DTEND:${range[1]}` : `DTEND;VALUE=DATE:${range[1]}`,
    `SUMMARY:${icsText(title)}`, `LOCATION:${icsText(w.place)}`,
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n'));

  return `
      <article class="event event-wedding${i % 2 ? ' event-alt' : ''}" style="--i:${i}">
        <div class="event-in">
          <img class="event-art" src="art/event-wedding.svg" alt="">
          <p class="event-tag">${esc(w.tag || 'Shaadi')}</p>
          <h3>${esc(w.short[0])} <em>&amp;</em> ${esc(w.short[1])}</h3>
          <p class="event-line">${esc(w.full[0])} <i>weds</i> ${esc(w.full[1])}</p>
          <div class="event-when">
            <span>${weekday(w.date)}</span>
            <b>${+w.date.slice(8)} ${monthName(w.date)}</b>
            <span>${w.time ? clock(w.time) : w.date.slice(0, 4)}</span>
          </div>
          ${w.baraat ? `<p class="dress">${esc(w.baraat)}</p>` : ''}
          <p class="venue">${esc(w.venue)}</p>
          ${w.address ? `<p class="address">${esc(w.address)}</p>` : ''}
          <div class="actions">
            <a class="btn" href="${esc(live)}" target="_blank" rel="noopener"><span class="pin" aria-hidden="true"></span>Live Location</a>
            <a class="btn line" href="${esc(google)}" data-ics="calendar/${i}.ics" target="_blank" rel="noopener">Date Save</a>
          </div>
        </div>
      </article>`;
}).join('');

const cards = W.map((w, i) => `
      <div class="pair reveal">
        <p class="pair-tag">${esc(w.tag || 'Shaadi')}</p>
        <button class="flip" type="button" aria-pressed="false" aria-label="${esc(w.weds)}: card palatne ke liye tap karein">
          <span class="flip-in">
            <span class="face front${i % 2 ? ' alt' : ''}">
              <img src="art/crest.svg" alt="">
              <span class="face-names">${esc(w.short[0])} <em>&amp;</em> ${esc(w.short[1])}</span>
              <span class="hint">Card palatne ke liye tap karein</span>
              <span class="shine"></span>
            </span>
            <span class="face back">
              <span class="person"><small>${w.label[0]}</small><b>${esc(w.full[0])}</b></span>
              <span class="with">weds</span>
              <span class="person"><small>${w.label[1]}</small><b>${esc(w.full[1])}</b></span>
              <span class="back-date">${dateLine(w)}${w.time ? ` &middot; ${clock(w.time)}` : ''}</span>
              <span class="back-place">${esc(w.place)}</span>
            </span>
          </span>
        </button>
      </div>`).join('');

const heroNames = W.map(w =>
  `<span>${esc(w.short[0])} <em>&amp;</em> ${esc(w.short[1])}</span>`).join('<small>aur</small>');

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const base = (C.siteUrl || (host ? `https://${host}` : '')).replace(/\/$/, '');
const [blessing, lang, blessingLine] = BLESSINGS[C.tradition];

const days = W.map(w => +w.date.slice(8));
const sameMonth = W.every(w => w.date.slice(0, 7) === W[0].date.slice(0, 7));
const heroDate = sameMonth
  ? `${days.join(' & ')} ${monthName(W[0].date)} ${W[0].date.slice(0, 4)}`
  : W.map(w => `${+w.date.slice(8)} ${monthName(w.date)}`).join(' & ') + ` ${W[0].date.slice(0, 4)}`;

const text = {
  couple, title: W.map(w => w.pair).join(' · '),
  hosts: C.hosts || '',
  seal: initials.map(p => p.join('&')).join('\n'),
  nameLength: Math.max(10, ...W.map(w => Array.from(w.pair).length)),
  blessing, lang: lang || 'en', blessingLine, city: C.city,
  day: sameMonth ? days.join('·') : String(days[0]),
  month: monthName(W[0].date).slice(0, 4),
  year: W[0].date.slice(0, 4),
  longDate: heroDate,
  weekday: W.map(w => weekday(w.date)).join(' & '),
  ogImage: `${base}${base ? '/' : ''}og.jpg`,
  url: base || './',
};
const raw = {
  events, cards, heroNames,
  maker: (() => {
    const num = String(C.cardMaker || '').replace(/\D/g, '');
    if (!num) return '';
    const msg = 'Assalamu Alaikum! Mujhe bhi aisa online shaadi card banwana hai. Please details bataiye.';
    return `
  <footer class="maker" id="maker">
    <p>Aapko bhi aisa digital shaadi card chahiye?</p>
    <a class="btn wa" href="https://wa.me/${num}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener"><span class="wa-icon" aria-hidden="true"></span>Aisa card banwane ke liye yahan click karein</a>
  </footer>`;
  })(),
  data: JSON.stringify({
    couple, music: C.music || '',
    starts: W.map(w => ({ t: +w.start, label: w.pair, date: `${+w.date.slice(8)} ${monthName(w.date)}` })),
  }).replace(/</g, '\\u003c'),
};

for (const file of ['index.html', 'send.html']) {
  const html = fs.readFileSync(path.join(src, file), 'utf8').replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in raw) return raw[key];
    if (key in text) return esc(text[key]);
    return fail(`${file}: {{${key}}} nahi mila`);
  });
  fs.writeFileSync(path.join(out, file), html);
}

console.log(`Taiyaar: ${couple} (${text.longDate}) -> dist/`);
if (W.some(w => !w.time)) console.warn('DHYAAN: kisi shaadi ka time khaali hai, card par time nahi dikhega.');
if (C.music && !fs.existsSync(path.join(src, C.music))) console.warn(`DHYAAN: src/${C.music} nahi mili.`);
