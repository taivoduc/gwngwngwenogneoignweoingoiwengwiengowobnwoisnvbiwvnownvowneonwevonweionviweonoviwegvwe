'use strict';
/**
 * lib/interpret.js — API chính: interpretQimen(chart, question, options).
 *
 * Pipeline:
 *   QimenBoard → ChartNormalizer → KnowledgeGraph lookup
 *   → YongShenResolver → Relation Analyzer → RuleEngine → Findings
 *   → InterpretationSynthesizer → Conclusion → AdviceEngine
 */
const { normalizeChart } = require('./chartNormalizer.js');
const { resolveYongShen } = require('./yongShenResolver.js');
const { runRuleEngine } = require('./ruleEngine.js');
const { relationsForChart } = require('./qimenRelations.js');
const { synthesize } = require('./interpretationSynthesizer.js');
const { buildAdvice } = require('./adviceEngine.js');
const { explainInterpretation } = require('./explain.js');
const qtypes = require('../knowledge/question-types.js');

// --- Nhận diện loại câu hỏi từ văn bản (keyword, tiếng Việt) ---
// Thứ tự ưu tiên: mẫu cụ thể trước (vd 'phỏng vấn' trước 'việc').
const KEYWORD_RULES = [
    [['phỏng vấn', 'xin việc'], 'JOB_INTERVIEW'],
    [['kết hôn', 'cưới', 'hôn nhân', 'lấy vợ', 'lấy chồng'], 'MARRIAGE'],
    [['đầu tư'], 'INVESTMENT'],
    [['kinh doanh', 'buôn bán', 'mở cửa hàng', 'buôn'], 'BUSINESS'],
    [['bất động sản', 'nhà đất', 'mua nhà', 'đất'], 'REAL_ESTATE'],
    [['hợp tác', 'đối tác'], 'PARTNERSHIP'],
    [['kiện', 'tranh chấp', 'tòa án', 'khởi kiện'], 'LITIGATION'],
    [['cạnh tranh', 'thi đua', 'đối thủ', 'cuộc thi', 'cuộc đua'], 'COMPETITION'],
    [['sức khỏe', 'bệnh', 'đau ốm', 'chữa bệnh'], 'HEALTH'],
    [['an toàn', 'nguy hiểm', 'bảo vệ'], 'SAFETY'],
    [['thất lạc', 'tìm đồ', 'mất đồ', 'tìm kiếm', 'mất'], 'LOST_OBJECT'],
    [['du lịch', 'xuất hành', 'đi xa', 'đi lại', 'chuyến đi'], 'TRAVEL'],
    [['thi cử', 'đi thi', 'kỳ thi'], 'EXAM'],
    [['học tập', 'học hành', 'du học'], 'STUDY'],
    [['người yêu', 'yêu đương', 'tình cảm', 'chia tay'], 'LOVE'],
    [['dự án', 'project', 'công việc đang'], 'PROJECT'],
    [['tiền', 'tài lộc', 'tài chính', 'làm ăn', 'cầu tài', 'lộc'], 'WEALTH'],
    [['việc', 'nghề nghiệp', 'sự nghiệp', 'công danh', 'thăng chức', 'đổi việc'], 'CAREER']
];

function detectQuestionType(text) {
    const t = ' ' + String(text || '').toLowerCase() + ' ';
    for (let i = 0; i < KEYWORD_RULES.length; i++) {
        const words = KEYWORD_RULES[i][0];
        for (let j = 0; j < words.length; j++) {
            if (t.indexOf(words[j]) >= 0) return KEYWORD_RULES[i][1];
        }
    }
    return 'GENERAL';
}

function resolveQuestionType(question, options) {
    if (options && options.questionTypeOverride && qtypes.BY_ID[options.questionTypeOverride]) {
        return qtypes.BY_ID[options.questionTypeOverride];
    }
    const raw = typeof question === 'string' ? question : (question && question.text);
    const type = typeof question === 'string' ? null : (question && question.type);
    if (type && qtypes.BY_ID[type]) return qtypes.BY_ID[type];
    return qtypes.BY_ID[detectQuestionType(raw)] || qtypes.BY_ID.GENERAL;
}

function chartIdOf(norm, qtypeId) {
    const base = norm.chartRuleSetHash || 'nohash';
    const date = norm.date ? norm.date.replace(/[^0-9]/g, '').slice(0, 14) : 'nodate';
    return 'QM-' + base + '-' + date + '-' + qtypeId;
}

/**
 * API chính.
 * @param {object} chart QimenBoard (từ anBan)
 * @param {object|string} question { type, text } hoặc chuỗi text
 * @param {object} options { school, horseSource, questionTypeOverride }
 */
function interpretQimen(chart, question, options) {
    const opts = options || {};
    const norm = normalizeChart(chart);
    const questionType = resolveQuestionType(question, opts);
    const yongShen = resolveYongShen(norm, questionType, opts);
    const patterns = require('../knowledge/patterns.js').detectPatterns(norm, opts);
    const findings = runRuleEngine(norm, questionType, yongShen, opts);
    const relations = relationsForChart(norm);
    const conclusion = synthesize(norm, questionType, yongShen, findings, { patterns: patterns });
    const advice = buildAdvice({ norm: norm, questionType: questionType, yongShen: yongShen, findings: findings, conclusion: conclusion });

    const ruleIds = [];
    findings.forEach(function (f) { if (ruleIds.indexOf(f.ruleId) < 0) ruleIds.push(f.ruleId); });
    const sources = [];
    findings.forEach(function (f) {
        const key = f.sourceType + ' :: ' + f.source;
        if (sources.indexOf(key) < 0) sources.push(key);
    });

    const provenance = {
        ruleSetVersion: 'interpretation-1.0.0',
        chartRuleSetVersion: norm.chartRuleSetVersion,
        chartRuleSetHash: norm.chartRuleSetHash,
        school: opts.school || 'CURRENT_PROJECT',
        rulesUsed: ruleIds,
        patternsUsed: patterns.map(function (p) { return p.id; }),
        relationsCount: relations.chart.length,
        sources: sources,
        yongShenSource: yongShen.source,
        limitations: [
            'Interpretation là diễn giải theo rule set, KHÔNG phải xác suất hay tiên tri; chưa có validation thực nghiệm.',
            'Một số rule là school-dependent (xem schoolDependent trong từng finding).',
            'Tầng heuristic (L5) kế thừa dữ liệu CHU_DE cũ của project — chỉ là tham khảo, không phải quy tắc cổ điển.'
        ]
    };

    return {
        chartId: chartIdOf(norm, questionType.id),
        question: typeof question === 'string' ? { type: questionType.id, text: question } : { type: questionType.id, text: (question && question.text) || '' },
        questionType: questionType.id,
        yongShen: yongShen,
        findings: findings,
        relations: relations,
        conclusion: conclusion,
        advice: advice,
        provenance: provenance,
        ruleSetVersion: provenance.ruleSetVersion,
        explain: function () { return explainInterpretation(this); }
    };
}

module.exports = { interpretQimen, resolveQuestionType, detectQuestionType, explainInterpretation };
