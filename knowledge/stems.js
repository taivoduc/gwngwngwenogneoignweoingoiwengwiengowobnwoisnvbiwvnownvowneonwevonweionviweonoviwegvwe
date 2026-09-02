'use strict';
/**
 * knowledge/stems.js — Thập Can, Thập Nhị Chi + các ánh xạ phụ trợ
 * (chi → cung, mộ khố, Mã tinh, Tuần Không).
 *
 * Nguồn: kiến thức nền tảng (can chi ngũ hành, âm dương). Các bảng ánh xạ
 * (chi→cung, mộ, mã) là quy ước phổ thông — ghi chú school-dependent nơi có biến thể.
 */

// 10 Can: { name, element, yinYang } (index 0..9 = Giáp..Quý)
const STEMS = [
    { name: 'Giáp', element: 'Mộc',  yinYang: 'YANG' },
    { name: 'Ất',   element: 'Mộc',  yinYang: 'YIN' },
    { name: 'Bính', element: 'Hỏa',  yinYang: 'YANG' },
    { name: 'Đinh', element: 'Hỏa',  yinYang: 'YIN' },
    { name: 'Mậu',  element: 'Thổ',  yinYang: 'YANG' },
    { name: 'Kỷ',   element: 'Thổ',  yinYang: 'YIN' },
    { name: 'Canh', element: 'Kim',  yinYang: 'YANG' },
    { name: 'Tân',  element: 'Kim',  yinYang: 'YIN' },
    { name: 'Nhâm', element: 'Thủy', yinYang: 'YANG' },
    { name: 'Quý',  element: 'Thủy', yinYang: 'YIN' }
];

// 12 Chi: { name, element } (index 0..11 = Tý..Hợi)
const BRANCHES = [
    { name: 'Tý',  element: 'Thủy' },
    { name: 'Sửu', element: 'Thổ' },
    { name: 'Dần', element: 'Mộc' },
    { name: 'Mão', element: 'Mộc' },
    { name: 'Thìn', element: 'Thổ' },
    { name: 'Tỵ',  element: 'Hỏa' },
    { name: 'Ngọ', element: 'Hỏa' },
    { name: 'Mùi', element: 'Thổ' },
    { name: 'Thân', element: 'Kim' },
    { name: 'Dậu', element: 'Kim' },
    { name: 'Tuất', element: 'Thổ' },
    { name: 'Hợi', element: 'Thủy' }
];

// Địa chi → cung (địa bàn cố định). Nguồn: quy ước 地支藏宫 phổ thông.
const BRANCH_PALACE = { 0: 1, 1: 8, 2: 8, 3: 3, 4: 4, 5: 4, 6: 9, 7: 2, 8: 2, 9: 7, 10: 6, 11: 6 };

// Mộ khố theo hành (chi): Mộc mộ tại Mùi, Hỏa mộ tại Tuất, Kim mộ tại Sửu, Thủy/Thổ mộ tại Thìn.
const TOMB_BRANCH = { 'Mộc': 7, 'Hỏa': 10, 'Kim': 1, 'Thủy': 4, 'Thổ': 4 };

// Mã tinh (驿马) theo nhóm tam hợp của chi. Nguồn: quy ước phổ thông.
// 申子辰→寅; 寅午戌→申; 巳酉丑→亥; 亥卯未→巳
const HORSE_BY_GROUP = { '申子辰': 2, '寅午戌': 8, '巳酉丑': 11, '亥卯未': 5 };

// Tam hợp nhóm chứa một chi (để tra Mã tinh).
const TRIPLE_HARMONY = [
    { branches: [0, 4, 8], horse: 2 },   // Tý Thìn Thân → Dần
    { branches: [2, 6, 10], horse: 8 },  // Dần Ngọ Tuất → Thân
    { branches: [5, 9, 1], horse: 11 },  // Tỵ Dậu Sửu → Hợi
    { branches: [11, 3, 7], horse: 5 }   // Hợi Mão Mùi → Tỵ
];

/** Mã tinh (chi) của một chi cho trước. */
function horseBranchOf(chiIdx) {
    for (let i = 0; i < TRIPLE_HARMONY.length; i++) {
        if (TRIPLE_HARMONY[i].branches.indexOf(chiIdx) >= 0) return TRIPLE_HARMONY[i].horse;
    }
    return null;
}

/** Chỉ số 60 Giáp Tý từ (ganIdx, chiIdx). */
function sexagenaryIndex(ganIdx, chiIdx) {
    return ((ganIdx * 6 - chiIdx * 5) % 60 + 60) % 60;
}

/**
 * Tuần của một trụ can chi: trả { headGan:0 (Giáp), headChi, emptyBranches }.
 * emptyBranches: 2 chi TUẦN KHÔNG (旬空) của tuần đó.
 * Nguồn: quy ước Lục Tuần — 甲子旬空戌亥, 甲戌旬空申酉, 甲申旬空午未,
 * 甲午旬空辰巳, 甲辰旬空寅卯, 甲寅旬空子丑.
 */
function xunOf(ganIdx, chiIdx) {
    const idx60 = sexagenaryIndex(ganIdx, chiIdx);
    const start = idx60 - (idx60 % 10);
    const headChi = start % 12;
    const XUN_NAMES = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'];
    return {
        headGan: 0, // 甲
        headChi: headChi,
        name: XUN_NAMES[start / 10] || ('Tuần ' + (start / 10 + 1)),
        start: start,
        emptyBranches: [(headChi + 10) % 12, (headChi + 11) % 12]
    };
}

module.exports = {
    STEMS, BRANCHES, BRANCH_PALACE, TOMB_BRANCH, HORSE_BY_GROUP, TRIPLE_HARMONY,
    horseBranchOf, sexagenaryIndex, xunOf
};
