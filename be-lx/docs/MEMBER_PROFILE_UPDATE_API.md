# Member Profile Update API

## 1. Phan tich context

Yeu cau can 1 API cap nhat thong tin member, du lieu nam tren 2 bang:

- Bang users: `firstName`, `lastName`, `avatar`
- Bang members: `saintName`, `dateOfBirth`, `phoneNumber`, `address`, `bio`

Tat ca field deu optional, cho phep cap nhat mot phan.

---

## 2. Endpoint

- Method: `PATCH`
- URL: `/api/members/me/profile`
- Authentication: Bat buoc JWT
- Authorization: User da dang nhap (member)
- Content-Type: `multipart/form-data` (khuyen nghi khi cap nhat avatar)

### Header

```http
Authorization: Bearer <access_token>
```

---

## 3. Request Body

Tat ca field optional:

Form-data fields:

- `firstName` (text)
- `lastName` (text)
- `avatar` (text URL, optional)
- `avatar` (file image, optional, uu tien neu gui file)
- `saintName` (text)
- `dateOfBirth` (ISO8601 text)
- `phoneNumber` (text)
- `address` (text)
- `bio` (text)

Neu gui file `avatar`, backend se upload len Cloudinary va cap nhat URL avatar moi.

### Validate

- `firstName`: max 100 ky tu
- `lastName`: max 100 ky tu
- `avatar`: URL hop le
- `avatar` file: chi nhan `image/jpeg`, `image/png`, `image/webp`, toi da 5MB
- `saintName`: max 200 ky tu
- `dateOfBirth`: ISO8601
- `phoneNumber`: max 50 ky tu
- `address`: max 500 ky tu
- `bio`: string

---

## 4. Business logic

1. Tim member profile theo `userId` trong token.
2. Neu khong co member profile, tra `404`.
3. Cap nhat bang `users` voi cac field: `firstName`, `lastName`, `avatar`.

- Neu co file avatar: upload Cloudinary -> luu URL moi.
- Neu avatar cu la Cloudinary URL: backend se cleanup anh cu (best-effort).

4. Cap nhat bang `members` voi cac field: `saintName`, `dateOfBirth`, `phoneNumber`, `address`, `bio`.
5. Tra ve member sau khi cap nhat.

---

## 5. Response

### 5.1 Thanh cong - `200 OK`

```json
{
  "id": "member-uuid",
  "userId": "user-uuid",
  "saintName": "Gioan",
  "dateOfBirth": "2000-01-01T00:00:00.000Z",
  "phoneNumber": "0901234567",
  "address": "Thu Duc, TP.HCM",
  "bio": "Thanh vien luu xa",
  "status": "ACTIVE",
  "joinDate": "2026-03-21T10:00:00.000Z",
  "createdAt": "2026-03-21T10:00:00.000Z",
  "updatedAt": "2026-03-21T10:05:00.000Z"
}
```

### 5.2 Loi thuong gap

- `400 Bad Request`: du lieu khong hop le
- `401 Unauthorized`: thieu/het han token
- `404 Not Found`: khong tim thay ho so member

---

## 6. Vi du curl

```bash
curl --request PATCH "http://localhost:3000/api/members/me/profile" \
  --header "Authorization: Bearer <access_token>" \
  --form "firstName=Nguyen" \
  --form "lastName=Van A" \
  --form "saintName=Gioan" \
  --form "phoneNumber=0901234567" \
  --form "address=Thu Duc" \
  --form "bio=Thanh vien luu xa" \
  --form "avatar=@/path/to/avatar.webp"
```

---

## 7. De xuat buoc tiep theo

1. Them transaction (Prisma transaction) de dam bao tinh nguyen tu khi cap nhat 2 bang `users` va `members`.
2. Bo sung integration test cho cac case:
   - cap nhat thanh cong
   - validate fail
   - member profile khong ton tai
   - unauthorized
3. Neu can, mo rong API ho tro upload avatar qua Cloudinary thay vi URL thu cong.
