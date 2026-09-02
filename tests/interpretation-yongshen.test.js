// tests/interpretation-yongshen.test.js — 用神 Resolver + nhận diện câu hỏi.
// Chạy: node tests/interpretation-yongshen.test.js
'use strict';
const iq = require('../index.js');
const { goldenChart } = require('./_helpers.js');

let passed = 0, failed = 0;
function check(name, cond, extra) {
    if (cond) { passed++; console.log('  PASS  ' + name); }
    else { failed++; console.log('  FAIL  ' + name + (extra !== undefined ? ' -> ' + JSON.stringify(extra).slice(0, 200) : '')); }
}

const chart = goldenChart(); // 17/3/2021 03:00 — ngày Giáp Tý (dayGanIdx=0), giờ Bính Dần
const norm = iq.normalizeChart(chart);

// --- mọi loại câu hỏi resolve được ---
iq.QUESTION_TYPES.forEach(q => {
    const ys = iq.resolveYongShen(norm, q, {});
    check('yongshen ' + q.id + ': primary đủ', Array.isArray(ys.primary) && ys.primary.length > 0);
    check('yongshen ' + q.id + ': rulesUsed đủ', Array.isArray(ys.rulesUsed) && ys.rulesUsed.length > 0);
    ys.all.forEach(y => check('yongshen ' + q.id + ': label "' + y.label + '"', typeof y.label === 'string' && y.label.length > 0));
});

// --- CAREER: Khai Môn phải định vị được trên chart này (cung 8) ---
const ysCareer = iq.resolveYongShen(norm, iq.knowledge.questionTypes.BY_ID.CAREER, {});
const kai = ysCareer.primary.find(y => y.kind === 'DOOR' && y.id === 'KHAI');
check('CAREER: Khai Môn định vị tại cung 8', kai && kai.palace === 8, kai);

// --- Nhật can Giáp ẩn (ngày Giáp Tý) → palace null + ghi chú, KHÔNG silent fallback ---
const dayStem = ysCareer.primary.find(y => y.kind === 'STEM' && y.role === 'dayStem');
check('CAREER: Nhật can Giáp ẩn (palace null, có note)', dayStem && dayStem.palace === null && !!dayStem.note, dayStem);

// --- 值符 (Trực Phù) theo chart: trucPhu.cung ---
const zf = ysCareer.secondary.find(y => y.role === 'zhiFu');
check('CAREER: Trực Phù theo chart.info.trucPhu', zf && zf.palace === chart.info.trucPhu.cung, zf);

// --- nhận diện loại câu hỏi từ văn bản ---
const cases = [
    ['Tôi có nên đổi việc?', 'CAREER'],
    ['Năm nay làm ăn ra sao?', 'WEALTH'],
    ['Có nên đầu tư chứng khoán?', 'INVESTMENT'],
    ['Có nên mở cửa hàng kinh doanh?', 'BUSINESS'],
    ['Kết hôn năm nay được không?', 'MARRIAGE'],
    ['Chuyện tình cảm của tôi thế nào?', 'LOVE'],
    ['Sức khỏe tôi có vấn đề gì không?', 'HEALTH'],
    ['Vụ kiện này tôi thắng không?', 'LITIGATION'],
    ['Xuất hành hướng nào tốt?', 'TRAVEL'],
    ['Tôi tìm chiếc nhẫn bị mất', 'LOST_OBJECT'],
    ['Đi ra đường có an toàn không?', 'SAFETY'],
    ['Con tôi học hành thế nào?', 'STUDY'],
    ['Kỳ thi này có đỗ không?', 'EXAM'],
    ['Tuần sau phỏng vấn xin việc', 'JOB_INTERVIEW'],
    ['Hợp tác với đối tác này?', 'PARTNERSHIP'],
    ['Mua mảnh đất này được không?', 'REAL_ESTATE'],
    ['Dự án này có thành không?', 'PROJECT'],
    ['Cuộc thi tới tôi có cửa không?', 'COMPETITION'],
    ['Hôm nay ngày tốt xấu thế nào?', 'GENERAL']
];
cases.forEach(([text, expected]) => {
    const t = iq.detectQuestionType(text);
    check('detect "' + text.slice(0, 30) + '" → ' + expected, t === expected, t);
});

// --- questionTypeOverride ---
const res = iq.interpretQimen(chart, { text: 'chuyện gì đó' }, { questionTypeOverride: 'HEALTH' });
check('questionTypeOverride hoạt động', res.questionType === 'HEALTH');

// --- GENERAL fallback ---
const res2 = iq.interpretQimen(chart, 'nonsense text không khớp gì cả', {});
check('fallback GENERAL', res2.questionType === 'GENERAL');

// --- 用神 trong kết quả interpretQimen ---
check('interpretQimen.yongShen.rationale mảng', Array.isArray(res.yongShen.rationale) && res.yongShen.rationale.length > 0);

console.log('\nKết quả: ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed > 0 ? 1 : 0);
