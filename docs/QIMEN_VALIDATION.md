# QIMEN VALIDATION — Status

> ruleSetVersion: 1.0.0 · baseline commit: 7dc8d1f · tag: qimen-pre-validation

## Acceptance criteria (PHẦN XXVI)

| # | Tiêu chí | Trạng thái |
|---|---|---|
| 1 | 0 silent fallback | ✅ (đã throw QimenCalculationError) |
| 2 | 0 undefined | ✅ (property test) |
| 3 | 0 NaN | ✅ (property + fuzz test) |
| 4 | deterministic | ✅ (1000 runs y hệt) |
| 5 | ≥200 golden cases | ❌ **chỉ 3 golden** (cần nguồn độc lập, không tự sinh) |
| 6 | ≥10,000 fuzz cases | ✅ 10,000 fuzz PASS |
| 7 | boundary tests | ⚠️ solar-term ±30/10/1 min ✅; day-boundary 22:59/23:00/… ❌ |
| 8 | solar-term instant tests | ✅ 72 checks (24 tiết × 3 năm) |
| 9 | timezone tests | ❌ (chưa có IANA timezone) |
| 10 | cross-engine comparison | ⚠️ thủ công (atopx + bazi.vn); chưa tự động |
| 11 | rule source registry | ✅ QIMEN_SOURCES.md (17 rule) |
| 12 | unresolved conflicts documented | ✅ QIMEN_RULE_CONFLICTS.md (6 conflict) |

## FINAL STATUS

**CALCULATION ENGINE = NOT FULLY VALIDATED**

Lý do chưa đạt:
1. Golden cases chỉ 3 (cần ≥200 từ nguồn độc lập, KHÔNG tự sinh để tránh tự chứng minh).
2. Timezone vẫn hardcode +7 (chưa IANA/DST/longitude).
3. Day-boundary chỉ 1 mode (2300), chưa có 0000 + test đầy đủ.
4. Cross-engine chưa tự động hóa (chưa có adapter Engine A/B/C + report JSON).
5. Kiến trúc chưa tách (calc/interp/heuristic/advice/visualization vẫn trong 1 file HTML).

## ĐÃ ĐẠT (an toàn, không đổi kết quả)

- ✅ Lập bàn đúng (verify_kymon + atopx trace + bazi.vn 100%).
- ✅ Bỏ 8 silent fallback → throw.
- ✅ QimenBoard immutable + ruleSetVersion + ruleSetHash.
- ✅ 1008 property boards + 10,000 fuzz + 1000 determinism + 72 solar-term boundary.
- ✅ Solar-term exact instant (fractional JD).
- ✅ RULESET_LOCK + SOURCES + CONFLICTS + AUDIT_REPORT.

## PHÂN BIỆT RÕ (bắt buộc)

1. Traditional Qimen calculation — ✅ đã khóa & test.
2. Traditional interpretation — ❌ chưa có (chỉ 8 chủ đề heuristic).
3. Heuristic scoring — ⚠️ có, nhưng chưa tách & chưa gắn nhãn rõ trong output.
4. Practical advice — ⚠️ có, chưa phân CLASSICAL/SYMBOLIC/PRACTICAL.
5. Empirical/scientific evidence — ❌ không có.

## KHÔNG ĐƯỢC TUYÊN BỐ

- ❌ "100% accurate" / "scientifically proven" / "probability of success" / "guaranteed prediction".
- ❌ Solar-term đúng mọi timezone (hiện +7).
- ❌ Đã đủ golden cases (chỉ 3).
- ❌ Score là xác suất (chỉ là heuristic).
