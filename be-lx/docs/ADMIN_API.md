# ADMIN API Documentation

## 1. Phân tích context

Yêu cầu nghiệp vụ cho role `ADMIN` gồm:

- Quản lý thành viên: `name`, `avt` (avatar), `tên thánh`, `bio`, `ngày sinh`, `trường học`
- Quản lý thông báo: `nội dung`, `thời gian`, `địa điểm`

Đã triển khai trong code:

- Bổ sung field thành viên trong model/domain: `name`, `avatar`, `saintName`, `dateOfBirth`, `school`
- Bổ sung field thông báo trong model/domain: `location`, `eventTime`
- Các API tạo/sửa/xóa member giữ role `ADMIN`
- Các API thông báo (`posts`) tạo/sửa/xóa/publish/unpublish chuyển sang `ADMIN` only

---

## 2. Chuẩn xác thực

- Base URL: `/api`
- Header bắt buộc:

```http
Authorization: Bearer <jwt_token_admin>
```

- Lỗi thường gặp:
  - `401 Unauthorized`: thiếu token / token không hợp lệ
  - `403 Forbidden`: token không thuộc role `ADMIN`

---

## 3. API Admin - Quản lý thành viên

### 3.1 Tạo thành viên

- Method: `POST`
- Endpoint: `/api/members`
- Role: `ADMIN`

Request body (JSON):

```json
{
  "userId": "uuid",
  "name": "Nguyen Van A",
  "avatar": "https://example.com/avatar.jpg",
  "saintName": "Gioan",
  "bio": "Thanh vien luu xa",
  "dateOfBirth": "2000-01-01",
  "school": "Dai hoc Khoa hoc Tu nhien",
  "studentId": "SV001",
  "phoneNumber": "0901234567",
  "address": "Thu Duc",
  "position": "Thanh vien",
  "status": "ACTIVE"
}
```

Validate chính:

- `userId`: UUID, bắt buộc
- `name`: optional, tối đa 200 ký tự
- `avatar`: optional, URL hợp lệ
- `saintName`: optional, tối đa 200 ký tự
- `bio`: optional, string
- `dateOfBirth`: optional, ISO8601
- `school`: optional, tối đa 300 ký tự
- `studentId`: optional, tối đa 50 ký tự
- `phoneNumber`: optional, tối đa 50 ký tự
- `address`: optional, tối đa 500 ký tự
- `position`: optional, tối đa 200 ký tự

Response thành công: `201 Created`

---

### 3.2 Cập nhật thành viên

- Method: `PUT`
- Endpoint: `/api/members/:id`
- Role: `ADMIN`

Path params:

- `id`: UUID member

Body: partial các field như API tạo.

Response thành công: `200 OK`

---

### 3.3 Xóa thành viên

- Method: `DELETE`
- Endpoint: `/api/members/:id`
- Role: `ADMIN`

Path params:

- `id`: UUID member

Response thành công: `204 No Content`

---

### 3.4 Cập nhật trạng thái thành viên

- Method: `PATCH`
- Endpoint: `/api/members/:id/status`
- Role: `ADMIN`

Request body:

```json
{
  "status": "ACTIVE"
}
```

`status` nhận một trong các giá trị: `ACTIVE | INACTIVE | ALUMNI`.

Response thành công: `200 OK`

---

## 4. API Admin - Quản lý thông báo

> Hệ thống đang dùng resource `Post` làm thông báo.

### 4.1 Thêm thông báo

- Method: `POST`
- Endpoint: `/api/posts`
- Role: `ADMIN`
- Content type: `multipart/form-data` (hỗ trợ `thumbnail`)

Field bắt buộc:

- `title`
- `slug`
- `content` (nội dung)
- `categoryId` (UUID)
- `location` (địa điểm)
- `eventTime` (thời gian, ISO8601)

Field optional:

- `excerpt`, `thumbnail`, `status`, `publishAt`, `isPinned`

Response thành công: `201 Created`

---

### 4.2 Sửa thông báo

- Method: `PUT`
- Endpoint: `/api/posts/:id`
- Role: `ADMIN`
- Content type: `multipart/form-data`

Path params:

- `id`: UUID post

Body: partial các field thông báo, bao gồm `content`, `location`, `eventTime`.

Response thành công: `200 OK`

---

### 4.3 (Bổ sung) Xóa / publish / unpublish thông báo

Hiện API đã hỗ trợ thêm các thao tác admin sau:

- `DELETE /api/posts/:id`
- `PATCH /api/posts/:id/publish`
- `PATCH /api/posts/:id/unpublish`

Tất cả đều role `ADMIN`.

---

## 5. Ví dụ gọi nhanh

### 5.1 Tạo thành viên

```bash
curl -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"11111111-1111-1111-1111-111111111111",
    "name":"Nguyen Van A",
    "saintName":"Gioan",
    "school":"HCMUS",
    "dateOfBirth":"2000-01-01"
  }'
```

### 5.2 Tạo thông báo

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <admin_token>" \
  -F "title=Thong bao sinh hoat" \
  -F "slug=thong-bao-sinh-hoat" \
  -F "content=Noi dung thong bao" \
  -F "categoryId=22222222-2222-2222-2222-222222222222" \
  -F "location=Hoi truong A" \
  -F "eventTime=2026-03-20T18:30:00.000Z"
```

---

## 6. Đề xuất bước tiếp theo

1. Tạo migration Prisma cho các field mới (`Member`, `Post`) và áp dụng DB.
2. Chạy lại `prisma generate` để cập nhật Prisma Client type-safe theo schema mới.
3. Bổ sung test cho admin APIs:
   - auth/role test (`401`, `403`)
   - validation test (`400`)
   - happy-path create/update member và notification
4. Nếu cần tách rõ “Thông báo” khỏi `Post`, nên tạo model riêng `Notification`.
