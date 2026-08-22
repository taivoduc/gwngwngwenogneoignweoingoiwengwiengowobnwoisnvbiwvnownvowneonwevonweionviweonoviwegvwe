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
function earthPlate(cuc, duong) { const p = {}; let c = cuc; for (let k = 1; k <= 9; k++) { p[c] = k; c = duong ? (c % 9) + 1 : ((c - 2 + 9) % 9) + 1; } return p; }
// gate home palace -> gate name (idx in TEN_MON)
const GATE_HOME = { 1: '休', 8: '生', 3: '傷', 4: '杜', 9: '景', 2: '死', 7: '驚', 6: '開' };
const GATE_NAME_TO_IDX = { '休': 1, '生': 2, '傷': 3, '杜': 4, '景': 5, '死': 6, '驚': 7, '開': 8 };
const GATE_RING_ORDER = ['休', '生', '傷', '杜', '景', '死', '驚', '開']; // thuận order by home

async function probe(hour) {
  const url = `https://bazi.vn/ban-ky-mon?year=2026&month=08&day=22&hour=${hour}&minute=16&type=0`;
  const html = await fetchHtml(url);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const hi = text.indexOf('Cấu trúc');
  const hdr = text.slice(hi, hi + 120);
  const cuc = +((hdr.match(/độn cục\s*(\d+)/) || [])[1] || 0);
  const duong = !hdr.includes('Âm');
  const plate = earthPlate(cuc, duong);
  const boxes = html.split(/<!--number \d+-->/g);
  const gateByPalace = {};
  for (let i = 1; i < boxes.length && i <= 9; i++) {
    const b = boxes[i];
    const gate = ((b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/) || [])[1] || '').trim();
    const earth = ((b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/) || [])[1] || '').trim();
    const ei = HAN[earth] || 0;
    let palace = 0;
    for (const p in plate) if (plate[p] === ei) palace = +p;
    if (palace) gateByPalace[palace] = gate;
  }
  return { hour, cuc, duong, gateByPalace };
}

// GANZHI hour helper
const GAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
const CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

(async () => {
  for (let h = 0; h < 24; h += 2) {
    try {
      const r = await probe(h);
      const gz = h === 23 ? 0 : Math.floor((h + 1) / 2) % 12; // shichen index
      console.log(`${String(h).padStart(2,'0')}h (${CHI[gz]}) | cục=${r.cuc} | gates: ${[1,2,3,4,6,7,8,9].map(p => (r.gateByPalace[p]||'_')).join(' ')}`);
    } catch (e) { console.log(`${h}h ERR ${e.message}`); }
    await new Promise(res => setTimeout(res, 250));
  }
})();
