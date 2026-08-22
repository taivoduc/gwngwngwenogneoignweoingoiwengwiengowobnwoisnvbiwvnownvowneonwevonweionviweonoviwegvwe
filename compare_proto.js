const fs = require('fs');
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const js = m[1];
const stub = { addEventListener: function () {}, value: '', innerHTML: '', style: {}, dataset: {}, id: '', checked: false };
const document = { getElementById: function () { return stub; }, querySelectorAll: function () { return []; } };
const window = { _cungData: null, onload: null };

const testCode = `
function gatesAt(day, month, year, hour) {
    const cung = anBan(new Date(year, month - 1, day, hour, 16, 0));
    const m2 = { 'Hưu':'休','Sinh':'生','Thương':'傷','Đỗ':'杜','Cảnh':'景','Tử':'死','Kinh':'驚','Khai':'開' };
    return [1,2,3,4,6,7,8,9].map(p => m2[cung[p].mon] || '_').join(' ');
}
function starsAt(day, month, year, hour) {
    const cung = anBan(new Date(year, month - 1, day, hour, 16, 0));
    const s = { 'Thiên Bồng':'蓬','Thiên Nhuế':'芮','Thiên Xung':'沖','Thiên Phụ':'輔','Thiên Cầm':'禽','Thiên Tâm':'心','Thiên Trụ':'柱','Thiên Nhậm':'任','Thiên Anh':'英' };
    return [1,2,3,4,6,7,8,9].map(p => s[cung[p].tinh] || '_').join(' ');
}
function dump(day, month, year, hour) {
    const cung = anBan(new Date(year, month - 1, day, hour, 16, 0));
    console.log(cung.info.cuc.so + ' ' + (cung.info.cuc.duong?'D':'A') + ' | gates: ' + gatesAt(day,month,year,hour) + ' | stars: ' + starsAt(day,month,year,hour));
}
dump(25, 8, 2026, 17); // Dậu - bazi: 傷開景死生休杜驚
dump(25, 8, 2026, 16); // Thân - bazi: 開景生傷驚死休杜
dump(25, 8, 2026, 10); // Tỵ - bazi: 休死傷杜開驚生景
dump(23, 8, 2026, 10); // Tỵ - bazi: 傷開景死生休杜驚 (anomaly)
dump(23, 8, 2026, 17); // Dậu - bazi: 休死傷杜開驚生景 (anomaly)
`;
eval(js + testCode);
