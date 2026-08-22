# UI WIREFRAME & TEST STRATEGY

## 1. UX flow (đặc tả mục XLVIII)
1. Cho phép Location → 2. Cho phép Compass → 3. Hiển thị thời gian → 4. Hiển thị bàn
→ 5. Hỏi người dùng muốn biết gì → 6. Phân tích → 7. Lời khuyên → 8. Nút "Vì sao?" → 9. Nút "Xem bàn chuyên gia".

## 2. Wireframe trang chính (đặc tả mục XLVII)
```
-----------------------------------------------
        KỲ MÔN ĐỘN GIÁP
-----------------------------------------------
📍 Hà Nội            🕐 07:30 (☀️ True Solar 07:05)
☀️ Lập Thu           ☯ Dương Độn · Cục 2 · Trung nguyên
🧭 Heading 82° (Đông)
-----------------------------------------------
            [ BÀN CỤC — 9 CUNG ]
   ┌──────┬──────┬──────┐
   │ Tốn  │ Ly   │ Khôn │
   │ Đỗ   │ Cảnh │ Tử   │
   ├──────┼──────┼──────┤
   │ Chấn │ Trung│ Đoài │
   │ Thương│      │ Kinh │
   ├──────┼──────┼──────┤
   │ Cấn  │ Khảm │ Càn  │
   │ Sinh │ Hưu  │ Khai │
   └──────┴──────┴──────┘
  [CHẾ ĐỘ DỄ HIỂU] [CHẾ ĐỘ CHUYÊN GIA]
-----------------------------------------------
[ CÂU HỎI CỦA BẠN ]
[ "Tôi nên đi hướng nào?"            ] [PHÂN TÍCH]
-----------------------------------------------
🟢 HƯỚNG TỐT NHẤT: Đông
🟡 HƯỚNG KHÁ TỐT:  Đông Nam
🔴 NÊN TRÁNH:      Tây
[ XEM CHI TIẾT ] [ VÌ SAO? ]
-----------------------------------------------
[ LA BÀN ] [ MAP ] [ AR ] [ GIỜ TỐT ] [ HÓA GIẢI ] [ LỊCH SỬ ]
-----------------------------------------------
```

## 3. Chế độ hiển thị
- **Simple mode**: 🟢/🟡/🔴 + câu dễ hiểu + nút "VÌ SAO?" mở trace.
- **Expert mode**: đầy đủ Can Chi, tiết khí, Cục, Âm/Dương, 9 cung, 8 môn, 9 tinh, 8 thần, Tam Kỳ Lục Nghi, Trực Phù/Trực Sử, sinh khắc, vượng suy, quy tắc đã kích hoạt. Mỗi thành phần click được → giải thích.
- **Orientation toggle**: `Traditional Qimen Orientation` (Nam ở trên) vs `Modern Map Orientation` (Bắc ở trên) — không mặc định "top = North".

## 4. Màn hình phụ
- **TÌM HƯỚNG TỐT NHẤT**: bảng 8 hướng (HƯỚNG|CUNG|MÔN|TINH|THẦN|CAN|NGŨ HÀNH|ĐIỂM|ĐÁNH GIÁ) + TOP 3 + lý do.
- **TÌM GIỜ TỐT**: quét 24 giờ → TOP 3 thuận / TOP 3 nên tránh.
- **TÌM NGÀY TỐT**: 7/14/30 ngày, kết hợp DATE+TIME+DIRECTION.
- **XUẤT HÀNH**: nhập điểm đến → bearing → đánh giá hướng.
- **HÓA GIẢI**: ưu tiên đổi thời gian → hướng → vị trí → cách tiếp cận → chọn cung/môn thuận; vật phẩm gắn nhãn `TRADITIONAL PRACTICE` + cảnh báo "không có bằng chứng khoa học".
- **LỊCH SỬ**: xem lại / export JSON / PDF / chia sẻ / xoá.
- **"KỲ MÔN LÀ GÌ?"**: giải thích đơn giản, tuyên bố rõ không phải phương pháp khoa học đã chứng minh.

## 5. Test strategy
### 5.1 Unit tests (mỗi engine)
- **Calendar/GanZhi**: mốc 60 Giáp Tý chuẩn (01/10/1949 = Giáp Tý), Ngũ Hổ Độn/Ngũ Thử Độn, mốc đổi ngày/giờ.
- **Solar term**: 8 tiết chính (Xuân Phân, Hạ Chí, Thu Phân, Đông Chí, Lập Xuân, Lập Hạ, Lập Thu, Lập Đông) + **trước/đúng/sau** thời điểm chuyển tiết.
- **Dun/Ju**: bảng 24 tiết × 3 nguyên (Sách Bổ), từng nguyên.
- **Stem/Star/Gate/Spirit**: đối chiếu bảng tham chiếu.

### 5.2 Timezone tests
- Vietnam (+7), China (+8), Japan (+9), US (America/New_York), Europe (Europe/Paris).
- Cùng "07:30 giờ địa phương" → phải ra đúng bàn theo từng múi giờ.

### 5.3 Hemisphere tests
- Northern vs Southern — xác nhận Cửu Cung **không bị đảo**; chỉ tiết khí/giờ mặt trời khác theo vị trí.

### 5.4 Validation "Compare with Reference Chart"
- Nhập chart mẫu đã biết → hiển thị PASS/FAIL cho: Dun, Ju, Palaces, Gates, Stars, Spirits, Stems, Chief (Trực Phù), Chief Envoy (Trực Sử).
- Fixtures: 17/3/2021 (đã PASS trong prototype) + cần thêm ≥ 2 bảng chuẩn khác (1 Dương độn, 1 Âm độn) để tránh overfit.

### 5.5 Integration / API
- `POST /api/qimen/chart`, `/analyze`, `/directions`, `/best-time`, `/best-direction`, `/advice`, `GET /history`.
- Snapshot test đảm bảo cùng input + ruleSetVersion → cùng output (deterministic).

### 5.6 E2E (PWA)
- Flow: mở app → location → compass → nhập câu hỏi → lập bàn → phân tích → lời khuyên → xem lịch sử.
