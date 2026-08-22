const https = require('https');
const fs = require('fs');
const vm = require('vm');
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}
const HAN = { '戊':1,'己':2,'庚':3,'辛':4,'壬':5,'癸':6,'丁':7,'丙':8,'乙':9 };
function earthPlate(cuc, duong) { const p={}; let c=cuc; for(let k=1;k<=9;k++){p[c]=k;c=duong?(c%9)+1:((c-2+9)%9)+1;} return p; }
async function fetchBazi(day, hour) {
  const url = `https://bazi.vn/ban-ky-mon?year=2026&month=08&day=${day}&hour=${hour}&minute=16&type=0`;
  const html = await fetchHtml(url);
  const text = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  const hi = text.indexOf('Cấu trúc'); const hdr = text.slice(hi, hi+120);
  const cuc = +((hdr.match(/độn cục\s*(\d+)/)||[])[1]||0);
  const duong = !hdr.includes('Âm');
  const plate = earthPlate(cuc, duong);
  const boxes = html.split(/<!--number \d+-->/g);
  const gates={}, stars={};
  for (let i=1;i<boxes.length && i<=9;i++){
    const b=boxes[i];
    const star=((b.match(/text-wrapper-center-top[^>]*>[\s\S]*?text-wrapper-(?:5|11)[^>]*>([^<]*)</)||[])[1]||'').trim();
    const gate=((b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/)||[])[1]||'').trim();
    const earth=((b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/)||[])[1]||'').trim();
    const ei=HAN[earth]||0; let palace=0; for(const p in plate) if(plate[p]===ei) palace=+p;
    if(palace){gates[palace]=gate;stars[palace]=star;}
  }
  return {cuc,duong,gates,stars};
}
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const stub = { addEventListener:function(){}, value:'', innerHTML:'', style:{}, dataset:{}, id:'', checked:false };
const document = { getElementById:function(){return stub;}, querySelectorAll:function(){return [];} };
const window = { _cungData:null, onload:null };
function runProto(day, hour) {
  const code = `
  (function(){
    const cung = anBan(new Date(2026, 7, ${day}, ${hour}, 16, 0));
    const S2 = {'Thiên Bồng':'蓬','Thiên Nhuế':'芮','Thiên Xung':'沖','Thiên Phụ':'輔','Thiên Cầm':'禽','Thiên Tâm':'心','Thiên Trụ':'柱','Thiên Nhậm':'任','Thiên Anh':'英'};
    const G2 = {'Hưu':'休','Sinh':'生','Thương':'傷','Đỗ':'杜','Cảnh':'景','Tử':'死','Kinh':'驚','Khai':'開'};
    const gates={}, stars={};
    for (let p=1;p<=9;p++){gates[p]=G2[cung[p].mon]||'';stars[p]=S2[cung[p].tinh]||'';}
    return JSON.stringify({cuc:cung.info.cuc.so,duong:cung.info.cuc.duong,gates,stars});
  })()`;
  const out = vm.runInNewContext(js + code, { console, document, window, Date, Math });
  return JSON.parse(out);
}
(async () => {
  const cases = [[19,10],[22,10],[22,16],[22,18],[23,10],[23,17],[24,10],[25,10],[25,16],[25,17]];
  let total=0, fail=0;
  for (const [d,h] of cases) {
    let b; try { b = await fetchBazi(d, h); } catch(e){ console.log(`${d}/8 ${h}h ERR ${e.message}`); continue; }
    const m = runProto(d, h);
    const order=[1,2,3,4,6,7,8,9];
    let gOk=true, sOk=true, cOk=(m.cuc===b.cuc);
    for (const p of order) {
      if ((m.gates[p]||'') !== (b.gates[p]||'')) gOk=false;
      if ((m.stars[p]||'') !== (b.stars[p]||'')) sOk=false;
    }
    const allOk = gOk && sOk && cOk;
    if (!allOk) fail++;
    total++;
    console.log(`${d}/8 ${String(h).padStart(2,'0')}h | cục ${m.cuc} vs ${b.cuc} [${cOk?'OK':'SAI'}] | gates [${gOk?'OK':'SAI'}] | stars [${sOk?'OK':'SAI'}] ${allOk?'':'(LỆCH)'}`);
  }
  console.log(`\nTổng: ${total} case, ${fail} lệch, ${total-fail} khớp`);
})();
