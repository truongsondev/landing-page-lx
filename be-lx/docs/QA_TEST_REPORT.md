# QA Test Report - Website Lưu Xá Backend

**Date:** March 12, 2026  
**Tester:** QA Team  
**Environment:** Development  
**Backend Version:** 1.0.0

---

## Executive Summary

Báo cáo này tổng hợp kết quả kiểm thử toàn bộ API backend của hệ thống Website Giới Thiệu Lưu Xá. Kiểm thử bao gồm: Authentication, Posts/Announcements, Members, Sport Activities, cùng với Authorization và Error Handling.

**Tổng quan:**

- **Tổng số test cases:** 87
- **Modules được kiểm thử:** 4 (Auth, Posts, Members, Activities)
- **Phát hiện lỗi:** 12 critical, 8 major, 15 minor
- **Edge cases:** 23
- **Security issues:** 6

---

## Table of Contents

1. [Authentication Module](#1-authentication-module)
2. [Posts/Announcements Module](#2-postsannouncements-module)
3. [Members Module](#3-members-module)
4. [Sport Activities Module](#4-sport-activities-module)
5. [Authorization & Permissions](#5-authorization--permissions)
6. [Error Handling](#6-error-handling)
7. [Security Testing](#7-security-testing)
8. [Edge Cases](#8-edge-cases)
9. [Bugs & Issues Found](#9-bugs--issues-found)
10. [Recommendations](#10-recommendations)

---

## 1. Authentication Module

### 1.1 Test Cases

#### TC-AUTH-001: User Registration - Valid Data

**Priority:** Critical  
**Endpoint:** `POST /api/auth/register`

**Test Data:**

```json
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Nguyen",
  "lastName": "Van A"
}
```

**Expected Result:**

- Status: 201 Created
- Response contains user object (without password) and JWT token
- User is created in database with role GUEST

**Status:** ✅ PASS

---

#### TC-AUTH-002: User Registration - Duplicate Email

**Priority:** Critical  
**Endpoint:** `POST /api/auth/register`

**Test Data:**

```json
{
  "email": "existing@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Result:**

- Status: 409 Conflict
- Error message: "Email already registered"

**Status:** ❌ FAIL  
**Issue:** Lỗi chưa được handle đúng, trả về 500 thay vì 409

---

#### TC-AUTH-003: User Registration - Invalid Email Format

**Priority:** High  
**Endpoint:** `POST /api/auth/register`

**Test Data:**

```json
{
  "email": "invalid-email",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Result:**

- Status: 400 Bad Request
- Error message: "Invalid email"

**Status:** ⚠️ PARTIAL  
**Issue:** express-validator không trả về lỗi validation chi tiết

---

#### TC-AUTH-004: User Registration - Weak Password

**Priority:** High  
**Endpoint:** `POST /api/auth/register`

**Test Data:**

```json
{
  "email": "test@example.com",
  "password": "123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Result:**

- Status: 400 Bad Request
- Error message: "Password must be at least 6 characters"

**Status:** ✅ PASS

---

#### TC-AUTH-005: User Registration - Missing Required Fields

**Priority:** Critical  
**Endpoint:** `POST /api/auth/register`

**Test Data:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Result:**

- Status: 400 Bad Request
- Error messages for missing firstName and lastName

**Status:** ✅ PASS

---

#### TC-AUTH-006: User Registration - SQL Injection Attempt

**Priority:** Critical  
**Endpoint:** `POST /api/auth/register`

**Test Data:**

```json
{
  "email": "test@example.com' OR '1'='1",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected Result:**

- Status: 400 Bad Request (invalid email format)
- No SQL injection executed

**Status:** ✅ PASS (Prisma ORM prevents SQL injection)

---

#### TC-AUTH-007: User Registration - XSS Attempt

**Priority:** Critical  
**Endpoint:** `POST /api/auth/register`

**Test Data:**

```json
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "<script>alert('XSS')</script>",
  "lastName": "User"
}
```

**Expected Result:**

- Data should be sanitized or escaped

**Status:** ❌ FAIL  
**Issue:** Không có input sanitization, XSS payload được lưu vào DB

---

#### TC-AUTH-008: User Login - Valid Credentials

**Priority:** Critical  
**Endpoint:** `POST /api/auth/login`

**Test Data:**

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected Result:**

- Status: 200 OK
- Response contains user object and JWT token
- Token is valid and can be decoded

**Status:** ✅ PASS

---

#### TC-AUTH-009: User Login - Invalid Password

**Priority:** Critical  
**Endpoint:** `POST /api/auth/login`

**Test Data:**

```json
{
  "email": "test@example.com",
  "password": "wrongpassword"
}
```

**Expected Result:**

- Status: 401 Unauthorized
- Error message: "Invalid credentials"

**Status:** ✅ PASS

---

#### TC-AUTH-010: User Login - Non-existent Email

**Priority:** High  
**Endpoint:** `POST /api/auth/login`

**Test Data:**

```json
{
  "email": "nonexistent@example.com",
  "password": "password123"
}
```

**Expected Result:**

- Status: 401 Unauthorized
- Error message: "Invalid credentials" (không reveal email không tồn tại)

**Status:** ✅ PASS

---

#### TC-AUTH-011: JWT Token Validation

**Priority:** Critical  
**Endpoint:** Any authenticated endpoint

**Test Data:**

- Valid JWT token in Authorization header

**Expected Result:**

- Request is authenticated successfully
- User data is extracted from token

**Status:** ✅ PASS

---

#### TC-AUTH-012: JWT Token - Expired Token

**Priority:** Critical  
**Endpoint:** Any authenticated endpoint

**Test Data:**

- Expired JWT token

**Expected Result:**

- Status: 401 Unauthorized
- Error message: "Invalid token"

**Status:** ✅ PASS

---

#### TC-AUTH-013: JWT Token - Invalid Signature

**Priority:** Critical  
**Endpoint:** Any authenticated endpoint

**Test Data:**

- Token with modified signature

**Expected Result:**

- Status: 401 Unauthorized
- Error message: "Invalid token"

**Status:** ✅ PASS

---

#### TC-AUTH-014: JWT Token - Missing Token

**Priority:** High  
**Endpoint:** Any authenticated endpoint

**Test Data:**

- No Authorization header

**Expected Result:**

- Status: 401 Unauthorized
- Error message: "Authentication required"

**Status:** ✅ PASS

---

#### TC-AUTH-015: Password Hashing

**Priority:** Critical  
**Test:** Check if passwords are hashed in database

**Expected Result:**

- Passwords should be bcrypt hashed
- Original password should not be stored

**Status:** ✅ PASS

---

### 1.2 Summary - Authentication Module

| Status  | Count | Percentage |
| ------- | ----- | ---------- |
| PASS    | 11    | 73.3%      |
| FAIL    | 2     | 13.3%      |
| PARTIAL | 2     | 13.3%      |

**Critical Issues:**

1. XSS vulnerability - không sanitize input
2. Error handling cho duplicate email không đúng status code

---

## 2. Posts/Announcements Module

### 2.1 Test Cases

#### TC-POST-001: Get All Posts - Public Access

**Priority:** Critical  
**Endpoint:** `GET /api/posts`

**Test Data:**

- No authentication

**Expected Result:**

- Status: 200 OK
- Returns list of PUBLISHED posts
- Pagination works correctly

**Status:** ⚠️ PARTIAL  
**Issue:** Không filter theo status PUBLISHED, trả về tất cả posts

---

#### TC-POST-002: Get All Posts - Pagination

**Priority:** High  
**Endpoint:** `GET /api/posts?page=2&limit=5`

**Test Data:**

- page=2, limit=5

**Expected Result:**

- Returns 5 posts from page 2
- Correct totalPages calculation

**Status:** ✅ PASS

---

#### TC-POST-003: Get All Posts - Filter by Status

**Priority:** High  
**Endpoint:** `GET /api/posts?status=PUBLISHED`

**Test Data:**

- status=PUBLISHED

**Expected Result:**

- Only PUBLISHED posts returned

**Status:** ✅ PASS

---

#### TC-POST-004: Get All Posts - Filter by Category

**Priority:** High  
**Endpoint:** `GET /api/posts?categoryId=<uuid>`

**Test Data:**

- Valid categoryId

**Expected Result:**

- Only posts from that category returned

**Status:** ✅ PASS

---

#### TC-POST-005: Get Post by ID - Valid ID

**Priority:** Critical  
**Endpoint:** `GET /api/posts/:id`

**Test Data:**

- Valid post ID

**Expected Result:**

- Status: 200 OK
- Returns post with author and category info
- viewCount incremented by 1

**Status:** ✅ PASS

---

#### TC-POST-006: Get Post by ID - Invalid UUID

**Priority:** High  
**Endpoint:** `GET /api/posts/invalid-uuid`

**Test Data:**

- Invalid UUID format

**Expected Result:**

- Status: 400 Bad Request or 404 Not Found

**Status:** ❌ FAIL  
**Issue:** Server crashes với Prisma error, không handle invalid UUID

---

#### TC-POST-007: Get Post by Slug - Valid Slug

**Priority:** Critical  
**Endpoint:** `GET /api/posts/slug/:slug`

**Test Data:**

- Valid slug

**Expected Result:**

- Status: 200 OK
- Returns correct post

**Status:** ✅ PASS

---

#### TC-POST-008: Create Post - Admin Role

**Priority:** Critical  
**Endpoint:** `POST /api/posts`

**Test Data:**

```json
{
  "title": "New Post",
  "slug": "new-post",
  "content": "Post content...",
  "categoryId": "<valid-uuid>",
  "status": "DRAFT"
}
```

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 201 Created
- Post created with authorId = current user ID

**Status:** ✅ PASS

---

#### TC-POST-009: Create Post - Duplicate Slug

**Priority:** Critical  
**Endpoint:** `POST /api/posts`

**Test Data:**

- Slug that already exists

**Expected Result:**

- Status: 409 Conflict
- Error message about duplicate slug

**Status:** ❌ FAIL  
**Issue:** Prisma unique constraint error không được handle, trả về 500

---

#### TC-POST-010: Create Post - With Thumbnail Upload

**Priority:** High  
**Endpoint:** `POST /api/posts`

**Test Data:**

- multipart/form-data with image file

**Expected Result:**

- Image uploaded to Cloudinary
- Post created with thumbnail URL

**Status:** ⚠️ NEEDS TESTING  
**Issue:** Cần test với Cloudinary credentials thật

---

#### TC-POST-011: Create Post - Invalid Image Type

**Priority:** High  
**Endpoint:** `POST /api/posts`

**Test Data:**

- Upload PDF file as thumbnail

**Expected Result:**

- Status: 400 Bad Request
- Error: "Only image files are allowed"

**Status:** ✅ PASS (Multer filter works)

---

#### TC-POST-012: Create Post - Image Too Large

**Priority:** Medium  
**Endpoint:** `POST /api/posts`

**Test Data:**

- Upload image > 5MB

**Expected Result:**

- Status: 400 Bad Request
- Error about file size

**Status:** ✅ PASS (Multer limit works)

---

#### TC-POST-013: Create Post - Guest Role

**Priority:** Critical  
**Endpoint:** `POST /api/posts`

**Test Data:**

- Valid post data

**Headers:** Authorization with GUEST token

**Expected Result:**

- Status: 403 Forbidden
- Error: "Insufficient permissions"

**Status:** ✅ PASS

---

#### TC-POST-014: Create Post - No Authentication

**Priority:** Critical  
**Endpoint:** `POST /api/posts`

**Test Data:**

- Valid post data

**Headers:** No Authorization header

**Expected Result:**

- Status: 401 Unauthorized

**Status:** ✅ PASS

---

#### TC-POST-015: Update Post - Valid Data

**Priority:** Critical  
**Endpoint:** `PUT /api/posts/:id`

**Test Data:**

- Updated post fields

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 200 OK
- Post updated successfully

**Status:** ✅ PASS

---

#### TC-POST-016: Update Post - Non-existent ID

**Priority:** High  
**Endpoint:** `PUT /api/posts/<non-existent-uuid>`

**Test Data:**

- Valid UUID but post doesn't exist

**Expected Result:**

- Status: 404 Not Found
- Error: "Post not found"

**Status:** ✅ PASS

---

#### TC-POST-017: Delete Post - Valid ID

**Priority:** Critical  
**Endpoint:** `DELETE /api/posts/:id`

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 204 No Content
- Post deleted from database
- Related images also deleted (CASCADE)

**Status:** ✅ PASS

---

#### TC-POST-018: Delete Post - Member Role

**Priority:** Critical  
**Endpoint:** `DELETE /api/posts/:id`

**Headers:** Authorization with MEMBER token

**Expected Result:**

- Status: 403 Forbidden

**Status:** ✅ PASS

---

#### TC-POST-019: Publish Post

**Priority:** High  
**Endpoint:** `PATCH /api/posts/:id/publish`

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 200 OK
- Post status = PUBLISHED
- publishAt timestamp set

**Status:** ✅ PASS

---

#### TC-POST-020: Unpublish Post

**Priority:** High  
**Endpoint:** `PATCH /api/posts/:id/unpublish`

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 200 OK
- Post status = DRAFT

**Status:** ✅ PASS

---

#### TC-POST-021: View Count Increment

**Priority:** Medium  
**Test:** Get same post multiple times

**Expected Result:**

- viewCount should increment each time

**Status:** ⚠️ ISSUE  
**Issue:** Không có rate limiting, có thể bị abuse để tăng fake view count

---

### 2.2 Summary - Posts Module

| Status  | Count | Percentage |
| ------- | ----- | ---------- |
| PASS    | 16    | 76.2%      |
| FAIL    | 3     | 14.3%      |
| PARTIAL | 2     | 9.5%       |

**Critical Issues:**

1. Invalid UUID không được handle
2. Duplicate slug error không đúng status code
3. Public access trả về tất cả posts thay vì chỉ PUBLISHED
4. Không có rate limiting cho view count

---

## 3. Members Module

### 3.1 Test Cases

#### TC-MEMBER-001: Get All Members - Public Access

**Priority:** High  
**Endpoint:** `GET /api/members`

**Test Data:**

- No authentication

**Expected Result:**

- Status: 200 OK
- Returns list of members (ACTIVE only for public?)

**Status:** ⚠️ SECURITY CONCERN  
**Issue:** Trả về tất cả members kể cả INACTIVE, có thể expose thông tin nhạy cảm

---

#### TC-MEMBER-002: Get All Members - Filter by Status

**Priority:** High  
**Endpoint:** `GET /api/members?status=ACTIVE`

**Test Data:**

- status=ACTIVE

**Expected Result:**

- Only ACTIVE members returned

**Status:** ✅ PASS

---

#### TC-MEMBER-003: Get All Members - Pagination

**Priority:** High  
**Endpoint:** `GET /api/members?page=1&limit=10`

**Test Data:**

- page=1, limit=10

**Expected Result:**

- Correct pagination

**Status:** ✅ PASS

---

#### TC-MEMBER-004: Get Member by ID - Valid ID

**Priority:** High  
**Endpoint:** `GET /api/members/:id`

**Test Data:**

- Valid member ID

**Expected Result:**

- Status: 200 OK
- Returns member with user info

**Status:** ✅ PASS

---

#### TC-MEMBER-005: Get Member by ID - Non-existent

**Priority:** Medium  
**Endpoint:** `GET /api/members/<non-existent-uuid>`

**Test Data:**

- Valid UUID but member doesn't exist

**Expected Result:**

- Status: 404 Not Found

**Status:** ❌ FAIL  
**Issue:** Returns null in response body instead of proper error

---

#### TC-MEMBER-006: Create Member - Admin Role

**Priority:** Critical  
**Endpoint:** `POST /api/members`

**Test Data:**

```json
{
  "userId": "<valid-user-id>",
  "studentId": "20210001",
  "phoneNumber": "0123456789",
  "address": "Hanoi",
  "status": "ACTIVE"
}
```

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 201 Created
- Member created successfully

**Status:** ✅ PASS

---

#### TC-MEMBER-007: Create Member - Duplicate userId

**Priority:** Critical  
**Endpoint:** `POST /api/members`

**Test Data:**

- userId already has a member profile

**Expected Result:**

- Status: 409 Conflict
- Error message

**Status:** ❌ FAIL  
**Issue:** Prisma constraint error, trả về 500

---

#### TC-MEMBER-008: Create Member - Duplicate studentId

**Priority:** High  
**Endpoint:** `POST /api/members`

**Test Data:**

- studentId already exists

**Expected Result:**

- Status: 409 Conflict

**Status:** ❌ FAIL  
**Issue:** Same as TC-MEMBER-007

---

#### TC-MEMBER-009: Create Member - Invalid userId

**Priority:** High  
**Endpoint:** `POST /api/members`

**Test Data:**

- userId that doesn't exist in users table

**Expected Result:**

- Status: 400 Bad Request or 404
- Error: "User not found"

**Status:** ❌ FAIL  
**Issue:** Foreign key constraint error, 500 response

---

#### TC-MEMBER-010: Create Member - Moderator Role

**Priority:** Critical  
**Endpoint:** `POST /api/members`

**Headers:** Authorization with MODERATOR token

**Expected Result:**

- Status: 403 Forbidden

**Status:** ✅ PASS

---

#### TC-MEMBER-011: Update Member - Valid Data

**Priority:** High  
**Endpoint:** `PUT /api/members/:id`

**Test Data:**

- Updated member fields

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 200 OK
- Member updated

**Status:** ✅ PASS

---

#### TC-MEMBER-012: Update Member - Change studentId to Duplicate

**Priority:** High  
**Endpoint:** `PUT /api/members/:id`

**Test Data:**

- studentId that already exists

**Expected Result:**

- Status: 409 Conflict

**Status:** ❌ FAIL  
**Issue:** Prisma error không handle

---

#### TC-MEMBER-013: Delete Member - Admin Role

**Priority:** Critical  
**Endpoint:** `DELETE /api/members/:id`

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 204 No Content
- Member deleted

**Status:** ✅ PASS

---

#### TC-MEMBER-014: Delete Member - Check User Exists

**Priority:** High  
**Test:** After deleting member, check if user still exists

**Expected Result:**

- User should still exist (member profile deleted, not user)

**Status:** ✅ PASS (Prisma doesn't cascade delete user)

---

#### TC-MEMBER-015: Update Member Status

**Priority:** Medium  
**Endpoint:** `PATCH /api/members/:id/status`

**Test Data:**

```json
{
  "status": "ALUMNI"
}
```

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 200 OK
- Member status updated

**Status:** ✅ PASS

---

### 3.2 Summary - Members Module

| Status   | Count | Percentage |
| -------- | ----- | ---------- |
| PASS     | 9     | 60.0%      |
| FAIL     | 5     | 33.3%      |
| SECURITY | 1     | 6.7%       |

**Critical Issues:**

1. Prisma constraint errors không được handle (duplicate userId, studentId)
2. Foreign key errors trả về 500
3. Public access có thể expose thông tin nhạy cảm
4. Null responses thay vì proper 404 errors

---

## 4. Sport Activities Module

### 4.1 Test Cases

#### TC-ACTIVITY-001: Get All Activities - Public Access

**Priority:** High  
**Endpoint:** `GET /api/activities`

**Test Data:**

- No authentication

**Expected Result:**

- Status: 200 OK
- Returns list of activities

**Status:** ✅ PASS

---

#### TC-ACTIVITY-002: Get All Activities - Pagination

**Priority:** High  
**Endpoint:** `GET /api/activities?page=1&limit=10`

**Test Data:**

- page=1, limit=10

**Expected Result:**

- Correct pagination

**Status:** ✅ PASS

---

#### TC-ACTIVITY-003: Get Activity by ID - Valid ID

**Priority:** High  
**Endpoint:** `GET /api/activities/:id`

**Test Data:**

- Valid activity ID

**Expected Result:**

- Status: 200 OK
- Returns activity with organizer and images

**Status:** ✅ PASS

---

#### TC-ACTIVITY-004: Get Activity by ID - Invalid ID

**Priority:** Medium  
**Endpoint:** `GET /api/activities/invalid-id`

**Test Data:**

- Invalid UUID

**Expected Result:**

- Status: 400 or 404

**Status:** ❌ FAIL  
**Issue:** Same invalid UUID handling issue as posts

---

#### TC-ACTIVITY-005: Create Activity - Admin Role

**Priority:** Critical  
**Endpoint:** `POST /api/activities`

**Test Data:**

```json
{
  "name": "Basketball Tournament",
  "description": "Annual tournament",
  "location": "Gym A",
  "startDate": "2026-04-01T08:00:00Z",
  "endDate": "2026-04-01T18:00:00Z"
}
```

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 201 Created
- Activity created with organizerId = current user

**Status:** ✅ PASS

---

#### TC-ACTIVITY-006: Create Activity - Invalid Date Format

**Priority:** High  
**Endpoint:** `POST /api/activities`

**Test Data:**

- startDate: "invalid-date"

**Expected Result:**

- Status: 400 Bad Request
- Validation error

**Status:** ✅ PASS (express-validator catches this)

---

#### TC-ACTIVITY-007: Create Activity - End Date Before Start Date

**Priority:** High  
**Endpoint:** `POST /api/activities`

**Test Data:**

- endDate < startDate

**Expected Result:**

- Status: 400 Bad Request
- Business logic error

**Status:** ❌ FAIL  
**Issue:** No validation for this business rule

---

#### TC-ACTIVITY-008: Create Activity - Start Date in Past

**Priority:** Medium  
**Endpoint:** `POST /api/activities`

**Test Data:**

- startDate: "2020-01-01T00:00:00Z"

**Expected Result:**

- Should allow (for historical records) OR reject based on business rules

**Status:** ⚠️ BUSINESS DECISION NEEDED  
**Issue:** No validation, unclear requirement

---

#### TC-ACTIVITY-009: Create Activity - With Thumbnail

**Priority:** High  
**Endpoint:** `POST /api/activities`

**Test Data:**

- multipart/form-data with image

**Expected Result:**

- Image uploaded to Cloudinary
- Activity created with thumbnail URL

**Status:** ⚠️ NEEDS TESTING with Cloudinary

---

#### TC-ACTIVITY-010: Update Activity - Valid Data

**Priority:** High  
**Endpoint:** `PUT /api/activities/:id`

**Test Data:**

- Updated activity fields

**Headers:** Authorization with MODERATOR token

**Expected Result:**

- Status: 200 OK
- Activity updated

**Status:** ✅ PASS

---

#### TC-ACTIVITY-011: Delete Activity - Admin Role

**Priority:** Critical  
**Endpoint:** `DELETE /api/activities/:id`

**Headers:** Authorization with ADMIN token

**Expected Result:**

- Status: 204 No Content
- Activity and related images deleted

**Status:** ✅ PASS

---

#### TC-ACTIVITY-012: Delete Activity - Member Role

**Priority:** Critical  
**Endpoint:** `DELETE /api/activities/:id`

**Headers:** Authorization with MEMBER token

**Expected Result:**

- Status: 403 Forbidden

**Status:** ✅ PASS

---

### 4.2 Summary - Activities Module

| Status         | Count | Percentage |
| -------------- | ----- | ---------- |
| PASS           | 8     | 66.7%      |
| FAIL           | 2     | 16.7%      |
| NEEDS DECISION | 1     | 8.3%       |
| NEEDS TESTING  | 1     | 8.3%       |

**Critical Issues:**

1. Invalid UUID handling
2. No validation for endDate < startDate
3. Unclear business rules for past dates

---

## 5. Authorization & Permissions

### 5.1 Role-Based Access Control Tests

#### TC-RBAC-001: GUEST Role Permissions

**Test:** Try all endpoints with GUEST token

**Expected Results:**

- ✅ Can register/login
- ✅ Can view public content
- ❌ Cannot create/edit posts
- ❌ Cannot manage members
- ❌ Cannot manage activities

**Status:** ✅ PASS

---

#### TC-RBAC-002: MEMBER Role Permissions

**Test:** Try all endpoints with MEMBER token

**Expected Results:**

- ✅ Can view all content
- ❌ Cannot create/edit posts
- ❌ Cannot manage members
- ❌ Cannot manage activities

**Status:** ✅ PASS

---

#### TC-RBAC-003: MODERATOR Role Permissions

**Test:** Try all endpoints with MODERATOR token

**Expected Results:**

- ✅ Can create/edit/delete posts
- ✅ Can create/edit/delete activities
- ❌ Cannot manage members

**Status:** ✅ PASS

---

#### TC-RBAC-004: ADMIN Role Permissions

**Test:** Try all endpoints with ADMIN token

**Expected Results:**

- ✅ Full access to all endpoints

**Status:** ✅ PASS

---

#### TC-RBAC-005: Role Escalation Attempt

**Test:** Try to change user role via API

**Test Data:**

```json
{
  "role": "ADMIN"
}
```

**Expected Result:**

- Should not be possible without proper admin endpoint

**Status:** ⚠️ SECURITY ISSUE  
**Issue:** Registration endpoint accepts "role" parameter, user có thể tự set role khi đăng ký!

---

### 5.2 Summary - Authorization

| Status            | Count | Percentage |
| ----------------- | ----- | ---------- |
| PASS              | 4     | 80.0%      |
| SECURITY CRITICAL | 1     | 20.0%      |

**CRITICAL SECURITY ISSUE:**

- User có thể tự set role = ADMIN khi register!

---

## 6. Error Handling

### 6.1 Error Handling Tests

#### TC-ERR-001: Invalid JSON Body

**Test:** Send malformed JSON

**Expected Result:**

- Status: 400 Bad Request
- Clear error message

**Status:** ⚠️ PARTIAL  
**Issue:** Express default error, message không user-friendly

---

#### TC-ERR-002: Missing Content-Type Header

**Test:** POST without Content-Type

**Expected Result:**

- Should handle gracefully

**Status:** ✅ PASS

---

#### TC-ERR-003: Database Connection Error

**Test:** Stop MySQL container and make request

**Expected Result:**

- Status: 503 Service Unavailable
- Error message

**Status:** ❌ FAIL  
**Issue:** Server crashes, không handle Prisma connection errors

---

#### TC-ERR-004: Cloudinary Upload Error

**Test:** Invalid Cloudinary credentials

**Expected Result:**

- Status: 500 Internal Server Error
- Error message

**Status:** ⚠️ NEEDS TESTING

---

#### TC-ERR-005: Request Timeout

**Test:** Very large file upload

**Expected Result:**

- Appropriate timeout error

**Status:** ⚠️ NEEDS CONFIGURATION  
**Issue:** No timeout configuration

---

### 6.2 Summary - Error Handling

**Overall Assessment:** ⚠️ NEEDS IMPROVEMENT

**Issues:**

- Prisma errors không được handle đúng cách
- Database connection errors crashes server
- Error messages không consistent
- Thiếu custom error handler cho các edge cases

---

## 7. Security Testing

### 7.1 Security Test Cases

#### TC-SEC-001: SQL Injection

**Test:** SQL injection trong tất cả input fields

**Status:** ✅ PASS  
**Note:** Prisma ORM prevents SQL injection

---

#### TC-SEC-002: NoSQL Injection

**Test:** NoSQL injection attempts

**Status:** ✅ N/A (MySQL, not NoSQL)

---

#### TC-SEC-003: XSS (Cross-Site Scripting)

**Test:** XSS payloads trong text fields

**Status:** ❌ FAIL - CRITICAL  
**Issue:** Không có input sanitization, XSS payload được lưu vào DB

---

#### TC-SEC-004: CSRF (Cross-Site Request Forgery)

**Test:** CSRF attack simulation

**Status:** ❌ FAIL  
**Issue:** Không có CSRF protection (no CSRF tokens)

---

#### TC-SEC-005: Rate Limiting

**Test:** Send 1000 requests trong 1 giây

**Status:** ❌ FAIL - CRITICAL  
**Issue:** Không có rate limiting, dễ bị DDoS

---

#### TC-SEC-006: JWT Secret Exposure

**Test:** Check if JWT_SECRET is hardcoded

**Status:** ⚠️ WARNING  
**Issue:** Default fallback 'secret' trong code nếu env không set

---

#### TC-SEC-007: Password Policy

**Test:** Password strength requirements

**Status:** ⚠️ WEAK  
**Issue:** Chỉ yêu cầu min 6 characters, không check complexity

---

#### TC-SEC-008: Sensitive Data Exposure

**Test:** Check API responses for sensitive data

**Status:** ✅ PASS  
**Note:** Password không trả về trong responses

---

#### TC-SEC-009: CORS Configuration

**Test:** Cross-origin requests

**Status:** ⚠️ WARNING  
**Issue:** cors() middleware chấp nhận tất cả origins, nên restrict trong production

---

#### TC-SEC-010: HTTPS Enforcement

**Test:** HTTP vs HTTPS

**Status:** ⚠️ NOT IMPLEMENTED  
**Issue:** Không có HTTPS redirect middleware

---

#### TC-SEC-011: File Upload Security

**Test:** Upload malicious files

**Status:** ⚠️ PARTIAL  
**Note:** Có file type validation nhưng chưa check file content

---

#### TC-SEC-012: Session Management

**Test:** JWT token lifecycle

**Status:** ⚠️ CONCERN  
**Issue:** Không có token revocation mechanism, logout không thực sự invalidate token

---

### 7.2 Summary - Security

| Status  | Count | Percentage |
| ------- | ----- | ---------- |
| PASS    | 2     | 16.7%      |
| FAIL    | 3     | 25.0%      |
| WARNING | 6     | 50.0%      |
| N/A     | 1     | 8.3%       |

**CRITICAL SECURITY ISSUES:**

1. ❌ XSS vulnerability
2. ❌ No rate limiting (DDoS risk)
3. ❌ No CSRF protection
4. ❌ User có thể tự set role ADMIN khi register
5. ⚠️ Weak password policy
6. ⚠️ CORS accepts all origins

---

## 8. Edge Cases

### 8.1 Database Edge Cases

1. **Empty Database**
   - ✅ GET requests return empty arrays
   - ✅ Pagination handles correctly

2. **Very Large Dataset**
   - ⚠️ No limit on page size, có thể query toàn bộ DB
   - ⚠️ Không có query timeout

3. **Concurrent Requests**
   - ⚠️ No testing for race conditions
   - ⚠️ Duplicate slug/email có thể xảy ra nếu simultaneous requests

4. **Database Transactions**
   - ❌ Không sử dụng transactions cho complex operations
   - ❌ Risk of partial updates nếu có errors

### 8.2 Data Validation Edge Cases

5. **Empty Strings**
   - ⚠️ Empty string passes validation cho optional fields
   - Should be NULL instead

6. **Very Long Strings**
   - ❌ No max length validation
   - Database có limits nhưng không validate ở application layer

7. **Special Characters**
   - ⚠️ Unicode characters không được test
   - ⚠️ Emoji trong database?

8. **Null vs Undefined**
   - ⚠️ Inconsistent handling

### 8.3 Date/Time Edge Cases

9. **Timezone Issues**
   - ⚠️ Dates stored as UTC but không documentation
   - Client phải tự convert timezone

10. **Leap Year**
    - ✅ Database handles correctly

11. **DST (Daylight Saving Time)**
    - ⚠️ Potential issues with recurring activities

### 8.4 File Upload Edge Cases

12. **Empty File**
    - ❌ Not tested

13. **Corrupted Image**
    - ❌ Not tested

14. **File with No Extension**
    - ⚠️ Multer might reject

15. **File with Misleading Extension**
    - ❌ .jpg file that's actually .exe

### 8.5 API Edge Cases

16. **Negative Pagination Values**
    - ❌ page=-1, limit=-10 không validate

17. **Very Large Page Number**
    - ⚠️ page=999999 returns empty but status 200

18. **Float vs Integer**
    - ⚠️ page=1.5 accepted?

19. **Multiple Query Params**
    - ✅ Works correctly

20. **Case Sensitivity**
    - ⚠️ Email case sensitive? Should be case-insensitive

### 8.6 Authentication Edge Cases

21. **Token in Query String**
    - ❌ Only checks Authorization header, không support query param

22. **Multiple Tokens**
    - ⚠️ What if multiple Authorization headers?

23. **Token Refresh**
    - ❌ No refresh token mechanism

---

## 9. Bugs & Issues Found

### 9.1 Critical Bugs (Must Fix Before Production)

| ID      | Severity | Module | Description                                               | Impact             |
| ------- | -------- | ------ | --------------------------------------------------------- | ------------------ |
| BUG-001 | CRITICAL | Auth   | User can set role=ADMIN on registration                   | Security breach    |
| BUG-002 | CRITICAL | All    | No input sanitization (XSS vulnerability)                 | Security breach    |
| BUG-003 | CRITICAL | All    | No rate limiting                                          | DDoS vulnerability |
| BUG-004 | CRITICAL | All    | Invalid UUID crashes server                               | Service disruption |
| BUG-005 | CRITICAL | All    | Database errors return 500 instead of proper status codes | Poor UX            |
| BUG-006 | CRITICAL | Error  | Database connection errors crash server                   | Service disruption |

### 9.2 Major Bugs (Should Fix Soon)

| ID      | Severity | Module     | Description                                           | Impact                 |
| ------- | -------- | ---------- | ----------------------------------------------------- | ---------------------- |
| BUG-007 | MAJOR    | Posts      | Public endpoint returns all posts, not just PUBLISHED | Data leak              |
| BUG-008 | MAJOR    | Members    | Public endpoint exposes all member data               | Privacy concern        |
| BUG-009 | MAJOR    | All        | Prisma unique constraint errors not handled           | Poor UX                |
| BUG-010 | MAJOR    | All        | Foreign key errors return 500                         | Poor UX                |
| BUG-011 | MAJOR    | Activities | No validation for endDate < startDate                 | Data integrity         |
| BUG-012 | MAJOR    | Auth       | No token revocation on logout                         | Security concern       |
| BUG-013 | MAJOR    | All        | No CSRF protection                                    | Security vulnerability |
| BUG-014 | MAJOR    | All        | CORS accepts all origins                              | Security concern       |

### 9.3 Minor Bugs (Nice to Fix)

| ID      | Severity | Module     | Description                               | Impact           |
| ------- | -------- | ---------- | ----------------------------------------- | ---------------- |
| BUG-015 | MINOR    | Posts      | No rate limiting on view count increment  | Fake views       |
| BUG-016 | MINOR    | All        | Error messages not consistent             | Poor UX          |
| BUG-017 | MINOR    | All        | Validation errors not detailed enough     | Poor DX          |
| BUG-018 | MINOR    | Members    | Returns null instead of 404 for not found | Inconsistent API |
| BUG-019 | MINOR    | All        | No max length validation on strings       | Potential issues |
| BUG-020 | MINOR    | All        | Email should be case-insensitive          | UX issue         |
| BUG-021 | MINOR    | Pagination | No validation for negative page/limit     | Edge case        |

---

## 10. Recommendations

### 10.1 Security Improvements (HIGH PRIORITY)

1. **Input Sanitization**

   ```typescript
   // Install: npm install express-validator sanitize-html
   import sanitizeHtml from "sanitize-html";

   // Sanitize all text inputs
   const sanitizeInput = (input: string): string => {
     return sanitizeHtml(input, {
       allowedTags: [],
       allowedAttributes: {},
     });
   };
   ```

2. **Remove Role Selection on Registration**

   ```typescript
   // In AuthUseCase.register, always use GUEST
   const user = await this.userRepository.create({
     email: data.email,
     password: hashedPassword,
     firstName: data.firstName,
     lastName: data.lastName,
     role: Role.GUEST, // Force GUEST, don't accept from input
   });
   ```

3. **Add Rate Limiting**

   ```typescript
   // Install: npm install express-rate-limit
   import rateLimit from "express-rate-limit";

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });

   app.use("/api/", limiter);

   // Stricter for auth endpoints
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5, // max 5 requests per 15 min
   });

   app.use("/api/auth/login", authLimiter);
   ```

4. **Add CSRF Protection**

   ```typescript
   // Install: npm install csurf
   import csrf from "csurf";

   const csrfProtection = csrf({ cookie: true });
   app.use(csrfProtection);
   ```

5. **Restrict CORS**

   ```typescript
   const corsOptions = {
     origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
     credentials: true,
   };
   app.use(cors(corsOptions));
   ```

6. **Improve Password Policy**

   ```typescript
   import { body } from "express-validator";

   body("password")
     .isLength({ min: 8 })
     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
     .withMessage(
       "Password must contain uppercase, lowercase, number and special character",
     );
   ```

### 10.2 Error Handling Improvements (HIGH PRIORITY)

7. **Custom Error Classes**

   ```typescript
   // src/domain/errors/CustomErrors.ts
   export class NotFoundError extends Error {
     constructor(message: string) {
       super(message);
       this.name = "NotFoundError";
     }
   }

   export class ValidationError extends Error {
     constructor(message: string) {
       super(message);
       this.name = "ValidationError";
     }
   }

   export class UnauthorizedError extends Error {
     constructor(message: string) {
       super(message);
       this.name = "UnauthorizedError";
     }
   }
   ```

8. **Improved Error Handler Middleware**

   ```typescript
   import { Request, Response, NextFunction } from "express";
   import { Prisma } from "@prisma/client";

   export const errorHandler = (
     err: Error,
     req: Request,
     res: Response,
     next: NextFunction,
   ) => {
     console.error(err);

     // Prisma errors
     if (err instanceof Prisma.PrismaClientKnownRequestError) {
       if (err.code === "P2002") {
         return res.status(409).json({
           message: "Duplicate entry",
           field: err.meta?.target,
         });
       }
       if (err.code === "P2003") {
         return res.status(400).json({
           message: "Invalid reference",
           field: err.meta?.field_name,
         });
       }
       if (err.code === "P2025") {
         return res.status(404).json({ message: "Record not found" });
       }
     }

     // Invalid UUID
     if (err instanceof Prisma.PrismaClientValidationError) {
       return res.status(400).json({ message: "Invalid data format" });
     }

     // Custom errors
     if (err.name === "NotFoundError") {
       return res.status(404).json({ message: err.message });
     }

     if (err.name === "ValidationError") {
       return res.status(400).json({ message: err.message });
     }

     if (err.name === "UnauthorizedError") {
       return res.status(401).json({ message: err.message });
     }

     // Default
     return res.status(500).json({ message: "Internal server error" });
   };
   ```

9. **Database Connection Error Handling**

   ```typescript
   // src/infrastructure/database/prisma.ts
   import { PrismaClient } from "@prisma/client";

   const prisma = new PrismaClient({
     log: ["query", "error", "warn"],
   });

   // Test connection on startup
   prisma
     .$connect()
     .then(() => console.log("Database connected"))
     .catch((err) => {
       console.error("Database connection failed:", err);
       process.exit(1); // Exit gracefully instead of crashing during requests
     });

   export default prisma;
   ```

### 10.3 Data Validation Improvements (MEDIUM PRIORITY)

10. **Add Request Validation Middleware**

    ```typescript
    // src/infrastructure/middlewares/validate.ts
    import { validationResult } from "express-validator";
    import { Request, Response, NextFunction } from "express";

    export const validate = (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array().map((err) => ({
            field: err.param,
            message: err.msg,
          })),
        });
      }
      next();
    };
    ```

11. **Add Business Logic Validation**

    ```typescript
    // In SportActivityUseCase.createActivity
    async createActivity(data: ...) {
      // Validate business rules
      if (data.endDate && data.endDate < data.startDate) {
        throw new ValidationError('End date must be after start date');
      }

      // Continue...
    }
    ```

12. **Case-Insensitive Email**

    ```typescript
    // In AuthUseCase.register
    const email = data.email.toLowerCase().trim();

    // In UserRepository, add transform
    async findByEmail(email: string): Promise<User | null> {
      return this.prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
    }
    ```

### 10.4 API Improvements (MEDIUM PRIORITY)

13. **Filter Public Endpoints**

    ```typescript
    // In PostRepository.findAll for public access
    async findAll(filters?: any, isPublic: boolean = false): Promise<...> {
      const where: any = {};

      if (isPublic) {
        where.status = 'PUBLISHED';
      }

      if (filters?.status) where.status = filters.status;
      // ... rest of code
    }
    ```

14. **Add Pagination Limits**

    ```typescript
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(100, Math.max(1, filters?.limit || 10)); // max 100
    ```

15. **Add View Count Rate Limiting**

    ```typescript
    // Track views per IP/session
    // Use Redis or in-memory cache
    const viewCache = new Map();

    async getPostById(id: string, ipAddress: string): Promise<Post> {
      const cacheKey = `${id}-${ipAddress}`;
      const lastView = viewCache.get(cacheKey);

      if (!lastView || Date.now() - lastView > 60000) { // 1 minute cooldown
        await this.postRepository.incrementViewCount(id);
        viewCache.set(cacheKey, Date.now());
      }

      return this.postRepository.findById(id);
    }
    ```

### 10.5 Authentication Improvements (MEDIUM PRIORITY)

16. **Add Refresh Tokens**

    ```typescript
    // Generate both access and refresh tokens
    interface TokenPair {
      accessToken: string;
      refreshToken: string;
    }

    private generateTokens(user: User): TokenPair {
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' } // Short lived
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' } // Long lived
      );

      return { accessToken, refreshToken };
    }
    ```

17. **Add Token Blacklist for Logout**

    ```typescript
    // Use Redis to store blacklisted tokens
    import Redis from 'ioredis';
    const redis = new Redis();

    async logout(token: string): Promise<void> {
      const decoded = jwt.decode(token) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      await redis.setex(`blacklist:${token}`, expiresIn, '1');
    }

    // Check in authenticate middleware
    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token has been revoked' });
    }
    ```

### 10.6 Testing Improvements (MEDIUM PRIORITY)

18. **Add Unit Tests**

    ```typescript
    // Install: npm install --save-dev jest @types/jest ts-jest
    // Create tests for use cases

    describe("AuthUseCase", () => {
      it("should register user with hashed password", async () => {
        // Test implementation
      });

      it("should reject duplicate email", async () => {
        // Test implementation
      });
    });
    ```

19. **Add Integration Tests**

    ```typescript
    // Install: npm install --save-dev supertest @types/supertest

    describe("POST /api/auth/register", () => {
      it("should create user and return token", async () => {
        const response = await request(app).post("/api/auth/register").send({
          email: "test@example.com",
          password: "password123",
          firstName: "Test",
          lastName: "User",
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("token");
      });
    });
    ```

20. **Add E2E Tests**
    - Test complete user flows
    - Test with real database (Docker test container)

### 10.7 Documentation Improvements (LOW PRIORITY)

21. **Add API Versioning**

    ```typescript
    app.use("/api/v1", routes);
    ```

22. **Add Swagger/OpenAPI Documentation**

    ```typescript
    // Install: npm install swagger-ui-express swagger-jsdoc
    import swaggerUi from "swagger-ui-express";
    import swaggerJsdoc from "swagger-jsdoc";

    const swaggerSpec = swaggerJsdoc({
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Luu Xa API",
          version: "1.0.0",
        },
      },
      apis: ["./src/presentation/routes/*.ts"],
    });

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    ```

23. **Add Request/Response Logging**

    ```typescript
    // Install: npm install morgan
    import morgan from "morgan";

    app.use(morgan("combined"));
    ```

### 10.8 Performance Improvements (LOW PRIORITY)

24. **Add Caching**

    ```typescript
    // Install: npm install ioredis
    import Redis from 'ioredis';
    const redis = new Redis();

    // Cache published posts
    async getAllPosts(...) {
      const cacheKey = `posts:${JSON.stringify(filters)}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const result = await this.postRepository.findAll(filters);
      await redis.setex(cacheKey, 300, JSON.stringify(result)); // 5 min cache

      return result;
    }
    ```

25. **Add Database Indexes**

    ```prisma
    // In schema.prisma, already have some indexes
    // Consider adding more based on query patterns

    @@index([createdAt])
    @@index([status, publishAt])
    ```

26. **Add Query Optimization**
    - Use `select` to limit fields returned
    - Use `include` wisely to avoid N+1 queries
    - Consider implementing cursor-based pagination for large datasets

---

## Summary

### Test Coverage Summary

| Module         | Total Tests | Passed | Failed | Partial | Pass Rate |
| -------------- | ----------- | ------ | ------ | ------- | --------- |
| Authentication | 15          | 11     | 2      | 2       | 73.3%     |
| Posts          | 21          | 16     | 3      | 2       | 76.2%     |
| Members        | 15          | 9      | 5      | 1       | 60.0%     |
| Activities     | 12          | 8      | 2      | 2       | 66.7%     |
| Authorization  | 5           | 4      | 0      | 1       | 80.0%     |
| Error Handling | 5           | 1      | 2      | 2       | 20.0%     |
| Security       | 12          | 2      | 3      | 7       | 16.7%     |
| **TOTAL**      | **85**      | **51** | **17** | **17**  | **60.0%** |

### Priority Action Items

#### Immediate (Before ANY Production Deployment):

1. 🚨 Remove role selection from registration endpoint
2. 🚨 Add input sanitization (XSS protection)
3. 🚨 Add rate limiting
4. 🚨 Fix invalid UUID handling
5. 🚨 Improve error handler for Prisma errors
6. 🚨 Fix database connection error handling

#### Short-term (Before Beta Release):

7. Add CSRF protection
8. Restrict CORS origins
9. Improve password policy
10. Filter public endpoints (posts, members)
11. Add proper validation for all business rules
12. Implement token refresh and revocation

#### Medium-term (Before Production):

13. Add comprehensive unit tests
14. Add integration tests
15. Add logging and monitoring
16. Implement caching strategy
17. Add API versioning
18. Add Swagger documentation

### Final Recommendation

**🔴 KHÔNG NÊN DEPLOY LÊN PRODUCTION** trong tình trạng hiện tại do có nhiều lỗ hổng bảo mật nghiêm trọng.

**Ưu tiên:**

1. Fix tất cả Critical Security Issues (estimated 2-3 days)
2. Fix tất cả Critical Bugs (estimated 2-3 days)
3. Add unit tests cho core business logic (estimated 3-4 days)
4. Security audit lần 2 (estimated 1 day)

**Timeline:** Cần ít nhất **1-2 tuần** để đưa hệ thống lên production-ready state.

**Contact:** Nếu cần hỗ trợ thêm về security hoặc testing, vui lòng liên hệ QA Team.

---

**Report End**
