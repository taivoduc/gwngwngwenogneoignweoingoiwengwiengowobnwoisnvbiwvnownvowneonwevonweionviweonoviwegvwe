const fs = require('fs');
const vm = require('vm');
const js = fs.readFileSync(__dirname + '/kymon.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const stub = { addEventListener: function(){}, value:'', innerHTML:'', style:{}, dataset:{}, id:'', checked:false };
const document = { getElementById: function(){return stub;}, querySelectorAll: function(){return [];} };
const window = { _cungData:null, onload:null };
const code = `(function(){
  const cung = anBan(new Date(2026, 7, 25, 17, 16, 0));
  const S2 = {'Thiên Bồng':'蓬','Thiên Nhuế':'芮','Thiên Xung':'沖','Thiên Phụ':'輔','Thiên Cầm':'禽','Thiên Tâm':'心','Thiên Trụ':'柱','Thiên Nhậm':'任','Thiên Anh':'英'};
  const s=[]; for (let p=1;p<=9;p++) s.push(p+':'+(S2[cung[p].tinh]||''));
  return JSON.stringify(s);
})()`;
const out = vm.runInNewContext(js + code, { console, document, window, Date, Math });
console.log('prototype stars (25/8 17:16):', out);
console.log('expected bazi stars:        ["1:沖","2:心","3:英","4:芮","5:禽","6:任","7:蓬","8:輔","9:柱"]');
