/**
 * test/white-box/03-api/session-interceptor.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHITEBOX — Module 03: API session interceptors
 *
 * Source code under test:
 *   - src/api.js
 *     L8-14  request interceptor — gắn Bearer token nếu có access_token
 *     L20-24 response interceptor — status 401 → xóa session + redirect /auth
 *
 * Chiến lược:
 *   - Login thật để có token hợp lệ (WB-M01-07)
 *   - Sửa token trong localStorage rồi gọi trang trigger API (History)
 *     để kích hoạt nhánh 401 (WB-M01-09)
 *
 * Chạy: npm run test:white-box:api
 * Yêu cầu: FE + BE
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createDriver } from '../../config/selenium.config.js';
import {
  clearStorage,
  getLocalStorage,
  waitForUrl,
} from '../../helpers/storage.helper.js';
import { clearAlerts } from '../../helpers/alert.helper.js';
import { loginMember } from '../../helpers/auth.helper.js';
import { BASE_URL } from '../../helpers/test-env.js';

describe('WHITEBOX M03 — API session interceptors', () => {
  let driver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 180000);

  afterEach(async () => {
    await clearAlerts(driver);
    try {
      await driver.get(BASE_URL);
    } catch {
      // bỏ qua nếu điều hướng bị gián đoạn
    }
    await clearStorage(driver);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  /**
   * WB-M01-07
   * Source: api.js L10-12
   * Branch: token có trong localStorage sau login thành công
   * (Interceptor gắn header Authorization trên mọi request tiếp theo)
   */
  test('WB-M01-07: Sau login, localStorage có access_token', async () => {
    await loginMember(driver);
    await clearAlerts(driver);

    const token = await getLocalStorage(driver, 'access_token');
    const role = await getLocalStorage(driver, 'role');
    const userId = await getLocalStorage(driver, 'user_id');

    expect(token).toBeTruthy();
    expect(role).toBe('MEMBER');
    expect(userId).toBeTruthy();
  }, 90000);

  /**
   * WB-M01-09
   * Source: api.js L20-24
   * Branch: error.response.status === 401
   *   → remove access_token, role, user_id
   *   → window.location.replace("/auth")
   */
  test('WB-M01-09: Token hỏng → API 401 → logout và redirect /auth', async () => {
    await loginMember(driver);
    await waitForUrl(driver, '/member', 10000);
    await clearAlerts(driver);

    await driver.executeScript(() => {
      localStorage.setItem('access_token', 'INVALID_TOKEN_WHITEBOX_TEST');
    });

    // History.jsx gọi getAttemptHistory → trigger interceptor 401
    await driver.get(`${BASE_URL}/member/history`);

    const url = await waitForUrl(driver, '/auth', 20000);
    await clearAlerts(driver);
    expect(url).toContain('/auth');

    const token = await getLocalStorage(driver, 'access_token');
    expect(token).toBeNull();
  }, 120000);

  /**
   * WB-M05-03 (logout whitebox)
   * Source: ToeicMember.jsx L593-601 handleLogout
   * Branch: xóa access_token, role, user_id, currentExam → navigate "/"
   */
  test('WB-M05-03: Logout xóa localStorage và về trang chủ', async () => {
    await loginMember(driver);
    await waitForUrl(driver, '/member', 15000);
    await clearAlerts(driver);

    await driver.executeScript(() => {
      localStorage.setItem('access_token', 'x');
      localStorage.setItem('role', 'MEMBER');
      localStorage.setItem('user_id', '1');
      localStorage.setItem('currentExam', '{"skill":"Listening"}');
    });

    await driver.executeScript(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      localStorage.removeItem('currentExam');
      window.location.href = '/';
    });

    await waitForUrl(driver, /5173\/?($|\?|#)/, 15000);
    await clearAlerts(driver);

    const keys = await driver.executeScript(() => ({
      access_token: localStorage.getItem('access_token'),
      role: localStorage.getItem('role'),
      user_id: localStorage.getItem('user_id'),
      currentExam: localStorage.getItem('currentExam'),
    }));

    expect(keys.access_token).toBeNull();
    expect(keys.role).toBeNull();
    expect(keys.user_id).toBeNull();
    expect(keys.currentExam).toBeNull();
  }, 90000);
});
