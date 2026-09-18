# Hướng dẫn vận hành — Hệ thống quản lý cho thuê xe máy

**Dành cho:** Chủ cửa hàng và Nhân viên.  
**Phiên bản:** Sprint 13 (2026-09-18). Giao diện Việt–Anh, dùng được trên điện thoại và máy tính.

## 1. Đăng nhập và tài khoản

- Mở địa chỉ hệ thống, nhập tên đăng nhập và mật khẩu. Sau 5 lần sai, tài khoản bị chặn
  đăng nhập 15 phút.
- Chủ tạo tài khoản cho Nhân viên tại **Nhân viên → Thêm nhân viên** (tên đăng nhập 3–80 ký
  tự chữ thường/số/dấu chấm/gạch; mật khẩu tối thiểu 10 ký tự).
- **Khóa** một tài khoản sẽ chấm dứt phiên làm việc ngay lập tức; lịch sử hợp đồng, thu tiền
  vẫn giữ tên người đó. **Mở khóa** để cho làm việc lại. Chủ không thể tự khóa mình.
- **Đặt lại mật khẩu**: mật khẩu cũ hết hiệu lực và nhân viên phải đăng nhập lại.
- Đổi ngôn ngữ bằng nút **English / Tiếng Việt** ở góc trên; lựa chọn được ghi nhớ trên thiết bị.

## 2. Công việc hằng ngày của Nhân viên

1. **Tổng quan**: xem xe cần giao, xe cần nhận và hợp đồng quá hạn trong ngày.
2. **Xe**: kiểm tra trạng thái (sẵn sàng, đang thuê, bảo dưỡng); lịch xe cho biết khoảng
   thời gian còn trống.
3. **Khách hàng**: tìm theo tên hoặc số điện thoại; giấy tờ giữ lại được ghi trên hợp đồng.
4. **Hợp đồng → Tạo hợp đồng**: chọn khách, chọn xe (nhiều xe cùng lúc), thời gian thuê, cọc
   và giấy tờ, ảnh bàn giao, xác nhận. Giá tính tự động theo bậc ngày; chỉ Chủ được sửa giá và
   phải ghi lý do.
5. **Bàn giao xe** khi khách nhận; **Gia hạn** hoặc **Đổi xe** khi cần.
6. **Trả xe**: nhận từng xe, ghi tình trạng và phí trễ (tự tính theo quy tắc đã cấu hình).
   Phụ phí hư hỏng: chọn **Hạng mục hư hỏng** trong bảng giá (số tiền và nội dung tự điền,
   không sửa được) hoặc chọn "Tự nhập" để ghi tay. Chụp/chọn **Ảnh nhận xe** (tối đa 5 ảnh,
   mỗi ảnh ≤ 2 MB, JPEG/PNG/WebP); ảnh chỉ xem được trong hệ thống qua liên kết ngắn hạn.
   **Tất toán** khi trả hết xe: xác nhận đã trả giấy tờ giữ lại.
7. **Hoàn cọc** (nút hiện sau khi tất toán, nếu còn tiền cọc phải trả khách): chọn tiền mặt hay
   chuyển khoản, ghi mã tham chiếu; hệ thống ghi một dòng "Hoàn cọc" vào sổ và đổi nhãn
   "Chưa hoàn cọc" thành "Đã hoàn cọc". Chỉ hoàn được một lần; tiền hoàn cọc không tính vào
   doanh thu.
8. **Thu tiền**: ghi từng lần thu (tiền mặt hoặc chuyển khoản), có thể thu nhiều lần; hoàn tiền
   cũng ghi thành một dòng riêng. Không sửa/xóa dòng đã ghi.
9. **Ca tiền mặt**: đầu ca bấm **Mở ca** và nhập tiền đầu ca. Trong ca, ô **Tiền mặt phải có**
   tự cộng tiền mặt thu vào, trừ tiền mặt hoàn, hoàn cọc và chi phí tiền mặt kể từ lúc mở ca.
   Cuối ca bấm **Đóng ca**, nhập **Tiền đếm được**; nếu lệch (Thiếu/Thừa) phải ghi lý do.
   Mỗi lúc chỉ có một ca đang mở cho cả cửa hàng; ai mở thì người đó (hoặc Chủ) đóng.
10. **Công nợ**: danh sách hợp đồng còn phải thu, cũ nhất lên trước.
11. **Chi phí → Ghi chi phí**: chọn nhóm (xăng, bảo dưỡng, bảo hiểm, đăng kiểm, lương, mặt
   bằng, điện nước, khác), số tiền, tiền mặt hay chuyển khoản, ngày chi, nội dung; gắn xe nếu
   khoản chi thuộc một xe cụ thể (để trống là chi chung). Khoản chi đã ghi không sửa/xóa; ghi
   nhầm thì báo Chủ để đảo. Lọc theo ngày, nhóm và xe; bốn ô tổng ở đầu trang theo bộ lọc.

## 3. Việc của Chủ cửa hàng

- **Báo cáo**: doanh thu theo ngày, theo nhân viên, theo hợp đồng và tuổi nợ; **Xuất Excel**
  theo mẫu 14 cột. Chỉ Chủ xem được.
- **Nhật ký**: ai đã làm gì, lúc nào. Lọc theo loại bản ghi, thao tác và ngày. Sửa giá hiển thị
  lý do, giá cũ và giá mới; khóa tài khoản và đặt lại mật khẩu cũng được ghi (không lưu mật khẩu).
- **Cài đặt → Bảng giá**: quy tắc trả trễ (số phút miễn phí, mức phí theo giờ) áp dụng cho
  hợp đồng mới.
- **Cài đặt → Hạng mục hư hỏng**: bảng giá đền bù để Nhân viên chọn khi nhận xe. **Thêm hạng
  mục** với mã (viết hoa, không dấu, không trùng), tên và giá; **Sửa** đổi tên/giá (mã giữ
  nguyên); **Ngừng dùng** để ẩn khỏi danh sách chọn mà không mất lịch sử, **Dùng lại** khi cần.
  Đổi giá không ảnh hưởng phụ phí đã ghi trên hợp đồng cũ; mọi thay đổi vào Nhật ký.
- **Ca tiền mặt**: Chủ xem mọi ca đã đóng (người mở, tiền phải có, tiền đếm, chênh lệch, ghi
  chú) và có thể đóng ca của bất kỳ ai; Nhân viên chỉ xem ca của mình.
- **Nhân viên**: tạo, khóa, mở khóa, đặt lại mật khẩu.
- **Giá vốn** (nút trên từng xe ở trang **Xe**): nhập giá mua, ngày mua, số tháng sử dụng
  (mặc định 36) và giá trị thanh lý. Hệ thống xem trước khấu hao mỗi tháng, khấu hao lũy kế
  và giá trị còn lại tính đến hôm nay trước khi lưu; mỗi lần đổi giá đều vào Nhật ký.
- **Đảo khoản chi** (nút **Đảo** trên trang **Chi phí**): ghi lý do; hệ thống tạo một dòng đảo
  cùng số tiền, khoản gốc hiện "Đã đảo". Không có cách nào sửa hay xóa dòng đã ghi.
- **Báo cáo → Đội xe** (Hiệu quả đội xe): chọn ngày tính; mỗi xe hiện giá vốn, khấu hao/tháng,
  giá trị còn lại, doanh thu, ngày cho thuê, chi phí, ròng, % thu hồi và dự báo hòa vốn
  ("Đã hòa vốn", "Dự kiến <ngày>", "Chưa dự báo được" khi 90 ngày gần nhất lỗ, "Chưa có giá
  vốn"). Dòng **Chưa phân bổ** gom phí giao xe, phụ phí chung và chi phí không gắn xe; dòng
  **Tổng** khớp bốn ô đầu trang. **Xuất Excel** ra sheet "Đội xe". Doanh thu ở đây tính theo
  từng xe trong hợp đồng (kể cả chưa thu tiền); muốn xem tiền đã thu theo ngày thì dùng tab
  **Doanh thu**.
- **Báo cáo → Phân tích**: chọn **Từ ngày** / **Đến ngày** (tối đa 366 ngày; quá thì hệ thống
  báo ngay và không tải). Bốn ô đầu trang: doanh thu, ngày thuê, số hợp đồng, phụ phí ròng.
  Bên dưới là biểu đồ và bảng **Doanh thu theo tháng**, bảng **Theo loại xe**, **Theo xe**,
  **Theo quốc tịch khách** (mỗi dòng có % tỷ trọng; dòng **Chưa phân bổ** gom phí giao xe và
  phụ phí chung), bảng **Phụ phí** theo loại (trễ, hư hỏng, khác, giảm trừ) với tổng ròng, và
  bảng **Tỷ lệ sử dụng xe**: ngày thuê / ngày sẵn có theo từng xe, theo loại xe và **Toàn
  đội** (xe chỉ tính từ ngày được thêm vào hệ thống; xe trả sớm thì ngừng tính từ lúc nhận
  xe). Mọi bảng cộng lại bằng đúng ô doanh thu đầu trang. **Xuất Excel** ra tệp 6 sheet
  `phan-tich-<từ>-<đến>.xlsx`.
- **Báo cáo → Lãi lỗ**: chọn **Tháng cuối** và **Số tháng** (6, 12 hoặc 24; mặc định 12 tháng
  đến tháng hiện tại). Mỗi tháng: doanh thu − chi phí (theo ngày chi; khoản đã đảo không
  tính) − khấu hao (đường thẳng theo **Giá vốn**; tháng đầu tính khi đủ tròn tháng kể từ ngày
  mua) = lãi lỗ; dòng **Tổng cộng** ở cuối. Biểu đồ **Xu hướng** vẽ ba đường doanh thu, chi
  phí, lãi lỗ; số âm hiện dấu trừ (−). Trên điện thoại bảng đổi thành thẻ theo tháng. **Xuất
  Excel** ra sheet "Lãi lỗ" (`lai-lo-<tháng đầu>-<tháng cuối>.xlsx`). Doanh thu ở đây tính
  theo hợp đồng (dồn tích), giống tab **Đội xe**.

## 4. Khi có sự cố

- Nếu màn hình báo "Quá nhiều yêu cầu, vui lòng thử lại sau": đợi một phút rồi thao tác lại.
- Nếu không đăng nhập được với thông báo "Tài khoản hiện không thể truy cập": liên hệ Chủ để
  mở khóa.
- Nếu hệ thống báo lỗi kèm mã yêu cầu (`req_…`), gửi mã đó cho bộ phận kỹ thuật.
- Dữ liệu được sao lưu hằng đêm; bộ phận kỹ thuật diễn tập khôi phục hằng tuần. Không nhập lại
  dữ liệu thủ công trước khi kỹ thuật xác nhận.

## 5. Bài tập đào tạo (mỗi người làm xong trước ngày go-live)

| # | Vai trò | Bài tập | Kết quả mong đợi |
|---|---|---|---|
| 1 | Nhân viên | Tạo hợp đồng 2 xe cho khách mẫu, bàn giao, thu cọc | Hợp đồng ở trạng thái đang thuê, sổ thanh toán có 1 dòng |
| 2 | Nhân viên | Nhận 1 xe trễ 90 phút, thêm phụ phí, nhận xe còn lại, tất toán | Phí trễ tự tính, hợp đồng hoàn tất, công nợ hiển thị đúng |
| 3 | Nhân viên | Thu nốt công nợ bằng chuyển khoản, có mã tham chiếu | Còn phải thu 0 ₫ |
| 4 | Chủ | Sửa giá một xe với lý do, xem Nhật ký | Nhật ký ghi lý do, giá cũ, giá mới |
| 5 | Chủ | Tạo tài khoản nhân viên mới, khóa rồi mở khóa | Nhân viên đăng nhập được sau khi mở khóa |
| 6 | Chủ | Xuất Excel doanh thu của ngày | File `doanh-thu-<từ>-<đến>.xlsx` mở được, 14 cột, có dòng tổng |
| 7 | Chủ | Thêm hạng mục "Gương chiếu hậu" 150.000 vào Bảng giá hư hỏng | Hạng mục hiện "Đang dùng", Nhật ký có dòng thêm hạng mục |
| 8 | Nhân viên | Nhận xe có hư hỏng, chọn hạng mục vừa thêm, đính kèm 1 ảnh, tất toán, bấm Hoàn cọc | Phụ phí 150.000 đúng tên, chi tiết hợp đồng hiện "Ảnh nhận xe: 1", nhãn "Đã hoàn cọc" |
| 9 | Nhân viên | Mở ca 1.000.000, thu tiền mặt 200.000, đóng ca với 1.180.000 và ghi lý do | Lịch sử ca hiện "Thiếu" −20.000 ₫ kèm ghi chú |
| 10 | Chủ | Mở **Báo cáo → Phân tích** cho tháng vừa rồi, đối chiếu bảng Theo xe với ô doanh thu, xuất Excel | Tổng các dòng Theo xe (kể cả Chưa phân bổ) bằng ô doanh thu; tệp `phan-tich-…xlsx` có 6 sheet |
| 11 | Chủ | Mở **Báo cáo → Lãi lỗ**, chọn 6 tháng, tìm tháng có khoản chi lớn nhất | Dòng tháng đó hiện lãi lỗ âm với dấu −, biểu đồ có 6 điểm mỗi đường |
