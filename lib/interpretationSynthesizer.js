'use strict';
/**
 * lib/interpretationSynthesizer.js — Tổng hợp findings → kết luận.
 *
 * Input : { norm, questionType, yongShen, findings }
 * Output: kết luận theo DIMENSION (một cung có thể thuận cho việc này,
 *         không thuận cho việc khác) + yếu tố tổng hợp.
 *
 * KHÔNG tạo kết luận tuyệt đối ("100%", "xác suất 80%", "đảm bảo").
 */

const STRENGTH_W = { STRONG: 2, MODERATE: 1.5, WEAK: 1 };
const PRIORITY_W = { 100: 3, 80: 3, 60: 2, 40: 1.5, 20: 1 };
const POLARITY_SIGN = { FAVORABLE: 1, UNFAVORABLE: -1, NEUTRAL: 0, MIXED: 0 };

const DIM_LABEL = {
    career: 'Sự nghiệp', wealth: 'Tài lộc', relationship: 'Quan hệ', health: 'Sức khỏe',
    travel: 'Đi lại', litigation: 'Kiện tụng', safety: 'An toàn', study: 'Học hành',
    children: 'Con cái', reputation: 'Danh tiếng', ending: 'Kết thúc', spiritual: 'Tâm linh',
    lost: 'Tìm kiếm', general: 'Tổng quát'
};

function timingFromPatterns(patterns) {
    const ids = patterns.map(function (p) { return p.id; });
    if (ids.indexOf('FU_YIN') >= 0) return 'Diễn tiến có xu hướng CHẬM, trì trệ — cần kiên nhẫn (Phục Ngâm).';
    if (ids.indexOf('FAN_YIN') >= 0) return 'Diễn tiến có xu hướng BIẾN ĐỘNG nhanh, khó giữ ổn định (Phản Ngâm).';
    if (ids.indexOf('KONG_WANG') >= 0) return 'Thời điểm hiện tại chưa chín muồi — nên chờ qua Tuần Không hoặc đổi giờ.';
    if (ids.indexOf('YI_MA') >= 0) return 'Có tín hiệu diễn ra nhanh, gắn với di chuyển/thay đổi (Mã tinh).';
    return 'Không có tín hiệu thời gian đặc biệt.';
}

function verdictText(dim, direction, intensity) {
    const label = DIM_LABEL[dim] || dim;
    const strong = intensity === 'STRONG';
    switch (direction) {
        case 'FAVORABLE': return strong
            ? 'Tín hiệu khá thuận cho ' + label + ' — các yếu tố hỗ trợ chiếm ưu thế rõ.'
            : 'Có tín hiệu thuận cho ' + label + ', nhưng mức độ vừa phải.';
        case 'UNFAVORABLE': return strong
            ? 'Tín hiệu bất lợi rõ cho ' + label + ' — nên thận trọng, trì hoãn quyết định lớn.'
            : 'Có tín hiệu không thuận cho ' + label + '.';
        case 'MIXED': return 'Tín hiệu TRÁI CHIỀU cho ' + label + ' — cân nhắc kỹ trước khi quyết định.';
        default: return 'Chưa đủ cơ sở rõ ràng để kết luận cho ' + label + '.';
    }
}

const ALL_DIMS = ['career', 'wealth', 'relationship', 'health', 'study', 'travel', 'litigation', 'safety', 'children', 'reputation', 'ending', 'spiritual', 'general'];

/**
 * Verdict (−∞..+∞ trọng số, direction, intensity, fav/unfav count) cho TẤT CẢ
 * dimension — DÙNG CHUNG cho synthesizer và scoring (đảm bảo điểm hướng/chủ đề
 * khớp CHÍNH XÁC với luận giải hiển thị). Cùng STRENGTH_W/PRIORITY_W.
 */
function dimensionVerdicts(findings) {
    const out = {};
    ALL_DIMS.forEach(function (dim) {
        let score = 0, fav = 0, unfav = 0;
        findings.forEach(function (f) {
            const rel = f.dimensions === null || (Array.isArray(f.dimensions) && f.dimensions.indexOf(dim) >= 0);
            if (!rel) return;
            const w = (STRENGTH_W[f.strength] || 1) * (PRIORITY_W[f.priority] || 1);
            score += (POLARITY_SIGN[f.polarity] || 0) * w;
            if (f.polarity === 'FAVORABLE') fav++;
            if (f.polarity === 'UNFAVORABLE') unfav++;
        });
        let direction = 'NEUTRAL';
        if (score >= 1) direction = 'FAVORABLE';
        else if (score <= -1) direction = 'UNFAVORABLE';
        else if (fav > 0 && unfav > 0) direction = 'MIXED';
        let intensity = 'WEAK';
        const abs = Math.abs(score);
        if (abs >= 8) intensity = 'STRONG';
        else if (abs >= 3) intensity = 'MODERATE';
        out[dim] = {
            score: Math.round(score * 10) / 10,
            direction: direction, intensity: intensity,
            favorableCount: fav, unfavorableCount: unfav
        };
    });
    return out;
}

/**
 * Tổng hợp findings theo dimension.
 * @returns {{ summary, dimensions, favorableFactors, unfavorableFactors, risks, opportunities, timing, direction, evidence }}
 */
function synthesize(norm, questionType, yongShen, findings, options) {
    const dims = (questionType.dimensions && questionType.dimensions.length) ? questionType.dimensions : ['general'];
    const patterns = (options && options.patterns) || [];

    const dimensions = dims.map(function (dim) {
        const relevant = findings.filter(function (f) {
            return f.dimensions === null || (Array.isArray(f.dimensions) && f.dimensions.indexOf(dim) >= 0);
        });
        let score = 0, fav = 0, unfav = 0;
        const evidence = [];
        relevant.forEach(function (f) {
            const w = (STRENGTH_W[f.strength] || 1) * (PRIORITY_W[f.priority] || 1);
            score += (POLARITY_SIGN[f.polarity] || 0) * w;
            if (f.polarity === 'FAVORABLE') fav++;
            if (f.polarity === 'UNFAVORABLE') unfav++;
            (f.evidence || []).forEach(function (e) { evidence.push('[' + f.ruleId + '] ' + e); });
        });
        let direction = 'NEUTRAL';
        if (score >= 1) direction = 'FAVORABLE';
        else if (score <= -1) direction = 'UNFAVORABLE';
        else if (fav > 0 && unfav > 0) direction = 'MIXED';
        let intensity = 'WEAK';
        const abs = Math.abs(score);
        if (abs >= 8) intensity = 'STRONG';
        else if (abs >= 3) intensity = 'MODERATE';
        return {
            dimension: dim, label: DIM_LABEL[dim] || dim,
            direction: direction, intensity: intensity, score: Math.round(score * 10) / 10,
            favorableCount: fav, unfavorableCount: unfav, evidence: evidence
        };
    });

    const favorableFactors = [];
    const unfavorableFactors = [];
    const risks = [];
    findings.forEach(function (f) {
        if (f.polarity === 'FAVORABLE') {
            favorableFactors.push({ ruleId: f.ruleId, name: f.name, subject: f.subject, explanation: f.explanation, source: f.source });
        } else if (f.polarity === 'UNFAVORABLE') {
            unfavorableFactors.push({ ruleId: f.ruleId, name: f.name, subject: f.subject, explanation: f.explanation, source: f.source });
            if (f.priority >= 60 || f.strength === 'STRONG') {
                risks.push({ ruleId: f.ruleId, name: f.name, subject: f.subject, explanation: f.explanation });
            }
        }
    });

    // Cơ hội: yếu tố thuận + Dụng thần được sinh + Mã tinh
    const opportunities = [];
    yongShen.primary.forEach(function (ys) {
        if (ys.palace && ys.element && norm.palaces[ys.palace]) {
            opportunities.push('Dụng thần ' + ys.label + ' đóng tại ' + norm.palaces[ys.palace].palace.nameVi + ' (' + norm.palaces[ys.palace].palace.direction + ')');
        }
    });
    const yiMa = patterns.filter(function (p) { return p.id === 'YI_MA'; });
    if (yiMa.length) opportunities.push('Cung Mã tinh đang kích hoạt — thời điểm tốt cho việc động, di chuyển.');

    const summary = dimensions.map(function (d) {
        return verdictText(d.dimension, d.direction, d.intensity);
    }).join(' ');

    // Hướng có lợi (nếu Dụng thần chính định vị được cung)
    let direction = null;
    const ysPrimary = yongShen.primary.filter(function (y) { return y.palace !== null && y.palace !== undefined; });
    if (ysPrimary.length && norm.palaces[ysPrimary[0].palace]) {
        const pn = norm.palaces[ysPrimary[0].palace].palace;
        direction = { palace: pn.palace, nameVi: pn.nameVi, direction: pn.direction };
    }

    return {
        summary: summary,
        dimensions: dimensions,
        favorableFactors: favorableFactors,
        unfavorableFactors: unfavorableFactors,
        risks: risks,
        opportunities: opportunities,
        timing: timingFromPatterns(patterns),
        direction: direction,
        evidence: dimensions.reduce(function (acc, d) { return acc.concat(d.evidence); }, [])
    };
}

module.exports = { synthesize, dimensionVerdicts, verdictText, DIM_LABEL };
