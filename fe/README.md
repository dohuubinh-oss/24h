đây là mã nguồn thuần javascript:
- hỗ trợ đa màn hình: cập nhật tệp fe/tailwind.config.js để thêm các breakpoint cho Full HD (1920px), 2K (2560px) và 4K (3840px). Điều này cho phép chúng ta kiểm soát giao diện một cách chi tiết trên từng loại màn hình.
- ngoài email là bắt buộc để gửi báo cáo các bài kiểm tra có thể thêm sdt 
các bước thực hiện:
b0: cấu hình tailwind css
b1: tôi muốn tạo chức năng đăng kí đăng nhâp trước, bạn có khuyến nghị gì k, tạo chức năng quên mật khẩu( dùng thư viện @sendgrid/mail.), chức năng xác thực email khi đăng kí , chức năng đăng kí qua tài khoản google 
b2: thêm các câu hỏi qua json   : disable nút luu tất cả khi currentQuestion = defaultQuestion, và thêm logic cho nút lưu tất cả
b3: tạo trang exams thêm xóa sửa câu hỏi- ngân hàng câu hỏi.
b4 : tạo trang exams- ngân hàng đề thi: Thêm nút và logic "Tạo đề thi",Tôi sẽ tạo một trang /admin/exams mới để liệt kê tất cả các bài kiểm tra. Trang này sẽ tìm nạp tất cả các bài kiểm tra từ điểm cuối /api/v1/exams và hiển thị chúng ở định dạng bảng.
b5 : xây dựng giao diện làm bài thi
b6 : xây dựng Chức năng chấm điểm có sự hỗ trợ của AI khi chấm bài luận 