# SENSORS / MAP / AR — La bàn, bản đồ, AR

## 1. Tách biệt hệ toạ độ (đặc tả mục IV & IX)
3 hệ toạ độ độc lập, không tự ý đổi chéo:
1. **Astronomical**: kinh độ/vĩ độ hoàng đạo, vị trí Mặt Trời (chỉ cho tiết khí + giờ mặt trời).
2. **Geographic**: latitude/longitude, heading, bearing (chỉ cho vị trí + hướng thực).
3. **Qimen direction**: Cửu Cung truyền thống (cố định, KHÔNG đổi theo bán cầu).

Quy tắc: heading chỉ **xoay UI**, không đổi bản chất Cửu Cung. North luôn là North trong bàn.

## 2. La bàn (compass package)
- Nguồn: `DeviceOrientationEvent.absolute` (web) / Generic Sensor `AbsoluteOrientationSensor` / Capacitor sensors.
- Output chuẩn hoá:
  ```ts
  interface Heading {
    degrees: number;                 // 0–359
    directionName: string;           // "Bắc"
    cardinal: string;                // "N"
    eightWay: string;                // "NE" (8 hướng)
    qimenPalace: number;             // 1..9 (từ hướng → cung)
    accuracy: number;                // độ nhiễu
  }
  ```
- Mapping `heading → directionName`:
  ```
  heading 0–22, 338–360 → Bắc(N) ; 23–67 → Đông Bắc(NE) ; 68–112 → Đông(E)
  113–157 → Đông Nam(SE) ; 158–202 → Nam(S) ; 203–247 → Tây Nam(SW)
  248–292 → Tây(W) ; 293–337 → Tây Bắc(NW)
  ```
- Ví dụ: `heading=37° → "37° NE"`; `heading=82° → Đông`; `heading=137° → Đông Nam`.
- Bộ lọc nhiễu (low-pass filter) để kim ổn định.

## 3. Layer hiển thị bàn + la bàn (đặc tả mục IX)
- `LAYER 1` (world coordinate): N/E/S/W cố định theo heading thực.
- `LAYER 2` (Qimen nine palaces): bàn Cửu Cung truyền thống.
- Khi heading đổi → layer 2 xoay theo heading (CSS transform `rotate(-heading)`), layer 1 giữ cố định màn hình.
- Đảm bảo: xoay 90° chỉ xoay giao diện; North của bàn vẫn là North.

## 4. Bản đồ (map package) — MapLibre GL JS + OSM
- Điểm: `Current location`, `Destination`.
- Tính `bearing` và `distance`:
  ```ts
  bearing(lat1,lon1,lat2,lon2)  // công thức haversine/inverse (0–360°)
  distance(lat1,lon1,lat2,lon2) // mét
  ```
- Overlay: vẽ **8 hướng** (tia) + **9 cung** (vùng sector) quanh vị trí hiện tại.
- Ví dụ: destination bearing = 72° → Đông Bắc/Đông → tra cứu cung tương ứng → Gate/Star/Spirit.

## 5. Chế độ "Xuất hành" (đặc tả mục XLI)
```
Current GPS → Destination GPS → bearing → Qimen Direction → Palace
  → Gate → Star → Spirit → Analysis
```
Kết quả: "Hướng xuất hành: Đông Bắc — Đánh giá Kỳ Môn: Thuận — Giải thích: ..."

## 6. AR (đặc tả mục X)
- Nếu thiết bị hỗ trợ camera + orientation → overlay Cửu Cung lên màn hình camera.
- Web: `getUserMedia` + `DeviceOrientation` (overlay CSS). Native mở rộng: Capacitor + camera plugin.
- Overlay xoay theo heading, cho người dùng thấy trực quan:
  "Hướng Sinh Môn / Khai Môn / Tử Môn hiện ở phía nào?"
- Không thay đổi dữ liệu Cửu Cung — chỉ là lớp hiển thị.

## 7. Sensor layer API (trừu tượng, thay được)
```ts
interface DeviceLayer {
  getLocation(): Promise<GeoLocation | null>;
  getHeading(): Promise<Heading | null>;
  getOrientation(): Promise<{alpha:number; beta:number; gamma:number} | null>;
  watchHeading(cb: (h: Heading) => void): () => void;   // trả unsubscribe
}
```
- Implement web (DeviceOrientation/Geolocation) và native (Capacitor) sau.
- Quyền: app yêu cầu Location + Compass ngay đầu flow (đặc tả mục XLVIII).
