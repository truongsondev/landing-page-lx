# Database Schema Documentation

## Overview

Hệ thống quản lý thông tin Lưu Xá với các module chính:

- User Management (Quản lý người dùng)
- Member Management (Quản lý thành viên)
- Post/Announcement Management (Quản lý bài viết/thông báo)
- Sport Activity Management (Quản lý hoạt động thể thao)
- Media Management (Quản lý hình ảnh)

## Technology Stack

- **ORM**: Prisma 7.5.0
- **Database**: MySQL 8.0
- **Connection**: Direct connection via DATABASE_URL environment variable
- **Schema Format**: Prisma 7 format (no URL in datasource block)

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐         ┌──────────────────┐
│     User        │────1:1──│     Member       │
└─────────────────┘         └──────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐         ┌──────────────────┐
│     Post        │──N:1────│    Category      │
└─────────────────┘         └──────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│     Image       │
└─────────────────┘
        ▲
        │ 1:N
        │
┌─────────────────┐
│ SportActivity   │──N:1────User (organizer)
└─────────────────┘
```

## Tables

### 1. users

Bảng lưu trữ thông tin người dùng và tài khoản.

| Column    | Type         | Constraints             | Description            |
| --------- | ------------ | ----------------------- | ---------------------- |
| id        | VARCHAR(36)  | PRIMARY KEY             | UUID                   |
| email     | VARCHAR(255) | UNIQUE, NOT NULL        | Email đăng nhập        |
| password  | VARCHAR(255) | NOT NULL                | Mật khẩu đã hash       |
| firstName | VARCHAR(100) | NOT NULL                | Tên                    |
| lastName  | VARCHAR(100) | NOT NULL                | Họ                     |
| role      | ENUM         | NOT NULL, DEFAULT GUEST | Vai trò trong hệ thống |
| avatar    | TEXT         | NULL                    | URL ảnh đại diện       |
| createdAt | DATETIME     | NOT NULL, DEFAULT NOW   | Ngày tạo               |
| updatedAt | DATETIME     | NOT NULL, AUTO UPDATE   | Ngày cập nhật          |

**Enums:**

- Role: `ADMIN`, `MODERATOR`, `MEMBER`, `GUEST`

**Indexes:**

- PRIMARY KEY (id)
- UNIQUE (email)

**Relations:**

- 1:1 with Member
- 1:N with Post (as author)
- 1:N with SportActivity (as organizer)

---

### 2. members

Bảng lưu trữ thông tin chi tiết của thành viên Lưu Xá.

| Column      | Type         | Constraints                 | Description           |
| ----------- | ------------ | --------------------------- | --------------------- |
| id          | VARCHAR(36)  | PRIMARY KEY                 | UUID                  |
| userId      | VARCHAR(36)  | UNIQUE, FK(users), NOT NULL | ID của user           |
| studentId   | VARCHAR(50)  | UNIQUE, NULL                | Mã sinh viên          |
| phoneNumber | VARCHAR(20)  | NULL                        | Số điện thoại         |
| address     | TEXT         | NULL                        | Địa chỉ               |
| joinDate    | DATETIME     | NOT NULL, DEFAULT NOW       | Ngày gia nhập         |
| status      | ENUM         | NOT NULL, DEFAULT ACTIVE    | Trạng thái thành viên |
| bio         | TEXT         | NULL                        | Giới thiệu bản thân   |
| position    | VARCHAR(100) | NULL                        | Vị trí/chức vụ        |
| createdAt   | DATETIME     | NOT NULL, DEFAULT NOW       | Ngày tạo              |
| updatedAt   | DATETIME     | NOT NULL, AUTO UPDATE       | Ngày cập nhật         |

**Enums:**

- MemberStatus: `ACTIVE`, `INACTIVE`, `ALUMNI`

**Indexes:**

- PRIMARY KEY (id)
- UNIQUE (userId)
- UNIQUE (studentId)

**Relations:**

- N:1 with User (CASCADE DELETE)

---

### 3. categories

Bảng lưu trữ danh mục bài viết.

| Column      | Type         | Constraints           | Description       |
| ----------- | ------------ | --------------------- | ----------------- |
| id          | VARCHAR(36)  | PRIMARY KEY           | UUID              |
| name        | VARCHAR(100) | UNIQUE, NOT NULL      | Tên danh mục      |
| slug        | VARCHAR(100) | UNIQUE, NOT NULL      | Slug URL-friendly |
| description | TEXT         | NULL                  | Mô tả danh mục    |
| createdAt   | DATETIME     | NOT NULL, DEFAULT NOW | Ngày tạo          |
| updatedAt   | DATETIME     | NOT NULL, AUTO UPDATE | Ngày cập nhật     |

**Indexes:**

- PRIMARY KEY (id)
- UNIQUE (name)
- UNIQUE (slug)

**Relations:**

- 1:N with Post

---

### 4. posts

Bảng lưu trữ bài viết và thông báo.

| Column     | Type         | Constraints              | Description         |
| ---------- | ------------ | ------------------------ | ------------------- |
| id         | VARCHAR(36)  | PRIMARY KEY              | UUID                |
| title      | VARCHAR(255) | NOT NULL                 | Tiêu đề bài viết    |
| slug       | VARCHAR(255) | UNIQUE, NOT NULL         | Slug URL-friendly   |
| content    | TEXT         | NOT NULL                 | Nội dung bài viết   |
| excerpt    | TEXT         | NULL                     | Tóm tắt ngắn        |
| thumbnail  | TEXT         | NULL                     | URL ảnh thumbnail   |
| status     | ENUM         | NOT NULL, DEFAULT DRAFT  | Trạng thái bài viết |
| authorId   | VARCHAR(36)  | FK(users), NOT NULL      | ID tác giả          |
| categoryId | VARCHAR(36)  | FK(categories), NOT NULL | ID danh mục         |
| viewCount  | INT          | NOT NULL, DEFAULT 0      | Số lượt xem         |
| isPinned   | BOOLEAN      | NOT NULL, DEFAULT FALSE  | Ghim bài viết       |
| publishAt  | DATETIME     | NULL                     | Ngày xuất bản       |
| createdAt  | DATETIME     | NOT NULL, DEFAULT NOW    | Ngày tạo            |
| updatedAt  | DATETIME     | NOT NULL, AUTO UPDATE    | Ngày cập nhật       |

**Enums:**

- PostStatus: `DRAFT`, `PENDING`, `PUBLISHED`, `ARCHIVED`

**Indexes:**

- PRIMARY KEY (id)
- UNIQUE (slug)
- INDEX (authorId)
- INDEX (categoryId)
- INDEX (status)

**Relations:**

- N:1 with User (author)
- N:1 with Category
- 1:N with Image

---

### 5. images

Bảng lưu trữ thông tin hình ảnh (cho bài viết và hoạt động).

| Column      | Type         | Constraints                | Description                |
| ----------- | ------------ | -------------------------- | -------------------------- |
| id          | VARCHAR(36)  | PRIMARY KEY                | UUID                       |
| url         | TEXT         | NOT NULL                   | URL hình ảnh từ Cloudinary |
| publicId    | VARCHAR(255) | NOT NULL                   | Public ID trên Cloudinary  |
| postId      | VARCHAR(36)  | FK(posts), NULL            | ID bài viết (nếu có)       |
| activityId  | VARCHAR(36)  | FK(sport_activities), NULL | ID hoạt động (nếu có)      |
| description | TEXT         | NULL                       | Mô tả hình ảnh             |
| createdAt   | DATETIME     | NOT NULL, DEFAULT NOW      | Ngày tạo                   |
| updatedAt   | DATETIME     | NOT NULL, AUTO UPDATE      | Ngày cập nhật              |

**Indexes:**

- PRIMARY KEY (id)
- INDEX (postId)
- INDEX (activityId)

**Relations:**

- N:1 with Post (CASCADE DELETE)
- N:1 with SportActivity (CASCADE DELETE)

---

### 6. sport_activities

Bảng lưu trữ thông tin các hoạt động thể thao.

| Column      | Type         | Constraints           | Description       |
| ----------- | ------------ | --------------------- | ----------------- |
| id          | VARCHAR(36)  | PRIMARY KEY           | UUID              |
| name        | VARCHAR(255) | NOT NULL              | Tên hoạt động     |
| description | TEXT         | NULL                  | Mô tả hoạt động   |
| location    | VARCHAR(255) | NULL                  | Địa điểm tổ chức  |
| startDate   | DATETIME     | NOT NULL              | Ngày bắt đầu      |
| endDate     | DATETIME     | NULL                  | Ngày kết thúc     |
| organizer   | VARCHAR(100) | NULL                  | Tên ban tổ chức   |
| organizerId | VARCHAR(36)  | FK(users), NOT NULL   | ID người tổ chức  |
| thumbnail   | TEXT         | NULL                  | URL ảnh thumbnail |
| createdAt   | DATETIME     | NOT NULL, DEFAULT NOW | Ngày tạo          |
| updatedAt   | DATETIME     | NOT NULL, AUTO UPDATE | Ngày cập nhật     |

**Indexes:**

- PRIMARY KEY (id)
- INDEX (organizerId)

**Relations:**

- N:1 with User (organizer)
- 1:N with Image

---

## Business Rules

### User & Authentication

1. Email phải unique trong hệ thống
2. Email được tự động normalize thành chữ thường (lowercase) và trim khoảng trắng
3. Password được hash bằng bcrypt với 10 rounds trước khi lưu
4. Password phải đáp ứng yêu cầu:
   - Tối thiểu 8 ký tự
   - Có ít nhất 1 chữ hoa (A-Z)
   - Có ít nhất 1 chữ thường (a-z)
   - Có ít nhất 1 số (0-9)
   - Có ít nhất 1 ký tự đặc biệt (@$!%\*?&)
5. Role mặc định khi đăng ký là MEMBER (không phải GUEST nữa)
6. Role không thể được set qua API registration để ngăn chặn privilege escalation
7. JWT token có thời gian hết hạn 7 ngày
8. Tất cả input được sanitize để ngăn chặn XSS attacks

### Member Management

1. Một User chỉ có thể có một Member profile
2. studentId phải unique nếu được cung cấp
3. Khi xóa User, Member profile sẽ tự động bị xóa (CASCADE)
4. Trạng thái mặc định là ACTIVE
5. **Public endpoints chỉ hiển thị members có status=ACTIVE**
6. studentId tối đa 50 ký tự, major tối đa 200 ký tự, class tối đa 100 ký tự

### Post/Announcement

1. Slug phải unique
2. Bài viết mới có status mặc định là DRAFT
3. Chỉ ADMIN và MODERATOR mới có quyền tạo/sửa/xóa bài viết
4. Bài viết PUBLISHED sẽ có publishAt timestamp
5. viewCount tự động tăng khi có người xem
6. Bài viết ghim (isPinned) sẽ hiển thị ưu tiên
7. **Public endpoints chỉ hiển thị bài viết có status=PUBLISHED**
8. Title tối đa 500 ký tự, slug tối đa 200 ký tự
9. Tất cả HTML input được sanitize để ngăn chặn XSS
10. Upload file được rate limit 10 uploads/15 phút

### Sport Activity

1. startDate là bắt buộc, endDate là tùy chọn
2. **endDate phải sau startDate nếu được cung cấp (business logic validation)**
3. Chỉ ADMIN và MODERATOR mới có quyền tạo/sửa/xóa hoạt động
4. organizerId là user đang đăng nhập khi tạo activity
5. Name tối đa 500 ký tự, location tối đa 500 ký tự
6. Upload file được rate limit 10 uploads/15 phút

### Image Management

1. Hình ảnh được lưu trữ trên Cloudinary
2. Mỗi image có thể thuộc về một Post HOẶC một SportActivity
3. Khi xóa Post/Activity, các Image liên quan cũng bị xóa (CASCADE)
4. publicId dùng để xóa image trên Cloudinary khi cần

---

## Security & Validation

### Rate Limiting

- **General API**: 100 requests/15 minutes per IP
- **Authentication**: 5 requests/15 minutes per IP
- **File Uploads**: 10 uploads/15 minutes per IP

### Input Validation

- All UUIDs validated before database queries
- String length limits enforced at application level
- Pagination parameters validated (min: 1, max: 100 for limit)
- Email format validated and normalized
- Password strength enforced (8+ chars, mixed case, numbers, special chars)
- Date validation (endDate > startDate)

### XSS Protection

- All user inputs sanitized using `sanitize-html` library
- HTML tags stripped from string inputs
- Special characters properly escaped

### SQL Injection Protection

- Prisma ORM uses parameterized queries automatically
- No raw SQL queries used in codebase

### Error Handling

- Prisma errors mapped to appropriate HTTP status codes:
  - P2002 (unique constraint) → 409 Conflict
  - P2003 (foreign key) → 400 Bad Request
  - P2025 (not found) → 404 Not Found
  - P2016 (query error) → 404 Not Found
- Sensitive error details hidden in production
- Development mode shows full error stack traces

---

### Get all published posts with author and category

```sql
SELECT p.*, u.firstName, u.lastName, c.name as categoryName
FROM posts p
JOIN users u ON p.authorId = u.id
JOIN categories c ON p.categoryId = c.id
WHERE p.status = 'PUBLISHED'
ORDER BY p.isPinned DESC, p.publishAt DESC;
```

### Get active members with user info

```sql
SELECT m.*, u.email, u.firstName, u.lastName, u.avatar
FROM members m
JOIN users u ON m.userId = u.id
WHERE m.status = 'ACTIVE'
ORDER BY m.joinDate DESC;
```

### Get upcoming sport activities

```sql
SELECT sa.*, u.firstName as organizerFirstName, u.lastName as organizerLastName
FROM sport_activities sa
JOIN users u ON sa.organizerId = u.id
WHERE sa.startDate > NOW()
ORDER BY sa.startDate ASC;
```
