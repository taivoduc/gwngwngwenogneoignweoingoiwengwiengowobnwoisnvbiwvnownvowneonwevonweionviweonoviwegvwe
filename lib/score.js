'use strict';
/**
 * lib/score.js — ĐIỂM HEURISTIC HIỂN THỊ (displayHeuristicScore).
 *
 * ⚠️ KHÔNG phải xác suất / không dùng làm kết luận chính (xem docs/).
 * Chỉ dùng để tô màu trực quan + hiển thị điểm.
 *
 * CÔNG THỨC (theo yêu cầu — phi tuyến, không vòng lặp):
 *
 * 1. Mỗi CHỦ ĐỀ trong lưới 9 ô có điểm −2..+2:
 *       Thuận (rõ)            → +2
 *       Thuận (vừa / nhẹ)     → +1
 *       Trái chiều / Trung tính → 0
 *       Không thuận (vừa/nhẹ) → −1
 *       Không thuận (rõ)      → −2
 *    Điểm chủ đề lấy từ verdict của dimension tương ứng trong luận giải
 *    (tổng trọng số findings: Môn/Tinh/Thần tốt, ngũ hành, hướng vs Dụng thần,
 *     pattern 格局, chủ đề).
 *
 * 2. Điểm HƯỚNG (−9..+9) = tổng điểm 9 chủ đề ÷ 2 (làm tròn):
 *       directionScore = round( Σ topicScores / 2 )
 *    Σ ∈ [−18..+18] → điểm ∈ [−9..+9]. Phản ánh đúng những gì luận giải
 *    bàn luận tại hướng đó, trong thời gian (lá số) đã chọn.
 *
 * 3. Điểm GIỜ (−9..+9) = TỔNG ĐIỂM TỐT − TỔNG ĐIỂM XẤU của TẤT CẢ hướng
 *    trong canh giờ đó (KHÔNG phụ thuộc hướng nào được chọn):
 *       hourScore = Σ max(0, dir_i) − Σ max(0, −dir_i)   (8 hướng ngoài)
 *    Mỗi canh giờ dựng lá số riêng → điểm giờ đổi theo giờ.
 *
 * Màu (scoreToColor trong kymon.html): điểm càng cao → xanh lá càng đậm,
 * càng thấp → đỏ càng đậm. Ô chủ đề tô theo ĐIỂM CHỦ ĐỀ riêng của nó.
 */
const { resolveQuestionType } = require('./interpret.js');
const { normalizeChart } = require('./chartNormalizer.js');
const { resolveYongShen } = require('./yongShenResolver.js');
const { runRuleEngine } = require('./ruleEngine.js');
const { dimensionVerdicts } = require('./interpretationSynthesizer.js');

const PALACES_OUTER = [1, 2, 3, 4, 6, 7, 8, 9];
const STRENGTH_W = { STRONG: 2, MODERATE: 1.5, WEAK: 1 };
const PRIORITY_W = { 80: 3, 60: 2, 40: 1.2, 20: 1 };
const SIGN = { FAVORABLE: 1, UNFAVORABLE: -1, NEUTRAL: 0, MIXED: 0 };

// 9 chủ đề lớn (khớp UI): type → dimension chính
const TOPIC_CELLS = [
  { type: 'CAREER', dim: 'career', label: 'Sự nghiệp' },
  { type: 'WEALTH', dim: 'wealth', label: 'Tài lộc' },
  { type: 'BUSINESS', dim: 'wealth', label: 'Kinh doanh' },
  { type: 'MARRIAGE', dim: 'relationship', label: 'Tình cảm' },
  { type: 'HEALTH', dim: 'health', label: 'Sức khỏe' },
  { type: 'STUDY', dim: 'study', label: 'Học hành' },
  { type: 'TRAVEL', dim: 'travel', label: 'Đi lại' },
  { type: 'LITIGATION', dim: 'litigation', label: 'Kiện tụng' },
  { type: 'SAFETY', dim: 'safety', label: 'An toàn' }
];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** Điểm chủ đề −2..+2 từ verdict (direction + intensity). */
function topicScoreFromVerdict(direction, intensity) {
  if (direction === 'FAVORABLE') return intensity === 'STRONG' ? 2 : 1;
  if (direction === 'UNFAVORABLE') return intensity === 'STRONG' ? -2 : -1;
  return 0;
}

/**
 * Điểm 9 chủ đề (−2..+2 mỗi chủ đề) tại một hướng.
 * CHẠY PER-TYPE (9 lần chạy rule engine, mỗi lần với đúng loại câu hỏi của ô)
 * để điểm hướng KHỚP CHÍNH XÁC với điểm 9 ô hiển thị trong luận giải.
 * Normalize chart 1 lần; mỗi ô: resolve 用神 + runRuleEngine + dimensionVerdicts.
 */
function topicScores(chart, focusPalace, options) {
  const opts = options || {};
  const norm = normalizeChart(chart);
  const runOpts = Object.assign({}, opts, { focusPalace: focusPalace });
  const scores = [];
  const byType = {};
  let sum = 0;
  TOPIC_CELLS.forEach(function (t) {
    const qtype = resolveQuestionType({ type: t.type, text: '' }, {});
    const ys = resolveYongShen(norm, qtype, runOpts);
    const findings = runRuleEngine(norm, qtype, ys, runOpts);
    const verdicts = dimensionVerdicts(findings);
    const v = verdicts[t.dim] || { direction: 'NEUTRAL', intensity: 'WEAK' };
    const s = topicScoreFromVerdict(v.direction, v.intensity);
    scores.push({ type: t.type, dim: t.dim, score: s, verdict: v });
    byType[t.type] = s;
    sum += s;
  });
  return { scores: scores, byType: byType, sum: sum };
}

/**
 * Điểm HƯỚNG (−9..+9) = round(Σ điểm 9 chủ đề ÷ 2).
 * Phản ánh đúng nội dung luận giải của hướng đó trong thời gian đã chọn.
 */
function directionScore(chart, focusPalace, options) {
  const ts = topicScores(chart, focusPalace, options);
  const score = clamp(Math.round(ts.sum / 2), -9, 9);
  return { score: score, sum: ts.sum, topicScores: ts.scores };
}

/**
 * Điểm GIỜ (−9..+9) = TỔNG ĐIỂM TỐT − TỔNG ĐIỂM XẤU của TẤT CẢ 8 hướng
 * trong canh giờ đó (không phụ thuộc hướng được chọn).
 */
function scoreHour(chart, options) {
  let goodSum = 0, badSum = 0, total = 0;
  const perDirection = {};
  PALACES_OUTER.forEach(function (p) {
    const s = directionScore(chart, p, options).score;
    perDirection[p] = s;
    if (s > 0) goodSum += s;
    else if (s < 0) badSum += -s;
    total += s;
  });
  return {
    score: clamp(Math.round(goodSum - badSum), -9, 9),
    goodSum: goodSum, badSum: badSum, total: total, perDirection: perDirection
  };
}

module.exports = { directionScore, scoreHour, topicScores, topicScoreFromVerdict, TOPIC_CELLS, PALACES_OUTER };
