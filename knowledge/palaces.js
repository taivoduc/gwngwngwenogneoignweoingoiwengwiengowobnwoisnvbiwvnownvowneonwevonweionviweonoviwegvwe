'use strict';
/**
 * knowledge/palaces.js — 9 cung (Hậu Thiên Bát Quái + Trung cung).
 *
 * element: ngũ hành CỐ HỮU của cung (bất biến).
 * Đây là ngũ hành "gốc" của cung — KHÁC với ngũ hành của sao/môn/thần
 * đang đóng tại cung đó (xem lib/chartNormalizer.js: palace.element vs
 * door.intrinsicElement / star.intrinsicElement).
 *
 * Nguồn: Hậu Thiên Bát Quái chuẩn (Khảm Bắc Thủy, Khôn Tây Nam Thổ, ...).
 */

// id chuẩn hóa theo bát quái (pinyin) + Trung cung.
const PALACES = [
    // { palace (số cung trong QimenBoard 1..9), id, nameZh, nameVi, trigramZh, trigramVi, direction, element, homeDoor }
    { palace: 1, id: 'KAN',  nameZh: '坎', nameVi: 'Khảm', trigramZh: '坎', trigramVi: 'Khảm', direction: 'N',  element: 'Thủy', homeDoor: 'Hưu' },
    { palace: 2, id: 'KUN',  nameZh: '坤', nameVi: 'Khôn', trigramZh: '坤', trigramVi: 'Khôn', direction: 'TN', element: 'Thổ',  homeDoor: 'Tử' },
    { palace: 3, id: 'ZHEN', nameZh: '震', nameVi: 'Chấn', trigramZh: '震', trigramVi: 'Chấn', direction: 'Đ',  element: 'Mộc',  homeDoor: 'Thương' },
    { palace: 4, id: 'XUN',  nameZh: '巽', nameVi: 'Tốn',  trigramZh: '巽', trigramVi: 'Tốn',  direction: 'ĐN', element: 'Mộc',  homeDoor: 'Đỗ' },
    { palace: 5, id: 'CENTER', nameZh: '中', nameVi: 'Trung', trigramZh: '', trigramVi: '', direction: '', element: 'Thổ', homeDoor: null },
    { palace: 6, id: 'QIAN', nameZh: '乾', nameVi: 'Càn',  trigramZh: '乾', trigramVi: 'Càn',  direction: 'TB', element: 'Kim',  homeDoor: 'Khai' },
    { palace: 7, id: 'DUI',  nameZh: '兌', nameVi: 'Đoài', trigramZh: '兌', trigramVi: 'Đoài', direction: 'T',  element: 'Kim',  homeDoor: 'Kinh' },
    { palace: 8, id: 'GEN',  nameZh: '艮', nameVi: 'Cấn',  trigramZh: '艮', trigramVi: 'Cấn',  direction: 'ĐB', element: 'Thổ',  homeDoor: 'Sinh' },
    { palace: 9, id: 'LI',   nameZh: '離', nameVi: 'Ly',   trigramZh: '離', trigramVi: 'Ly',   direction: 'N',  element: 'Hỏa',  homeDoor: 'Cảnh' }
];

// Chú giải cung (nguồn: CUNG_LUAN hiện có trong project — PROJECT_RULE).
const PALACE_LUAN = {
    1: 'Cung Khảm: tượng nước, chủ sự lưu thông, buôn bán, đi xa; cũng chủ lo âu, bệnh thận/tai.',
    2: 'Cung Khôn: tượng đất, mẹ, sự bao dung; chủ gia đình, hôn nhân, bất động sản.',
    3: 'Cung Chấn: tượng sấm sét, khởi động; chủ khởi đầu, chuyển động, quyết đoán.',
    4: 'Cung Tốn: tượng gió, len lỏi; chủ giao tiếp, thương mại, học hành, tin tức.',
    5: 'Trung cung: trung tâm, điều hòa ngũ hành; chủ sự trung dung, ổn định.',
    6: 'Cung Càn: tượng trời, quyền uy; chủ lãnh đạo, cha, công danh, quý nhân.',
    7: 'Cung Đoài: tượng đầm hồ, vui vẻ, lời nói; dễ sinh thị phi, tranh cãi.',
    8: 'Cung Cấn: tượng núi, ngưng đọng; chủ ổn định, bất động sản, tích trữ.',
    9: 'Cung Ly: tượng lửa, văn minh; chủ danh tiếng, thi cử; dễ nóng vội, thị phi.'
};

const BY_PALACE = {};
PALACES.forEach(function (p) { BY_PALACE[p.palace] = p; });

module.exports = { PALACES, PALACE_LUAN, BY_PALACE };
