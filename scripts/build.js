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
  const d = new Date(`${date}T${time}:00${C.timezone}`);
  const day = new Date(`${date}T00:00:00Z`);
  if (isNaN(d) || isNaN(day) || day.toISOString().slice(0, 10) !== date)
    fail(`${label}: date "${date}" ya time "${time}" sahi nahi hai`);
  return d;
}
const fmt = (date, opts) => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });
const clock = time => {
  const [h, m] = time.split(':');
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
};
const stamp = d => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
const icsText = v => String(v).replace(/([\\,;])/g, '\\$1').replace(/\r?\n/g, '\\n');

const BLESSINGS = {
  neutral: ['', '', 'Together with their families'],
  muslim: ['بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ', 'ar', 'In the name of Allah, the Most Merciful'],
  hindu: ['॥ श्री गणेशाय नमः ॥', 'hi', 'With the blessings of Lord Ganesha'],
  sikh: ['ੴ ਸਤਿ ਨਾਮੁ', 'pa', 'With the grace of Waheguru'],
};
if (!BLESSINGS[C.tradition]) fail(`tradition "${C.tradition}" sahi nahi hai`);
if (!C.events?.length) fail('kam se kam ek event chahiye');

const art = require('./art')();
const [first, second] = C.groomFirst ? [C.groom, C.bride] : [C.bride, C.groom];
const couple = `${first.name} & ${second.name}`;
const initial = p => Array.from(p.name.trim())[0] || '';
const start = moment(C.weddingDate, C.weddingTime, 'Wedding');

fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(src, out, { recursive: true });
fs.mkdirSync(path.join(out, 'art'));
fs.mkdirSync(path.join(out, 'calendar'));
for (const [name, body] of Object.entries(art)) fs.writeFileSync(path.join(out, 'art', `${name}.svg`), body);

const events = C.events.map((e, i) => {
  if (!art[`event-${e.art}`]) fail(`${e.name}: art "${e.art}" sahi nahi hai`);
  const from = moment(e.date, e.time, e.name);
  const to = new Date(+from + (e.hours || 4) * 36e5);
  const place = `${e.venue}, ${e.address}`;
  const title = `${e.name}: ${couple}`;
  const map = /^https?:\/\//.test(e.map || '')
    ? e.map
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
  const google = 'https://calendar.google.com/calendar/render?' + new URLSearchParams({
    action: 'TEMPLATE', text: title, dates: `${stamp(from)}/${stamp(to)}`, location: place,
  });

  fs.writeFileSync(path.join(out, 'calendar', `${i}.ics`), [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invitation//EN', 'BEGIN:VEVENT',
    `UID:${stamp(from)}-${i}@wedding-invitation`, `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(from)}`, `DTEND:${stamp(to)}`,
    `SUMMARY:${icsText(title)}`, `LOCATION:${icsText(place)}`,
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n'));

  return `
      <article class="event event-${e.art}" style="--i:${i}">
        <div class="event-in">
          <img class="event-art" src="art/event-${e.art}.svg" alt="">
          <h3>${esc(e.name)}</h3>
          <p class="event-line">${esc(e.line)}</p>
          <div class="event-when">
            <span>${fmt(e.date, { weekday: 'long' })}</span>
            <b>${fmt(e.date, { day: '2-digit' })} ${fmt(e.date, { month: 'short' })}</b>
            <span>${clock(e.time)}</span>
          </div>
          <p class="venue">${esc(e.venue)}</p>
          <p class="address">${esc(e.address)}</p>
          ${e.dress ? `<p class="dress">Dress code &middot; ${esc(e.dress)}</p>` : ''}
          <div class="actions">
            <a class="btn" href="${esc(map)}" target="_blank" rel="noopener">View map</a>
            <a class="btn line" href="${esc(google)}" data-ics="calendar/${i}.ics" target="_blank" rel="noopener">Save date</a>
          </div>
        </div>
      </article>`;
}).join('');

const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const base = (C.siteUrl || (host ? `https://${host}` : '')).replace(/\/$/, '');
const [blessing, lang, blessingLine] = BLESSINGS[C.tradition];
const phone = String(C.whatsapp || '').replace(/\D/g, '');

const text = {
  couple,
  first: first.name, second: second.name,
  firstFull: first.fullName, secondFull: second.fullName,
  firstRelation: first.relation, secondRelation: second.relation,
  firstParents: first.parents, secondParents: second.parents,
  firstFamily: first.family, secondFamily: second.family,
  firstInitial: initial(first), secondInitial: initial(second),
  nameLength: Math.max(5, Array.from(first.name).length, Array.from(second.name).length),
  blessing, lang: lang || 'en', blessingLine, city: C.city,
  day: fmt(C.weddingDate, { day: '2-digit' }),
  month: fmt(C.weddingDate, { month: 'short' }).slice(0, 3),
  year: C.weddingDate.slice(0, 4),
  longDate: fmt(C.weddingDate, { day: 'numeric', month: 'long', year: 'numeric' }),
  weekday: fmt(C.weddingDate, { weekday: 'long' }),
  time: clock(C.weddingTime),
  ogImage: `${base}${base ? '/' : ''}og.jpg`,
  url: base || './',
};
const raw = {
  events,
  data: JSON.stringify({ start: +start, couple, phone, music: C.music || '' }).replace(/</g, '\\u003c'),
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
if (!phone) console.warn('DHYAAN: whatsapp number khaali hai, RSVP guest se contact chunwayega.');
if (/Sample|Example|Venue address/.test(JSON.stringify(C))) console.warn('DHYAAN: card mein abhi sample details hain, bhejne se pehle badlein.');
if (C.music && !fs.existsSync(path.join(src, C.music))) console.warn(`DHYAAN: src/${C.music} nahi mili.`);
