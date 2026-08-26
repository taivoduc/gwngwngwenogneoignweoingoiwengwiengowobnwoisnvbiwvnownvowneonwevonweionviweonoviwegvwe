# KẾ HOẠCH TÁI CẤU TRÚC & AUDIT THUẬT TOÁN KỲ MÔN ĐỘN GIÁP

> Trạng thái: **KẾ HOẠCH** (chưa sửa code). Tài liệu này viết sau khi đọc toàn bộ `kymon.html`.
> Mục tiêu: tách **CALCULATION** / **INTERPRETATION** / **HEURISTIC SCORE** độc lập, xác định rule set, chứng minh bằng regression test.

---

## 1. EXECUTIVE SUMMARY

Chương trình hiện là **1 file HTML + JS đơn khối** (~2100 dòng). Về tính toán, nó đã dựng được khung Thời Gia Kỳ Môn Chuyển Bàn (转盘奇门) với đủ: Cục, Địa bàn, Thiên bàn, Cửu Tinh, Bát Môn, Bát Thần, Trực Phù/Trực Sử. Tuy nhiên có **nhiều điểm trộn trường phái, hardcode, thiếu kiểm chứng**.

**Kết luận ngắn gọn:**
- ✅ Đúng cấu trúc: pipeline Can Chi → Cục → Địa/Thiên bàn → Tinh/Môn/Thần.
- ⚠️ Sai/thiếu: **tiết khí (ngày cố định), năm Can Chi (năm âm lịch), Bát Môn (hardcode SHI_TARGET), Thiên Cầm (fallback), timezone +7, không tách engine**.
- ❌ Không có regression test, golden cases, debug trace.

**Trả lời "đã lập bàn đúng đến mức nào?":** Chưa thể khẳng định đúng — vì chưa xác định rule set và chưa có test.

---

## 2. RULE SET BẮT BUỘC XÁC ĐỊNH TRƯỚC

Ứng dụng CHỈ làm: **Thời Gia Kỳ Môn + Chuyển Bàn (转盘奇门)**.

### 2.1 QIMEN_METHOD (bắt buộc khai báo, không trộn)

| Method | Mô tả | Hiện trạng |
|---|---|---|
| 拆补法 | giao tiết thực tế làm boundary, xử lý 残/补局 | ❌ chưa có |
| 超神接气/置闰法 | theo 符头 vs 节气, xử lý 超神/接气/置闰 | ⚠️ code đang dùng nhưng chưa đủ 置闰 |

**Cần chuyên gia chốt 1 method** cho engine chính.

### 2.2 Các rule con cần chốt

| Rule | Lựa chọn | Ghi chú |
|---|---|---|
| DAY_BOUNDARY_MODE | A. 23:00 / B. 00:00 | 子时 theo truyền thống bắt đầu 23:00 |
| Thiên Cầm (天禽) | A. 寄坤二 / B. Dương寄艮八, Âm寄坤二 | hiện code ngầm "寄坤二" |
| Bát Thần | 1 bộ dương + 1 bộ âm theo cổ thư | hiện code đổi 白虎/玄武 → 勾陈/朱雀 |
| Năm trụ | theo Li Chun (solar) | hiện code dùng lunar year ❌ |
| Nguyên (元) | mapping rõ 12 chi | hiện code `chi % 3` |

## 3. AUDIT HIỆN TRẠNG (bảng đối chiếu)

| # | Module | Code hiện tại | Rule thực tế | Đ/S | Mức | Cách sửa |
|---|---|---|---|---|---|---|
| 1 | Julian Day | `jdFromDate` | kiểm tra độc lập | ? | Cao | viết test |
| 2 | Gregorian date | OK | — | ✅ | — | — |
| 3 | Lunar conversion | `convertSolar2Lunar(...,7.0)` | tách khỏi Qimen | ⚠️ | Trung | tách engine |
| 4 | Can Chi năm | `getCanChi(lunar.year)` | theo Li Chun | ❌ | Cao | dùng solar year |
| 5 | Can Chi ngày | `(jd+49)%60` | chuẩn | ✅* | Cao | *cần test 60 Giáp Tý |
| 6 | Can Chi giờ | `dayGanIdx*2+gioChi` | Ngũ Thử Độn | ✅* | Cao | *cần test + 23:00 |
| 7 | 23:00/00:00 | không xử lý | DAY_BOUNDARY_MODE | ❌ | Cao | thêm cấu hình |
| 8 | 24 tiết khí | `TIET_KHI` ngày cố định | solar longitude | ❌ | Rất cao | viết lại |
| 9 | Giao tiết | `findTietKhiJd` | instant chính xác | ⚠️ | Cao | verify, không làm tròn |
| 10 | Timezone | hardcode +7 | IANA | ❌ | Cao | thêm input tz |
| 11 | Long/lat | không có | optional | ❌ | Thấp | thêm optional |
| 12 | True solar time | không có | optional | ❌ | Thấp | thêm optional |
| 13 | Yin/Yang Dun | `CUC_TRA[duong]` | theo tiết khí | ✅ | — | giữ |
| 14 | Yuan | `chi % 3` | mapping rõ | ⚠️ | Trung | mapping 12 chi |
| 15 | Ju number | `CUC_TRA` | theo school | ⚠️ | Cao | tách method |
| 16 | Di Pan | `diaBan` 戊→乙 | thuận/nghịch | ✅ | — | giữ + test |
| 17 | Xun Shou | `TUAN_INFO` | 6 tuần | ✅ | — | giữ + test |
| 18 | Zhi Fu | `trucPhuTinh` | 时旬首→仪→宫→星 | ⚠️ | Cao | bỏ fallback |
| 19 | Zhi Shi | `trucSuMon` | 时旬首→宫→门 | ✅ | — | giữ + test |
| 20 | Tian Pan | `thienBan` | 值符随时干 | ✅ | — | giữ + test |
| 21 | Nine Stars | `starAtPalace` | 转盘 | ⚠️ | Cao | Thiên Cầm đúng |
| 22 | Eight Gates | `SHI_TARGET` hardcode | 值使随时支/宫 | ❌ | Rất cao | **viết lại** |
| 23 | Eight Spirits | 2 mảng dương/âm | theo school | ⚠️ | Trung | cấu hình |
| 24 | Tian Qin | `starAtPalace[5]=5` | 寄坤2/寄艮8 | ❌ | Cao | chọn rule |
| 25 | Central palace | `===5 ? 2 : x` | 寄坤2 | ⚠️ | Trung | khai báo rõ |
| 26 | Palace direction | `CUNG_HUONG`/`CUNG_HANH` | Bắc=坎1...Nam=离9 | ✅ | — | tách map |
| 27 | Compass | magnetic | + declination | ⚠️ | Thấp | thêm hiệu chỉnh |
| 28 | Scoring | môn+tinh+thần | heuristic | ❌ | Cao | tách engine |
| 29 | Wu Xing | `phanTichNguHanh` đếm | "thành phần" | ⚠️ | Trung | đổi tên + bổ sung |
| 30 | Advice engine | `renderLuanGiai` | diễn giải truyền thống | ⚠️ | Trung | tách + ghi nhãn |

---

## 4. DANH SÁCH BUG (theo mức độ)

### Rất cao
- **B1. Bát Môn hardcode `SHI_TARGET`** — thay bằng thuật toán "original Zhi Shi palace + hour branch + Yin/Yang".
- **B2. Tiết khí dùng ngày cố định** — tính solar apparent longitude.
- **B3. Năm Can Chi dùng năm âm lịch** — theo solar term (Li Chun).
- **B4. Trộn 超神接气 thiếu 置闰** — kiến trúc sai.

### Cao
- **B5. Thiên Cầm xử lý bằng fallback** — chọn rule 寄坤2/寄艮8.
- **B6. Timezone hardcode +7**.
- **B7. Không xử lý 23:00 boundary**.
- **B8. Trực Phù fallback "Tian Peng"** — bỏ fallback.

### Trung
- **B9. Nguyên `chi % 3`** — mapping rõ.
- **B10. Bát Thần đổi 白虎/玄武 tùy tiện** — chọn school.
- **B11. `phanTichNguHanh` gọi "vượng/suy" nhưng chỉ đếm**.
- **B12. Score gọi "Kỳ Môn chuẩn"** — ghi "heuristic".

### Thấp
- **B13. Compass không hiệu chỉnh từ thiên**.
- **B14. Không true solar time** (optional).
- **B15. Hoàng Đạo/Hắc Đạo** — giữ module phụ, không vào score (xác nhận lại).

## 5. DANH SÁCH THUẬT TOÁN ĐÚNG (giữ nguyên)

- Can Chi ngày `(jd+49)%60` (cần test).
- Can Chi giờ Ngũ Thử Độn `dayGanIdx*2+gioChi` (cần test).
- Địa bàn 戊己庚辛壬癸丁丙乙, Dương thuận / Âm nghịch.
- Tuần Thủ 6 tuần (甲子→戊 … 甲寅→癸).
- Thiên bàn 值符随时干 (xoay Lạc Thư).
- Bát Môn classification cơ bản (吉: 开休生 / 平: 杜景 / 凶: 伤惊死).

## 6. DANH SÁCH THUẬT TOÁN SAI (phải sửa)

- SHI_TARGET hardcode (Bát Môn).
- Năm Can Chi theo âm lịch.
- Tiết khí ngày cố định.
- Trộn 超神接气 thiếu 置闰.
- Fallback Trực Phù / Thiên Cầm.
- Gọi heuristic score là "chuẩn".

## 7. ĐIỂM KHÁC BIỆT TRƯỜNG PHÁI (ghi EXPECTED_BY_SCHOOL)

| Điểm | Trường phái A | Trường phái B |
|---|---|---|
| Định cục | 拆补法 | 超神接气/置闰 |
| Thiên Cầm | 寄坤2 | Dương寄艮8, Âm寄坤2 |
| Bát Thần âm | 勾陈+朱雀 | 白虎+玄武 |
| Day boundary | 23:00 | 00:00 |
| Năm trụ | Li Chun | tiết khí khác |

> Nguyên tắc: **không gọi 1 bên là bug** khi 2 trường phái khác nhau.

## 8. SOURCE CITATIONS (cần thu thập)

Ưu tiên cổ thư:
1. 《奇门遁甲统宗》 — 九星/八门/八神/六仪三奇
2. 《遁甲演义》 — 值符/值使/超神/接气/置闰
3. 《奇门法窍》 — 拆补法

Mỗi rule sau khi sửa phải có comment: `SOURCE: tên — đoạn — URL — cách suy ra`.

## 9. PATCH PLAN (thứ tự thực hiện)

### Giai đoạn 0 — Chuẩn bị (không đổi logic)
1. Tách code ra khỏi HTML: tạo `src/qimen/*.js` modules (engine độc lập, testable bằng Node).
2. Thiết lập cấu hình `QIMEN_METHOD`, `DAY_BOUNDARY_MODE`, `EIGHT_SPIRIT_RULESET`, `TIAN_QIN_RULE`.

### Giai đoạn 1 — Lịch pháp (nền tảng)
3. Viết lại tiết khí = solar apparent longitude (bỏ ngày cố định).
4. Timezone IANA + long/lat + true solar time (optional).
5. Năm Can Chi theo Li Chun (tách LUNAR_CALENDAR vs QIMEN_SOLAR).
6. Day boundary 23:00/00:00 (cấu hình).
7. Nguyên = mapping 12 chi rõ ràng (bỏ `chi % 3`).

### Giai đoạn 2 — Lập bàn (calculation engine)
8. Tách method định cục (拆补 vs 超神接气/置闰) — không trộn.
9. Bát Môn: viết lại 值使随时支/宫 (bỏ SHI_TARGET).
10. Thiên Cầm + Trực Phù: chọn rule rõ, bỏ fallback.
11. Bát Thần: cấu hình school.

### Giai đoạn 3 — Đánh giá (tách khỏi tính toán)
12. `QIMEN_CHART_ENGINE` vs `QIMEN_EVALUATION_ENGINE`.
13. Score trả `{rawFactors, explanation, heuristicScore}` (không phần trăm).
14. `phanTichNguHanh` → `analyzeElementComposition` (đổi tên, UI ghi "thành phần").
15. `scan12Hours` + rank 8 directions (TOP 1/3/5).

### Giai đoạn 4 — Debug + UI
16. Thêm nút "DEBUG / KIỂM TRA LẬP BÀN" (VALUE/RULE/SOURCE từng bước).
17. Hoàng Đạo/Hắc Đạo giữ module phụ, mode "Chỉ Kỳ Môn" thì không ảnh hưởng.

## 10. TEST PLAN (bắt buộc)

Tạo `tests/qimen.test.js` (Node). Tối thiểu:
1. 60 Giáp Tý (day Ganzhi)
2. 12 giờ Chi + 10 giờ Can (Ngũ Thử Độn)
3. 24 tiết khí + trước/sau giao tiết (±1 phút)
4. 23:00 / 00:00 boundary
5. Dương độn + Âm độn
6. Cục 1–9
7. 6 Tuần Thủ (甲子…甲寅 → 戊…癸)
8. Trực Phù (cả trường hợp Thiên Cầm làm Trực Phù)
9. Trực Sử
10. Thiên Cầm (寄坤2 / 寄艮8)
11. Trung Cung (寄宫)
12. 8 Bát Môn (12 giờ × 2 độn)
13. 8 Bát Thần
14. 8 hướng (sector + palace)

## 11. GOLDEN TEST CASES

File `qimen-golden-cases.json`, mỗi case:
```json
{
  "datetime": "2026-08-22T10:16:00",
  "timezone": "Asia/Ho_Chi_Minh",
  "method": "chaibu",
  "dun": "Dương", "ju": 3, "yuan": "Thượng",
  "xunShou": "Giáp Thìn", "zhiFu": "Thiên Cầm", "zhiShi": "Tử",
  "diPan": {"1":"Mậu"}, "tianPan": {}, "stars": {}, "doors": {}, "spirits": {},
  "EXPECTED_BY_SCHOOL": "chaibu"
}
```
Nếu 2 trường phái khác nhau → ghi `EXPECTED_BY_SCHOOL`, không coi là bug.

## 12. DEBUG MODE (đặc tả)

Nút "DEBUG / KIỂM TRA LẬP BÀN" hiển thị pipeline:
Input → Timezone → Solar term → Yuan → Dun → Ju → Xun Shou → Zhi Fu (gốc) → Zhi Shi (gốc) → Time Stem/Branch → Zhi Fu (moved) → Zhi Shi (moved) → Nine Stars → Eight Gates → Eight Spirits.
Mỗi dòng: **VALUE | RULE | SOURCE**.

## 13. TIÊU CHUẨN HOÀN THÀNH

- Không nói "chính xác 100%".
- Chỉ nói: "Đã khớp rule set X ở test case Y".
- Ghi rõ "Alternative school produces different result" khi có.

## 14. CÂU HỎI CẦN CHUYÊN GIA CHỐT (trước khi code)

1. Chọn **拆补法** hay **超神接气/置闰法**?
2. **Day boundary**: 23:00 hay 00:00?
3. **Thiên Cầm**: 寄坤2 hay Dương寄艮8/Âm寄坤2?
4. **Bát Thần âm độn**: 勾陈+朱雀 hay 白虎+玄武?
5. **Năm trụ**: theo Lập Xuân (Li Chun) hay tiết khí khác?
6. Có giữ **Hoàng Đạo/Hắc Đạo** làm module phụ không? (hiện đã tách)



