# KỲ MÔN ĐỘN GIÁP — Kiến trúc hệ thống (Architecture)

> Tài liệu thiết kế **Phase 0**. Trạng thái: **CHỜ XÁC NHẬN** trước khi viết code.
> Rule set mặc định đề xuất: **Qimen Standard v1.0**.

## Mục lục tài liệu (docs/)
| File | Nội dung |
|---|---|
| ARCHITECTURE.md (file này) | Tổng quan, kiến trúc, công nghệ, monorepo, phân pha |
| DATA_MODEL.md | Cấu trúc dữ liệu (TS) + database schema (PostgreSQL) |
| CALCULATION_PIPELINE.md | Pipeline lập bàn + các engine |
| RULE_ENGINE.md | Rule engine, hệ thống điểm, versioning |
| SENSORS_MAP_AR.md | La bàn + bản đồ + AR |
| UI_AND_TEST.md | UI wireframe + test strategy |
| QIMEN_RULE_VALIDATION.md | Danh sách quy tắc cần xác minh + quyết định cần chốt |

---

## 1. Hiện trạng (prototype hiện có)
`kymon.html` (~58KB) đã có một lõi tính toán chạy được:
- Chuyển đổi âm/dương lịch (có tháng nhuận).
- Tiết khí theo **kinh độ hoàng đạo biểu kiến Mặt Trời** (chuỗi Meeus rút gọn).
- Can Chi năm / ngày / giờ.
- Lập bàn **Kỳ Môn Thời Gia** (Cục, Tam Kỳ Lục Nghi, Cửu Tinh, Bát Môn, Bát Thần, Trực Phù, Trực Sử).
- 1 bảng validation tham chiếu (17/3/2021, Dương độn 1 cục).

**Hạn chế cần khắc phục khi tái kiến trúc:**
1. Timezone cứng UTC+7; chưa có location/lat-lng thực sự cho tiết khí + giờ mặt trời thật.
2. Logic + UI trộn trong 1 file HTML (không tách được, không test độc lập).
3. Chưa có compass / map / AR / history / rule engine / analysis / advice.
4. Có lẫn **12 sao Hoàng Đạo/Hắc Đạo** (hệ thống trạch nhật, KHÔNG thuộc Kỳ Môn) và các "hóa giải" vật phẩm mang tính phong tục — theo đặc tả phải **tách/biệt lập** khỏi thuật toán Qimen.

---

## 2. Nguyên tắc thiết kế (bất biến)
1. **Kỳ Môn thuần túy** — chỉ `TIME + LOCATION + QIMEN`. Cấm Western Zodiac / Vedic / Tarot / Tử Vi / Numerology trong thuật toán.
2. **Tách 3 lớp** (đặc tả mục I): `DỮ LIỆU KHÁCH QUAN` → `THUẬT TOÁN KỲ MÔN` → `LỚP DIỄN GIẢI`.
3. **Không hard-code kết quả ngày mẫu**; mỗi quy tắc là một hàm riêng, có `rule_id`.
4. **Version hoá rule set**: mọi chart lưu `ruleSetVersion` (so sánh v1.0/v1.1 mà không phá dữ liệu cũ).
5. **Core chạy offline**: tiết khí, Can Chi, rules, 9 cung, 8 môn, 9 tinh, 8 thần không phụ thuộc server.
6. **Không đảo Cửu Cung theo Nam bán cầu**; chỉ xoay UI theo heading (tách astronomical vs geographic vs traditional direction).
7. **Mọi kết luận phải có Explanation Trace** ("tại sao").
8. **Không gọi là xác suất**: dùng "QIMEN FAVORABILITY — độ thuận theo rule set".
9. **Bảo mật**: chỉ lưu location khi người dùng yêu cầu lưu chart; cho phép xoá history/location.

---

## 3. Kiến trúc tổng thể (3 tầng + 2 cột)

```
┌────────────────────────────────────────────────────────────────┐
│                 PRESENTATION LAYER (React + TS, PWA)           │
│  Onboarding · Home · Board UI (Simple/Expert) · Compass · Map  │
│  AR · Best-time · Hóa giải · History · Settings                │
└───────────────▲────────────────────────────────▲───────────────┘
                │ REST/JSON (offline-first)       │
┌───────────────┴─────────────────┐  ┌────────────┴──────────────┐
│  APPLICATION / API (Node + TS)  │  │  INFRA / PERSISTENCE       │
│  /chart /analyze /directions    │  │  PostgreSQL                │
│  /best-time /best-direction     │  │  Static data (offline JSON)│
│  /advice /history /export       │  │  (SolarTerms, GanZhi, ...) │
└───────────────▲─────────────────┘  └───────────────────────────┘
                │
┌───────────────┴─────────────────────────────────────────────────┐
│            QIMEN DOMAIN (pure TypeScript, SHARED/offline)        │
│  CALENDAR ENGINE → SOLAR TERM ENGINE → DUN ENGINE → PALACE ENG.  │
│  → GATE ENGINE → STAR ENGINE → SPIRIT ENGINE → STEM ENGINE       │
│  → RELATIONSHIP ENGINE → INTERPRETATION ENGINE → ADVICE ENGINE   │
│  (độc lập UI, độc lập sensors, có unit tests)                    │
└──────────────────────────────────────────────────────────────────┘
        ▲                        ▲
 ┌──────┴──────┐          ┌──────┴──────────┐
 │ ASTRONOMY   │          │ DEVICE/SENSORS  │
 │ solar long. │          │ getLocation()   │
 │ equation-of-│          │ getHeading()    │
 │ time        │          │ getOrientation()│
 └─────────────┘          └─────────────────┘
```

Ranh giới (đặc tả mục XLIX): `astronomy / calendar / qimen / compass / location / map / ar / ui / database / tests` KHÔNG trộn lẫn. UI không chứa thuật toán; compass không biết gì về Qimen.

---

## 4. Công nghệ đề xuất (theo đặc tả mục L)
| Lớp | Chọn |
|---|---|
| Frontend | React + TypeScript (Vite), PWA trước; mở rộng Capacitor/React Native sau |
| Backend | Node.js + TypeScript (Fastify hoặc Express) |
| Database | PostgreSQL (schema ở DATA_MODEL.md); dữ liệu tĩnh offline dạng JSON |
| Astronomy | `astronomy-engine` (MIT, có solar ecliptic longitude + equation of time). Thay chuỗi Meeus rút gọn hiện tại |
| Map | MapLibre GL JS + OpenStreetMap (không phụ thuộc Google) |
| Compass | DeviceOrientation API / Generic Sensor; Capacitor sensors khi cần native |
| PDF export | pdf-lib (client-side) |

## 5. Cấu trúc monorepo đề xuất
```
kymon/
├─ apps/
│  ├─ web/                 # React PWA (UI + sensors + map + ar)
│  └─ api/                 # Node + TS (REST endpoints + persistence)
├─ packages/
│  ├─ astronomy/           # solar longitude, EoT, solar terms, true solar time
│  ├─ calendar/            # GanZhi, lunar (chỉ để hiển thị), shichen
│  ├─ qimen/
│  │  ├─ core/             # types + constants (palaces/gates/stars/spirits/stems)
│  │  ├─ rules/            # qimen_rules.json + RuleRegistry + scoring weights
│  │  ├─ calculation/      # dun/ju/palace/gate/star/spirit/stem engines
│  │  └─ interpretation/   # relationship, cát/hung, directions, advice, trace
│  ├─ compass/             # heading → direction/palace
│  ├─ location/            # geolocation, bearing, distance
│  └─ database/            # migrations + repositories + types
├─ data/                   # offline JSON: solar_terms, ganzhi, qimen_rules, ...
├─ docs/                   # tài liệu này
└─ tests/                  # unit + integration + fixtures (reference charts)
```

## 6. Phân pha triển khai (mỗi phase phải chạy được trước khi sang phase sau)
| Phase | Nội dung | Definition of Done |
|---|---|---|
| 1 | Calendar + Solar Terms + GanZhi (+ astronomy-engine) | Test tiết khí đúng 8 mốc chính, đúng timezone |
| 2 | Qimen Calculation Engine (tách từ kymon.html) | Khớp bảng tham chiếu 17/3/2021 + thêm 1-2 bảng khác |
| 3 | 9 Palace UI | Đủ Môn/Tinh/Thần/Can + orientation truyền thống & map |
| 4 | Compass | heading 0–359° → tên hướng + cung, xoay bàn theo heading |
| 5 | Map + Bearing | current→destination bearing, overlay 8 hướng + 9 cung |
| 6 | Qimen Analysis Engine | score + cát/hung + Explanation Trace |
| 7 | Advice + Direction Recommendation | top 3 hướng, hóa giải, tăng cường hướng tốt |
| 8 | History + Export | lưu/xem lại/JSON/PDF/chia sẻ |
| 9 | AR | camera overlay Cửu Cung theo heading |
| 10 | Testing + Validation | bộ test đầy đủ + "Compare with Reference Chart" |

**Thứ tự bắt buộc (đặc tả mục LVIII):** architecture → data model → rule engine → công thức lập bàn → unit tests → UI. Không làm UI trước.

## 7. Điểm quyết định cần bạn chốt (trước khi code)
Danh sách đầy đủ + phân tích trường phái nằm trong `QIMEN_RULE_VALIDATION.md`. Các điểm lớn nhất:
1. **Phép lập Cục**: Sách Bổ (拆補, prototype đang dùng) vs Trí Nhuận (置閏) vs Mao Sơn (茅山).
2. **Mốc năm Can Chi**: Lập Xuân vs Đông Chí vs Tết Nguyên Đán.
3. **Mốc đổi ngày/giờ**: 23:00 vs 00:00 (早子/晚子).
4. **Giờ mặc định**: Civil vs True Solar Time.
5. **Biến thể Bát Thần**: Bạch Hổ/Huyền Vũ cố định vs Câu Trần/Chu Tước (dương) + Bạch Hổ/Huyền Vũ (âm).
6. **Trung cung / Thiên Cầm**: giữ Trung cung hay ký gửi Khôn (坤2).

---
*Trạng thái: đây là thiết kế, chưa có code mới. Chờ bạn xác nhận trước khi bắt đầu Phase 1.*

