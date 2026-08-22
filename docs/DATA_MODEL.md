# DATA MODEL — Cấu trúc dữ liệu & Database schema

## 1. Từ điển hằng (constants, dùng chung engine + DB seed)

### 1.1 Thiên Can (10) / Địa Chi (12)
```
Can : Giáp(0) Ất(1) Bính(2) Đinh(3) Mậu(4) Kỷ(5) Canh(6) Tân(7) Nhâm(8) Quý(9)
Chi : Tý(0) Sửu(1) Dần(2) Mão(3) Thìn(4) Tỵ(5) Ngọ(6) Mùi(7) Thân(8) Dậu(9) Tuất(10) Hợi(11)
```
Ngũ hành can/chi là dữ liệu tĩnh trong `data/`.

### 1.2 Ngũ hành
`Mộc, Hỏa, Thổ, Kim, Thủy` — `sinh` (Mộc→Hỏa→Thổ→Kim→Thủy→Mộc), `khắc` (Mộc→Thổ→Thủy→Hỏa→Kim→Mộc).

### 1.3 Cửu Cung (số Lạc Thư → hướng)
```
1 Khảm (Bắc, Thủy)    2 Khôn (Tây Nam, Thổ)  3 Chấn (Đông, Mộc)
4 Tốn (Đông Nam, Mộc) 5 Trung (Thổ)           6 Càn (Tây Bắc, Kim)
7 Đoài (Tây, Kim)     8 Cấn (Đông Bắc, Thổ)   9 Ly (Nam, Hỏa)
```
Vòng Lạc Thư (thứ tự bay): `[1,8,3,4,9,2,7,6]` (bỏ 5 khi bay 8 vòng).

### 1.4 Cửu Tinh (số → tên → cung bản mệnh → ngũ hành)
```
1 Thiên Bồng(Khảm,Thủy) 2 Thiên Nhuế(Khôn,Thổ) 3 Thiên Xung(Chấn,Mộc)
4 Thiên Phụ(Tốn,Mộc)    5 Thiên Cầm(Trung,Thổ) 6 Thiên Tâm(Càn,Kim)
7 Thiên Trụ(Đoài,Kim)   8 Thiên Nhậm(Cấn,Thổ)  9 Thiên Anh(Ly,Hỏa)
```

### 1.5 Bát Môn (số → tên → cung bản mệnh)
```
1 Hưu(Khảm) 2 Sinh(Cấn) 3 Thương(Chấn) 4 Đỗ(Tốn)
5 Cảnh(Ly) 6 Tử(Khôn) 7 Kinh(Đoài) 8 Khai(Càn)
```
(Trung cung không có môn.)

### 1.6 Bát Thần (thứ tự vòng)
```
Trực Phù(1) Đằng Xà(2) Thái Âm(3) Lục Hợp(4)
Bạch Hổ/Câu Trần(5) Huyền Vũ/Chu Tước(6) Cửu Địa(7) Cửu Thiên(8)
```

### 1.7 Tam Kỳ Lục Nghi (thứ tự an địa bàn)
```
Mậu(1) Kỷ(2) Canh(3) Tân(4) Nhâm(5) Quý(6) Đinh(7) Bính(8) Ất(9)
```
Mậu–Quý = Lục Nghi; Ất–Bính–Đinh = Tam Kỳ.

---

## 2. TypeScript interfaces (packages/qimen/core/types.ts)

```ts
type FiveElement = 'Moc'|'Hoa'|'Tho'|'Kim'|'Thuy';
type DunType = 'YANG'|'YIN';
type Yuan = 'THUONG'|'TRUNG'|'HA';            // Thượng/Trung/Hạ nguyên
type TimeMode = 'CIVIL'|'LOCAL_MEAN_SOLAR'|'TRUE_SOLAR';
type QuestionType = 'CAREER'|'BUSINESS'|'MONEY'|'TRAVEL'|'MEETING'|'NEGOTIATION'
  |'RELATIONSHIP'|'STUDY'|'DECISION'|'SEARCH'|'LOST_OBJECT'|'GENERAL';

interface GeoLocation { latitude: number; longitude: number; altitudeM?: number; }

interface TimeContext {
  localDateTime: string;          // ISO, giờ địa phương người dùng nhập
  ianaTimeZone: string;           // "Asia/Ho_Chi_Minh", "America/New_York", ...
  utcTimestamp: string;           // ISO UTC (đầu ra sau chuyển đổi)
  timeMode: TimeMode;
}

interface SolarData {
  apparentSolarLongitudeDeg: number;   // 0..360, hoàng đạo biểu kiến
  equationOfTimeMinutes: number;       // EoT (phút)
  meanSolarTimeMinutes: number;        // Local Mean Solar Time
  trueSolarTimeMinutes: number;        // True Solar Time (giờ mặt trời thật)
  solarTerm: SolarTermInfo;
}

interface SolarTermInfo {
  id: number;                 // 0..23
  vietnameseName: string;     // "Lập Xuân"
  hanName: string;            // "立春"
  solarLongitudeDeg: number;  // 315
  startUtc: string;           // thời điểm giao tiết (UTC)
  endUtc: string;             // thời điểm giao tiết kế tiếp
  year: number;
}

interface GanZhi { stem: number; branch: number; sexagenary: number; } // 0..59

interface JuInfo { ju: number; dun: DunType; solarTermId: number; yuan: Yuan; }

interface PalaceCell {
  palace: number;              // 1..9
  name: string;                // "Khảm"
  direction: string;           // "Bắc" (hệ truyền thống)
  element: FiveElement;
  earthStem: number;           // địa bàn (Tam Kỳ Lục Nghi index)
  heavenStem: number;          // thiên bàn
  gate: number | null;         // Bát Môn index (null ở Trung cung)
  star: number;                // Cửu Tinh index
  spirit: number | null;       // Bát Thần index (null ở Trung cung)
}

interface ChiefInfo {          // Trực Phù / Trực Sử
  star: number;                // sao Trực Phù
  starPalace: number;
  gate: number | null;         // môn Trực Sử
  gatePalace: number | null;
  xun: number;                 // 旬首 (0..5)
}

interface QimenBoard {
  ruleSetVersion: string;      // "Qimen Standard v1.0"
  timeContext: TimeContext;
  solarData: SolarData;
  ganzhi: { year: GanZhi; month: GanZhi; day: GanZhi; hour: GanZhi };
  ju: JuInfo;
  chief: ChiefInfo;
  palaces: Record<number, PalaceCell>;   // key 1..9
}

interface RuleDef {
  ruleId: string; name: string; description: string;
  source: string;             // reference/trường phái
  priority: number; enabled: boolean; params: Record<string, unknown>;
}

interface ScoreComponent { key: string; label: string; score: number; weight: number; note: string; }
interface QimenScore { total: number; favorability: string; components: ScoreComponent[]; }

interface DirectionAnalysis {
  direction: string; palace: number; gate: number|null; star: number; spirit: number|null;
  stem: number; element: FiveElement; score: number; verdict: 'VERY_FAVORABLE'|'FAVORABLE'
  |'MODERATE'|'UNFAVORABLE'|'VERY_UNFAVORABLE'; reasons: string[]; recommendation: string;
}

interface ExplanationTrace { conclusion: string; steps: string[]; }

interface ChartRecord {
  id: string; createdAt: string; timezone: string; latitude: number; longitude: number;
  trueSolarTime: string | null; question: string; questionType: QuestionType;
  ruleSetVersion: string; solarTerm: string; dun: DunType; ju: number;
  chart: QimenBoard; analysis: DirectionAnalysis[]; recommendation: string;
}
```

---

## 3. Database schema (PostgreSQL) — packages/database/migrations

```sql
-- Định danh trường phái/version
CREATE TABLE rule_sets (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,          -- "Qimen Standard"
  version       TEXT NOT NULL,          -- "v1.0"
  is_active     BOOLEAN DEFAULT false,
  UNIQUE(name, version)
);

-- 24 tiết khí (seed offline, lưu để truy vấn lịch sử + API)
CREATE TABLE solar_terms (
  id                 SERIAL PRIMARY KEY,
  year               INT NOT NULL,
  vietnamese_name    TEXT NOT NULL,
  han_name           TEXT NOT NULL,
  solar_longitude    NUMERIC(6,3) NOT NULL,
  start_utc          TIMESTAMPTZ NOT NULL,
  end_utc            TIMESTAMPTZ NOT NULL,
  UNIQUE(year, solar_longitude)
);

-- Từ điển (chủ yếu offline JSON; lưu để tra cứu + audit)
CREATE TABLE heavenly_stems (id SMALLINT PRIMARY KEY, name TEXT, han TEXT, element TEXT, yin_yang TEXT);
CREATE TABLE earthly_branches (id SMALLINT PRIMARY KEY, name TEXT, han TEXT, element TEXT, yin_yang TEXT, hidden_stems INT[]);
CREATE TABLE palaces (id SMALLINT PRIMARY KEY, name TEXT, direction TEXT, element TEXT, luoshu_pos INT);
CREATE TABLE gates   (id SMALLINT PRIMARY KEY, name TEXT, han TEXT, element TEXT, home_palace INT, meaning TEXT, good_domains TEXT[], bad_cases TEXT[]);
CREATE TABLE stars   (id SMALLINT PRIMARY KEY, name TEXT, han TEXT, element TEXT, home_palace INT, meaning TEXT, good_bad TEXT);
CREATE TABLE spirits (id SMALLINT PRIMARY KEY, name TEXT, han TEXT, meaning TEXT);

-- Quy tắc Kỳ Môn (rule engine), có version + nguồn + bật/tắt
CREATE TABLE qimen_rules (
  id            SERIAL PRIMARY KEY,
  rule_set_id   INT REFERENCES rule_sets(id),
  rule_id       TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  source        TEXT,
  priority      INT DEFAULT 0,
  enabled       BOOLEAN DEFAULT true,
  params        JSONB DEFAULT '{}',
  UNIQUE(rule_set_id, rule_id)
);

-- Lịch sử lập bàn (chỉ lưu khi user yêu cầu)
CREATE TABLE history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  timezone      TEXT NOT NULL,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  true_solar_time TEXT,
  question      TEXT,
  question_type TEXT,
  rule_set_version TEXT,
  solar_term    TEXT,
  dun           TEXT,
  ju            INT,
  chart         JSONB NOT NULL,        -- QimenBoard
  analysis      JSONB,                 -- DirectionAnalysis[]
  recommendation TEXT
);

-- Vị trí người dùng (tách khỏi history để xoá độc lập)
CREATE TABLE locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label       TEXT,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_history_created ON history(created_at DESC);
```

Ghi chú:
- `solar_terms`, các từ điển (can/chi/cung/môn/tinh/thần) và `qimen_rules` có bản **offline JSON** trong `data/` để core chạy không cần server (đặc tả mục LI).
- `history` không chứa location nếu người dùng không cho phép lưu; location nằm ở bảng `locations` riêng để xoá dễ dàng (đặc tả mục LII).


