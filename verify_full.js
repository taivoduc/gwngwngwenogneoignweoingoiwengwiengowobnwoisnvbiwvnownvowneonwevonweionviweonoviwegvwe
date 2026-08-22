const https = require('https');
const fs = require('fs');
const vm = require('vm');
function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}
const HAN = { '戊':1,'己':2,'庚':3,'辛':4,'壬':5,'癸':6,'丁':7,'丙':8,'乙':9 };
function earthPlate(cuc, duong) { const p={}; let c=cuc; for(let k=1;k<=9;k++){p[c]=k;c=duong?(c%9)+1:((c-2+9)%9)+1;} return p; }
async function fetchBazi(day, hour, minute) {
  const url = `https://bazi.vn/ban-ky-mon?year=2026&month=08&day=${day}&hour=${hour}&minute=${minute}&type=0`;
  const html = await fetchHtml(url);
  const text = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
  const hi = text.indexOf('Cấu trúc'); const hdr = text.slice(hi, hi+120);
  const cuc = +((hdr.match(/độn cục\s*(\d+)/)||[])[1]||0);
  const duong = !hdr.includes('Âm');
  const plate = earthPlate(cuc, duong);
  const boxes = html.split(/<!--number \d+-->/g);
  const board = {};
  for (let i=1;i<boxes.length && i<=9;i++){
    const b=boxes[i];
    const star=((b.match(/text-wrapper-center-top[^>]*>[\s\S]*?text-wrapper-(?:5|11)[^>]*>([^<]*)</)||[])[1]||'').trim();
    const gate=((b.match(/<div class="text-wrapper-8">([^<]*)<\/div>/)||[])[1]||'').trim();
    const earth=((b.match(/<div class="item-bottom">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/)||[])[1]||'').trim();
    const heaven=((b.match(/class="text-wrapper-1[^"]*">[\s\S]*?<div class="text-wrapper-3">([^<]*)<\/div>/)||[])[1]||'').trim();
    const ei=HAN[earth]||0; let palace=0; for(const p in plate) if(plate[p]===ei) palace=+p;
    if(palace) board[palace]={star,gate,earth,heaven};
  }
  return {cuc,duong,board};
}
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const stub = { addEventListener:function(){}, value:'', innerHTML:'', style:{}, dataset:{}, id:'', checked:false };
const document = { getElementById:function(){return stub;}, querySelectorAll:function(){return [];} };
const window = { _cungData:null, onload:null };
const testCode = `
function myBoard(day, month, year, hour, minute) {
    const cung = anBan(new Date(year, month-1, day, hour, minute, 0));
    const S2 = {'Thiên Bồng':'蓬','Thiên Nhuế':'芮','Thiên Xung':'沖','Thiên Phụ':'輔','Thiên Cầm':'禽','Thiên Tâm':'心','Thiên Trụ':'柱','Thiên Nhậm':'任','Thiên Anh':'英'};
    const G2 = {'Hưu':'休','Sinh':'生','Thương':'傷','Đỗ':'杜','Cảnh':'景','Tử':'死','Kinh':'驚','Khai':'開'};
    const K2 = {'Mậu':'戊','Kỷ':'己','Canh':'庚','Tân':'辛','Nhâm':'壬','Quý':'癸','Đinh':'丁','Bính':'丙','Át':'乙'};
    const board = {};
    for (let p=1;p<=9;p++) board[p] = { star: S2[cung[p].tinh]||'', gate: G2[cung[p].mon]||'', earth: K2[cung[p].dia]||'', heaven: K2[cung[p].thien]||'' };
    return { cuc: cung.info.cuc.so, duong: cung.info.cuc.duong, board };
}
console.log(JSON.stringify(myBoard(25,8,2026,17,4)));
`;
let out = '';
const ctx = { console: { log: (s)=>{ out += s + '\n'; } }, document, window, Date, Math };
vm.runInNewContext(js + testCode, ctx);
const mine = JSON.parse(out.trim());
console.log('=== mine === cục=' + mine.cuc + (mine.duong?' Dương':' Âm'));
(async () => {
  const b = await fetchBazi(25, 17, 4);
  console.log('=== bazi === cục=' + b.cuc + (b.duong?' Dương':' Âm'));
  const order=[1,2,3,4,6,7,8,9];
  let ok=true;
  for (const p of order) {
    const m = mine.board[p], z = b.board[p];
    const starOk=m.star===z.star, gateOk=m.gate===z.gate, earthOk=m.earth===z.earth, heavenOk=m.heaven===z.heaven;
    if(!(starOk&&gateOk&&earthOk&&heavenOk)) ok=false;
    console.log(`Cung ${p}: sao ${m.star} vs ${z.star} [${starOk?'OK':'SAI'}] | môn ${m.gate} vs ${z.gate} [${gateOk?'OK':'SAI'}] | địa ${m.earth} vs ${z.earth} [${earthOk?'OK':'SAI'}] | thiên ${m.heaven} vs ${z.heaven} [${heavenOk?'OK':'SAI'}]`);
  }
  console.log(ok ? '>>> KHỚP 100%' : '>>> CÒN LỆCH');
})();
