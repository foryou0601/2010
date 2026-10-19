GỬI EM — MÓN QUÀ 20/10 / PHIÊN BẢN NGÂN HÀ CHO MOBILE

1. CHẠY TRÊN VSCODE
Giải nén ZIP. Mở thư mục bằng VSCode. Nhấn phải index.html > Open with Live Server (nếu đã cài extension Live Server).
Cũng có thể mở index.html trực tiếp bằng Chrome/Edge. Không cần npm hay cài thư viện.

2. CẤU TRÚC
index.html: nội dung trang
css/style.css: màu sắc, bố cục, hiệu ứng
js/config.js: lời thư, danh sách ảnh, nhạc
js/app.js: điều khiển hoa nở, thư và cá voi
images/: hoa hồng chân thật và cá voi baby 3D đóng/mở miệng được tạo bằng AI; tranh minh họa và ảnh của bạn
fonts/: Noto Serif và DejaVu Sans dạng WOFF, đóng gói cục bộ, hỗ trợ tiếng Việt; không cần Google Fonts
music/: âm thanh hoa nở và nhạc piano nguyên bản tạo sẵn

3. THAY ẢNH, THƯ VÀ NHẠC TRƯỚC KHI GỬI
- Chép tối đa 6 ảnh vào images/ (ví dụ anh-01.jpg).
- Mở js/config.js, sửa src của từng ảnh thành images/anh-01.jpg và sửa caption.
- Sửa dear và paragraphs để thay lời thư. Giữ nguyên dấu nháy và dấu phẩy trong cấu trúc JavaScript.
- Chép bài nhạc được phép sử dụng vào music/, sửa music trong config thành music/ten-bai-hat.mp3.
- Nhạc mặc định là giai điệu piano nhẹ được tạo cho bản này; ảnh mặc định là tranh minh họa, không phải ảnh hai bạn.
- Nút Cá nhân hóa cho phép chọn thử ảnh/nhạc ngay trên trang. Những lựa chọn đó chỉ có trong phiên xem, KHÔNG được lưu vào ZIP hay gửi sang thiết bị người nhận. Muốn giữ lâu dài, sửa tệp như trên.

4. TRÌNH TỰ
Chạm nút > bông hoa hiện và nở > bùng nổ hoa toàn màn hình kèm tiếng ngân > nhạc piano tăng dần > bức thư > nút “nhấp vào đây đi em” > cá voi mở miệng và từng ảnh bay ra.
Có nút tắt/bật âm thanh, xem ảnh lớn, thả lại ảnh và xem lại toàn bộ.
Nhạc chỉ bắt đầu sau thao tác chạm đầu tiên theo quy định trình duyệt. Nếu trình duyệt chặn nhạc, chạm nút âm thanh.
Trang hỗ trợ màn hình điện thoại, bàn phím, và giảm chuyển động khi hệ điều hành yêu cầu.

5. GỬI NGƯỜI YÊU
Có thể gửi cả ZIP để mở trên máy tính, hoặc đưa toàn bộ nội dung thư mục này lên dịch vụ hosting tĩnh để có link chia sẻ. Link Sites hiện tại mặc định chỉ chủ sở hữu xem được; cần cấu hình quyền chia sẻ trước khi gửi link cho người khác.
Không đặt riêng index.html lên hosting mà bỏ quên thư mục ảnh, CSS, JS và nhạc.

6. BẢN NÂNG CẤP MOBILE
Nền ngân hà tím than với tinh vân hồng và sao. Ảnh hoa/cá voi tối ưu WebP có nền trong suốt. Nụ hoa chuyển sang hoa nở và cá voi chuyển từ đóng sang mở miệng bằng hai khung hình.
Bố cục riêng cho điện thoại, kể cả màn hình hẹp 320px; nút dễ chạm, ô nhập 16px tránh tự phóng to trên iPhone. Font cục bộ có dấu tiếng Việt.
Các tranh minh họa kỷ niệm vẫn là mẫu cho tới khi bạn thay ảnh thật của hai người.

7. NÚT NHẬN QUÀ VÀ EMAIL
Nút dưới cá voi mở hộp quà có số +201026$.
Hiện email đang để trống vì cần chủ trang cung cấp đúng địa chỉ nhận. Khi chưa cấu hình, nút chỉ hiện quà, không gửi email.
Sau khi có email: mở js/config.js, điền notification.formsubmitRecipient bằng email nhận (hoặc mã form đã xác thực). Không cần mật khẩu email, không đặt mật khẩu/API key vào JS.
Trang gửi thông báo qua FormSubmit AJAX. Lần gửi đầu tiên dịch vụ sẽ gửi thư kích hoạt tới email nhận; chủ hộp thư cần mở thư và bấm xác nhận trước khi dùng chính thức. Sau đó thử nút một lần để kiểm tra hộp thư và Spam.
Tài liệu: https://formsubmit.co/ajax-documentation và https://formsubmit.co/help
FormSubmit có thể cung cấp mã form để thay email trong URL. Dùng mã đó nếu muốn tránh đặt email trực tiếp trong tệp công khai.
Chỉ bấm nút mới gửi thông báo. Cùng trình duyệt sẽ ghi nhớ khi dịch vụ đã chấp nhận thông báo để giảm gửi trùng. Không tự gửi lại nền nếu lỗi mạng. HTTP chấp nhận không phải xác nhận đã đến Inbox.
Khi đổi email hay thử lại cấu hình, xóa khóa gui-em-2010-gift-notification-v1 trong Local Storage của trang.
Cần mạng và chạy qua HTTPS hoặc Live Server để gửi email; mở file:// trực tiếp chỉ nên dùng xem hiệu ứng.

8. VÒNG LẶP CÁ VOI / BẢN NÂNG CẤP
Mỗi ảnh được cá voi phun lên kèm tia nước, đứng lại cho xem, rồi bị hút nhỏ dần vào miệng. Sau đó cá voi phun ảnh tiếp theo.
Luôn đi qua 6 vị trí ảnh, lặp đúng 3 lượt = 18 lần xuất hiện. Nếu chỉ chọn ít hơn 6 ảnh, các ảnh đã chọn được xoay vòng để đủ 6 vị trí mỗi lượt.
Có bộ đếm Lượt / Ảnh, nút Tạm dừng / Tiếp tục và Xem lại 3 lượt. Chạm ảnh để xem lớn; đóng ảnh sẽ tiếp tục. Khi chuyển sang tab khác, vòng lặp tạm dừng.
Xem lại từ đầu sẽ hủy sạch vòng ảnh, tia nước và các hẹn giờ đang chạy. Đổi bộ ảnh trong Cá nhân hóa sẽ khởi động lại bằng bộ mới.
Mỗi vòng đầy đủ khoảng 100 giây. Chế độ giảm chuyển động giữ đủ 18 ảnh nhưng rút gọn các chuyển động mạnh.
js/whale-show.js: điều khiển vòng lặp và tia nước; js/app.js: kết nối với các cảnh còn lại.
Email vẫn đang chờ chủ trang cung cấp địa chỉ nhận; không có thay đổi nào về gửi email trong bản này.

9. CÁ VOI CUTE
Đã đổi sang cá voi baby 3D tím xanh pastel, thân tròn, má hồng, mắt long lanh, miệng cười nhỏ. Hai khung hình đóng/mở miệng mới nằm trong images/whale-cute-closed.webp và images/whale-cute-open.webp. Vẫn giữ nguyên 6 ảnh × 3 lượt, tia nước, tạm dừng và nút nhận quà.

10. CÁ VOI BAY NHỎ GỌN
Cá voi bay từ ngoài mép trái vào khung hình, lơ lửng nhẹ khi nhả/nuốt ảnh, rồi bay ra mép phải khi kết thúc 3 lượt.
Không phóng to con cá voi: chuyển động chỉ đổi vị trí và xoay nhẹ. Kích thước trên điện thoại khoảng 48% bề ngang màn hình (tối đa 200px); trên máy tính tối đa 320px.
Chế độ giảm chuyển động bỏ chuyến bay dài. Tạm dừng/xem ảnh lớn/chuyển tab vẫn tạm dừng cả chuyến bay. Xem lại từ đầu hủy sạch đường bay cũ.
