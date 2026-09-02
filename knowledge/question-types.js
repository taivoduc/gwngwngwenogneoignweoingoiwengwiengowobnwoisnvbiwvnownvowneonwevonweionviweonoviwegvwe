'use strict';
/**
 * knowledge/question-types.js — Bản thể học câu hỏi (Question Ontology).
 *
 * MỖI câu hỏi → một loại → một bộ Dụng thần + các biểu tượng liên quan.
 * KHÔNG luận một lá số giống nhau cho mọi câu hỏi.
 *
 * LƯU Ý TRUNG THỰC: Dụng thần của Kỳ Môn có nhiều trường phái. Các ánh xạ dưới đây
 * là QUY ƯỚC CỦA PROJECT (PROJECT_RULE), được xây từ kiến thức phổ thông,
 * có `school` + `confidence` để audit. KHÔNG tự xưng là chân lý cổ thư.
 *
 * YongShen ref: { kind: 'DOOR'|'STAR'|'DEITY'|'PALACE'|'STEM'|'CHARTSYMBOL', id?: tên cụ thể, role?: 'dayStem'|'hourStem'|'zhiFu' }
 *   - 'STEM' role dayStem = Nhật can (tự thân), hourStem = Thời can (sự việc)
 *   - 'CHARTSYMBOL' role zhiFu = cung Trực Phù (值符), zhiShi = cung Trực Sử (值使)
 */

// Các dimension tổng hợp (xem interpretationSynthesizer.js).
const DIMENSIONS = ['career', 'wealth', 'relationship', 'health', 'travel', 'litigation', 'safety', 'study'];

const QUESTION_TYPES = [
    {
        id: 'CAREER', nameVi: 'Công danh / Sự nghiệp', emoji: '💼',
        dimensions: ['career'],
        primaryYongShen: [{ kind: 'DOOR', id: 'KHAI' }, { kind: 'STEM', role: 'dayStem' }],
        secondaryYongShen: [{ kind: 'CHARTSYMBOL', role: 'zhiFu' }, { kind: 'PALACE', id: 6 }],
        relevantDoors: ['KHAI', 'SINH', 'ĐỖ', 'KINH'],
        relevantStars: ['TIAN_FU', 'TIAN_XIN', 'TIAN_REN'],
        relevantDeities: ['ZHI_FU', 'JIU_TIAN'],
        relevantPalaces: [6, 9],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'MEN_PO', 'KONG_WANG'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Khai Môn = sự nghiệp, công danh; Nhật can = tự thân.'
    },
    {
        id: 'WEALTH', nameVi: 'Tài lộc', emoji: '💰',
        dimensions: ['wealth'],
        primaryYongShen: [{ kind: 'DOOR', id: 'SINH' }, { kind: 'STAR', id: 'TIAN_REN' }],
        secondaryYongShen: [{ kind: 'CHARTSYMBOL', role: 'zhiFu' }, { kind: 'DEITY', id: 'TAI_YIN' }],
        relevantDoors: ['SINH', 'KHAI', 'THƯƠNG', 'TỬ'],
        relevantStars: ['TIAN_REN', 'TIAN_FU'],
        relevantDeities: ['TAI_YIN', 'JIU_DI', 'XUAN_WU'],
        relevantPalaces: [8, 2],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'KONG_WANG', 'RU_MU'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Sinh Môn = tài lộc; Thiên Nhậm = đất đai, bất động sản.'
    },
    {
        id: 'BUSINESS', nameVi: 'Kinh doanh', emoji: '🏪',
        dimensions: ['wealth', 'career'],
        primaryYongShen: [{ kind: 'DOOR', id: 'SINH' }, { kind: 'DOOR', id: 'KHAI' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'CHARTSYMBOL', role: 'zhiShi' }],
        relevantDoors: ['SINH', 'KHAI', 'CẢNH', 'ĐỖ'],
        relevantStars: ['TIAN_REN', 'TIAN_FU', 'TIAN_YING'],
        relevantDeities: ['LIU_HE', 'TAI_YIN'],
        relevantPalaces: [8, 6, 4],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'MEN_PO'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Kinh doanh: Sinh (lợi), Khai (mở mang), Lục Hợp (hợp tác).'
    },
    {
        id: 'INVESTMENT', nameVi: 'Đầu tư', emoji: '📈',
        dimensions: ['wealth'],
        primaryYongShen: [{ kind: 'DOOR', id: 'SINH' }, { kind: 'STAR', id: 'TIAN_FU' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'DEITY', id: 'TAI_YIN' }],
        relevantDoors: ['SINH', 'KHAI', 'TỬ', 'THƯƠNG'],
        relevantStars: ['TIAN_FU', 'TIAN_REN', 'TIAN_ZHU'],
        relevantDeities: ['TAI_YIN', 'JIU_DI', 'XUAN_WU'],
        relevantPalaces: [8, 2],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'KONG_WANG', 'RU_MU', 'FAN_YIN'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Cẩn trọng: Tử/Thương + Huyền Vũ = rủi ro mất vốn.'
    },
    {
        id: 'MARRIAGE', nameVi: 'Hôn nhân', emoji: '❤️',
        dimensions: ['relationship'],
        primaryYongShen: [{ kind: 'DEITY', id: 'LIU_HE' }, { kind: 'DOOR', id: 'HƯU' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'PALACE', id: 1 }],
        relevantDoors: ['HƯU', 'SINH', 'KINH', 'TỬ'],
        relevantStars: ['TIAN_FU', 'TIAN_RUI'],
        relevantDeities: ['LIU_HE', 'ZHI_FU', 'TENG_SHE'],
        relevantPalaces: [1, 2],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'KONG_WANG'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Lục Hợp = hôn nhân; Hưu Môn = bến đỗ bình yên.'
    },
    {
        id: 'LOVE', nameVi: 'Tình cảm', emoji: '💕',
        dimensions: ['relationship'],
        primaryYongShen: [{ kind: 'DEITY', id: 'LIU_HE' }, { kind: 'STEM', role: 'dayStem' }],
        secondaryYongShen: [{ kind: 'DOOR', id: 'HƯU' }, { kind: 'PALACE', id: 9 }],
        relevantDoors: ['HƯU', 'SINH', 'CẢNH', 'KINH'],
        relevantStars: ['TIAN_YING', 'TIAN_FU'],
        relevantDeities: ['LIU_HE', 'TENG_SHE', 'BAI_HU'],
        relevantPalaces: [9, 1],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Tình cảm: Lục Hợp (gắn kết), Đằng Xà (mơ hồ), Bạch Hổ (xung đột).'
    },
    {
        id: 'HEALTH', nameVi: 'Sức khỏe', emoji: '🏥',
        dimensions: ['health', 'safety'],
        primaryYongShen: [{ kind: 'STAR', id: 'TIAN_XIN' }, { kind: 'DOOR', id: 'HƯU' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'STAR', id: 'TIAN_RUI' }],
        relevantDoors: ['HƯU', 'THƯƠNG', 'TỬ'],
        relevantStars: ['TIAN_XIN', 'TIAN_RUI', 'TIAN_PENG'],
        relevantDeities: ['JIU_DI', 'BAI_HU'],
        relevantPalaces: [1, 7],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'RU_MU'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Thiên Tâm = y thuật; Thiên Nhuế = bệnh tật. KHÔNG thay tư vấn y tế.'
    },
    {
        id: 'LITIGATION', nameVi: 'Kiện tụng / Tranh chấp', emoji: '⚖️',
        dimensions: ['litigation'],
        primaryYongShen: [{ kind: 'DOOR', id: 'KINH' }, { kind: 'DEITY', id: 'BAI_HU' }],
        secondaryYongShen: [{ kind: 'CHARTSYMBOL', role: 'zhiFu' }, { kind: 'STEM', role: 'dayStem' }],
        relevantDoors: ['KINH', 'THƯƠNG', 'KHAI'],
        relevantStars: ['TIAN_ZHU', 'TIAN_PENG'],
        relevantDeities: ['BAI_HU', 'GOU_CHEN', 'ZHU_QUE'],
        relevantPalaces: [7, 3],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'MEN_PO'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Kinh Môn + Bạch Hổ = tranh chấp; Khai Môn = hòa giải.'
    },
    {
        id: 'TRAVEL', nameVi: 'Đi lại / Xuất hành', emoji: '✈️',
        dimensions: ['travel', 'safety'],
        primaryYongShen: [{ kind: 'DOOR', id: 'KHAI' }, { kind: 'STAR', id: 'TIAN_CHONG' }],
        secondaryYongShen: [{ kind: 'CHARTSYMBOL', role: 'zhiShi' }, { kind: 'PALACE', id: 3 }],
        relevantDoors: ['KHAI', 'HƯU', 'THƯƠNG', 'ĐỖ'],
        relevantStars: ['TIAN_CHONG', 'TIAN_FU', 'TIAN_PENG'],
        relevantDeities: ['JIU_TIAN', 'BAI_HU'],
        relevantPalaces: [3, 6],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YI_MA', 'KONG_WANG'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Khai = mở đường; Thiên Xung = di chuyển; Mã tinh = động.'
    },
    {
        id: 'LOST_OBJECT', nameVi: 'Tìm đồ thất lạc', emoji: '🔍',
        dimensions: ['general'],
        primaryYongShen: [{ kind: 'CHARTSYMBOL', role: 'zhiShi' }, { kind: 'STEM', role: 'hourStem' }],
        secondaryYongShen: [{ kind: 'DEITY', id: 'XUAN_WU' }, { kind: 'PALACE', id: 4 }],
        relevantDoors: ['ĐỖ', 'HƯU', 'TỬ'],
        relevantStars: ['TIAN_FU', 'TIAN_PENG'],
        relevantDeities: ['XUAN_WU', 'JIU_DI'],
        relevantPalaces: [4, 2, 1],
        interpretationRules: ['KONG_WANG', 'YI_MA', 'YONG_SHEN_SUPPORT'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Đỗ Môn = che giấu; Hưu = nơi yên tĩnh; Không vong = khó tìm.'
    },
    {
        id: 'SAFETY', nameVi: 'An toàn', emoji: '🛡️',
        dimensions: ['safety'],
        primaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'DEITY', id: 'JIU_DI' }],
        secondaryYongShen: [{ kind: 'DOOR', id: 'HƯU' }, { kind: 'PALACE', id: 1 }],
        relevantDoors: ['HƯU', 'KHAI', 'KINH', 'TỬ'],
        relevantStars: ['TIAN_XIN', 'TIAN_PENG', 'TIAN_ZHU'],
        relevantDeities: ['JIU_DI', 'BAI_HU', 'XUAN_WU'],
        relevantPalaces: [1, 6],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'MEN_PO'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Kinh/Bạch Hổ/Thiên Bồng = nguy hiểm tiềm ẩn.'
    },
    {
        id: 'STUDY', nameVi: 'Học hành', emoji: '📚',
        dimensions: ['study'],
        primaryYongShen: [{ kind: 'STAR', id: 'TIAN_FU' }, { kind: 'DOOR', id: 'ĐỖ' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'PALACE', id: 4 }],
        relevantDoors: ['ĐỖ', 'CẢNH', 'KHAI'],
        relevantStars: ['TIAN_FU', 'TIAN_YING', 'TIAN_XIN'],
        relevantDeities: ['TAI_YIN', 'JIU_TIAN'],
        relevantPalaces: [4, 9],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Thiên Phụ = thầy dạy, học hành; Đỗ Môn = tập trung.'
    },
    {
        id: 'EXAM', nameVi: 'Thi cử', emoji: '🎓',
        dimensions: ['study', 'career'],
        primaryYongShen: [{ kind: 'STAR', id: 'TIAN_FU' }, { kind: 'DOOR', id: 'CẢNH' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'PALACE', id: 9 }],
        relevantDoors: ['CẢNH', 'KHAI', 'ĐỖ'],
        relevantStars: ['TIAN_FU', 'TIAN_YING'],
        relevantDeities: ['JIU_TIAN', 'TAI_YIN'],
        relevantPalaces: [9, 4],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'RU_MU'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Cảnh Môn = danh tiếng, thi cử; Thiên Anh = văn chương.'
    },
    {
        id: 'JOB_INTERVIEW', nameVi: 'Phỏng vấn / Xin việc', emoji: '🤝',
        dimensions: ['career'],
        primaryYongShen: [{ kind: 'DOOR', id: 'KHAI' }, { kind: 'DEITY', id: 'ZHI_FU' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'PALACE', id: 6 }],
        relevantDoors: ['KHAI', 'SINH', 'ĐỖ'],
        relevantStars: ['TIAN_FU', 'TIAN_XIN', 'TIAN_REN'],
        relevantDeities: ['ZHI_FU', 'LIU_HE', 'JIU_TIAN'],
        relevantPalaces: [6, 9],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'MEN_PO'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Khai + Trực Phù = cấp trên, quý nhân.'
    },
    {
        id: 'PARTNERSHIP', nameVi: 'Hợp tác / Đối tác', emoji: '🤝',
        dimensions: ['relationship', 'wealth'],
        primaryYongShen: [{ kind: 'DEITY', id: 'LIU_HE' }, { kind: 'DOOR', id: 'KHAI' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'CHARTSYMBOL', role: 'zhiShi' }],
        relevantDoors: ['KHAI', 'SINH', 'KINH'],
        relevantStars: ['TIAN_FU', 'TIAN_REN'],
        relevantDeities: ['LIU_HE', 'ZHI_FU', 'TENG_SHE'],
        relevantPalaces: [6, 8],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Lục Hợp = hợp tác; Đằng Xà = đối tác mờ ám.'
    },
    {
        id: 'REAL_ESTATE', nameVi: 'Bất động sản', emoji: '🏠',
        dimensions: ['wealth'],
        primaryYongShen: [{ kind: 'STAR', id: 'TIAN_REN' }, { kind: 'PALACE', id: 8 }],
        secondaryYongShen: [{ kind: 'DOOR', id: 'SINH' }, { kind: 'DEITY', id: 'JIU_DI' }],
        relevantDoors: ['SINH', 'HƯU', 'TỬ'],
        relevantStars: ['TIAN_REN', 'TIAN_FU', 'TIAN_RUI'],
        relevantDeities: ['JIU_DI', 'TAI_YIN'],
        relevantPalaces: [8, 2],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'RU_MU'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Thiên Nhậm + Cấn = đất đai; Cửu Địa = tích trữ.'
    },
    {
        id: 'PROJECT', nameVi: 'Dự án / Công việc đang làm', emoji: '🗂️',
        dimensions: ['career', 'wealth'],
        primaryYongShen: [{ kind: 'CHARTSYMBOL', role: 'zhiShi' }, { kind: 'STEM', role: 'hourStem' }],
        secondaryYongShen: [{ kind: 'DOOR', id: 'SINH' }, { kind: 'STEM', role: 'dayStem' }],
        relevantDoors: ['SINH', 'KHAI', 'ĐỖ', 'TỬ'],
        relevantStars: ['TIAN_REN', 'TIAN_FU', 'TIAN_ZHU'],
        relevantDeities: ['ZHI_FU', 'LIU_HE'],
        relevantPalaces: [8, 6],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'FAN_YIN'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Trực Sử = việc đang tiến hành; Thời can = sự việc.'
    },
    {
        id: 'COMPETITION', nameVi: 'Cạnh tranh / Thi đua', emoji: '🏆',
        dimensions: ['career', 'litigation'],
        primaryYongShen: [{ kind: 'DOOR', id: 'KHAI' }, { kind: 'DEITY', id: 'BAI_HU' }],
        secondaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'CHARTSYMBOL', role: 'zhiFu' }],
        relevantDoors: ['KHAI', 'THƯƠNG', 'KINH'],
        relevantStars: ['TIAN_CHONG', 'TIAN_YING', 'TIAN_ZHU'],
        relevantDeities: ['BAI_HU', 'ZHI_FU', 'JIU_TIAN'],
        relevantPalaces: [3, 9],
        interpretationRules: ['DOOR_PALACE_GENERATION', 'YONG_SHEN_SUPPORT', 'MEN_PO'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Thiên Xung = xung đột; Bạch Hổ = đối thủ mạnh.'
    },
    {
        id: 'GENERAL', nameVi: 'Tổng quát / Việc chung', emoji: '🔮',
        dimensions: ['general'],
        primaryYongShen: [{ kind: 'STEM', role: 'dayStem' }, { kind: 'CHARTSYMBOL', role: 'zhiFu' }],
        secondaryYongShen: [{ kind: 'CHARTSYMBOL', role: 'zhiShi' }, { kind: 'DOOR', id: 'SINH' }],
        relevantDoors: [],
        relevantStars: [],
        relevantDeities: [],
        relevantPalaces: [],
        interpretationRules: ['DOOR_PALACE_GENERATION'],
        school: 'CURRENT_PROJECT', confidence: 'SCHOOL_DEPENDENT', notes: 'Loại mặc định khi không xác định được câu hỏi.'
    }
];

const BY_ID = {};
QUESTION_TYPES.forEach(function (q) { BY_ID[q.id] = q; });

module.exports = { QUESTION_TYPES, BY_ID, DIMENSIONS };
