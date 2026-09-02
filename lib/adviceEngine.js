'use strict';
/**
 * lib/adviceEngine.js — Advice Engine (tách rời interpretation).
 *
 * Advice có category: SYMBOLIC | PRACTICAL | SAFETY.
 * Health / legal / financial advice luôn có safety framing.
 */
const doors = require('../knowledge/doors.js');

function buildAdvice(input) {
    const advice = [];
    const norm = input.norm, questionType = input.questionType, yongShen = input.yongShen, findings = input.findings, conclusion = input.conclusion;

    // 1. PRACTICAL — từ bản chất Dụng thần là cửa (doors.js advice).
    yongShen.primary.forEach(function (ys) {
        if (ys.kind !== 'DOOR' || !ys.id) return;
        const doorNode = doors.BY_NAME[ys.nameVi];
        if (!doorNode || !doorNode.advice) return;
        advice.push({ category: 'PRACTICAL', text: 'Theo bản chất ' + ys.nameVi + ' Môn: nên ' + doorNode.advice.do.toLowerCase() + '.', source: 'knowledge/doors.js (project data)', sourceType: 'PROJECT_RULE' });
        advice.push({ category: 'PRACTICAL', text: 'Tránh: ' + doorNode.advice.dont.toLowerCase() + '.', source: 'knowledge/doors.js (project data)', sourceType: 'PROJECT_RULE' });
    });

    // 2. PRACTICAL — từ pattern cổ điển.
    const ids = {};
    findings.forEach(function (f) { if (f.ruleId && f.ruleId.indexOf('PATTERNS:') === 0) ids[f.ruleId] = true; });
    if (ids['PATTERNS:FU_YIN']) advice.push({ category: 'PRACTICAL', text: 'Toàn bàn Phục Ngâm — hợp việc tĩnh (ôn tập, củng cố, chờ đợi); hạn chế khởi sự lớn.', source: 'Classical pattern Phục Ngâm', sourceType: 'CLASSICAL_TEXT' });
    if (ids['PATTERNS:FAN_YIN']) advice.push({ category: 'PRACTICAL', text: 'Toàn bàn Phản Ngâm — tránh quyết định lớn khi khí đang xung động; ưu tiên việc linh hoạt, ngắn hạn.', source: 'Classical pattern Phản Ngâm', sourceType: 'CLASSICAL_TEXT' });
    if (ids['PATTERNS:KONG_WANG']) advice.push({ category: 'PRACTICAL', text: 'Có cung Tuần Không — nếu sự việc chưa tiến triển, cân nhắc đổi giờ/ngày hoặc chờ qua tuần không.', source: 'Classical pattern Tuần Không', sourceType: 'CLASSICAL_TEXT' });
    if (ids['PATTERNS:YI_MA']) advice.push({ category: 'PRACTICAL', text: 'Mã tinh kích hoạt — thuận lợi cho việc di chuyển, thay đổi, khởi động; bất lợi cho việc tĩnh tại chỗ.', source: 'Classical pattern Mã tinh', sourceType: 'CLASSICAL_TEXT' });

    // 3. SYMBOLIC — biểu tượng (không phải can thiệp khoa học).
    yongShen.primary.forEach(function (ys) {
        if (ys.palace && norm.palaces[ys.palace]) {
            const pn = norm.palaces[ys.palace].palace;
            advice.push({
                category: 'SYMBOLIC',
                text: 'Biểu tượng Dụng thần ' + ys.label + ' đặt tại ' + pn.nameVi + ' (' + pn.direction + ') — theo biểu tượng học, hướng/cung này gắn với sự việc bạn hỏi.',
                source: 'yongshen resolver (project)', sourceType: 'PROJECT_RULE'
            });
        }
    });

    // 4. SAFETY framing.
    const dims = questionType.dimensions || [];
    if (dims.indexOf('health') >= 0) advice.push({ category: 'SAFETY', text: 'Thông tin sức khỏe chỉ mang tính tham khảo biểu tượng — KHÔNG thay thế tư vấn, khám chữa bệnh của chuyên gia y tế.', source: 'safety policy', sourceType: 'PROJECT_RULE' });
    if (dims.indexOf('wealth') >= 0) advice.push({ category: 'SAFETY', text: 'Thông tin tài chính chỉ mang tính tham khảo — KHÔNG phải lời khuyên đầu tư; quyết định tài chính cần dựa trên phân tích thực tế của bạn.', source: 'safety policy', sourceType: 'PROJECT_RULE' });
    if (dims.indexOf('litigation') >= 0) advice.push({ category: 'SAFETY', text: 'Thông tin kiện tụng chỉ mang tính tham khảo — KHÔNG thay thế tư vấn pháp lý của luật sư.', source: 'safety policy', sourceType: 'PROJECT_RULE' });

    return advice;
}

module.exports = { buildAdvice };
