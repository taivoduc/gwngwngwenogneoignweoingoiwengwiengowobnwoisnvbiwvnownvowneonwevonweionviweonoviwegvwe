# KỲ MÔN ĐỘN GIÁP — Rule set & Phương pháp (Qimen Method)

> Trạng thái: **ĐANG TRIỂN KHAI** (v0.1). Đây là tài liệu "nguồn chân lý" cho rule set
> đang được code trong `kymon.html` + `tests/qimen.test.js`.
> Mọi kết luận đánh dấu `[NEEDS VALIDATION]` là CHƯA được chuyên gia xác nhận bằng cổ thư.

---

## 1. Phương pháp tổng quát

- **Trường phái:** Thời Gia Kỳ Môn — Chuyển Bàn (时家奇门转盘 / rotating plate).
- **Đầu vào:** `năm, tháng, ngày, giờ, (timezone)`.
- **Đầu ra:** Âm/Dương độn, Cục số, Nguyên, Địa bàn, Thiên bàn, Cửu Tinh, Bát Môn, Bát Thần, Trực Phù, Trực Sử.

> ⚠️ Timezone hiện **hardcode UTC+7** — cần chuyển sang IANA + kinh độ thực (chưa xong).

---

## 2. Sáu (6) quyết định rule set — trạng thái

| # | Quyết định | Chọn hiện tại | Trạng thái |
|---|---|---|---|
| 1 | Phép lập Cục | **拆补 (CHAIBU)** | ✅ đang dùng; 置闰 CHƯA implement `[NEEDS VALIDATION]` |
| 2 | Day boundary | **23:00** (`DAY_BOUNDARY_MODE='2300'`) | ✅ có config; `[NEEDS VALIDATION]` |
| 3 | Thiên Cầm (禽) | **寄坤2** (`tianQinRule='JI_KUN2'`) | ⚠️ áp dụng cho Trực Phù/Trực Sử; sao Thiên Cầm vẫn giữ Trung cung `[NEEDS VALIDATION]` |
| 4 | Bát Thần âm | **Âm dùng Bạch Hổ + Huyền Vũ** (`YIN_YANG_SWAP`) | ✅ có config; `[NEEDS VALIDATION]` |
| 5 | Mốc năm Can Chi | **Lập Xuân (Li Chun)** | ✅ đã sửa; `[NEEDS VALIDATION]` |
| 6 | Hoàng Đạo/Hắc Đạo | **Tách module phụ**, KHÔNG cộng vào điểm | ⚠️ còn nằm trong score (chưa tách) |

---

## 3. Thuật toán lập bàn (đã implement + đã test)

### 3.1 Lịch pháp
- **JD**: `jdFromDate(dd, mm, yy)` (thuật toán chuẩn).
- **Can Chi ngày**: `idx = (jd + 49) mod 60` (Giáp Tý = 0). Kiểm chứng 01/10/1949 = Giáp Tý. ✅
- **Can Chi năm**: theo **Lập Xuân** — trước Lập Xuân dùng năm trước. ✅
- **Can Chi giờ**: `gioChi = floor((hour+1)/2) mod 12`; `gioGan = (dayGan*2 + gioChi) mod 10` (Ngũ Thử Độn).
- **Day boundary**: `23:00–23:59` thuộc ngày kế tiếp (config `2300`). ✅

### 3.2 Tiết khí (Solar term)
- 24 tiết khí = kinh độ hoàng đạo 360°/24. `findTietKhiJd(name, year)` tìm ngày giao tiết bằng
  nghiệm của `getSunLongitudeDeg` (chuỗi Meeus rút gọn). ✅
- **Tiết khí hiện tại** = term có `start ≤ target < start term kế tiếp` (KHÔNG phải "term kế tiếp"). ✅
  - Đã sửa bug: 17/3/2021 trước đây bị gán "Xuân Phân", giờ đúng là "Kinh Trập".

### 3.3 Cục & Nguyên (拆补)
- Âm/Dương độn: Đông Chí → trước Hạ Chí = Dương; ngược lại = Âm (theo bảng `CUC_TRA`).
- **Nguyên** theo Địa chi Phù Đầu (`YUAN_BY_CHI` — mapping rõ ràng, thay phép `chi % 3`):
  - 子午卯酉 = **Thượng** nguyên.
  - 辰戌丑未 = **Hạ** nguyên.
  - 寅申巳亥 = **Trung** nguyên.
- Phù Đầu = ngày Giáp/Kỷ (`n - (n % 5)`); Cục = `CUC_TRA[tiet][nguyen]`.

### 3.4 Địa bàn (三奇六仪)
- Thứ tự: Mậu→Kỷ→Canh→Tân→Nhâm→Quý→Đinh→Bính→Ất (index 1..9).
- Bắt đầu từ cung = Cục số. Dương bay **thuận** (tăng cung), Âm bay **nghịch** (giảm cung). ✅

### 3.5 Trực Phù / Trực Sử (时旬首)
- `旬首` theo giờ: `TUAN_INFO[floor(chiIndex/10)]` (6 tuần → 6 Lục Nghi).
- Trực Phù = sao có bản cung chứa Lục Nghi Tuần Thủ (Trung cung 5 → ký Khôn 2).
- Trực Sử = môn có bản cung đó. ✅

### 3.6 Thiên bàn (三奇六仪 xoay) — **ĐÃ SỬA**
- Lục Nghi Tuần Thủ di chuyển tới cung Thì Can.
- **Xoay TUYẾN TÍNH** (1→2→…→9), Dương thuận / Âm nghịch. (Trước đây xoay theo vòng Lạc Thư → sai.) ✅

### 3.7 Cửu Tinh (九星)
- Sao Trực Phù bay tới cung Thì Can; 8 sao ngoài theo **vòng Lạc Thư** `[1,8,3,4,9,2,7,6]`, thuận/nghịch.
- Thiên Cầm (5) giữ Trung cung. ✅

### 3.8 Bát Môn (八门) — **ĐÃ SỬA**
- Trực Sử tùy Thì Cung: Địa chi giờ → Bát quái (地支配八宫):
  `Tý→Khảm1, Sửu/Dần→Cấn8, Mão→Chấn3, Thìn/Tỵ→Tốn4, Ngọ→Ly9, Mùi/Thân→Khôn2, Dậu→Đoài7, Tuất/Hợi→Càn6`.
- (Trước đây dùng `SHI_TARGET` hardcode sai → đã thay bằng `SHI_BRANCH_PALACE`.) ✅

### 3.9 Bát Thần (八神)
- Bắt đầu từ cung Trực Phù, vòng Lạc Thư thuận (Dương) / nghịch (Âm).
- Dương: Trực Phù→Đằng Xà→Thái Âm→Lục Hợp→Câu Trần→Chu Tước→Cửu Địa→Cửu Thiên.
- Âm: Trực Phù→Đằng Xà→Thái Âm→Lục Hợp→**Bạch Hổ→Huyền Vũ**→Cửu Địa→Cửu Thiên. ✅

---

## 4. Golden cases (đã khóa bằng test)

| Case | Kết quả kỳ vọng | Test |
|---|---|---|
| 17/3/2021 03:00 | Dương độn 1 — Kinh Trập — Thượng nguyên (toàn bàn) | Golden 1 ✅ |
| 17/3/2021 19:00 | Giờ Giáp — Trực Phù về bản cung, Thiên bàn = Địa bàn | Golden 2 ✅ |
| 22/8/2026 10:16 | Âm độn 2 — Lập Thu — Thượng (Bát Thần âm) | Golden 3 ✅ |
| Nguyên 12 chi | 子午卯酉=Thượng, 辰戌丑未=Hạ, 寅申巳亥=Trung | test ✅ |
| Day boundary | 23:30 → ngày kế tiếp | test ✅ |
| Năm Can Chi | 5/2/2021 = Tân Sửu (sau Li Chun) | test ✅ |

Chạy: `node tests/qimen.test.js`

---

## 5. Còn lại (chưa xong) — theo thứ tự ưu tiên

1. **Timezone IANA** — bỏ hardcode +7; cần kinh độ thực cho tiết khí & giờ mặt trời.
2. **置闰 (zhì rùn)** — nếu chốt dùng CHAOSHEN; hiện là CHAIBU không cần.
3. **Thiên Cầm** — quyết định ký Khôn2 hay giữ Trung cung cho SAO (hiện: ký Khôn cho Trực Phù/Trực Sử, giữ Trung cho sao).
4. **Tách 3 lớp** calculation / interpretation / heuristic (score hiện là heuristic đơn giản).
5. **Hoàng Đạo/Hắc Đạo** — tách khỏi score.
6. **Bỏ fallback** (`|| TUAN_INFO[0]`, `starIdx === -1 ? 0`, …) để không âm thầm sai.
7. **Scan 12 giờ + rank 8 hướng** cho advice.

---

*Trạng thái: tài liệu này mô tả đúng code hiện tại; các mục `[NEEDS VALIDATION]` chờ chuyên gia chốt.*
