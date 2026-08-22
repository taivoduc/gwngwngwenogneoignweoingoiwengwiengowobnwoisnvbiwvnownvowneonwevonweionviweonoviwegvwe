# KẾT QUẢ ĐỐI CHIẾU VỚI BAZI.VN (Tham chiếu)

> Đã sửa lõi tính toán trong `kymon.html` để khớp bazi.vn. Tham chiếu: `https://bazi.vn/ban-ky-mon`.

## 1. Các lỗi đã sửa (function `anBan` + `tinhCuc`)
| # | Lỗi cũ | Cách sửa |
|---|---|---|
| 1 | **Cục/Nguyên** xét tiết khí theo NGÀY hiện tại | Xét tiết khí theo **ngày Phù Đầu** (超神接气): `tiet = getTietKhi(jdToDate(jd - (n%5)))` |
| 2 | Trực Phù/Trực Sử tra bảng `TUAN_INFO` cố định | Theo **Địa bàn**: sao/cửa có bản cung = cung chứa Lục Nghi Tuần Thủ; Trung cung ký Khôn |
| 3 | Cửu Tinh bay sai chiều | `starIdx` bay cùng chiều với `ringPos` (nghịch khi Âm) |
| 4 | Bát Môn bay sai chiều | `doorIdx` bay cùng chiều với `pos` (nghịch khi Âm) |
| 5 | Thiên bàn xoay theo số | Xoay theo **vòng Lạc Thư** `[1,8,3,4,9,2,7,6]` |
| 6 | Bát Môn an theo `DIA_CHI_CUNG` | `值使` bay tới cung theo bảng `SHI_TARGET` (洛书 nghịch, Trung cung ký Khôn) |

## 2. Quy tắc 值使 (Bát Môn) — `SHI_TARGET`
Bảng vị trí vòng Lạc Thư theo Địa chi giờ (Tý..Hợi):
`[6,7,5,3,2,5,0,4,1,6,7,5]` = Tý→Đoài, Sửu→Càn, Dần→Khôn, Mão→Tốn, Thìn→Chấn, Tỵ→Khôn, Ngọ→Khảm, Mùi→Ly, Thân→Cấn, Dậu→Đoài, Tuất→Càn, Hợi→Khôn.
Đây chính là **洛书 nghịch** `7→6→5→4→3→2→1→9→8→7→6→5` với Trung cung (5) ký gửi Khôn (2).

## 3. Kết quả test hàng loạt (batch_test.js)
| Case | Cục | Cửa | Tinh |
|---|---|---|---|
| 19/8 10h (Tỵ) | OK | OK | OK |
| 22/8 10h (Tỵ) | OK | OK | OK |
| 22/8 16h (Thân) | OK | OK | OK |
| 22/8 18h (Dậu) | OK | OK | OK |
| 23/8 10h (Tỵ) | OK | **SAI** | OK |
| 23/8 17h (Dậu) | OK | **SAI** | OK |
| 24/8 10h (Tỵ) | OK | OK | OK |
| 25/8 10h (Tỵ) | OK | OK | OK |
| 25/8 16h (Thân) | OK | OK | OK |
| 25/8 17h (Dậu) | OK | OK | OK |

- **25/8 17:04 (case người dùng nêu)**: khớp 100% cả 5 lớp (Cục, Địa bàn, Thiên bàn, Cửu Tinh, Bát Môn) — xác nhận bằng `verify_full.js`.
- **8/10 case khớp hoàn toàn**.

## 4. ĐIỂM CHƯA KHỚP — `[NEEDS QIMEN RULE VALIDATION]`
### 23/8 (ngày Kỷ Tỵ, đúng ngày giao tiết Xử Thử + ngày Phù Đầu 己巳)
- bazi.vn đặt **值使 (Đỗ Môn) ở Cấn 8** (giờ Tỵ) và **Tốn 4** (giờ Dậu), trong khi quy tắc `SHI_TARGET` cho Khôn 2 / Đoài 7.
- 23/8 là **ngày đặc biệt** (đúng ranh giới giao tiết Xử Thử và là ngày Phù Đầu), có thể bazi.vn có quy tắc riêng (hoặc lỗi) tại ranh giới này.
- Không thể trích đủ dữ liệu do bazi.vn giới hạn truy vấn ±3 ngày quanh "hôm nay".

## 5. File khảo sát
`probe_bazi.js`, `probe_gates.js`, `probe_hours.js`, `probe_case2.js`, `probe_25.js`, `probe_verify.js`, `probe_minute.js`, `parse_board.js`, `extract_board.js`, `compare_proto.js`, `verify_full.js`, `batch_test.js`, `debug_star.js`, `bazi_page.html`.

