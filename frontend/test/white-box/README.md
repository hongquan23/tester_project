# White-box Tests — Frontend

Kiểm thử **white-box** cho FE StudyWithMe / LearnWithMe.

## Khác gì black-box?

| | `test/black-box/` | `test/white-box/` |
|---|---|---|
| Góc nhìn | User không biết code | Biết nhánh `if/else`, `localStorage`, `alert()` |
| Kỹ thuật | Selenium UI | Selenium + `executeScript` (ép state nội bộ) |
| Ví dụ | Login → vào dashboard | Xóa token → `/member` → **bắt buộc** `/auth` |

## Cấu trúc

```
test/
├── helpers/
│   ├── test-env.js          # URL, email/password test
│   ├── storage.helper.js    # localStorage whitebox
│   ├── alert.helper.js      # alert/confirm
│   └── auth.helper.js       # loginViaUI
└── white-box/
    ├── 01-routing/          # ProtectedRoute, main.jsx
    ├── 02-auth/             # Login.jsx branches
    ├── 03-api/              # api.js interceptors
    ├── 04-exam/             # ToeicMember MCQ + ExamResult
    ├── 05-admin/            # UploadModal (ADMIN)
    └── 06-landing/            # LandingPage navigate
```

## Chạy test

```bash
# Terminal 1 — FE
cd frontend && npm run dev

# Terminal 2 — BE
cd backend && uvicorn main:app --reload

# Terminal 3 — Tests
cd frontend
npm run test:white-box              # tất cả
npm run test:white-box:routing      # chỉ M01 (không cần BE)
npm run test:white-box:auth         # M02
npm run test:white-box:api          # M03
npm run test:white-box:exam         # M04 (cần đề trong DB)
npm run test:white-box:admin        # M05 (cần ADMIN env)
npm run test:white-box:landing      # M06
```

## Cấu hình

Sửa `test/helpers/test-env.js` hoặc set env:

```powershell
$env:TEST_MEMBER_EMAIL="email@example.com"
$env:TEST_MEMBER_PASSWORD="12345678"
$env:TEST_ADMIN_EMAIL="admin@example.com"
$env:TEST_ADMIN_PASSWORD="yourpass"
npm run test:white-box:admin
```

## Map test case ↔ source code

| TC_ID | File test | Source | Nhánh |
|-------|-----------|--------|-------|
| WB-M01-01 | 01-routing | ProtectedRoute L7-8 | !token → /auth |
| WB-M01-02 | 01-routing | ProtectedRoute L15 | role khớp |
| WB-M01-03 | 01-routing | ProtectedRoute L11-12 | ADMIN → /admin |
| WB-M01-04 | 01-routing | ProtectedRoute L11-12 | MEMBER → /member |
| WB-M02-01 | 02-auth | Login L63-66 | password < 8 |
| WB-M02-05 | 02-auth | Login L109-134 | login MEMBER |
| WB-M02-06 | 02-auth | Login L136-138 | alert login fail |
| WB-M01-07 | 03-api | api.js L10-12 | token saved |
| WB-M01-09 | 03-api | api.js L20-24 | 401 logout |
| WB-M03-01 | 04-exam | ToeicMember L548 | isMcqSkill Listening |
| WB-M03-02 | 04-exam | ToeicMember L548 | !isMcqSkill Writing |
| WB-M03-03 | 04-exam | ToeicMember L700-702 | confirm Cancel |
| WB-M04-02 | 04-exam | ExamResult L7-11 | statusBadge |
| WB-M05-01 | 06-landing | LandingPage L18 | /auth |
| WB-M05-02 | 06-landing | LandingPage L21 | ?mode=signup |

## Case tự skip

Một số test **in thông báo skip** (không fail) khi:
- Không có đề Listening/Writing trong DB
- Chưa cấu hình `TEST_ADMIN_EMAIL`

Đây là hành vi có chủ đích — ghi **Block** trong báo cáo coverage manual.
