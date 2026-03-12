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
