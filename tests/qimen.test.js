/**
 * Regression tests cho Kỳ Môn Độn Giáp (Thời Gia Chuyển Bàn).
 * Chạy: node tests/qimen.test.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'kymon.html'), 'utf8');
const JS = HTML.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeContext() {
    const stub = {
        addEventListener() {}, removeEventListener() {}, value: '', innerHTML: '',
        style: {}, dataset: {}, id: '', checked: false, textContent: '',
        classList: { add() {}, remove() {} },
        querySelector() { return null; }, querySelectorAll() { return []; }
    };
    const document = { getElementById() { return stub; }, querySelectorAll() { return []; } };
    const window = { _cungData: null, onload: null, addEventListener() {}, removeEventListener() {} };
    const sandbox = { console, document, window, Date, Math, JSON, Array, Object, String, Number, Boolean };
    vm.createContext(sandbox);
    // Chạy cùng 1 script để lộ các hằng const/let (block-scoped) ra ngoài qua globalThis.
    vm.runInContext(JS + '\n;globalThis.__X = { YUAN_BY_CHI: YUAN_BY_CHI, QIMEN_CONFIG: QIMEN_CONFIG };', sandbox);
    return sandbox;
}

function board(ctx, year, month, day, hour, minute = 0) {
    const c = ctx.anBan(new ctx.Date(year, month - 1, day, hour, minute, 0));
    const out = { cuc: c.info.cuc, day: c.info.dayCanChi };
    for (let p = 1; p <= 9; p++) {
        out[p] = { than: c[p].than, mon: c[p].mon, tinh: c[p].tinh, thien: c[p].thien, dia: c[p].dia };
    }
    return out;
}

let passed = 0, failed = 0;
function test(name, fn) {
    try { fn(); passed++; console.log('  PASS  ' + name); }
    catch (e) { failed++; console.log('  FAIL  ' + name + ' -> ' + e.message); }
}

const ctx = makeContext();

// GOLDEN 1: Dương độn 1 — 17/3/2021 03:00 (Giáp Tý day, Bính Dần hour)
test('Golden 1: Dương độn 1 - 17/3/2021 03:00', () => {
    const b = board(ctx, 2021, 3, 17, 3);
    assert.strictEqual(b.cuc.so, 1, 'cục số');
    assert.strictEqual(b.cuc.duong, true, 'dương độn');
    assert.strictEqual(b.cuc.tiet, 'Kinh Trập', 'tiết khí');
    assert.strictEqual(b.cuc.nguyen, 'Thượng', 'nguyên');
    assert.strictEqual(b.day, 'Giáp Tý', 'ngày can chi');

    const exp = {
        tinh: { 1: 'Thiên Tâm', 2: 'Thiên Anh', 3: 'Thiên Nhậm', 4: 'Thiên Xung', 5: 'Thiên Cầm', 6: 'Thiên Trụ', 7: 'Thiên Nhuế', 8: 'Thiên Bồng', 9: 'Thiên Phụ' },
        mon:  { 1: 'Khai', 2: 'Cảnh', 3: 'Sinh', 4: 'Thương', 5: '', 6: 'Kinh', 7: 'Tử', 8: 'Hưu', 9: 'Đỗ' },
        than: { 1: 'Cửu Thiên', 2: 'Câu Trần', 3: 'Đằng Xà', 4: 'Thái Âm', 5: '', 6: 'Cửu Địa', 7: 'Chu Tước', 8: 'Trực Phù', 9: 'Lục Hợp' },
        thien:{ 1: 'Canh', 2: 'Tân', 3: 'Nhâm', 4: 'Quý', 5: 'Đinh', 6: 'Bính', 7: 'Át', 8: 'Mậu', 9: 'Kỷ' },
        dia:  { 1: 'Mậu', 2: 'Kỷ', 3: 'Canh', 4: 'Tân', 5: 'Nhâm', 6: 'Quý', 7: 'Đinh', 8: 'Bính', 9: 'Át' }
    };
    for (let p = 1; p <= 9; p++) {
        assert.strictEqual(b[p].tinh, exp.tinh[p], `cung ${p} tinh`);
        assert.strictEqual(b[p].mon, exp.mon[p], `cung ${p} mon`);
        assert.strictEqual(b[p].than, exp.than[p], `cung ${p} than`);
        assert.strictEqual(b[p].thien, exp.thien[p], `cung ${p} thien`);
        assert.strictEqual(b[p].dia, exp.dia[p], `cung ${p} dia`);
    }
});

// GOLDEN 2: giờ Giáp — Trực Phù về bản cung, Thiên bàn không xoay
test('Golden 2: giờ Giáp - 17/3/2021 19:00', () => {
    const b = board(ctx, 2021, 3, 17, 19);
    assert.strictEqual(b.cuc.so, 1, 'cục số');
    for (let p = 1; p <= 9; p++) {
        assert.strictEqual(b[p].thien, b[p].dia, `cung ${p} thiên == địa`);
    }
    assert.strictEqual(b[1].tinh, 'Thiên Bồng', 'trực phù về bản cung');
});


// GOLDEN 3: Âm độn — 22/8/2026 10:16 (Lập Thu Thượng nguyên, Âm độn 2)
test('Golden 3: Âm độn 2 - 22/8/2026 10:16', () => {
    const b = board(ctx, 2026, 8, 22, 10, 16);
    assert.strictEqual(b.cuc.so, 2, 'cục số');
    assert.strictEqual(b.cuc.duong, false, 'âm độn');
    for (let p = 1; p <= 9; p++) {
        assert.notStrictEqual(b[p].than, 'Câu Trần', `cung ${p} không Câu Trần`);
        assert.notStrictEqual(b[p].than, 'Chu Tước', `cung ${p} không Chu Tước`);
    }
    const spirits = new Set();
    for (let p = 1; p <= 9; p++) if (b[p].than) spirits.add(b[p].than);
    assert.deepStrictEqual([...spirits].sort(),
        ['Bạch Hổ', 'Cửu Địa', 'Cửu Thiên', 'Đằng Xà', 'Huyền Vũ', 'Lục Hợp', 'Thái Âm', 'Trực Phù'].sort());
});

// Nguyên (元) mapping — 子午卯酉=Thượng, 辰戌丑未=Hạ, 寅申巳亥=Trung
test('Nguyên theo địa chi Phù Đầu (12 nhánh)', () => {
    const YUAN = ctx.__X.YUAN_BY_CHI;
    assert.strictEqual(YUAN[0], 'Thượng');
    assert.strictEqual(YUAN[3], 'Thượng');
    assert.strictEqual(YUAN[6], 'Thượng');
    assert.strictEqual(YUAN[9], 'Thượng');
    assert.strictEqual(YUAN[1], 'Hạ');
    assert.strictEqual(YUAN[4], 'Hạ');
    assert.strictEqual(YUAN[7], 'Hạ');
    assert.strictEqual(YUAN[10], 'Hạ');
    assert.strictEqual(YUAN[2], 'Trung');
    assert.strictEqual(YUAN[5], 'Trung');
    assert.strictEqual(YUAN[8], 'Trung');
    assert.strictEqual(YUAN[11], 'Trung');
});

// Day boundary — 23:00 đổi ngày (DAY_BOUNDARY_MODE = '2300')
test('Day boundary: 23:00 thuộc ngày kế tiếp', () => {
    const d22 = ctx.getDayCanChi(ctx.jdFromDate(22, 8, 2026));
    const d23 = ctx.getDayCanChi(ctx.jdFromDate(23, 8, 2026));
    const b = board(ctx, 2026, 8, 22, 23, 30);
    const expected = d23.gan + ' ' + d23.chi;
    assert.strictEqual(b.day, expected, '23:30 dùng ngày kế tiếp');
    assert.notStrictEqual(d22.gan + ' ' + d22.chi, expected, 'ngày 22 vs 23 khác nhau');
});

// Tiết khí — ngày nằm TRONG khoảng tiết khí (không phải "tiết khí kế tiếp")
test('Tiết khí: 17/3/2021 thuộc Kinh Trập (không phải Xuân Phân)', () => {
    const t = ctx.getTietKhi(3, 17, 2021);
    assert.strictEqual(t.name, 'Kinh Trập', '17/3 là Kinh Trập');
});

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
