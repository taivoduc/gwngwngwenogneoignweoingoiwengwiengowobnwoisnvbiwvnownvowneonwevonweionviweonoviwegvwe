# CALCULATION PIPELINE — Pipeline lập bàn Kỳ Môn Thời Gia

Dữ liệu vào (đặc tả mục VI): `năm, tháng, ngày, giờ, timezone, latitude, longitude`.
Dữ liệu ra: `Can Chi năm/tháng/ngày/giờ, tiết khí, Âm/Dương độn, Cục, 9 cung, Tam Kỳ, Lục Nghi, Bát Môn, Cửu Tinh, Bát Thần, Trực Phù, Trực Sử`.

Quy ước: **mỗi bước là một engine riêng**, không phụ thuộc UI. Các bước 5–11 được tách trực tiếp từ prototype `kymon.html` (đã có 1 bảng tham chiếu PASS).

## Luồng tổng thể
```
LOCAL DATETIME → TIMEZONE → UTC TIMESTAMP → LOCATION
  → SOLAR CALCULATION → SOLAR TERM → GANZHI
  → DUN/JU → 三奇六儀 (địa bàn) → TRỰC PHÙ/TRỰC SỬ
  → THIÊN BÀN → CỬU TINH → BÁT MÔN → BÁT THẦN → QIMEN BOARD
```

## Bước 1 — Normalize thời gian (calendar engine)
- Chuyển local datetime + IANA timezone → UTC timestamp (dùng `Intl`/`luxon`).
- Hỗ trợ 3 chế độ giờ (đặc tả mục V):
  - `CIVIL`: giờ hành chính (mặc định hiển thị).
  - `LOCAL_MEAN_SOLAR`: civil + hiệu chỉnh kinh độ `(longitude − meridian) × 4 phút`.
  - `TRUE_SOLAR`: mean solar + phương trình thời gian (EoT).
- Luôn hiển thị rõ `Civil 07:30 / True Solar 07:05` — không che giấu hiệu chỉnh.

## Bước 2 — Solar calculation (astronomy engine)
- Tính `apparentSolarLongitudeDeg` bằng `astronomy-engine` (độ chính xác tốt, có sẵn EoT).
- Kinh độ dùng cho Local Solar Time phải là **kinh độ thực** của người dùng.

## Bước 3 — Solar term (solar term engine)
- 24 tiết khí = hoàng đạo 360° / 24 = 15°. Mốc: `Xuân Phân=0°`, ... `Lập Xuân=315°` (đúng thứ tự bảng `TIET_KHI_LONG` của prototype).
- Tìm thời điểm giao tiết bằng nghiệm của `apparentSolarLongitude(t) = k×15°` (search chính xác, không dùng "ngày 23/8 luôn là Xử Thử").
- Tiết khí hiện tại = tiết có `startUtc ≤ now < endUtc`.
- Xử lý đúng ranh giới: **trước/đúng/sau** thời điểm chuyển tiết (có test riêng).

## Bước 4 — GanZhi (calendar engine)
- **Năm**: `(year−4) mod 10` / `mod 12`; mốc đổi năm theo cấu hình (Lập Xuân / Đông Chí / Tết) — `[NEEDS QIMEN RULE VALIDATION]`.
- **Tháng**: 12 tiết "節" mở tháng (Lập Xuân→tháng Dần...). Can tháng theo **Ngũ Hổ Độn** (năm Can → Can tháng Dần). Mốc chuyển tháng = thời điểm giao tiết "節".
- **Ngày**: `sexagenary = (JDN + 49) mod 60` (prototype đã kiểm chứng 01/10/1949 = Giáp Tý). Mốc đổi ngày 23:00 vs 00:00 — `[NEEDS VALIDATION]`.
- **Giờ**: 12 thời thần (mỗi thần 2 giờ, Tý=23:00–01:00). Can giờ theo **Ngũ Thử Độn** (ngày Can → Can giờ Tý). Vấn đề 早子/晚子 — `[NEEDS VALIDATION]`.

## Bước 5 — Âm/Dương Độn (dun engine)
- Từ Đông Chí → trước Hạ Chí: **Dương Độn**. Từ Hạ Chí → trước Đông Chí: **Âm Độn**.
- Được xác định qua cột `duong` trong bảng Cục (đã có trong `CUC_TRA`).

## Bước 6 — Cục số & Nguyên (dun engine) — `[NEEDS QIMEN RULE VALIDATION]`
- Phép **Sách Bổ (拆補)** — prototype đang dùng: bảng 24 tiết × 3 nguyên (Thượng/Trung/Hạ) → Cục 1–9.
- Nguyên (Thượng/Trung/Hạ) xác định theo **Phù Đầu** của ngày trong chu kỳ 60 Giáp Tý (ngày Giáp/Kỷ, chỉ số bội của 5; Địa chi Phù Đầu quyết định nguyên). Prototype dùng quy tắc: `chi%3 → Thượng/Hạ/Trung`.
- Các trường phái khác: Trí Nhuận (置閏), Mao Sơn (茅山) — implement dưới dạng **strategy** có thể chọn, KHÔNG đoán.

## Bước 7 — Địa bàn Tam Kỳ Lục Nghi (stem engine)
- Thứ tự an: `Mậu→Kỷ→Canh→Tân→Nhâm→Quý→Đinh→Bính→Ất`.
- Bắt đầu từ cung = Cục số. Dương độn bay **thuận** (tăng cung), Âm độn bay **nghịch** (giảm cung) theo vòng 1→9.

## Bước 8 — Trực Phù & Trực Sử (chief engine)
- Tìm **旬首** (xún shǒu) theo giờ: 60 Giáp Tý chia 6 tuần (旬), mỗi tuần 10 thần. Tuần ứng với Lục Nghi: Giáp Tý→Mậu, Giáp Tuất→Kỷ, Giáp Thân→Canh, Giáp Ngọ→Tân, Giáp Thìn→Nhâm, Giáp Dần→Quý.
- **Trực Phù** = Cửu Tinh nằm ở cung chứa Lục Nghi của Tuần Thủ (trên địa bàn).
- **Trực Sử** = Bát Môn nằm ở cung đó.

## Bước 9 — Thiên bàn (stem engine)
- Xoay vòng Lục Nghi của Tuần Thủ tới cung của **Thì Can** (thời can của giờ). Dương thuận/Âm nghịch.

## Bước 10 — An Cửu Tinh (star engine)
- Sao Trực Phù bay tới cung Thì Can; 8 sao còn lại theo vòng Lạc Thư `[1,8,3,4,9,2,7,6]`, thuận/nghịch theo Dương/Âm.
- Thiên Cầm (số 5) giữ Trung cung (prototype) — tuỳ chọn ký gửi Khôn `[NEEDS VALIDATION]`.

## Bước 11 — An Bát Môn (gate engine) — `[NEEDS QIMEN RULE VALIDATION]`
- Prototype dùng **Trực Sử tùy Thì Cung**: Địa chi giờ → Bát quái (Tý→Khảm1, Sửu/Dần→Cấn8, Mão→Chấn3, Thìn/Tỵ→Tốn4, Ngọ→Ly9, Mùi/Thân→Khôn2, Dậu→Đoài7, Tuất/Hợi→Càn6), đếm bước từ Địa chi Tuần Thủ.
- Trường phái khác: "đếm số bước từ Tuần Thủ tới Thì Chi". Implement strategy, có test đối chiếu.

## Bước 12 — An Bát Thần (spirit engine) — `[NEEDS QIMEN RULE VALIDATION]`
- Bắt đầu từ cung Trực Phù, vòng Lạc Thư thuận (dương) / nghịch (âm).
- Biến thể: (a) Bạch Hổ/Huyền Vũ cố định; (b) Dương = Câu Trần/Chu Tước, Âm = Bạch Hổ/Huyền Vũ (prototype đang dùng biến thể b).

## Bước 13 — Lắp bàn (palace engine)
- Đổ vào `QimenBoard` (9 cung). Trung cung (5) không có môn/thần (hoặc theo cấu hình).

## Bước 14 — Relationship (relationship engine)
- Tính Sinh/Khắc/Đồng hành: Cung↔Môn, Cung↔Tinh, Cung↔Can, Môn↔Cung, Tinh↔Cung (đặc tả mục XXVIII).
- Vượng/Suy theo mùa (thời khí) — dùng ngũ hành của tiết khí.

## Bước 15 — Interpretation (interpretation engine)
- Chấm điểm 8 hướng (bảng HƯỚNG|CUNG|MÔN|TINH|THẦN|CAN|NGŨ HÀNH|ĐIỂM|ĐÁNH GIÁ).
- Sinh `ExplanationTrace` (từng bước "tại sao").
- Phân loại câu hỏi (CAREER/BUSINESS/.../GENERAL) — chỉ dùng để chọn loại phân tích, KHÔNG đổi thuật toán.

## Bước 16 — Advice (advice engine)
- TOP 3 hướng thuận / hướng nên tránh; giờ tốt/xấu (quét 24 giờ); hóa giải (đổi thời gian → hướng → vị trí → cách tiếp cận, rồi mới tới `TRADITIONAL PRACTICE`); tận dụng hướng tốt.

> Ghi chú di trú từ prototype: các hàm `tinhCuc` (Bước 6), `anBan` (Bước 7–12), `getDayCanChi` (Bước 4) sẽ được tách nguyên vẹn sang TypeScript rồi viết test đối chiếu trước khi đổi bất kỳ quy tắc nào.
