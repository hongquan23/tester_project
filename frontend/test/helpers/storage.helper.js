/**
 * test/helpers/storage.helper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper white-box: thao tác localStorage / sessionStorage qua Selenium.
 *
 * Dùng để ép các nhánh logic trong:
 *   - auth/ProtectedRoute.jsx  (token, role)
 *   - src/api.js               (access_token interceptor)
 *   - member/ToeicMember.jsx   (handleLogout L593-601)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BASE_URL } from './test-env.js';
import { clearAlerts } from './alert.helper.js';

export async function clearStorage(driver) {
  try {
    await clearAlerts(driver); // đóng alert đang treo trước khi chạy script
    await driver.executeScript('localStorage.clear(); sessionStorage.clear();');
  } catch {
    // FE chưa chạy hoặc trang chưa load — bỏ qua khi cleanup
  }
}

export async function setSession(driver, { token, role, userId } = {}) {
  // Mở trang landing trước (không gọi API → không bị alert "Không thể tải dữ liệu"),
  // bảo đảm localStorage được set đúng origin trước khi điều hướng vào portal.
  await driver.get(BASE_URL);
  await clearAlerts(driver);
  await driver.executeScript(
    (t, r, u) => {
      if (t != null) localStorage.setItem('access_token', t);
      if (r != null) localStorage.setItem('role', r);
      if (u != null) localStorage.setItem('user_id', String(u));
    },
    token ?? 'fake-jwt-token-for-whitebox',
    role ?? 'MEMBER',
    userId ?? '1'
  );
}

/**
 * Đọc URL hiện tại nhưng chịu lỗi: nếu có alert chặn (UnexpectedAlertOpenError,
 * alert sẽ tự bị dismiss) hoặc trang đang điều hướng → thử lại vài lần.
 */
export async function safeGetUrl(driver, attempts = 6) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await driver.getCurrentUrl();
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  return '';
}

/**
 * Chờ URL khớp matcher (RegExp hoặc chuỗi con), bỏ qua alert chặn.
 * Trả về URL cuối cùng đọc được (kể cả khi không khớp) để test tự assert.
 */
export async function waitForUrl(driver, matcher, timeoutMs = 12000) {
  const end = Date.now() + timeoutMs;
  const test = (u) =>
    matcher instanceof RegExp ? matcher.test(u) : u.includes(matcher);
  let url = '';
  while (Date.now() < end) {
    url = await safeGetUrl(driver);
    if (url && test(url)) return url;
    await new Promise((r) => setTimeout(r, 250));
  }
  return url;
}

export async function getLocalStorage(driver, key) {
  return driver.executeScript((k) => localStorage.getItem(k), key);
}

export async function getAllSessionKeys(driver) {
  return driver.executeScript(() => ({
    access_token: localStorage.getItem('access_token'),
    role: localStorage.getItem('role'),
    user_id: localStorage.getItem('user_id'),
  }));
}
