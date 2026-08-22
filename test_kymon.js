const fs = require('fs');
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('NO SCRIPT'); process.exit(1); }
const js = m[1];

const stub = { addEventListener: function () {}, value: '', innerHTML: '', style: {}, dataset: {}, id: '', checked: false };
const document = { getElementById: function () { return stub; }, querySelectorAll: function () { return []; } };
const window = { _cungData: null, onload: null };

const testCode = `
function dump(label, day, month, year, hour) {
    const date = new Date(year, month - 1, day, hour, 0, 0);
    const cung = anBan(date);
    const dirs = ['', 'Bắc', 'Tây Nam', 'Đông', 'Đông Nam', 'Trung ương', 'Tây Bắc', 'Tây', 'Đông Bắc', 'Nam'];
    console.log('=== ' + label + ' ===');
    console.log('Cục: ' + cung.info.cuc.so + ' (' + (cung.info.cuc.duong ? 'Dương' : 'Âm') + ' độn) - ' + cung.info.cuc.tiet + ' - ' + cung.info.cuc.nguyen + ' nguyên');
    console.log('Ngày: ' + cung.info.dayCanChi + ' | gioChi=' + cung.info.gioChi + ' | gioGan=' + cung.info.gioGan);
    for (let p = 1; p <= 9; p++) {
        console.log('  Cung ' + p + ' (' + dirs[p] + '): Thần=' + cung[p].than + ' | Cửa=' + cung[p].mon + ' | Tinh=' + cung[p].tinh + ' | Thiên=' + cung[p].thien + ' | Địa=' + cung[p].dia);
    }
    console.log('');
}
dump('17/3/2021 13h', 17, 3, 2021, 13);
dump('17/3/2021 15h', 17, 3, 2021, 15);
`;

eval(js + testCode);
