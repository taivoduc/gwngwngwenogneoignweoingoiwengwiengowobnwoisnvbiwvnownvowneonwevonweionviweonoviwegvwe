'use strict';
/**
 * lib/score.js — ĐIỂM HEURISTIC HIỂN THỊ (displayHeuristicScore).
 *
 * ⚠️ KHÔNG phải xác suất / không dùng làm kết luận chính (xem docs/).
 * Chỉ dùng để tô màu trực quan + hiển thị điểm.
 *
 * CÔNG THỨC (theo yêu cầu — Môn 20% + Tinh 20% + Thần 20% + 9 chủ đề 40%):
 *
 * 1. Mỗi CHỦ ĐỀ trong lưới 9 ô có điểm −2..+2 từ verdict dimension
 *    (Thuận rõ +2 · Thuận vừa/nhẹ +1 · Trung tính/Trái chiều 0 ·
 *    Không thuận vừa/nhẹ −1 · Không thuận rõ −2) — xem topicScoreFromVerdict.
 *    Σ 9 ô ∈ [−18..+18] → quy về điểm chủ đề −9..+9 (chia 2).
 *
 * 2. Môn / Tinh / Thần TẠI CUNG HƯỚNG: +1 / 0 / −1 theo phân loại lành/dữ
 *    INTRINSIC trong knowledge/doors|stars|deities.js (MỘT nguồn dữ liệu,
 *    không hardcode danh sách tên ở đây):
 *        AUSPICIOUS → +1   NEUTRAL → 0   OMINOUS → −1
 *
 * 3. Điểm HƯỚNG (−9..+9) = round( 20%×Môn + 20%×Tinh + 20%×Thần + 40%×chủ đề ).
 *    Mỗi phần quy về CÙNG thang −9..+9, làm tròn 1 lần cuối:
 *        part_Môn   = 9 × điểm Môn (∈ {−9, 0, +9})   — trọng 20%
 *        part_Tinh  = 9 × điểm Tinh (∈ {−9, 0, +9})   — trọng 20%
 *        part_Thần  = 9 × điểm Thần (∈ {−9, 0, +9})   — trọng 20%
 *        part_chủ đề = Σ điểm 9 ô ÷ 2  (∈ [−9..+9])   — trọng 40%
 *        score = clamp(round(0.20 × (part_Môn + part_Tinh + part_Thần) + 0.40 × part_chủ đề), −9, +9)
 *    → Môn+Tinh+Thần góp tối đa 5.4, chủ đề góp tối đa 3.6, tổng nằm gọn trong −9..+9.
 *    Thời gian đi vào qua lá số (chart của giờ đang chọn) — không có thành phần giờ riêng.
 *
 * 4. Điểm GIỜ (−9..+9) = TỔNG ĐIỂM TỐT − TỔNG ĐIỂM XẤU của TẤT CẢ hướng
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
// Phân loại lành/dữ INTRINSIC — khớp nature/classicalNature trong knowledge/*.js
const NATURE_SIGN = { AUSPICIOUS: 1, NEUTRAL: 0, OMINOUS: -1 };

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
 * Điểm 9 chủ đề (−2..+2 mỗi chủ đề) tại một hướng — CHẠY PER-TYPE
 * (9 lần chạy rule engine, mỗi lần với đúng loại câu hỏi của ô) để điểm
 * khớp CHÍNH XÁC với luận giải 9 ô hiển thị.
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
 * Điểm Môn/Tinh/Thần +1/0/−1 tại một cung, theo nature intrinsic
 * (AUSPICIOUS=+1, NEUTRAL=0, OMINOUS=−1). Trung cung / thiếu thành phần → 0.
 * @param {object} norm normalized chart
 */
function componentScoresFromNorm(norm, focusPalace) {
  const cell = norm.palaces[focusPalace];
  if (!cell || !cell.door) return { mon: 0, tinh: 0, than: 0 };
  return {
    mon: NATURE_SIGN[cell.door.nature] || 0,
    tinh: cell.star ? (NATURE_SIGN[cell.star.nature] || 0) : 0,
    than: cell.deity ? (NATURE_SIGN[cell.deity.nature] || 0) : 0
  };
}

function componentScores(chart, focusPalace) {
  return componentScoresFromNorm(normalizeChart(chart), focusPalace);
}

/**
 * Điểm HƯỚNG (−9..+9):
 *   round( 20%×Môn + 20%×Tinh + 20%×Thần + 40%×(Σ 9 chủ đề ÷ 2) )
 * với mỗi phần quy về cùng thang −9..+9 trước khi nhân trọng số (Môn/Tinh/Thần
 * 0.20, chủ đề 0.40 — luận giải 9 ô giữ vai trò lớn hơn).
 * Phản ánh đúng nội dung luận giải của hướng đó trong thời gian đã chọn.
 */
function directionScoreFromNorm(norm, focusPalace, options) {
  const ts = topicScoresFromNorm(norm, focusPalace, options);
  const cs = componentScoresFromNorm(norm, focusPalace);
  const topics9 = ts.sum / 2;                       // −9..+9
  // Môn 20% + Tinh 20% + Thần 20% + 9 chủ đề 40% (mỗi phần quy cùng thang −9..+9)
  const raw = 0.2 * (9 * cs.mon + 9 * cs.tinh + 9 * cs.than) + 0.4 * topics9;
  const score = clamp(Math.round(raw), -9, 9);
  return {
    score: score,
    sum: ts.sum,                                   // Σ điểm 9 ô (−18..+18, giữ để đối chiếu)
    topicScores: ts.scores,                        // 9 ô chi tiết
    components: cs,                                // { mon, tinh, than } ∈ {−1,0,1}
    topics9: Math.round(topics9 * 10) / 10         // phần chủ đề −9..+9
  };
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
  directionScore, scoreHour, topicScores, componentScores,
  topicScoreFromVerdict, TOPIC_CELLS, PALACES_OUTER
};
