/**
 * test/white-box/04-exam/mcq-submit.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHITEBOX — Module 04a: MCQ exam logic (ToeicMember)
 *
 * Source code under test:
 *   - src/member/ToeicMember.jsx
 *     L548     isMcqSkill — skill === 'Listening' || 'Reading'
 *     L696-703 handleSubmitExam — guard !isMcqSkill, confirm thiếu câu
 *     L1731    render — nút "Nộp bài" chỉ hiện khi isMcqSkill && !isTimeUp
 *
 * Chiến lược:
 *   - Writing: verify KHÔNG có nút nộp MCQ cả bài (nhánh isMcqSkill false)
 *   - Listening: nếu có đề trong DB → vào exam → verify nút "Nộp bài"
 *   - Confirm dialog khi nộp thiếu câu (dismiss → vẫn ở /member/exam)
 *
 * Chạy: npm run test:white-box:exam
 * Yêu cầu: FE + BE + ít nhất 1 đề Listening (case có đề) hoặc skip tự nhiên
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createDriver } from '../../config/selenium.config.js';
import { By } from 'selenium-webdriver';
import { clearStorage, waitForUrl, safeGetUrl } from '../../helpers/storage.helper.js';
import { loginMember } from '../../helpers/auth.helper.js';
import { dismissAlertIfPresent, clearAlerts } from '../../helpers/alert.helper.js';
import { BASE_URL } from '../../helpers/test-env.js';

describe('WHITEBOX M04a — MCQ submit (ToeicMember)', () => {
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
   * WB-M03-02
   * Source: ToeicMember.jsx L548, L1731
   * Branch: isMcqSkill('Writing') === false → không render nút "Nộp bài" MCQ
   */
  test('WB-M03-02: Writing exam — không có nút Nộp bài MCQ', async () => {
    await loginMember(driver);
    await driver.get(`${BASE_URL}/member/writing`);
    await waitForUrl(driver, '/member/writing', 10000);
    await driver.sleep(2000);
    await clearAlerts(driver); // bỏ alert "Không thể tải dữ liệu" nếu có

    const startButtons = await driver.findElements(
      By.xpath('//button[contains(text(), "Bắt đầu thi")]')
    );

    if (startButtons.length === 0) {
      console.log('⏭ WB-M03-02: Không có đề Writing — skip phần vào exam');
      return;
    }

    await startButtons[0].click();
    await waitForUrl(driver, '/member/exam', 10000);
    await clearAlerts(driver);

    const submitButtons = await driver.findElements(
      By.xpath('//button[contains(text(), "Nộp bài")]')
    );
    expect(submitButtons.length).toBe(0);
  }, 120000);

  /**
   * WB-M03-01
   * Source: ToeicMember.jsx L548, L1731
   * Branch: isMcqSkill('Listening') === true → có nút "Nộp bài"
   */
  test('WB-M03-01: Listening exam — có nút Nộp bài MCQ', async () => {
    await loginMember(driver);
    await driver.get(`${BASE_URL}/member/listening`);
    await waitForUrl(driver, '/member/listening', 10000);
    await driver.sleep(2000);
    await clearAlerts(driver);

    const startButtons = await driver.findElements(
      By.xpath('//button[contains(text(), "Bắt đầu thi")]')
    );

    if (startButtons.length === 0) {
      console.log('⏭ WB-M03-01: Không có đề Listening trong DB — cần upload đề trước');
      return;
    }

    await startButtons[0].click();
    await waitForUrl(driver, '/member/exam', 10000);
    await clearAlerts(driver);

    const submitButtons = await driver.findElements(
      By.xpath('//button[contains(text(), "Nộp bài")]')
    );
    expect(submitButtons.length).toBeGreaterThan(0);
    expect(await submitButtons[0].isDisplayed()).toBe(true);
  }, 120000);

  /**
   * WB-M03-03
   * Source: ToeicMember.jsx L700-702
   * Branch: answeredCount < total && confirm Cancel → return, không nộp
   */
  test('WB-M03-03: Nộp thiếu câu → Cancel confirm → vẫn ở exam', async () => {
    await loginMember(driver);
    await driver.get(`${BASE_URL}/member/listening`);
    await driver.sleep(2000);
    await clearAlerts(driver);

    const startButtons = await driver.findElements(
      By.xpath('//button[contains(text(), "Bắt đầu thi")]')
    );
    if (startButtons.length === 0) {
      console.log('⏭ WB-M03-03: Không có đề Listening — skip');
      return;
    }

    await startButtons[0].click();
    await waitForUrl(driver, '/member/exam', 10000);
    await clearAlerts(driver);

    const submitBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Nộp bài")]')
    );
    await submitBtn.click();

    const confirmText = await dismissAlertIfPresent(driver, 5000);
    expect(confirmText).toMatch(/chưa trả lời/i);
    expect(await safeGetUrl(driver)).toContain('/member/exam');
  }, 120000);
});
