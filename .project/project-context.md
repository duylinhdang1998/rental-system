# Project Context — Hệ thống quản lý cho thuê xe máy

## Client Q&A History

### Session 1 — 2026-08-31

**Yêu cầu:** Lập kế hoạch triển khai dựa trên workbook `Danh_sach_chuc_nang_thue_xe_may.xlsx`.

**Kết quả:** Đã phân tích 83 chức năng, gồm 71 mục ưu tiên 1 và 12 mục ưu tiên 2; đã tạo `.project/implementation-plan.md`.

### Session 2 — 2026-08-31

**Yêu cầu:** Thực hiện Sprint 0 và Sprint 1 trước để xem UI, sau đó mới tiếp tục các sprint còn lại.

**Quyết định đã ghi nhận:**

- Thực hiện Sprint 0 trước.
- Sprint 1 ưu tiên một vertical slice UI có thể xem và thao tác trên desktop/mobile.
- Không triển khai Sprint 2 trở đi trước khi người dùng duyệt UI Sprint 1.
- Wireframes và design system là bắt buộc trong Sprint 0.

### Session 3 — 2026-08-31

**Yêu cầu:** Xem ba ảnh Dashboard theo ba phong cách trước khi lựa chọn; đổi admin sang React SPA vì không cần SSR; có khả năng thêm landing page; chia công việc thành hai backend và hai frontend workstreams.

**Kết quả:** Đã tạo ba mockup trực quan, cập nhật React + Vite admin, Node API riêng và team allocation 2 BE/2 FE. Landing page được tách riêng để có thể prerender/static khi xác nhận phạm vi.

### Session 4 — 2026-08-31

**Yêu cầu:** Chọn UI số 3; backend dùng NestJS để TypeScript đầy đủ; phải có kế hoạch bảo mật backend gồm rate limit, chống brute force/DDoS và hỏi danh sách thư viện frontend.

**Kết quả:** Khóa hướng Soft Modern Operations, NestJS API và FE headless stack; bổ sung design system, wireframes Sprint 1 và kế hoạch bảo mật nhiều lớp. Chống DDoS được tách đúng trách nhiệm giữa edge/WAF và NestJS application controls.

### Session 5 — 2026-08-31

**Yêu cầu:** “Oke thực hiện sprint 0 nhé”.

**Kết quả:** Người dùng cho phép tiếp tục thực hiện Sprint 0. Artifact review đã LGTM,
roadmap/backlog Sprint 0–7 đã hoàn tất và Gate 1 preflight đạt phần cấu trúc. Việc phát
triển vẫn chờ phê duyệt rõ ràng đối với design system/wireframes, roadmap và BDD Sprint 1.

### Session 6 — 2026-08-31

**Yêu cầu:** Lưu hai workbook khách hàng gửi để dùng cho các chức năng sau.

**Kết quả:** Đã lưu nguyên bản trong `.project/client-inputs/private/2026-08-31/`,
kiểm tra checksum và ghi registry. `Book1.xlsx` là mẫu báo cáo doanh thu ngày;
`danh sach xe tra.xlsx` là mẫu lịch trả xe. Hai file có dữ liệu cá nhân nên không được
dùng trực tiếp trong test/demo; phải tạo fixture ẩn danh.

### Session 7 — 2026-08-31

**Yêu cầu:** “Oke thực hiện nốt sprint 0 và sang sprint 1 nhé”.

**Quyết định:** Phê duyệt Gate 1, gồm SRS/user stories, UI 3 Soft Modern, design
system, wireframes, tech stack/team, roadmap Sprint 0–7 và 15 kịch bản BDD Sprint 1.
Cho phép bắt đầu Sprint 1. Sprint 2+ vẫn dừng sau Sprint 1 để duyệt UI. Các quyết định
nghiệp vụ PD-04–PD-09 được chấp nhận là dependency hoãn đến trước sprint liên quan,
không chặn UI preview Sprint 1.

### Session 8 — 2026-09-01

**Yêu cầu:** Hoàn tất Sprint 0 và thực hiện Sprint 1.

**Kết quả:** Sprint 0 đã đóng tại Gate 1. Sprint 1 đã hoàn tất React SPA responsive,
NestJS API, Prisma contract, đăng nhập/phiên/RBAC/CSRF/rate limit, dashboard và các màn
hình preview VI/EN. Code review LGTM; QA PASS với 21 kiểm thử unit/integration, 10 kiểm
thử trình duyệt và bốn chỉ số coverage đều trên 80%. Sprint 2+ tiếp tục tạm dừng để người
dùng duyệt UI Sprint 1.

### Session 9 — 2026-09-01

**Yêu cầu:** Nếu Sprint 1 xong thì chạy Sprint 2 và Sprint 3, commit code lên
`https://github.com/duylinhdang1998/rental-system`.

**Kết quả hiện tại:** Repository trống đã nhận baseline Sprint 0–1 tại commit `fe5e1e9`;
hai workbook riêng tư được xác nhận không vào Git. Sprint 2–3 được mở Batch 0. BDD,
wireframe CRUD/lập hợp đồng và blueprint file đã được soạn; Batch 1 chờ phê duyệt bắt buộc.

### Session 10 — 2026-09-01

**Phản hồi:** Duyệt MVP một cửa hàng, quyền cấu hình/override và bảng giá cấu hình. Yêu
cầu lịch trực quan như đặt phòng họp/khách sạn để xem ngày xe còn trống. Cần giải thích
dễ hiểu hơn về quy tắc block 24 giờ/ân hạn và mục đích PDF hợp đồng.

**Xử lý:** Sprint 2 được duyệt triển khai. BDD/wireframe bổ sung availability calendar
theo xe × ngày, với Trống/Đang giữ/Đã có lịch thuê/Bảo dưỡng bằng biểu tượng + chữ. Quy
tắc 60 phút và mẫu PDF hệ thống được giải thích lại. Vì khách hàng đã cho phép chạy
Sprint 3, các mặc định này được dùng cho phiên bản đầu và vẫn có thể cấu hình/thay mẫu sau.

### Session 11 — 2026-09-01

**Kết quả Sprint 2:** Hoàn tất quản lý xe/khách hàng, lịch trống kiểu đặt phòng, kiểm soát
chuyển trạng thái có lý do, lịch sử bất biến, cảnh báo blacklist và dữ liệu giấy tờ riêng tư.
Code review LGTM; QA PASS với 34 kiểm thử unit/integration, 15 hành trình trình duyệt và
bốn chỉ số coverage đều trên 80%. Sprint 3 được mở với MVP một cửa hàng, block 24 giờ,
60 phút linh động và mẫu hợp đồng PDF Việt–Anh do hệ thống tạo.

### Session 12 — 2026-09-01

**Kết quả Sprint 3:** Hoàn tất bảng giá theo phiên bản, cách tính mỗi block 24 giờ với
60 phút linh động, VIP/override có giải thích và audit, hợp đồng nhiều xe chống trùng nguyên
khối, snapshot tên khách/giá, bàn giao riêng tư và PDF Việt–Anh. Lịch xe đọc booking mới.
Code review LGTM; QA PASS với 54 kiểm thử unit/integration, 18 hành trình trình duyệt và
bốn chỉ số coverage đều trên 80%. Sprint 0–3 sẵn sàng bàn giao trên GitHub.

### Session 13 — 2026-09-01

**Phản hồi:** Trả xe trễ tối đa 60 phút không tính phí; từ phút 61 tính 20.000 VND cho
mỗi giờ bắt đầu, làm tròn lên. Chủ cửa hàng phải cấu hình được số phút miễn phí và mức
phí theo giờ. Duyệt mẫu PDF hệ thống cho bản đầu; khi khách hàng cung cấp mẫu riêng thì
thay sau.

**Quyết định:** Tách rõ thời gian thuê dự kiến (block 24 giờ) khỏi trả xe thực tế. Chính
sách trả trễ được lưu theo phiên bản bảng giá và chụp vào từng hợp đồng, nên đổi cấu hình
không làm thay đổi hợp đồng cũ. PDF hệ thống phải in chính sách đã chụp của hợp đồng.

### Session 14 — 2026-09-01

**Phản hồi:** Frontend Sprint 1–3 không tuân thủ stack đã duyệt: thiếu shadcn/Radix,
native form controls, feature folders phẳng, hooks/state còn nằm trong component route,
CTA “Thêm xe” wrap hai dòng, form tạo mới và lịch xe chèn inline, font không phải Inter,
và dữ liệu nghiệp vụ thiếu/không hiển thị CreatedAt.

**Quyết định:** Mở Sprint 8 remediation trước Sprint 4–7. Dùng shadcn radix-nova làm
primitive registry, Inter là font bắt buộc, feature source nested theo trách nhiệm, form tạo
xe/khách dùng dialog và lịch xe dùng dedicated overlay. Mọi persisted business record có
`createdAt`; các list/card/summary đang triển khai phải hiển thị “Ngày tạo”. Thêm static
architecture gate để cấm native form controls ngoài `components/ui`.

### Session 15 — 2026-09-09

**Yêu cầu:** Cài dependency và mở Sprint 4 theo kế hoạch: vòng đời hợp đồng (đặt trước,
đang thuê, quá hạn, đã trả, đã hủy), gia hạn, đổi xe và bảng vận hành hôm nay.

**Quyết định:** Sprint 4 triển khai trên nền Sprint 3/8 đã duyệt. PD-06 dùng mặc định đề
xuất (tính lại toàn bộ kỳ thuê theo bậc của tổng số ngày mới, dùng bảng giá đã chốt của hợp
đồng) trong khi chờ Product Owner xác nhận. Trạng thái quá hạn do job đánh giá theo giờ
Asia/Ho_Chi_Minh; 60 phút ân hạn chỉ ảnh hưởng phí, không ảnh hưởng trạng thái. Đổi xe bắt
buộc ghi lý do; dòng xe cũ kết thúc tại thời điểm đổi, dòng mới thừa kế kỳ còn lại và giá,
tổng tiền không đổi. Hủy hợp đồng giữ nguyên bản ghi kèm người thao tác và lý do.

### Session 16 — 2026-09-10

**Yêu cầu:** Push mã nguồn Sprint 4 lên GitHub và thực hiện Sprint 5: trả riêng từng xe,
ghi phụ phí và tất toán hợp đồng.

**Quyết định:** Mỗi xe được nhận riêng với giờ trả thực tế, tình trạng, mức xăng và ảnh
riêng tư; hợp đồng chỉ chuyển sang "Đã trả" khi xe cuối cùng được nhận (BR-03). Phí trả trễ
tính theo PD-05 từ snapshot của dòng xe và ghi thành phụ phí bất biến ngay trong cùng giao
dịch; trả sớm không hoàn tiền ngày chưa dùng. Phụ phí hư hỏng/khác do Nhân viên hoặc Chủ ghi,
giảm trừ chỉ Chủ được ghi (BR-06). Tất toán tách rõ "Khách còn phải trả" và "Hoàn lại cho
khách" (BR-04), cọc khấu trừ tối đa bằng min(cọc, còn phải thu), bắt buộc xác nhận trả giấy tờ
giữ lại và hoàn cọc; sau tất toán mọi con số bị khóa (BR-07). Sổ thanh toán thuộc Sprint 6 nên
"Đã thanh toán" luôn bằng 0 cho đến khi đó. Mở PD-12 để Product Owner xác nhận các mặc định
này. Push GitHub bị từ chối (403) vì tài khoản Git hiện tại không có quyền ghi vào repository
của khách; commit đã sẵn sàng trên nhánh `main` cục bộ.

### Session 17 — 2026-09-10

**Yêu cầu:** Chạy tiếp sprint kế tiếp (Sprint 6): sổ thanh toán nhiều lần/nhiều hình thức,
công nợ và báo cáo doanh thu kèm xuất Excel.

**Quyết định:** Mỗi khoản thu/hoàn là một dòng sổ bất biến trên hợp đồng (tiền mặt hoặc
chuyển khoản, loại thu/hoàn chọn rõ, BR-04); số tiền thu tối đa bằng phần còn phải thu, hoàn tối
đa bằng phần đã thu ròng; gửi lặp cùng khóa giao dịch trả về đúng dòng đã ghi, dùng lại khóa cho
khoản khác bị từ chối (409). Bảng tất toán đọc "Đã thanh toán" từ sổ; sau tất toán vẫn thu tiếp
cho đến khi hết công nợ (BR-07). Công nợ chỉ tính khi hợp đồng đã hết hạn thuê hoặc đã nhận xe;
hợp đồng đặt trước và đã hủy không phải công nợ. Trang "Công nợ" mở cho cả hai vai trò; báo cáo
doanh thu (theo ngày làm việc Asia/Ho_Chi_Minh, theo nhân viên, theo hợp đồng, tuổi nợ) chỉ Chủ
xem được ở cả API lẫn giao diện (BR-08), khoảng báo cáo dưới 92 ngày. Xuất Excel theo đúng 14
cột của mẫu cửa hàng bằng bộ ghi OOXML tự viết, không thêm thư viện; mở PD-13 để Product Owner
xác nhận file một sheet không định dạng. Push GitHub vẫn bị từ chối (403); mã nguồn nằm trên
nhánh `feature/sprint-6-payments-reporting` cục bộ.

### Session 18 — 2026-09-18

**Yêu cầu:** Thực hiện tiếp các sprint còn lại theo kế hoạch (Sprint 7: gia cố bảo mật, UAT
và chuẩn bị go-live).

**Quyết định:** Giới hạn tần suất toàn cục theo cửa sổ trượt (đọc 120/phút, ghi 30/phút, đăng
nhập 20/phút theo IP kết hợp khóa tài khoản sau 5 lần sai, xuất báo cáo 5/10 phút) trả về 429
kèm `Retry-After` và sự kiện bảo mật; giới hạn kích thước body (413), header bảo vệ, tin cậy
proxy theo cấu hình, mã yêu cầu `x-request-id` trên mọi phản hồi; log JSON có che thông tin
nhạy cảm; endpoint sẵn sàng `/api/health/ready` kiểm tra cơ sở dữ liệu. Chủ có trang **Nhật
ký** (lọc theo loại bản ghi, thao tác, ngày; sửa giá hiển thị lý do, giá cũ, giá mới). US-006
chưa từng được xếp vào sprint nào nên được đưa vào Sprint 7 như điều kiện go-live (PD-14):
Chủ tạo, khóa (chấm dứt phiên ngay), mở khóa và đặt lại mật khẩu nhân viên; không thể tự khóa.
Công cụ vận hành: seed tài khoản Chủ đầu tiên (idempotent), script sao lưu / khôi phục / diễn
tập khôi phục / cảnh báo sao lưu cũ, lệnh `verify:restore` đối chiếu số hợp đồng, thanh toán,
tài khoản, sổ thanh toán và migration; script tải thử chỉ đọc; bốn runbook; hướng dẫn vận hành
tiếng Việt kèm 6 bài tập đào tạo; checklist phát hành. Quét accessibility (axe, WCAG 2.2 AA)
toàn bộ trang ở 360 px và 1280 px phát hiện lỗi tương phản và bảng cuộn không focus được,
đã sửa bằng token màu `brand-ink` và vùng bảng focus được. Các hạng mục cần hạ tầng (WAF biên,
diễn tập khôi phục trên Postgres thật, kho đếm dùng chung khi chạy nhiều bản sao, tải thử trên
staging, BAT có Chủ chứng kiến) để mở trong `release-checklist.md` cho đến khi chọn nhà cung
cấp. Sau đó khách yêu cầu push: quyền GitHub đã được cấp, đã đẩy `main`,
`feature/sprint-5-return-settlement`, `feature/sprint-6-payments-reporting` và
`feature/sprint-7-hardening-golive` lên `duylinhdang1998/rental-system`.

### Session 19 — 2026-09-18

**Yêu cầu:** Làm tiếp các sprint tiếp theo sau khi MVP (Sprint 0–7) hoàn tất.

**Quyết định:** Giai đoạn 2 được tách thành ba sprint (`planning/phase-2-roadmap.md`): Sprint 11
kinh tế tài sản (giá vốn xe, khấu hao, sổ chi phí, hòa vốn), Sprint 12 danh mục hư hỏng và
bảng giá, ảnh trả xe, chốt ca tiền mặt, hoàn cọc, Sprint 13 báo cáo nâng cao và biểu đồ xu
hướng 12 tháng; PD-08 (nhập Excel cũ) vẫn chờ. Giai đoạn 2 phát hành thành bản riêng, sau
MVP (PD-16). Sprint 11 đã xong: Chủ nhập **Giá vốn** cho từng xe (giá mua, ngày mua, số tháng
sử dụng, giá trị thanh lý) với xem trước khấu hao đường thẳng; cả hai vai trò **Ghi chi phí**
(8 nhóm, tiền mặt/chuyển khoản, gắn xe tùy chọn, mã idempotency chống ghi trùng); chi phí
không sửa/xóa, chỉ Chủ **Đảo** bằng bút toán đảo có lý do (BR-09); trang **Hiệu quả đội xe**
(chỉ Chủ) tính đến ngày chọn: giá vốn, khấu hao/tháng, giá trị còn lại, doanh thu quy theo
dòng xe của hợp đồng, ngày cho thuê, chi phí, ròng, % thu hồi, dự báo hòa vốn theo tốc độ 90
ngày gần nhất, dòng "Chưa phân bổ" và tổng, xuất Excel sheet "Đội xe". Ba thao tác mới có
trong Nhật ký. Doanh thu ở báo cáo này tính theo dòng hợp đồng (dồn tích), khác báo cáo
doanh thu theo tiền thu; hướng dẫn vận hành nêu rõ. Kết quả: 292 test đơn vị/tích hợp, 71
test trình duyệt, review LGTM, QA PASS; nhánh `feature/sprint-11-asset-economics` (chưa push).

### Session 20 — 2026-09-18

**Yêu cầu:** Làm tiếp các sprint tiếp theo (Sprint 12 sau Sprint 11).

**Quyết định:** Sprint 12 đã xong (nhánh `feature/sprint-12-operations-finance`, chưa push).
Chủ quản lý **Hạng mục hư hỏng** (Cài đặt → tab mới): mã, tên, giá, ngừng dùng/dùng lại,
có Nhật ký; khi nhận xe hoặc ghi phụ phí, Nhân viên chọn hạng mục và hệ thống chép giá + tên
tại thời điểm ghi (đổi giá sau không ảnh hưởng hợp đồng cũ), vẫn cho phép tự nhập. **Ảnh nhận
xe** (tối đa 5 ảnh, 2 MB, JPEG/PNG/WebP kiểm tra theo byte đầu) lưu riêng tư (bộ nhớ ở demo/test,
thư mục `PRIVATE_FILE_DIR` khi chạy thật), chỉ xem qua liên kết ký HMAC hiệu lực 300 giây,
không cache; API không bao giờ trả khóa tệp hay tên tệp gốc. **Hoàn cọc** tách khỏi bước tất
toán (PD-17): sau khi tất toán, nút "Hoàn cọc" ghi một dòng `DEPOSIT_REFUND` vào sổ (đúng số
tiền hoàn đã chốt, một lần duy nhất, không tính doanh thu/công nợ/hạn mức) và đổi nhãn "Chưa
hoàn cọc" → "Đã hoàn cọc". **Ca tiền mặt** (cả hai vai trò): Mở ca với tiền đầu ca; tiền mặt
phải có = đầu ca + thu tiền mặt − hoàn tiền mặt − hoàn cọc tiền mặt − chi phí tiền mặt trong
ca (đọc từ hai sổ, không lưu trùng — BR-10); Đóng ca với tiền đếm được, chênh lệch chốt cứng,
bắt buộc ghi chú khi lệch; mỗi lúc một ca; Nhân viên xem ca của mình, Chủ xem tất cả. Sáu
thao tác mới trong Nhật ký. Kết quả: 338 test đơn vị/tích hợp (55 file), 77 test trình duyệt,
review LGTM (3 lỗi chặn đã sửa: tách component, tách file test, cập nhật hai kịch bản trình
duyệt theo PD-17), QA PASS. Lưu ý go-live: kho tệp trên đĩa chỉ cho một bản sao API; cần
S3-compatible sau cùng port khi mở rộng. Tiếp theo: Sprint 13 (báo cáo nâng cao, biểu đồ xu
hướng 12 tháng); PD-08 vẫn chờ.

### Session 21 — 2026-09-18

**Yêu cầu:** Làm tiếp các sprint tiếp theo (Sprint 13 sau Sprint 12).

**Quyết định:** Sprint 13 đã xong (nhánh `feature/sprint-13-advanced-reporting`, chưa push);
Giai đoạn 2 (Sprint 11–13) hoàn tất. Hai trang báo cáo mới, chỉ Chủ xem: **Báo cáo → Phân
tích** và **Báo cáo → Lãi lỗ**. *Phân tích* chọn khoảng ngày (tối đa 366 ngày, quá thì báo
ngay và không gửi yêu cầu): bốn ô tổng (doanh thu, ngày thuê, hợp đồng, phụ phí ròng), biểu
đồ và bảng doanh thu theo tháng, bảng theo loại xe, theo xe, theo quốc tịch khách (có % tỷ
trọng), bảng phụ phí theo loại (trễ, hư hỏng, khác, giảm trừ) với tổng ròng, bảng tỷ lệ sử
dụng xe (ngày thuê / ngày sẵn có, theo xe, loại xe và toàn đội; xe chỉ tính từ ngày tạo; dòng
trả xe kết thúc lúc nhận xe thực tế), xuất Excel 6 sheet. Doanh thu ghi nhận một lần theo
dòng hợp đồng (tiền thuê tại ngày bắt đầu, phụ phí tại ngày ghi, giảm trừ âm, phí giao xe
tại ngày bàn giao) nên mọi bảng đều khớp một tổng; phí giao xe và phụ phí chung nằm ở dòng
"Chưa phân bổ". *Lãi lỗ* chọn tháng cuối và số tháng (6/12/24, mặc định 12 tháng đến tháng
hiện tại): mỗi tháng = doanh thu − chi phí (theo ngày chi, bút toán đảo trừ đi) − khấu hao
đường thẳng (tháng đầu tính khi đủ ngày mua), dòng tổng, biểu đồ xu hướng ba đường (doanh
thu, chi phí, lãi lỗ) vẽ bằng SVG thuần không thư viện, có tên trợ năng và bảng thay thế,
số âm dùng dấu trừ thật, xuất Excel sheet "Lãi lỗ". Không đổi schema, không có route ghi;
cả hai báo cáo đọc trực tiếp sổ hợp đồng, sổ chi phí và giá vốn. Kết quả: 384 test đơn
vị/tích hợp (61 file), 85 test trình duyệt, review LGTM (3 lỗi chặn đã sửa: tách component,
ô KPI tràn màn hình 360 px với số 8 chữ số, kịch bản trình duyệt lệch dữ liệu demo — xe demo
tạo đầu tháng 8/2026 nên kịch bản chuyển sang XE-003 tháng 8), QA PASS. Tiếp theo: PD-08 vẫn
chờ; các cổng go-live hạ tầng (PD-15) và xác nhận PD-06/12/13/14/16/17.

## Client Preferences

- Ngôn ngữ trao đổi: Tiếng Việt.
- Sản phẩm: Web app responsive, dùng tốt trên điện thoại.
- Cách triển khai: Xem và duyệt UI sớm trước khi mở rộng nghiệp vụ.
- Giao diện: UI số 3 — Soft Modern Operations.
- Frontend primitives: shadcn/ui với Radix; không dùng native form controls trực tiếp trong feature code.
- Typography: Inter cho toàn bộ admin app.
- Frontend admin: React SPA, không SSR.
- Backend: NestJS + TypeScript.
- Bảo mật: defense-in-depth; rate limit/CSRF/RBAC/validation ở API và DDoS/WAF ở edge.
- Team allocation: 2 backend workstreams và 2 frontend workstreams.

## Confirmed Product Facts

- Vai trò ban đầu: Chủ và Nhân viên.
- Một hợp đồng có thể chứa nhiều xe.
- Một xe trong hợp đồng có thể được trả riêng.
- Giá thuê có bậc theo số ngày và có thể sửa tay nếu ghi lý do.
- Hợp đồng hỗ trợ cọc tiền, giữ giấy tờ, phí giao xe và ảnh bàn giao.
- Thanh toán có thể nhiều lần và kết hợp tiền mặt/chuyển khoản.
- Hệ thống phải có nhật ký thao tác, sao lưu hằng ngày và giao diện Việt–Anh.

## Pending Decisions

| ID | Decision | Recommended Default | Status |
|---|---|---|---|
| PD-01 | Phong cách thiết kế | UI 3 — Soft Modern Operations | Approved and implemented in Sprint 1 |
| PD-02 | Tech stack | React + Vite admin, NestJS API, PostgreSQL + Prisma | Approved direction |
| PD-03 | Cơ cấu thực hiện | 2 backend, 2 frontend + UX/QA/review/DevOps | Approved allocation |
| PD-04 | Một hay nhiều chi nhánh | Một chi nhánh trong MVP | Approved |
| PD-05 | Cách tính ngày thuê và trả trễ | Thời gian dự kiến tính block 24 giờ; trả thực tế trễ tối đa 60 phút miễn phí, từ phút 61 tính 20.000 VND mỗi giờ bắt đầu | Approved; configurable and snapshotted per contract |
| PD-06 | Cách tính giá khi gia hạn | Tính lại toàn bộ thời gian theo bậc cuối | Implemented in Sprint 4 as the working default; Product Owner confirmation pending |
| PD-07 | Đặt trước xe đang thuê | Cho phép nếu không trùng khoảng `[start,end)` | Accepted as Sprint 3 default |
| PD-08 | Nhập Excel cũ khi go-live | Chuyển lên MVP nếu có dữ liệu đang vận hành | Pending |
| PD-09 | Mẫu hợp đồng Việt–Anh | Template hệ thống Sprint 3, thay bằng mẫu khách hàng khi nhận | Approved for initial operation |
| PD-10 | Mẫu báo cáo doanh thu ngày | Đã lưu `daily-revenue-report-sample.xlsx` | Received |
| PD-11 | Mẫu lịch trả xe | Đã lưu `vehicle-return-schedule-sample.xlsx` | Received |
| PD-12 | Xử lý cọc và phụ phí khi tất toán | Cọc khấu trừ tối đa min(cọc, còn phải thu); giảm trừ chỉ Chủ; công nợ còn lại chờ sổ thanh toán Sprint 6; trả sớm không hoàn tiền | Implemented in Sprint 5 as the working default; Product Owner confirmation pending |
| PD-13 | Cách xuất Excel báo cáo doanh thu | Bộ ghi OOXML tự viết: một sheet "Doanh thu", 14 cột theo mẫu, dòng tổng, số tiền dạng số, không định dạng/công thức; không thêm thư viện | Implemented in Sprint 6 as the working default; Product Owner confirmation pending |
| PD-14 | Quản lý tài khoản nhân viên (US-006) chưa được xếp sprint | Đưa vào Sprint 7 như điều kiện go-live: Chủ tạo / khóa / mở khóa / đặt lại mật khẩu, khóa chấm dứt phiên ngay, lịch sử giữ nguyên tên | Implemented in Sprint 7 as the working default; Product Owner confirmation pending |
| PD-15 | Nhà cung cấp hạ tầng và biên (hosting, WAF, Postgres quản lý) | Chọn nhà cung cấp để hoàn tất các cổng go-live phần B trong `release-checklist.md` | Pending |
| PD-16 | Giai đoạn 2 và phương pháp khấu hao | Giai đoạn 2 (Sprint 11–13) phát hành thành bản riêng sau MVP; khấu hao đường thẳng theo tháng, làm tròn xuống, không vượt giá mua trừ thanh lý; doanh thu quy theo dòng hợp đồng | Implemented in Sprint 11 as the working default; Product Owner confirmation pending |
| PD-17 | Hoàn cọc và kho ảnh nhận xe | Hoàn cọc là một dòng sổ riêng ("Hoàn cọc") sau khi tất toán, một lần, đúng số đã chốt, không tính doanh thu; bước tất toán chỉ còn xác nhận trả giấy tờ. Ảnh nhận xe lưu trên đĩa máy chủ API (`PRIVATE_FILE_DIR`), xem qua liên kết ký 300 giây; đổi sang S3-compatible khi chạy nhiều bản sao | Implemented in Sprint 12 as the working default; Product Owner confirmation pending |

## Design Decisions

| Decision | Rationale | Date | Status |
|---|---|---|---|
| Modular monolith | Phù hợp MVP, giảm vận hành nhưng giữ ranh giới nghiệp vụ | 2026-08-31 | Approved and implemented |
| UI vertical slice in Sprint 1 | Người dùng muốn duyệt UI trước các sprint nghiệp vụ | 2026-08-31 | Approved intent |
| Server-side authorization | Không dựa vào việc ẩn nút để bảo vệ dữ liệu | 2026-08-31 | Implemented for Sprint 1 |
| Immutable financial history | Tránh sai lệch khi sửa giao dịch/hợp đồng cũ | 2026-08-31 | Implemented for contract pricing in Sprint 3 |
| React SPA cho admin | Hệ thống quản trị không cần SSR | 2026-08-31 | Approved by client |
| Landing page tách riêng | Cho phép prerender/SEO mà không đổi kiến trúc admin | 2026-08-31 | Approved direction |
| Hai backend và hai frontend workstreams | Chia ownership và tăng thông lượng khi triển khai | 2026-08-31 | Approved by client |
| NestJS backend | Dùng TypeScript xuyên stack, module/guard/pipe rõ ràng | 2026-08-31 | Approved by client |
| Security nhiều lớp | NestJS throttling không thay thế edge DDoS/WAF | 2026-08-31 | Approved requirement |
| Soft Modern Operations | Dựa trên UI số 3, tăng contrast/mật độ cho vận hành | 2026-08-31 | Selected by client |
| shadcn/Radix frontend foundation | Khớp stack đã duyệt, có primitive accessibility và tránh custom controls phân tán | 2026-09-01 | Required by client |
| Feature-first nested source | Hooks/API/components/pages tách theo trách nhiệm trong từng domain | 2026-09-01 | Required by client |

## Scope Changes

| Change | Impact | Status | Date |
|---|---|---|---|
| Ưu tiên UI shell và màn hình demo trong Sprint 1 | Đưa một phần UI các module lên trước; nghiệp vụ thật vẫn theo roadmap sau | Approved by client | 2026-08-31 |

## Sprint 0 Decisions

- Wireframes = Yes
- Design Direction = UI 3 selected; design system/wireframes approved
- Tech Stack = React SPA + NestJS API approved
- Team = 2 Backend + 2 Frontend approved; support roles retained
- Roadmap = Sprint 0–7 approved; Sprint 0–7 complete in application scope; go-live awaits the infrastructure gates
