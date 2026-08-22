# QIMEN RULE VALIDATION — Quy tắc cần xác minh trước khi implement

> Đây là danh sách **bắt buộc chốt** trước khi code. Nguyên tắc: KHÔNG đoán. Mỗi mục
> kèm trạng thái hiện tại của prototype + lựa chọn trường phái đề xuất.

## A. Đã chắc chắn (không cần chốt, chỉ ghi nhận nguồn)
| # | Quy tắc | Ghi chú |
|---|---|---|
| 1 | 24 tiết khí theo kinh độ hoàng đạo 15° | Đã có trong prototype; nâng cấp bằng astronomy-engine |
| 2 | Dương độn: Đông Chí→Hạ Chí; Âm độn: Hạ Chí→Đông Chí | Chuẩn, đã có |
| 3 | Thứ tự an 三奇六儀 (Mậu→Ất), thuận/nghịch | Chuẩn, đã có |
| 4 | Ngũ Hổ Độn, Ngũ Thử Độn | Công thức kinh điển, đã có |
| 5 | Can Chi ngày `(JDN+49)%60` | Đã kiểm chứng mốc 01/10/1949 |

## B. CẦN CHỐT (mỗi mục là một quyết định trường phái)
### B1. Phép lập Cục (Ju determination) — `[NEEDS QIMEN RULE VALIDATION]`
- **Hiện tại**: Sách Bổ (拆補). Nguyên xác định theo Phù Đầu (ngày Giáp/Kỷ, chỉ số bội 5; Địa chi Phù Đầu quyết định Thượng/Hạ/Trung).
- Lựa chọn: (1) Sách Bổ 拆補; (2) Trí Nhuận 置閏; (3) Mao Sơn 茅山.
- Đề xuất: giữ Sách Bổ làm mặc định, implement strategy cho 2 phép còn lại.

### B2. Mốc đổi năm Can Chi — `[NEEDS QIMEN RULE VALIDATION]`
- Lựa chọn: Lập Xuân / Đông Chí / Tết Nguyên Đán.
- Prototype đang dùng **năm âm lịch** (≈ Tết). Đề xuất: Lập Xuân (phổ biến trong Kỳ Môn), cấu hình được.

### B3. Mốc đổi ngày & giờ Tý — `[NEEDS QIMEN RULE VALIDATION]`
- 23:00 (Tý sớm) vs 00:00 (Tý muộn) cho cả ngày lẫn giờ.
- Prototype: giờ = `floor((h+1)/2)%12` (tức 23:00 thuộc giờ Tý của ngày hôm sau về Can). Cần xác nhận.

### B4. Giờ mặc định — `[NEEDS QIMEN RULE VALIDATION]`
- Civil / Local Mean Solar / True Solar. Đặc tả yêu cầu hiển thị cả hai.
- Đề xuất: mặc định theo trường phái (thường True Solar), cho phép đổi trong Settings.

### B5. Biến thể Bát Thần — `[NEEDS QIMEN RULE VALIDATION]`
- (a) Bạch Hổ + Huyền Vũ cố định; (b) Dương độn = Câu Trần + Chu Tước, Âm độn = Bạch Hổ + Huyền Vũ.
- Prototype dùng **(b)**. Cần chốt.

### B6. Trung cung / Thiên Cầm — `[NEEDS QIMEN RULE VALIDATION]`
- Thiên Cầm giữ Trung cung (prototype) hay ký gửi Khôn (坤2).
- Trung cung: không môn, không thần (mặc định).

### B7. Phương pháp an Trực Sử (Bát Môn) — `[NEEDS QIMEN RULE VALIDATION]`
- Prototype: "Trực Sử tùy Thì Cung" (Địa chi giờ → Bát quái, đếm bước từ Địa chi Tuần Thủ).
- Trường phái khác: đếm số thần từ Tuần Thủ đến Thì Chi. Cần chốt.

## C. Điểm/trọng số & special combinations — `[NEEDS QIMEN RULE VALIDATION]`
- Toàn bộ giá trị điểm trong `qimen_rules.json` (gate/star/spirit/stem/palace/relationship/seasonal) là **đề xuất**, cần bạn duyệt hoặc cung cấp nguồn.
- Các "special combinations" (Tam Kỳ hội, Ngũ Bất Ngộ Thì Can, Thiên Ất...) cần **danh sách chuẩn + điều kiện chính xác** trước khi bật (`enabled: false` mặc định).

## D. Cần loại khỏi Qimen engine (đặc tả mục LV)
| Hệ thống | Xử lý |
|---|---|
| 12 sao Hoàng Đạo/Hắc Đạo (đang trong prototype) | Tách ra module riêng, KHÔNG vào Qimen score |
| Hóa giải vật phẩm (chuông gió, gương bát quái, thạch anh…) | Gắn nhãn `TRADITIONAL PRACTICE` + cảnh báo khoa học |
| Western/Vedic/Tarot/Tử Vi/Numerology | Cấm; nếu có chỉ `EDUCATIONAL COMPARISON` |

## E. Câu hỏi gửi bạn (để chốt nhanh)
1. Chấp nhận mặc định: **Sách Bổ + Lập Xuân + True Solar + biến thể (b) + Thiên Cầm giữ Trung + "Trực Sử tùy Thì Cung"** không? (Đây đều là những gì prototype đang chạy, có 1 bảng PASS.)
2. Bạn có bảng Kỳ Môn chuẩn nào (sách/website) để tôi dùng làm reference chart cho Âm độn và Dương độn không?
3. Các trọng số điểm (gate 30%, star 20%…) có nguồn tham khảo cụ thể nào bạn muốn dùng, hay để tôi đề xuất rồi bạn duyệt?

---
*Sau khi bạn xác nhận các mục trên, tôi sẽ bắt đầu Phase 1 (Calendar + Solar Terms + GanZhi) theo đúng thứ tự architecture → data model → rule engine → công thức → unit tests → UI.*
