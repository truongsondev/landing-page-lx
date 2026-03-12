# Frontend BA Analysis & Task Execution

## 1) Phân tích FRONTEND_SPECIFICATION.md

### 1.1 Mục tiêu nghiệp vụ

- Cổng thông tin Lưu Xá gồm public site + dashboard quản trị.
- Nhóm chức năng chính: bài viết, thành viên, hoạt động thể thao, tài khoản.
- Phân quyền theo role: `ADMIN`, `MODERATOR`, `MEMBER`.

### 1.2 UI/UX Flow cốt lõi

- Guest: Trang chủ → Bài viết/Thành viên/Hoạt động → Chi tiết.
- Auth: Đăng nhập/Đăng ký → Dashboard.
- Admin/Mod: Dashboard → Quản lý Post/Activity (CRUD).
- Admin: Dashboard → Quản lý Member (CRUD).
- User: Dashboard → Profile settings.

### 1.3 API integration (real API only)

- Base URL: `VITE_API_URL`.
- HTTP client: Axios interceptor (Bearer token + xử lý `401`, `429`).
- Services:
  - `authService`: login/register/getMe/changePassword
  - `postsService`: list/detail/create/update/delete/publish/unpublish
  - `membersService`: list/detail/create/update/delete/status
  - `activitiesService`: list/detail/create/update/delete
  - `usersService`: list/update

### 1.4 State management

- Zustand: `auth.store.ts`
  - `user`, `token`, `isAuthenticated`, `loading`
  - `login`, `register`, `logout`, `hydrateMe`

### 1.5 Route architecture

- Public routes: `/`, `/posts`, `/posts/:slug`, `/members`, `/members/:id`, `/activities`, `/activities/:id`, `/login`, `/register`
- Protected routes:
  - `/dashboard` (all logged in)
  - `/dashboard/posts*`, `/dashboard/activities*` (ADMIN/MODERATOR)
  - `/dashboard/members*` (ADMIN)
  - `/dashboard/profile` (all logged in)

### 1.6 Clarification questions (mở)

1. Chuẩn response phân trang backend: `data/total/totalPages` có thống nhất mọi endpoint không?
2. Endpoint category/author list riêng có sẵn chưa?
3. Upload media dùng Cloudinary signed hay unsigned preset?
4. `POST /api/posts` và `PUT /api/posts/:id` nhận JSON hay multipart?
5. `/api/activities?organizerId=` có hỗ trợ filter trực tiếp không?

---

## 2) Task Breakdown và kết quả thực hiện

- [x] Tạo project tách biệt: `lx-portal-ui/`
- [x] Cấu hình môi trường React + TS + Vite + Tailwind
- [x] Tích hợp Zustand, Axios, TanStack Query, RHF, Zod
- [x] Thiết kế API layer + interceptor + service modules
- [x] Thiết kế route public/protected + role guard
- [x] Xây dựng public pages chính theo đặc tả
- [x] Xây dựng dashboard pages chính theo đặc tả
- [x] Xây dựng auth flow (login/register/logout/profile)
- [x] Không dùng mock data, chỉ gọi API thực

---

## 3) Mapping nhanh spec -> implementation

- Trang chủ: featured posts + upcoming activities ✅
- Posts list/detail ✅
- Members list/detail ✅
- Activities list/detail ✅
- Login/Register ✅
- Dashboard tổng quan ✅
- Dashboard quản lý Posts ✅
- Dashboard tạo/sửa Post ✅
- Dashboard quản lý Members ✅
- Dashboard tạo/sửa Member ✅
- Dashboard quản lý Activities ✅
- Dashboard tạo/sửa Activity ✅
- Dashboard profile settings ✅

---

## 4) Cách chạy

1. Vào thư mục `lx-portal-ui`
2. `npm install`
3. Copy `.env.example` -> `.env`
4. Cấu hình `VITE_API_URL`
5. `npm run dev`

> Ghi chú: dự án triển khai theo nguyên tắc “real API only”, không dùng mock.
