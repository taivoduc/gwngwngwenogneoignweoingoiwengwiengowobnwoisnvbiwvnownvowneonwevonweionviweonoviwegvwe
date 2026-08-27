# QIMEN RULE VALIDATION MATRIX

> Phase XXIX — so sánh A/B cho 6 conflict, KHÔNG thay đổi default ruleset.
> Default: `ruleSetVersion 1.0.0` (CHAIBU · ZhuanPan · 2300 · FIXED · JI_KUN2 · Lạc Thư).

## Tóm tắt đo đạc (4320 cases: 180 ngày × 24 giờ, năm 2025)

| Conflict | A vs B | Khác nhau |
|---|---|---|
| #1 Thiên bàn | Lạc Thư vs LINEAR | 3386/4320 (78%) |
| #2 Bát Thần | FIXED vs YIN/YANG_SWAP | 2088/4320 (48%) |
| #3 Day boundary | 2300 vs 0000 | 180/4320 (chỉ giờ 23) |
| #6 Tian Qin | JI_KUN2 vs KEEP_CENTER | 4320/4320 (100%) |

---

## CONFLICT #1 — Heaven Plate (Thiên bàn)

| Field | Value |
|---|---|
| RULE_ID | CONFLICT-001 |
| CURRENT_RULE | Lạc Thư ring rotation, Trung cung giữ nguyên |
| ALTERNATIVE_RULE | Linear palace movement 1..9 (tất cả 9 cung) |
| SOURCE_A | `atopx/qimen` `RotateStems` (Lạc Thư) |
| SOURCE_B | (không có citation cổ thư đáng tin) |
| ENGINE_A | atopx/qimen (Go) |
| ENGINE_B | (chưa có engine dùng linear đáng tin) |
| TEST_CASES | 4320 cases (đã đo) + golden 17/3/2021 |
| RESULT | khác 78%; VD cung 1: Lạc Thư=Canh vs LINEAR=Mậu |
| TRADITIONAL_SCHOOL | ZhuanPan (转盘) |
| CURRENT_STATUS | **CONFLICTED** |
| DECISION | Giữ Lạc Thư (khớp 2 engine độc lập: atopx + bazi.vn) — chờ cổ thư |

## CONFLICT #2 — Eight Spirits (Bát Thần)

| Field | Value |
|---|---|
| RULE_ID | CONFLICT-002 |
| CURRENT_RULE | FIXED: 值符→螣蛇→太阴→六合→白虎→玄武→九地→九天 |
| ALTERNATIVE_RULE | YIN/YANG_SWAP: Dương dùng 勾陈/朱雀 |
| SOURCE_A | `atopx/qimen` BuildGod + `qfdk/qimen` (白虎/玄武) |
| SOURCE_B | truyền thống phổ biến (勾陈/朱雀 cho Dương) |
| ENGINE_A | atopx/qimen |
| ENGINE_B | (trường phái Việt, chưa có engine OSS riêng) |
| TEST_CASES | 4320 cases; khác 48% (= toàn bộ Dương độn) |
| RESULT | Dương độn khác 2/8 thần; Âm độn giống |
| TRADITIONAL_SCHOOL | ZhuanPan |
| CURRENT_STATUS | **CONFLICTED** (SCHOOL_DEPENDENT) |
| DECISION | Default FIXED; giữ SWAP làm option — chờ chuyên gia |

## CONFLICT #3 — Day Boundary

| Field | Value |
|---|---|
| RULE_ID | CONFLICT-003 |
| CURRENT_RULE | 2300 (晚子时归次日) |
| ALTERNATIVE_RULE | 0000 |
| SOURCE_A | `atopx/qimen` (23点换日) |
| SOURCE_B | hệ hiện đại (0:00) |
| TEST_CASES | 180 ngày × giờ 23 → khác; chi tiết ở DAY_BOUNDARY_REPORT.md |
| RESULT | chỉ khác giờ 23:00–23:59 (day Gan-Zhi → kéo theo hour Gan-Zhi, Xun, Yuan, Ju, cả bàn) |
| TRADITIONAL_SCHOOL | ZhuanPan (晚子) |
| CURRENT_STATUS | **SCHOOL_DEPENDENT** |
| DECISION | Default 2300; đã thêm option 0000 — chờ chuyên gia |

## CONFLICT #4 — Zhi Shi (值使)

| Field | Value |
|---|---|
| RULE_ID | CONFLICT-004 |
| CURRENT_RULE | 值使随时支 (đếm bước 时支−旬首支) |
| ALTERNATIVE_RULE | 值使随时宫 (地支配八宫) |
| SOURCE_A | `atopx/qimen` BuildDoor (随时支) |
| SOURCE_B | tài liệu "地支配八宫" |
| TEST_CASES | golden 17/3/2021 (Hưu môn: 随时支=cung 3; 随时宫=cung 8) |
| RESULT | khác toàn bộ 8 môn |
| TRADITIONAL_SCHOOL | ZhuanPan |
| CURRENT_STATUS | **CONFLICTED** |
| DECISION | Giữ 随时支 (khớp 2 engine) — chờ cổ thư |

## CONFLICT #5 — Ju method (拆补 vs 置闰)

| Field | Value |
|---|---|
| RULE_ID | CONFLICT-005 |
| CURRENT_RULE | CHAIBU (拆补) |
| ALTERNATIVE_RULE | ZHIRUN (置闰) |
| SOURCE_A | (chưa có citation cổ thư cho CHAIBU) |
| SOURCE_B | `atopx/qimen` (置闰 default, mô tả: 符头超前满九日→芒种/大雪置闰) |
| TEST_CASES | CHƯA có (ZHIRUN chưa implement) |
| RESULT | **UNRESOLVED** |
| TRADITIONAL_SCHOOL | — |
| CURRENT_STATUS | **UNRESOLVED** |
| DECISION | Default CHAIBU; ZHIRUN cần implement + source xác minh |

## CONFLICT #6 — Tian Qin (天禽)

| Field | Value |
|---|---|
| RULE_ID | CONFLICT-006 |
| CURRENT_RULE | JI_KUN2 (禽芮 — 天禽 theo 天芮, Trung không sao) |
| ALTERNATIVE_RULE | KEEP_CENTER (天禽 giữ Trung cung) |
| SOURCE_A | `atopx/qimen` (禽芮寄坤二) |
| SOURCE_B | một số tài liệu giữ 天禽 tại Trung |
| TEST_CASES | 4320 cases; khác 100% (cung 5 có/không sao) |
| RESULT | khác đúng 1 vị trí (Trung cung) |
| TRADITIONAL_SCHOOL | ZhuanPan |
| CURRENT_STATUS | **PARTIALLY_SUPPORTED** (physical vs display placement cần tách) |
| DECISION | Default JI_KUN2; đã thêm option KEEP_CENTER — chờ chuyên gia |
