const https = require('https');
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}
const HAN = { '戊':1,'己':2,'庚':3,'辛':4,'壬':5,'癸':6,'丁':7,'丙':8,'乙':9 };
function earthPlate(cuc, duong) { const p={}; let c=cuc; for(let k=1;k<=9;k++){p[c]=k;c=duong?(c%9)+1:((c-2+9)%9)+1;} return p; }
async function probe(day, hour, minute) {
  const url = `https://bazi.vn/ban-ky-mon?year=2026&month=08&day=${day}&hour=${hour}&minute=${minute}&type=0`;
  const html = await fetchHtml(url);
  const text = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  const hi = text.indexOf('Cấu trúc'); const hdr = text.slice(hi, hi+200);
  const cuc = +((hdr.match(/độn cục\s*(\d+)/)||[])[1]||0);
  const duong = !hdr.includes('Âm');
  // hour pillar
  const hm = hdr.match(/Thiên can[\s\S]{0,80}?([甲乙丙丁戊己庚辛壬癸])\s*([^ ]+)/);
  const plate = earthPlate(cuc, duong);
  const boxes = html.split(/<!--number \d+-->/g);
  const stars={}, gates={};
  for (let i=1;i<boxes.length && i<=9;i++){
    const b=boxes[i];
    const star=((b.match(/text-wrapper-center-top[^>]*>[\s\S]*?text-wrapper-(?:5|11)[^>]*>([^<]*)</)||[])[1]||'').trim();
    const gate=((b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/)||[])[1]||'').trim();
    const earth=((b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/)||[])[1]||'').trim();
    const ei=HAN[earth]||0; let palace=0; for(const p in plate) if(plate[p]===ei) palace=+p;
    if(palace){stars[palace]=star;gates[palace]=gate;}
  }
  const order=[1,2,3,4,6,7,8,9];
  console.log(`${day}/8 ${hour}:${minute} | cục=${cuc} | stars: ${order.map(p=>stars[p]||'_').join(' ')} | gates: ${order.map(p=>gates[p]||'_').join(' ')}`);
}
(async () => {
  for (const [d,h,m] of [[25,17,4],[25,17,16],[25,17,30],[25,16,4],[25,16,16],[25,16,45]]) {
    try { await probe(d,h,m); } catch(e){ console.log('ERR '+e.message); }
    await new Promise(r=>setTimeout(r,300));
  }
})();
