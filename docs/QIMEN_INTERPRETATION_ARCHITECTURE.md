# QIMEN INTERPRETATION ARCHITECTURE

> Version: interpretation-1.0.0 · ruleSetVersion (calc): 1.0.0 · Ngày: 28/8/2026
> Mục tiêu: thay thế mô hình `Môn+Tinh+Thần = score` bằng pipeline
> Knowledge Graph + Rule Engine + Evidence trace. KHÔNG đổi Calculation Engine.

## 1. Pipeline tổng thể

```
QimenBoard (anBan, immutable, ruleSetVersion 1.0.0)
        │
        ▼
Chart Normalizer (lib/chartNormalizer.js)
        │  tách bạch palace.element vs door/star/deity.element (intrinsic)
        ▼
Qimen Knowledge Graph (knowledge/*.js — data-driven)
        │
        ▼
Question Ontology (knowledge/question-types.js — 23 loại câu hỏi)
        │
        ▼
用神 Resolver (lib/yongShenResolver.js)
        │
        ▼
Relation Analyzer (lib/qimenRelations.js + knowledge/five-elements.js)
        │  5 quan hệ: sameElement / generates / generatedBy / controls / controlledBy
        ▼
Rule Engine (lib/ruleEngine.js + knowledge/rules.js)
        │  5 cấp ưu tiên L1..L5
        ▼
Findings / Evidence (mỗi finding truy ngược: finding → rule → knowledge node)
        │
        ▼
Interpretation Synthesizer (lib/interpretationSynthesizer.js)
        │  kết luận theo DIMENSION (career/wealth/relationship/health/...)
        ▼
Conclusion + Advice (lib/adviceEngine.js — PRACTICAL/SYMBOLIC/SAFETY)
        │
        ▼
interpretQimen(chart, question, options) → { chartId, questionType, yongShen,
    findings, relations, conclusion, advice, provenance, ruleSetVersion, explain() }
```

## 2. Các thành phần

### 2.1 Calculation Engine
- **KHÔNG thay đổi** trong phase này. Vẫn là `anBan()` trong `kymon.html`
  (ShiJia · ZhuanPan · CHAIBU · 2300 · FIXED · JI_KUN2 · Lạc Thư — ruleSetVersion 1.0.0).
- Input của Interpretation Engine là QimenBoard **immutable** đã được anBan trả về.

### 2.2 Chart Normalizer
- `normalizeChart(chart)` → normalized chart.
- **Tách bạch ngũ hành:** `palace.element` (cố hữu của cung) ≠
  `door.element / star.element / deity.element` (cố hữu của biểu tượng).
  Ví dụ Thiên Tâm = Kim dù đang rơi vào Chấn = Mộc.
- Kèm `time` (can chi giờ, tuần không, cục), `trucPhu/trucSu`.

### 2.3 Knowledge Graph
- 10 file data-driven trong `knowledge/` (xem QIMEN_KNOWLEDGE_GRAPH.md).
- Node types: Palace, Direction, Trigram, FiveElement, Door, Star, Deity,
  HeavenlyStem, EarthlyStem, SolarTerm (qua info.cuc.tiet), QuestionType,
  YongShen, Pattern, Relationship, InterpretationRule.

### 2.4 Question Ontology
- 23 loại câu hỏi (CAREER, WEALTH, BUSINESS, INVESTMENT, MARRIAGE, LOVE,
  HEALTH, LITIGATION, TRAVEL, LOST_OBJECT, SAFETY, STUDY, EXAM,
  JOB_INTERVIEW, PARTNERSHIP, REAL_ESTATE, PROJECT, COMPETITION, GENERAL,
  CHILDREN, REPUTATION, ENDING, SPIRITUAL).
- UI hiển thị 16 chủ đề lớn (4×4): Sự nghiệp, Tài lộc, Kinh doanh, Nhà đất,
  Hợp tác, Hôn nhân, Con cái, Sức khỏe, Học hành, Danh tiếng, Đi lại,
  Kiện tụng, An toàn, Tìm kiếm, Kết thúc, Tâm linh — mỗi ô chạy đúng type
  riêng (LOVE/EXAM/INVESTMENT/JOB_INTERVIEW/PROJECT/COMPETITION dùng qua
  nhận diện keyword, không hiển thị riêng).
- Mỗi loại: primaryYongShen, secondaryYongShen, relevantDoors/Stars/Deities/
  Palaces, dimensions, school, confidence.
- Nhận diện tự động từ văn bản tiếng Việt (keyword) hoặc truyền `type` tường minh.

### 2.5 YongShen Resolver
- `resolveYongShen(norm, questionType, options)` → primary/secondary/all.
- Ref: DOOR/STAR/DEITY/PALACE/STEM(dayStem/hourStem)/CHARTSYMBOL(zhiFu/zhiShi).
- KHÔNG silent fallback: ref không định vị được (vd Giáp ẩn) → `palace: null`
  + ghi chú lý do.

### 2.6 Rule Engine
- `knowledge/rules.js`: 11 rule nhóm 5 cấp ưu tiên.
- Rule chỉ tạo Finding, KHÔNG sửa chart, KHÔNG kết luận.
- Dedup: mỗi (ruleId, subject) chỉ 1 finding.

### 2.7 Interpretation Synthesizer
- Kết luận theo **dimension** — một cung có thể thuận cho career, không thuận
  cho travel.
- **Ràng buộc hướng:** truyền `options.focusPalace` (cung đang hướng tới) →
  Rule Engine chỉ quét cung đó (+ pattern toàn bàn 伏吟/反吟) và thêm 2 rule
  hướng: `FOCUS_PALACE_PROFILE` (hồ sơ cung hướng) + `YONG_SHEN_FOCUS_RELATION`
  (quan hệ 用神 ↔ cung hướng). Đổi hướng → đổi kết quả.
- Weight: polarity(±) × strength(STRONG 2 / MODERATE 1.5 / WEAK 1) × priority
  (L1-L2 ×3, L3 ×2, L4 ×1.5, L5 ×1).
- Output: summary, dimensions[], favorableFactors, unfavorableFactors, risks,
  opportunities, timing, direction, evidence.
- KHÔNG claim xác suất/tuyệt đối.

### 2.8 Advice Engine
- Tách rời interpretation: advice có category PRACTICAL / SYMBOLIC / SAFETY.
- Health / wealth / litigation luôn kèm safety framing.

### 2.9 Explain Mode
- `explainInterpretation(result)` → trace [RULE]/[EVIDENCE]/[EFFECT]/[SYNTHESIS].

## 3. API

```js
const iq = require('./index.js');
const result = iq.interpretQimen(chart, { type: 'CAREER', text: 'Tôi có nên đổi việc?' }, { focusPalace: dir.palace });
// chart: QimenBoard từ anBan (kymon.html)
// options: { focusPalace (cung hướng — UI truyền dir.palace), school, horseSource, questionTypeOverride }
```

## 4. Legacy Score
- `palaceScore()/normalizeScore()` GIỮ NGUYÊN cho UI (màu hiển thị) —
  đánh dấu LEGACY HEURISTIC, có alias `legacyHeuristicScore`.
- Interpretation Engine KHÔNG gọi các hàm này.
- L5 (TOPIC_AFFINITY) kế thừa dữ liệu CHU_DE cũ dưới dạng **heuristic có nhãn**
  (sourceType HEURISTIC, confidence LOW) — chỉ là 1 đầu vào trọng số thấp.

## 5. School Dependency
- Rule nào phụ thuộc trường phái → `schoolDependent: true` + `schoolNote`
  (vd 空亡 theo giờ vs ngày; 入墓 chỉ tính cho can 用神 hay mọi can;
  Mã tinh theo giờ vs ngày; 击刑 can Thiên bàn vs Địa bàn).
- KHÔNG silent merge trường phái — ghi rõ trong finding + docs.

## 6. Files

| File | Vai trò |
|---|---|
| knowledge/*.js (10 file) | Knowledge Graph data |
| lib/chartNormalizer.js | Chuẩn hóa chart |
| lib/qimenRelations.js | Relation engine |
| lib/yongShenResolver.js | 用神 resolver |
| lib/ruleEngine.js | Rule engine runner |
| lib/interpretationSynthesizer.js | Tổng hợp kết luận |
| lib/adviceEngine.js | Advice engine |
| lib/explain.js | Explain mode |
| lib/interpret.js | API interpretQimen |
| index.js | Public API |
| qimen-interpreter.bundle.js | Browser bundle (window.KYMON_IQ) |
| scripts/build-interpreter-bundle.js | Build bundle |
| tests/interpretation-*.test.js | Tests (6 file + ui-panel) |
