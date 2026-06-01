/**
 * test/helpers/test-env.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cấu hình môi trường dùng chung cho black-box & white-box tests.
 *
 * Yêu cầu trước khi chạy:
 *   - FE: npm run dev  → http://localhost:5173
 *   - BE: uvicorn      → http://127.0.0.1:8000
 *
 * Có thể override bằng biến môi trường:
 *   TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD
 *   TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

export const TEST_MEMBER_EMAIL =
  process.env.TEST_MEMBER_EMAIL || 'trung8d2005@gmail.com';

export const TEST_MEMBER_PASSWORD =
  process.env.TEST_MEMBER_PASSWORD || '12345678';

export const TEST_ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || '';
export const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';

export const hasAdminCredentials = () =>
  Boolean(TEST_ADMIN_EMAIL && TEST_ADMIN_PASSWORD);
