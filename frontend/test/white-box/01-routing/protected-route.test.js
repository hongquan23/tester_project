/**
 * test/white-box/01-routing/protected-route.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHITEBOX — Module 01: Routing & ProtectedRoute
 *
 * Source code under test:
 *   - src/auth/ProtectedRoute.jsx  (L7-15)
 *   - src/main.jsx                 (L21-31)
 *
 * Chiến lược white-box:
 *   Thao tác localStorage trực tiếp (executeScript) để ép từng nhánh if/else
 *   mà không cần login thật qua API.
 *
 * Chạy: npm run test:white-box:routing
 * Yêu cầu: Chỉ cần FE đang chạy (npm run dev)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createDriver } from '../../config/selenium.config.js';
import { clearStorage, setSession, waitForUrl } from '../../helpers/storage.helper.js';
import { clearAlerts } from '../../helpers/alert.helper.js';
import { loginMember, loginAdmin } from '../../helpers/auth.helper.js';
import {
  BASE_URL,
  hasAdminCredentials,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
} from '../../helpers/test-env.js';

describe('WHITEBOX M01 — ProtectedRoute & Routing', () => {
  let driver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 180000);

  afterEach(async () => {
    await clearStorage(driver);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  /**
   * WB-M01-01
   * Source: ProtectedRoute.jsx L7-8
   * Branch: if (!token) → Navigate /auth
   */
  test('WB-M01-01: Không có token → redirect /auth', async () => {
    await driver.get(BASE_URL);
    await clearStorage(driver);
    await driver.get(`${BASE_URL}/member/dashboard`);
    const url = await waitForUrl(driver, '/auth', 10000);
    expect(url).toContain('/auth');
  }, 60000);

  /**
   * WB-M01-02
   * Source: ProtectedRoute.jsx L15
   * Branch: token OK + role === requiredRole → render children
   * Dùng login THẬT: token giả sẽ bị api.js (401) tự logout về /auth,
   * nên muốn kiểm tra nhánh "cho vào portal" phải có session hợp lệ.
   */
  test('WB-M01-02: Token + role MEMBER → vào /member/dashboard', async () => {
    await loginMember(driver);
    await clearAlerts(driver);
    await driver.get(`${BASE_URL}/member/dashboard`);
    const url = await waitForUrl(driver, '/member', 10000);
    expect(url).toContain('/member');
  }, 90000);

  /**
   * WB-M01-03
   * Source: ProtectedRoute.jsx L11-12 (role === "ADMIN" ? "/admin" : "/member")
   * Branch: ADMIN truy cập route MEMBER → redirect /admin
   */
  test('WB-M01-03: ADMIN vào /member → redirect /admin', async () => {
    await setSession(driver, { token: 'fake-token', role: 'ADMIN', userId: '1' });
    await driver.get(`${BASE_URL}/member/dashboard`);
    const url = await waitForUrl(driver, /\/admin/, 10000);
    expect(url).toMatch(/\/admin/);
  }, 60000);

  /**
   * WB-M01-04
   * Source: ProtectedRoute.jsx L11-12
   * Branch: MEMBER truy cập route ADMIN → redirect /member
   */
  test('WB-M01-04: MEMBER vào /admin → redirect /member', async () => {
    // Login THẬT: đích /member cần token hợp lệ để không bị api.js 401 đá về /auth.
    await loginMember(driver);
    await clearAlerts(driver);
    await driver.get(`${BASE_URL}/admin/dashboard`);
    const url = await waitForUrl(driver, /\/member/, 10000);
    expect(url).toMatch(/\/member/);
  }, 90000);

  /**
   * WB-M01-05
   * Source: main.jsx L21-24
   * Branch: /member/* bọc ProtectedRoute requiredRole="MEMBER"
   */
  test('WB-M01-05: Route /member load portal member (URL giữ /member)', async () => {
    await loginMember(driver);
    await clearAlerts(driver);
    await driver.get(`${BASE_URL}/member`);
    const url = await waitForUrl(driver, /\/member/, 10000);
    expect(url).toMatch(/\/member/);
  }, 90000);

  /**
   * WB-M01-06
   * Source: main.jsx L28-31
   * Branch: /admin/* bọc ProtectedRoute requiredRole="ADMIN"
   */
  test('WB-M01-06: Route /admin load portal admin (URL giữ /admin)', async () => {
    if (!hasAdminCredentials()) {
      console.log('⏭ WB-M01-06: Chưa cấu hình TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD — skip');
      return;
    }
    await loginAdmin(driver, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
    await clearAlerts(driver);
    await driver.get(`${BASE_URL}/admin`);
    const url = await waitForUrl(driver, /\/admin/, 10000);
    expect(url).toMatch(/\/admin/);
  }, 90000);
});
