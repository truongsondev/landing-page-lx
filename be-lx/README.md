# README - Lưu Xá Backend API

Backend API cho website giới thiệu Lưu Xá, xây dựng với Node.js, TypeScript, Prisma, và MySQL.

## 📋 Tính năng

- ✅ Authentication & Authorization (JWT)
- ✅ Quản lý người dùng với phân quyền (ADMIN, MODERATOR, MEMBER, GUEST)
- ✅ Quản lý thành viên Lưu Xá
- ✅ Quản lý bài viết/thông báo với categories
- ✅ Quản lý hoạt động thể thao
- ✅ Upload hình ảnh lên Cloudinary
- ✅ RESTful API
- ✅ Clean Architecture
- ✅ Docker support

## 🛠️ Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** MySQL 8.0
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer + Cloudinary
- **Containerization:** Docker & Docker Compose

## 📁 Project Structure

```
src/
├── domain/                 # Domain Layer
│   ├── entities/          # Business entities
│   ├── repositories/      # Repository interfaces
│   └── services/          # Service interfaces
├── application/           # Application Layer
│   └── use-cases/        # Business logic use cases
├── infrastructure/        # Infrastructure Layer
│   ├── database/         # Prisma client
│   ├── repositories/     # Repository implementations
│   ├── services/         # External service implementations
│   └── middlewares/      # Express middlewares
├── presentation/          # Presentation Layer
│   ├── routes/           # API routes
│   └── app.ts            # Express app
└── server.ts             # Entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.x
- Docker & Docker Compose
- npm hoặc yarn

### Installation

1. Clone repository:

```bash
git clone <repository-url>
cd lx
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment variables:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong file `.env`:

```env
DATABASE_URL="mysql://root:password@localhost:3306/luuxa_db"
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. Start MySQL with Docker:

```bash
docker-compose up -d mysql
```

5. Run Prisma migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

6. Start development server:

```bash
npm run dev
```

Server sẽ chạy tại: http://localhost:3000

## 🐳 Docker Deployment

Chạy toàn bộ stack (MySQL + Backend):

```bash
docker-compose up -d
```

Kiểm tra logs:

```bash
docker-compose logs -f backend
```

Dừng services:

```bash
docker-compose down
```

## 📚 API Documentation

Chi tiết API documentation: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

### Base URL

```
http://localhost:3000/api
```

### Main Endpoints

#### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập

#### Posts/Announcements

- `GET /api/posts` - Lấy danh sách bài viết
- `GET /api/posts/:id` - Lấy chi tiết bài viết
- `POST /api/posts` - Tạo bài viết mới (ADMIN/MODERATOR)
- `PUT /api/posts/:id` - Cập nhật bài viết (ADMIN/MODERATOR)
- `DELETE /api/posts/:id` - Xóa bài viết (ADMIN/MODERATOR)

#### Members

- `GET /api/members` - Lấy danh sách thành viên
- `GET /api/members/:id` - Lấy chi tiết thành viên
- `POST /api/members` - Tạo thành viên mới (ADMIN)
- `PUT /api/members/:id` - Cập nhật thành viên (ADMIN)

#### Sport Activities

- `GET /api/activities` - Lấy danh sách hoạt động
- `GET /api/activities/:id` - Lấy chi tiết hoạt động
- `POST /api/activities` - Tạo hoạt động mới (ADMIN/MODERATOR)
- `PUT /api/activities/:id` - Cập nhật hoạt động (ADMIN/MODERATOR)

## 🗄️ Database Schema

Chi tiết database schema: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)

### Main Tables

- `users` - Thông tin người dùng và authentication
- `members` - Thông tin chi tiết thành viên
- `categories` - Danh mục bài viết
- `posts` - Bài viết và thông báo
- `sport_activities` - Hoạt động thể thao
- `images` - Hình ảnh (từ Cloudinary)

## 🔐 Authentication & Authorization

Hệ thống sử dụng JWT tokens để authentication. Các protected routes yêu cầu header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **ADMIN**: Toàn quyền quản lý hệ thống
- **MODERATOR**: Quản lý bài viết và hoạt động
- **MEMBER**: Thành viên Lưu Xá
- **GUEST**: Khách truy cập

## 🧪 Testing

### Health Check

```bash
curl http://localhost:3000/health
```

### Register & Login

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build TypeScript
npm start                # Start production server

# Prisma
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

## 📖 Documentation

- [Setup Guide](docs/SETUP_GUIDE.md) - Hướng dẫn cài đặt chi tiết
- [API Documentation](docs/API_DOCUMENTATION.md) - Tài liệu API đầy đủ
- [Database Schema](docs/DATABASE_SCHEMA.md) - Cấu trúc database

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📧 Contact

Project Link: [https://github.com/yourusername/luu-xa-backend](https://github.com/yourusername/luu-xa-backend)
