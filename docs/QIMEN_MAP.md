# QIMEN MAP — Bản đồ + La bàn + Qimen Overlay

> Tích hợp Google Maps làm nền, la bàn điện thoại quyết định hướng, bàn Kỳ Môn là overlay bán trong suốt.

## Kiến trúc 3 lớp (độc lập, không trộn)

```
GPS/Geolocation → Vị trí hiện tại → Google Maps
DeviceOrientation → heading → map.setHeading / la bàn
window._cungData (bàn đã lập) → 8 hướng → 9 cung → overlay màu + Môn/Tinh/Thần + điểm
```

| Lớp | File | Nhiệm vụ | KHÔNG được |
|---|---|---|---|
| Map | `js/qimen-map.js` | Google Maps, marker, zoom/pan | sửa bàn Qimen |
| Orientation | `js/qimen-map.js` | heading, lọc nhiễu, normalize | sửa bàn Qimen |
| Qimen Overlay | `js/qimen-map.js` | 8 sector + nhãn + điểm | sửa bàn Qimen |
| **Logic thuần** | `js/qimen-map-core.js` | heading/bearing/sector/smoothing | biết gì về Qimen |

## Nguyên tắc then chốt

1. **KỲ MÔN = LOGIC** — `anBan(date)` (kymon.html) là nguồn duy nhất lập bàn.
2. **Map/Compass chỉ ĐỌC** `window._cungData` + `palaceScore()` + `normalizeScore()`.
3. **KHÔNG copy thuật toán Qimen** sang map module.
4. **Bàn không đổi khi map xoay hay GPS đổi** (test 13/14 xác nhận).
5. **8 hướng ↔ 8 cung cố định**: Khảm=Bắc(1), Cấn=ĐB(8), Chấn=Đ(3), Tốn=ĐN(4), Ly=N(9), Khôn=TN(2), Đoài=T(7), Càn=TB(6).

## API key Google Maps — KHÔNG hardcode

Thứ tự nạp key:
1. `window.QIMEN_MAP_CONFIG.apiKey`
2. URL param `?key=...`
3. `localStorage['qimen_gmap_key']`

⚠️ GitHub Pages không có backend → key client-side luôn lộ ở mức độ nhất định; nên giới hạn key theo referrer/domain trong Google Cloud Console.

## Chạy / Test

```powershell
node tests\qimen-map.test.js     # logic thuần (17 test)
node tests\qimen.test.js         # lập bàn Qimen (7 test, không bị phá vỡ)
node verify_kymon.js             # bảng tham chiếu
```

Mở map: bấm **"🗺️ Mở Bản đồ"** trong app.

## Tính năng

- Map nền + marker vị trí + zoom/pan + recenter.
- 2 chế độ: **Bắc lên trên** (north-up) / **Hướng nhìn lên** (heading-up, `map.setHeading`).
- La bàn trung tâm (rose + mũi tên theo heading).
- 8 sector 45° (quạt) màu CÁT/TRUNG/HUNG, bán trong suốt, bán kính 100m–5km.
- Destination bearing: click map → bearing → hướng → cung → Môn/Tinh/Thần.
- "✦ Hướng tốt": rank 8 hướng theo điểm.
- Debug panel + GPS accuracy + opacity slider.
- Heading normalize 0–360 + low-pass filter (đường vòng ngắn nhất).

## Hạn chế (NEEDS_VALIDATION / TODO)

- `map.setHeading` chỉ hoạt động với **vector map** (cần `mapId`); raster map sẽ giữ Bắc cố định (overlay vẫn đúng địa lý).
- Chưa tách magnetic↔true north + declination (đang dùng heading do browser cung cấp).
- Score hiển thị là **heuristic diễn giải**, KHÔNG phải "chân lý Kỳ Môn" (ghi rõ trong UI).
- Hoàng Đạo/Hắc Đạo + hóa giải vẫn nằm trong app cũ (không thuộc map module).
