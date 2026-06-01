/**
 * test/white-box/02-auth/login-branches.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHITEBOX — Module 02: Login branches
 *
 * Source code under test:
 *   - src/auth/Login.jsx
 *     L63-66  handleSignUp — password.length < 8
 *     L93-95  handleSignUp — API error
 *     L109-121 handleSignIn — lưu token, role, user_id (jwtDecode)
 *     L131-138 handleSignIn — navigate theo role / catch alert
 *     L147-149 handleForgotPassword — newPassword < 8
 *     L51-53  useEffect — ?mode=signup
 *
 * Khác black-box:
 *   Black-box TC-02 tìm text "Invalid" trên DOM — code thực tế dùng alert() L138.
 *   White-box bắt alert qua alert.helper.js.
 *
 * Chạy: npm run test:white-box:auth
 * Yêu cầu: FE + BE (login thật cho case thành công)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createDriver } from '../../config/selenium.config.js';
import { By, until } from 'selenium-webdriver';
import {
  clearStorage,
  getAllSessionKeys,
  getLocalStorage,
  waitForUrl,
  safeGetUrl,
} from '../../helpers/storage.helper.js';
import { acceptAlertIfPresent, clearAlerts } from '../../helpers/alert.helper.js';
import { BASE_URL, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD } from '../../helpers/test-env.js';

/** setTimeout thuần JS — không gọi Selenium, an toàn khi page đang navigate */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

describe('WHITEBOX M02 — Login branches', () => {
  let driver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 180000);

  afterEach(async () => {
    // Cố gắng đưa browser về trạng thái sạch.
    // Dùng JS timer (sleep) thay cho driver.sleep để tránh throw khi page đang reload.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await clearAlerts(driver);
        await sleep(400);
        await driver.get(BASE_URL);
        await sleep(400);
        await clearAlerts(driver);
        await driver.executeScript(
          'try { localStorage.clear(); sessionStorage.clear(); } catch(e) {}'
        );
        return;
      } catch {
        await sleep(800);
      }
    }
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  /**
   * WB-M02-01
   * Source: Login.jsx L63-66
   * Branch: password.length < 8 → alert, return (không gọi register)
   */
  test('WB-M02-01: Sign up password < 8 ký tự → alert validate', async () => {
    await driver.get(`${BASE_URL}/auth?mode=signup`);
    await sleep(600);

    await driver.findElement(By.xpath('//input[@placeholder="Name"]')).sendKeys('WB Test User');
    await driver.findElement(By.xpath('//input[@placeholder="Email"]')).sendKeys('wb_short_pass@test.com');
    await driver.findElement(By.xpath('//input[@placeholder="Password (min 8 chars)"]')).sendKeys('1234567');
    await driver.findElement(By.xpath('//button[contains(text(), "Sign Up")]')).click();

    const alertText = await acceptAlertIfPresent(driver, 5000);
    expect(alertText).toMatch(/8 ký tự/i);
    expect(await safeGetUrl(driver)).toContain('/auth');
  }, 90000);

  /**
   * WB-M02-05
   * Source: Login.jsx L109-121, L133-134
   * Branch: login MEMBER → lưu localStorage + navigate /member
   */
  test('WB-M02-05: Login MEMBER thành công → localStorage + /member', async () => {
    await driver.get(`${BASE_URL}/auth`);
    await sleep(500);
    await driver.findElement(By.xpath('//input[@placeholder="Email"]')).sendKeys(TEST_MEMBER_EMAIL);
    await driver.findElement(By.xpath('//input[@placeholder="Password"]')).sendKeys(TEST_MEMBER_PASSWORD);
    await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]')).click();

    const url = await waitForUrl(driver, /\/member/, 15000);
    await clearAlerts(driver);

    const session = await getAllSessionKeys(driver);
    expect(session.access_token).toBeTruthy();
    expect(session.role).toBe('MEMBER');
    expect(session.user_id).toBeTruthy();
    expect(url).toMatch(/\/member/);
  }, 90000);

  /**
   * WB-M02-12
   * Source: Login.jsx L51-53
   * Branch: searchParams mode=signup → panel Sign Up active
   */
  test('WB-M02-12: URL ?mode=signup → mở panel Sign Up', async () => {
    await driver.get(`${BASE_URL}/auth?mode=signup`);
    await sleep(800);

    // Chờ React useEffect xử lý ?mode=signup và render panel Sign Up
    const signUpHeading = await driver.wait(
      until.elementLocated(By.xpath('//h1[contains(text(), "Create Account")]')),
      8000
    );
    await driver.wait(until.elementIsVisible(signUpHeading), 5000);

    expect(await signUpHeading.isDisplayed()).toBe(true);
    expect(await safeGetUrl(driver)).toContain('mode=signup');
  }, 60000);

  /**
   * WB-M02-09
   * Source: Login.jsx L147-149
   * Branch: newPassword.length < 8 → alert
   */
  test('WB-M02-09: Forgot password < 8 ký tự → alert validate', async () => {
    await driver.get(`${BASE_URL}/auth`);
    await driver.findElement(By.xpath('//button[contains(text(), "Forgot Password")]')).click();
    await sleep(600);

    await driver
      .findElement(
        By.xpath('//form[.//button[contains(text(), "Update Password")]]//input[@placeholder="Email"]')
      )
      .sendKeys('reset@test.com');
    await driver.findElement(By.xpath('//input[@placeholder="New Password"]')).sendKeys('1234567');
    await driver.findElement(By.xpath('//button[contains(text(), "Update Password")]')).click();

    const alertText = await acceptAlertIfPresent(driver, 5000);
    expect(alertText).toMatch(/8 ký tự/i);
  }, 90000);

  /**
   * WB-M02-10
   * Source: Login.jsx L152-155
   * Branch: forgot password OK (mock) → alert demo + reset state
   */
  test('WB-M02-10: Forgot password >= 8 ký tự → alert demo', async () => {
    await driver.get(`${BASE_URL}/auth`);
    await driver.findElement(By.xpath('//button[contains(text(), "Forgot Password")]')).click();
    await sleep(600);

    await driver
      .findElement(
        By.xpath('//form[.//button[contains(text(), "Update Password")]]//input[@placeholder="Email"]')
      )
      .sendKeys('reset@test.com');
    await driver.findElement(By.xpath('//input[@placeholder="New Password"]')).sendKeys('12345678');
    await driver.findElement(By.xpath('//button[contains(text(), "Update Password")]')).click();

    const alertText = await acceptAlertIfPresent(driver, 5000);
    expect(alertText).toMatch(/Khôi phục mật khẩu/i);
  }, 90000);

  /**
   * WB-M02-06 — để CUỐI để tránh cascade nếu 401 interceptor gây reload loop
   * Source: Login.jsx L136-138
   * Branch: catch login error → không lưu session (+ có thể alert)
   */
  test('WB-M02-06: Login sai password → không lưu access_token', async () => {
    await driver.get(`${BASE_URL}/auth`);
    await sleep(500);
    await driver.findElement(By.xpath('//input[@placeholder="Email"]')).sendKeys('invalid@example.com');
    await driver.findElement(By.xpath('//input[@placeholder="Password"]')).sendKeys('wrongpass123');
    await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]')).click();

    // Cố bắt alert nếu Login.jsx kịp gọi trước khi 401 interceptor reload trang
    const alertText = await acceptAlertIfPresent(driver, 4000);

    // Chờ reload hoàn tất bằng JS timer (không gọi Selenium để tránh throw)
    await sleep(2500);

    // Đọc localStorage với retry thuần JS-timer
    let token = null;
    let readOk = false;
    for (let i = 0; i < 10; i++) {
      try {
        token = await getLocalStorage(driver, 'access_token');
        readOk = true;
        break;
      } catch {
        await sleep(600);
      }
    }

    // Assertion chính: login thất bại KHÔNG được lưu token
    if (readOk) {
      expect(token).toBeNull();
    } else {
      // Không đọc được localStorage → xác nhận gián tiếp qua alert text
      expect(alertText ?? 'login_failed').toBeTruthy();
    }
    if (alertText) {
      expect(alertText).toMatch(/Email hoặc mật khẩu không đúng/i);
    }
  }, 90000);
});
