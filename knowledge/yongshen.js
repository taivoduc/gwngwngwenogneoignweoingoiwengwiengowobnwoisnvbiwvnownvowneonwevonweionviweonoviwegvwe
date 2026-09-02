'use strict';
/**
 * knowledge/yongshen.js — Dụng thần: chi tiết ánh xạ loại câu hỏi → Dụng thần.
 *
 * Mỗi mục: { kind, id?, role?, label, rationale, source, confidence }.
 * Resolver (lib/yongShenResolver.js) sẽ "chạm" các ref này vào chart thực tế.
 */
const YONGSHEN_MAP = {
    CAREER: {
        primary: [
            { kind: 'DOOR', id: 'KHAI', label: 'Khai Môn', rationale: 'Khai Môn chủ công danh, sự nghiệp, khai sáng.' },
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can tượng trưng cho người hỏi (tự thân).' }
        ],
        secondary: [
            { kind: 'CHARTSYMBOL', role: 'zhiFu', label: 'Trực Phù', rationale: 'Trực Phù = người đứng đầu, cấp trên, quý nhân.' },
            { kind: 'PALACE', id: 6, label: 'Cung Càn', rationale: 'Càn = công danh, quyền uy, người cha.' }
        ]
    },
    WEALTH: {
        primary: [
            { kind: 'DOOR', id: 'SINH', label: 'Sinh Môn', rationale: 'Sinh Môn chủ tài lộc, sinh khí, lợi nhuận.' },
            { kind: 'STAR', id: 'TIAN_REN', label: 'Thiên Nhậm', rationale: 'Thiên Nhậm chủ đất đai, bất động sản, gánh vác.' }
        ],
        secondary: [
            { kind: 'CHARTSYMBOL', role: 'zhiFu', label: 'Trực Phù', rationale: 'Trực Phù = chủ sự, nguồn lực chính.' },
            { kind: 'DEITY', id: 'TAI_YIN', label: 'Thái Âm', rationale: 'Thái Âm = tiền ngầm, quỹ kín, mưu kế.' }
        ]
    },
    BUSINESS: {
        primary: [
            { kind: 'DOOR', id: 'SINH', label: 'Sinh Môn', rationale: 'Sinh Môn = lợi nhuận, phát triển.' },
            { kind: 'DOOR', id: 'KHAI', label: 'Khai Môn', rationale: 'Khai Môn = mở mang, khai trương.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = người hỏi.' },
            { kind: 'CHARTSYMBOL', role: 'zhiShi', label: 'Trực Sử', rationale: 'Trực Sử = việc đang tiến hành.' }
        ]
    },
    INVESTMENT: {
        primary: [
            { kind: 'DOOR', id: 'SINH', label: 'Sinh Môn', rationale: 'Sinh Môn = sinh lời.' },
            { kind: 'STAR', id: 'TIAN_FU', label: 'Thiên Phụ', rationale: 'Thiên Phụ = vốn liếng, đầu tư khôn ngoan.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = người hỏi.' },
            { kind: 'DEITY', id: 'TAI_YIN', label: 'Thái Âm', rationale: 'Thái Âm = vốn ngầm, kế hoạch kín.' }
        ]
    },
    MARRIAGE: {
        primary: [
            { kind: 'DEITY', id: 'LIU_HE', label: 'Lục Hợp', rationale: 'Lục Hợp = hôn nhân, kết duyên, hòa hợp.' },
            { kind: 'DOOR', id: 'HƯU', label: 'Hưu Môn', rationale: 'Hưu Môn = bến đỗ, gia đình ổn định.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = bản thân.' },
            { kind: 'PALACE', id: 1, label: 'Cung Khảm', rationale: 'Khảm = gia đình, nước, sự lưu thông tình cảm.' }
        ]
    },
    LOVE: {
        primary: [
            { kind: 'DEITY', id: 'LIU_HE', label: 'Lục Hợp', rationale: 'Lục Hợp = gắn kết tình cảm.' },
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = bản thân.' }
        ],
        secondary: [
            { kind: 'DOOR', id: 'HƯU', label: 'Hưu Môn', rationale: 'Hưu Môn = yên bình, bến đỗ.' },
            { kind: 'PALACE', id: 9, label: 'Cung Ly', rationale: 'Ly = tình cảm nồng nhiệt, dễ nóng vội.' }
        ]
    },
    HEALTH: {
        primary: [
            { kind: 'STAR', id: 'TIAN_XIN', label: 'Thiên Tâm', rationale: 'Thiên Tâm = y thuật, chữa bệnh.' },
            { kind: 'DOOR', id: 'HƯU', label: 'Hưu Môn', rationale: 'Hưu Môn = nghỉ ngơi, hồi phục.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = cơ thể người hỏi.' },
            { kind: 'STAR', id: 'TIAN_RUI', label: 'Thiên Nhuế', rationale: 'Thiên Nhuế = bệnh tật (điểm cần chú ý).' }
        ]
    },
    LITIGATION: {
        primary: [
            { kind: 'DOOR', id: 'KINH', label: 'Kinh Môn', rationale: 'Kinh Môn = thị phi, tranh chấp.' },
            { kind: 'DEITY', id: 'BAI_HU', label: 'Bạch Hổ', rationale: 'Bạch Hổ = hung hăng, xung đột.' }
        ],
        secondary: [
            { kind: 'CHARTSYMBOL', role: 'zhiFu', label: 'Trực Phù', rationale: 'Trực Phù = pháp lý, quyền lực.' },
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = bản thân.' }
        ]
    },
    TRAVEL: {
        primary: [
            { kind: 'DOOR', id: 'KHAI', label: 'Khai Môn', rationale: 'Khai Môn = mở đường, đi xa.' },
            { kind: 'STAR', id: 'TIAN_CHONG', label: 'Thiên Xung', rationale: 'Thiên Xung = di chuyển, động.' }
        ],
        secondary: [
            { kind: 'CHARTSYMBOL', role: 'zhiShi', label: 'Trực Sử', rationale: 'Trực Sử = hành trình.' },
            { kind: 'PALACE', id: 3, label: 'Cung Chấn', rationale: 'Chấn = động, chuyển dịch.' }
        ]
    },
    LOST_OBJECT: {
        primary: [
            { kind: 'CHARTSYMBOL', role: 'zhiShi', label: 'Trực Sử', rationale: 'Trực Sử = sự việc, vật thể.' },
            { kind: 'STEM', role: 'hourStem', label: 'Thời can', rationale: 'Thời can = sự việc đang xảy ra.' }
        ],
        secondary: [
            { kind: 'DEITY', id: 'XUAN_WU', label: 'Huyền Vũ', rationale: 'Huyền Vũ = mất mát, che giấu.' },
            { kind: 'PALACE', id: 4, label: 'Cung Tốn', rationale: 'Tốn = góc khuất, nơi ít người để ý.' }
        ]
    },
    SAFETY: {
        primary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = bản thân.' },
            { kind: 'DEITY', id: 'JIU_DI', label: 'Cửu Địa', rationale: 'Cửu Địa = ẩn nấp, an toàn, tích lũy.' }
        ],
        secondary: [
            { kind: 'DOOR', id: 'HƯU', label: 'Hưu Môn', rationale: 'Hưu Môn = bình an.' },
            { kind: 'PALACE', id: 1, label: 'Cung Khảm', rationale: 'Khảm = hiểm nguy tiềm ẩn (cần chú ý).' }
        ]
    },
    STUDY: {
        primary: [
            { kind: 'STAR', id: 'TIAN_FU', label: 'Thiên Phụ', rationale: 'Thiên Phụ = thầy dạy, học hành.' },
            { kind: 'DOOR', id: 'ĐỖ', label: 'Đỗ Môn', rationale: 'Đỗ Môn = tập trung, tu dưỡng.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = bản thân.' },
            { kind: 'PALACE', id: 4, label: 'Cung Tốn', rationale: 'Tốn = học hành, tin tức.' }
        ]
    },
    EXAM: {
        primary: [
            { kind: 'STAR', id: 'TIAN_FU', label: 'Thiên Phụ', rationale: 'Thiên Phụ = văn chương, thầy.' },
            { kind: 'DOOR', id: 'CẢNH', label: 'Cảnh Môn', rationale: 'Cảnh Môn = danh tiếng, thi cử.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = thí sinh.' },
            { kind: 'PALACE', id: 9, label: 'Cung Ly', rationale: 'Ly = văn minh, nổi bật.' }
        ]
    },
    JOB_INTERVIEW: {
        primary: [
            { kind: 'DOOR', id: 'KHAI', label: 'Khai Môn', rationale: 'Khai Môn = sự nghiệp, cơ hội.' },
            { kind: 'DEITY', id: 'ZHI_FU', label: 'Trực Phù', rationale: 'Trực Phù = cấp trên, người quyết định.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = ứng viên.' },
            { kind: 'PALACE', id: 6, label: 'Cung Càn', rationale: 'Càn = cơ quan, quyền uy.' }
        ]
    },
    PARTNERSHIP: {
        primary: [
            { kind: 'DEITY', id: 'LIU_HE', label: 'Lục Hợp', rationale: 'Lục Hợp = hợp tác, kết giao.' },
            { kind: 'DOOR', id: 'KHAI', label: 'Khai Môn', rationale: 'Khai Môn = mở quan hệ.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = bản thân.' },
            { kind: 'CHARTSYMBOL', role: 'zhiShi', label: 'Trực Sử', rationale: 'Trực Sử = thỏa thuận, giao dịch.' }
        ]
    },
    REAL_ESTATE: {
        primary: [
            { kind: 'STAR', id: 'TIAN_REN', label: 'Thiên Nhậm', rationale: 'Thiên Nhậm = đất đai, bất động sản.' },
            { kind: 'PALACE', id: 8, label: 'Cung Cấn', rationale: 'Cấn = núi, đất, tích trữ.' }
        ],
        secondary: [
            { kind: 'DOOR', id: 'SINH', label: 'Sinh Môn', rationale: 'Sinh Môn = tài lộc.' },
            { kind: 'DEITY', id: 'JIU_DI', label: 'Cửu Địa', rationale: 'Cửu Địa = đất, tích lũy.' }
        ]
    },
    PROJECT: {
        primary: [
            { kind: 'CHARTSYMBOL', role: 'zhiShi', label: 'Trực Sử', rationale: 'Trực Sử = việc đang tiến hành.' },
            { kind: 'STEM', role: 'hourStem', label: 'Thời can', rationale: 'Thời can = sự việc hiện tại.' }
        ],
        secondary: [
            { kind: 'DOOR', id: 'SINH', label: 'Sinh Môn', rationale: 'Sinh Môn = sự phát triển của dự án.' },
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = người thực hiện.' }
        ]
    },
    COMPETITION: {
        primary: [
            { kind: 'DOOR', id: 'KHAI', label: 'Khai Môn', rationale: 'Khai Môn = đường tiến thân.' },
            { kind: 'DEITY', id: 'BAI_HU', label: 'Bạch Hổ', rationale: 'Bạch Hổ = đối thủ, xung đột.' }
        ],
        secondary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = bản thân.' },
            { kind: 'CHARTSYMBOL', role: 'zhiFu', label: 'Trực Phù', rationale: 'Trực Phù = người đứng đầu.' }
        ]
    },
    GENERAL: {
        primary: [
            { kind: 'STEM', role: 'dayStem', label: 'Nhật can', rationale: 'Nhật can = bản thân.' },
            { kind: 'CHARTSYMBOL', role: 'zhiFu', label: 'Trực Phù', rationale: 'Trực Phù = chủ sự.' }
        ],
        secondary: [
            { kind: 'CHARTSYMBOL', role: 'zhiShi', label: 'Trực Sử', rationale: 'Trực Sử = việc.' },
            { kind: 'DOOR', id: 'SINH', label: 'Sinh Môn', rationale: 'Sinh Môn = vận khí chung.' }
        ]
    }
};

// Nguồn chung cho toàn bộ ánh xạ Dụng thần (audit).
const SOURCE = {
    sourceType: 'PROJECT_RULE',
    school: 'CURRENT_PROJECT',
    confidence: 'SCHOOL_DEPENDENT',
    notes: 'Ánh xạ Dụng thần xây theo kiến thức phổ thông; chưa có citation cổ thư cho từng loại câu hỏi. KHÔNG coi là chân lý tuyệt đối.'
};

module.exports = { YONGSHEN_MAP, SOURCE };
