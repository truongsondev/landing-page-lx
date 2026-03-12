# Tài Liệu Mô Tả Giao Diện Frontend - Website Lưu Xá

## Tổng Quan

Website Lưu Xá là nền tảng quản lý và giới thiệu thông tin về ký túc xá dành cho sinh viên, bao gồm quản lý thành viên, đăng bài viết/thông báo, và tổ chức các hoạt động thể thao.

## Công Nghệ Đề Xuất

### Framework & Libraries

- **Framework**: Next.js 14+ (App Router) hoặc React 18+ với Vite
- **Styling**: Tailwind CSS + shadcn/ui hoặc Material-UI
- **State Management**: Zustand hoặc Redux Toolkit
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios hoặc TanStack Query
- **Rich Text Editor**: TipTap hoặc Quill
- **Date Handling**: date-fns hoặc Day.js
- **Image Upload**: React Dropzone
- **Toast Notifications**: React Hot Toast hoặc Sonner

### Authentication

- JWT Token stored in localStorage/httpOnly cookies
- Axios interceptors for automatic token refresh
- Protected routes with role-based access control

---

## Cấu Trúc Trang (Pages Structure)

### 1. Public Pages (Không cần đăng nhập)

#### 1.1. Trang Chủ (/)

**Mục đích**: Giới thiệu tổng quan về Lưu Xá, hiển thị thông tin nổi bật

**Components**:

- **Header/Navbar**
  - Logo Lưu Xá
  - Menu: Trang chủ | Thông báo | Thành viên | Hoạt động | Đăng nhập
  - Responsive hamburger menu trên mobile
- **Hero Section**
  - Banner image/slider
  - Tiêu đề chính và slogan
  - CTA button: "Xem thêm" hoặc "Tham gia ngay"
- **Featured Posts Section**
  - 3-6 bài viết được ghim (isPinned=true)
  - Grid layout với thumbnail, title, excerpt, ngày đăng
  - Badge "Ghim" để phân biệt
- **Upcoming Activities Section**
  - Danh sách 3-4 hoạt động sắp diễn ra
  - Card hiển thị: thumbnail, tên, địa điểm, thời gian
  - Link "Xem tất cả hoạt động"
- **Statistics Section** (Optional)
  - Số lượng thành viên
  - Số bài viết
  - Số hoạt động đã tổ chức
- **Footer**
  - Thông tin liên hệ
  - Social media links
  - Copyright info

**API Calls**:

- `GET /api/posts?status=PUBLISHED&isPinned=true&limit=6`
- `GET /api/activities?page=1&limit=4` (filter upcoming trong frontend)

---

#### 1.2. Trang Thông Báo/Bài Viết (/posts)

**Mục đích**: Hiển thị danh sách tất cả bài viết đã xuất bản

**Components**:

- **Posts List**
  - Grid/List layout (có toggle để chuyển đổi)
  - Mỗi card hiển thị:
    - Thumbnail (fallback image nếu không có)
    - Title (max 2 lines, ellipsis)
    - Excerpt (max 3 lines, ellipsis)
    - Category badge
    - Author name và avatar
    - Published date
    - View count
  - Badge "Ghim" cho bài viết ghim
- **Filters & Search**
  - Search bar (search by title)
  - Filter by category (dropdown)
  - Filter by author (dropdown, optional)
  - Sort by: Mới nhất | Xem nhiều nhất | Ghim
- **Pagination**
  - Page numbers với prev/next buttons
  - Hiển thị "Showing X-Y of Z posts"
  - Items per page: 12 posts

**API Calls**:

- `GET /api/posts?page={page}&limit=12&categoryId={categoryId}&authorId={authorId}`

**State Management**:

```javascript
{
  posts: [],
  loading: false,
  error: null,
  filters: {
    search: '',
    categoryId: null,
    authorId: null,
    sortBy: 'newest'
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  }
}
```

---

#### 1.3. Trang Chi Tiết Bài Viết (/posts/:slug)

**Mục đích**: Hiển thị nội dung đầy đủ của bài viết

**Components**:

- **Post Header**
  - Category badge
  - Title (h1)
  - Author info (avatar, name, published date)
  - View count
  - Share buttons (Facebook, Twitter, Copy link)
- **Post Content**
  - Thumbnail image (full width)
  - Rich text content với formatting
  - Embedded images
  - Code blocks với syntax highlighting (nếu có)
- **Post Actions**
  - Back button
  - Print button
- **Related Posts Sidebar**
  - 3-4 bài viết cùng category
  - Thumbnail nhỏ + title
- **Breadcrumb**
  - Trang chủ > Thông báo > Category > Title

**API Calls**:

- `GET /api/posts/slug/:slug`
- `GET /api/posts?categoryId={categoryId}&limit=4` (for related posts)

**Features**:

- Auto increment view count khi load trang
- Meta tags cho SEO (Open Graph, Twitter Card)
- Responsive images

---

#### 1.4. Trang Thành Viên (/members)

**Mục đích**: Hiển thị danh sách thành viên của Lưu Xá

**Components**:

- **Members Grid**
  - Card layout (3-4 columns trên desktop)
  - Mỗi card hiển thị:
    - Avatar (fallback nếu không có)
    - Họ tên
    - Position/Chức vụ
    - Student ID (optional)
    - Bio (max 2 lines, ellipsis)
    - "Xem chi tiết" button
  - Chỉ hiển thị members với status=ACTIVE
- **Filters**
  - Search by name
  - Filter by position/chức vụ
  - Sort by: Tên A-Z | Mới gia nhập
- **Pagination**
  - Grid pagination
  - Items per page: 12 members

**API Calls**:

- `GET /api/members?page={page}&limit=12`

---

#### 1.5. Trang Chi Tiết Thành Viên (/members/:id)

**Mục đích**: Hiển thị thông tin chi tiết của thành viên

**Components**:

- **Member Profile**
  - Large avatar
  - Họ tên (h1)
  - Position/Chức vụ badge
  - Student ID
  - Join date
  - Contact info (nếu public)
- **Biography Section**
  - Full bio text
  - Formatted với paragraphs
- **Activities Participated** (Optional, nếu có data)
  - List các hoạt động mà member này tổ chức
- **Back to Members** button

**API Calls**:

- `GET /api/members/:id`
- `GET /api/activities?organizerId={userId}` (optional)

---

#### 1.6. Trang Hoạt Động Thể Thao (/activities)

**Mục đích**: Hiển thị các hoạt động thể thao đã và sắp diễn ra

**Components**:

- **Activities List**
  - Card layout với timeline view
  - Mỗi card hiển thị:
    - Thumbnail
    - Activity name
    - Location với icon
    - Start date - End date
    - Organizer name
    - Status badge (Sắp diễn ra | Đang diễn ra | Đã kết thúc)
    - "Xem chi tiết" button
- **Filters & Tabs**
  - Tabs: Tất cả | Sắp diễn ra | Đã diễn ra
  - Filter by date range
  - Search by name
- **Pagination**
  - Standard pagination
  - Items per page: 9 activities

**API Calls**:

- `GET /api/activities?page={page}&limit=9`

**Frontend Logic**:

- Tính toán status dựa trên startDate và endDate
- Sort theo startDate (mới nhất trên đầu)

---

#### 1.7. Trang Chi Tiết Hoạt Động (/activities/:id)

**Mục đích**: Hiển thị thông tin chi tiết về hoạt động

**Components**:

- **Activity Header**
  - Thumbnail image (full width)
  - Activity name (h1)
  - Status badge
  - Date and time với icon
  - Location với map icon
  - Organizer info (avatar + name)
- **Activity Details**
  - Full description
  - Image gallery (nếu có nhiều images)
  - Event schedule/agenda (nếu có trong description)
- **Organizer Info Card**
  - Organizer name
  - Contact button (nếu có)
- **Share & Actions**
  - Share buttons
  - Add to calendar button (optional)
  - Back button

**API Calls**:

- `GET /api/activities/:id`

---

#### 1.8. Trang Đăng Nhập (/login)

**Mục đích**: Form đăng nhập cho users

**Components**:

- **Login Form**
  - Email input (type="email", required)
  - Password input (type="password", required, show/hide toggle)
  - "Ghi nhớ đăng nhập" checkbox
  - "Đăng nhập" button (primary, full width)
  - Loading state khi đang submit
- **Form Validation**
  - Email format validation
  - Required field validation
  - Error messages hiển thị dưới mỗi field
- **Error Handling**
  - Toast notification cho errors
  - Rate limiting message (khi hit 5 attempts)
  - Network error handling
- **Alternative Actions**
  - "Chưa có tài khoản? Đăng ký ngay" link
  - "Quay về trang chủ" link

**API Call**:

- `POST /api/auth/login`

**Form State**:

```javascript
{
  email: '',
  password: '',
  rememberMe: false,
  loading: false,
  errors: {}
}
```

**Success Flow**:

1. Save JWT token to localStorage/cookies
2. Save user info to state/context
3. Redirect to dashboard or return URL
4. Show success toast

**Error Handling**:

- 401: "Email hoặc mật khẩu không đúng"
- 429: "Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút"
- Network error: "Không thể kết nối đến server"

---

#### 1.9. Trang Đăng Ký (/register)

**Mục đích**: Form đăng ký tài khoản mới

**Components**:

- **Registration Form**
  - Email input (validation real-time)
  - Password input (strength indicator)
  - Confirm password input
  - First name input
  - Last name input
  - Terms & conditions checkbox
  - "Đăng ký" button
- **Password Strength Indicator**
  - Visual bar (red → yellow → green)
  - Requirements checklist:
    - ✓ Tối thiểu 8 ký tự
    - ✓ Có chữ hoa (A-Z)
    - ✓ Có chữ thường (a-z)
    - ✓ Có số (0-9)
    - ✓ Có ký tự đặc biệt (@$!%\*?&)
- **Form Validation**
  - Real-time validation
  - Email format và uniqueness check
  - Password match validation
  - All required fields

**API Call**:

- `POST /api/auth/register`

**Success Flow**:

1. Show success message
2. Auto login với token nhận được
3. Redirect to member onboarding hoặc homepage
4. Welcome toast

**Error Handling**:

- 409: "Email đã được sử dụng"
- 400: Display field-specific validation errors
- 429: Rate limit message

---

### 2. Protected Pages (Cần đăng nhập)

#### 2.1. Dashboard (/dashboard)

**Mục đích**: Trang tổng quan sau khi đăng nhập

**Components** (Role-specific):

**For ADMIN/MODERATOR**:

- **Statistics Cards**
  - Total posts (by status)
  - Total members
  - Total activities
  - Recent views
- **Quick Actions**
  - Tạo bài viết mới
  - Tạo hoạt động mới
  - Quản lý thành viên (ADMIN only)
- **Recent Activities Table**
  - Latest posts (draft, pending)
  - Latest members joined
  - Upcoming activities
- **Charts** (Optional)
  - Post views over time
  - Member growth
  - Activity participation

**For MEMBER**:

- **Welcome Section**
  - Greeting message
  - Member profile summary
- **Latest News**
  - Recent published posts
- **Upcoming Events**
  - Next 3 activities
- **My Profile Card**
  - Link to view/edit profile

**API Calls**:

- `GET /api/posts?limit=5&status=DRAFT` (ADMIN/MOD)
- `GET /api/members?limit=5` (ADMIN)
- `GET /api/activities?limit=3`

---

#### 2.2. Quản Lý Bài Viết (/dashboard/posts)

**Role**: ADMIN, MODERATOR

**Components**:

- **Posts Table**
  - Columns:
    - Checkbox (bulk select)
    - Thumbnail (small)
    - Title (clickable to edit)
    - Category
    - Author
    - Status (badge với màu)
    - Views
    - Published date
    - Actions dropdown
- **Table Filters**
  - Search by title
  - Filter by status (All | Draft | Pending | Published | Archived)
  - Filter by category
  - Filter by author
  - Date range picker
- **Table Actions**
  - Sort by columns
  - Pagination (10, 25, 50 items)
  - Bulk actions: Delete, Change status
- **Action Buttons**
  - "Tạo bài viết mới" button (primary, top-right)
  - "Xuất Excel" button (optional)
- **Row Actions Menu**
  - Xem chi tiết
  - Sửa
  - Xuất bản (nếu draft)
  - Hủy xuất bản (nếu published)
  - Xóa (với confirmation modal)

**API Calls**:

- `GET /api/posts?page={page}&limit={limit}&status={status}&categoryId={categoryId}`
- `PATCH /api/posts/:id/publish`
- `PATCH /api/posts/:id/unpublish`
- `DELETE /api/posts/:id`

**State Management**:

```javascript
{
  posts: [],
  loading: false,
  filters: {
    search: '',
    status: 'all',
    categoryId: null,
    authorId: null,
    dateRange: null
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0
  },
  selectedPosts: []
}
```

---

#### 2.3. Tạo/Sửa Bài Viết (/dashboard/posts/create, /dashboard/posts/:id/edit)

**Role**: ADMIN, MODERATOR

**Components**:

- **Post Form** (2 columns layout)

  **Main Column (70%)**:
  - Title input (required, max 500 chars)
  - Slug input (auto-generated từ title, editable)
  - Rich Text Editor (TipTap/Quill)
    - Toolbar: Bold, Italic, Underline, Heading, List, Link, Image
    - Image upload inline
    - Full screen mode
    - Preview mode
  - Content (required)

  **Sidebar (30%)**:
  - **Publish Settings**
    - Status dropdown (Draft | Pending | Published | Archived)
    - Publish date picker
    - Is Pinned checkbox
    - Save draft button
    - Publish button
  - **Category**
    - Category dropdown (required)
    - "Tạo category mới" link
  - **Featured Image**
    - Image upload dropzone
    - Current image preview
    - Remove image button
    - Max 10MB warning
  - **Excerpt**
    - Textarea (optional, max 500 chars)
    - Auto-generate từ content button
  - **SEO Preview** (Optional)
    - Preview how post appears in search results

**Form Validation**:

- Required fields: title, slug, content, category
- Slug format: lowercase, hyphens only
- Image file type: jpg, png, gif, webp
- Image size: max 10MB
- Duplicate slug check

**API Calls**:

- `POST /api/posts` (create)
- `PUT /api/posts/:id` (update)
- `GET /api/posts/:id` (load for edit)
- Image upload to Cloudinary

**Success Flow**:

- Show success toast
- Redirect to posts list or stay on page
- Option "Xem bài viết" hoặc "Tạo bài mới"

**Auto-save** (Optional):

- Auto-save to localStorage every 30 seconds
- Restore draft on page reload

---

#### 2.4. Quản Lý Thành Viên (/dashboard/members)

**Role**: ADMIN only

**Components**:

- **Members Table**
  - Columns:
    - Avatar
    - Họ tên
    - Email
    - Student ID
    - Position
    - Status (badge)
    - Join date
    - Actions
- **Table Filters**
  - Search by name or email
  - Filter by status (Active | Inactive | Alumni)
  - Filter by position
  - Sort options
- **Action Buttons**
  - "Thêm thành viên mới" button
  - "Xuất danh sách" button
- **Row Actions**
  - Xem chi tiết
  - Chỉnh sửa
  - Thay đổi status
  - Xóa (confirmation required)

**API Calls**:

- `GET /api/members?page={page}&limit={limit}&status={status}`
- `DELETE /api/members/:id`
- `PATCH /api/members/:id/status`

---

#### 2.5. Tạo/Sửa Thành Viên (/dashboard/members/create, /dashboard/members/:id/edit)

**Role**: ADMIN only

**Components**:

- **Member Form** (Tabs hoặc sections)

  **User Account Tab**:
  - User ID selector (dropdown existing users without member profile)
  - Or create new user checkbox
  - Email input (if creating new)
  - First name, Last name

  **Member Info Tab**:
  - Student ID input
  - Phone number input
  - Address textarea
  - Major input
  - Class input
  - Position/Chức vụ input
  - Join date picker
  - Status radio buttons (Active | Inactive | Alumni)

  **Biography Tab**:
  - Bio rich text editor
  - Or textarea với markdown support

  **Actions**:
  - "Lưu" button
  - "Lưu và tiếp tục" button
  - "Hủy" button

**Form Validation**:

- Required: userId
- Student ID format validation
- Phone number format
- Email format (if creating new user)

**API Calls**:

- `POST /api/members` (create)
- `PUT /api/members/:id` (update)
- `GET /api/members/:id` (load for edit)
- `GET /api/users` (get users without member profile)

---

#### 2.6. Quản Lý Hoạt Động (/dashboard/activities)

**Role**: ADMIN, MODERATOR

**Components**:

- **Activities Table/Calendar View**
  - Toggle between Table and Calendar view

  **Table View**:
  - Columns: Thumbnail, Name, Date, Location, Organizer, Actions
  - Status computed from dates

  **Calendar View** (Optional):
  - Month/Week view
  - Activities shown as events
  - Click to view/edit

- **Filters**
  - Date range
  - Status (Upcoming | Ongoing | Past)
  - Search by name
- **Action Buttons**
  - "Tạo hoạt động mới"
  - "Xuất lịch"
- **Row Actions**
  - Xem chi tiết
  - Sửa
  - Xóa

**API Calls**:

- `GET /api/activities?page={page}&limit={limit}`
- `DELETE /api/activities/:id`

---

#### 2.7. Tạo/Sửa Hoạt Động (/dashboard/activities/create, /dashboard/activities/:id/edit)

**Role**: ADMIN, MODERATOR

**Components**:

- **Activity Form**

  **Main Info**:
  - Activity name (required, max 500 chars)
  - Description (rich text editor)
  - Location input (with map picker optional)

  **Schedule**:
  - Start date & time picker (required)
  - End date & time picker (optional)
  - Validation: end must be after start

  **Media**:
  - Thumbnail upload (dropzone)
  - Additional images (multiple upload)
  - Image gallery manager

  **Organizer Info**:
  - Organizer name input (optional, defaults to logged-in user)
  - Auto-set organizerId from current user

  **Actions**:
  - "Lưu nháp" button
  - "Xuất bản" button
  - "Hủy" button

**Form Validation**:

- Required: name, startDate
- Date validation: endDate > startDate
- Image validation: type, size

**API Calls**:

- `POST /api/activities` (create)
- `PUT /api/activities/:id` (update)
- `GET /api/activities/:id` (load for edit)

---

#### 2.8. Profile Settings (/dashboard/profile)

**Role**: All logged-in users

**Components**:

- **Profile Tabs**

  **Account Info Tab**:
  - Avatar upload
  - First name, Last name
  - Email (read-only)
  - Role badge (read-only)
  - "Cập nhật" button

  **Change Password Tab**:
  - Current password input
  - New password input (with strength indicator)
  - Confirm new password input
  - "Đổi mật khẩu" button

  **Member Profile Tab** (if user has member profile):
  - Display member info
  - Link to edit member profile (ADMIN only)

  **Preferences Tab** (Optional):
  - Language selection
  - Email notifications toggle
  - Theme (Light/Dark)

**API Calls**:

- `GET /api/users/me` (get current user)
- `PUT /api/users/:id` (update profile)
- `POST /api/auth/change-password` (change password)

---

## UI/UX Guidelines

### Design System

#### Colors

- **Primary**: Blue (#3B82F6) - CTAs, links, active states
- **Secondary**: Gray (#6B7280) - Text, borders
- **Success**: Green (#10B981) - Success messages, published status
- **Warning**: Yellow (#F59E0B) - Pending status, warnings
- **Error**: Red (#EF4444) - Error messages, delete actions
- **Info**: Blue (#0EA5E9) - Info messages, draft status

#### Typography

- **Headings**:
  - H1: 2.5rem/40px (bold)
  - H2: 2rem/32px (bold)
  - H3: 1.5rem/24px (semibold)
  - H4: 1.25rem/20px (semibold)
- **Body**: 1rem/16px (regular)
- **Small**: 0.875rem/14px (regular)
- **Font**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto

#### Spacing

- Base unit: 4px
- Common spacing: 8px, 12px, 16px, 24px, 32px, 48px
- Container max-width: 1280px
- Content padding: 16px mobile, 24px tablet, 32px desktop

#### Components

- **Buttons**:
  - Height: 40px (default), 32px (small), 48px (large)
  - Border radius: 6px
  - Padding: 12px 24px
  - Hover: brightness 110%
  - Active: brightness 90%
- **Cards**:
  - Border radius: 8px
  - Shadow: 0 1px 3px rgba(0,0,0,0.1)
  - Hover: shadow 0 4px 6px rgba(0,0,0,0.1)
  - Padding: 16px
- **Inputs**:
  - Height: 40px
  - Border: 1px solid gray-300
  - Border radius: 6px
  - Focus: border-blue-500, ring-2 ring-blue-200
- **Badges**:
  - Padding: 4px 8px
  - Border radius: 4px
  - Font size: 12px
  - Font weight: 500

### Responsive Breakpoints

- **Mobile**: < 640px (1 column)
- **Tablet**: 640px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

### Loading States

- **Skeleton loaders** for content
- **Spinner** for buttons and small actions
- **Progress bar** for uploads
- **Shimmer effect** for cards/images

### Empty States

- Meaningful illustrations
- Helpful message
- Clear CTA to add content
- Example: "Chưa có bài viết nào. Tạo bài viết đầu tiên?"

### Error States

- Toast notifications for temporary errors
- Inline validation errors below fields
- Error pages (404, 500) với friendly message
- Retry button khi có network errors

### Success States

- Toast notifications
- Confirmation modals với checkmark icon
- Success messages với next action

---

## User Flows

### 1. Guest User Flow

```
Landing Page → Browse Posts → View Post Details
              → Browse Members → View Member Profile
              → Browse Activities → View Activity Details
              → Register → Login → Dashboard
```

### 2. Member Login Flow

```
Login → Dashboard → View Latest News
                 → View Upcoming Events
                 → Edit My Profile
                 → Browse All Posts/Activities
```

### 3. Admin/Moderator Content Management Flow

```
Login → Dashboard → Manage Posts → Create New Post
                                  → Edit Existing Post
                                  → Publish/Unpublish Post
                                  → Delete Post
                 → Manage Activities → Create Activity
                                     → Edit Activity
                                     → Delete Activity
                 → Manage Members (ADMIN only)
```

### 4. Content Creation Flow (Post)

```
Dashboard → Posts List → "Create New" Button
         → Post Editor → Fill Form
                      → Upload Images
                      → Save Draft / Publish
                      → Success → View Post / Back to List
```

---

## Integration với Backend API

### HTTP Client Setup

```javascript
// axios-instance.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    if (error.response?.status === 429) {
      // Show rate limit message
      toast.error("Quá nhiều requests. Vui lòng thử lại sau.");
    }
    return Promise.reject(error);
  },
);

export default api;
```

### API Service Layer

```javascript
// services/posts.service.js
import api from "./axios-instance";

export const postsService = {
  getAll: (params) => api.get("/posts", { params }),
  getById: (id) => api.get(`/posts/${id}`),
  getBySlug: (slug) => api.get(`/posts/slug/${slug}`),
  create: (formData) =>
    api.post("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    api.put(`/posts/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/posts/${id}`),
  publish: (id) => api.patch(`/posts/${id}/publish`),
  unpublish: (id) => api.patch(`/posts/${id}/unpublish`),
};

// services/auth.service.js
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => JSON.parse(localStorage.getItem("user") || "null"),
  isAuthenticated: () => !!localStorage.getItem("token"),
};

// Similar services for members, activities
```

### State Management (Zustand Example)

```javascript
// stores/authStore.js
import { create } from "zustand";
import { authService } from "../services/auth.service";

export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  token: localStorage.getItem("token"),
  isAuthenticated: authService.isAuthenticated(),

  login: async (credentials) => {
    const { data } = await authService.login(credentials);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },

  logout: () => {
    authService.logout();
    set({ user: null, token: null, isAuthenticated: false });
  },

  register: async (userData) => {
    const { data } = await authService.register(userData);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    set({ user: data.user, token: data.token, isAuthenticated: true });
  },
}));
```

### Protected Route Component

```javascript
// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Usage in routes
<Route
  path="/dashboard/posts"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
      <PostsManagement />
    </ProtectedRoute>
  }
/>;
```

---

## Performance Optimization

### 1. Image Optimization

- Lazy loading với `loading="lazy"` attribute
- Responsive images với `srcset`
- WebP format với fallback
- Thumbnail generation on upload
- CDN caching (Cloudinary)

### 2. Code Splitting

- Route-based code splitting
- Dynamic imports cho heavy components
- Lazy load rich text editor
- Separate vendor bundle

### 3. Caching Strategy

- Cache API responses với TanStack Query
- Stale-while-revalidate strategy
- Cache images trong browser
- Service Worker cho offline support (PWA optional)

### 4. Bundle Optimization

- Tree shaking
- Minification
- Compression (gzip/brotli)
- Remove unused CSS
- Optimize dependencies

---

## SEO Optimization

### Meta Tags

- Dynamic title và description per page
- Open Graph tags cho social sharing
- Twitter Card tags
- Canonical URLs
- JSON-LD structured data

### Sitemap & Robots

- Generate sitemap.xml
- robots.txt configuration
- Meta robots tags

### Performance

- Core Web Vitals optimization
- Lighthouse score > 90
- Fast initial load
- Smooth interactions

---

## Accessibility (A11y)

### Requirements

- WCAG 2.1 Level AA compliance
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus indicators
- Screen reader support
- Color contrast ratio > 4.5:1
- Skip to content link

### Testing

- axe DevTools
- Lighthouse accessibility audit
- Keyboard-only navigation test
- Screen reader testing (NVDA/JAWS)

---

## Testing Strategy

### Unit Tests

- Component tests (Jest + React Testing Library)
- Utility function tests
- Service layer tests
- Store/state management tests

### Integration Tests

- User flow tests
- Form submission tests
- API integration tests
- Authentication flows

### E2E Tests (Optional)

- Cypress hoặc Playwright
- Critical user journeys
- Cross-browser testing

---

## Deployment & DevOps

### Build Process

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

```
REACT_APP_API_URL=https://api.luuxa.com
REACT_APP_CLOUDINARY_CLOUD_NAME=your-cloud-name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your-preset
```

### Hosting Options

- **Vercel**: Recommended for Next.js
- **Netlify**: For static sites
- **AWS S3 + CloudFront**: Scalable option
- **Docker**: Self-hosted option

### CI/CD Pipeline

1. Code push to Git
2. Run tests
3. Build production bundle
4. Deploy to hosting
5. Run smoke tests
6. Notify team

---

## Future Enhancements

### Phase 2 Features

- [ ] Real-time notifications
- [ ] Comment system on posts
- [ ] Like/reaction system
- [ ] Advanced search with filters
- [ ] Member directory with search
- [ ] Activity registration system
- [ ] Photo gallery module
- [ ] Email newsletter subscription

### Phase 3 Features

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Chat/messaging system
- [ ] Event calendar sync (Google Calendar)
- [ ] Analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] PWA offline support

---

## Tài Liệu Tham Khảo

### Design Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Material-UI](https://mui.com/)
- [Headless UI](https://headlessui.com/)

### Development Resources

- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

### Best Practices

- [Web.dev Best Practices](https://web.dev/learn)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Document Version**: 1.0  
**Last Updated**: March 12, 2026  
**Author**: Development Team
