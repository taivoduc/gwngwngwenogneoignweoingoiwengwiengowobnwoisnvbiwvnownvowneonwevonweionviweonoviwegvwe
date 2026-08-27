# QIMEN SOURCES — Rule Source Registry

> Mỗi rule có metadata. KHÔNG ghi "đúng theo cổ thư" nếu không có nguồn cụ thể.
> Phân loại nguồn: CLASSICAL (cổ thư), TEXTBOOK (sách giáo khoa), INDEPENDENT_IMPLEMENTATION (engine OSS), EMPIRICAL, HEURISTIC, UNVERIFIED.

| Rule ID | Rule | Current implementation | Source | School | Validation | Confidence | Conflicts |
|---|---|---|---|---|---|---|---|
| RULE-QM-001 | Day Gan-Zhi | `(jd+49)%60` | TEXTBOOK (calendar chuẩn) | — | 01/10/1949=Giáp Tý ✅ | HIGH | — |
| RULE-QM-002 | Solar term | `getSunLongitudeDeg` (Meeus rút gọn) → exact instant (fractional JD) | TEXTBOOK (Meeus, rút gọn) | — | boundary ±30/10 min ✅ | MEDIUM (thiếu nutation/aberration) | day vs instant (đã fix) |
| RULE-QM-003 | Yuan | `YUAN_BY_CHI`: 子午卯酉=上, 辰戌丑未=下, 寅申巳亥=中 | TEXTBOOK | CHAIBU | 12 nhánh ✅ | HIGH | — |
| RULE-QM-004 | Ju | `CUC_TRA` 24 tiết × 3 nguyên | TEXTBOOK (ca quyết) | CHAIBU | golden ✅ | HIGH | 拆补 vs 置闰 |
| RULE-QM-005 | Di Pan | 戊己庚辛壬癸丁丙乙; Dương thuận/Âm nghịch | TEXTBOOK | — | property ✅ | HIGH | — |
| RULE-QM-006 | Xun Shou | 6 tuần → 6 Lục Nghi | TEXTBOOK | — | golden ✅ | HIGH | — |
| RULE-QM-007 | Zhi Fu (值符随干) | sao bản cung chứa Lục Nghi; bay tới 时干 | INDEPENDENT (atopx) | ZhuanPan | golden ✅ | HIGH | — |
| RULE-QM-008 | Zhi Shi (值使随时支) | `moveBy(giapKyCung, 时支−旬首支)` | INDEPENDENT (atopx BuildDoor) | ZhuanPan | golden + bazi.vn ✅ | MEDIUM | 值使随时支 vs 值使随时宫 |
| RULE-QM-009 | Heaven plate | vòng Lạc Thư xoay cứng, Trung giữ nguyên | INDEPENDENT (atopx RotateStems) | ZhuanPan | golden + bazi.vn ✅ | MEDIUM | Lạc Thư vs tuyến tính |
| RULE-QM-010 | Nine stars | 值符→时干, vòng Lạc Thư thuận/nghịch | INDEPENDENT (atopx BuildStar) | ZhuanPan | golden + property ✅ | HIGH | 天禽寄坤2 vs giữ Trung |
| RULE-QM-011 | Eight doors | 值使随时支 → xoay vòng Lạc Thư | INDEPENDENT (atopx BuildDoor) | ZhuanPan | golden + property ✅ | MEDIUM | — |
| RULE-QM-012 | Eight spirits | FIXED: 白虎/玄武 | INDEPENDENT (atopx BuildGod + qfdk) | ZhuanPan | golden + property ✅ | MEDIUM | FIXED vs YIN/YANG SWAP |
| RULE-QM-013 | Tian Qin | JI_KUN2 (禽芮) | INDEPENDENT (atopx) | ZhuanPan | property ✅ | MEDIUM | KEEP_CENTER / WITH_TIAN_RUI |
| RULE-QM-014 | Year boundary | Li Chun (fractional instant) | TEXTBOOK | — | test 2 case ✅ | HIGH | Li Chun vs Đông Chí vs Tết |
| RULE-QM-015 | Day boundary | 2300 | INDEPENDENT (atopx 晚子时) | — | test 1 ✅ | MEDIUM | 2300 vs 0000 |
| RULE-QM-016 | Timezone | hardcode +7 | UNVERIFIED | — | ❌ chưa | LOW | — |
| RULE-QM-017 | Scoring | Môn+Tinh+Thần ±1 ×2.5 | HEURISTIC | — | — | LOW (chỉ heuristic) | — |

## Ghi chú

- Các rule đánh dấu `INDEPENDENT_IMPLEMENTATION` chỉ dựa trên engine OSS (`atopx/qimen`, `qfdk/qimen`, `bazi.vn`) — **CHƯA có citation cổ thư**.
- Cần bổ sung nguồn cổ thư (sách, trang, bản dịch) cho từng rule để đạt "source-traceable".
