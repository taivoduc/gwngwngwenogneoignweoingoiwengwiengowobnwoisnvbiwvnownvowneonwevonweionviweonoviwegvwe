/**
 * BOUNDARY TESTS — solar-term exact instant (±30/±10 phút quanh mỗi giao tiết).
 * Chạy: node tests/qimen-boundary.test.js
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
    vm.runInContext(JS + '\n;globalThis.__X = { TIET_KHI: TIET_KHI };', sandbox);
    return sandbox;
}

const ctx = makeContext();
const TIET_KHI = ctx.__X.TIET_KHI;
const MIN = 1 / 1440; // 1 phút tính theo JD

let checked = 0;
for (let year of [2024, 2025, 2026]) {
    for (let i = 0; i < TIET_KHI.length; i++) {
        const name = TIET_KHI[i].name;
        const prev = TIET_KHI[(i - 1 + 24) % 24].name;
        const instant = ctx.findTietKhiJd(name, year);

        // Trước giao tiết 30/10 phút → vẫn là tiết KHÍ TRƯỚC
        assert.strictEqual(ctx.solarTermAtInstant(instant - 30 * MIN).name, prev, `${name} ${year}: -30 phút phải là ${prev}`);
        assert.strictEqual(ctx.solarTermAtInstant(instant - 10 * MIN).name, prev, `${name} ${year}: -10 phút phải là ${prev}`);

        // Đúng + sau giao tiết 10/30 phút → là tiết khí HIỆN TẠI
        assert.strictEqual(ctx.solarTermAtInstant(instant + 10 * MIN).name, name, `${name} ${year}: +10 phút phải là ${name}`);
        assert.strictEqual(ctx.solarTermAtInstant(instant + 30 * MIN).name, name, `${name} ${year}: +30 phút phải là ${name}`);

        // ±1 phút: không crash, trả term hợp lệ (sai số nội suy Meeus ~ vài phút)
        const nearBefore = ctx.solarTermAtInstant(instant - MIN);
        const nearAfter = ctx.solarTermAtInstant(instant + MIN);
        assert.ok([prev, name].includes(nearBefore.name), `${name}: -1 phút term lạ "${nearBefore.name}"`);
        assert.ok([prev, name].includes(nearAfter.name), `${name}: +1 phút term lạ "${nearAfter.name}"`);
        checked++;
    }
}

console.log(`PASS: ${checked} boundary checks (24 tiết × 3 năm × ±30/±10/±1 phút)`);
