function jdFromDate(dd, mm, yy) {
    var a = Math.floor((14 - mm) / 12);
    var y = yy + 4800 - a;
    var m = mm + 12 * a - 3;
    var jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jd;
}
const gan = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const chi = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
function name(idx) {
    return gan[idx % 10] + ' ' + chi[idx % 12];
}
const dates = [[20,8,2026],[18,8,2026],[20,2,2026],[17,3,2021],[1,1,2000],[1,1,2021]];
for (const [d,mo,y] of dates) {
    const jd = jdFromDate(d, mo, y);
    const o = jd - 2415021;
    const gi = (o + 9) % 10, ci = (o + 1) % 12;
    const codeIdx = ((gi % 2) === (ci % 2)) ? (gi + 10*0) : -1; // placeholder
    // correct formula: idx = (jd + 49) % 60
    const stdIdx = ((jd + 49) % 60 + 60) % 60;
    const stdGan = stdIdx % 10, stdChi = stdIdx % 12;
    console.log(d + '/' + mo + '/' + y + ' jd=' + jd
        + ' | CODE=' + gi + ',' + ci + ' (' + gan[gi] + ' ' + chi[ci] + ')'
        + ' | STD=' + stdIdx + ' (' + gan[stdGan] + ' ' + chi[stdChi] + ')');
}
