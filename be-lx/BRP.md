# Tài liệu Business Requirements (BRP) - Website Giới Thiệu Lưu Xá

## 1. Phân tích CONTEXT (Ngữ cảnh)

Dự án nhằm xây dựng một website giới thiệu chính thức cho Lưu Xá với các mục tiêu:

- Cung cấp thông tin chính thống về Lưu Xá cho khách truy cập.
- Giới thiệu tổng quan (lịch sử, không gian, hoạt động, thông báo).
- Quản lý thành viên hiện tại và cựu thành viên.
- Quản lý các hoạt động thể thao, phong trào.
- Hệ thống quản trị (Admin Panel) để quản trị viên dễ dàng cập nhật thông tin nội dung trang chủ, đăng thông báo, duyệt thành viên.
- Nền tảng có khả năng mở rộng (Scale-up) để phục vụ cho các chức năng quản lý phức tạp hơn về sau.
- Hệ thống backend dự kiến áp dụng công nghệ: Node.js, TypeScript, Prisma, Docker, MySQL, Cloudinary (để lưu trữ hình ảnh).

## 2. Các câu hỏi làm rõ yêu cầu người dùng (Clarification Questions)

Để việc phát triển được chính xác và sát với nghiệp vụ thực tế, team BA cần làm rõ các câu hỏi sau:

1. **Về phân quyền (Roles & Permissions):** Website có bao nhiêu role? (Ví dụ: Admin, Moderator/Ban điều hành, Thành viên Lưu Xá, Khách viếng thăm). Quyền hạn cụ thể của mỗi role là gì?
2. **Quản lý thành viên:** Bất kỳ ai cũng có thể đăng ký tạo tài khoản hay chỉ Admin mới được cấp tài khoản cho thành viên? Có cần chức năng duyệt tài khoản thành viên mới không?
3. **Bài Post/Thông báo:** Ai có quyền đăng thông báo hoặc cập nhật hoạt động thể thao? Có cần quy trình duyệt (Review-Approve) trước khi bài viết được publish không?
4. **Lưu trữ Image/File:** Ngoài việc tải ảnh hoạt động (qua Cloudinary), hệ thống có yêu cầu lưu trữ các file tài liệu khác (PDF, Word) cho thông báo không?
5. **Khả năng mở rộng:** Chúng ta có dự kiến tích hợp thêm các module như Quản lý đóng quỹ, Quản lý tài sản hư hỏng, Hay đăng ký lịch trực nhật trong tương lai gần không?

## 3. Lên kế hoạch triển khai (Kế hoạch Phát triển & Testing)

**Giao đoạn 1: Khởi tạo Project & API Core (Tuần 1-2)**

- Thiết kế Database Schema (Prisma) và dựng Docker/Docker Compose cho MySQL.
- Khởi tạo base project (Node.js + TypeScript).
- Xây dựng module Authentication & Authorization (JWT).
- Tích hợp Cloudinary cho việc upload hình ảnh.

**Giai đoạn 2: Phát triển các Module chính (Tuần 3-4)**

- Xây dựng module Quản lý nội dung/Thông báo (CRUD Bài viết).
- Xây dựng module Quản lý Thành viên (Xem, Sửa, Xóa, Phân quyền).
- Xây dựng module Hoạt động Thể thao.

**Giai đoạn 3: Testing & Fix Bug (Tuần 5)**

- Unit Testing cho các function business logic cốt lõi.
- Intergration Testing cho các API CRUD và Upload ảnh.
- Kiểm tra phân quyền truy cập API.

**Giai đoạn 4: Deployment & Bàn giao (Tuần 6)**

- Triển khai lên server (Sử dụng Docker).
- Bàn giao tài liệu API (Swagger/Postman).

## 4 & 5. Các nhiệm vụ tiếp theo (Suggested Tasks & Action Items)

Các thành viên trong dự án có thể bắt đầu với những nhiệm vụ dưới đây:

- [ ] **Task 1:** Trả lời/Thống nhất các câu hỏi làm rõ yêu cầu (Section 2).
- [ ] **Task 2:** BA thiết kế Database Diagram (ERD) dự kiến dựa trên các Entity: `User`, `Role`, `Post`, `Category`, `SportActivity`, v.v.
- [ ] **Task 3:** BA viết API Specifications chi tiết theo định dạng (Method, Endpoint, Request Body, Response, Middleware) giao cho team Backend.
- [ ] **Task 4:** Team Backend setup repository chuẩn bị cho việc code.
