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
| 3 | Thiên Cầm (天禽) | **寄坤二** (`tianQinRule='JI_KUN2'` — 禽芮) | ✅ đã sửa (Trung cung không có sao) |
| 4 | Bát Thần | **FIXED** (Bạch Hổ + Huyền Vũ cho cả Dương/Âm) | ✅ chuẩn 转盘; `YIN_YANG_SWAP` giữ làm option |
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

### 3.6 Thiên bàn (三奇六仪 xoay) — **ĐÃ SỬA LẠI**
- Lục Nghi Tuần Thủ di chuyển từ **值符原宫** tới **时干落宫**.
- **Xoay cứng theo vòng LẠC THƯ** `[1,8,3,4,9,2,7,6]`; **Trung cung (5) giữ nguyên**.
- Không phân thuận/nghịch ở vòng xoay (Dương/Âm chỉ quyết định nơi Trực Phù đáp).
- SOURCE: `atopx/qimen plate.RotateStems`. ✅
- ⚠️ (Phiên trước đã từng sửa thành "xoay tuyến tính 1→9" — SAI, đã revert.)

### 3.7 Cửu Tinh (九星)
- Sao Trực Phù bay tới cung Thì Can; 8 sao ngoài theo **vòng Lạc Thư** `[1,8,3,4,9,2,7,6]`, thuận/nghịch.
- **天禽 (Thiên Cầm) 寄坤二**: đi cùng Thiên Nhuế (禽芮). Trung cung KHÔNG có sao. ✅
- SOURCE: `atopx/qimen plate.BuildStar`.

### 3.8 Bát Môn (八门) — **ĐÃ SỬA LẠI**
- **值使随时支**: 值使 từ 值符原宫 đi theo số bước `(时支 − 旬首支) mod 12`,
  thuận (Dương)/nghịch (Âm) qua vòng 1..9; rồi 8 môn xoay cứng theo vòng Lạc Thư.
- SOURCE: `atopx/qimen plate.BuildDoor + MoveBy`. ✅
- ⚠️ (Phiên trước đã dùng "地支配八宫" — là trường phái KHÁC, đã thay bằng 值使随时支.)

### 3.9 Bát Thần (八神)
- Bắt đầu từ cung Trực Phù, vòng Lạc Thư thuận (Dương) / nghịch (Âm).
- **FIXED (mặc định)**: Trực Phù→Đằng Xà→Thái Âm→Lục Hợp→**Bạch Hổ→Huyền Vũ**→Cửu Địa→Cửu Thiên.
- Option `YIN_YANG_SWAP`: Dương dùng Câu Trần/Chu Tước thay Bạch Hổ/Huyền Vũ. ✅
- SOURCE: `atopx/qimen plate.BuildGod`, `qfdk/qimen lib/bashen.js`.

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
