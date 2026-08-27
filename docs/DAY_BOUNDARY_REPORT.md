# DAY BOUNDARY REPORT — 2300 vs 0000

> Sample: 15/6/2025 (Mang Chủng Trung nguyên, Âm độn 3). So sánh `anBan(date)` (2300) vs `anBan(date, {dayBoundaryMode:'0000'})`.

## Kết quả

| Giờ | day Gan-Zhi (2300) | day Gan-Zhi (0000) | Khác? |
|---|---|---|---|
| 22:59 | Ất Mão | Ất Mão | KHÔNG |
| **23:00** | **Bính Thìn** | **Ất Mão** | **CÓ** |
| 23:01 | Bính Thìn | Ất Mão | CÓ |
| 23:59 | Bính Thìn | Ất Mão | CÓ |
| 00:00 | Ất Mão | Ất Mão | KHÔNG |
| 00:01 | Ất Mão | Ất Mão | KHÔNG |

## Phạm vi ảnh hưởng khi 23:00 đổi ngày (2300)

| Thành phần | Bị ảnh hưởng? |
|---|---|
| Day Gan-Zhi | ✅ CÓ (Ất Mão → Bính Thìn) |
| Hour Gan-Zhi | ✅ CÓ (gioGan = dayGan×2 + gioChi → đổi theo dayGan) |
| Xun (旬首) | ✅ CÓ (chiIndex theo gioGan/gioChi) |
| Zhi Fu / Zhi Shi | ✅ CÓ |
| Tian Pan / Jiu Xing / Ba Men / Ba Shen | ✅ CÓ (phụ thuộc Xun + hour Gan-Zhi) |
| **Ju / Yuan / Yin-Yang** | ❌ **KHÔNG** (cục tính theo NGÀY dương lịch + Phù Đầu, không theo day-boundary) |

## Kết luận

- Hai trường phái 2300 vs 0000 **CHỈ khác nhau trong khoảng 23:00–23:59** (1 giờ/ngày).
- Khác biệt lan sang: day/hour Gan-Zhi, Xun, Zhi Fu/Zhi Shi, và cả 6 tầng của bàn.
- **Cục (Ju), Nguyên, Âm/Dương độn KHÔNG đổi** (tính theo ngày, không theo giờ).

## Rule decision

- Default: **2300** (晚子时归次日 — khớp atopx/qimen).
- Option: **0000** (đã implement qua `anBan(date, {dayBoundaryMode:'0000'})`).
- Status: **SCHOOL_DEPENDENT** — cần chuyên gia chốt trường phái.
