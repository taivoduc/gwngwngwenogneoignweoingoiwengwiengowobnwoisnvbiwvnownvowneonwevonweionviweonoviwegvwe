const fs = require('fs');
const html = fs.readFileSync(__dirname + '/kymon.html', 'utf8');
const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const stub = { addEventListener: function () {}, value: '', innerHTML: '', style: {}, dataset: {}, id: '', checked: false };
const document = { getElementById: function () { return stub; }, querySelectorAll: function () { return []; } };
const window = {};
eval(js);

const chi = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
let bad = 0;
for (let h = 0; h < 24; h++) {
    const c = anBan(new Date(2021, 2, 17, h, 0, 0));
    const gi = Math.floor((h + 1) / 2) % 12;
    const ok = gi === c.info.gioChi;
    if (!ok) bad++;
    console.log((h < 10 ? '0' : '') + h + 'h -> giờ ' + chi[c.info.gioChi] + ' (gioChi=' + c.info.gioChi + ') ' + (ok ? 'OK' : 'BAD') + ' | Trực Phù cung=' + c.info.trucPhu.cung + ' | Trực Sử cung=' + c.info.trucSu.cung);
}
console.log(bad === 0 ? 'ALL HOURS OK' : bad + ' HOURS BAD');
