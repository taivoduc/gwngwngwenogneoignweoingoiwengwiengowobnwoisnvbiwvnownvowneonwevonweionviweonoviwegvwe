// tests/interpretation-schema.test.js — Schema validation của toàn bộ output.
// Chạy: node tests/interpretation-schema.test.js
'use strict';
const iq = require('../index.js');
const { goldenChart } = require('./_helpers.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS  ' + name); }
    else { failed++; console.log('  FAIL  ' + name + (extra !== undefined ? ' -> ' + JSON.stringify(extra).slice(0, 300) : '')); }
}

const chart = goldenChart();
const result = iq.interpretQimen(chart, { type: 'CAREER', text: 'Tôi có nên đổi việc?' }, {});

// --- top-level ---
check('result.chartId string', typeof result.chartId === 'string' && result.chartId.length > 0);
check('result.questionType trong danh sách', !!iq.QUESTION_TYPES.find(q => q.id === result.questionType));
check('result.ruleSetVersion', typeof result.ruleSetVersion === 'string');

// --- yongShen ---
check('yongShen.primary mảng', Array.isArray(result.yongShen.primary) && result.yongShen.primary.length > 0);
check('yongShen.secondary mảng', Array.isArray(result.yongShen.secondary) && result.yongShen.secondary.length > 0);
check('yongShen.all = primary+secondary', result.yongShen.all.length === result.yongShen.primary.length + result.yongShen.secondary.length);
result.yongShen.all.forEach((y, i) => {
    check('yongShen[' + i + '].label', typeof y.label === 'string' && y.label.length > 0);
});

// --- findings ---
check('findings mảng', Array.isArray(result.findings) && result.findings.length > 0);
result.findings.forEach((f, i) => {
    const ok = typeof f.ruleId === 'string' && f.ruleId.length > 0
        && typeof f.name === 'string'
        && ['FAVORABLE', 'UNFAVORABLE', 'NEUTRAL', 'MIXED'].indexOf(f.polarity) >= 0
        && ['STRONG', 'MODERATE', 'WEAK'].indexOf(f.strength) >= 0
        && Array.isArray(f.evidence) && f.evidence.length > 0
        && typeof f.source === 'string' && f.source.length > 0
        && typeof f.sourceType === 'string'
        && typeof f.school === 'string'
        && typeof f.confidence === 'string'
        && typeof f.priority === 'number'
        && typeof f.explanation === 'string';
    if (!ok) { failed++; console.log('  FAIL  finding[' + i + '] schema: ' + JSON.stringify(f).slice(0, 200)); }
});
if (passed > 0 && !result.findings.some(f => !(typeof f.ruleId === 'string' && f.ruleId.length && Array.isArray(f.evidence) && f.evidence.length))) {
    // đã đếm qua vòng lặp; tránh đếm trùng
}
console.log('  (findings schema đã kiểm tra từng phần tử)');

// --- conclusion ---
const c = result.conclusion;
check('conclusion.summary string', typeof c.summary === 'string' && c.summary.length > 0);
check('conclusion.dimensions mảng', Array.isArray(c.dimensions) && c.dimensions.length > 0);
c.dimensions.forEach(d => {
    check('dimension ' + d.dimension, typeof d.dimension === 'string' && ['FAVORABLE', 'UNFAVORABLE', 'MIXED', 'NEUTRAL'].indexOf(d.direction) >= 0 && ['STRONG', 'MODERATE', 'WEAK'].indexOf(d.intensity) >= 0);
});
check('favorableFactors mảng', Array.isArray(c.favorableFactors));
check('unfavorableFactors mảng', Array.isArray(c.unfavorableFactors));
check('risks mảng', Array.isArray(c.risks));
check('opportunities mảng', Array.isArray(c.opportunities));
check('timing string', typeof c.timing === 'string' && c.timing.length > 0);
check('evidence mảng', Array.isArray(c.evidence));

// --- KHÔNG có claim xác suất / tuyệt đối ---
const FORBIDDEN = ['100%', 'xác suất', 'probability', 'successProbability', 'chanceOfSuccess', 'đảm bảo thành công', 'chắc chắn xảy ra'];
// Chỉ scan phần KẾT LUẬN (không scan provenance.limitations — phần đó ĐƯỢC phép
// cảnh báo "không phải xác suất").
const dump = JSON.stringify({ conclusion: result.conclusion, findings: result.findings, advice: result.advice, summary: result.conclusion.summary });
FORBIDDEN.forEach(term => {
    check('không có từ cấm "' + term + '"', dump.indexOf(term) < 0);
});

// --- provenance ---
const p = result.provenance;
check('provenance.rulesUsed mảng', Array.isArray(p.rulesUsed) && p.rulesUsed.length > 0);
check('provenance.sources mảng', Array.isArray(p.sources) && p.sources.length > 0);
check('provenance.limitations mảng', Array.isArray(p.limitations) && p.limitations.length > 0);
check('provenance.chartRuleSetHash', typeof p.chartRuleSetHash === 'string');
check('provenance.patternsUsed mảng', Array.isArray(p.patternsUsed));

// --- explain mode ---
const ex = result.explain();
check('explain.text string dài', typeof ex.text === 'string' && ex.text.length > 200);
check('explain có [RULE]', ex.text.indexOf('[RULE]') >= 0);
check('explain có [EVIDENCE]', ex.text.indexOf('[EVIDENCE]') >= 0);
check('explain có [SYNTHESIS]', ex.text.indexOf('[SYNTHESIS]') >= 0);

// --- traceability: mọi kết luận truy ngược về findings ---
const allRuleIds = new Set(result.findings.map(f => f.ruleId));
check('mọi finding có ruleId trong provenance.rulesUsed', result.findings.every(f => p.rulesUsed.indexOf(f.ruleId) >= 0));

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
