# Cloudinary Image Processing Implementation

## Scope da trien khai

He thong da ap dung flow xu ly anh cho 2 module dang upload thumbnail:

- Posts: `POST /api/posts`, `PUT /api/posts/:id`
- Sport Activities: `POST /api/activities`, `PUT /api/activities/:id`

## Diem chinh da cai dat

1. Upload validation

- Chi cho phep MIME: `image/jpeg`, `image/png`, `image/webp`
- Gioi han kich thuoc file: 5MB
- File khong hop le tra ve 400
- Vuot gioi han dung luong tra ve 413

2. Cloudinary upload

- Upload bang stream (`upload_stream`)
- `resource_type=image`, `overwrite=false`
- Nhan metadata tu cloudinary: `secure_url`, `public_id`, `resource_type`, `format`, `width`, `height`, `bytes`

3. Luu metadata vao DB

Metadata duoc luu vao bang `images`:

- `url`, `publicId`
- `resourceType`, `format`
- `width`, `height`, `bytes`
- lien ket theo `postId` hoac `activityId`

4. Rollback va cleanup

- Neu upload thanh cong nhung ghi DB that bai:
  - Xoa anh tren Cloudinary bang `public_id`
  - rollback aggregate vua tao (post/activity)
- Khi update thumbnail:
  - upload anh moi
  - update DB + metadata
  - xoa anh cu tren Cloudinary sau khi DB thanh cong
- Khi xoa post/activity:
  - xoa cac anh lien quan tren Cloudinary truoc
  - sau do xoa ban ghi chinh

5. Error mapping

- Loi cloudinary/map upload service: `502 Bad Gateway`
- Loi multer file size: `413 Payload Too Large`
- Loi validate upload input: `400 Bad Request`

## Luu y deploy

1. Can chay migration schema cho model `Image` (them metadata columns):

- `resourceType`
- `format`
- `width`
- `height`
- `bytes`

2. Chay lai Prisma generate sau migration:

- `npm run prisma:generate`

3. Dam bao bien moi truong Cloudinary da co:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Tai lieu FE

- Huong dan cho frontend: `docs/CLOUDINARY_FE_GUIDE.md`
