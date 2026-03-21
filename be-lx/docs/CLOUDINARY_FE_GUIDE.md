# Huong Dan FE Tich Hop Upload Anh (Cloudinary)

## 1. Muc tieu

Tai lieu nay huong dan team frontend tich hop upload anh voi backend hien tai.

Backend da xu ly:

- Upload anh len Cloudinary
- Luu metadata vao DB
- Rollback neu DB loi
- Xoa anh cu khi update
- Map loi upload theo status code ro rang
- Dung chung cho avatar member

## 2. Endpoint FE can dung

### 2.1 Upload thumbnail cho Post

- Tao moi: POST /api/posts
- Cap nhat: PUT /api/posts/:id
- Content-Type: multipart/form-data
- Field file: thumbnail

Role: ADMIN

### 2.2 Upload thumbnail cho Activity

- Tao moi: POST /api/activities
- Cap nhat: PUT /api/activities/:id
- Content-Type: multipart/form-data
- Field file: thumbnail

Role: ADMIN, MEMBER

### 2.3 Upload avatar Member

- Cap nhat profile: PATCH /api/members/me/profile
- Content-Type: multipart/form-data
- Field file: avatar

Role: User da dang nhap

## 3. Rule upload can validate tren FE

Validate truoc khi goi API de UX tot hon:

- MIME hop le: image/jpeg, image/png, image/webp
- Dung luong toi da: 5MB

Neu khong dat rule, chan upload ngay tren client.

## 4. Mau FormData cho FE

### 4.1 Tao Post kem thumbnail

Field bat buoc:

- title
- slug
- content
- categoryId
- location
- eventTime (ISO date)
- thumbnail (file)

### 4.2 Cap nhat Post

- Co the gui 1 hoac nhieu field
- Neu muon thay anh, gui them thumbnail moi

### 4.3 Tao Activity kem thumbnail

Field bat buoc:

- name
- startDate (ISO date)
- thumbnail (file, optional nhung nen ho tro)

Field tuy chon:

- endDate
- location
- description

### 4.4 Cap nhat profile member kem avatar

Field file:

- avatar (file)

Field text optional:

- firstName
- lastName
- saintName
- dateOfBirth
- phoneNumber
- address
- bio

## 5. Vi du React + Axios

```ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export async function createPostWithImage(params: {
  accessToken: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  location: string;
  eventTime: string;
  isPinned?: boolean;
  thumbnail?: File;
}) {
  const form = new FormData();
  form.append("title", params.title);
  form.append("slug", params.slug);
  form.append("content", params.content);
  form.append("categoryId", params.categoryId);
  form.append("location", params.location);
  form.append("eventTime", params.eventTime);
  if (typeof params.isPinned === "boolean") {
    form.append("isPinned", String(params.isPinned));
  }
  if (params.thumbnail) {
    form.append("thumbnail", params.thumbnail);
  }

  const res = await api.post("/api/posts", form, {
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
    },
    onUploadProgress: (event) => {
      if (!event.total) return;
      const percent = Math.round((event.loaded * 100) / event.total);
      console.log("upload progress", percent);
    },
  });

  return res.data;
}
```

### 5.1 Ham validate file tren FE

```ts
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) {
    return "Chi chap nhan JPEG, PNG hoac WEBP";
  }

  if (file.size > MAX_SIZE) {
    return "Anh vuot qua 5MB";
  }

  return null;
}
```

## 6. Xu ly loi tren FE

Map loi de hien thi thong bao dung:

- 400: file/du lieu khong hop le
- 401: chua dang nhap hoac token het han
- 403: khong du quyen
- 413: file qua lon
- 429: vuot rate limit
- 502: dich vu xu ly anh tam thoi loi (Cloudinary/upload service)

Goi y UX:

- 413: Hien thi "Anh qua lon, vui long chon anh <= 5MB"
- 502: Hien thi "He thong xu ly anh dang ban, vui long thu lai"
- 429: Hien thi countdown nho truoc khi thu lai

## 7. Hien thi anh toi uu tren FE

Backend tra ve URL an toan tu Cloudinary trong cac field:

- post.thumbnail
- activity.thumbnail

FE co the toi uu URL hien thi bang transformation query.

Vi du:

- Grid thumbnail: w_300,h_300,c_fill,q_auto,f_auto
- Detail image: w_1200,c_limit,q_auto,f_auto

Neu ban muon, co the viet helper tao transformed URL tu secure_url.

## 8. Luong cap nhat anh

Khi user update thumbnail:

1. FE gui file moi qua endpoint PUT
2. Backend upload anh moi
3. Backend cap nhat DB + metadata
4. Backend xoa anh cu tren Cloudinary

FE chi can upload file moi, khong can goi endpoint xoa anh rieng.

## 9. Checklist tich hop FE

- Validate MIME va size truoc upload
- Dung FormData, khong set Content-Type thu cong
- Gan Authorization Bearer token
- Hien thi progress upload
- Map status code sang thong bao UX
- Retry co kiem soat voi loi 502/429
- Hien thi placeholder neu thumbnail null

## 10. Tai lieu lien quan

- docs/CLOUDINARY_IMAGE_PROCESSING.md
- docs/API_DOCUMENTATION.md
- docs/FRONTEND_SPECIFICATION.md
