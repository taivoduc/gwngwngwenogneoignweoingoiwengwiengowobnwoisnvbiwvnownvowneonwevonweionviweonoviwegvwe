'use strict';
/**
 * knowledge/patterns.js — Các mẫu đặc biệt (格局/đặc điểm) của bàn Kỳ Môn.
 *
 * Nguyên tắc (docs/QIMEN_AUDIT_REPORT.md Phần F):
 *   "Chỉ bật rule đã xác định nguồn — KHÔNG tự bịa."
 * Pattern nào chưa đủ nguồn → enabled:false (khung để sẵn, KHÔNG chạy).
 */
const fe = require('./five-elements.js');
const stems = require('./stems.js');

// Cặp cung đối xứng vòng Lạc Thư (dùng cho Phản Ngâm).
const OPPOSITE = { 1: 9, 9: 1, 2: 8, 8: 2, 3: 7, 7: 3, 4: 6, 6: 4 };

// 六仪Kích Hình (cổ điển): cặp (can, cung) bị hình.
// 甲子戊→震3; 甲戌己→坤2; 甲申庚→艮8; 甲午辛→离9; 甲辰壬→巽4; 甲寅癸→巽4.
const JI_XING_TABLE = { 'Mậu': 3, 'Kỷ': 2, 'Canh': 8, 'Tân': 9, 'Nhâm': 4, 'Quý': 4 };
const LIU_YI = ['Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

function branchName(chiIdx) { return stems.BRANCHES[chiIdx].name; }

/**
 * Nhận diện toàn bộ pattern của bàn.
 * @param {object} norm normalized chart
 * @param {object} options { horseSource: 'HOUR'|'DAY' }
 * @returns {Array<object>} pattern findings (enabled patterns)
 */
function detectPatterns(norm, options) {
    const opts = options || {};
    const focus = opts.focusPalace || null; // cung đang xét (theo hướng) — null = toàn bàn
    const patterns = [];
    const hourChi = norm.time.hourChiIdx;
    const dayChi = norm.time.dayChiIdx;

    // Bộ lọc: có focus → chỉ xét pattern tại cung focus (trừ Phục Ngâm/Phản Ngâm toàn bàn).
    const inFocus = function (p) { return focus === null || p === focus; };

    // --- Phục Ngâm (Phục Ngâm): Thiên bàn = Địa bàn tại mọi cung ngoài Trung ---
    let fuYin = true;
    for (let p = 1; p <= 9; p++) {
        if (p === 5) continue;
        const cell = norm.palaces[p];
        if (!cell || !cell.heavenStem || !cell.earthStem) { fuYin = false; break; }
        if (cell.heavenStem.name !== cell.earthStem.name) { fuYin = false; break; }
    }
    if (fuYin) {
        patterns.push({
            id: 'FU_YIN', nameVi: 'Phục Ngâm (Phục Ngâm)', category: 'CLASSICAL_PATTERN', level: 2,
            polarity: 'UNFAVORABLE', strength: 'STRONG',
            evidence: ['Thiên bàn trùng Địa bàn tại mọi cung (trừ Trung cung)'],
            explanation: 'Toàn bàn phục ngâm: khí đứng yên, sự việc trì trệ, khó tiến triển; hợp việc tĩnh, không hợp việc động.',
            source: 'Classical pattern Phục Ngâm', sourceType: 'CLASSICAL_TEXT',
            school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: false, enabled: true
        });
    }

    // --- Phản Ngâm (Phản Ngâm): Thiên can tại cung X = Địa can tại cung đối X ---
    let fanYin = true;
    for (const p in OPPOSITE) {
        const cell = norm.palaces[p];
        const opp = norm.palaces[OPPOSITE[p]];
        if (!cell || !opp || !cell.heavenStem || !opp.earthStem) { fanYin = false; break; }
        if (cell.heavenStem.name !== opp.earthStem.name) { fanYin = false; break; }
    }
    if (fanYin) {
        patterns.push({
            id: 'FAN_YIN', nameVi: 'Phản Ngâm (Phản Ngâm)', category: 'CLASSICAL_PATTERN', level: 2,
            polarity: 'UNFAVORABLE', strength: 'STRONG',
            evidence: ['Thiên can mỗi cung trùng Địa can cung đối diện'],
            explanation: 'Toàn bàn phản ngâm: khí xung khắc, biến động mạnh, dễ đảo lộn; việc động thay đổi nhanh, việc tĩnh bất lợi.',
            source: 'Classical pattern Phản Ngâm', sourceType: 'CLASSICAL_TEXT',
            school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: false, enabled: true
        });
    }

    // --- Môn Bách (Môn Bách): Môn khắc cung (từng cung có môn) ---
    for (let p = 1; p <= 9; p++) {
        if (!inFocus(p)) continue;
        const cell = norm.palaces[p];
        if (!cell || !cell.door) continue;
        if (fe.relation(cell.door.element, cell.palace.element) === 'controls') {
            patterns.push({
                id: 'MEN_PO', nameVi: 'Môn Bách (Môn Bách)', category: 'CLASSICAL_PATTERN', level: 2,
                polarity: 'UNFAVORABLE', strength: 'MODERATE',
                subject: cell.door.nameVi, object: 'cung ' + cell.palace.nameVi,
                evidence: [cell.door.nameVi + ' (' + cell.door.element + ') khắc cung ' + cell.palace.nameVi + ' (' + cell.palace.element + ')'],
                explanation: 'Môn khắc cung gọi là Môn Bách: khí của môn bị bách ép, việc thuộc môn này gặp trở lực.',
                source: 'Classical pattern Môn Bách', sourceType: 'CLASSICAL_TEXT',
                school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: false, enabled: true
            });
        }
    }

    // --- Nhập Mộ (Nhập Mộ): can Thiên bàn vào mộ khố tại chính cung nó đứng ---
    for (let p = 1; p <= 9; p++) {
        if (!inFocus(p)) continue;
        const cell = norm.palaces[p];
        if (!cell || !cell.heavenStem) continue;
        const tombBranch = stems.TOMB_BRANCH[cell.heavenStem.element];
        if (tombBranch === undefined) continue;
        if (stems.BRANCH_PALACE[tombBranch] === p) {
            patterns.push({
                id: 'RU_MU', nameVi: 'Nhập Mộ (Nhập Mộ)', category: 'CLASSICAL_PATTERN', level: 2,
                polarity: 'UNFAVORABLE', strength: 'MODERATE',
                subject: 'can ' + cell.heavenStem.name, object: 'cung ' + cell.palace.nameVi,
                evidence: ['Can ' + cell.heavenStem.name + ' (hành ' + cell.heavenStem.element + ') rơi vào cung mộ khố'],
                explanation: 'Can nhập mộ: khí bị chôn vùi, sự việc bị che lấp, trì hoãn; chờ qua vận hoặc đổi giờ mới phát.',
                source: 'Classical pattern Nhập Mộ', sourceType: 'CLASSICAL_TEXT',
                school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: true, enabled: true,
                schoolNote: 'Một số trường phái chỉ tính cho can Dụng thần, không tính mọi can Thiên bàn.'
            });
        }
    }

    // --- Tuần Không (Tuần Không): cung chứa 2 chi tuần không của GIỜ ---
    const xun = norm.time.hourXun;
    const emptyPalaces = [];
    xun.emptyBranches.forEach(function (b) {
        const p = stems.BRANCH_PALACE[b];
        if (p && emptyPalaces.indexOf(p) < 0) emptyPalaces.push(p);
    });
    const emptyNames = xun.emptyBranches.map(branchName).join(', ');
    emptyPalaces.forEach(function (p) {
        if (focus !== null && p !== focus) return;
        patterns.push({
            id: 'KONG_WANG', nameVi: 'Tuần Không (Tuần Không)', category: 'CLASSICAL_PATTERN', level: 2,
            polarity: 'UNFAVORABLE', strength: 'MODERATE',
            subject: 'cung ' + norm.palaces[p].palace.nameVi, object: null,
            evidence: ['Giờ ' + norm.time.hourGanChi + ' thuộc ' + xun.name + ' — không ' + emptyNames],
            explanation: 'Cung tuần không: khí suy yếu, việc liên quan cung này khó thành hoặc chưa có thực chất ở thời điểm hiện tại.',
            source: 'Classical pattern Tuần Không', sourceType: 'CLASSICAL_TEXT',
            school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: true, enabled: true,
            schoolNote: 'Tính theo tuần của GIỜ (theo giờ). Một số trường phái tính theo tuần của NGÀY.'
        });
    });

    // --- Mã tinh (Mã tinh): cung chứa chi Mã (theo giờ hoặc ngày, tùy option) ---
    const horseSource = opts.horseSource || 'HOUR';
    const horseChi = horseSource === 'DAY' ? dayChi : hourChi;
    const horseBranch = stems.horseBranchOf(horseChi);
    if (horseBranch !== null) {
        const hp = stems.BRANCH_PALACE[horseBranch];
        if (focus !== null && hp !== focus) { /* bỏ qua khi không phải cung focus */ }
        else patterns.push({
            id: 'YI_MA', nameVi: 'Mã tinh (Mã tinh)', category: 'CLASSICAL_PATTERN', level: 2,
            polarity: 'NEUTRAL', strength: 'WEAK',
            subject: 'cung ' + norm.palaces[hp].palace.nameVi, object: null,
            evidence: ['Chi ' + (horseSource === 'DAY' ? 'ngày' : 'giờ') + ' là ' + branchName(horseChi) + ' → Mã tại ' + branchName(horseBranch)],
            explanation: 'Cung Mã tinh: chủ sự động, di chuyển, thay đổi — có lợi cho việc động, bất lợi cho việc tĩnh.',
            source: 'Classical pattern Mã tinh', sourceType: 'CLASSICAL_TEXT',
            school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: true, enabled: true,
            schoolNote: 'Một số trường phái dùng Mã theo NGÀY, số khác theo GIỜ (mặc định: giờ).'
        });
    }

    // --- 六仪Kích Hình (can Thiên bàn) ---
    for (let p = 1; p <= 9; p++) {
        if (!inFocus(p)) continue;
        const cell = norm.palaces[p];
        if (!cell || !cell.heavenStem) continue;
        const stemName = cell.heavenStem.name;
        if (LIU_YI.indexOf(stemName) < 0) continue;
        if (JI_XING_TABLE[stemName] === p) {
            patterns.push({
                id: 'JI_XING', nameVi: 'Lục Nghi Kích Hình', category: 'CLASSICAL_PATTERN', level: 2,
                polarity: 'UNFAVORABLE', strength: 'MODERATE',
                subject: 'can ' + stemName, object: 'cung ' + cell.palace.nameVi,
                evidence: ['Can ' + stemName + ' (Lục Nghi) rơi vào cung bị hình theo bảng cổ điển'],
                explanation: 'Lục nghi bị hình: dễ tổn hại, thị phi, hao tổn liên quan đến sự việc của can này.',
                source: 'Classical pattern Lục Nghi Kích Hình', sourceType: 'CLASSICAL_TEXT',
                school: 'ZhuanPan', confidence: 'LOW', schoolDependent: true, enabled: true,
                schoolNote: 'Bảng Kích Hình có nhiều biến thể; mặc định xét can Thiên bàn (một số phái xét Địa bàn).'
            });
        }
    }

    return patterns;
}

// Khung mở rộng — các 格局 chưa đủ nguồn (KHÔNG bật, tránh tự bịa):
//   qingLongFanShou (青龙返首), feiNiaoDieXue (飞鸟跌穴), sanQiDeShi (三奇得使),
//   jiuDun (九遁), tianWangSiZhang (天网四张), ...
const FUTURE_PATTERNS = {
    note: 'Chưa có source/quy tắc đủ rõ để bật. Thêm pattern = thêm hàm detect + gắn enabled:true khi có nguồn.',
    qingLongFanShou: { enabled: false }, feiNiaoDieXue: { enabled: false },
    sanQiDeShi: { enabled: false }, jiuDun: { enabled: false }, tianWangSiZhang: { enabled: false }
};

module.exports = { detectPatterns, OPPOSITE, JI_XING_TABLE, FUTURE_PATTERNS };
