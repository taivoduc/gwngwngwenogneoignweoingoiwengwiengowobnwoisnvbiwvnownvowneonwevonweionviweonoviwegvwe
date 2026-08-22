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
const GATE_HAN_IDX = { '休': 1, '生': 2, '傷': 3, '杜': 4, '景': 5, '死': 6, '驚': 7, '開': 8 };
const CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
function earthPlate(cuc, duong) { const p = {}; let c = cuc; for (let k = 1; k <= 9; k++) { p[c] = k; c = duong ? (c % 9) + 1 : ((c - 2 + 9) % 9) + 1; } return p; }
async function probe(day, hour) {
  const url = `https://bazi.vn/ban-ky-mon?year=2026&month=08&day=${day}&hour=${hour}&minute=16&type=0`;
  const html = await fetchHtml(url);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const hi = text.indexOf('Cấu trúc');
  const hdr = text.slice(hi, hi + 120);
  const cuc = +((hdr.match(/độn cục\s*(\d+)/) || [])[1] || 0);
  const duong = !hdr.includes('Âm');
  const plate = earthPlate(cuc, duong);
  const boxes = html.split(/<!--number \d+-->/g);
  const gateByPalace = {};
  const earthByPalace = {};
  for (let i = 1; i < boxes.length && i <= 9; i++) {
    const b = boxes[i];
    const gate = ((b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/) || [])[1] || '').trim();
    const earth = ((b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/) || [])[1] || '').trim();
    const ei = HAN[earth] || 0;
    let palace = 0;
    for (const p in plate) if (plate[p] === ei) palace = +p;
    if (palace) { gateByPalace[palace] = gate; earthByPalace[palace] = earth; }
  }
  const order = [1, 2, 3, 4, 6, 7, 8, 9].map(p => `${p}:${gateByPalace[p]||'_'}`).join(' ');
  const earthStr = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => `${p}:${earthByPalace[p]||'_'}`).join(' ');
  console.log(`${day}/8 ${String(hour).padStart(2,'0')}h | cục=${cuc} ${duong?'Dương':'Âm'} | gates: ${order}`);
  console.log(`      earth: ${earthStr}`);
}
(async () => {
  for (const [d, h] of [[23, 10], [24, 10], [23, 17]]) {
    try { await probe(d, h); } catch (e) { console.log(`${d}/8 ${h}h ERR ${e.message}`); }
    await new Promise(r => setTimeout(r, 300));
  }
})();
