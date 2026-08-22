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
const GATE_IDX_VN = { 'Hưu': 1, 'Sinh': 2, 'Thương': 3, 'Đỗ': 4, 'Cảnh': 5, 'Tử': 6, 'Kinh': 7, 'Khai': 8 };
const GATE_HAN_IDX = { '休': 1, '生': 2, '傷': 3, '杜': 4, '景': 5, '死': 6, '驚': 7, '開': 8 };
const GATE_HOME = { 1: 1, 2: 8, 3: 3, 4: 4, 5: 9, 6: 2, 7: 7, 8: 6 };
const CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
function earthPlate(cuc, duong) { const p = {}; let c = cuc; for (let k = 1; k <= 9; k++) { p[c] = k; c = duong ? (c % 9) + 1 : ((c - 2 + 9) % 9) + 1; } return p; }
function dayGz(d, m, y) { const a = Math.floor((14 - m) / 12); const yy = y + 4800 - a; const mm = m + 12 * a - 3; const jd = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045; return ((jd + 49) % 60 + 60) % 60; }
function hourGz(dayGan, hour) {
  const gioChi = Math.floor((hour + 1) / 2) % 12;
  const start = [0, 2, 4, 6, 8][dayGan % 5];
  return { gioGan: (start + gioChi) % 10, gioChi };
}
function parse(html, cuc, duong) {
  const plate = earthPlate(cuc, duong);
  const boxes = html.split(/<!--number \d+-->/g);
  const gateByPalace = {};
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const tm = text.match(/Trực Sử Môn\s*([^\s]+)/);
  const trucSuVN = tm ? tm[1].trim() : '';
  for (let i = 1; i < boxes.length && i <= 9; i++) {
    const b = boxes[i];
    const gate = ((b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/) || [])[1] || '').trim();
    const earth = ((b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/) || [])[1] || '').trim();
    const ei = HAN[earth] || 0;
    let palace = 0;
    for (const p in plate) if (plate[p] === ei) palace = +p;
    if (palace) gateByPalace[palace] = gate;
  }
  return { gateByPalace, trucSuVN };
}
async function probe(day, hour) {
  const url = `https://bazi.vn/ban-ky-mon?year=2026&month=08&day=${day}&hour=${hour}&minute=16&type=0`;
  const html = await fetchHtml(url);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const hi = text.indexOf('Cấu trúc');
  const hdr = text.slice(hi, hi + 120);
  const cuc = +((hdr.match(/độn cục\s*(\d+)/) || [])[1] || 0);
  const duong = !hdr.includes('Âm');
  const { gateByPalace, trucSuVN } = parse(html, cuc, duong);
  const dg = dayGz(day, 8, 2026);
  const hg = hourGz(dg % 10, hour);
  const plate = earthPlate(cuc, duong);
  let idx = -1;
  for (let k = 0; k < 6; k++) { const n = hg.gioGan + 10 * k; if (n % 12 === hg.gioChi) { idx = n; break; } }
  const ky = Math.floor(idx / 10) + 1;
  let kyPalace = 0; for (const p in plate) if (plate[p] === ky) kyPalace = +p;
  const home = kyPalace === 5 ? 2 : kyPalace;
  const chiIdx = GATE_IDX_VN[trucSuVN] || 0;
  const homeOfGate = GATE_HOME[chiIdx] || 0;
  let finalPalace = 0;
  for (const p in gateByPalace) if (GATE_HAN_IDX[gateByPalace[p]] === chiIdx) finalPalace = +p;
  const order = [1, 2, 3, 4, 6, 7, 8, 9].map(p => (gateByPalace[p] || '_')).join('');
  console.log(`${day}/8 ${String(hour).padStart(2,'0')}h (${CHI[hg.gioChi]}) | cục=${cuc} | 值使=${trucSuVN}(home=${homeOfGate}) | final=${finalPalace} | ${order}`);
}
(async () => {
  for (const day of [19, 22, 25]) {
    for (let h = 0; h < 24; h += 2) {
      try { await probe(day, h); } catch (e) { console.log(`${day}/8 ${h}h ERR ${e.message}`); }
      await new Promise(r => setTimeout(r, 250));
    }
    console.log('----');
  }
})();
