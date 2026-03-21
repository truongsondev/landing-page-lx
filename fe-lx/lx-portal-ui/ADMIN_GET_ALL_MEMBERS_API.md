# Admin API - Get All Members

## 1. Mục tiêu

Cung cấp API dành cho `ADMIN` để lấy danh sách tất cả thành viên dựa trên dữ liệu từ bảng `users` với các trường:

- `id`
- `email`
- `firstName`
- `lastName`
- `accountStatus`
- `avatar`

API hỗ trợ:

- Phân trang (`page`, `limit`)
- Filter theo `status` (trạng thái tài khoản)
- Sort theo nhiều trường và thứ tự tăng/giảm

---

## 2. Endpoint

- Method: `GET`
- URL: `/api/members/admin/users`
- Authentication: Bắt buộc JWT
- Authorization: Chỉ role `ADMIN`

### Header bắt buộc

```http
Authorization: Bearer <admin_access_token>
```

---

## 3. Query Parameters

| Parameter   | Type   | Required | Default     | Mô tả                              |
| ----------- | ------ | -------- | ----------- | ---------------------------------- |
| `page`      | number | No       | `1`         | Trang hiện tại, tối thiểu 1        |
| `limit`     | number | No       | `10`        | Số bản ghi mỗi trang, từ 1 đến 100 |
| `status`    | enum   | No       | -           | Lọc theo `accountStatus`           |
| `sortBy`    | enum   | No       | `createdAt` | Trường dùng để sắp xếp             |
| `sortOrder` | enum   | No       | `desc`      | Thứ tự sắp xếp                     |

### Giá trị hợp lệ

- `status`: `UNVERIFIED`, `PENDING`, `ACTIVE`
- `sortBy`: `id`, `email`, `firstName`, `lastName`, `accountStatus`, `createdAt`
- `sortOrder`: `asc`, `desc`

---

## 4. Response

### 4.1 Thành công - `200 OK`

```json
{
  "members": [
    {
      "id": "f5a6a1ff-cfa5-4a4b-9657-6ed1a3f2f2c7",
      "email": "member01@example.com",
      "firstName": "Nguyen",
      "lastName": "Van A",
      "accountStatus": "ACTIVE",
      "avatar": "https://res.cloudinary.com/demo/image/upload/v1/avatar_1.jpg"
    },
    {
      "id": "3af3a258-2ce4-44a7-a83c-aa0abf63dd17",
      "email": "member02@example.com",
      "firstName": "Tran",
      "lastName": "Thi B",
      "accountStatus": "PENDING",
      "avatar": null
    }
  ],
  "total": 32,
  "page": 1,
  "totalPages": 4
}
```

### 4.2 Lỗi xác thực - `401 Unauthorized`

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### 4.3 Lỗi phân quyền - `403 Forbidden`

```json
{
  "status": "error",
  "message": "Forbidden"
}
```

### 4.4 Lỗi validate - `400 Bad Request`

Ví dụ khi `sortOrder=descending`:

```json
{
  "status": "fail",
  "errors": [
    {
      "type": "field",
      "msg": "Thứ tự sắp xếp phải là asc hoặc desc",
      "path": "sortOrder",
      "location": "query"
    }
  ]
}
```

---

## 5. Ví dụ gọi API

### 5.1 Lấy danh sách mặc định

```bash
curl --request GET "http://localhost:3000/api/members/admin/users" \
  --header "Authorization: Bearer <admin_access_token>"
```

### 5.2 Lấy trang 2, 20 bản ghi, lọc ACTIVE, sort email tăng dần

```bash
curl --request GET "http://localhost:3000/api/members/admin/users?page=2&limit=20&status=ACTIVE&sortBy=email&sortOrder=asc" \
  --header "Authorization: Bearer <admin_access_token>"
```

---

## 6. Ghi chú triển khai

- API lấy dữ liệu từ bảng `users` và chỉ trả về user có liên kết `member`.
- Public API `GET /api/members` không bị ảnh hưởng (vẫn chỉ hiển thị member có `MemberStatus.ACTIVE`).
- API admin mới tập trung cho mục tiêu quản trị danh sách thành viên theo trạng thái tài khoản đăng nhập.

---

## 7. Đề xuất bước tiếp theo

1. Bổ sung integration test cho các case:
   - `200` với filter/sort/pagination
   - `400` khi query không hợp lệ
   - `401` khi thiếu token
   - `403` khi không phải admin
2. Đồng bộ tài liệu tổng hợp trong `docs/API_DOCUMENTATION.md` để frontend dễ tra cứu một nơi.
3. Nếu frontend cần thêm thông tin (ví dụ `createdAt`, `member.status`), có thể mở rộng response bằng query flag hoặc tạo endpoint chi tiết riêng.
