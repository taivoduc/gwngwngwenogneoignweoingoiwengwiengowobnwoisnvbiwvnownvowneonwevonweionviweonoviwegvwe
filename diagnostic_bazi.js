const https = require('https');
function get(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, len: d.length, body: d }));
    }).on('error', e => resolve({ status: 'ERR', len: 0, body: String(e) }));
  });
}
function strip(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
}
async function probe(label, url) {
  const r = await get(url);
  const t = strip(r.body);
  const has = {
    cautruc: t.includes('Cấu trúc'),
    docuc: /độn cục/.test(t),
    trucPhu: t.includes('Trực Phù'),
    canNgay: t.includes('Can ngày'),
    muaGoi: t.includes('gói') || t.includes('VIP') || t.includes('Premium') || t.includes('premium') || t.includes('đăng ký'),
  };
  console.log(`[${label}] status=${r.status} len=${r.len} has=${JSON.stringify(has)}`);
  // print snippet around 'độn cục' or first 400 chars
  const i = t.indexOf('độn cục');
  if (i >= 0) console.log('  snippet: ...' + t.slice(Math.max(0,i-80), i+120) + '...');
  else console.log('  head: ' + t.slice(0, 300));
}
(async () => {
  await probe('08-18', 'https://bazi.vn/ban-ky-mon?year=2026&month=08&day=18&hour=10&minute=16&type=0');
  await new Promise(r=>setTimeout(r,500));
  await probe('08-22', 'https://bazi.vn/ban-ky-mon?year=2026&month=08&day=22&hour=10&minute=16&type=0');
  await new Promise(r=>setTimeout(r,500));
  await probe('08-26', 'https://bazi.vn/ban-ky-mon?year=2026&month=08&day=26&hour=10&minute=16&type=0');
  await new Promise(r=>setTimeout(r,500));
  await probe('12-22', 'https://bazi.vn/ban-ky-mon?year=2026&month=12&day=22&hour=10&minute=16&type=0');
})();
