/**
 * test/helpers/auth.helper.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper đăng nhập qua UI — tái sử dụng cho các test cần session thật.
 *
 * Map source: auth/Login.jsx handleSignIn L101-135
 *   - L109-110: lưu access_token, role vào localStorage
 *   - L118-121: jwtDecode → user_id
 *   - L131-134: navigate /admin hoặc /member
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { By, until } from 'selenium-webdriver';
import { BASE_URL, TEST_MEMBER_EMAIL, TEST_MEMBER_PASSWORD } from './test-env.js';

export async function loginViaUI(
  driver,
  email = TEST_MEMBER_EMAIL,
  password = TEST_MEMBER_PASSWORD
) {
  await driver.get(`${BASE_URL}/auth`);
  await driver.findElement(By.xpath('//input[@placeholder="Email"]')).clear();
  await driver.findElement(By.xpath('//input[@placeholder="Email"]')).sendKeys(email);
  await driver.findElement(By.xpath('//input[@placeholder="Password"]')).clear();
  await driver.findElement(By.xpath('//input[@placeholder="Password"]')).sendKeys(password);
  await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]')).click();
}

export async function loginMember(driver) {
  await loginViaUI(driver);
  await driver.wait(until.urlMatches(/\/member/), 15000);
}

export async function loginAdmin(driver, email, password) {
  await loginViaUI(driver, email, password);
  await driver.wait(until.urlMatches(/\/admin/), 15000);
}
