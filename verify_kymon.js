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
    return cung;
}

// 17/3/2021 = Giáp Tý day, Kinh Trập Thượng nguyên = Dương độn 1 cục.
// At giờ Dần (03:00) = Bính Dần hour.
const c = dump('17/3/2021 03h (giờ Dần / Bính Dần)', 17, 3, 2021, 3);

// Reference (hand-computed, Dương độn 1, Giáp Tý day, Bính Dần hour, 时旬首 + 值使随时宫 theo địa chi):
const expect = {
    star: { 1:'Thiên Tâm', 2:'Thiên Anh', 3:'Thiên Nhậm', 4:'Thiên Xung', 5:'Thiên Cầm', 6:'Thiên Trụ', 7:'Thiên Nhuế', 8:'Thiên Bồng', 9:'Thiên Phụ' },
    door: { 1:'Khai', 2:'Cảnh', 3:'Sinh', 4:'Thương', 5:'', 6:'Kinh', 7:'Tử', 8:'Hưu', 9:'Đỗ' },
    than: { 1:'Cửu Thiên', 2:'Câu Trần', 3:'Đằng Xà', 4:'Thái Âm', 5:'', 6:'Cửu Địa', 7:'Chu Tước', 8:'Trực Phù', 9:'Lục Hợp' },
    thien: { 1:'Canh', 2:'Tân', 3:'Nhâm', 4:'Quý', 5:'Đinh', 6:'Bính', 7:'Át', 8:'Mậu', 9:'Kỷ' },
    dia: { 1:'Mậu', 2:'Kỷ', 3:'Canh', 4:'Tân', 5:'Nhâm', 6:'Quý', 7:'Đinh', 8:'Bính', 9:'Át' }
};
let fails = 0;
function chk(palace, field, got, want) {
    if (got !== want) { console.log('  MISMATCH cung ' + palace + ' ' + field + ': got=' + got + ' want=' + want); fails++; }
}
for (let p = 1; p <= 9; p++) {
    chk(p, 'Tinh', c[p].tinh, expect.star[p]);
    chk(p, 'Cửa', c[p].mon, expect.door[p]);
    chk(p, 'Thần', c[p].than, expect.than[p]);
    chk(p, 'Thiên', c[p].thien, expect.thien[p]);
    chk(p, 'Địa', c[p].dia, expect.dia[p]);
}
console.log(fails === 0 ? 'PASS: board matches reference' : 'FAIL: ' + fails + ' mismatches');

// Also dump Tuất hour to show the hour transition uses the DAY xunshou (constant leader star/door).
dump('17/3/2021 19h (giờ Tuất / Giáp Tuất)', 17, 3, 2021, 19);
`;
eval(js + testCode);
