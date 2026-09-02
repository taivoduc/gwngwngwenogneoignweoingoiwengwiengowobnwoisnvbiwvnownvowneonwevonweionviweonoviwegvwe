// tests/interpretation-relations.test.js — Relation Engine (5 hành).
// Chạy: node tests/interpretation-relations.test.js
'use strict';
const fe = require('../knowledge/five-elements.js');
const iq = require('../index.js');
const { goldenChart } = require('./_helpers.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS  ' + name); }
    else { failed++; console.log('  FAIL  ' + name + (extra !== undefined ? ' -> ' + JSON.stringify(extra).slice(0, 200) : '')); }
}

// --- toàn bộ 25 cặp 5 hành ---
const E = fe.E;
const all = fe.ALL;
const expected = {
    'Kim,Kìm': null, // placeholder để đảm bảo không sót (sẽ ghi đè)
};
let pairsChecked = 0;
for (const a of all) {
    for (const b of all) {
        const rel = fe.relation(a, b);
        pairsChecked++;
        if (a === b) check('relation(' + a + ',' + b + ') = sameElement', rel === 'sameElement', rel);
        else if (fe.GENERATES[a] === b) check('relation(' + a + ',' + b + ') = generates', rel === 'generates', rel);
        else if (fe.GENERATES[b] === a) check('relation(' + a + ',' + b + ') = generatedBy', rel === 'generatedBy', rel);
        else if (fe.CONTROLS[a] === b) check('relation(' + a + ',' + b + ') = controls', rel === 'controls', rel);
        else check('relation(' + a + ',' + b + ') = controlledBy', rel === 'controlledBy', rel);
    }
}
check('đã kiểm tra 25 cặp', pairsChecked === 25);

// --- chu kỳ sinh/khắc ---
check('Kim sinh Thủy', fe.GENERATES[E.KIM] === E.THUY);
check('Thủy sinh Mộc', fe.GENERATES[E.THUY] === E.MOC);
check('Mộc sinh Hỏa', fe.GENERATES[E.MOC] === E.HOA);
check('Hỏa sinh Thổ', fe.GENERATES[E.HOA] === E.THO);
check('Thổ sinh Kim', fe.GENERATES[E.THO] === E.KIM);
check('Kim khắc Mộc', fe.CONTROLS[E.KIM] === E.MOC);
check('Mộc khắc Thổ', fe.CONTROLS[E.MOC] === E.THO);
check('Thổ khắc Thủy', fe.CONTROLS[E.THO] === E.THUY);
check('Thủy khắc Hỏa', fe.CONTROLS[E.THUY] === E.HOA);
check('Hỏa khắc Kim', fe.CONTROLS[E.HOA] === E.KIM);

// --- relationsForChart trên golden chart (17/3/2021: cung 1 = Kinh Kim / Khảm Thủy) ---
const chart = goldenChart();
const norm = iq.normalizeChart(chart);
const rels = iq.relationsForChart(norm);
check('relations.chart mảng', Array.isArray(rels.chart) && rels.chart.length > 0);
check('relations.perPalace có 9 cung', Object.keys(rels.perPalace).length === 9);

// cung 1: Kinh Môn (Kim) tại Khảm (Thủy) → Kim sinh Thủy → DOOR_PALACE_GENERATES
const p1 = rels.perPalace[1];
const doorRel = p1.find(r => r.relation === 'DOOR_PALACE_GENERATES');
check('cung 1: Kinh Môn sinh cung Khảm (DOOR_PALACE_GENERATES)', !!doorRel, p1.map(r => r.relation));
check('cung 1: evidence đầy đủ', doorRel && doorRel.evidence && doorRel.evidence.length > 0, doorRel && doorRel.evidence);
check('cung 1: sourceLabel/targetLabel', doorRel && doorRel.sourceLabel === 'Kinh Môn' && doorRel.targetLabel === 'cung Khảm');

// cung 8: Khai Môn (Kim) tại Cấn (Thổ) → Thổ sinh Kim → DOOR_PALACE_GENERATEDBY
const p8 = rels.perPalace[8];
const doorRel8 = p8.find(r => r.relation === 'DOOR_PALACE_GENERATEDBY');
check('cung 8: cung Cấn sinh Khai Môn (DOOR_PALACE_GENERATEDBY)', !!doorRel8, p8.map(r => r.relation));

// mọi relation có đủ field
let relSchemaOk = true;
rels.chart.forEach(r => {
    if (!r.relation || !r.source || !r.target || !r.sourceLabel || !r.targetLabel || !r.elementSource || !r.elementTarget || !r.evidence) relSchemaOk = false;
});
check('mọi relation đủ schema', relSchemaOk);

// --- relation KHÔNG phải +1/-1 ---
check('relation không có trường score/số điểm', !rels.chart.some(r => ('score' in r) || ('points' in r)));

// --- fe.describe ---
check('describe trả text', typeof fe.describe('generates', 'A', 'B') === 'string' && fe.describe('generates', 'A', 'B').length > 0);

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
