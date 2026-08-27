# QIMEN RULE CONFLICTS

> Các điểm có nhiều trường phái. Format: RULE / CURRENT / ALTERNATIVE / SOURCE A / SOURCE B / TEST CASE / IMPACT / DECISION / DECISION OWNER.

---

## CONFLICT-001 — Heaven Plate (Thiên bàn)

- **RULE**: cách xoay 天盘三奇六仪.
- **CURRENT**: vòng Lạc Thư xoay cứng, Trung cung giữ nguyên.
- **ALTERNATIVE**: xoay tuyến tính 1→9 (tất cả 9 cung).
- **SOURCE A**: `atopx/qimen` `RotateStems` (Lạc Thư) — engine Go.
- **SOURCE B**: (không có nguồn đáng tin; "tuyến tính" từng dùng nhưng không có citation cổ thư).
- **TEST CASE**: 17/3/2021 03:00 Dương độn 1 → Thiên bàn: Lạc Thư cho `1=Quý,8=Mậu`; tuyến tính cho `1=Canh,8=Mậu`.
- **IMPACT**: toàn bộ thiên bàn can (1 trong 6 tầng của bàn).
- **DECISION**: giữ Lạc Thư (khớp 2 engine độc lập).
- **DECISION OWNER**: cần chuyên gia cổ thư xác nhận.

## CONFLICT-002 — Eight Spirits (Bát Thần)

- **RULE**: bộ 8 thần cho Âm/Dương.
- **CURRENT**: FIXED (白虎/玄武 cho cả Dương+Âm).
- **ALTERNATIVE**: YIN/YANG SWAP (Dương: 勾陈/朱雀; Âm: 白虎/玄武).
- **SOURCE A**: `atopx/qimen` BuildGod (白虎/玄武) + `qfdk/qimen` (白虎/玄武).
- **SOURCE B**: truyền thống Việt phổ biến (勾陈/朱雀 cho Dương).
- **TEST CASE**: Dương độn → thần vị trí 5/6 khác nhau giữa 2 bộ.
- **IMPACT**: 2/8 thần ở Dương độn.
- **DECISION**: default FIXED; giữ SWAP làm option.
- **DECISION OWNER**: cần chuyên gia xác nhận trường phái.

## CONFLICT-003 — Day Boundary

- **RULE**: mốc đổi ngày.
- **CURRENT**: 2300 (晚子时归次日).
- **ALTERNATIVE**: 0000 (giữ nguyên ngày tới nửa đêm).
- **SOURCE A**: `atopx/qimen` (23点换日).
- **SOURCE B**: hệ hiện đại (0:00).
- **TEST CASE**: 23:30 → ngày Can Chi khác nhau.
- **IMPACT**: day Gan-Zhi, hour Gan-Zhi, Xun, Yuan, Ju, cả bàn.
- **DECISION**: default 2300; cần thêm option 0000.
- **DECISION OWNER**: cần chuyên gia xác nhận.

## CONFLICT-004 — Zhi Shi (Bát Môn)

- **RULE**: cách an 值使.
- **CURRENT**: 值使随时支 (đếm bước 时支−旬首支).
- **ALTERNATIVE**: 值使随时宫 (地支配八宫: Tý→Khảm...).
- **SOURCE A**: `atopx/qimen` BuildDoor (随时支).
- **SOURCE B**: tài liệu "地支配八宫" (một số sách).
- **TEST CASE**: 17/3/2021 03:00 → Hưu môn: 随时支 = cung 3; 随时宫 = cung 8.
- **IMPACT**: toàn bộ 8 môn.
- **DECISION**: giữ 随时支 (khớp 2 engine).
- **DECISION OWNER**: cần chuyên gia.

## CONFLICT-005 — Ju method (Cục)

- **RULE**: 拆补 vs 置闰.
- **CURRENT**: CHAIBU (拆补).
- **ALTERNATIVE**: ZHIRUN (置闰), MAOSHAN (茅山).
- **SOURCE A**: (chưa có citation cổ thư cho CHAIBU).
- **SOURCE B**: (置闰 có mô tả trong atopx, chưa implement).
- **TEST CASE**: các năm có Phù Đầu lệch so với nhị chí (cần xác định).
- **IMPACT**: cục số ở 1 số ngày.
- **DECISION**: giữ CHAIBU; 置闰 chưa implement.
- **DECISION OWNER**: cần chuyên gia.

## CONFLICT-006 — Tian Qin (Thiên Cầm)

- **RULE**: vị trí 天禽.
- **CURRENT**: JI_KUN2 (寄坤2, đi cùng 天芮).
- **ALTERNATIVE**: KEEP_CENTER (giữ Trung cung) / WITH_TIAN_RUI (cùng 天芮).
- **SOURCE A**: `atopx/qimen` (禽芮寄坤二).
- **SOURCE B**: một số tài liệu giữ 天禽 tại Trung cung.
- **IMPACT**: sao tại Trung cung / cung 2.
- **DECISION**: JI_KUN2.
- **DECISION OWNER**: cần chuyên gia.

---

*KHÔNG tự sửa các conflict này khi chưa có quyết định rule-set rõ ràng.*
