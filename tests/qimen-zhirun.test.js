/**
 * ZHIRUN (置闰) INVARIANT + DIFFERENTIAL TEST.
 * - Invariant: valid output, determinism, upper-yuan trên 符头 days, drift ≤1 term.
 * - Differential: đếm ngày CHAIBU vs ZHIRUN cho cục khác nhau.
 * Chạy: node tests/qimen-zhirun.test.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const HTML = fs.readFileSync(path.join(__dirname, '..', 'kymon.html'), 'utf8');
const JS = HTML.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeContext() {
    const stub = { addEventListener(){}, value:'', innerHTML:'', style:{}, dataset:{}, id:'', checked:false, textContent:'',
        classList:{add(){},remove(){}}, querySelector(){return null;}, querySelectorAll(){return [];} };
    const document = { getElementById(){return stub;}, querySelectorAll(){return [];} };
    const window = { _cungData:null, onload:null, addEventListener(){}, removeEventListener(){} };
    const sandbox = { console, document, window, Date, Math, JSON, Array, Object, String, Number, Boolean };
    vm.createContext(sandbox);
    vm.runInContext(JS + '\n;globalThis.__termNames = TIET_KHI.map(function(t){return t.name;});', sandbox);
    return sandbox;
}

const ctx = makeContext();

function termIndex(name) {
    for (let i = 0; i < ctx.__termNames.length; i++) if (ctx.__termNames[i] === name) return i;
    return -1;
}
function termDist(a, b) { const d = Math.abs(a - b) % 24; return Math.min(d, 24 - d); }

let diff = 0, total = 0;
let prevWorkIdx = null;

// Duyệt ~30 năm, mỗi 2 ngày (~5480 mẫu)
for (let y = 2015; y <= 2044; y++) {
    for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 28; d += 2) {
            const jd = ctx.jdFromDate(d, m, y);
            const dayN = ((jd + 49) % 60 + 60) % 60;

            const chaibu = ctx.tinhCuc(m, d, y);
            const zhirun = ctx.resolveJuZhiRun(m, d, y);
            total++;

            // 1. Valid output
            assert.ok(zhirun.so >= 1 && zhirun.so <= 9, `${y}-${m}-${d}: cục ${zhirun.so}`);
            assert.ok(zhirun.nguyen === 'Thượng' || zhirun.nguyen === 'Trung' || zhirun.nguyen === 'Hạ', `${y}-${m}-${d}: nguyên ${zhirun.nguyen}`);
            assert.ok(termIndex(zhirun.tiet) >= 0, `${y}-${m}-${d}: term ${zhirun.tiet}`);

            // 2. Đếm khác biệt CHAIBU vs ZHIRUN
            if (chaibu.so !== zhirun.so || chaibu.duong !== zhirun.duong) diff++;

            // 3. Drift ≤1 term (working term vs astronomical term)
            const realIdx = termIndex(ctx.getTietKhi(m, d, y).name);
            const workIdx = termIndex(zhirun.tiet);
            assert.ok(termDist(workIdx, realIdx) <= 1, `${y}-${m}-${d}: working=${zhirun.tiet} real=${ctx.getTietKhi(m, d, y).name} drift>1`);

            // 4. Determinism
            const z2 = ctx.resolveJuZhiRun(m, d, y);
            assert.deepStrictEqual(z2, zhirun, `${y}-${m}-${d}: không deterministic`);
        }
    }
}

// 5. Upper yuan trên 符头 days (15-day leader)
let upperOk = 0, upperBad = 0;
for (let y = 2020; y <= 2025; y++) {
    for (let m = 1; m <= 12; m++) {
        for (let d = 1; d <= 28; d++) {
            const jd = ctx.jdFromDate(d, m, y);
            const dayN = ((jd + 49) % 60 + 60) % 60;
            if (dayN % 15 === 0) {
                const z = ctx.resolveJuZhiRun(m, d, y);
                if (z.nguyen === 'Thượng') upperOk++; else { upperBad++; console.log(`  LỖI: 符头 ${y}-${m}-${d} nguyên=${z.nguyen}`); }
            }
        }
    }
}

console.log(`=== ZHIRUN VALIDATION (${total} days) ===`);
console.log(`CHAIBU vs ZHIRUN khác cục: ${diff}/${total}`);
console.log(`Upper yuan trên 符头 days: ${upperOk} đúng / ${upperBad} sai`);
assert.strictEqual(upperBad, 0, '符头 days phải là Thượng nguyên');
console.log('PASS: ZHIRUN invariant + differential (KHÔNG đổi default CHAIBU)');
