'use strict';
/**
 * lib/explain.js — Chế độ giải thích (debug/explain mode).
 *
 * explainInterpretation(result) → chuỗi văn bản trace đầy đủ:
 *   [RULE] → [EVIDENCE] → [EFFECT] → [SYNTHESIS]
 * Mọi kết luận đều truy ngược về rule + knowledge node.
 */
const { DIM_LABEL } = require('./interpretationSynthesizer.js');

function explainInterpretation(result, options) {
    const opts = options || {};
    const L = [];
    const NL = String.fromCharCode(10);
    L.push('=== INTERPRETATION TRACE ===');
    L.push('Chart: ' + result.chartId);
    L.push('Question: ' + (result.question.text || result.question.type) + ' → ' + result.questionType);
    L.push('ruleSetVersion: ' + result.ruleSetVersion + ' | chartHash: ' + (result.provenance && result.provenance.chartRuleSetHash));
    L.push('');
    L.push('--- Dụng thần ---');
    (result.yongShen.all || []).forEach(function (ys) {
        L.push('  ' + (ys.palace !== null && ys.palace !== undefined ? ys.label + ' @ cung ' + ys.palace : ys.label + ' @ [không định vị: ' + (ys.note || 'Giáp ẩn') + ']'));
    });
    L.push('');
    L.push('--- FINDINGS ---');
    (result.findings || []).forEach(function (f) {
        L.push('[RULE] ' + f.ruleId + ' (' + f.name + ') priority=' + f.priority);
        L.push('  [EVIDENCE] ' + (f.evidence || []).join('; '));
        L.push('  [EFFECT] ' + f.polarity + ' / ' + f.strength + (f.dimensions ? ' [dims: ' + f.dimensions.join(',') + ']' : ' [general]'));
        L.push('  [SOURCE] ' + f.sourceType + ' :: ' + f.source + (f.schoolDependent ? ' (school-dependent)' : ''));
    });
    L.push('');
    L.push('[SYNTHESIS]');
    (result.conclusion.dimensions || []).forEach(function (d) {
        L.push('  [' + d.dimension + '] ' + d.direction + ' / ' + d.intensity + ' (score=' + d.score + ', thuận=' + d.favorableCount + ', nghịch=' + d.unfavorableCount + ')');
    });
    L.push('KẾT LUẬN: ' + result.conclusion.summary);
    L.push('THỜI ĐIỂM: ' + result.conclusion.timing);
    if (result.conclusion.direction) L.push('HƯỚNG: ' + result.conclusion.direction.nameVi + ' (' + result.conclusion.direction.direction + ')');
    L.push('');
    L.push('--- LIMITATIONS ---');
    (result.provenance.limitations || []).forEach(function (lim) { L.push('  - ' + lim); });
    return { text: L.join(NL), lines: L };
}

module.exports = { explainInterpretation };
