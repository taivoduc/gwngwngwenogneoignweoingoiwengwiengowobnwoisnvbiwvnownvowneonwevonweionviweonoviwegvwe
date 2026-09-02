'use strict';
/**
 * knowledge/rules.js — Định nghĩa rule (Rule Definitions).
 *
 * Mỗi rule: { id, name, category, priority, source, sourceType, school, confidence,
 *             schoolDependent, apply(ctx) -> InterpretationFinding[] }
 *
 * THỨ BẬC ƯU TIÊN (docs yêu cầu):
 *   L1 (100) STRUCTURAL          — điều kiện cấu trúc cứng
 *   L2 ( 80) CLASSICAL_PATTERN   — mẫu cổ điển tường minh (Phục Ngâm/Phản Ngâm/Môn Bách/Nhập Mộ/Tuần Không/Mã tinh/Kích Hình)
 *   L3 ( 60) FIVE_ELEMENT_RELATION — quan hệ ngũ hành (sinh/khắc)
 *   L4 ( 40) SYMBOLISM           — biểu tượng nội tại (bản chất Môn/Tinh/Thần)
 *   L5 ( 20) HEURISTIC           — diễn giải heuristic (dữ liệu CHU_DE cũ, có nhãn)
 *
 * Rule KHÔNG sửa chart. Rule chỉ tạo Finding.
 * Rule KHÔNG tạo kết luận — Synthesizer (lib/interpretationSynthesizer.js) mới tổng hợp.
 */
const fe = require('./five-elements.js');

// Dữ liệu affinity (tốt/xấu theo chủ đề) — kế thừa CHU_DE hiện có của project,
// được gắn nhãn HEURISTIC (KHÔNG phải chân lý cổ điển).
const TOPIC_AFFINITY = {
    career: {
        tot: ['Khai', 'Sinh', 'Thiên Tâm', 'Thiên Phụ', 'Thiên Nhậm', 'Trực Phù', 'Cửu Thiên'],
        xau: ['Đỗ', 'Kinh', 'Thiên Nhuế', 'Thiên Bồng', 'Thiên Trụ', 'Đằng Xà', 'Huyền Vũ', 'Câu Trần']
    },
    wealth: {
        tot: ['Sinh', 'Thiên Phụ', 'Thiên Nhậm', 'Cửu Địa', 'Thái Âm'],
        xau: ['Thương', 'Tử', 'Thiên Nhuế', 'Thiên Bồng', 'Huyền Vũ', 'Đằng Xà']
    },
    relationship: {
        tot: ['Hưu', 'Sinh', 'Lục Hợp'],
        xau: ['Kinh', 'Tử', 'Thương', 'Thiên Nhuế', 'Đằng Xà', 'Bạch Hổ']
    },
    health: {
        tot: ['Sinh', 'Hưu', 'Thiên Tâm'],
        xau: ['Tử', 'Thương', 'Thiên Nhuế', 'Thiên Bồng', 'Bạch Hổ']
    },
    litigation: {
        tot: [],
        xau: ['Kinh', 'Thương', 'Thiên Xung', 'Thiên Trụ', 'Đằng Xà', 'Bạch Hổ', 'Câu Trần']
    },
    travel: {
        tot: ['Khai', 'Sinh', 'Hưu', 'Cửu Thiên'],
        xau: ['Đỗ', 'Tử', 'Huyền Vũ']
    },
    lost: {
        tot: [],
        xau: ['Thương', 'Đỗ', 'Thiên Bồng', 'Huyền Vũ']
    },
    safety: {
        tot: ['Sinh', 'Hưu', 'Khai', 'Thiên Phụ', 'Thiên Tâm', 'Trực Phù', 'Cửu Địa'],
        xau: ['Tử', 'Thương', 'Thiên Trụ', 'Thiên Bồng', 'Bạch Hổ', 'Đằng Xà']
    }
};

/** Tạo một finding chuẩn hóa từ rule. */
function F(rule, opts) {
    return Object.assign({
        ruleId: rule.id,
        name: rule.name,
        type: rule.category,
        priority: rule.priority,
        polarity: 'NEUTRAL',
        strength: 'WEAK',
        subject: null,
        object: null,
        evidence: [],
        explanation: '',
        source: rule.source,
        sourceType: rule.sourceType,
        school: rule.school,
        confidence: rule.confidence,
        schoolDependent: !!rule.schoolDependent,
        dimensions: null
    }, opts);
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
// Danh sách cung cần quét: có focusPalace (theo hướng) → chỉ cung đó;
// không có → 8 cung ngoài Trung (Trung cung không Môn/Tinh/Thần).
function focusPalaces(ctx) {
    const f = ctx.options && ctx.options.focusPalace;
    if (f === null || f === undefined) return [1, 2, 3, 4, 6, 7, 8, 9];
    return [f];
}

// ---------------------------------------------------------------
// L1 — STRUCTURAL
// ---------------------------------------------------------------
const R_TRUNG_CUNG = {
    id: 'TRUNG_CUNG_NO_SYMBOLS', name: 'Trung cung không có Môn/Tinh/Thần',
    category: 'STRUCTURAL', priority: 100,
    source: 'QimenBoard invariant (project)', sourceType: 'PROJECT_RULE',
    school: 'CURRENT_PROJECT', confidence: 'HIGH', schoolDependent: false,
    apply: function (ctx) {
        const f = ctx.options && ctx.options.focusPalace;
        if (f !== null && f !== undefined && f !== 5) return []; // có focus hướng → bỏ qua note Trung cung
        const cell = ctx.norm.palaces[5];
        if (!cell) return [];
        return [F(this, {
            polarity: 'NEUTRAL', strength: 'WEAK', subject: 'Trung cung',
            evidence: ['Cung 5 không an Môn/Tinh/Thần (theo ruleset hiện hành)'],
            explanation: 'Trung cung không có Môn/Tinh/Thần — không luận trực tiếp, chỉ dùng làm điểm tựa cho bàn.',
            dimensions: []
        })];
    }
};

// ---------------------------------------------------------------
// L2 — CLASSICAL PATTERNS (chuyển pattern đã nhận diện thành finding)
// ---------------------------------------------------------------
const R_PATTERNS = {
    id: 'PATTERNS', name: 'Mẫu cổ điển (Phục Ngâm/Phản Ngâm/Môn Bách/Nhập Mộ/Tuần Không/Mã tinh/Kích Hình)',
    category: 'CLASSICAL_PATTERN', priority: 80,
    source: 'knowledge/patterns.js (classical patterns)', sourceType: 'CLASSICAL_TEXT',
    school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: true,
    apply: function (ctx) {
        return ctx.patterns.map(function (p) {
            return {
                ruleId: 'PATTERNS:' + p.id,
                name: p.nameVi,
                type: p.category,
                priority: 80,
                polarity: p.polarity,
                strength: p.strength,
                subject: p.subject || null,
                object: p.object || null,
                evidence: p.evidence,
                explanation: p.explanation,
                source: p.source,
                sourceType: p.sourceType,
                school: p.school,
                confidence: p.confidence,
                schoolDependent: p.schoolDependent,
                schoolNote: p.schoolNote || null,
                dimensions: null
            };
        });
    }
};

// ---------------------------------------------------------------
// L3 — FIVE ELEMENT RELATIONS
// ---------------------------------------------------------------
// Ánh xạ quan hệ ngũ hành → (polarity, strength, text).
// LƯU Ý: đây là framework phổ thông, một số chi tiết school-dependent
// (ví dụ 门生宫 = 泄 khí — có phái coi là trung tính, có phái coi nhẹ bất lợi).
const REL_MAP = {
    sameElement: { polarity: 'FAVORABLE', strength: 'WEAK' },
    generates: { polarity: 'NEUTRAL', strength: 'MODERATE' },     // A sinh B: A hao khí
    generatedBy: { polarity: 'FAVORABLE', strength: 'MODERATE' }, // A được B sinh
    controls: { polarity: 'UNFAVORABLE', strength: 'MODERATE' },
    controlledBy: { polarity: 'UNFAVORABLE', strength: 'WEAK' }
};

function relText(rel, subjLabel, objLabel) {
    switch (rel) {
        case 'sameElement': return subjLabel + ' đồng hành với ' + objLabel + ' (cùng hành)';
        case 'generates': return subjLabel + ' sinh ' + objLabel + ' — khí của ' + subjLabel + ' dồn vào cung';
        case 'generatedBy': return objLabel + ' sinh ' + subjLabel + ' — ' + subjLabel + ' được nuôi dưỡng';
        case 'controls': return subjLabel + ' khắc ' + objLabel;
        case 'controlledBy': return objLabel + ' khắc ' + subjLabel + ' — ' + subjLabel + ' bị áp chế';
        default: return subjLabel + ' ↔ ' + objLabel;
    }
}

function makeRelationRule(id, name, getSymbol, symbolLabel, extra) {
    return Object.assign({
        id: id, name: name, category: 'FIVE_ELEMENT_RELATION', priority: 60,
        source: 'Framework ngũ hành tương sinh/tương khắc (classical)', sourceType: 'CLASSICAL_TEXT',
        school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: true,
        schoolNote: 'Cách quy polarity của từng quan hệ có biến thể giữa các trường phái.',
        apply: function (ctx) {
            const out = [];
            const ps = focusPalaces(ctx);
            for (let pi = 0; pi < ps.length; pi++) {
                const p = ps[pi];
                if (p === 5) continue;
                const cell = ctx.norm.palaces[p];
                const sym = getSymbol(cell);
                if (!sym) continue;
                const rel = fe.relation(sym.element, cell.palace.element);
                if (!rel) continue;
                if (rel === 'controls' && id === 'DOOR_PALACE_RELATION') continue; // đã có MEN_PO (L2)
                const m = REL_MAP[rel];
                const subj = symbolLabel(sym);
                const obj = 'cung ' + cell.palace.nameVi;
                out.push(F(this, {
                    polarity: m.polarity, strength: m.strength,
                    subject: subj, object: obj,
                    evidence: [relText(rel, subj, obj), subj + ' = ' + sym.element + '; ' + obj + ' = ' + cell.palace.element],
                    explanation: relText(rel, subj, obj) + '.',
                    dimensions: null
                }));
            }
            return out;
        }
    }, extra || {});
}

const R_DOOR_PALACE = makeRelationRule(
    'DOOR_PALACE_RELATION', 'Quan hệ Môn – Cung',
    function (cell) { return cell.door; },
    function (s) { return s.nameVi + ' Môn'; }
);

const R_STAR_PALACE = makeRelationRule(
    'STAR_PALACE_RELATION', 'Quan hệ Tinh – Cung',
    function (cell) { return cell.star; },
    function (s) { return 'Sao ' + s.nameVi; }
);

const R_DEITY_PALACE = makeRelationRule(
    'DEITY_PALACE_RELATION', 'Quan hệ Thần – Cung',
    function (cell) { return cell.deity; },
    function (s) { return 'Thần ' + s.nameVi; }
);

// Thiên can ↔ Địa can trong từng cung.
const R_STEM_HEAVEN_EARTH = {
    id: 'STEM_HEAVEN_EARTH_RELATION', name: 'Quan hệ Thiên can – Địa can',
    category: 'FIVE_ELEMENT_RELATION', priority: 60,
    source: 'Framework ngũ hành (classical)', sourceType: 'CLASSICAL_TEXT',
    school: 'ZhuanPan', confidence: 'MEDIUM', schoolDependent: true,
    apply: function (ctx) {
        const out = [];
        const ps = focusPalaces(ctx);
        for (let pi = 0; pi < ps.length; pi++) {
            const p = ps[pi];
            const cell = ctx.norm.palaces[p];
            if (!cell || !cell.heavenStem || !cell.earthStem) continue;
            const rel = fe.relation(cell.heavenStem.element, cell.earthStem.element);
            if (!rel) continue;
            const m = REL_MAP[rel];
            const subj = 'Thiên can ' + cell.heavenStem.name;
            const obj = 'Địa can ' + cell.earthStem.name;
            out.push(F(this, {
                polarity: m.polarity, strength: m.strength,
                subject: subj, object: obj,
                evidence: [relText(rel, subj, obj)],
                explanation: relText(rel, subj, obj) + ' tại cung ' + cell.palace.nameVi + '.',
                dimensions: null
            }));
        }
        return out;
    }
};

// Dụng thần so với cung nó đang đóng.
const R_YONG_SHEN_PALACE = {
    id: 'YONG_SHEN_PALACE_RELATION', name: 'Quan hệ Dụng thần – Cung',
    category: 'FIVE_ELEMENT_RELATION', priority: 60,
    source: 'Framework ngũ hành + yongshen (project)', sourceType: 'PROJECT_RULE',
    school: 'CURRENT_PROJECT', confidence: 'MEDIUM', schoolDependent: true,
    apply: function (ctx) {
        const out = [];
        const emptyPalaces = ctx.emptyPalaces;
        ctx.yongShen.all.forEach(function (ys) {
            if (ys.palace === null || ys.palace === undefined) return;
            const cell = ctx.norm.palaces[ys.palace];
            if (!cell) return;
            const isPrimary = ctx.yongShen.primary.indexOf(ys) >= 0;
            const strength = isPrimary ? 'STRONG' : 'MODERATE';
            // Dụng thần rơi vào tuần không
            if (emptyPalaces.indexOf(ys.palace) >= 0) {
                out.push(F(this, {
                    polarity: 'UNFAVORABLE', strength: strength,
                    subject: ys.label, object: 'cung ' + cell.palace.nameVi,
                    evidence: ['Dụng thần ' + ys.label + ' đóng tại cung tuần không (' + ctx.norm.palaces[ys.palace].palace.nameVi + ')'],
                    explanation: 'Dụng thần rơi vào Tuần Không: sự việc khó thành, hoặc chưa tới thời điểm chín muồi.',
                    dimensions: null
                }));
                return;
            }
            if (!ys.element) return;
            const rel = fe.relation(ys.element, cell.palace.element);
            if (!rel) return;
            const m = REL_MAP[rel];
            const subj = 'Dụng thần ' + ys.label;
            const obj = 'cung ' + cell.palace.nameVi;
            const s2 = isPrimary ? (rel === 'generatedBy' ? 'STRONG' : m.strength) : m.strength;
            out.push(F(this, {
                polarity: m.polarity, strength: s2,
                subject: subj, object: obj,
                evidence: [relText(rel, subj, obj)],
                explanation: relText(rel, subj, obj) + '.',
                dimensions: null
            }));
        }, this);
        return out;
    }
};

// ---------------------------------------------------------------
// L4 — SYMBOLISM (biểu tượng nội tại, chỉ tính cho biểu tượng liên quan)
// ---------------------------------------------------------------
function makeNatureRule(id, name, getSymbol, symbolLabel, listKey, listOf, extra) {
    return Object.assign({
        id: id, name: name, category: 'SYMBOLISM', priority: 40,
        source: 'knowledge/' + (id.indexOf('DOOR') >= 0 ? 'doors.js' : id.indexOf('STAR') >= 0 ? 'stars.js' : 'deities.js') + ' (project data)', sourceType: 'PROJECT_RULE',
        school: 'CURRENT_PROJECT', confidence: 'MEDIUM', schoolDependent: false,
        apply: function (ctx) {
            const out = [];
            const q = ctx.questionType;
            const relevant = q[listOf] || [];
            const seen = {};
            // Có focus hướng → chỉ xét cung focus; ngược lại duyệt toàn bàn.
            const ps = focusPalaces(ctx);
            for (let pi = 0; pi < ps.length; pi++) {
                const p = ps[pi];
                const cell = ctx.norm.palaces[p];
                const sym = getSymbol(cell);
                if (!sym) continue;
                if (relevant.length && relevant.indexOf(sym.id) < 0) continue;
                if (seen[sym.id]) continue;
                seen[sym.id] = true;
                let polarity = null;
                if (sym.nature === 'AUSPICIOUS') polarity = 'FAVORABLE';
                else if (sym.nature === 'OMINOUS') polarity = 'UNFAVORABLE';
                if (!polarity) continue;
                out.push(F(this, {
                    polarity: polarity, strength: 'WEAK',
                    subject: symbolLabel(sym), object: 'cung ' + cell.palace.nameVi,
                    evidence: [symbolLabel(sym) + ': ' + sym.symbolism],
                    explanation: 'Biểu tượng ' + symbolLabel(sym) + ' (' + sym.nameZh + ') được coi là ' +
                        (polarity === 'FAVORABLE' ? 'cát' : 'hung') + ' theo nguồn project. ' + sym.symbolism + '.',
                    dimensions: ctx.questionType.dimensions && ctx.questionType.dimensions.length ? ctx.questionType.dimensions : null
                }));
            }
            return out;
        }
    }, extra || {});
}

const R_DOOR_NATURE = makeNatureRule(
    'DOOR_NATURE_RELEVANT', 'Bản chất Môn (biểu tượng)',
    function (cell) { return cell.door; },
    function (s) { return s.nameVi + ' Môn'; },
    'relevantDoors', 'relevantDoors'
);
const R_STAR_NATURE = makeNatureRule(
    'STAR_NATURE_RELEVANT', 'Bản chất Tinh (biểu tượng)',
    function (cell) { return cell.star; },
    function (s) { return 'Sao ' + s.nameVi; },
    'relevantStars', 'relevantStars'
);
const R_DEITY_NATURE = makeNatureRule(
    'DEITY_NATURE_RELEVANT', 'Bản chất Thần (biểu tượng)',
    function (cell) { return cell.deity; },
    function (s) { return 'Thần ' + s.nameVi; },
    'relevantDeities', 'relevantDeities'
);

// ---------------------------------------------------------------
// L5 — HEURISTIC (kế thừa CHU_DE, gắn nhãn rõ ràng)
// ---------------------------------------------------------------
const R_TOPIC_AFFINITY = {
    id: 'TOPIC_AFFINITY', name: 'Độ phù hợp chủ đề (heuristic legacy)',
    category: 'HEURISTIC', priority: 20,
    source: 'Project CHU_DE (legacy heuristic — KHÔNG phải quy tắc cổ điển)', sourceType: 'HEURISTIC',
    school: 'CURRENT_PROJECT', confidence: 'LOW', schoolDependent: false,
    apply: function (ctx) {
        const out = [];
        const rule = this;
        const dims = ctx.questionType.dimensions || [];
        dims.forEach(function (dim) {
            const aff = TOPIC_AFFINITY[dim];
            if (!aff) return; // dimension không có dữ liệu affinity (vd study) → bỏ qua
            // Có focus hướng → xét CHÍNH cung focus (ràng buộc hướng).
            // Không có focus → xét (các) cung Dụng thần chính, fallback toàn bàn có Môn.
            let cells = [];
            const f = ctx.options && ctx.options.focusPalace;
            if (f !== null && f !== undefined) {
                cells.push(ctx.norm.palaces[f]);
            } else {
                const ysPrimary = ctx.yongShen.primary.filter(function (y) { return y.palace !== null && y.palace !== undefined; });
                if (ysPrimary.length) {
                    ysPrimary.forEach(function (y) { cells.push(ctx.norm.palaces[y.palace]); });
                } else {
                    for (let p = 1; p <= 9; p++) { const c = ctx.norm.palaces[p]; if (c && c.door) cells.push(c); }
                }
            }
            const good = [], bad = [];
            cells.forEach(function (cell) {
                if (!cell) return;
                [['Môn', cell.door], ['Tinh', cell.star], ['Thần', cell.deity]].forEach(function (pair) {
                    const label = pair[0], sym = pair[1];
                    if (!sym) return;
                    if (aff.tot.indexOf(sym.nameVi) >= 0) good.push(label + ' ' + sym.nameVi);
                    else if (aff.xau.indexOf(sym.nameVi) >= 0) bad.push(label + ' ' + sym.nameVi);
                });
            });
            if (!good.length && !bad.length) return;
            const net = good.length - bad.length;
            const polarity = net > 0 ? 'FAVORABLE' : (net < 0 ? 'UNFAVORABLE' : 'NEUTRAL');
            const strength = Math.abs(net) >= 2 ? 'MODERATE' : 'WEAK';
            out.push(F(rule, {
                polarity: polarity, strength: strength,
                subject: 'chủ đề ' + dim, object: null,
                evidence: good.concat(bad.map(function (b) { return '(-) ' + b; })),
                explanation: 'Theo dữ liệu heuristic của project (CHU_DE): ' +
                    (good.length ? 'thuận: ' + good.join(', ') + '; ' : '') +
                    (bad.length ? 'nghịch: ' + bad.join(', ') : '') + '.',
                dimensions: [dim]
            }));
        });
        return out;
    }
};

// ---------------------------------------------------------------
// L4 — FOCUS PALACE PROFILE (thông tin cung đang hướng tới)
// ---------------------------------------------------------------
const R_FOCUS_PROFILE = {
    id: 'FOCUS_PALACE_PROFILE', name: 'Hồ sơ cung đang hướng tới',
    category: 'SYMBOLISM', priority: 40,
    source: 'Normalized chart (direction binding)', sourceType: 'PROJECT_RULE',
    school: 'CURRENT_PROJECT', confidence: 'HIGH', schoolDependent: false,
    apply: function (ctx) {
        const f = ctx.options && ctx.options.focusPalace;
        if (f === null || f === undefined) return [];
        const cell = ctx.norm.palaces[f];
        if (!cell) return [];
        const parts = [];
        if (cell.door) parts.push(cell.door.nameVi + ' Môn (' + cell.door.element + ')');
        if (cell.star) parts.push('Sao ' + cell.star.nameVi);
        if (cell.deity) parts.push('Thần ' + cell.deity.nameVi);
        if (cell.heavenStem && cell.earthStem) parts.push('Thiên ' + cell.heavenStem.name + ' / Địa ' + cell.earthStem.name);
        return [F(this, {
            polarity: 'NEUTRAL', strength: 'WEAK',
            subject: 'cung ' + cell.palace.nameVi, object: null,
            evidence: parts,
            explanation: 'Cung ' + cell.palace.nameVi + ' (' + cell.palace.direction + '): ' + parts.join(' · ') + '.',
            dimensions: []
        })];
    }
};

// ---------------------------------------------------------------
// L3 — YONG_SHEN vs FOCUS (ràng buộc hướng với Dụng thần)
// ---------------------------------------------------------------
const R_YONG_SHEN_FOCUS = {
    id: 'YONG_SHEN_FOCUS_RELATION', name: 'Quan hệ Dụng thần – cung hướng tới',
    category: 'FIVE_ELEMENT_RELATION', priority: 60,
    source: 'Framework ngũ hành + yongshen (project)', sourceType: 'PROJECT_RULE',
    school: 'CURRENT_PROJECT', confidence: 'MEDIUM', schoolDependent: true,
    schoolNote: 'Cách quy polarity "hướng sinh Dụng thần" có biến thể giữa trường phái.',
    apply: function (ctx) {
        const out = [];
        const f = ctx.options && ctx.options.focusPalace;
        if (f === null || f === undefined) return [];
        const focusCell = ctx.norm.palaces[f];
        if (!focusCell) return [];
        ctx.yongShen.all.forEach(function (ys) {
            if (ys.palace === null || ys.palace === undefined) return;
            const isPrimary = ctx.yongShen.primary.indexOf(ys) >= 0;
            const strength = isPrimary ? 'MODERATE' : 'WEAK';
            const palaceLabel = 'cung ' + focusCell.palace.nameVi;
            // Dụng thần đóng ngay tại cung hướng tới → thuận nhất
            if (ys.palace === f) {
                out.push(F(this, {
                    polarity: 'FAVORABLE', strength: 'STRONG',
                    subject: ys.label, object: palaceLabel,
                    evidence: ['Dụng thần ' + ys.label + ' đóng ngay tại cung đang hướng tới (' + palaceLabel + ')'],
                    explanation: 'Hướng này trùng nơi Dụng thần đóng — sự việc được "đón đầu", thuận lợi nhất.',
                    dimensions: null
                }));
                return;
            }
            if (!ys.element) return;
            const rel = fe.relation(focusCell.palace.element, ys.element); // hướng (cung) vs Dụng thần
            if (!rel) return;
            // rel = quan hệ của CUNG HƯỚNG vs Dụng thần:
            //   generates    : cung hướng SINH Dụng thần → hướng nuôi dưỡng sự việc → thuận
            //   generatedBy  : Dụng thần sinh cung hướng → sự việc đổ khí vào hướng → trung tính (school-dependent)
            //   controls     : cung hướng KHẮC Dụng thần → hướng đè nén sự việc → không thuận
            //   controlledBy : Dụng thần khắc cung hướng → trung tính (school-dependent)
            const m = {
                sameElement: { polarity: 'FAVORABLE', strength: strength },
                generates: { polarity: 'FAVORABLE', strength: strength },
                generatedBy: { polarity: 'NEUTRAL', strength: strength },
                controls: { polarity: 'UNFAVORABLE', strength: strength },
                controlledBy: { polarity: 'NEUTRAL', strength: strength }
            }[rel];
            if (!m) return;
            const subj = 'hướng ' + palaceLabel;
            const obj = 'Dụng thần ' + ys.label;
            out.push(F(this, {
                polarity: m.polarity, strength: m.strength,
                subject: subj, object: obj,
                evidence: [relText(rel, subj, obj)],
                explanation: relText(rel, subj, obj) + '.',
                dimensions: null
            }));
        }, this);
        return out;
    }
};

// Thứ tự giảm dần theo priority (L1 → L2 → L3 → L4 → L5).
const RULES = [
    R_TRUNG_CUNG, R_PATTERNS,
    R_YONG_SHEN_FOCUS, R_DOOR_PALACE, R_STAR_PALACE, R_DEITY_PALACE, R_STEM_HEAVEN_EARTH, R_YONG_SHEN_PALACE,
    R_FOCUS_PROFILE, R_DOOR_NATURE, R_STAR_NATURE, R_DEITY_NATURE,
    R_TOPIC_AFFINITY
];

const BY_ID = {};
RULES.forEach(function (r) { BY_ID[r.id] = r; });

module.exports = { RULES, BY_ID, TOPIC_AFFINITY, REL_MAP };
