const fs = require('fs');
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const js = m[1];
const stub = { addEventListener: function () {}, value: '', innerHTML: '', style: {}, dataset: {}, id: '', checked: false };
const document = { getElementById: function () { return stub; }, querySelectorAll: function () { return []; } };
const window = { _cungData: null, onload: null };

const testCode = `
function dump(label, day, month, year, hour) {
    const date = new Date(year, month - 1, day, hour, 16, 0);
    const cung = anBan(date);
    const dirs = ['', 'Bắc', 'Tây Nam', 'Đông', 'Đông Nam', 'Trung ương', 'Tây Bắc', 'Tây', 'Đông Bắc', 'Nam'];
    console.log('=== ' + label + ' ===');
    console.log('Cục: ' + cung.info.cuc.so + ' (' + (cung.info.cuc.duong ? 'Dương' : 'Âm') + ' độn) - ' + cung.info.cuc.tiet + ' - ' + cung.info.cuc.nguyen + ' nguyên');
    console.log('Năm: ' + cung.info.yearCanChi.gan + ' ' + cung.info.yearCanChi.chi + ' | Ngày: ' + cung.info.dayCanChi + ' | gioGan=' + cung.info.gioGan + ' gioChi=' + cung.info.gioChi);
    console.log('Trực Phù: ' + cung.info.trucPhu.tinh + ' (cung ' + cung.info.trucPhu.cung + ') | Trực Sử: ' + cung.info.trucSu.mon + ' (cung ' + cung.info.trucSu.cung + ')');
    for (let p = 1; p <= 9; p++) {
        console.log('  Cung ' + p + ' (' + dirs[p] + '): Thần=' + cung[p].than + ' | Cửa=' + cung[p].mon + ' | Tinh=' + cung[p].tinh + ' | Thiên=' + cung[p].thien + ' | Địa=' + cung[p].dia);
    }
    console.log('');
}
dump('22/8/2026 10:16', 22, 8, 2026, 10);
dump('17/3/2021 03:00 (reference)', 17, 3, 2021, 3);
`;
eval(js + testCode);
