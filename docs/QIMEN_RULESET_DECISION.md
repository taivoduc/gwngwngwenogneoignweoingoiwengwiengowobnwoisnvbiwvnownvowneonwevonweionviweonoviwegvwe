# QIMEN RULESET DECISION — Final Table

> Phase XXIX. Nguyên tắc: KHÔNG ép quyết định nếu thiếu chứng cứ → `UNRESOLVED`.

| Rule | Decision | Evidence | School | Confidence |
|---|---|---|---|---|
| Day Gan-Zhi | `(jd+49)%60` | 01/10/1949=Giáp Tý (textbook) | — | VERIFIED |
| Solar term | exact instant (Meeus rút gọn) | boundary ±30/10 min (72 checks) | — | VERIFIED (computationally); thiếu nutation → MEDIUM về thiên văn |
| Yuan | 子午卯酉=上, 辰戌丑未=下, 寅申巳亥=中 | 12 nhánh test | CHAIBU | VERIFIED |
| Ju | CUC_TRA (24 tiết × 3 nguyên) | golden (Kinh Trập, Lập Thu) | CHAIBU | SUPPORTED (chưa test đủ 72 cục) |
| Di Pan | 戊己庚辛壬癸丁丙乙, thuận/nghịch | property 1008 boards | — | VERIFIED |
| Xun Shou | 6 tuần → 6 Lục Nghi | golden | — | VERIFIED |
| Zhi Fu | 值符随干 | golden + atopx | ZhuanPan | SUPPORTED |
| Zhi Shi | 值使随时支 | golden + bazi.vn 100% | ZhuanPan | SUPPORTED |
| **Heaven Plate** | **Lạc Thư ring** | atopx + bazi.vn (78% khác linear) | ZhuanPan | **CONFLICTED** (chờ cổ thư) |
| Nine Stars | 值符→时干, vòng Lạc Thư | golden + property | ZhuanPan | SUPPORTED |
| Eight Doors | 值使随时支 → vòng Lạc Thư | golden + property | ZhuanPan | SUPPORTED |
| **Eight Spirits** | **FIXED (白虎/玄武)** | atopx + qfdk | ZhuanPan | **SCHOOL_DEPENDENT** |
| **Tian Qin** | **JI_KUN2 (禽芮)** | atopx (禽芮寄坤二) | ZhuanPan | **PARTIALLY_SUPPORTED** |
| Year boundary | Li Chun (fractional) | 2 test | — | VERIFIED |
| **Day boundary** | **2300** | atopx (晚子时) | ZhuanPan | **SCHOOL_DEPENDENT** |
| **Ju method** | **CHAIBU** | golden | — | **UNRESOLVED** (vs ZHIRUN) |
| Timezone | +7 hardcode | — | — | **UNVERIFIED** |
| Score | Môn+Tinh+Thần heuristic | — | — | HEURISTIC (không phải xác suất) |

## Tóm tắt

| Confidence | Số rule |
|---|---|
| VERIFIED | 6 |
| SUPPORTED | 5 |
| CONFLICTED / SCHOOL_DEPENDENT / PARTIALLY_SUPPORTED | 4 |
| UNRESOLVED / UNVERIFIED | 2 (Ju method, Timezone) |

## Trạng thái cuối

**CALCULATION ENGINE = VALIDATED WITH UNRESOLVED RULE CONFLICTS**

Lý do chưa "FULLY VALIDATED":
1. Heaven Plate (Lạc Thư vs linear) — chưa có citation cổ thư.
2. Eight Spirits (FIXED vs SWAP) — school-dependent.
3. Day boundary (2300 vs 0000) — school-dependent.
4. Ju method (CHAIBU vs ZHIRUN) — ZHIRUN chưa implement.
5. Timezone — chưa IANA.

*KHÔNG tự sửa rule cốt lõi khi chưa có DECISION OWNER (chuyên gia cổ thư).*
