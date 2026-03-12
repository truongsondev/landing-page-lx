# Hướng dẫn Setup và Chạy Project

## Yêu cầu hệ thống

- Node.js >= 18.x
- Docker & Docker Compose
- MySQL 8.0 (hoặc sử dụng Docker)

## Cài đặt

### 1. Clone repository và cài đặt dependencies

```bash
# Cài đặt dependencies
npm install
```

### 2. Cấu hình Environment Variables

Copy file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

Nội dung file `.env`:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/luuxa_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=3000
NODE_ENV="development"
```

### 3. Khởi chạy Database với Docker

```bash
# Chạy MySQL container
docker-compose up -d mysql

# Kiểm tra container đã chạy
docker ps
```

### 4. Chạy Prisma Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Chạy migrations
npm run prisma:migrate
```

### 5. Chạy ứng dụng

#### Development mode:

```bash
npm run dev
```

#### Production mode:

```bash
# Build TypeScript
npm run build

# Start server
npm start
```

## Chạy với Docker Compose (Full Stack)

```bash
# Chạy tất cả services (MySQL + Backend)
docker-compose up -d

# Xem logs
docker-compose logs -f backend

# Dừng services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

## Database Management

### Prisma Studio

Mở Prisma Studio để quản lý database qua GUI:

```bash
npm run prisma:studio
```

Truy cập: http://localhost:5555

### Reset Database

```bash
# Reset database và chạy lại migrations
npx prisma migrate reset
```

## Testing API

### 1. Health Check

```bash
curl http://localhost:3000/health
```

### 2. Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@luuxa.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@luuxa.com",
    "password": "admin123"
  }'
```

Lưu token từ response để sử dụng cho các API khác.

### 4. Get All Posts (Public)

```bash
curl http://localhost:3000/api/posts
```

### 5. Create Post (Authenticated)

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Thông báo quan trọng",
    "slug": "thong-bao-quan-trong",
    "content": "Nội dung thông báo...",
    "categoryId": "CATEGORY_ID_HERE",
    "status": "PUBLISHED"
  }'
```

## Project Structure

```
src/
├── domain/                 # Domain Layer (Entities & Interfaces)
│   ├── entities/          # Business entities
│   ├── repositories/      # Repository interfaces
│   └── services/          # Service interfaces
├── application/           # Application Layer (Use Cases)
│   └── use-cases/        # Business logic
├── infrastructure/        # Infrastructure Layer
│   ├── database/         # Prisma client
│   ├── repositories/     # Repository implementations
│   ├── services/         # Service implementations
│   └── middlewares/      # Express middlewares
├── presentation/          # Presentation Layer (API)
│   ├── routes/           # API routes
│   └── app.ts            # Express app configuration
└── server.ts             # Server entry point
```

## Troubleshooting

### Lỗi kết nối Database

```bash
# Kiểm tra MySQL container
docker ps

# Kiểm tra logs
docker logs luuxa_mysql

# Restart MySQL container
docker-compose restart mysql
```

### Lỗi Prisma Client

```bash
# Regenerate Prisma Client
npm run prisma:generate
```

### Port đã được sử dụng

```bash
# Thay đổi PORT trong file .env
PORT=3001

# Hoặc kill process đang sử dụng port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

## Môi trường Production

### Build Docker Image

```bash
docker build -t luuxa-backend .
```

### Chạy với Docker

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-production-db-url" \
  -e JWT_SECRET="your-production-secret" \
  luuxa-backend
```

## Tài liệu tham khảo

- [API Documentation](./API_DOCUMENTATION.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
