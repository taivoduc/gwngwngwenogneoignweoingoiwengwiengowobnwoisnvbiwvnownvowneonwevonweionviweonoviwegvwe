'use strict';
/**
 * lib/ruleEngine.js — Rule Engine.
 *
 * Chạy toàn bộ RULES trên (normalized chart, question type, yongShen).
 * Output: findings[] — MỖI finding truy ngược được: finding → rule → knowledge node.
 * Rule KHÔNG sửa chart. Rule KHÔNG sinh kết luận.
 */
const { RULES } = require('../knowledge/rules.js');
const { detectPatterns } = require('../knowledge/patterns.js');
const stems = require('../knowledge/stems.js');

function computeEmptyPalaces(norm) {
    const out = [];
    const xun = norm.time.hourXun;
    if (!xun) return out;
    xun.emptyBranches.forEach(function (b) {
        const p = stems.BRANCH_PALACE[b];
        if (p && out.indexOf(p) < 0) out.push(p);
    });
    return out;
}

/**
 * @param {object} norm normalized chart
 * @param {object} questionType question ontology node
 * @param {object} yongShen resolved yongshen
 * @param {object} options { horseSource }
 * @returns {Array<object>} findings
 */
function runRuleEngine(norm, questionType, yongShen, options) {
    const opts = options || {};
    const patterns = detectPatterns(norm, opts);
    const emptyPalaces = computeEmptyPalaces(norm);
    const ctx = { norm: norm, questionType: questionType, yongShen: yongShen, patterns: patterns, emptyPalaces: emptyPalaces, options: opts };
    const findings = [];
    RULES.forEach(function (rule) {
        let out;
        try {
            out = rule.apply(ctx);
        } catch (e) {
            throw new Error('Rule "' + rule.id + '" lỗi khi chạy: ' + e.message);
        }
        if (!Array.isArray(out)) throw new Error('Rule "' + rule.id + '" phải trả mảng findings.');
        findings.push.apply(findings, out);
    });
    return findings;
}

module.exports = { runRuleEngine, computeEmptyPalaces };
