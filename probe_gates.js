const https = require('https');
const fs = require('fs');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Standard Âm/Dương độn earth plates for cục 1..9 (Mậu at cục, nghịch for Âm / thuận for Dương)
function earthPlate(cuc, duong) {
  const plate = {}; // palace -> ky index (1..9)
  let cung = cuc;
  for (let ky = 1; ky <= 9; ky++) {
    plate[cung] = ky;
    cung = duong ? (cung % 9) + 1 : ((cung - 2 + 9) % 9) + 1;
  }
  return plate; // palace -> ky index
}
const KI = ['', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý', 'Đinh', 'Bính', 'Ất'];
// ky index -> palace
function kyAtPalace(plate) { const m = {}; for (const p in plate) m[plate[p]] = +p; return m; }

function parse(html, cuc, duong) {
  const plate = earthPlate(cuc, duong);
  const boxes = html.split(/<!--number \d+-->/g);
  const rows = [];
  for (let i = 1; i < boxes.length && i <= 9; i++) {
    const b = boxes[i];
    const gate = (b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/) || [])[1];
    const earth = (b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/) || [])[1];
    const num = (b.match(/<div class="text-wrapper-9">\s*([0-9])\s*<\/div>/) || [])[1];
    const hanToIdx = { '戊': 1, '己': 2, '庚': 3, '辛': 4, '壬': 5, '癸': 6, '丁': 7, '丙': 8, '乙': 9 };
    const earthIdx = hanToIdx[earth ? earth.trim() : ''] || 0;
    // palace = the palace where this earth stem sits in the standard plate
    let palace = 0;
    for (const p in plate) if (plate[p] === earthIdx) palace = +p;
    rows.push({ box: i, earth, earthIdx, gate, num, palace });
  }
  return rows;
}

async function dump(label, y, m, d) {
  const url = `https://bazi.vn/ban-ky-mon?year=${y}&month=${String(m).padStart(2, '0')}&day=${String(d).padStart(2, '0')}&hour=10&minute=16&type=0`;
  const html = await fetchHtml(url);
  // determine cục from header
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const i = text.indexOf('Cấu trúc');
  const hdr = text.slice(i, i + 120);
  const mc = hdr.match(/độn cục\s*(\d+)/);
  const cuc = mc ? +mc[1] : 0;
  const dunAm = hdr.includes('Âm');
  const rows = parse(html, cuc, !dunAm);

  // gates by palace
  const gateByPalace = {};
  for (const r of rows) if (r.palace) gateByPalace[r.palace] = r.gate;
  const order = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const s = order.map(p => gateByPalace[p] ? `${p}:${gateByPalace[p].trim()}` : `${p}:`).join('  ');
  console.log(`${label} | cục=${cuc} ${dunAm ? 'Âm' : 'Dương'} | gates: ${s}`);
  return { cuc, dunAm, gateByPalace };
}

(async () => {
  const days = [[19, 8, 2026], [22, 8, 2026], [23, 8, 2026], [24, 8, 2026], [25, 8, 2026]];
  for (const [d, m, y] of days) {
    try {
      await dump(`${d}/${m}/${y}`, y, m, d);
    } catch (e) { console.log(`${d}/${m}/${y} ERR ${e.message}`); }
    await new Promise(r => setTimeout(r, 300));
  }
})();
