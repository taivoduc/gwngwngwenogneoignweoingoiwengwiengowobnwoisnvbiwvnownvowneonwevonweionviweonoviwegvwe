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
    console.log('Trực Phù: ' + cung.info.trucPhu.tinh + ' | Trực Sử: ' + cung.info.trucSu.mon);
    let gates = '', tinh = '', than = '', thien = '', dia = '';
    for (let p = 1; p <= 9; p++) {
        gates += p + ':' + cung[p].mon + ' ';
        tinh += p + ':' + cung[p].tinh + ' ';
        than += p + ':' + cung[p].than + ' ';
        thien += p + ':' + cung[p].thien + ' ';
        dia += p + ':' + cung[p].dia + ' ';
    }
    console.log('Cửa: ' + gates);
    console.log('Tinh: ' + tinh);
    console.log('Thần: ' + than);
    console.log('Thiên: ' + thien);
    console.log('Địa: ' + dia);
    console.log('');
}
dump('19/8/2026 10:16', 19, 8, 2026, 10);
dump('23/8/2026 10:16', 23, 8, 2026, 10);
dump('24/8/2026 10:16', 24, 8, 2026, 10);
`;
eval(js + testCode);
