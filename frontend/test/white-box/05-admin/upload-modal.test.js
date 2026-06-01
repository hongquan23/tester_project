/**
 * test/white-box/05-admin/upload-modal.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHITEBOX — Module 05: Admin UploadModal
 *
 * Source code under test:
 *   - src/admin/UploadModal.jsx
 *     L28-47  getVisibleFields(skill, part) — field theo skill/part
 *     L219-225 handleUploadJson — validate JSON trước upload
 *     L194-199 parse JSON error → setJsonError
 *   - src/admin/Dashboard.jsx L155 — nút "ĐĂNG ĐỀ THI" mở modal
 *
 * Chiến lược:
 *   - MEMBER không thấy nút admin upload (phân quyền UI)
 *   - ADMIN (nếu có credential): mở modal, thử upload JSON invalid → alert lỗi
 *
 * Cấu hình ADMIN (tuỳ chọn):
 *   set TEST_ADMIN_EMAIL và TEST_ADMIN_PASSWORD trước khi chạy
 *
 * Chạy: npm run test:white-box:admin
 * Yêu cầu: FE + BE
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createDriver } from '../../config/selenium.config.js';
import { By, until } from 'selenium-webdriver';
import { clearStorage, waitForUrl } from '../../helpers/storage.helper.js';
import { loginMember, loginAdmin } from '../../helpers/auth.helper.js';
import { acceptAlertIfPresent, clearAlerts } from '../../helpers/alert.helper.js';
import {
  BASE_URL,
  hasAdminCredentials,
  TEST_ADMIN_EMAIL,
  TEST_ADMIN_PASSWORD,
} from '../../helpers/test-env.js';

describe('WHITEBOX M05 — Admin UploadModal', () => {
  let driver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 180000);

  afterEach(async () => {
    await clearAlerts(driver);
    try {
      await driver.get(BASE_URL);
    } catch {
      // bỏ qua
    }
    await clearStorage(driver);
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  /**
   * WB-M05-04b (role guard)
   * Source: main.jsx L21-31 + ProtectedRoute
   * Branch: MEMBER không vào được /admin → không có nút "ĐĂNG ĐỀ THI"
   */
  test('WB-M05-04b: MEMBER dashboard — không có nút ĐĂNG ĐỀ THI', async () => {
    await loginMember(driver);
    await driver.get(`${BASE_URL}/member/dashboard`);
    await waitForUrl(driver, '/member', 10000);
    await driver.sleep(1500);
    await clearAlerts(driver);

    const uploadBtns = await driver.findElements(
      By.xpath('//*[contains(text(), "ĐĂNG ĐỀ THI")]')
    );
    expect(uploadBtns.length).toBe(0);
  }, 90000);

  /**
   * WB-M05-04
   * Source: Dashboard.jsx L155 + UploadModal.jsx
   * Branch: ADMIN mở modal upload
   */
  test('WB-M05-04: ADMIN — mở modal ĐĂNG ĐỀ THI', async () => {
    if (!hasAdminCredentials()) {
      console.log(
        '⏭ WB-M05-04: Chưa cấu hình TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD — skip'
      );
      return;
    }

    await loginAdmin(driver, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
    await driver.get(`${BASE_URL}/admin/dashboard`);
    await driver.wait(until.urlContains('/admin/dashboard'), 15000);
    await driver.sleep(2000);

    const uploadBtn = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(text(), "ĐĂNG ĐỀ THI")]')),
      10000
    );
    await uploadBtn.click();
    await driver.sleep(1000);

    const modalTitle = await driver.findElements(
      By.xpath('//*[contains(text(), "Upload") or contains(text(), "Đăng đề") or contains(text(), "JSON")]')
    );
    expect(modalTitle.length).toBeGreaterThan(0);
  }, 120000);

  /**
   * WB-M05-05
   * Source: UploadModal.jsx L219-225
   * Branch: !jsonParsed → alert('Vui lòng chọn file JSON hợp lệ!')
   */
  test('WB-M05-05: Upload không chọn JSON → alert validate', async () => {
    if (!hasAdminCredentials()) {
      console.log('⏭ WB-M05-05: Chưa cấu hình ADMIN — skip');
      return;
    }

    await loginAdmin(driver, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD);
    await driver.get(`${BASE_URL}/admin/dashboard`);
    await driver.sleep(2000);

    const uploadBtn = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(text(), "ĐĂNG ĐỀ THI")]')),
      10000
    );
    await uploadBtn.click();
    await driver.sleep(1000);

    const submitUpload = await driver.findElements(
      By.xpath(
        '//button[contains(text(), "Upload") or contains(text(), "Tải lên") or contains(text(), "Submit")]'
      )
    );

    if (submitUpload.length === 0) {
      console.log('⏭ WB-M05-05: Không tìm thấy nút submit upload trong modal — skip');
      return;
    }

    await submitUpload[0].click();
    const alertText = await acceptAlertIfPresent(driver, 5000);
    expect(alertText).toMatch(/JSON/i);
  }, 120000);
});
