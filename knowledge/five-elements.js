'use strict';
/**
 * knowledge/five-elements.js — Ngũ hành: chu kỳ tương sinh / tương khắc.
 *
 * Nguồn: framework ngũ hành cổ điển (tương sinh: Kim→Thủy→Mộc→Hỏa→Thổ→Kim;
 * tương khắc: Kim→Mộc→Thổ→Thủy→Hỏa→Kim). Đây là kiến thức nền tảng,
 * KHÔNG phải quy tắc riêng của một trường phái — nhưng CÁCH DIỄN GIẢI từng
 * quan hệ (tốt/xấu) là school-dependent, nằm ở knowledge/rules.js.
 */

// Tên hành dùng trong project (khớp CUNG_HANH / MON_LUAN / THAN_HANH / TINH_LUAN).
const E = {
    KIM: 'Kim',
    MOC: 'Mộc',
    THUY: 'Thủy',
    HOA: 'Hỏa',
    THO: 'Thổ'
};

// Bí danh tiếng Anh cho audit (node id trong Knowledge Graph).
const EN = { 'Kim': 'METAL', 'Mộc': 'WOOD', 'Thủy': 'WATER', 'Hỏa': 'FIRE', 'Thổ': 'EARTH' };

// Tương sinh: A sinh B.
const GENERATES = {};
GENERATES[E.KIM] = E.THUY;
GENERATES[E.THUY] = E.MOC;
GENERATES[E.MOC] = E.HOA;
GENERATES[E.HOA] = E.THO;
GENERATES[E.THO] = E.KIM;

// Tương khắc: A khắc B.
const CONTROLS = {};
CONTROLS[E.KIM] = E.MOC;
CONTROLS[E.MOC] = E.THO;
CONTROLS[E.THO] = E.THUY;
CONTROLS[E.THUY] = E.HOA;
CONTROLS[E.HOA] = E.KIM;

const ALL = [E.KIM, E.THUY, E.MOC, E.HOA, E.THO];

/**
 * Quan hệ giữa A và B (A là chủ thể).
 * @param {string} a element A
 * @param {string} b element B
 * @returns {'sameElement'|'generates'|'generatedBy'|'controls'|'controlledBy'|null}
 *   - sameElement : A = B (bỉ hòa / đồng hành)
 *   - generates   : A sinh B (A là nguồn sinh cho B)
 *   - generatedBy : A được B sinh (A nhận sinh khí từ B)
 *   - controls    : A khắc B
 *   - controlledBy: A bị B khắc
 */
function relation(a, b) {
    if (!a || !b) return null;
    if (a === b) return 'sameElement';
    if (GENERATES[a] === b) return 'generates';
    if (GENERATES[b] === a) return 'generatedBy';
    if (CONTROLS[a] === b) return 'controls';
    if (CONTROLS[b] === a) return 'controlledBy';
    return null; // không thể xảy ra với 5 hành hợp lệ
}

/** Mô tả ngắn một quan hệ (dùng cho evidence trace). */
function describe(rel, subjectLabel, objectLabel) {
    switch (rel) {
        case 'sameElement': return subjectLabel + ' đồng hành với ' + objectLabel + ' (cùng hành)';
        case 'generates': return subjectLabel + ' sinh ' + objectLabel;
        case 'generatedBy': return subjectLabel + ' được ' + objectLabel + ' sinh';
        case 'controls': return subjectLabel + ' khắc ' + objectLabel;
        case 'controlledBy': return subjectLabel + ' bị ' + objectLabel + ' khắc';
        default: return subjectLabel + ' — ' + objectLabel;
    }
}

module.exports = {
    E, EN, GENERATES, CONTROLS, ALL,
    relation, describe
};
