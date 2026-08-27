# QIMEN PHASE XXX REPORT — Calendar / Ju-Rule Validation

> ruleSetVersion: 1.0.0 · baseline: `qimen-pre-validation` (7dc8d1f) · Default: CHAIBU + ZhuanPan + 2300.

## 1. ZHIRUN implementation

- `resolveJuZhiRun(month, day, year)` + `zhiRunWorkingTermName()` — **engine ĐỘC LẬP**, không sửa CHAIBU.
- Port từ: `atopx/qimen internal/compute/zhirun.go` (MIT).
- API: `anBan(date, { juRule: 'CHAIBU' | 'ZHIRUN' })` (default `CHAIBU`).
- Nguyên (上/中/下) dùng CHUNG với CHAIBU (符头 branch: 子午卯酉=上, 寅申巳亥=中, 辰戌丑未=下).
- Khác biệt duy nhất: **用局节气** (working term) theo solstice-anchored grid + 置闰 (芒种/大雪 lặp khi 符头超前满九日).

## 2. Sources (source traceability)

| Thuật ngữ | Ý nghĩa | Nguồn |
|---|---|---|
| 超神 (Chao Shen) | 符头 đến TRƯỚC tiết khí (lead 0..7 ngày) | atopx `adoptingLeader` |
| 接气 (Jie Qi) | 符头 đến SAU tiết khí (sau 置闰) | atopx `adoptingLeader` |
| 正授 | 符头 trùng tiết khí (lead = 0) | atopx |
| 置闰 (Zhi Run) | 芒种/大雪 lặp thêm 1 三元 (30 ngày) khi 符头超前满九日 | atopx `ZHI_RUN_THRESHOLD=7` |
| 芒种 / 大雪 | 2 tiết được phép 置闰 | atopx |
| 冬至 / 夏至 | 2 điểm chí (anchor của lịch 置闰) | atopx `TermOf` |
| 甲子/己卯/甲午/己酉 | 4 符头 leader (上元, 15-day grid) | atopx `leaderDay` |
| 符头 (Fu Tou) | ngày 甲/己 (nguyên) + 15-day leader (term) | CHAIBU + ZHIRUN |

**Nguồn đã dùng:** `atopx/qimen` (INDEPENDENT_IMPLEMENTATION, đọc source trực tiếp). **CHƯA có classical text** (cần chuyên gia cung cấp).

## 3. Golden cases

- `data/qimen_golden_cases.json`: 3 case CHAIBU có provenance.
- **CHƯA đạt 200** — cần nguồn độc lập (cổ thư/textbook/engine), KHÔNG tự sinh.

## 4. Cross-engine results

- CHAIBU: khớp `atopx/qimen` (lập bàn) + `bazi.vn` (100%, 1 case).
- ZHIRUN: port từ atopx; **invariant test PASS** nhưng CHƯA cross-validate từng cục vs atopx golden (chưa chạy được Go).

## 5. CHAIBU/ZHIRUN conflicts

- Đo trên 5040 ngày (2015–2044): **1724/5040 ngày (34%) khác cục**.
- Khác biệt tập trung quanh 置闰 (芒种/大雪) và ranh giới 超神/接气.

## 6. Timezone results

- Chưa implement IANA; `timezoneMode` ghi nhãn `IANA_CIVIL` nhưng thực tế vẫn hardcode +7.
- **Chưa đạt Part 6** (cần IANA/DST/longitude).

## 7. Day-boundary results

- `anBan(date, {dayBoundaryMode:'2300'|'0000'})` — đã implement.
- `docs/DAY_BOUNDARY_REPORT.md`: khác nhau chỉ giờ 23:00–23:59; cục/yuan KHÔNG đổi.

## 8. Test counts

| Test | Kết quả |
|---|---|
| golden (CHAIBU) | 7/7 PASS |
| property | 1008 boards PASS |
| boundary (solar term) | 72 PASS |
| fuzz | 10,000 PASS |
| determinism | 1000 PASS |
| conflict A/B | 4320 PASS |
| **zhirun invariant+differential** | 5040 days PASS |
| verify_kymon | PASS |

## 9. Failures

**0.**

## 10. Unresolved rules

- ZHIRUN chưa cross-validate từng cục (chỉ invariant).
- Timezone chưa IANA.
- 4 conflict trước (Thiên bàn/Bát thần/day boundary/值使) vẫn chờ cổ thư.
- Golden < 200.

## 11. Current default

CHAIBU + ZhuanPan + 2300 (KHÔNG đổi).

## 12. RuleSet version/hash

`1.0.0` (hash tính từ QIMEN_CONFIG; ghi trong mỗi board + mỗi error).

## Final status

**CALCULATION ENGINE = VALIDATED BUT NOT FULLY SOURCE-TRACEABLE**

(Lý do: ZHIRUN đã implement + invariant PASS, CHAIBU vẫn PASS, nhưng golden < 200 và chưa có classical source citation cho từng rule.)

KHÔNG tuyên bố: "100% accurate", "scientifically proven", "guaranteed prediction", "probability of success".
