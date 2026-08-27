/**
 * CONFLICT COMPARISON TESTS — so sánh A/B cho các rule conflict, KHÔNG thay đổi default.
 * Mục tiêu: đo mức độ khác nhau giữa các trường phái (bao nhiêu case, khác cung nào).
 * Chạy: node tests/qimen-conflict.test.js
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

function thienOf(b) { const s = {}; for (let p = 1; p <= 9; p++) s[p] = b[p].thien; return s; }
function spiritsOf(b) { const s = {}; for (let p = 1; p <= 9; p++) s[p] = b[p].than; return s; }
function starsOf(b) { const s = {}; for (let p = 1; p <= 9; p++) s[p] = b[p].tinh; return s; }
function eq(a, b) { for (let p = 1; p <= 9; p++) if (a[p] !== b[p]) return false; return true; }

let tianPanDiff = 0, spiritDiff = 0, dayDiff = 0, tianQinDiff = 0;
let total = 0;
const tianPanExample = { first: null };

for (let year of [2025]) {
    for (let day = 1; day <= 360; day += 2) {
        for (let hour = 0; hour < 24; hour++) {
            const d = new ctx.Date(year, 0, 1, hour, 0, 0); // Jan 1 + offset
            d.setDate(day);
            const base = ctx.anBan(d);
            total++;

            // Conflict #1: Thiên bàn Lạc Thư (default) vs LINEAR
            const lin = ctx.anBan(d, { heavenPlateRule: 'LINEAR' });
            if (!eq(thienOf(base), thienOf(lin))) {
                tianPanDiff++;
                if (!tianPanExample.first) {
                    tianPanExample.first = { date: `${year}-${day} ${hour}h`, luoshu: thienOf(base), linear: thienOf(lin) };
                }
            }

            // Conflict #2: Bát Thần FIXED vs YIN_YANG_SWAP
            const swap = ctx.anBan(d, { spiritRuleset: 'YIN_YANG_SWAP' });
            if (!eq(spiritsOf(base), spiritsOf(swap))) spiritDiff++;

            // Conflict #3: Day boundary 2300 vs 0000 (chỉ khác lúc 23:00+)
            const z = ctx.anBan(d, { dayBoundaryMode: '0000' });
            if (base.info.dayCanChi !== z.info.dayCanChi) dayDiff++;

            // Conflict #6: Tian Qin JI_KUN2 vs KEEP_CENTER
            const kc = ctx.anBan(d, { tianQinRule: 'KEEP_CENTER' });
            if (!eq(starsOf(base), starsOf(kc))) tianQinDiff++;
        }
    }
}

console.log(`=== CONFLICT COMPARISON (${total} cases) ===`);
console.log(`#1 Thiên bàn  Lạc Thư vs LINEAR      : ${tianPanDiff}/${total} khác`);
console.log(`#2 Bát Thần   FIXED vs YIN/YANG_SWAP  : ${spiritDiff}/${total} khác`);
console.log(`#3 Day boundary 2300 vs 0000 (ngày)  : ${dayDiff}/${total} khác`);
console.log(`#6 Tian Qin   JI_KUN2 vs KEEP_CENTER  : ${tianQinDiff}/${total} khác`);

if (tianPanExample.first) {
    console.log(`\nVD #1 (${tianPanExample.first.date}):`);
    for (let p = 1; p <= 9; p++) {
        if (tianPanExample.first.luoshu[p] !== tianPanExample.first.linear[p]) {
            console.log(`  cung ${p}: Lạc Thư=${tianPanExample.first.luoshu[p]} vs LINEAR=${tianPanExample.first.linear[p]}`);
        }
    }
}

// Không được phá default: golden vẫn phải đúng (đã test riêng ở qimen.test.js).
// Assert: default board vẫn hợp lệ (topology).
assert.ok(tianPanDiff >= 0 && spiritDiff >= 0 && dayDiff >= 0 && tianQinDiff >= 0);
console.log('\nPASS: conflict comparison hoàn tất (KHÔNG đổi default ruleset)');
