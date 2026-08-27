# QIMEN AUDIT REPORT (v3) — Reverse-engineered & independent

> Ngày: 27/8/2026. Chế độ: **AUDIT ONLY — KHÔNG sửa code**.
> Nguyên tắc: KHÔNG tin comment, KHÔNG tin test PASS, KHÔNG lấy 1 website làm chân lý.
> Đã đối chiếu với engine độc lập `atopx/qimen` (Go) và `bazi.vn` (web) ở phần lập bàn.

---

## PHẦN A — CURRENT ALGORITHM REPORT (thuật toán THỰC TẾ đang chạy)

Nguồn: `kymon.html` (đã đọc từng hàm, không dựa comment).

| # | Hạng mục | Thuật toán thực tế | Trạng thái |
|---|---|---|---|
| 1 | Can Chi năm | `getCanChi(solarYear)`; `solarYear = (jd < liChunJd) ? year-1 : year`; `gan=(year-4)%10`, `chi=(year-4)%12` | ✅ theo Li Chun (độ chính xác NGÀY) |
| 2 | Can Chi ngày | `getDayCanChi(jd)`: `idx=((jd+49)%60+60)%60` | ✅ (kiểm chứng 01/10/1949=Giáp Tý) |
| 3 | Can Chi giờ | `gioChi=floor((h+1)/2)%12`; `gioGan=(dayGan*2+gioChi)%10` (Ngũ Thử Độn); `dayGan` đã dịch theo day-boundary | ✅ |
| 4 | Day boundary | `QIMEN_CONFIG.dayBoundary='2300'`; `hours>=23 → jd+1` | ⚠️ chỉ 1 mode, KHÔNG có UI/config 0000 |
| 5 | Timezone | **HARDCODE `7.0`** (UTC+7) trong `convertSolar2Lunar(…,7.0)` và `getSunLongitudeDeg(…,7.0)` | ❌ CHƯA IANA/longitude/DST |
| 6 | Solar terms | `findTietKhiJd`: nghiệm `getSunLongitudeDeg(t)=k×15°` (chuỗi Meeus rút gọn); **trả `Math.floor(crossJd+0.5)`** | ⚠️ chỉ chính xác tới NGÀY (sai ±12h quanh giao tiết) |
| 7 | Yuan | `YUAN_BY_CHI` explicit: 子午卯酉=上, 辰戌丑未=下, 寅申巳亥=中; Phù Đầu=`n-(n%5)` | ⚠️ có fallback `\|\| 'Thượng'` |
| 8 | Dun (Âm/Dương) | `CUC_TRA[tiet][nguyen].duong` | ✅ |
| 9 | Ju | `CUC_TRA[tiet][nguyen].cuc` (bảng 24 tiết × 3 nguyên) | ✅ khớp 阳/阴遁 ca quyết |
| 10 | Earth plate | 戊己庚辛壬癸丁丙乙; Mậu tại cục số; Dương tăng cung / Âm giảm cung (TUYẾN TÍNH 1..9) | ✅ |
| 11 | Xunshou (旬首) | `TUAN_INFO[floor(chiIndex/10)]`; 甲子→戊…甲寅→癸 | ❌ fallback `\|\| TUAN_INFO[0]` |
| 12 | Zhifu (值符) | sao bản cung chứa Lục Nghi Tuần Thủ; `trucPhuCung = (gioGan===0)? giapKyCung : kyTaiCung[CAN_TO_KY[gioGan]]` (值符随时干) | ✅ |
| 13 | Zhishi (值使) | `trucSuMon=MON_HOME_INV[chiefHome]`; **值使随时支**: `moveBy(giapKyCung, (gioChi−tuan.chi+12)%12, duong)` | ✅ (khớp atopx BuildDoor) |
| 14 | Heaven plate | **vòng Lạc Thư xoay cứng, Trung cung giữ nguyên**; `ringSteps=(thiCanRing−chiefRing+8)%8` | ✅ (khớp atopx RotateStems + bazi.vn 100%) |
| 15 | Nine stars | 值符→时干; 8 sao theo vòng Lạc Thư thuận/nghịch; **天禽寄坤二** (Trung không sao) | ⚠️ fallback `starIdx===-1?0`; 禽芮 chưa hiển thị rõ |
| 16 | Eight gates | 值使随时支 rồi 8 môn xoay vòng Lạc Thư cứng | ✅ (khớp atopx BuildDoor) |
| 17 | Eight spirits | từ 值符落宫, vòng Lạc Thư thuận/nghịch; **FIXED** 值符→螣蛇→太阴→六合→白虎→玄武→九地→九天 | ✅ |
| 18 | Tianqin | `tianQinRule='JI_KUN2'` — đi cùng Thiên Nhuế (禽芮), Trung cung không sao | ⚠️ UI chỉ ghi "Thiên Nhuế", chưa ghi rõ "禽芮" |
| 19 | Trung cung | 地盘干 & 天盘干 giữ nguyên; không môn/sao/thần | ✅ |
| 20 | Scoring | `palaceScore=±1×3` (Môn+Tinh+Thần); `normalizeScore=round(score×2.5)` → khoảng −8..+8 | ❌ heuristic, TRỘN vào display, chưa tách |
| 21 | Interpretation | 8 chủ đề (`CHU_DE`): đếm tên tốt/xấu của Môn/Tinh/Thần | ⚠️ 1 công thức chung, CHƯA có 用神/question ontology |
| 22 | Advice | `MON_ADVICE` + `renderHoaGiai` ("7 cây","5 chuông","3 viên đá","9 nén nhang","gương bát quái") | ❌ chưa phân loại CLASSICAL/SYMBOLIC/PRACTICAL |

---

## PHẦN B — RULESET LOCK (đã cấu hình trong code)

`QIMEN_CONFIG` (kymon.html):

```js
{ method:'CHAIBU', dayBoundary:'2300', yearStart:'LAP_XUAN',
  spiritRuleset:'FIXED', tianQinRule:'JI_KUN2' }
```

| Khóa | Giá trị | Nơi | Ghi chú |
|---|---|---|---|
| tradition | ShiJia (时家) | hàm anBan | ✅ |
| plate | ZhuanPan (转盘) | thuật toán vòng Lạc Thư | ✅ |
| dunMethod | CHAIBU (拆补) | `CUC_TRA` + Phù Đầu | ✅ (置闰/超神接气/茅山 KHÔNG trộn) |
| yearBoundary | LI_CHUN | `findTietKhiJd('Lập Xuân')` | ✅ |
| dayBoundary | 2300 | `QIMEN_CONFIG` | ⚠️ chỉ 1 mode |
| tianQinRule | JI_KUN2 | `starAtPalace[5]` bỏ | ✅ |
| spiritRule | FIXED | `TEN_THAN` | ✅ (SWAP giữ làm option) |
| timeMode | CIVIL | hardcode | ❌ không có mode khác |

⚠️ **Mọi kết quả CHƯA ghi kèm rule-set version** trong output — cần bổ sung `ruleSetVersion` + hash config.

---


## PHẦN C — SILENT FALLBACK (tồn tại trong calculation path — CẦN BỎ)

| Dòng | Fallback | Nguy cơ |
|---|---|---|
| 1044 | `TUAN_INFO[tuanIdx] \|\| TUAN_INFO[0]` | giờ ngoài 0..59 → âm thầm thành Giáp Tý |
| 953 | `YUAN_BY_CHI[chi] \|\| 'Thượng'` | chi không hợp lệ → âm thầm Thượng nguyên |
| 779 | `getCanChiIndex` trả `0` khi không khớp | CRT fail → âm thầm Giáp Tý |
| 1078 | `ringPos===-1 ? 0` | giá trị không thuộc Lạc Thư → âm thầm cung 1 |
| 1080 | `starIdx===-1 ? 0` | sao không có trong ring → âm thầm Thiên Bồng |
| 921 | `findTietKhiJd` trả `approxJd` khi không tìm thấy giao điểm | term fail → âm thầm ngày xấp xỉ |
| 937 | `getTietKhi` trả `{name:'Đông Chí', jd:targetJd-15}` | không tìm thấy term → âm thầm Đông Chí |
| 1327 | `THANH_LONG_START[dayGanIdx] !== undefined ? … : 0` | (Hoàng Đạo, ngoài Qimen core) |

→ Yêu cầu: **throw `QimenCalculationError`** thay vì giá trị mặc định.

---

## PHẦN D — TEST COVERAGE GAP (so với yêu cầu)

| Loại test | Yêu cầu | Hiện có | Thiếu |
|---|---|---|---|
| Golden cases | ≥200 deterministic | **3** (Dương 1, Giáp Tuất phục ngâm, Âm 2) | 197+ |
| Cục 1–9 | đủ 9 cục × 2 độn | 2 cục (1 Dương, 2 Âm) | 16 cục-độn còn lại |
| 6 tuần (旬首) | đủ 6 | ngầm qua 2 case | thiếu test riêng |
| 12 giờ | đủ 12 | 2 giờ (Dần, Tuất) | 10 giờ |
| Boundary solar term | ±30/10/1 phút quanh MỖI giao tiết | 0 | 24×6 |
| Day boundary | 22:59/23:00/23:01/23:59/00:00/00:01 | 1 (23:30) | 5 |
| Property tests | 9 cung/8 môn unique/8 thần unique/9 can unique/tam kỳ lục nghi đủ/không NaN/không cung 10 | 0 | toàn bộ |
| Timezone tests | IANA/DST | 0 | toàn bộ (vì chưa có IANA) |
| Phục Ngâm / Phản Ngâm | có | 1 (phục ngâm) | 反吟 |

⚠️ **verify_kymon.js chỉ 1 bảng**; **verify_full.js** (bazi.vn) đã khớp 100% cho 1 case Âm độn 4 — nhưng KHÔNG được coi là "chân lý", chỉ là 1 điểm đối chiếu.

---

## PHẦN E — KIẾN TRÚC: CHƯA TÁCH 5 LỚP

Hiện **toàn bộ nằm trong 1 file `kymon.html`** (calculation + score + interpretation + advice + visualization trộn lẫn).

| Lớp | Hiện trạng |
|---|---|
| CALCULATION | `anBan/tinhCuc/…` ✅ đúng thuật toán, nhưng trộn trong HTML |
| INTERPRETATION | `CHU_DE` (8 chủ đề, 1 công thức đếm tên) — chưa có 用神/格局/门迫/入墓/伏吟/反吟/十干克应 |
| HEURISTIC SCORE | `palaceScore/normalizeScore` — đang cộng trực tiếp vào màu hiển thị |
| ADVICE | `MON_ADVICE/renderHoaGiai` — chưa phân CLASSICAL/SYMBOLIC/PRACTICAL |
| VISUALIZATION | `hienThiBan/updateCompass` — đọc trực tiếp biến global |

→ Yêu cầu: tách thành `QimenBoard` (data thuần) → `Interpretation` → `HeuristicScore` → `Advice` → `Visualization`.

---

## PHẦN F — CÁC THÀNH PHẦN LUẬN GIẢI CÒN THIẾU

Chưa implement (chỉ có Môn+Tinh+Thần + ngũ hành đếm):

- 天地盘干生克, 门宫生克, 星宫生克
- 门迫, 门生宫/宫生门, 门克宫/宫克门
- 旬空 (空亡), 马星 (驿马), 入墓, 击刑, 伏吟, 反吟
- 格局 (青龙返首, 飞鸟跌穴, 天网四张, …), 十干克应
- **Chỉ bật rule đã xác định nguồn** — KHÔNG tự bịa.

---

## PHẦN G — QUESTION ONTOLOGY + 用神 (CHƯA CÓ)

- Hiện chỉ có 8 chủ đề cố định, **1 công thức điểm cho mọi câu hỏi**.
- Chưa có: Question Ontology (CAREER/JOB_CHANGE/…/OTHER — 25+ loại), 用神 framework
  (Question → Type → Subject → 用神 → Palace → Relationship → Timing → Interpretation).
- Chưa có: "Chưa đủ cơ sở để kết luận" khi thiếu dữ liệu 用神.

---

## PHẦN H — SCORE / CONFIDENCE / ADVICE (CHƯA ĐÚNG QUY ƯỚC)

- Score hiện **KHÔNG ghi nhãn "heuristic"** rõ ràng trong output (điểm hiện như con số tuyệt đối).
- Chưa tách **Calculation Confidence** vs **Interpretation Confidence**.
- Advice chưa phân loại CLASSICAL/SYMBOLIC/PRACTICAL; còn "9 nén nhang", "7 cây", "5 chuông"… — là phong tục, phải gắn nhãn, không phải kết quả Qimen cổ điển.
- **Health**: không có disclaimer y tế.
- **Finance**: không có disclaimer rủi ro.

---

## PHẦN I — AUDIT MODE + SOURCES (CHƯA CÓ)

- Chưa có chế độ "AUDIT" hiển thị: input/timezone/sun longitude/…/từng rule diễn giải.
- Chưa có metadata `source/edition/language/rule/notes` cho TỪNG rule.
- **Đây là thiếu sót lớn nhất về auditability.**

---

## PHẦN J — KẾT LUẬN 5 TẦNG (không nói quá)

| Tầng | Trạng thái | Bằng chứng |
|---|---|---|
| 1. Code correctness (lập bàn) | ✅ khớp reference | verify_kymon PASS + atopx/qimen trace + bazi.vn 100% |
| 2. Rule consistency | ⚠️ có config nhưng còn fallback + trộn lớp | Phần B/C |
| 3. Source validation (cổ thư) | ❌ CHƯA có citation | chỉ dựa 2 engine OSS |
| 4. Cross-engine agreement | ✅ (lập bàn) | atopx + bazi.vn |
| 5. Empirical validity | ❌ không có dataset | — |

### KHÔNG ĐƯỢC PHÉP tuyên bố là chính xác

- ❌ "Chính xác 100%".
- ❌ "+7 = 70% thành công" (score KHÔNG phải probability).
- ❌ Solar-term chính xác tới phút (hiện chỉ tới ngày).
- ❌ Timezone đúng mọi nơi (hiện hardcode +7).
- ❌ Đã cover đủ 200 golden / property / boundary tests.
- ❌ Interpretation đã đầy đủ 用神/格局/空亡/马星.

---

## PHẦN K — THỨ TỰ SỬA ĐỀ XUẤT (chờ bạn xác nhận, CHƯA code)

1. Tách CALCULATION thành module thuần + `QimenBoard` (data) — có `ruleSetVersion`.
2. Bỏ mọi silent fallback → `throw`.
3. Solar-term **exact instant** (JD fractional) + timezone IANA.
4. Day-boundary config 2300/0000.
5. Tách Interpretation / HeuristicScore / Advice / Visualization thành layer riêng.
6. Question ontology + 用神 framework + output CONCLUSION/WHY/SUPPORTING/CONTRADICTING/LIMITATIONS.
7. Golden ≥200 + property + boundary tests.
8. Audit mode + source metadata từng rule.

---

*Chờ bạn xác nhận AUDIT REPORT trước khi bắt đầu sửa code.*
