/**
 * FUZZ + DETERMINISM TESTS.
 * - 10,000 random datetime (1900–2100): không crash, không NaN, board topology hợp lệ.
 * - Determinism: cùng input chạy 1000 lần → output y hệt nhau.
 * Chạy: node tests/qimen-fuzz.test.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'kymon.html'), 'utf8');
const JS = HTML.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeContext() {
    const stub = { addEventListener() {}, value: '', innerHTML: '', style: {}, dataset: {}, id: '', checked: false, textContent: '',
        classList: { add() {}, remove() {} }, querySelector() { return null; }, querySelectorAll() { return []; } };
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

function boardSignature(b) {
    const s = [];
    for (let p = 1; p <= 9; p++) s.push(b[p].mon + '|' + b[p].than + '|' + b[p].tinh + '|' + b[p].dia + '|' + b[p].thien);
    const i = b.info;
    s.push(i.cuc.so + '|' + i.cuc.duong + '|' + i.cuc.tiet + '|' + i.cuc.nguyen + '|' + i.gioGan + '|' + i.gioChi + '|' + i.trucPhu.cung + '|' + i.trucSu.cung);
    return s.join(';');
}

function checkTopology(b, tag) {
    for (let p = 1; p <= 9; p++) {
        for (const f of ['mon', 'than', 'tinh', 'dia', 'thien']) {
            assert.strictEqual(typeof b[p][f], 'string', `${tag}: cung ${p}.${f}`);
            assert.ok(!isNaN(b[p][f].length), `${tag}: cung ${p}.${f}`);
        }
    }
    const gates = []; for (let p = 1; p <= 9; p++) if (p !== 5 && b[p].mon) gates.push(b[p].mon);
    assert.strictEqual(new Set(gates).size, 8, `${tag}: 8 môn unique`);
    const stars = []; for (let p = 1; p <= 9; p++) if (p !== 5 && b[p].tinh) stars.push(b[p].tinh);
    assert.strictEqual(new Set(stars).size, 8, `${tag}: 8 sao unique`);
    const spirits = []; for (let p = 1; p <= 9; p++) if (p !== 5 && b[p].than) spirits.push(b[p].than);
    assert.strictEqual(new Set(spirits).size, 8, `${tag}: 8 thần unique`);
    const earth = []; for (let p = 1; p <= 9; p++) earth.push(b[p].dia);
    assert.strictEqual(new Set(earth).size, 9, `${tag}: 9 kỳ nghi địa`);
    const heaven = []; for (let p = 1; p <= 9; p++) heaven.push(b[p].thien);
    assert.strictEqual(new Set(heaven).size, 9, `${tag}: 9 kỳ nghi thiên`);
}

// LCG deterministic
let seed = 42;
function rand() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }

let fuzzCount = 0;
for (let i = 0; i < 10000; i++) {
    const year = 1900 + Math.floor(rand() * 200);       // 1900..2099
    const month = 1 + Math.floor(rand() * 12);
    const day = 1 + Math.floor(rand() * 28);             // 1..28 (an toàn mọi tháng)
    const hour = Math.floor(rand() * 24);
    const minute = Math.floor(rand() * 60);
    const b = ctx.anBan(new ctx.Date(year, month - 1, day, hour, minute, 0));
    checkTopology(b, `${year}-${month}-${day} ${hour}:${minute}`);
    fuzzCount++;
}

// Determinism: cùng input 1000 lần
const baseDate = new ctx.Date(2024, 6, 15, 14, 30, 0);
const sig0 = boardSignature(ctx.anBan(baseDate));
for (let i = 0; i < 1000; i++) {
    assert.strictEqual(boardSignature(ctx.anBan(baseDate)), sig0, `determinism run ${i}`);
}

console.log(`PASS: ${fuzzCount} fuzz boards + 1000 determinism runs (output y hệt)`);
