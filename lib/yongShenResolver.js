'use strict';
/**
 * lib/yongShenResolver.js — Dụng thần Resolver.
 *
 * API: resolveYongShen(norm, questionType, options)
 *   → { primary: [ys...], secondary: [ys...], all: [ys...], rationale, rulesUsed }
 *
 * ys = { kind, id?, role?, label, palace, element, nameVi?, source, confidence }
 * Mỗi ref không "chạm" được vào chart (vd Giáp ẩn) → palace:null + ghi chú
 * (KHÔNG silent fallback — resolver trả nguyên trạng để rule engine xử lý).
 */
const yongshen = require('../knowledge/yongshen.js');

function findPalaceOfDoor(norm, doorId) {
    for (let p = 1; p <= 9; p++) {
        const d = norm.palaces[p].door;
        if (d && d.id === doorId) return { palace: p, element: d.element, nameVi: d.nameVi };
    }
    return null;
}
function findPalaceOfStar(norm, starId) {
    for (let p = 1; p <= 9; p++) {
        const s = norm.palaces[p].star;
        if (s && s.id === starId) return { palace: p, element: s.element, nameVi: s.nameVi };
    }
    return null;
}
function findPalaceOfDeity(norm, deityId) {
    for (let p = 1; p <= 9; p++) {
        const d = norm.palaces[p].deity;
        if (d && d.id === deityId) return { palace: p, element: d.element, nameVi: d.nameVi };
    }
    return null;
}
function findPalaceOfStem(norm, ganIdx) {
    for (let p = 1; p <= 9; p++) {
        const h = norm.palaces[p].heavenStem;
        if (h && h.ganIdx === ganIdx) return { palace: p, element: h.element, nameVi: h.name };
    }
    return null;
}

function resolveRef(norm, ref) {
    switch (ref.kind) {
        case 'DOOR': {
            const hit = findPalaceOfDoor(norm, ref.id);
            return { kind: 'DOOR', id: ref.id, label: ref.label, palace: hit ? hit.palace : null, element: hit ? hit.element : null, nameVi: hit ? hit.nameVi : null, ref: ref };
        }
        case 'STAR': {
            const hit = findPalaceOfStar(norm, ref.id);
            return { kind: 'STAR', id: ref.id, label: ref.label, palace: hit ? hit.palace : null, element: hit ? hit.element : null, nameVi: hit ? hit.nameVi : null, ref: ref };
        }
        case 'DEITY': {
            const hit = findPalaceOfDeity(norm, ref.id);
            return { kind: 'DEITY', id: ref.id, label: ref.label, palace: hit ? hit.palace : null, element: hit ? hit.element : null, nameVi: hit ? hit.nameVi : null, ref: ref };
        }
        case 'PALACE': {
            const pn = norm.palaces[ref.id].palace;
            return { kind: 'PALACE', id: ref.id, label: ref.label, palace: ref.id, element: pn.element, nameVi: pn.nameVi, ref: ref };
        }
        case 'STEM': {
            if (ref.role === 'dayStem') {
                if (norm.time.dayGanIdx < 0) return { kind: 'STEM', role: 'dayStem', label: 'Nhật can', palace: null, element: null, ref: ref, note: 'Không xác định được Nhật can.' };
                if (norm.time.dayGanIdx === 0) return { kind: 'STEM', role: 'dayStem', label: 'Nhật can Giáp (ẩn)', palace: null, element: null, ref: ref, note: 'Giáp ẩn trong Lục Nghi — không đứng trực tiếp trên Thiên bàn.' };
                const hit = findPalaceOfStem(norm, norm.time.dayGanIdx);
                return { kind: 'STEM', role: 'dayStem', label: 'Nhật can ' + norm.time.dayCanChi.split(' ')[0], palace: hit ? hit.palace : null, element: hit ? hit.element : null, nameVi: hit ? hit.nameVi : null, ref: ref };
            }
            if (ref.role === 'hourStem') {
                if (norm.time.hourGanIdx < 0) return { kind: 'STEM', role: 'hourStem', label: 'Thời can', palace: null, element: null, ref: ref, note: 'Không xác định được Thời can.' };
                const hit = findPalaceOfStem(norm, norm.time.hourGanIdx);
                return { kind: 'STEM', role: 'hourStem', label: 'Thời can ' + norm.time.hourGanChi.split(' ')[0], palace: hit ? hit.palace : null, element: hit ? hit.element : null, nameVi: hit ? hit.nameVi : null, ref: ref };
            }
            return { kind: 'STEM', role: ref.role, label: ref.label || 'Can', palace: null, element: null, ref: ref };
        }
        case 'CHARTSYMBOL': {
            if (ref.role === 'zhiFu') {
                const p = norm.trucPhu ? norm.trucPhu.palace : null;
                const star = p ? norm.palaces[p].star : null;
                return { kind: 'CHARTSYMBOL', role: 'zhiFu', label: 'Trực Phù của bàn', palace: p, element: star ? star.element : null, nameVi: star ? star.nameVi : null, ref: ref };
            }
            if (ref.role === 'zhiShi') {
                const p = norm.trucSu ? norm.trucSu.palace : null;
                const door = p ? norm.palaces[p].door : null;
                return { kind: 'CHARTSYMBOL', role: 'zhiShi', label: 'Trực Sử của bàn', palace: p, element: door ? door.element : null, nameVi: door ? door.nameVi : null, ref: ref };
            }
            return { kind: 'CHARTSYMBOL', role: ref.role, label: ref.label || 'Chart symbol', palace: null, element: null, ref: ref };
        }
        default:
            return { kind: ref.kind, id: ref.id, label: ref.label || '?', palace: null, element: null, ref: ref };
    }
}

/**
 * Resolve Dụng thần cho một loại câu hỏi trên một chart cụ thể.
 */
function resolveYongShen(norm, questionType, options) {
    const opts = options || {};
    const map = yongshen.YONGSHEN_MAP[questionType.id] || yongshen.YONGSHEN_MAP.GENERAL;
    const primary = (map.primary || []).map(function (ref) { return resolveRef(norm, ref); });
    const secondary = (map.secondary || []).map(function (ref) { return resolveRef(norm, ref); });
    const all = primary.concat(secondary);
    return {
        primary: primary,
        secondary: secondary,
        all: all,
        rationale: (map.primary || []).concat(map.secondary || []).map(function (ref) { return ref.rationale || ref.label; }),
        rulesUsed: (map.primary || []).concat(map.secondary || []).map(function (ref) { return 'YONGSHEN:' + questionType.id + ':' + ref.kind + (ref.id || ref.role || ''); }),
        source: yongshen.SOURCE
    };
}

module.exports = { resolveYongShen };
