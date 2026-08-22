const fs = require('fs');
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const stub = { addEventListener: function () {}, value: '', innerHTML: '', style: {}, dataset: {}, id: '', checked: false };
const document = { getElementById: function () { return stub; }, querySelectorAll: function () { return []; } };
const window = {};

const testCode = `
console.log('=== Tiết khí 2026 (jd -> date) ===');
for (const t of TIET_KHI) {
    const jd = findTietKhiJd(t.name, 2026);
    const d = jdToDate(jd);
    console.log(t.name + ': ' + d.day + '/' + d.month + '/' + d.year + ' (jd=' + jd + ')');
}
console.log('');
console.log('Sun longitude 20/8/2026: ' + getSunLongitudeDeg(jdFromDate(20,8,2026), 7.0).toFixed(2) + ' deg');
console.log('Sun longitude 22/8/2026: ' + getSunLongitudeDeg(jdFromDate(22,8,2026), 7.0).toFixed(2) + ' deg');
console.log('Sun longitude 23/8/2026: ' + getSunLongitudeDeg(jdFromDate(23,8,2026), 7.0).toFixed(2) + ' deg');
`;
eval(js + testCode);

