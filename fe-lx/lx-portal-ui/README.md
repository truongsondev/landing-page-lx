# LX Portal UI

Frontend triển khai theo FRONTEND_SPECIFICATION.md.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Zustand
- Axios
- TanStack Query
- React Hook Form + Zod
- React Router

## Chạy dự án

1. `npm install`
2. Copy `.env.example` thành `.env`
3. Cập nhật `VITE_API_URL`
4. `npm run dev`

## Lưu ý

- Chỉ gọi API thật qua backend (`VITE_API_URL`), không dùng mock.
- Auth token lưu localStorage theo đặc tả.

## Chạy bằng Docker Compose

### Chế độ development

```bash
docker compose --profile dev up --build
```

- App chạy tại `http://localhost:5173`
- Hot reload trong Docker đã bật polling watcher để hoạt động ổn định trên Windows/macOS.
- Đảm bảo service `frontend` mount source code từ host vào container (ví dụ: `./:/app`) để thay đổi code được phản ánh ngay.
- Nên mount riêng `node_modules` trong container để tránh ghi đè bởi host:

```yaml
services:
	frontend:
		volumes:
			- ./:/app
			- /app/node_modules
```

### Chế độ production (build static + Nginx)

```bash
docker compose --profile prod up --build
```

- App chạy tại `http://localhost:8080`

### Thiết lập API URL

- Có thể truyền biến môi trường trước khi chạy compose:

```bash
VITE_API_URL=https://your-api.example.com/api docker compose --profile prod up --build
```
