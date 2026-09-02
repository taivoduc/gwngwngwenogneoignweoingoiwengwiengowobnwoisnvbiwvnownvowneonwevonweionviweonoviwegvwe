'use strict';
/**
 * knowledge/doors.js — Bát Môn (8 cửa).
 *
 * intrinsicElement: ngũ hành CỐ HỮU của môn (bất biến, theo MON_LUAN).
 * classicalNature : phân loại lành/dữ theo truyền thống (吉/平/凶) — nguồn
 *                   phổ thông, school-dependent nhẹ.
 * projectNature   : phân loại đang dùng trong project (MON_TOT/MON_XAU) —
 *                   HEURISTIC, chỉ để đối chiếu, KHÔNG phải chân lý.
 * homePalace      : cung bản vị (Hưu=Khảm, Sinh=Cấn, ...).
 */
const DOORS = [
    { id: 'HƯU',  nameZh: '休門', nameVi: 'Hưu',  element: 'Thủy', classicalNature: 'AUSPICIOUS', projectNature: 'GOOD', homePalace: 1,
      symbolism: 'cửa nghỉ ngơi, an dưỡng, hồi phục; bình an nhưng thiếu tiến công',
      advice: { do: 'Nghỉ ngơi, dưỡng bệnh, cầu an', dont: 'Đầu tư lớn, xuất hành xa' } },
    { id: 'SINH', nameZh: '生門', nameVi: 'Sinh',  element: 'Thổ', classicalNature: 'AUSPICIOUS', projectNature: 'GOOD', homePalace: 8,
      symbolism: 'cửa cát bậc nhất: sinh khí, phát triển, tài lộc, khởi sự',
      advice: { do: 'Khởi công, cầu tài, ký kết, khai trương', dont: 'Kiện tụng, tang chế, đào huyệt' } },
    { id: 'THƯƠNG', nameZh: '傷門', nameVi: 'Thương', element: 'Mộc', classicalNature: 'OMINOUS', projectNature: 'BAD', homePalace: 3,
      symbolism: 'cửa tổn thương, tai nạn, bệnh tật; khí hung, hao tổn',
      advice: { do: 'Điều trị, sửa chữa, thanh tẩy', dont: 'Khởi công, kết hôn, xuất hành' } },
    { id: 'ĐỖ',  nameZh: '杜門', nameVi: 'Đỗ',    element: 'Mộc', classicalNature: 'NEUTRAL', projectNature: 'BAD', homePalace: 4,
      symbolism: 'cửa bế tắc, che giấu, ẩn nấp; hợp ẩn dật, tu dưỡng, giữ bí mật',
      advice: { do: 'Học tập, nghiên cứu, lên kế hoạch', dont: 'Ký kết, quyết định lớn, xuất hành' } },
    { id: 'CẢNH', nameZh: '景門', nameVi: 'Cảnh',  element: 'Hỏa', classicalNature: 'NEUTRAL', projectNature: 'BAD', homePalace: 9,
      symbolism: 'cửa danh tiếng, ánh sáng, văn minh; nổi bật nhưng dễ thị phi',
      advice: { do: 'Quảng bá, thi cử, trình diễn', dont: 'Ẩn mình, việc mờ ám' } },
    { id: 'TỬ',  nameZh: '死門', nameVi: 'Tử',    element: 'Thổ', classicalNature: 'OMINOUS', projectNature: 'BAD', homePalace: 2,
      symbolism: 'cửa tử khí, kết thúc, mất mát; chỉ hợp việc kết thúc, dọn dẹp',
      advice: { do: 'Kết thúc dự án cũ, thanh lý, từ bỏ thói quen xấu', dont: 'Khởi sự, đầu tư, kết hôn' } },
    { id: 'KINH', nameZh: '驚門', nameVi: 'Kinh',  element: 'Kim', classicalNature: 'OMINOUS', projectNature: 'BAD', homePalace: 7,
      symbolism: 'cửa kinh hãi, bất an, thị phi, trộm cướp',
      advice: { do: 'Cảnh giác, bảo vệ tài sản', dont: 'Tin người lạ, ký giấy tờ, xuất hành đêm' } },
    { id: 'KHAI', nameZh: '開門', nameVi: 'Khai',  element: 'Kim', classicalNature: 'AUSPICIOUS', projectNature: 'GOOD', homePalace: 6,
      symbolism: 'cửa khai sáng, mở mang: công danh, sự nghiệp, quý nhân',
      advice: { do: 'Khai trương, xin việc, gặp gỡ đối tác, du lịch', dont: 'Cãi cọ, động thổ, việc mờ ám' } }
];

const BY_NAME = {};
DOORS.forEach(function (d) { BY_NAME[d.nameVi] = d; });

module.exports = { DOORS, BY_NAME };
