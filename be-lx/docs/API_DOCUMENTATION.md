# API Documentation - Website Lưu Xá Backend

## Base URL

```
http://localhost:3000/api
```

## Rate Limiting

- **General Limit**: 100 requests per 15 minutes per IP
- **Authentication Endpoints**: 5 requests per 15 minutes per IP
- **Upload Endpoints**: 10 uploads per 15 minutes per IP

Rate limit information is returned in response headers:

- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time when the rate limit resets

## Security Headers

All responses include security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security` (HTTPS only)
- `Content-Security-Policy`

## Table of Contents

1. [Authentication](#authentication)
2. [Posts/Announcements](#posts-announcements)
3. [Members](#members)
4. [Sport Activities](#sport-activities)
5. [Error Responses](#error-responses)

---

## Authentication

### Register

Đăng ký tài khoản mới.

**Endpoint:** `POST /auth/register`

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "StrongP@ss123",
  "firstName": "Nguyen",
  "lastName": "Van A"
}
```

**Validation Rules:**

- `email`: Valid email format, automatically normalized to lowercase
- `password`: Minimum 8 characters, must contain:
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least one number (0-9)
  - At least one special character (@$!%\*?&)
- `firstName`: Required, max 100 characters
- `lastName`: Required, max 100 characters
- **Note**: Role is automatically set to `MEMBER` for new registrations. Only admins can assign other roles via database.

**Response:** `201 Created`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Nguyen",
    "lastName": "Van A",
    "role": "GUEST",
    "avatar": null,
    "createdAt": "2024-03-12T10:00:00.000Z",
    "updatedAt": "2024-03-12T10:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

### Login

Đăng nhập vào hệ thống.

**Endpoint:** `POST /auth/login`

**Rate Limit:** 5 requests per 15 minutes per IP

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Nguyen",
    "lastName": "Van A",
    "role": "MEMBER",
    "avatar": "https://cloudinary.com/...",
    "createdAt": "2024-03-12T10:00:00.000Z",
    "updatedAt": "2024-03-12T10:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

---

## Posts/Announcements

### Get All Posts

Lấy danh sách tất cả bài viết (Public). **Chỉ hiển thị bài viết đã PUBLISHED.**

**Endpoint:** `GET /posts`

**Query Parameters:**

- `page` (number, optional): Trang hiện tại (default: 1, min: 1)
- `limit` (number, optional): Số bài viết trên mỗi trang (default: 10, min: 1, max: 100)
- `categoryId` (uuid, optional): Lọc theo category (must be valid UUID)
- `authorId` (uuid, optional): Lọc theo tác giả (must be valid UUID)

**Note:** Public endpoint tự động lọc chỉ hiển thị bài viết có status=PUBLISHED. Query parameter `status` không được chấp nhận để tránh rò rỉ dữ liệu.

**Response:** `200 OK`

```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "Thông báo về hoạt động",
      "slug": "thong-bao-ve-hoat-dong",
      "content": "Nội dung bài viết...",
      "excerpt": "Tóm tắt ngắn gọn...",
      "thumbnail": "https://cloudinary.com/...",
      "status": "PUBLISHED",
      "authorId": "uuid",
      "categoryId": "uuid",
      "viewCount": 100,
      "isPinned": false,
      "publishAt": "2024-03-12T10:00:00.000Z",
      "createdAt": "2024-03-12T10:00:00.000Z",
      "updatedAt": "2024-03-12T10:00:00.000Z",
      "author": {
        "id": "uuid",
        "firstName": "Nguyen",
        "lastName": "Van A",
        "avatar": "https://cloudinary.com/..."
      },
      "category": {
        "id": "uuid",
        "name": "Thông báo",
        "slug": "thong-bao"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

### Get Post by ID

Lấy chi tiết bài viết theo ID (Public). **Chỉ trả về nếu bài viết đã PUBLISHED.**

**Endpoint:** `GET /posts/:id`

**Path Parameters:**

- `id` (uuid, required): Valid UUID of the post

**Response:** `200 OK` (if published) or `404 Not Found` (if not published or doesn't exist)

```json
{
  "id": "uuid",
  "title": "Thông báo về hoạt động",
  "slug": "thong-bao-ve-hoat-dong",
  "content": "Nội dung bài viết...",
  "excerpt": "Tóm tắt ngắn gọn...",
  "thumbnail": "https://cloudinary.com/...",
  "status": "PUBLISHED",
  "authorId": "uuid",
  "categoryId": "uuid",
  "viewCount": 101,
  "isPinned": false,
  "publishAt": "2024-03-12T10:00:00.000Z",
  "createdAt": "2024-03-12T10:00:00.000Z",
  "updatedAt": "2024-03-12T10:00:00.000Z"
}
```

### Get Post by Slug

Lấy chi tiết bài viết theo slug (Public).

**Endpoint:** `GET /posts/slug/:slug`

**Response:** `200 OK` (Same as Get Post by ID)

### Create Post

Tạo bài viết mới (Requires: ADMIN or MODERATOR).

**Endpoint:** `POST /posts`

**Rate Limit:** 10 uploads per 15 minutes per IP

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `title` (string, required): Tiêu đề bài viết (max 500 characters)
- `slug` (string, required): Slug của bài viết (max 200 characters)
- `content` (string, required): Nội dung bài viết
- `excerpt` (string, optional): Tóm tắt
- `categoryId` (uuid, required): Valid UUID của category
- `status` (string, optional): DRAFT | PENDING | PUBLISHED | ARCHIVED
- `isPinned` (boolean, optional): Ghim bài viết
- `thumbnail` (file, optional): Ảnh thumbnail (max 10MB)

**Validation:**

- All HTML inputs are sanitized to prevent XSS attacks
- File uploads must be valid image formats
- Author ID is automatically set from authenticated user

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "title": "Thông báo về hoạt động",
  "slug": "thong-bao-ve-hoat-dong",
  "content": "Nội dung bài viết...",
  "thumbnail": "https://cloudinary.com/...",
  "status": "DRAFT",
  "authorId": "uuid",
  "categoryId": "uuid",
  "viewCount": 0,
  "isPinned": false,
  "createdAt": "2024-03-12T10:00:00.000Z",
  "updatedAt": "2024-03-12T10:00:00.000Z"
}
```

### Update Post

Cập nhật bài viết (Requires: ADMIN or MODERATOR).

**Endpoint:** `PUT /posts/:id`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):** Same as Create Post (all fields optional)

**Response:** `200 OK` (Updated post object)

### Delete Post

Xóa bài viết (Requires: ADMIN or MODERATOR).

**Endpoint:** `DELETE /posts/:id`

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `204 No Content`

### Publish Post

Xuất bản bài viết (Requires: ADMIN or MODERATOR).

**Endpoint:** `PATCH /posts/:id/publish`

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `200 OK` (Updated post with status PUBLISHED)

### Unpublish Post

Hủy xuất bản bài viết (Requires: ADMIN or MODERATOR).

**Endpoint:** `PATCH /posts/:id/unpublish`

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `200 OK` (Updated post with status DRAFT)

---

## Members

### Get All Members

Lấy danh sách thành viên (Public). **Chỉ hiển thị thành viên ACTIVE.**

**Endpoint:** `GET /members`

**Query Parameters:**

- `page` (number, optional): Trang hiện tại (default: 1, min: 1)
- `limit` (number, optional): Số thành viên trên mỗi trang (default: 10, min: 1, max: 100)

**Note:** Public endpoint tự động lọc chỉ hiển thị thành viên có status=ACTIVE. Query parameter `status` không được chấp nhận để bảo vệ quyền riêng tư.

**Response:** `200 OK`

```json
{
  "members": [
    {
      "id": "uuid",
      "userId": "uuid",
      "studentId": "20210001",
      "phoneNumber": "0123456789",
      "address": "Hà Nội",
      "joinDate": "2024-03-12T10:00:00.000Z",
      "status": "ACTIVE",
      "bio": "Giới thiệu về bản thân...",
      "position": "Chủ nhiệm",
      "createdAt": "2024-03-12T10:00:00.000Z",
      "updatedAt": "2024-03-12T10:00:00.000Z",
      "user": {
        "id": "uuid",
        "email": "member@example.com",
        "firstName": "Nguyen",
        "lastName": "Van A",
        "avatar": "https://cloudinary.com/..."
      }
    }
  ],
  "total": 30,
  "page": 1,
  "totalPages": 3
}
```

### Get Member by ID

Lấy chi tiết thành viên theo ID (Public). **Chỉ trả về nếu thành viên đang ACTIVE.**

**Endpoint:** `GET /members/:id`

**Path Parameters:**

- `id` (uuid, required): Valid UUID of the member

**Response:** `200 OK` (if active) or `404 Not Found` (if inactive or doesn't exist)

```json
{
  "id": "uuid",
  "userId": "uuid",
  "studentId": "20210001",
  "phoneNumber": "0123456789",
  "address": "Hà Nội",
  "joinDate": "2024-03-12T10:00:00.000Z",
  "status": "ACTIVE",
  "bio": "Giới thiệu về bản thân...",
  "position": "Chủ nhiệm",
  "createdAt": "2024-03-12T10:00:00.000Z",
  "updatedAt": "2024-03-12T10:00:00.000Z",
  "user": {
    "id": "uuid",
    "email": "member@example.com",
    "firstName": "Nguyen",
    "lastName": "Van A",
    "avatar": "https://cloudinary.com/..."
  }
}
```

### Create Member

Tạo thông tin thành viên mới (Requires: ADMIN).

**Endpoint:** `POST /members`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "uuid",
  "studentId": "20210001",
  "phoneNumber": "0123456789",
  "address": "Hà Nội",
  "joinDate": "2024-03-12T10:00:00.000Z",
  "status": "ACTIVE",
  "bio": "Giới thiệu về bản thân...",
  "position": "Chủ nhiệm"
}
```

**Validation Rules:**

- `userId`: Required, must be valid UUID
- `studentId`: Optional, max 50 characters
- `major`: Optional, max 200 characters
- `class`: Optional, max 100 characters
- All inputs are sanitized to prevent XSS attacks

**Response:** `201 Created` (Created member object)

### Update Member

Cập nhật thông tin thành viên (Requires: ADMIN).

**Endpoint:** `PUT /members/:id`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:** Same as Create Member (all fields optional)

**Response:** `200 OK` (Updated member object)

### Delete Member

Xóa thành viên (Requires: ADMIN).

**Endpoint:** `DELETE /members/:id`

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `204 No Content`

### Update Member Status

Cập nhật trạng thái thành viên (Requires: ADMIN).

**Endpoint:** `PATCH /members/:id/status`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "ALUMNI"
}
```

**Response:** `200 OK` (Updated member object)

---

## Sport Activities

### Get All Activities

Lấy danh sách hoạt động thể thao (Public).

**Endpoint:** `GET /activities`

**Query Parameters:**

- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số hoạt động trên mỗi trang (default: 10)

**Response:** `200 OK`

```json
{
  "activities": [
    {
      "id": "uuid",
      "name": "Giải bóng đá",
      "description": "Mô tả về giải đấu...",
      "location": "Sân vận động A",
      "startDate": "2024-03-20T08:00:00.000Z",
      "endDate": "2024-03-20T17:00:00.000Z",
      "organizer": "Ban tổ chức",
      "organizerId": "uuid",
      "thumbnail": "https://cloudinary.com/...",
      "createdAt": "2024-03-12T10:00:00.000Z",
      "updatedAt": "2024-03-12T10:00:00.000Z",
      "organizerUser": {
        "id": "uuid",
        "firstName": "Nguyen",
        "lastName": "Van A",
        "avatar": "https://cloudinary.com/..."
      }
    }
  ],
  "total": 20,
  "page": 1,
  "totalPages": 2
}
```

### Get Activity by ID

Lấy chi tiết hoạt động theo ID (Public).

**Endpoint:** `GET /activities/:id`

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "name": "Giải bóng đá",
  "description": "Mô tả về giải đấu...",
  "location": "Sân vận động A",
  "startDate": "2024-03-20T08:00:00.000Z",
  "endDate": "2024-03-20T17:00:00.000Z",
  "organizer": "Ban tổ chức",
  "organizerId": "uuid",
  "thumbnail": "https://cloudinary.com/...",
  "createdAt": "2024-03-12T10:00:00.000Z",
  "updatedAt": "2024-03-12T10:00:00.000Z",
  "organizerUser": {
    "id": "uuid",
    "firstName": "Nguyen",
    "lastName": "Van A",
    "avatar": "https://cloudinary.com/..."
  },
  "images": [
    {
      "id": "uuid",
      "url": "https://cloudinary.com/...",
      "publicId": "luuxa/activities/image1",
      "description": "Hình ảnh hoạt động"
    }
  ]
}
```

### Create Activity

Tạo hoạt động thể thao mới (Requires: ADMIN or MODERATOR).

**Endpoint:** `POST /activities`

**Rate Limit:** 10 uploads per 15 minutes per IP

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

- `name` (string, required): Tên hoạt động (max 500 characters)
- `description` (string, optional): Mô tả
- `location` (string, optional): Địa điểm (max 500 characters)
- `startDate` (ISO8601 string, required): Ngày bắt đầu
- `endDate` (ISO8601 string, optional): Ngày kết thúc (must be after startDate)
- `organizer` (string, optional): Tên ban tổ chức
- `thumbnail` (file, optional): Ảnh thumbnail (max 10MB)

**Validation:**

- `endDate` must be after `startDate` if provided
- All HTML inputs are sanitized to prevent XSS attacks
- Organizer ID is automatically set from authenticated user

**Response:** `201 Created` (Created activity object)

### Update Activity

Cập nhật hoạt động (Requires: ADMIN or MODERATOR).

**Endpoint:** `PUT /activities/:id`

**Headers:**

```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body (Form Data):** Same as Create Activity (all fields optional)

**Response:** `200 OK` (Updated activity object)

### Delete Activity

Xóa hoạt động (Requires: ADMIN or MODERATOR).

**Endpoint:** `DELETE /activities/:id`

**Headers:**

```
Authorization: Bearer {token}
```

**Response:** `204 No Content`

---

## Error Responses

### 400 Bad Request

**Validation errors:**

```json
{
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters with uppercase, lowercase, number and special character"
    }
  ]
}
```

**Business logic errors:**

```json
{
  "message": "End date must be after start date"
}
```

### 401 Unauthorized

```json
{
  "message": "Invalid credentials"
}
```

### 403 Forbidden

```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "message": "Post not found"
}
```

### 409 Conflict

```json
{
  "message": "Email already exists"
}
```

### 429 Too Many Requests

```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

**Rate limit headers:**

- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests
- `RateLimit-Reset`: Time when limit resets (Unix timestamp)
- `Retry-After`: Seconds to wait before retrying

### 500 Internal Server Error

```json
{
  "message": "Internal server error"
}
```

**Note:** In production, error messages are sanitized to avoid exposing sensitive information.

---

## Authentication

Tất cả các API yêu cầu authentication phải gửi kèm JWT token trong header:

```
Authorization: Bearer {your-jwt-token}
```

**Security Notes:**

- JWT tokens expire after 7 days
- Tokens are signed with HS256 algorithm
- All authentication endpoints are rate-limited (5 requests per 15 minutes)
- Passwords are hashed using bcrypt with 10 rounds
- Failed login attempts are logged

## Roles & Permissions

- **ADMIN**: Toàn quyền quản lý hệ thống
  - Quản lý users, members, posts, activities
  - Assign roles (via database only)
  - Delete any content
- **MODERATOR**: Quản lý nội dung
  - Tạo, sửa, xóa bài viết
  - Tạo, sửa, xóa hoạt động thể thao
  - Publish/unpublish posts
- **MEMBER**: Thành viên của lưu xá
  - Xem nội dung
  - Có member profile
- **GUEST**: Khách truy cập
  - Chỉ xem nội dung public
  - Role mặc định khi đăng ký mới

**Note:** Roles cannot be set during registration for security reasons. Contact an administrator to change user roles.

## Input Sanitization

All user inputs are automatically sanitized to prevent XSS attacks:

- HTML tags are stripped from string inputs
- Special characters are escaped
- SQL injection is prevented by Prisma ORM's parameterized queries

## CORS Policy

- **Development**: All origins allowed
- **Production**: Only whitelisted origins (configured via `ALLOWED_ORIGINS` environment variable)
