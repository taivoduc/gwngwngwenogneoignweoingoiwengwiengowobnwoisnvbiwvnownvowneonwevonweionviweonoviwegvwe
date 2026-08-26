# QIMEN AUDIT REPORT

> Ngày: 26/8/2026. Phạm vi: review độc lập toàn repo, đối chiếu engine `atopx/qimen` (Go, MIT, 16 nhóm 排盘权威) + `qfdk/qimen` (JS, 茅山派).
> Nguyên tắc: KHÔNG coi test PASS là "đúng". Tách 5 tầng: (1) code correctness, (2) rule consistency, (3) source validation, (4) cross-engine agreement, (5) empirical validity.

---

## 1. Rule set (đã chốt trong code)

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| Method | 时家奇门 | — |
| Style | 转盘 | — |
| Ju method | 拆补 (CHAIBU) | 置闰 CHƯA implement |
| Day boundary | 2300 | config 2300/0000 |
| Year boundary | 立春 (LAP_XUAN) | — |
| Spirit ruleset | FIXED (白虎/玄武) | option YIN_YANG_SWAP |
| TianQin rule | JI_KUN2 (禽芮) | — |
| Calendar | Solar + sexagenary | — |

## 2. Calendar algorithm
- JD: `jdFromDate` chuẩn (Gregorian). ✅
- Day GanZhi: `(jd+49) mod 60`; kiểm chứng 01/10/1949 = Giáp Tý. ✅
- Year GanZhi: theo Li Chun (trước Lập Xuân → năm trước). ✅
- Hour GanZhi: `(dayGan*2 + hourChi) mod 10` (Ngũ Thử Độn); `hourChi = floor((h+1)/2)%12`. ✅
- Month GanZhi: **CHƯA implement** (không dùng trong Thời Gia). `[NEEDS VALIDATION]`

## 3. Solar term algorithm
- Dùng chuỗi Meeus rút gọn (`getSunLongitudeDeg`). ✅
- Tìm tiết khí = nghiệm `L(t) = k×15°`. ✅
- ⚠️ **Sai lệch**: `findTietKhiJd` trả `Math.floor(crossJd + 0.5)` — chỉ chính xác tới NGÀY,
  KHÔNG tới instant. Cần trả JD fractional để xử lý "trước/sau giao tiết" đúng. `[NEEDS VALIDATION]`
- Tiết khí hiện tại: `start ≤ target < nextStart`. ✅ (đã sửa từ "kế tiếp" → "hiện tại")

## 4. Yuan algorithm
- 甲己为符头. ✅
- Mapping explicit `YUAN_BY_CHI`: 子午卯酉=上元, 寅申巳亥=中元, 辰戌丑未=下元. ✅
- Unit test 12 nhánh: PASS. ✅

## 5. Ju algorithm
- Bảng 拆补 (`CUC_TRA`) khớp 阳遁/阴遁 ca quyết. ✅
- ⚠️ Chỉ test 1–2 case (Kinh Trập/Lập Thu). CHƯA test đủ 24 tiết × 3 nguyên × 9 cục × 2 độn. `[NEEDS VALIDATION]`

## 6. Earth plate (地盘)
- 戊己庚辛壬癸丁丙乙; Dương thuận / Âm nghịch; Mậu bắt đầu tại cục số. ✅
- ⚠️ CHƯA test đủ 9 cục × 2 directions.

## 7. Heaven plate (天盘) — **đã sửa lại**
- Lục Nghi Tuần Thủ di chuyển từ 值符原宫 → 时干落宫.
- **Xoay cứng vòng Lạc Thư, Trung cung giữ nguyên.** ✅
- SOURCE: `atopx/qimen plate.RotateStems`.
- ⚠️ Phiên trước từng dùng "xoay tuyến tính 1→9" (dựa reference tự viết SAI) — đã revert.

## 8. Nine Stars (九星)
- 值符 bay tới 时干; 8 sao theo vòng Lạc Thư thuận/nghịch. ✅
- 天禽 寄坤二 (禽芮), Trung cung không sao. ✅
- SOURCE: `atopx/qimen plate.BuildStar`.

## 9. Eight Doors (八门) — **đã sửa lại**
- **值使随时支**: 值使 từ 值符原宫 đi `(时支−旬首支) mod 12` bước thuận/nghịch, rồi 8 môn xoay vòng Lạc Thư. ✅
- SOURCE: `atopx/qimen plate.BuildDoor + MoveBy`.
- ⚠️ Phiên trước dùng "地支配八宫" (trường phái khác) — đã thay.

## 10. Eight Spirits (八神)
- Từ 值符落宫, vòng Lạc Thư thuận/nghịch. ✅
- FIXED: 值符→螣蛇→太阴→六合→白虎→玄武→九地→九天. ✅
- SOURCE: `atopx/qimen plate.BuildGod`, `qfdk/qimen`.

---


## 11. Zhonggong rule (Trung cung)
- 地盘干: Trung cung có Kỳ Nghi (giữ nguyên khi xoay Thiên bàn). ✅
- 天盘干: Trung cung giữ nguyên. ✅
- 星: Trung cung KHÔNG có sao (天禽寄坤二). ✅
- 门/神: Trung cung KHÔNG có môn/thần. ✅

## 12. Timezone
- ⚠️ **CHƯA XONG**: hardcode UTC+7. Cần IANA timezone + 3 mode CIVIL/LOCAL_MEAN_SOLAR/TRUE_SOLAR.

## 13. Day boundary
- 23:00 đổi ngày (config `2300`). Test PASS. ✅
- `[NEEDS VALIDATION]` — cần chuyên gia chốt 2300 vs 0000 (早子/晚子).

## 14. Golden cases
- 17/3/2021 03:00 (Dương độn 1) — toàn bàn. PASS. ✅
- 17/3/2021 19:00 (Giờ Giáp Tuất, phục ngâm). PASS. ✅
- 22/8/2026 10:16 (Âm độn 2). PASS. ✅
- Nguồn: cross-validate với `atopx/qimen` (trace từng hàm RotateStems/BuildDoor/BuildGod/BuildStar).
- ⚠️ CHƯA có golden case từ cổ thư (thiếu citation URL/book/page).

## 15. Cross-validation
| Engine | Thiên bàn | Bát môn | Bát thần | Đồng thuận |
|---|---|---|---|---|
| `atopx/qimen` | Lạc Thư | 值使随时支 | 白虎/玄武 | ✅ khớp |
| `qfdk/qimen` | (chưa đọc chi tiết) | — | 白虎/玄武 | ⚠️ 茅山派 |
| `bazi.vn` | Lạc Thư | — | — | ⚠️ (parse HTML mong manh) |

## 16. Known divergences
1. **Thiên bàn**: "xoay tuyến tính 1→9" (reference cũ tự viết) vs "vòng Lạc Thư" (atopx). → chọn Lạc Thư.
2. **Bát môn**: "地支配八宫" vs "值使随时支". → chọn 值使随时支 (atopx).
3. **Bát thần**: "勾陈/朱雀 (Dương)" vs "白虎/玄武 (cả 2)". → chọn FIXED, giữ SWAP làm option.
4. **天禽**: "giữ Trung cung" vs "寄坤二 (禽芮)". → chọn 寄坤二.
5. **置闰 vs 拆补**: chọn 拆补; 置闰 chưa implement.

## 17. Unverified rules (NEEDS_VALIDATION)
- Day boundary 2300 vs 0000.
- Mốc năm Can Chi (Li Chun) — chưa có cổ thư citation.
- Bát Thần FIXED vs YIN_YANG_SWAP — chưa có cổ thư citation (chỉ dựa 2 engine).
- Solar term instant (đang làm tròn tới ngày).
- Trích dẫn cổ thư cho TỪNG rule — CHƯA có (thiếu sót lớn nhất).

## 18. Interpretation heuristics
- ⚠️ Score hiện là heuristic đơn giản, CHƯA tách khỏi calculation.
- CHƯA implement: 生克/旺衰/用神/格局/空亡/驿马/门迫/入墓/击刑/伏吟/反吟.
- 12 sao Hoàng Đạo/Hắc Đạo: CHƯA tách khỏi score (đang lẫn).
- Score KHÔNG được gọi là "xác suất" — chỉ là "Qimen Evidence".

## 19. Test coverage
- `tests/qimen.test.js`: 7 tests (3 golden + nguyên + day boundary + tiết khí + năm Can Chi). ✅
- `verify_kymon.js`: 1 bảng tham chiếu Dương độn 1. ✅
- ⚠️ THIẾU test matrix đầy đủ: 24 tiết, 12 chi, 10 can, 60 Giáp Tý, 6 tuần, 9 cục, 12 giờ, Trung cung cases, 伏吟/反吟.

---

## Kết luận theo 5 tầng

| Tầng | Trạng thái |
|---|---|
| 1. Code correctness | ✅ lập bàn khớp reference (sau khi sửa 2 bug lớn) |
| 2. Rule consistency | ✅ đã tách config; default = chuẩn 转盘 |
| 3. Source validation | ⚠️ dựa 2 engine OSS, CHƯA có cổ thư |
| 4. Cross-engine agreement | ✅ khớp atopx/qimen |
| 5. Empirical validity | ❌ CHƯA có dataset thực nghiệm |

*Không có tuyên bố "chính xác 100%" — chỉ tuyên bố PASS cho từng tầng tương ứng.*
