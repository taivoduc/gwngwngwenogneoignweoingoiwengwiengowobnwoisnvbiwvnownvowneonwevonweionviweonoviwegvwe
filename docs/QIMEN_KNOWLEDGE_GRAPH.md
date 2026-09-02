# QIMEN KNOWLEDGE GRAPH

> Knowledge Graph của Interpretation Engine — data-driven, dễ audit.
> Mỗi node có id ổn định + tên Hán/Việt + ngũ hành NỘI TẠI (intrinsic).

## Node types

Palace · Direction · Trigram · FiveElement · Door · Star · Deity ·
HeavenlyStem · EarthlyStem · SolarTerm · QuestionType · YongShen ·
Pattern · Relationship · InterpretationRule

## Các file knowledge/

| File | Node | Số node | Nguồn |
|---|---|---|---|
| knowledge/palaces.js | Palace + Direction + Trigram | 9 | Hậu Thiên Bát Quái |
| knowledge/doors.js | Door | 8 | MON_LUAN (project) + classicalNature |
| knowledge/stars.js | Star | 9 | TINH_LUAN (project) |
| knowledge/deities.js | Deity | 10 (8 FIXED + 2 YIN_YANG_SWAP) | THAN_LUAN/THAN_HANH (project) |
| knowledge/stems.js | HeavenlyStem (10) + EarthlyStem (12) + ánh xạ | 22 | Can chi chuẩn |
| knowledge/five-elements.js | FiveElement + Relationship | 5 | Tương sinh/tương khắc |
| knowledge/question-types.js | QuestionType | 19 | PROJECT_RULE (school-dependent) |
| knowledge/yongshen.js | YongShen | 19 nhóm | PROJECT_RULE (school-dependent) |
| knowledge/patterns.js | Pattern | 7 bật + 5 khung tắt | Classical (school-dependent) |
| knowledge/rules.js | InterpretationRule | 11 | Xem QIMEN_INTERPRETATION_RULES.md |

## Ví dụ node

### Palace (knowledge/palaces.js)
```js
{ palace: 6, id: 'QIAN', nameZh: '乾', nameVi: 'Càn',
  trigramZh: '乾', direction: 'TB', element: 'Kim', homeDoor: 'Khai' }
```

### Door (knowledge/doors.js)
```js
{ id: 'KHAI', nameZh: '開門', nameVi: 'Khai', element: 'Kim',
  classicalNature: 'AUSPICIOUS', projectNature: 'GOOD', homePalace: 6,
  symbolism: 'cửa khai sáng, mở mang: công danh, sự nghiệp, quý nhân',
  advice: { do: '...', dont: '...' } }
```
`classicalNature` (吉/平/凶) và `projectNature` (GOOD/BAD — heuristic cũ)
được tách riêng — không trộn nguồn.

### Star (knowledge/stars.js)
```js
{ id: 'TIAN_XIN', nameZh: '天心', nameVi: 'Thiên Tâm', element: 'Kim',
  nature: 'AUSPICIOUS', symbolism: 'chủ y thuật, cứu giúp, chữa bệnh' }
```
LƯU Ý: `element` là ngũ hành NỘI TẠI — Thiên Tâm = Kim dù đang rơi vào
Chấn = Mộc. `palace.element` là thuộc tính của cung, tách riêng.

## Quan hệ (edges)

`lib/qimenRelations.js` tính quan hệ giữa các cặp:
- Door ↔ Palace · Star ↔ Palace · Deity ↔ Palace
- HeavenStem ↔ EarthStem (trong từng cung)
- YongShen ↔ Palace (qua resolver)

Mỗi edge: `{ relation, type (sameElement/generates/generatedBy/controls/controlledBy),
source, target, sourceLabel, targetLabel, elementSource, elementTarget, evidence }`
— KHÔNG quy thành +1/-1 ngay.

## Pattern nodes (knowledge/patterns.js)

Bật (enabled: true): FU_YIN, FAN_YIN, MEN_PO, RU_MU, KONG_WANG, YI_MA, JI_XING.
Khung tắt (enabled: false, chưa đủ nguồn — KHÔNG tự bịa):
QingLongFanShou (青龙返首), FeiNiaoDieXue (飞鸟跌穴), SanQiDeShi (三奇得使),
JiuDun (九遁), TianWangSiZhang (天网四张).

## Mở rộng

Thêm node mới = thêm file/entry trong knowledge/ + (nếu là rule) entry trong
knowledge/rules.js → rebuild bundle (`npm run build`) → thêm test.
Không phải sửa engine.
