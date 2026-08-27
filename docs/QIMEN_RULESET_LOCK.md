# QIMEN RULESET LOCK (v1.0.0)

> Khóa rule-set hiện tại. Mọi thay đổi rule-set phải: cập nhật file này,
> bump `ruleSetVersion`, và có lý do + nguồn. KHÔNG tự ý trộn trường phái.

## 1. Tổng quan

| Khóa | Giá trị |
|---|---|
| tradition | ShiJia (时家奇门) |
| plate | ZhuanPan (转盘) |
| dunMethod | CHAIBU (拆补) |
| ruleSetVersion | 1.0.0 |

## 2. Từng rule

### 2.1 Tradition / Method / Plate
- **current**: `anBan(date)` = 时家转盘; không hỗ trợ 日家/月家/年家, không 飞盘.
- **expected**: 时家转盘 duy nhất.
- **source**: `atopx/qimen` (StyleRotate), sách 奇门遁甲 (chuẩn chuyển bàn).
- **validation**: cross-check atopx + bazi.vn (lập bàn).
- **ambiguity**: — (không có trong phạm vi hiện tại).

### 2.2 Dun method (拆补)
- **current**: Phù Đầu = `n - (n%5)`; Nguyên theo Địa chi Phù Đầu; Cục = `CUC_TRA[tiet][nguyen]`.
- **expected**: 拆补, KHÔNG 置闰, KHÔNG 超神接气, KHÔNG 茅山.
- **source**: `CUC_TRA` = 阳/阴遁 ca quyết (冬至/惊蛰一七四…).
- **validation**: 3 golden cases PASS.
- **ambiguity**: ⚠️ 拆补 vs 置闰 ở ranh giới Nguyên — CHƯA implement 置闰; cần chuyên gia chốt nếu muốn mở rộng.

### 2.3 Yuan (三元)
- **current**: `YUAN_BY_CHI`: 子午卯酉=Thượng, 辰戌丑未=Hạ, 寅申巳亥=Trung.
- **expected**: 甲己为符头; Phù Đầu chi → nguyên.
- **source**: textbook (khớp atopx `index mod 15`).
- **validation**: test 12 nhánh PASS.
- **ambiguity**: không.

### 2.4 Ju (局) — bảng 24 tiết
- **current**: `CUC_TRA` 24 tiết × (Thượng/Trung/Hạ) → cục 1..9 + âm/dương.
- **expected**: khớp ca quyết 阳遁/阴遁.
- **source**: qfdk/qimen README (ca quyết) + atopx tables.
- **validation**: golden (Kinh Trập Thượng=1, Lập Thu Thượng=2) PASS.
- **ambiguity**: ⚠️ chưa test đủ 24 tiết × 3 nguyên × 9 cục.

### 2.5 Year boundary (Lập Xuân)
- **current**: `solarYear = (jd < findTietKhiJd('Lập Xuân', year)) ? year-1 : year`.
- **expected**: Can Chi năm đổi tại Lập Xuân.
- **source**: textbook.
- **validation**: test 5/2/2021 = Tân Sửu, 1/2/2021 = Canh Tý PASS.
- **ambiguity**: ⚠️ mốc Lập Xuân chỉ chính xác tới NGÀY (vì solar-term chưa tới instant).

### 2.6 Day boundary (2300)
- **current**: `QIMEN_CONFIG.dayBoundary='2300'`; `hours>=23 → jd+1`.
- **expected**: 23:00 thuộc ngày kế tiếp (子时).
- **source**: 晚子时归次日 (atopx).
- **validation**: test 23:30 → ngày kế tiếp PASS.
- **ambiguity**: ⚠️ chỉ có 1 mode; chưa có 0000; chưa test 22:59/23:00/23:01/00:00/00:01.

### 2.7 Timezone
- **current**: **hardcode UTC+7** (`7.0` trong convertSolar2Lunar + getSunLongitudeDeg).
- **expected**: IANA timezone + DST + longitude; mode CIVIL/LOCAL_MEAN_SOLAR/TRUE_SOLAR.
- **source**: (chưa implement).
- **validation**: ❌ chưa có.
- **ambiguity**: — đây là thiếu sót lớn, KHÔNG được coi là đúng mọi nơi.

### 2.8 Solar term
- **current**: `findTietKhiJd` = nghiệm `getSunLongitudeDeg(t)=k×15°` (Meeus rút gọn); **trả `Math.floor(crossJd+0.5)`**.
- **expected**: JD fractional / exact instant; `termStart ≤ targetInstant < nextTermStart`.
- **source**: chuỗi Meeus rút gọn (thiếu nutation/aberration).
- **validation**: ⚠️ chỉ chính xác tới NGÀY.
- **ambiguity**: ❌ KHÔNG chính xác tới phút — cần astronomy-engine.

### 2.9 Zhifu (值符随时干)
- **current**: sao bản cung chứa Lục Nghi Tuần Thủ; `trucPhuCung = (gioGan===0)? giapKyCung : kyTaiCung[CAN_TO_KY[gioGan]]`.
- **source**: atopx (值符随干).
- **validation**: golden PASS.
- **ambiguity**: không.

### 2.10 Zhishi (值使随时支)
- **current**: `trucSuCung = moveBy(giapKyCung, (gioChi−tuan.chi+12)%12, duong)`; rồi 8 môn xoay vòng Lạc Thư.
- **source**: atopx `BuildDoor + MoveBy`.
- **validation**: golden PASS + bazi.vn 100%.
- **ambiguity**: ⚠️ biến thể "值使随时宫 (地支配八宫)" là trường phái KHÁC — hiện KHÔNG dùng.

### 2.11 Heaven plate (天盘三奇六仪)
- **current**: vòng Lạc Thư xoay cứng, Trung cung giữ nguyên: `ringSteps=(thiCanRing−chiefRing+8)%8`.
- **source**: atopx `RotateStems`.
- **validation**: golden PASS + bazi.vn 100%.
- **ambiguity**: ⚠️ biến thể "xoay tuyến tính 1→9" (từng dùng, đã revert) — KHÔNG dùng. Cần nguồn cổ thư để chốt tuyệt đối.

### 2.12 Nine stars (九星)
- **current**: 值符→时干, 8 sao vòng Lạc Thư thuận/nghịch; 天禽寄坤二 (Trung không sao).
- **source**: atopx `BuildStar`.
- **validation**: golden PASS.
- **ambiguity**: ⚠️ 禽芮 (天禽+天芮) chưa hiển thị rõ trong UI (chỉ hiện "Thiên Nhuế").

### 2.13 Eight doors (八门)
- **current**: 值使随时支 → 8 môn xoay vòng Lạc Thư cứng.
- **source**: atopx `BuildDoor`.
- **validation**: golden PASS.
- **ambiguity**: như 2.10.

### 2.14 Eight spirits (八神)
- **current**: FIXED: 值符→螣蛇→太阴→六合→白虎→玄武→九地→九天 (cả Dương/Âm); vòng Lạc Thư thuận/nghịch.
- **source**: atopx `BuildGod`, qfdk.
- **validation**: golden PASS.
- **ambiguity**: ⚠️ biến thể YIN_YANG_SWAP (Dương: 勾陈/朱雀) giữ làm option, KHÔNG phải default.

### 2.15 Tian Qin (天禽)
- **current**: `tianQinRule='JI_KUN2'` — 天禽 đi cùng Thiên Nhuế; Trung cung không sao.
- **source**: atopx (禽芮寄坤二).
- **validation**: property test (8 sao unique, Trung không sao) PASS.
- **ambiguity**: KEEP_CENTER / WITH_TIAN_RUI là biến thể khác — chưa implement.

## 3. Validation status tổng hợp

| Rule | Code | Source | Validation |
|---|---|---|---|
| Can Chi ngày | ✅ | textbook | 01/10/1949=Giáp Tý |
| Can Chi năm | ✅ | textbook (Li Chun) | 2 test |
| Can Chi giờ | ✅ | Ngũ Thử Độn | golden |
| Day boundary | ⚠️ 1 mode | atopx | 1 test |
| Timezone | ❌ hardcode +7 | — | — |
| Solar term | ⚠️ day-level | Meeus rút gọn | — |
| Yuan | ✅ | textbook | 12 test |
| Ju | ✅ | ca quyết | 2 test |
| Earth plate | ✅ | textbook | property |
| Xunshou | ✅ | 6 tuần | golden |
| Zhifu | ✅ | atopx | golden |
| Zhishi | ✅ | atopx BuildDoor | golden + bazi.vn |
| Heaven plate | ✅ | atopx RotateStems | golden + bazi.vn |
| Nine stars | ✅ | atopx BuildStar | golden + property |
| Eight doors | ✅ | atopx BuildDoor | golden + property |
| Eight spirits | ✅ | atopx BuildGod | golden + property |
| Tian Qin | ✅ | atopx (禽芮) | property |

*File này là "khóa" — khi đổi rule-set phải cập nhật + bump version + ghi nguồn.*
