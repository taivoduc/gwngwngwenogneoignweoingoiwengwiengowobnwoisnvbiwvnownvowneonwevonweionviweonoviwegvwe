# QIMEN INTERPRETATION RULES

> Danh sách rule của Interpretation Engine (interpretation-1.0.0).
> Mỗi rule: id · cấp ưu tiên · nguồn · school · confidence.

## Thứ bậc ưu tiên

| Cấp | Priority | Loại |
|---|---|---|
| L1 | 100 | STRUCTURAL — điều kiện cấu trúc cứng |
| L2 | 80 | CLASSICAL_PATTERN — mẫu cổ điển tường minh |
| L3 | 60 | FIVE_ELEMENT_RELATION — quan hệ ngũ hành |
| L4 | 40 | SYMBOLISM — biểu tượng nội tại |
| L5 | 20 | HEURISTIC — diễn giải heuristic (có nhãn) |

## Danh sách rule

| id | Cấp | Mô tả | Nguồn | School | Confidence |
|---|---|---|---|---|---|
| TRUNG_CUNG_NO_SYMBOLS | L1 | Trung cung không Môn/Tinh/Thần → không luận trực tiếp | PROJECT_RULE (invariant) | CURRENT_PROJECT | HIGH |
| PATTERNS:FU_YIN | L2 | 伏吟: Thiên bàn = Địa bàn mọi cung → trì trệ | CLASSICAL_TEXT | ZhuanPan | MEDIUM |
| PATTERNS:FAN_YIN | L2 | 反吟: Thiên can = Địa can cung đối → biến động | CLASSICAL_TEXT | ZhuanPan | MEDIUM |
| PATTERNS:MEN_PO | L2 | 门迫: Môn khắc cung → trở lực | CLASSICAL_TEXT | ZhuanPan | MEDIUM |
| PATTERNS:RU_MU | L2 | 入墓: can Thiên bàn vào mộ khố | CLASSICAL_TEXT | ZhuanPan | MEDIUM (school-dependent) |
| PATTERNS:KONG_WANG | L2 | 空亡: cung tuần không của GIỜ | CLASSICAL_TEXT | ZhuanPan | MEDIUM (giờ vs ngày) |
| PATTERNS:YI_MA | L2 | 驿马: cung Mã tinh (theo giờ) | CLASSICAL_TEXT | ZhuanPan | MEDIUM (giờ vs ngày) |
| PATTERNS:JI_XING | L2 | 六仪击刑: Lục Nghi vào cung bị hình | CLASSICAL_TEXT | ZhuanPan | LOW (biến thể) |
| DOOR_PALACE_RELATION | L3 | Môn–Cung sinh/khắc/đồng hành | CLASSICAL_TEXT | ZhuanPan | MEDIUM (school-dependent) |
| STAR_PALACE_RELATION | L3 | Tinh–Cung sinh/khắc/đồng hành | CLASSICAL_TEXT | ZhuanPan | MEDIUM (school-dependent) |
| DEITY_PALACE_RELATION | L3 | Thần–Cung sinh/khắc/đồng hành | CLASSICAL_TEXT | ZhuanPan | MEDIUM (school-dependent) |
| STEM_HEAVEN_EARTH_RELATION | L3 | Thiên can–Địa can trong cung | CLASSICAL_TEXT | ZhuanPan | MEDIUM (school-dependent) |
| YONG_SHEN_PALACE_RELATION | L3 | 用神 vs cung (gồm 用神 rơi vào 空亡) | PROJECT_RULE | CURRENT_PROJECT | MEDIUM |
| DOOR_NATURE_RELEVANT | L4 | Bản chất Môn liên quan câu hỏi | PROJECT_RULE (knowledge/doors.js) | CURRENT_PROJECT | MEDIUM |
| STAR_NATURE_RELEVANT | L4 | Bản chất Tinh liên quan câu hỏi | PROJECT_RULE (knowledge/stars.js) | CURRENT_PROJECT | MEDIUM |
| DEITY_NATURE_RELEVANT | L4 | Bản chất Thần liên quan câu hỏi | PROJECT_RULE (knowledge/deities.js) | CURRENT_PROJECT | MEDIUM |
| TOPIC_AFFINITY | L5 | Độ phù hợp chủ đề (CHU_DE cũ) | HEURISTIC | CURRENT_PROJECT | LOW |

## Ánh xạ polarity của quan hệ ngũ hành (L3)

| Quan hệ | Polarity | Ghi chú |
|---|---|---|
| sameElement | FAVORABLE / WEAK | Đồng hành, khí hòa |
| generates (A sinh B) | NEUTRAL / MODERATE | A hao khí — school-dependent |
| generatedBy (A được B sinh) | FAVORABLE / MODERATE | A được nuôi dưỡng |
| controls (A khắc B) | UNFAVORABLE / MODERATE | (Môn khắc cung = MEN_PO, L2) |
| controlledBy (A bị B khắc) | UNFAVORABLE / WEAK | A bị áp chế |

> LƯU Ý: cách quy polarity có biến thể giữa trường phái — mọi finding L3
> đều gắn `schoolDependent: true`.

## Quy tắc đạo đức (bắt buộc)
- KHÔNG dùng score heuristic làm conclusion chính.
- KHÔNG claim xác suất / "100%" / "đảm bảo".
- KHÔNG viết "theo cổ nhân..." thiếu nguồn — phải ghi `source` + `sourceType`.
- HEALTH/WEALTH/LITIGATION luôn kèm safety framing.
