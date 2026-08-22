const fs = require('fs');
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const stub = { addEventListener: function () {}, value: '', innerHTML: '', style: {}, dataset: {}, id: '', checked: false };
const document = { getElementById: function () { return stub; }, querySelectorAll: function () { return []; } };
const window = {};
eval(js);

const dirs = ['', 'Bắc', 'Tây Nam', 'Đông', 'Đông Nam', 'Trung ương', 'Tây Bắc', 'Tây', 'Đông Bắc', 'Nam'];

function dump(label, day, month, year, hour) {
    const date = new Date(year, month - 1, day, hour, 0, 0);
    const cung = anBan(date);
    console.log('=== ' + label + ' (20/8/2026) ===');
    console.log('Cục: ' + cung.info.cuc.so + ' (' + (cung.info.cuc.duong ? 'Dương' : 'Âm') + ' độn) - ' + cung.info.cuc.tiet + ' - ' + cung.info.cuc.nguyen + ' nguyên');
    console.log('Ngày: ' + cung.info.dayCanChi + ' | gioChi=' + cung.info.gioChi + ' | gioGan=' + cung.info.gioGan);
    console.log('Trực Phù: sao cung ' + cung.info.trucPhu.cung + ', Trực Sử: cửa cung ' + cung.info.trucSu.cung);
    for (let p = 1; p <= 9; p++) {
        console.log('  Cung ' + p + ' (' + dirs[p] + '): Thần=' + cung[p].than + ' | Cửa=' + cung[p].mon + ' | Tinh=' + cung[p].tinh + ' | Thiên=' + cung[p].thien + ' | Địa=' + cung[p].dia);
    }
    console.log('');
    return cung;
}

dump('08:00 giờ Thìn', 20, 8, 2026, 8);
dump('15:42 giờ Thân', 20, 8, 2026, 15);

