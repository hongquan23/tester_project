/**
 * test/white-box/06-landing/landing-nav.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHITEBOX — Module 06: Landing navigation
 *
 * Source code under test:
 *   - src/landing/LandingPage.jsx
 *     L18: navigate("/auth")        — nút Đăng nhập
 *     L21: navigate("/auth?mode=signup") — nút Đăng ký miễn phí
 *
 * Chạy: npm run test:white-box:landing
 * Yêu cầu: Chỉ cần FE (npm run dev)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createDriver } from '../../config/selenium.config.js';
import { By, until } from 'selenium-webdriver';
import { clearStorage } from '../../helpers/storage.helper.js';
import { BASE_URL } from '../../helpers/test-env.js';

describe('WHITEBOX M06 — Landing navigation', () => {
  let driver;

  beforeAll(async () => {
    driver = await createDriver();
  }, 180000);

  afterEach(async () => clearStorage(driver));

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  /**
   * WB-M05-01
   * Source: LandingPage.jsx L18
   * Branch: onClick → navigate("/auth")
   */
  test('WB-M05-01: Nút Đăng nhập → /auth', async () => {
    await driver.get(BASE_URL);
    await driver.findElement(By.xpath('//button[contains(text(), "Đăng nhập")]')).click();
    await driver.wait(until.urlContains('/auth'), 5000);
    expect(await driver.getCurrentUrl()).toContain('/auth');
  }, 60000);

  /**
   * WB-M05-02
   * Source: LandingPage.jsx L21
   * Branch: onClick → navigate("/auth?mode=signup")
   */
  test('WB-M05-02: Nút Đăng ký miễn phí → /auth?mode=signup', async () => {
    await driver.get(BASE_URL);
    await driver.findElement(By.xpath('//button[contains(text(), "Đăng ký")]')).click();
    await driver.wait(until.urlContains('mode=signup'), 5000);
    expect(await driver.getCurrentUrl()).toContain('mode=signup');
  }, 60000);
});
