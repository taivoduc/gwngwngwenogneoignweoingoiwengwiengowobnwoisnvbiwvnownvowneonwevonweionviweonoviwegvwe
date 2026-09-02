'use strict';
/**
 * lib/score.js — ĐIỂM HEURISTIC HIỂN THỊ (displayHeuristicScore).
 *
 * ⚠️ KHÔNG phải xác suất / không dùng làm kết luận chính (xem docs/).
 * Chỉ dùng để tô màu trực quan + hiển thị điểm.
 *
 * CÔNG THỨC (theo yêu cầu user — CHỈ DỰA VÀO 16 CHỦ ĐỀ, không trọng số Môn/Tinh/Thần):
 *
 * 1. Mỗi CHỦ ĐỀ trong lưới 16 ô có điểm −2..+2 từ verdict dimension
 *    (Thuận rõ +2 · Thuận vừa/nhẹ +1 · Trung tính/Trái chiều 0 ·
 *    Không thuận vừa/nhẹ −1 · Không thuận rõ −2) — xem topicScoreFromVerdict.
 *
 * 2. Điểm HƯỚNG (−9..+9) = Σ điểm 16 chủ đề (∈ [−32..+32]) quy về thang −9..+9:
 *        score = clamp(round(Σ × 9 ÷ 32), −9, +9)
 *    Môn/Tinh/Thần tại cung hướng KHÔNG cộng trực tiếp vào điểm (chúng chỉ tác
 *    động gián tiếp qua verdict của từng chủ đề — engine per-type). Thời gian đi
 *    vào qua lá số (chart của giờ đang chọn) — không có thành phần giờ riêng.
 *
 * 3. Điểm GIỜ (−9..+9) = TỔNG ĐIỂM TỐT − TỔNG ĐIỂM XẤU của TẤT CẢ hướng
 *    trong canh giờ đó (KHÔNG phụ thuộc hướng nào được chọn):
 *        hourScore = Σ max(0, dir_i) − Σ max(0, −dir_i)   (8 hướng ngoài Trung cung)
 *    Mỗi canh giờ dựng lá số riêng → điểm giờ đổi theo giờ.
 */
const { resolveQuestionType } = require('./interpret.js');
const { normalizeChart } = require('./chartNormalizer.js');
const { resolveYongShen } = require('./yongShenResolver.js');
const { runRuleEngine } = require('./ruleEngine.js');
const { dimensionVerdicts } = require('./interpretationSynthesizer.js');

const PALACES_OUTER = [1, 2, 3, 4, 6, 7, 8, 9];

// 16 chủ đề lớn (khớp UI 4×4): type → dimension chính của type đó.
const TOPIC_CELLS = [
  { type: 'CAREER', dim: 'career', label: 'Sự nghiệp' },
  { type: 'WEALTH', dim: 'wealth', label: 'Tài lộc' },
  { type: 'BUSINESS', dim: 'wealth', label: 'Kinh doanh' },
  { type: 'REAL_ESTATE', dim: 'wealth', label: 'Nhà đất' },
  { type: 'PARTNERSHIP', dim: 'relationship', label: 'Hợp tác' },
  { type: 'MARRIAGE', dim: 'relationship', label: 'Hôn nhân' },
  { type: 'CHILDREN', dim: 'children', label: 'Con cái' },
  { type: 'HEALTH', dim: 'health', label: 'Sức khỏe' },
  { type: 'STUDY', dim: 'study', label: 'Học hành' },
  { type: 'REPUTATION', dim: 'reputation', label: 'Danh tiếng' },
  { type: 'TRAVEL', dim: 'travel', label: 'Đi lại' },
  { type: 'LITIGATION', dim: 'litigation', label: 'Kiện tụng' },
  { type: 'SAFETY', dim: 'safety', label: 'An toàn' },
  { type: 'LOST_OBJECT', dim: 'general', label: 'Tìm kiếm' },
  { type: 'ENDING', dim: 'ending', label: 'Kết thúc' },
  { type: 'SPIRITUAL', dim: 'spiritual', label: 'Tâm linh' }
];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/** Điểm chủ đề −2..+2 từ verdict (direction + intensity). */
function topicScoreFromVerdict(direction, intensity) {
  if (direction === 'FAVORABLE') return intensity === 'STRONG' ? 2 : 1;
  if (direction === 'UNFAVORABLE') return intensity === 'STRONG' ? -2 : -1;
  return 0;
}

/**
 * Điểm 16 chủ đề (−2..+2 mỗi chủ đề) tại một hướng — CHẠY PER-TYPE
 * (16 lần chạy rule engine, mỗi lần với đúng loại câu hỏi của ô) để điểm
 * khớp CHÍNH XÁC với luận giải 16 ô hiển thị.
 * @param {object} norm normalized chart (đã normalize 1 lần)
 */
function topicScoresFromNorm(norm, focusPalace, options) {
  const opts = options || {};
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

function topicScores(chart, focusPalace, options) {
  return topicScoresFromNorm(normalizeChart(chart), focusPalace, options);
}

/**
 * Điểm HƯỚNG (−9..+9) — CHỈ DỰA VÀO 16 CHỦ ĐỀ (không trọng số Môn/Tinh/Thần):
 *   score = clamp(round(Σ điểm 16 ô × 9 ÷ 32), −9, +9)
 * Σ ∈ [−32..+32] → [−9..+9]. Phản ánh đúng nội dung luận giải 16 ô của hướng đó
 * trong thời gian (lá số) đã chọn.
 */
function directionScoreFromNorm(norm, focusPalace, options) {
  const ts = topicScoresFromNorm(norm, focusPalace, options);
  const score = clamp(Math.round(ts.sum * 9 / 32), -9, 9);
  return { score: score, sum: ts.sum, topicScores: ts.scores };
}

function directionScore(chart, focusPalace, options) {
  return directionScoreFromNorm(normalizeChart(chart), focusPalace, options);
}

/**
 * Điểm GIỜ (−9..+9) = TỔNG ĐIỂM TỐT − TỔNG ĐIỂM XẤU của TẤT CẢ 8 hướng
 * trong canh giờ đó (không phụ thuộc hướng được chọn).
 */
function scoreHour(chart, options) {
  const norm = normalizeChart(chart);
  let goodSum = 0, badSum = 0, total = 0;
  const perDirection = {};
  PALACES_OUTER.forEach(function (p) {
    const s = directionScoreFromNorm(norm, p, options).score;
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

module.exports = {
  directionScore, scoreHour, topicScores,
  topicScoreFromVerdict, TOPIC_CELLS, PALACES_OUTER
};
