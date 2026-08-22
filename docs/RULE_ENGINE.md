# RULE ENGINE — Rule engine, hệ thống điểm & versioning

## 1. Mục tiêu
- Mọi quy tắc phải có `rule_id, name, description, source/reference, priority, enabled`.
- Toàn bộ trọng số/quy tắc chỉnh sửa được qua `data/qimen_rules.json` — KHÔNG hard-code trong UI.
- Không tự bịa quy tắc. Nếu chưa chắc → `[NEEDS QIMEN RULE VALIDATION]`.

## 2. Cấu trúc qimen_rules.json (schema)
```json
{
  "ruleSetName": "Qimen Standard",
  "ruleSetVersion": "v1.0",
  "dun": {
    "method": "CHAIBU",                 // CHAIBU | ZHIRUN | MAOSHAN
    "yearStart": "LAP_XUAN",            // LAP_XUAN | DONG_CHI | LUNAR_NEW_YEAR
    "dayBoundary": "2300",              // 2300 | 0000
    "defaultTimeMode": "TRUE_SOLAR"     // CIVIL | LOCAL_MEAN_SOLAR | TRUE_SOLAR
  },
  "spiritVariant": "YIN_YANG_SWAP",     // FIXED_BAIHU_XUANWU | YIN_YANG_SWAP
  "centerPalace": { "star": "KEEP_CENTER", "gate": "NONE", "spirit": "NONE" },
  "scoring": {
    "weights": {
      "gate": 0.30, "star": 0.20, "spirit": 0.15,
      "stem": 0.10, "palace": 0.10, "relationship": 0.10, "seasonal": 0.05
    },
    "gate": {
      "sheng": 100, "kai": 85, "xiu": 75, "jing": 45, "du": 40,
      "shang": 25, "jing_men": 25, "si": 0
    },
    "star": { "thien_nham": 90, "thien_phu": 85, "thien_tam": 80, "thien_xung": 70,
      "thien_anh": 60, "thien_nhue": 50, "thien_tru": 40, "thien_bong": 30, "thien_cam": 55 },
    "spirit": { "truc_phu": 95, "cuu_thien": 85, "thai_am": 80, "luc_hop": 75,
      "cuu_dia": 65, "dang_xa": 40, "bach_ho": 25, "huyen_vu": 20 },
    "relationship": { "sinh": 100, "dong_hanh": 70, "khac": -40, "bi_khac": -60 },
    "seasonal": { "vuong": 100, "tuong": 80, "huu": 55, "tu": 30, "moc": 15, "tuyet": 0 },
    "specialCombinations": [
      { "id": "tam_ky_hoi", "name": "Tam Kỳ hội hợp", "score": 25,
        "condition": "stem==YI|BING|DING AND gate in (KHAI, XIU, SHENG)",
        "source": "Qimen Standard v1.0 (cần xác minh)", "enabled": false }
    ]
  },
  "interpretation": {
    "thresholds": {
      "VERY_FAVORABLE": 80, "FAVORABLE": 60, "MODERATE": 40,
      "UNFAVORABLE": 20, "VERY_UNFAVORABLE": 0
    },
    "labels": {
      "VERY_FAVORABLE": "Rất thuận", "FAVORABLE": "Thuận", "MODERATE": "Khá thuận",
      "UNFAVORABLE": "Không thuận", "VERY_UNFAVORABLE": "Đại hung (nên tránh)"
    }
  }
}
```
> Các giá trị điểm/trọng số ở đây là **đề xuất ban đầu**, đều đánh dấu cần xác minh trước khi dùng chính thức (xem QIMEN_RULE_VALIDATION.md).

## 3. RuleRegistry (runtime)
- Load `qimen_rules.json` → `Map<ruleId, RuleDef>`.
- Mỗi engine đọc config của mình từ registry; `enabled=false` → quy tắc bị loại khỏi kết quả và ghi vào `disabledRules` trong trace.
- Mỗi chart lưu `ruleSetVersion` + hash config → tái lập được kết quả y hệt sau này.

## 4. Qimen Score Engine
```
DirectionScore = Σ (component.score × weight)  /  Σ weight  (chuẩn hoá 0–100)
```
- Components (configurable): GateScore, StarScore, SpiritScore, StemScore, PalaceScore, RelationshipScore, SeasonalStrength, SpecialCombinations.
- Cùng một quy tắc không được tính 2 lần (dedup theo ruleId).
- **Cấm diễn đạt**: không ghi "80% thành công". Chỉ ghi:
  `QIMEN FAVORABILITY: 82/100 — Very Favorable` + câu chú: *"Đây là mức độ thuận theo rule set Kỳ Môn, không phải xác suất khoa học."*

## 5. Giải thích (Explanation Trace) — bắt buộc cho mọi kết luận
```
KẾT LUẬN: Hướng Đông — Thuận
WHY?
1. Đông = cung Chấn (Mộc).
2. Cung Chấn hiện có Sinh Môn (gate score ...).
3. Sinh Môn phù hợp với loại câu hỏi (MEETING) theo rule <id>.
4. Sao Thiên Xung trạng thái Vượng (mùa Xuân) theo rule <id>.
5. Quan hệ Ngũ hành: Cung sinh Tinh → +100 theo rule <id>.
6. Không phát hiện cấu trúc đại hung (rule <id> bật).
FINAL: Thuận theo cách luận Kỳ Môn.
```

## 6. Versioning & so sánh
- `ruleSetVersion` ghi trong mọi chart + history.
- Có thể có nhiều `rule_sets` (v1.0, v1.1, v2.0) cùng lúc; so sánh kết quả giữa các version mà không phá dữ liệu cũ (đặc tả mục XXXV).
- API `GET /api/qimen/rules` trả config hiện hành để UI hiển thị "các quy tắc đã kích hoạt".

## 7. Quy tắc "không trộn hệ thống" (đặc tả mục LV)
- 12 sao Hoàng Đạo/Hắc Đạo, Tử Vi, Tarot, Vedic, Western Zodiac, Numerology... **tuyệt đối không** được nạp vào scoring engine.
- Nếu hiển thị (so sánh giáo dục) → phải tách hẳn, gắn nhãn `EDUCATIONAL COMPARISON`, không ảnh hưởng điểm Qimen.
- Hiện prototype có "12 sao Hoàng Đạo/Hắc Đạo" và "hóa giải vật phẩm" → sẽ **dời ra module riêng**, không nằm trong Qimen score.
