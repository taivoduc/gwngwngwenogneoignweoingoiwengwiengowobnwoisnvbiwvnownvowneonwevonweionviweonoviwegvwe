'use strict';
/**
 * knowledge/stars.js — Cửu tinh (9 sao).
 *
 * intrinsicElement: ngũ hành CỐ HỮU của sao (bất biến, theo TINH_LUAN).
 * LƯU Ý: ngũ hành này KHÔNG đổi theo cung nơi sao đang đóng
 * (ví dụ Thiên Tâm = Kim dù đang rơi vào Chấn = Mộc).
 */
const STARS = [
    { id: 'TIAN_PENG', nameZh: '天蓬', nameVi: 'Thiên Bồng', element: 'Thủy', nature: 'OMINOUS',
      symbolism: 'đại hung: hiểm nguy, trộm cướp, mưu đồ đen tối; hợp buôn bán đường thủy' },
    { id: 'TIAN_RUI', nameZh: '天芮', nameVi: 'Thiên Nhuế', element: 'Thổ', nature: 'OMINOUS',
      symbolism: 'chủ bệnh tật, tu đạo, học hành; hung về sức khỏe, tốt cho nghiên cứu tâm linh' },
    { id: 'TIAN_CHONG', nameZh: '天沖', nameVi: 'Thiên Xung', element: 'Mộc', nature: 'NEUTRAL',
      symbolism: 'chủ xung động, nhanh chóng, quân sự, thể thao; thiên về hành động, di chuyển' },
    { id: 'TIAN_FU', nameZh: '天輔', nameVi: 'Thiên Phụ', element: 'Mộc', nature: 'AUSPICIOUS',
      symbolism: 'chủ văn chương, học hành, thầy dạy; cát về giáo dục, thi cử, cố vấn' },
    { id: 'TIAN_QIN', nameZh: '天禽', nameVi: 'Thiên Cầm', element: 'Thổ', nature: 'AUSPICIOUS',
      symbolism: 'sao trung cung, chủ trung dung, điều hòa, ổn định' },
    { id: 'TIAN_XIN', nameZh: '天心', nameVi: 'Thiên Tâm', element: 'Kim', nature: 'AUSPICIOUS',
      symbolism: 'chủ y thuật, cứu giúp, chữa bệnh; cát về y tế, từ thiện' },
    { id: 'TIAN_ZHU', nameZh: '天柱', nameVi: 'Thiên Trụ', element: 'Kim', nature: 'OMINOUS',
      symbolism: 'chủ phá hoại, đổ vỡ, hư hại; hợp việc phá bỏ, sửa chữa' },
    { id: 'TIAN_REN', nameZh: '天任', nameVi: 'Thiên Nhậm', element: 'Thổ', nature: 'AUSPICIOUS',
      symbolism: 'chủ gánh vác, trách nhiệm, nông nghiệp, bất động sản; cát về xây dựng, đất đai' },
    { id: 'TIAN_YING', nameZh: '天英', nameVi: 'Thiên Anh', element: 'Hỏa', nature: 'NEUTRAL',
      symbolism: 'chủ văn minh, lửa, danh tiếng; cát về thi cử, quảng bá; dễ thị phi, tai nạn lửa' }
];

const BY_NAME = {};
STARS.forEach(function (s) { BY_NAME[s.nameVi] = s; });

module.exports = { STARS, BY_NAME };
