const https = require('https');

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function strip(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extract(text) {
  const out = {};
  const m1 = text.match(/Cấu trúc\s*([^\s]+ Nguyên)\s*\/\s*(Âm|Dương)\s*độn cục\s*(\d+)/);
  if (m1) { out.nguyen = m1[1]; out.dun = m1[2]; out.cuc = +m1[3]; }
  const m2 = text.match(/Can ngày\s*([^\s]+)/); if (m2) out.canNgay = m2[1];
  const m3 = text.match(/Can giờ\s*([^\s]+)/); if (m3) out.canGio = m3[1];
  const m4 = text.match(/Phù Đầu\s*([^\s]+)/); if (m4) out.phuDau = m4[1];
  const m5 = text.match(/Trực Phù Tinh\s*([^\s]+)/); if (m5) out.trucPhuTinh = m5[1];
  const m6 = text.match(/Trực Sử Môn\s*([^\s]+)/); if (m6) out.trucSuMon = m6[1];
  return out;
}

function jdFromDate(d, m, y) {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}
function dayGz(d, m, y) {
  const jd = jdFromDate(d, m, y);
  return ((jd + 49) % 60 + 60) % 60;
}
const GAN = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
const CHI = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];

async function main() {
  const dates = [];
  for (let d = 16; d <= 31; d++) dates.push([2026, 8, d]);
  dates.push([2026,6,19],[2026,6,20],[2026,6,21],[2026,6,22],[2026,6,23]);
  dates.push([2026,12,20],[2026,12,21],[2026,12,22],[2026,12,23]);
  dates.push([2026,3,16],[2026,3,17],[2026,3,18]);
  dates.push([2021,3,17]);

  for (const [y, m, d] of dates) {
    const url = `https://bazi.vn/ban-ky-mon?year=${y}&month=${String(m).padStart(2, '0')}&day=${String(d).padStart(2, '0')}&hour=10&minute=16&type=0`;
    try {
      const html = await fetchHtml(url);
      const ex = extract(strip(html));
      const gz = dayGz(d, m, y);
      const gzName = GAN[gz % 10] + ' ' + CHI[gz % 12];
      const cur = ex.cuc ? `${ex.nguyen} / ${ex.dun} độn cục ${ex.cuc}` : 'N/A';
      console.log(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} | day=${gzName}(${gz}) | ${cur} | CanNgay=${ex.canNgay||'?'} CanGio=${ex.canGio||'?'} | PhùĐầu=${ex.phuDau||'?'} | TrựcPhù=${ex.trucPhuTinh||'?'} TrựcSử=${ex.trucSuMon||'?'}`);
    } catch (e) {
      console.log(`${y}-${m}-${d} ERR ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 250));
  }
}
main();
