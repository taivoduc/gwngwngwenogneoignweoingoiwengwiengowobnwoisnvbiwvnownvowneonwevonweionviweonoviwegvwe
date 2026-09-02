'use strict';
/**
 * lib/qimenRelations.js — Relation Engine.
 *
 * Tính các quan hệ NGŨ HÀNH có nghĩa giữa các cặp biểu tượng, KHÔNG quy
 * thành +1/-1 ngay. Mỗi quan hệ: { relation, source, target, sourceLabel,
 * targetLabel, elementSource, elementTarget, strength, evidence }.
 *
 * Các quan hệ được tính:
 *   Door ↔ Palace, Star ↔ Palace, Deity ↔ Palace,
 *   HeavenStem ↔ EarthStem (trong từng cung),
 *   YongShen ↔ Palace (xem yongShenResolver).
 */
const fe = require('../knowledge/five-elements.js');

/**
 * Quan hệ giữa 2 node.
 * @param {string} elementA element của A
 * @param {string} elementB element của B
 * @param {string} sourceLabel nhãn A
 * @param {string} targetLabel nhãn B
 * @param {string} relationKey tên quan hệ (ví dụ 'DOOR_PALACE')
 */
function makeRelation(elementA, elementB, sourceLabel, targetLabel, relationKey) {
    const rel = fe.relation(elementA, elementB);
    if (!rel) return null;
    return {
        relation: relationKey + '_' + rel.toUpperCase(),
        type: rel,
        source: relationKey.split('_')[0],
        target: relationKey.split('_')[1] || '',
        sourceLabel: sourceLabel,
        targetLabel: targetLabel,
        elementSource: elementA,
        elementTarget: elementB,
        strength: rel === 'sameElement' ? 'WEAK' : (rel === 'generates' || rel === 'generatedBy' ? 'MODERATE' : 'MODERATE'),
        evidence: fe.describe(rel, sourceLabel, targetLabel)
    };
}

/**
 * Tính toàn bộ quan hệ của một normalized chart.
 * @returns {{ perPalace: object, chart: Array }}
 */
function relationsForChart(norm) {
    const perPalace = {};
    let all = [];
    for (let p = 1; p <= 9; p++) {
        const cell = norm.palaces[p];
        const list = [];
        const palaceLabel = 'cung ' + cell.palace.nameVi;
        if (cell.door) {
            const r = makeRelation(cell.door.element, cell.palace.element, cell.door.nameVi + ' Môn', palaceLabel, 'DOOR_PALACE');
            if (r) list.push(r);
        }
        if (cell.star) {
            const r = makeRelation(cell.star.element, cell.palace.element, 'Sao ' + cell.star.nameVi, palaceLabel, 'STAR_PALACE');
            if (r) list.push(r);
        }
        if (cell.deity) {
            const r = makeRelation(cell.deity.element, cell.palace.element, 'Thần ' + cell.deity.nameVi, palaceLabel, 'DEITY_PALACE');
            if (r) list.push(r);
        }
        if (cell.heavenStem && cell.earthStem) {
            const r = makeRelation(cell.heavenStem.element, cell.earthStem.element,
                'Thiên can ' + cell.heavenStem.name, 'Địa can ' + cell.earthStem.name, 'HEAVEN_EARTH_STEM');
            if (r) list.push(r);
        }
        perPalace[p] = list;
        all = all.concat(list);
    }
    return { perPalace: perPalace, chart: all };
}

module.exports = { relationsForChart, makeRelation };
