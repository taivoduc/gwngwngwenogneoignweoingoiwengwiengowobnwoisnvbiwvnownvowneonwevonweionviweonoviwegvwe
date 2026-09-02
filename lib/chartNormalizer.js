'use strict';
/**
 * lib/chartNormalizer.js — Chuẩn hóa QimenBoard (output anBan) thành
 * normalized chart cho Interpretation Pipeline.
 *
 * QUAN TRỌNG: tách bạch
 *   - palace.element      : ngũ hành CỐ HỮU của cung (bất biến)
 *   - door/star/deity.element: ngũ hành CỐ HỮU của biểu tượng (bất biến)
 * Không có "element bị đổi theo cung" — quan hệ mới là thứ được tính sau.
 */
const palaces = require('../knowledge/palaces.js');
const doors = require('../knowledge/doors.js');
const stars = require('../knowledge/stars.js');
const deities = require('../knowledge/deities.js');
const stems = require('../knowledge/stems.js');

const STEM_BY_NAME = {};
stems.STEMS.forEach(function (s) { STEM_BY_NAME[s.name] = s; });
const BRANCH_BY_NAME = {};
stems.BRANCHES.forEach(function (b, i) { BRANCH_BY_NAME[b.name] = i; });

function stemNode(name) {
    if (!name) return null;
    const s = STEM_BY_NAME[name];
    if (!s) return null;
    return { name: s.name, element: s.element, ganIdx: stems.STEMS.indexOf(s), yinYang: s.yinYang };
}

/**
 * @param {object} chart QimenBoard (immutable, từ anBan)
 * @returns {object} normalized chart
 */
function normalizeChart(chart) {
    if (!chart || typeof chart !== 'object') {
        throw new Error('normalizeChart: chart không hợp lệ (cần QimenBoard từ anBan).');
    }
    const info = chart.info;
    if (!info) {
        throw new Error('normalizeChart: chart thiếu info (cần QimenBoard từ anBan).');
    }

    // Ngày can chi: 'Giáp Tý' → ganIdx/chiIdx
    const dayParts = String(info.dayCanChi || '').split(' ');
    const dayGanIdx = typeof info.dayGanIdx === 'number' ? info.dayGanIdx : (dayParts[0] ? stems.STEMS.findIndex(function (s) { return s.name === dayParts[0]; }) : -1);
    const dayChiIdx = dayParts[1] !== undefined ? BRANCH_BY_NAME[dayParts[1]] : -1;

    const hourGanIdx = typeof info.gioGan === 'number' ? info.gioGan : -1;
    const hourChiIdx = typeof info.gioChi === 'number' ? info.gioChi : -1;

    const hourXun = (hourGanIdx >= 0 && hourChiIdx >= 0) ? stems.xunOf(hourGanIdx, hourChiIdx) : null;

    const out = {
        version: 'interpretation-1.0.0',
        chartRuleSetVersion: info.ruleSetVersion || null,
        chartRuleSetHash: info.ruleSetHash || null,
        date: info.date ? info.date.toString() : null,
        time: {
            yearCanChi: info.yearCanChi || null,
            dayCanChi: info.dayCanChi || null,
            dayGanIdx: dayGanIdx,
            dayChiIdx: dayChiIdx,
            hourGanIdx: hourGanIdx,
            hourChiIdx: hourChiIdx,
            hourGanChi: (hourGanIdx >= 0 && hourChiIdx >= 0)
                ? stems.STEMS[hourGanIdx].name + ' ' + stems.BRANCHES[hourChiIdx].name
                : null,
            hourXun: hourXun,
            cuc: info.cuc ? {
                so: info.cuc.so, duong: !!info.cuc.duong,
                tiet: info.cuc.tiet || null, nguyen: info.cuc.nguyen || null
            } : null
        },
        trucPhu: info.trucPhu ? {
            palace: info.trucPhu.cung,
            starName: info.trucPhu.tinh
        } : null,
        trucSu: info.trucSu ? {
            palace: info.trucSu.cung,
            doorName: info.trucSu.mon
        } : null,
        palaces: {}
    };

    for (let p = 1; p <= 9; p++) {
        const raw = chart[p];
        const palaceNode = palaces.BY_PALACE[p];
        if (!raw) {
            throw new Error('normalizeChart: thiếu cung ' + p + ' trong chart.');
        }
        const doorNode = raw.mon ? doors.BY_NAME[raw.mon] || null : null;
        const starNode = raw.tinh ? stars.BY_NAME[raw.tinh] || null : null;
        const deityNode = raw.than ? deities.BY_NAME[raw.than] || null : null;
        out.palaces[p] = {
            palace: {
                palace: p, id: palaceNode.id, nameZh: palaceNode.nameZh,
                nameVi: palaceNode.nameVi, direction: palaceNode.direction,
                element: palaceNode.element, homeDoor: palaceNode.homeDoor
            },
            door: doorNode ? {
                id: doorNode.id, nameZh: doorNode.nameZh, nameVi: doorNode.nameVi,
                element: doorNode.element, nature: doorNode.classicalNature,
                homePalace: doorNode.homePalace, symbolism: doorNode.symbolism
            } : null,
            star: starNode ? {
                id: starNode.id, nameZh: starNode.nameZh, nameVi: starNode.nameVi,
                element: starNode.element, nature: starNode.nature, symbolism: starNode.symbolism
            } : null,
            deity: deityNode ? {
                id: deityNode.id, nameZh: deityNode.nameZh, nameVi: deityNode.nameVi,
                element: deityNode.element, nature: deityNode.nature, symbolism: deityNode.symbolism
            } : null,
            heavenStem: stemNode(raw.thien),
            earthStem: stemNode(raw.dia)
        };
    }

    return out;
}

module.exports = { normalizeChart };
