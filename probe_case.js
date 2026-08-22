const https = require('https');
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}
const HAN = { '戊': 1, '己': 2, '庚': 3, '辛': 4, '壬': 5, '癸': 6, '丁': 7, '丙': 8, '乙': 9 };
const GATE_IDX = { '休': 1, '生': 2, '傷': 3, '杜': 4, '景': 5, '死': 6, '驚': 7, '開': 8 };
const GATE_HOME = { 1: 1, 2: 8, 3: 3, 4: 4, 5: 9, 6: 2, 7: 7, 8: 6 }; // gate idx -> home palace
function earthPlate(cuc, duong) { const p = {}; let c = cuc; for (let k = 1; k <= 9; k++) { p[c] = k; c = duong ? (c % 9) + 1 : ((c - 2 + 9) % 9) + 1; } return p; }

function parse(html, cuc, duong) {
  const plate = earthPlate(cuc, duong);
  const boxes = html.split(/<!--number \d+-->/g);
  const gateByPalace = {};
  let trucSu = '';
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const tm = text.match(/Trực Sử Môn\s*([^\s]+)/);
  if (tm) trucSu = tm[1].trim();
  for (let i = 1; i < boxes.length && i <= 9; i++) {
    const b = boxes[i];
    const gate = ((b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/) || [])[1] || '').trim();
    const earth = ((b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/) || [])[1] || '').trim();
    const ei = HAN[earth] || 0;
    let palace = 0;
    for (const p in plate) if (plate[p] === ei) palace = +p;
    if (palace) gateByPalace[palace] = gate;
  }
  return { gateByPalace, trucSu };
}

// compute 值使 home (cung chứa Lục Nghi Tuần Thủ) from hour ganzhi + earth plate
function chiefHome(gioGan, gioChi, plate) {
  // hour sexagenary index, xun = floor(idx/10), xunshou's lục nghi = xun+1 (Mậu=1..Quý=6)
  // find sexagenary index via CRT
  let idx = -1;
  for (let k = 0; k < 6; k++) { const n = gioGan + 10 * k; if (n % 12 === gioChi) { idx = n; break; } }
  const xun = Math.floor(idx / 10);
  const ky = xun + 1; // Mậu=1 ... Quý=6 (xun 0..5)
  for (const p in plate) if (plate[p] === ky) return (+p === 5) ? 2 : +p;
  return 2;
}

async function probe(label, day, hour, minute) {
  const url = `https://bazi.vn/ban-ky-mon?year=2026&month=08&day=${day}&hour=${hour}&minute=${minute}&type=0`;
  const html = await fetchHtml(url);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const hi = text.indexOf('Cấu trúc');
  const hdr = text.slice(hi, hi + 120);
  const cuc = +((hdr.match(/độn cục\s*(\d+)/) || [])[1] || 0);
  const duong = !hdr.includes('Âm');
  const { gateByPalace, trucSu } = parse(html, cuc, duong);
  const order = [1, 2, 3, 4, 6, 7, 8, 9].map(p => (gateByPalace[p] || '_')).join(' ');
  // find 值使 gate final palace
  const gi = GATE_IDX[trucSu];
  let finalPalace = 0;
  for (const p in gateByPalace) if (GATE_IDX[gateByPalace[p]] === gi) finalPalace = +p;
  const home = GATE_HOME[gi];
  console.log(`${label} | cục=${cuc} ${duong?'Dương':'Âm'} | 值使=${trucSu} home=${home} final=${finalPalace} | gates: ${order}`);
  return { cuc, duong, trucSu, finalPalace, home, gateByPalace };
}

(async () => {
  const cases = [
    ['25/8 17:04', 25, 17, 4],
    ['25/8 16:00', 25, 16, 0],
    ['25/8 18:00', 25, 18, 0],
  ];
  for (const [label, d, h, m] of cases) {
    try { await probe(label, d, h, m); } catch (e) { console.log(label + ' ERR ' + e.message); }
    await new Promise(r => setTimeout(r, 300));
  }
})();
