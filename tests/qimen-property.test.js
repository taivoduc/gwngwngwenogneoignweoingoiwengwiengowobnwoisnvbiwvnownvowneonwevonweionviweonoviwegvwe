/**
 * PROPERTY TESTS — kiểm tra tính hợp lệ của MỌI QimenBoard.
 * Không kiểm tra giá trị cụ thể (đó là việc của golden tests),
 * chỉ kiểm tra các bất biến: đủ 9 cung, 8 môn unique, 8 tinh unique,
 * 8 thần unique, 9 kỳ nghi unique, không NaN/undefined, board immutable.
 *
 * Chạy: node tests/qimen-property.test.js
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
    vm.runInContext(JS, sandbox);
    return sandbox;
}

const ctx = makeContext();
const GATES = ['Hưu', 'Sinh', 'Thương', 'Đỗ', 'Cảnh', 'Tử', 'Kinh', 'Khai'];
const STARS = ['Thiên Bồng', 'Thiên Nhuế', 'Thiên Xung', 'Thiên Phụ', 'Thiên Tâm', 'Thiên Trụ', 'Thiên Nhậm', 'Thiên Anh'];
const SPIRITS = ['Trực Phù', 'Đằng Xà', 'Thái Âm', 'Lục Hợp', 'Bạch Hổ', 'Huyền Vũ', 'Cửu Địa', 'Cửu Thiên'];
const STEMS = ['Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý', 'Đinh', 'Bính', 'Át'];

function checkBoard(year, month, day, hour) {
    const b = ctx.anBan(new ctx.Date(year, month - 1, day, hour, 0, 0));
    const tag = `${year}-${month}-${day} ${hour}h`;

    // 1. Đủ 9 cung (1..9)
    for (let p = 1; p <= 9; p++) assert.ok(b[p], `${tag}: thiếu cung ${p}`);

    // 2. Không undefined/NaN cho các trường chuỗi
    for (let p = 1; p <= 9; p++) {
        for (const f of ['mon', 'than', 'tinh', 'dia', 'thien']) {
            assert.ok(typeof b[p][f] === 'string', `${tag}: cung ${p}.${f} không phải string`);
            assert.ok(b[p][f] !== 'undefined', `${tag}: cung ${p}.${f} undefined`);
        }
    }

    // 3. 8 môn unique (ngoài Trung cung)
    const gates = [];
    for (let p = 1; p <= 9; p++) if (p !== 5 && b[p].mon) gates.push(b[p].mon);
    assert.strictEqual(gates.length, 8, `${tag}: phải đủ 8 môn`);
    assert.strictEqual(new Set(gates).size, 8, `${tag}: môn trùng lặp`);
    gates.forEach(g => assert.ok(GATES.includes(g), `${tag}: môn lạ "${g}"`));

    // 4. 8 sao unique (ngoài Trung cung; 天禽寄坤二 nên Trung cung không sao)
    const stars = [];
    for (let p = 1; p <= 9; p++) if (p !== 5 && b[p].tinh) stars.push(b[p].tinh);
    assert.strictEqual(stars.length, 8, `${tag}: phải đủ 8 sao`);
    assert.strictEqual(new Set(stars).size, 8, `${tag}: sao trùng lặp`);
    stars.forEach(s => assert.ok(STARS.includes(s), `${tag}: sao lạ "${s}"`));

    // 5. 8 thần unique
    const spirits = [];
    for (let p = 1; p <= 9; p++) if (p !== 5 && b[p].than) spirits.push(b[p].than);
    assert.strictEqual(spirits.length, 8, `${tag}: phải đủ 8 thần`);
    assert.strictEqual(new Set(spirits).size, 8, `${tag}: thần trùng lặp`);
    spirits.forEach(s => assert.ok(SPIRITS.includes(s), `${tag}: thần lạ "${s}"`));

    // 6. Địa bàn: 9 kỳ nghi (Mậu..Át) đủ & unique
    const earth = [];
    for (let p = 1; p <= 9; p++) earth.push(b[p].dia);
    assert.strictEqual(new Set(earth).size, 9, `${tag}: địa bàn thiếu/trùng kỳ nghi`);
    earth.forEach(s => assert.ok(STEMS.includes(s), `${tag}: địa bàn kỳ nghi lạ "${s}"`));

    // 7. Thiên bàn: 9 kỳ nghi đủ & unique
    const heaven = [];
    for (let p = 1; p <= 9; p++) heaven.push(b[p].thien);
    assert.strictEqual(new Set(heaven).size, 9, `${tag}: thiên bàn thiếu/trùng kỳ nghi`);
    heaven.forEach(s => assert.ok(STEMS.includes(s), `${tag}: thiên bàn kỳ nghi lạ "${s}"`));

    // 8. Board immutable + có audit metadata
    assert.ok(Object.isFrozen(b), `${tag}: board không bị freeze`);
    assert.ok(Object.isFrozen(b.info), `${tag}: info không bị freeze`);
    assert.ok(b.info.ruleSetVersion, `${tag}: thiếu ruleSetVersion`);
    assert.ok(b.info.ruleSetHash, `${tag}: thiếu ruleSetHash`);
}

let checked = 0;
for (let year = 2021; year <= 2026; year++) {
    for (let month = 1; month <= 12; month++) {
        for (const day of [1, 15]) {
            for (const hour of [0, 4, 8, 12, 16, 20, 23]) {
                checkBoard(year, month, day, hour);
                checked++;
            }
        }
    }
}

console.log(`PASS: ${checked} boards hợp lệ (9 cung, 8 môn/tinh/thần unique, 9 kỳ nghi, immutable)`);
