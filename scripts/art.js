// Saara artwork yahin se SVG mein banta hai (koi bahar ki image nahi).
const f = n => +n.toFixed(1);
const times = (n, fn) => Array.from({ length: n }, (_, i) => fn(i)).join('');
const mirror = (w, s) => `${s}<g transform="translate(${w} 0) scale(-1 1)">${s}</g>`;

const DEFS = `<defs>
<linearGradient id="g" x2="1" y2="1"><stop stop-color="#8a5a24"/><stop offset=".25" stop-color="#f9e3a3"/><stop offset=".5" stop-color="#bd8940"/><stop offset=".75" stop-color="#ffefbd"/><stop offset="1" stop-color="#966329"/></linearGradient>
<linearGradient id="dome" x2="1"><stop stop-color="#1c2552"/><stop offset=".36" stop-color="#b58cae"/><stop offset=".55" stop-color="#6d5f92"/><stop offset="1" stop-color="#151c45"/></linearGradient>
<linearGradient id="wall" x2="0" y2="1"><stop stop-color="#59477a"/><stop offset="1" stop-color="#a35a62"/></linearGradient>
<linearGradient id="shade" x2="1"><stop stop-color="#0a1238" stop-opacity=".6"/><stop offset=".4" stop-color="#0a1238" stop-opacity="0"/><stop offset="1" stop-color="#0a1238" stop-opacity=".5"/></linearGradient>
<radialGradient id="lit" cy=".8" r=".9"><stop stop-color="#fff8d0"/><stop offset=".35" stop-color="#ffc260"/><stop offset="1" stop-color="#b14d2c"/></radialGradient>
<radialGradient id="glow"><stop stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
<radialGradient id="wax" cx=".36" cy=".3" r=".8"><stop stop-color="#c8455a"/><stop offset=".5" stop-color="#871b34"/><stop offset="1" stop-color="#430719"/></radialGradient>
</defs>`;

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${DEFS}${body}</svg>`;

const ring = (cx, cy, n, shape) =>
  `<g transform="translate(${cx} ${cy})">${times(n, i => `<g transform="rotate(${f(i * 360 / n)})">${shape}</g>`)}</g>`;

const arch = (x, y, w, h) => {
  const s = y + Math.min(w * .65, h * .5);
  return `M${x} ${y + h}V${s}C${x} ${f(s - w * .4)} ${x + w * .36} ${y + w * .16} ${x + w / 2} ${y}C${x + w * .64} ${y + w * .16} ${x + w} ${f(s - w * .4)} ${x + w} ${s}V${y + h}Z`;
};

// Multifoil mehraab
function cusped(cx, top, hw, spring, bottom) {
  const c = [[cx - hw, spring], [cx - hw, spring - (spring - top) * .6], [cx - hw * .45, top + (spring - top) * .16], [cx, top]];
  const at = t => [0, 1].map(k =>
    (1 - t) ** 3 * c[0][k] + 3 * (1 - t) ** 2 * t * c[1][k] + 3 * (1 - t) * t * t * c[2][k] + t ** 3 * c[3][k]);
  const left = Array.from({ length: 7 }, (_, i) => at(i / 6));
  const p = left.concat(left.slice(0, 6).reverse().map(([x, y]) => [2 * cx - x, y]));
  let d = `M${f(cx - hw)} ${bottom}V${f(spring)}`;
  p.slice(1).forEach(([x, y], i) => {
    const r = f(Math.hypot(x - p[i][0], y - p[i][1]) * .56);
    d += `A${r} ${r} 0 0 1 ${f(x)} ${f(y)}`;
  });
  return d + `V${bottom}Z`;
}

const dome = (x, b, w, h) => `<path d="M${x - w * .4} ${b}C${x - w * .68} ${b - h * .42} ${x - w * .3} ${b - h * .75} ${x} ${b - h}C${x + w * .3} ${b - h * .75} ${x + w * .68} ${b - h * .42} ${x + w * .4} ${b}Z" fill="url(#dome)" stroke="#e5b978" stroke-opacity=".65"/>
<path d="M${x} ${b - h}Q${x - w * .5} ${b - h * .3} ${x - w * .17} ${b}M${x} ${b - h}Q${x + w * .5} ${b - h * .3} ${x + w * .17} ${b}M${x} ${b - h}V${b}" fill="none" stroke="#f5cc92" stroke-opacity=".25"/>
<path d="M${x - w * .46} ${b}h${w * .92}v5h${-w * .92}z" fill="url(#g)"/><path d="M${x} ${b - h + 2}v${-h * .3}" stroke="#f5d48e" stroke-width="2"/>
<circle cx="${x}" cy="${b - h - 4}" r="${Math.max(2, w * .035)}" fill="#ffe3a0"/><circle cx="${x}" cy="${b - h * 1.18}" r="${Math.max(1.4, w * .022)}" fill="#ffe3a0"/>`;

const windows = (x, y, n, w, h, gap) => times(n, i => {
  const a = x + i * gap;
  return `<path d="${arch(a, y, w, h)}" fill="url(#lit)" stroke="#e8bb78" stroke-width="1.4"/><path d="M${a + w / 2} ${y + h * .4}V${y + h}M${a} ${y + h * .67}h${w}" stroke="#6b3441" stroke-opacity=".5"/>`;
});

const block = (x, y, w, h) =>
  `<path d="M${x} ${y}h${w}v${h}h${-w}z" fill="url(#wall)"/><path d="M${x} ${y}h${w}v${h}h${-w}z" fill="url(#shade)"/><path d="M${x - 3} ${y}h${w + 6}v5h${-w - 6}z" fill="url(#g)"/>`;

const kiosk = (x, b, w) =>
  `<path d="M${x - w * .42} ${b - w * .8}h${w * .84}v${w * .8}h${-w * .84}z" fill="#392c5c"/>${windows(x - w * .32, b - w * .7, 2, w * .25, w * .68, w * .39)}${dome(x, b - w * .82, w, w * .8)}`;

function palace() {
  const side = [
    block(22, 340, 160, 160), windows(40, 365, 4, 22, 45, 34), windows(40, 432, 4, 22, 56, 34),
    kiosk(65, 338, 42), kiosk(135, 338, 42),
    block(16, 220, 28, 280), windows(23, 250, 1, 14, 38, 0), windows(23, 315, 1, 14, 38, 0),
    block(10, 285, 40, 6), kiosk(30, 218, 40),
    block(180, 285, 125, 215), windows(196, 310, 3, 26, 58, 36), windows(196, 395, 3, 26, 80, 36), dome(243, 280, 108, 100),
    block(294, 180, 25, 320), windows(300, 215, 1, 13, 38, 0), windows(300, 290, 1, 13, 38, 0), kiosk(306, 178, 38)
  ].join('');
  return svg(800, 500, `<ellipse cx="400" cy="400" rx="400" ry="180" fill="url(#glow)" opacity=".45"/>${mirror(800, side)}
${block(345, 180, 110, 70)}${windows(356, 195, 4, 16, 45, 24)}${dome(400, 178, 168, 138)}${block(324, 245, 152, 255)}${windows(340, 260, 5, 16, 32, 26)}
<path d="${cusped(400, 310, 54, 395, 500)}" fill="url(#lit)" stroke="url(#g)" stroke-width="7"/><path d="${arch(372, 365, 56, 135)}" fill="#fff5c8" opacity=".75"/>
${times(38, i => `<circle cx="${18 + i * 20.6}" cy="496" r="3" fill="#ffe7a0"/>`)}`);
}

const marigold = (x, y, r, c = '#f39a22') =>
  `${ring(x, y, 9, `<circle cx="${r * .62}" r="${r * .42}" fill="${c}"/>`)}<circle cx="${x}" cy="${y}" r="${r * .5}" fill="#ffd45a"/><circle cx="${x}" cy="${y}" r="${r * .2}" fill="#d96b16"/>`;

const strand = (x, y, n, r) =>
  times(n, i => marigold(x, y + i * r * 1.7, r, ['#f39a22', '#e45f2b', '#f7c23c', '#fff0cc'][i % 4]));

const hangLamp = (x, y, len) => `<path d="M${x} ${y}v${len}" stroke="#d5aa62" stroke-width="2"/><circle cx="${x}" cy="${y + len + 30}" r="62" fill="url(#glow)"/>
<path d="M${x} ${y + len}q4 12 17 16v30q-5 10-17 16q-12-6-17-16v-30q13-4 17-16z" fill="url(#g)"/><path d="${arch(x - 10, y + len + 17, 20, 29)}" fill="url(#lit)"/><path d="M${x} ${y + len + 62}v22" stroke="#e9b55f" stroke-width="3"/>`;

const GATES = { teal: ['#0d4650', '#082b38'], plum: ['#4b1d4c', '#29102f'], rose: ['#712a40', '#3a1225'] };

function gate([a, b]) {
  const hole = cusped(350, 180, 252, 470, 1140);
  const side = `<path d="M22 420h62v680h-62z" fill="${b}" stroke="url(#g)" stroke-width="4"/>
${times(3, i => `<path d="${arch(34, 450 + i * 205, 38, 170)}" fill="${a}" stroke="url(#g)" stroke-width="2"/>${ring(53, 540 + i * 205, 8, '<path d="M0 0Q6-8 15 0Q6 8 0 0" fill="url(#g)"/>')}`)}
<path d="M14 400h78v22h-78zM14 1076h78v24h-78z" fill="url(#g)"/>
${ring(135, 175, 16, '<path d="M9 0Q24-13 45 0Q24 13 9 0Z" fill="none" stroke="url(#g)" stroke-width="2"/><circle cx="53" r="3" fill="url(#g)"/>')}
${marigold(135, 175, 16)}${strand(109, 430, 12, 10)}${strand(138, 344, 7, 9)}${strand(168, 308, 4, 8)}${hangLamp(152, 330, 14)}${kiosk(60, 82, 40)}`;
  return svg(700, 1100, `<path fill-rule="evenodd" d="M22 88H678V1100H22Z${hole}" fill="${a}"/>
<defs><pattern id="j" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M14 1L27 14L14 27L1 14ZM0 0L28 28M28 0L0 28" fill="none" stroke="#e6bd72" stroke-opacity=".28"/></pattern></defs>
<path fill-rule="evenodd" d="M22 88H678V1100H22Z${hole}" fill="url(#j)"/>
<path d="M14 80h672v16h-672zM22 106h656v5h-656z" fill="url(#g)"/>
<path d="${hole}" fill="none" stroke="url(#g)" stroke-width="10"/><path d="${cusped(350, 154, 270, 462, 1140)}" fill="none" stroke="url(#g)" stroke-width="3"/>
${times(22, i => `<path d="${arch(30 + i * 29.5, 62, 20, 22)}" fill="url(#g)" opacity=".85"/>`)}${mirror(700, side)}
${ring(350, 136, 8, '<path d="M0 0Q10-11 24 0Q10 11 0 0" fill="url(#g)"/>')}`);
}

function eye(x, y, r, a) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="M0 ${-r * 1.7}C${r * 1.3} ${-r * .5} ${r} ${r} 0 ${r}C${-r} ${r} ${-r * 1.3} ${-r * .5} 0 ${-r * 1.7}Z" fill="url(#g)"/><ellipse rx="${r * .68}" ry="${r * .8}" fill="#12806f"/><circle cy="${r * .1}" r="${r * .42}" fill="#17286f"/><circle cx="${-r * .12}" r="${r * .13}" fill="#8fe8dc"/></g>`;
}

// Mor: daayin taraf dekhta hua, poonch neeche bahti hui
function bird() {
  const tail = times(3, row => times(8 - row, i => {
    const a = (94 + i * 10 + row * 5) * Math.PI / 180;
    const L = 285 - row * 67;
    const x = 157 + Math.cos(a) * L * .72;
    const y = 165 + Math.sin(a) * L;
    return `<path d="M157 160Q${f(150 + Math.cos(a) * L * .2)} ${f(170 + Math.sin(a) * L * .65)} ${f(x)} ${f(y)}" fill="none" stroke="url(#g)" stroke-width="1.6"/>${eye(x, y, 15 - row * 2, a * 180 / Math.PI + 90)}`;
  }));
  return `${tail}<path d="M124 192C128 140 176 150 180 110C182 92 172 72 184 56C198 40 220 50 221 64L236 74L219 76C206 92 222 116 222 146C222 190 172 218 124 192Z" fill="#12606e" stroke="url(#g)" stroke-width="3.5"/>
${times(4, i => `<path d="M${135 + i * 9} ${186 - i * 3}q30 5 48-${25 + i * 6}" fill="none" stroke="url(#g)" stroke-width="2"/>`)}
<circle cx="205" cy="63" r="3.5" fill="#ffe9a8"/>
${times(5, i => `<path d="M198 52L${178 + i * 11} ${24 + Math.abs(i - 2) * 4}" stroke="url(#g)" stroke-width="1.5"/><circle cx="${178 + i * 11}" cy="${24 + Math.abs(i - 2) * 4}" r="4" fill="url(#g)"/>`)}`;
}

// Teen size: phone (lamba), tablet, landscape
function door(w = 400, h = 900) {
  const ox = (w - 400) / 2, oy = (h - 900) / 2;
  const star = (x, y) => ring(x, y, 8, '<path d="M0 0Q10-10 22 0Q10 10 0 0Z" fill="url(#g)"/>');
  const flower = (x, y) => ring(x, y, 16, '<path d="M22 0Q50-20 82 0Q50 20 22 0Z" fill="none" stroke="url(#g)" stroke-width="2"/><circle cx="90" r="3" fill="url(#g)"/>') +
    ring(x, y, 8, '<path d="M0 0Q16-14 34 0Q16 14 0 0Z" fill="url(#g)"/>');
  const panel = (x, y, pw, ph) => `<path d="M${x} ${y}h${pw}v${ph}h${-pw}z" fill="#041e29" stroke="url(#g)" stroke-width="4"/>`;

  let extra = '';
  if (oy > 100) {
    extra += [40, h - oy + 8].map(y => panel(58, y, 284, oy - 48) + flower(200, y + (oy - 48) / 2)).join('');
  }
  if (ox > 100) {
    extra += mirror(w, `<path d="${cusped(ox / 2 + 18, 100, 62, 200, h - 60)}" fill="#041e29" stroke="url(#g)" stroke-width="4"/>${times(6, i => star(ox / 2 + 18, 215 + i * 118))}`);
  }

  return svg(w, h, `<defs><linearGradient id="wood" x2="1" y2="1"><stop stop-color="#0c4850"/><stop offset=".5" stop-color="#062b36"/><stop offset="1" stop-color="#03171f"/></linearGradient>
<pattern id="j" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 0Q22 14 36 18Q22 22 18 36Q14 22 0 18Q14 14 18 0Z" fill="none" stroke="#e6bd72" stroke-opacity=".13"/></pattern></defs>
<path d="M0 0h${w}v${h}h${-w}z" fill="url(#wood)"/><path d="M0 0h${w}v${h}h${-w}z" fill="url(#j)"/>
<path d="M10 10h${w - 20}v${h - 20}h${20 - w}z" fill="none" stroke="url(#g)" stroke-width="7"/><path d="M26 26h${w - 52}v${h - 52}h${52 - w}z" fill="none" stroke="url(#g)" stroke-width="2"/>
${extra}<g transform="translate(${ox} ${oy})">
<path d="${cusped(200, 66, 150, 220, 606)}" fill="#041e29" stroke="url(#g)" stroke-width="5"/><path d="${cusped(200, 86, 134, 228, 590)}" fill="none" stroke="url(#g)" stroke-width="1.2"/>
<g transform="translate(96 150) scale(.88)">${bird()}</g>
${panel(58, 642, 284, 206)}${flower(200, 745)}${mirror(400, star(62, 62))}</g>
${times(Math.floor((h - 52) / 50) + 1, i => `<circle cx="18" cy="${26 + i * 50}" r="4" fill="url(#g)"/><circle cx="${w - 18}" cy="${26 + i * 50}" r="4" fill="url(#g)"/>`)}`)
    .replace('<svg ', '<svg preserveAspectRatio="none" ');
}

function seal() {
  let d = '';
  for (let i = 0; i <= 72; i++) {
    const a = i * Math.PI / 36;
    const r = 93 + Math.sin(a * 7) * 3 + Math.cos(a * 11) * 1.8;
    d += `${i ? 'L' : 'M'}${f(100 + Math.cos(a) * r)} ${f(100 + Math.sin(a) * r)}`;
  }
  return svg(200, 200, `<path d="${d}Z" fill="url(#wax)"/><circle cx="100" cy="100" r="73" fill="none" stroke="#3f0717" stroke-width="5"/><circle cx="99" cy="98" r="73" fill="none" stroke="url(#g)" stroke-width="2"/>
${ring(100, 100, 24, '<path d="M54 0Q61-6 69 0Q61 6 54 0Z" fill="url(#g)"/>')}<circle cx="100" cy="100" r="50" fill="none" stroke="url(#g)" stroke-width="1.5"/>`);
}

const mandala = () => svg(600, 600, `<g fill="none" stroke="url(#g)" stroke-width="1.6">${[70, 128, 190, 250, 292].map(r => `<circle cx="300" cy="300" r="${r}"/>`).join('')}
${ring(300, 300, 12, '<path d="M10 0Q40-28 70 0Q40 28 10 0ZM70 0Q98-32 128 0Q98 32 70 0Z"/>')}
${ring(300, 300, 24, '<path d="M128 0Q160-24 190 0Q160 24 128 0ZM190-22Q220-30 250 0Q220 30 190 22M203 0L238 0"/><circle cx="220" r="6"/>')}
${ring(300, 300, 48, '<path d="M250 0Q271-15 292 0Q271 15 250 0Z"/><circle cx="298" r="2"/>')}</g>`);

const crest = () => svg(660, 480, mirror(660, `<g transform="translate(78 6)">${bird()}</g>`) +
  '<path d="M330 104C306 78 280 110 330 150C380 110 354 78 330 104Z" fill="url(#g)"/>');

const ornament = () => svg(260, 30,
  mirror(260, '<path d="M2 15H82Q100 15 104 7Q112 1 112 11Q109 19 98 15Q114 25 127 15" fill="none" stroke="url(#g)" stroke-width="1.5"/><circle cx="82" cy="15" r="2.5" fill="url(#g)"/>') +
  '<path d="M130 3Q140 15 130 27Q120 15 130 3Z" fill="url(#g)"/>');

const lantern = () => svg(100, 130, `<circle cx="50" cy="65" r="50" fill="url(#glow)"/><path d="M50 20C76 20 84 42 78 62L66 98H34L22 62C16 42 24 20 50 20Z" fill="url(#lit)"/>
<path d="M50 21Q34 55 43 98M50 21Q66 55 57 98" fill="none" stroke="#b5532c" stroke-opacity=".45" stroke-width="2"/><ellipse cx="50" cy="98" rx="16" ry="3.5" fill="#ffefb0"/>`);

const flame = (x, y, s = 1) =>
  `<circle cx="${x}" cy="${y}" r="${24 * s}" fill="url(#glow)"/><path d="M${x} ${y - 16 * s}Q${x + 11 * s} ${y} ${x} ${y + 6 * s}Q${x - 11 * s} ${y} ${x} ${y - 16 * s}Z" fill="#ffe39a"/>`;

const diya = () => svg(80, 70, `${flame(40, 32, 1.3)}<path d="M18 40Q40 48 62 40Q58 60 40 60Q22 60 18 40Z" fill="#c56a2f" stroke="#f3c36e" stroke-width="2"/>`);

const scene = body => svg(360, 250, `<circle cx="180" cy="130" r="118" fill="url(#glow)" opacity=".4"/>${body}`);

const events = {
  mehendi: () => scene(`<g opacity=".4">${ring(180, 130, 24, '<path d="M78 0Q98-12 118 0Q98 12 78 0Z" fill="none" stroke="url(#g)"/>')}</g>
<path d="M148 236Q154 206 132 178L100 130Q94 114 108 113Q117 115 146 146L136 66Q136 51 147 52Q157 53 159 66L168 121L169 42Q170 27 181 27Q192 28 192 42L192 121L205 58Q209 44 219 47Q229 51 227 65L216 133L235 98Q242 88 251 94Q257 100 253 111L226 180Q208 208 212 236Z" fill="#e3aa82" stroke="#f5d7b0" stroke-width="2"/>
<g fill="none" stroke="#703021" stroke-width="2">${ring(183, 166, 12, '<path d="M9 0Q19-9 29 0Q19 9 9 0Z"/><circle cx="33" r="1.5"/>')}<circle cx="183" cy="166" r="8"/>
<path d="M145 62l7 16-4 16 9 12-1 14M181 38v22l-6 10 6 12-5 12 5 14M219 58l-7 22 3 10-9 14v10M245 104l-11 20 1 10-8 12M109 124l16 18M152 214q28 10 56 0M151 224q29 10 58 0"/></g>
${[[145, 60], [181, 36], [219, 55], [246, 101], [106, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#703021"/>`).join('')}
${marigold(70, 200, 22)}${marigold(295, 196, 22)}`),

  haldi: () => scene(`${strand(48, 14, 9, 13)}${strand(82, 14, 5, 11)}${strand(312, 14, 9, 13)}${strand(278, 14, 5, 11)}
${times(9, i => marigold(124 + i * 14, 124 - Math.sin(i / 8 * Math.PI) * 32, 17, ['#f39a22', '#f7c23c', '#e45f2b'][i % 3]))}
<ellipse cx="180" cy="136" rx="84" ry="20" fill="#f8c532" stroke="url(#g)" stroke-width="7"/>
<path d="M96 138Q98 214 180 216Q262 214 264 138Q180 178 96 138Z" fill="#b9642b" stroke="url(#g)" stroke-width="4"/>
${times(7, i => `<circle cx="${117 + i * 21}" cy="${172 + Math.sin(i / 6 * Math.PI) * 16}" r="4" fill="url(#g)"/>`)}
<path d="M146 214h68l10 18h-88z" fill="url(#g)"/>`),

  wedding: () => scene(`${mirror(360, `<path d="M56 236V88h20v148" fill="url(#g)"/>${strand(90, 88, 7, 11)}${kiosk(66, 86, 34)}`)}
<path d="${cusped(180, 24, 104, 100, 236)}" fill="none" stroke="url(#g)" stroke-width="5"/>
<circle cx="157" cy="146" r="42" fill="none" stroke="url(#g)" stroke-width="10"/><circle cx="205" cy="146" r="42" fill="none" stroke="url(#g)" stroke-width="10"/>
<path d="M190 94l15-16 15 16-15 14z" fill="#d7f6ff" stroke="#fff"/><path d="M190 94h30M205 78l-5 16 5 14 5-14z" fill="none" stroke="#78a9c8"/>
${marigold(134, 214, 17, '#e4587a')}${marigold(180, 220, 22, '#f3a0b5')}${marigold(226, 214, 17, '#e4587a')}`),

  reception: () => scene(`<path d="M180 0v60" stroke="url(#g)" stroke-width="5"/><g fill="none" stroke="url(#g)" stroke-width="4">
${mirror(360, '<path d="M180 70C180 178 80 186 78 108M180 64C176 150 124 152 124 96M180 150C170 190 106 206 40 140"/>')}</g>
${mirror(360, [[78, 108], [124, 96], [40, 140]].map(([x, y]) =>
    `<path d="M${x - 5} ${y - 24}h10v24h-10z" fill="#fff1d0"/>${flame(x, y - 32, .9)}<path d="M${x - 12} ${y}h24l-5 7h-14z" fill="url(#g)"/>${times(3, i => `<path d="M${x} ${y + 22 + i * 18}q7 8 0 16q-7-8 0-16z" fill="#c9eeff" opacity=".8"/>`)}`).join(''))}
<path d="M172 60h16l10 36-18 92-18-92z" fill="url(#g)"/><path d="M180 188q14 18 0 38q-14-20 0-38z" fill="#c9eeff"/>${flame(180, 48, 1.2)}`)
};

module.exports = function allArt() {
  const out = {
    palace: palace(), door: door(), 'door-tall': door(400, 1600), 'door-wide': door(800, 900), seal: seal(), mandala: mandala(),
    crest: crest(), ornament: ornament(), lantern: lantern(), diya: diya()
  };
  for (const k in GATES) out['gate-' + k] = gate(GATES[k]);
  for (const k in events) out['event-' + k] = events[k]();
  return out;
};
