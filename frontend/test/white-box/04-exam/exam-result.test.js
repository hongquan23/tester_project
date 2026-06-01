/**
 * test/white-box/04-exam/exam-result.test.js
 * ─────────────────────────────────────────────────────────────────────────────
 * WHITEBOX — Module 04b: ExamResult display
 *
 * Source code under test:
 *   - src/admin/ExamResult.jsx (dùng chung Admin + Member)
 *     L7-11  statusBadge(item):
 *            is_correct     → "Đúng"
 *            user_ans (sai) → "Sai"
 *            else           → "Bỏ qua"
 *     L14    if (!result) return null
 *
 * Chiến lược:
 *   Login → làm đề Listening MCQ → chọn 1 đáp án → nộp bài (confirm OK)
 *   → kiểm tra trang kết quả có badge trạng thái
 *
 * Chạy: npm run test:white-box:exam
 * Yêu cầu: FE + BE + đề Listening có câu hỏi
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createDriver } from '../../config/selenium.config.js';
import { By } from 'selenium-webdriver';
import { clearStorage, waitForUrl } from '../../helpers/storage.helper.js';
import { loginMember } from '../../helpers/auth.helper.js';
import { acceptAlertIfPresent, clearAlerts } from '../../helpers/alert.helper.js';
import { BASE_URL } from '../../helpers/test-env.js';

describe('WHITEBOX M04b — ExamResult (statusBadge)', () => {
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
   * WB-M04-02 / WB-M04-03 / WB-M04-04
   * Source: ExamResult.jsx L7-11 statusBadge
   * Sau nộp bài MCQ, trang kết quả phải hiển thị ít nhất một trong: Đúng / Sai / Bỏ qua
   */
  test('WB-M04-02: Sau nộp MCQ — hiển thị badge Đúng/Sai/Bỏ qua', async () => {
    await loginMember(driver);
    await driver.get(`${BASE_URL}/member/listening`);
    await driver.sleep(2000);
    await clearAlerts(driver);

    const startButtons = await driver.findElements(
      By.xpath('//button[contains(text(), "Bắt đầu thi")]')
    );
    if (startButtons.length === 0) {
      console.log('⏭ WB-M04-02: Không có đề Listening — skip');
      return;
    }

    await startButtons[0].click();
    await waitForUrl(driver, '/member/exam', 10000);
    await driver.sleep(1500);
    await clearAlerts(driver);

    // Chọn đáp án A cho câu đầu (nếu có option)
    const optionA = await driver.findElements(
      By.xpath('//*[contains(text(), "A") or contains(@class, "questionNumber")]/..')
    );
    const mcqOptions = await driver.findElements(
      By.xpath('//div[contains(@style, "cursor") and .//span[text()="A"]]')
    );
    if (mcqOptions.length > 0) {
      await mcqOptions[0].click();
    }

    const submitBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Nộp bài")]')
    );
    await submitBtn.click();
    await acceptAlertIfPresent(driver, 5000);

    await driver.sleep(3000);

    const pageSource = await driver.getPageSource();
    const hasBadge =
      pageSource.includes('Đúng') ||
      pageSource.includes('Sai') ||
      pageSource.includes('Bỏ qua');

    expect(hasBadge).toBe(true);
  }, 180000);

  /**
   * WB-M04-06
   * Source: ExamResult.jsx onRetry prop
   * Branch: nút "Làm lại" / retry reset exam
   */
  test('WB-M04-06: Trang kết quả có nút quay lại / làm lại', async () => {
    await loginMember(driver);
    await driver.get(`${BASE_URL}/member/listening`);
    await driver.sleep(2000);
    await clearAlerts(driver);

    const startButtons = await driver.findElements(
      By.xpath('//button[contains(text(), "Bắt đầu thi")]')
    );
    if (startButtons.length === 0) {
      console.log('⏭ WB-M04-06: Không có đề — skip');
      return;
    }

    await startButtons[0].click();
    await waitForUrl(driver, '/member/exam', 10000);
    await clearAlerts(driver);

    const submitBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Nộp bài")]')
    );
    await submitBtn.click();
    await acceptAlertIfPresent(driver, 5000);
    await driver.sleep(3000);

    const retryOrBack = await driver.findElements(
      By.xpath(
        '//*[contains(text(), "Làm lại") or contains(text(), "Quay lại") or contains(text(), "Thoát")]'
      )
    );
    expect(retryOrBack.length).toBeGreaterThan(0);
  }, 180000);
});
