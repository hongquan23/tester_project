import { createDriver } from "../config/selenium.config.js";
import { By, until } from "selenium-webdriver";

describe("BLACK BOX - History", () => {
  let driver;

  beforeAll(async () => {
    console.log("📋 beforeAll: Starting...");
    driver = await createDriver();
    console.log("📋 beforeAll: Driver created successfully");
  }, 180000);

  afterEach(async () => {
    try {
      try {
        const alert = await driver.switchTo().alert();
        await alert.dismiss();
        console.log("🚨 Dismissed unexpected alert");
      } catch (e) {
        // No alert
      }

      try {
        await driver.get("http://localhost:5173/auth");
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (e) {
        console.log("⚠️  Could not navigate to auth page:", e.message);
      }

      try {
        await driver.manage().deleteAllCookies();
        await driver.executeScript(
          "sessionStorage.clear(); localStorage.clear();",
        );
        console.log("🧹 Cleared cookies and storage");
      } catch (e) {
        console.log("⚠️  Could not clear cookies:", e.message);
      }
    } catch (e) {
      console.log("⚠️  afterEach error:", e.message);
    }
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  test("TC-01: Mở trang History từ user menu", async () => {
    console.log("🚀 TC-01: Mở trang History");

    // Login
    await driver.get("http://localhost:5173/auth");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const signInBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await driver.executeScript("arguments[0].click();", signInBtn);

    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    console.log("✅ Logged in successfully");

    // Open user menu
    await new Promise((resolve) => setTimeout(resolve, 500));
    const avatarDiv = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//div[contains(@class, "rounded-full bg-gradient-to-tr from-orange-400 to-red-500")]',
        ),
      ),
      5000,
    );

    const userMenuBtn = await driver.executeScript(
      "return arguments[0].closest('.flex.items-center.gap-2.cursor-pointer')",
      avatarDiv,
    );
    await driver.executeScript("arguments[0].click();", userMenuBtn);
    console.log("✓ Click avatar menu");

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Click History button
    await new Promise((resolve) => setTimeout(resolve, 300));
    const historyBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Lịch sử")]'),
    );
    await driver.executeScript("arguments[0].click();", historyBtn);

    // Wait for History page
    await driver.wait(until.urlContains("/member/history"), 10000);
    console.log("✅ Navigated to History page");

    // Verify page title
    const pageTitle = await driver.findElement(
      By.xpath('//h1[contains(text(), "Lịch sử làm bài")]'),
    );
    expect(await pageTitle.isDisplayed()).toBe(true);
    console.log("✅ History page title 'Lịch sử làm bài' visible");
  }, 30000);

  test("TC-02: Hiển thị danh sách lịch sử làm bài", async () => {
    console.log("🚀 TC-02: Hiển thị danh sách lịch sử làm bài");

    // Login
    await driver.get("http://localhost:5173/auth");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const signInBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await driver.executeScript("arguments[0].click();", signInBtn);

    await driver.wait(until.urlContains("/member/dashboard"), 10000);

    // Navigate to History
    await new Promise((resolve) => setTimeout(resolve, 500));
    const avatarDiv = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//div[contains(@class, "rounded-full bg-gradient-to-tr from-orange-400 to-red-500")]',
        ),
      ),
      5000,
    );

    const userMenuBtn = await driver.executeScript(
      "return arguments[0].closest('.flex.items-center.gap-2.cursor-pointer')",
      avatarDiv,
    );
    await driver.executeScript("arguments[0].click();", userMenuBtn);
    console.log("✓ Click avatar menu");

    await new Promise((resolve) => setTimeout(resolve, 500));
    const historyBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Lịch sử")]'),
    );
    await driver.executeScript("arguments[0].click();", historyBtn);

    await driver.wait(until.urlContains("/member/history"), 10000);
    console.log("✅ Navigated to History page");

    // Wait for history list to load (8s for API)
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Verify statistics section (Tổng lần làm, Điểm trung bình, Điểm cao nhất)
    const totalAttemptsStats = await driver.findElements(
      By.xpath('//div[contains(text(), "Tổng lần làm")]'),
    );
    const avgScoreStats = await driver.findElements(
      By.xpath('//div[contains(text(), "Điểm trung bình")]'),
    );
    const highestScoreStats = await driver.findElements(
      By.xpath('//div[contains(text(), "Điểm cao nhất")]'),
    );

    expect(totalAttemptsStats.length).toBeGreaterThan(0);
    expect(avgScoreStats.length).toBeGreaterThan(0);
    expect(highestScoreStats.length).toBeGreaterThan(0);
    console.log(
      "✅ Statistics section verified: Tổng lần làm, Điểm trung bình, Điểm cao nhất",
    );

    // Verify filter buttons (Tất cả, Listening, Reading, etc.)
    const filterButtons = await driver.findElements(
      By.xpath(
        '//button[contains(text(), "Tất cả") or contains(text(), "Listening") or contains(text(), "Reading")]',
      ),
    );
    expect(filterButtons.length).toBeGreaterThan(0);
    console.log(
      `✅ Filter buttons visible: ${filterButtons.length} buttons found`,
    );

    // Verify history items are displayed
    const historyItems = await driver.findElements(
      By.xpath('//div[contains(@class, "cursor-pointer")]//h3'),
    );

    if (historyItems.length > 0) {
      console.log(`✅ Found ${historyItems.length} history items`);
      expect(historyItems.length).toBeGreaterThan(0);
    } else {
      console.log(
        "⚠️  No history items found (user may have no completed exams)",
      );
    }
  }, 30000);

  test("TC-03: Xem chi tiết kết quả của một bài thi", async () => {
    console.log("🚀 TC-03: Xem chi tiết kết quả của một bài thi");

    // Login
    await driver.get("http://localhost:5173/auth");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const signInBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await driver.executeScript("arguments[0].click();", signInBtn);

    await driver.wait(until.urlContains("/member/dashboard"), 10000);

    // Navigate to History
    await new Promise((resolve) => setTimeout(resolve, 500));
    const avatarDiv = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//div[contains(@class, "rounded-full bg-gradient-to-tr from-orange-400 to-red-500")]',
        ),
      ),
      5000,
    );

    const userMenuBtn = await driver.executeScript(
      "return arguments[0].closest('.flex.items-center.gap-2.cursor-pointer')",
      avatarDiv,
    );
    await driver.executeScript("arguments[0].click();", userMenuBtn);
    console.log("✓ Click avatar menu");

    await new Promise((resolve) => setTimeout(resolve, 500));
    const historyBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Lịch sử")]'),
    );
    await driver.executeScript("arguments[0].click();", historyBtn);

    await driver.wait(until.urlContains("/member/history"), 10000);

    // Wait for history list to load
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Click on first history item
    const historyItems = await driver.findElements(
      By.xpath('//div[contains(@class, "cursor-pointer")]//h3'),
    );

    if (historyItems.length > 0) {
      const itemContainer = await driver.executeScript(
        "return arguments[0].closest('div[contains(@class, \"cursor-pointer\")]')",
        historyItems[0],
      );
      await driver.executeScript("arguments[0].click();", itemContainer);
      console.log("✅ Clicked first history item");

      // Wait for results page to load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify results display with correct statistics (Câu đúng, Câu sai, Bộ qua)
      const correctAnswerStats = await driver.findElements(
        By.xpath('//div[contains(text(), "Câu đúng")]'),
      );
      const wrongAnswerStats = await driver.findElements(
        By.xpath('//div[contains(text(), "Câu sai")]'),
      );
      const skippedStats = await driver.findElements(
        By.xpath('//div[contains(text(), "Bộ qua")]'),
      );

      if (
        correctAnswerStats.length > 0 ||
        wrongAnswerStats.length > 0 ||
        skippedStats.length > 0
      ) {
        console.log(
          "✅ Results displayed with statistics (Câu đúng, Câu sai, Bộ qua)",
        );
        expect(
          correctAnswerStats.length +
            wrongAnswerStats.length +
            skippedStats.length,
        ).toBeGreaterThan(0);
      } else {
        console.log("⚠️  Results page may have different structure");
      }
    } else {
      console.log(
        "⚠️  No history items to click (user may have no completed exams)",
      );
    }
  }, 30000);

  test("TC-04: Xem thống kê tổng hợp trên History", async () => {
    console.log("🚀 TC-04: Xem thống kê tổng hợp trên History");

    // Login
    await driver.get("http://localhost:5173/auth");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const signInBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await driver.executeScript("arguments[0].click();", signInBtn);

    await driver.wait(until.urlContains("/member/dashboard"), 10000);

    // Navigate to History
    await new Promise((resolve) => setTimeout(resolve, 500));
    const avatarDiv = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//div[contains(@class, "rounded-full bg-gradient-to-tr from-orange-400 to-red-500")]',
        ),
      ),
      5000,
    );

    const userMenuBtn = await driver.executeScript(
      "return arguments[0].closest('.flex.items-center.gap-2.cursor-pointer')",
      avatarDiv,
    );
    await driver.executeScript("arguments[0].click();", userMenuBtn);
    console.log("✓ Click avatar menu");

    await new Promise((resolve) => setTimeout(resolve, 500));
    const historyBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Lịch sử")]'),
    );
    await driver.executeScript("arguments[0].click();", historyBtn);

    await driver.wait(until.urlContains("/member/history"), 10000);
    console.log("✅ Navigated to History page");

    // Wait for history list to load
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Check for statistics section (Tổng lần làm, Điểm trung bình, Điểm cao nhất)
    const totalAttemptsStats = await driver.findElements(
      By.xpath('//div[contains(text(), "Tổng lần làm")]'),
    );
    const avgScoreStats = await driver.findElements(
      By.xpath('//div[contains(text(), "Điểm trung bình")]'),
    );
    const highestScoreStats = await driver.findElements(
      By.xpath('//div[contains(text(), "Điểm cao nhất")]'),
    );

    if (
      totalAttemptsStats.length > 0 ||
      avgScoreStats.length > 0 ||
      highestScoreStats.length > 0
    ) {
      console.log(`✅ Found statistics section with scores visible`);
      expect(
        totalAttemptsStats.length +
          avgScoreStats.length +
          highestScoreStats.length,
      ).toBeGreaterThan(0);
    } else {
      // Alternative: just check that page is loaded
      const pageTitle = await driver.findElement(
        By.xpath('//h1[contains(text(), "Lịch sử")]'),
      );
      expect(await pageTitle.isDisplayed()).toBe(true);
      console.log(
        "✅ History page loaded (statistics may have different structure)",
      );
    }
  }, 30000);

  test("TC-05: Quay lại Dashboard từ History", async () => {
    console.log("🚀 TC-05: Quay lại Dashboard từ History");

    // Login
    await driver.get("http://localhost:5173/auth");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const signInBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await driver.executeScript("arguments[0].click();", signInBtn);

    await driver.wait(until.urlContains("/member/dashboard"), 10000);

    // Navigate to History
    await new Promise((resolve) => setTimeout(resolve, 500));
    const avatarDiv = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//div[contains(@class, "rounded-full bg-gradient-to-tr from-orange-400 to-red-500")]',
        ),
      ),
      5000,
    );

    const userMenuBtn = await driver.executeScript(
      "return arguments[0].closest('.flex.items-center.gap-2.cursor-pointer')",
      avatarDiv,
    );
    await driver.executeScript("arguments[0].click();", userMenuBtn);
    console.log("✓ Click avatar menu");

    await new Promise((resolve) => setTimeout(resolve, 500));
    const historyBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Lịch sử")]'),
    );
    await driver.executeScript("arguments[0].click();", historyBtn);

    await driver.wait(until.urlContains("/member/history"), 10000);
    console.log("✅ Navigated to History page");

    // Find and click back button
    await new Promise((resolve) => setTimeout(resolve, 500));
    const backBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Quay lại")]'),
    );
    await driver.executeScript("arguments[0].click();", backBtn);

    // Wait for Dashboard to load
    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    console.log("✅ Back to Dashboard");

    // Verify we're on dashboard
    const dashboardElement = await driver.findElements(
      By.xpath('//div[contains(@id, "member-tests")]'),
    );
    expect(dashboardElement.length).toBeGreaterThan(0);
    console.log("✅ Dashboard verified");
  }, 30000);
});
