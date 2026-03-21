# Admin Member Moderation API

## 1. Phan tich context

Yeu cau nghiep vu can 3 API cho admin de duyet va khoa thanh vien theo state machine:

- Approve member: `PENDING -> ACTIVE`
- Block member: `ACTIVE -> INACTIVE`
- Reject member: `PENDING -> INACTIVE`, kem `reason` va gui email thong bao ly do tu choi

Trang thai su dung trong he thong:

- `UNVERIFIED`: chua verify email
- `PENDING`: da verify email, dang cho admin duyet
- `ACTIVE`: duoc phep dang nhap va su dung he thong
- `INACTIVE`: bi khoa/tu choi, khong duoc dang nhap

---

## 2. Auth va phan quyen

Tat ca API ben duoi deu yeu cau:

- Header: `Authorization: Bearer <admin_token>`
- Role: `ADMIN`

Loi thuong gap:

- `401 Unauthorized`: thieu/het han token
- `403 Forbidden`: khong du quyen admin

---

## 3. API Approve Member

- Method: `PATCH`
- Endpoint: `/api/auth/users/:id/approve`
- Muc dich: duyet thanh vien tu `PENDING` sang `ACTIVE`

### Path params

- `id` (UUID): user id can duyet

### Business rules

- User phai ton tai
- User phai o trang thai `PENDING`
- Neu khong o `PENDING` se tra loi loi nghiep vu

### Response thanh cong

- Status: `200 OK`

```json
{
  "message": "Duyệt thành viên thành công"
}
```

### Loi nghiep vu

- `400 Bad Request`: user khong ton tai hoac trang thai hien tai khong hop le cho approve

---

## 4. API Block Member

- Method: `PATCH`
- Endpoint: `/api/auth/users/:id/block`
- Muc dich: khoa thanh vien tu `ACTIVE` sang `INACTIVE`

### Path params

- `id` (UUID): user id can khoa

### Business rules

- User phai ton tai
- Chi cho phep khoa khi dang o `ACTIVE`
- Thu hoi tat ca refresh token dang hoat dong cua user

### Response thanh cong

- Status: `200 OK`

```json
{
  "message": "Khóa thành viên thành công"
}
```

### Loi nghiep vu

- `400 Bad Request`: user khong ton tai hoac khong o `ACTIVE`

---

## 5. API Reject Member

- Method: `PATCH`
- Endpoint: `/api/auth/users/:id/reject`
- Muc dich: tu choi duyet thanh vien tu `PENDING` sang `INACTIVE`, kem ly do

### Path params

- `id` (UUID): user id can tu choi

### Request body

```json
{
  "reason": "Ho so chua day du thong tin, vui long bo sung giay to xac minh."
}
```

### Validate

- `reason`: bat buoc, khong rong, toi da 1000 ky tu

### Business rules

- User phai ton tai
- Chi cho phep reject khi dang o `PENDING`
- Cap nhat trang thai sang `INACTIVE`
- Thu hoi toan bo refresh token cua user
- Gui email thong bao tu choi kem ly do

### Response thanh cong

- Status: `200 OK`

```json
{
  "message": "Từ chối duyệt thành viên thành công"
}
```

### Loi nghiep vu

- `400 Bad Request`: user khong ton tai, trang thai khong hop le, hoac thieu `reason`

---

## 6. Vi du goi API nhanh

### 6.1 Approve

```bash
curl --request PATCH "http://localhost:3000/api/auth/users/USER_ID/approve" \
  --header "Authorization: Bearer <admin_token>"
```

### 6.2 Block

```bash
curl --request PATCH "http://localhost:3000/api/auth/users/USER_ID/block" \
  --header "Authorization: Bearer <admin_token>"
```

### 6.3 Reject

```bash
curl --request PATCH "http://localhost:3000/api/auth/users/USER_ID/reject" \
  --header "Authorization: Bearer <admin_token>" \
  --header "Content-Type: application/json" \
  --data '{"reason":"Ho so chua dat yeu cau"}'
```

---

## 7. Luu y trien khai

- Endpoint cu `/api/auth/users/:id/activate` duoc giu de tuong thich nguoc va map cung logic approve (`PENDING -> ACTIVE`).
- Khi account o `INACTIVE`, login se bi chan voi thong bao "Tai khoan da bi khoa".
- Can tao migration Prisma de dong bo enum `UserAccountStatus` (them `INACTIVE`) vao database truoc khi deploy production.

---

## 8. De xuat buoc tiep theo

1. Tao migration cho enum `UserAccountStatus` va apply tren moi moi truong.
2. Bo sung integration test cho 3 API moderation:
   - approve happy path + invalid state
   - block happy path + invalid state
   - reject happy path + validate reason + verify call gui email
3. Bo sung dashboard admin hien thi lich su moderation (approved/blocked/rejected + reason + admin actor).
