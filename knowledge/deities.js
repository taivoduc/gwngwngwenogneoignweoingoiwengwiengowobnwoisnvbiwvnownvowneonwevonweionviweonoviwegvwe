'use strict';
/**
 * knowledge/deities.js — Bát Thần (8 thần) + 2 thần của biến thể YIN_YANG_SWAP.
 *
 * element theo THAN_HANH hiện có trong project.
 * variant: 'FIXED' (mặc định project, khớp atopx/qimen) | 'YIN_YANG_SWAP'
 * (Câu Trần/Chu Tước thay Bạch Hổ/Huyền Vũ ở Dương độn — school-dependent,
 * xem docs/QIMEN_RULE_CONFLICTS.md CONFLICT-002).
 */
const DEITIES = [
    { id: 'ZHI_FU', nameZh: '值符', nameVi: 'Trực Phù', element: 'Thổ', nature: 'AUSPICIOUS', variant: 'FIXED',
      symbolism: 'thần đứng đầu: chỉ huy, quyền lực, người lãnh đạo' },
    { id: 'TENG_SHE', nameZh: '螣蛇', nameVi: 'Đằng Xà', element: 'Hỏa', nature: 'OMINOUS', variant: 'FIXED',
      symbolism: 'thần hư ảo, lừa dối, mơ hồ; dễ gặp chuyện mờ ám' },
    { id: 'TAI_YIN', nameZh: '太陰', nameVi: 'Thái Âm', element: 'Kim', nature: 'AUSPICIOUS', variant: 'FIXED',
      symbolism: 'thần âm thầm, bí mật, mưu kế ngầm; tốt cho kế hoạch dài hạn' },
    { id: 'LIU_HE', nameZh: '六合', nameVi: 'Lục Hợp', element: 'Mộc', nature: 'AUSPICIOUS', variant: 'FIXED',
      symbolism: 'thần hợp tác, đoàn kết, hôn nhân, giao tiếp' },
    { id: 'BAI_HU', nameZh: '白虎', nameVi: 'Bạch Hổ', element: 'Kim', nature: 'OMINOUS', variant: 'FIXED',
      symbolism: 'thần hung hăng, tai nạn, binh đao, chấn thương' },
    { id: 'XUAN_WU', nameZh: '玄武', nameVi: 'Huyền Vũ', element: 'Thủy', nature: 'OMINOUS', variant: 'FIXED',
      symbolism: 'thần trộm cắp, lừa gạt, mờ ám; dễ hao hụt tài sản' },
    { id: 'JIU_DI', nameZh: '九地', nameVi: 'Cửu Địa', element: 'Thổ', nature: 'AUSPICIOUS', variant: 'FIXED',
      symbolism: 'thần đất: thấp kín, ẩn nấp, kiên nhẫn; tốt cho tích lũy' },
    { id: 'JIU_TIAN', nameZh: '九天', nameVi: 'Cửu Thiên', element: 'Kim', nature: 'AUSPICIOUS', variant: 'FIXED',
      symbolism: 'thần trời: cao xa, mở rộng, năng động; tốt cho thăng tiến, đi xa' },
    // Biến thể YIN_YANG_SWAP (Dương độn dùng 2 thần này thay Bạch Hổ/Huyền Vũ).
    { id: 'GOU_CHEN', nameZh: '勾陳', nameVi: 'Câu Trần', element: 'Thổ', nature: 'OMINOUS', variant: 'YIN_YANG_SWAP',
      symbolism: 'thần tranh chấp, kiện tụng, đất đai, trì trệ' },
    { id: 'ZHU_QUE', nameZh: '朱雀', nameVi: 'Chu Tước', element: 'Hỏa', nature: 'OMINOUS', variant: 'YIN_YANG_SWAP',
      symbolism: 'thần thị phi, lời nói, tin tức, văn thư' }
];

const BY_NAME = {};
DEITIES.forEach(function (d) { BY_NAME[d.nameVi] = d; });

module.exports = { DEITIES, BY_NAME };
