# QIMEN INTERPRETATION LIMITATIONS

> Những giới hạn phải luôn được ghi nhận khi sử dụng interpretation output.
> File này KHÔNG được phép bị bỏ qua khi phát hành tính năng.

## 1. KHÔNG phải tiên tri / xác suất
- Output là DIỄN GIẢI theo rule set của project — KHÔNG phải xác suất thành
  công, KHÔNG phải "dự đoán 100%".
- Không có empirical dataset → không được gọi bất kỳ con số nào là probability.

## 2. School dependency
- Nhiều rule là school-dependent (đã ghi `schoolDependent` trong từng finding):
  - 空亡: theo tuần GIỜ (mặc định) vs theo tuần NGÀY.
  - Mã tinh: theo GIỜ (mặc định) vs theo NGÀY.
  - 入墓: mọi can Thiên bàn (mặc định) vs chỉ can 用神.
  - 击刑: can Thiên bàn (mặc định) vs can Địa bàn; bảng 击刑 có biến thể.
  - Polarity của quan hệ sinh/khắc (L3) có biến thể giữa trường phái.
- KHÔNG silent merge — mặc định hiển thị, ghi chú để audit.

## 3. 用神 là quy ước project
- Ánh xạ QuestionType → 用神 (knowledge/yongshen.js) là PROJECT_RULE,
  confidence SCHOOL_DEPENDENT — chưa có citation cổ thư cho từng loại câu hỏi.
- Không được trình bày như chân lý cổ điển.

## 4. Tầng heuristic (L5)
- TOPIC_AFFINITY kế thừa CHU_DE cũ — HEURISTIC, confidence LOW.
- Chỉ là 1 đầu vào trọng số thấp; KHÔNG phải quy tắc cổ điển.

## 5. Nguồn cổ thư chưa đầy đủ
- Phần lớn rule L2/L3 gắn nhãn "Classical pattern" nhưng CHƯA có citation
  cổ thư cụ thể (chỉ có quy ước phổ thông + tài liệu project).
- 5 pattern (青龙返首, 飞鸟跌穴, 三奇得使, 九遁, 天网四张) chưa đủ nguồn → ĐANG TẮT.

## 6. Giới hạn của Calculation Engine (kế thừa, không thuộc phase này)
- Timezone hardcode UTC+7 (chưa IANA).
- Solar term chính xác tới ngày ở một số nhánh (xem QIMEN_VALIDATION.md).
- Day boundary chỉ 2300/0000 (school-dependent).
- Golden cases mới 3 (cần ≥200 từ nguồn độc lập).

## 7. Phạm vi
- Interpretation có RÀNG BUỘC HƯỚNG: UI luôn truyền `focusPalace` = cung đang
  hướng tới → đổi hướng = đổi kết quả. Không truyền focusPalace → quét toàn bàn
  (dành cho API/cron).
- UI luận giải: lưới 9 ô chủ đề (3×3) — mỗi ô = kết quả + luận giải chi tiết
  kèm lý do ngắn (bằng tiếng Việt, không còn chữ Trung; font +10%; viết hoa
  chữ cái đầu mỗi câu). Tên ô gọn: Sự nghiệp, Tài lộc, Kinh doanh, Tình cảm,
  Sức khỏe, Học hành, Đi lại, Kiện tụng, An toàn.
  NỀN MỖI Ô tô theo ĐIỂM CHỦ ĐỀ RIÊNG của nó. Ô TRUNG TÂM của bàn hiển thị
  các chủ đề thuận lợi tại hướng hiện tại.
- ĐIỂM CHỦ ĐỀ −2..+2: Thuận (rõ) +2 · Thuận (vừa/nhẹ) +1 · Trung tính/Trái
  chiều 0 · Không thuận (vừa/nhẹ) −1 · Không thuận (rõ) −2. UI chỉ hiển thị
  SỐ ĐIỂM (bỏ từ chỉ mức độ "Thuận (rõ)/Không thuận (vừa)/Trái chiều"...). Màu ô:
  +2 xanh lá đậm, −2 đỏ đậm, càng dương càng xanh, càng âm càng đỏ.
- ĐIỂM HƯỚNG −9..+9 = round(20%×Môn + 20%×Tinh + 20%×Thần + 40%×chủ đề) — tính
  PER-TYPE: phần chủ đề = Σ điểm 9 ô ÷ 2 (trọng 40%); phần Môn/Tinh/Thần = +1/0/−1
  theo phân loại lành/dữ intrinsic (knowledge/*.js: AUSPICIOUS=+1, NEUTRAL=0,
  OMINOUS=−1); mỗi phần quy về cùng thang −9..+9 — biểu tượng góp tối đa 5.4,
  chủ đề góp tối đa 3.6 — làm tròn 1 lần cuối → gọn trong −9..+9. Thời gian đi
  vào qua lá số (chart) của giờ đang chọn.
- ĐIỂM GIỜ −9..+9 = TỔNG ĐIỂM TỐT − TỔNG ĐIỂM XẤU của TẤT CẢ 8 hướng trong
  canh giờ đó (không phụ thuộc hướng được chọn; mỗi giờ dựng lá số riêng).
  API: `scoreDirection(chart, palace)`, `scoreHour(chart)`, `topicScores(...)`.
- 12 canh giờ: mỗi ô ghi "Tý +5 / 23h-1h" (tên + điểm giờ), màu theo điểm giờ.
- La bàn: dòng 1 rút gọn = "<độ>° Cung <cung> <hướng tt>, <Môn> Môn – Sao <Tinh> – Thần <Thần>"
  (vd "31° Cung Cấn ĐB, Khai Môn – Sao Thiên Phụ – Thần Huyền Vũ");
  tâm la bàn = điểm hướng (trên) + điểm giờ (dưới).
- Hướng "có lợi" trong conclusion chỉ là hướng cung chứa 用神 chính — tham khảo.

## 8. Safety
- HEALTH / WEALTH / LITIGATION luôn có safety disclaimer trong advice.
- Không thay thế tư vấn y tế / tài chính / pháp lý.
