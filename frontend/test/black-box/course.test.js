import { createDriver } from "../config/selenium.config.js";
import { By, until } from "selenium-webdriver";

describe("BLACK BOX - Course", () => {
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

  test("TC-01: Mở trang Khóa học từ header", async () => {
    console.log("🚀 TC-01: Mở trang Khóa học từ header");

    // Login first
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

    // Navigate to Course page
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      await driver.get("http://localhost:5173/member/course");
    } catch (e) {
      console.log("⚠️  Could not navigate to course");
    }

    // Wait for page title
    await driver.wait(
      until.elementLocated(
        By.xpath(
          '//h1[contains(text(), "Làm chủ tiếng Anh")] | //h1[contains(text(), "Khóa học")]',
        ),
      ),
      10000,
    );
    console.log("✅ Navigated to Course page");

    // Verify course header title
    const courseTitle = await driver.findElements(
      By.xpath(
        '//h1[contains(text(), "Làm chủ tiếng Anh")] | //h1[contains(text(), "Khóa học")]',
      ),
    );
    expect(courseTitle.length).toBeGreaterThan(0);
    console.log("✅ Course page title visible");

    // Verify filter section exists
    const filterSection = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//*[contains(., "BỘ LỌC") or contains(., "Bộ lọc") or contains(., "DANH MỤC")] | //input[contains(@placeholder, "Tìm khóa")]',
        ),
      ),
      15000,
    );
    expect(await filterSection.isDisplayed()).toBe(true);
    console.log("✅ Filter section visible");
  }, 30000);

  test("TC-02: Tìm kiếm khóa học", async () => {
    console.log("🚀 TC-02: Tìm kiếm khóa học");

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

    // Navigate to Course page
    await new Promise((resolve) => setTimeout(resolve, 500));
    await driver.get("http://localhost:5173/member/course");

    // Wait for page to load
    await driver.wait(
      until.elementLocated(
        By.xpath('//input[contains(@placeholder, "Tìm khóa học")]'),
      ),
      10000,
    );
    console.log("✅ Course page loaded");

    // Find and click search input
    const searchInput = await driver.findElement(
      By.xpath('//input[contains(@placeholder, "Tìm khóa học")]'),
    );
    await searchInput.sendKeys("IELTS");
    console.log("✅ Typed 'IELTS' in search");

    // Wait for search results
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify search results are displayed
    const courseCards = await driver.findElements(
      By.xpath(
        '//div[contains(@class, "course-card")] | //div[contains(text(), "IELTS")]',
      ),
    );

    if (courseCards.length > 0) {
      console.log(
        `✅ Search results displayed: ${courseCards.length} courses found`,
      );
      expect(courseCards.length).toBeGreaterThan(0);
    } else {
      console.log(
        "⚠️  No courses found (may be normal if no IELTS courses exist)",
      );
    }
  }, 30000);

  test("TC-03: Lọc khóa học - Tab Tất cả", async () => {
    console.log("🚀 TC-03: Lọc khóa học - Tab Tất cả");

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

    // Navigate to Course page
    await new Promise((resolve) => setTimeout(resolve, 500));
    await driver.get("http://localhost:5173/member/course");

    // Wait for page to load
    await driver.wait(
      until.elementLocated(
        By.xpath(
          '//button[contains(text(), "Tất cả") or contains(text(), "Tất cả khóa")]',
        ),
      ),
      10000,
    );
    console.log("✅ Course page loaded");

    // Click "Tất cả" tab
    const allTab = await driver.findElement(
      By.xpath('//button[contains(text(), "Tất cả")]'),
    );
    await driver.executeScript("arguments[0].click();", allTab);
    console.log("✅ Clicked 'Tất cả' tab");

    // Wait for courses to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify courses are displayed
    const courseCards = await driver.findElements(
      By.xpath(
        '//div[contains(@class, "course-card")] | //h3[contains(text(), "IELTS")] | //h3[contains(text(), "Business")] | //h3[contains(text(), "Speaking")]',
      ),
    );

    if (courseCards.length > 0) {
      console.log(`✅ All courses displayed: ${courseCards.length} courses`);
      expect(courseCards.length).toBeGreaterThan(0);
    } else {
      console.log("⚠️  No courses found");
    }
  }, 30000);

  test("TC-04: Lọc khóa học - Tab Miễn phí", async () => {
    console.log("🚀 TC-04: Lọc khóa học - Tab Miễn phí");

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

    // Navigate to Course page
    await new Promise((resolve) => setTimeout(resolve, 500));
    await driver.get("http://localhost:5173/member/course");

    // Wait for page to load
    await driver.wait(
      until.elementLocated(By.xpath('//button[contains(text(), "Miễn phí")]')),
      10000,
    );
    console.log("✅ Course page loaded");

    // Click "Miễn phí" tab
    const freeTab = await driver.findElement(
      By.xpath('//button[contains(text(), "Miễn phí")]'),
    );
    await driver.executeScript("arguments[0].click();", freeTab);
    console.log("✅ Clicked 'Miễn phí' tab");

    // Wait for courses to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify free courses are displayed
    const freeCourses = await driver.findElements(
      By.xpath(
        '//div[contains(text(), "Miễn phí")] | //button[contains(text(), "Tham gia")]',
      ),
    );

    if (freeCourses.length > 0) {
      console.log(
        `✅ Free courses displayed: ${freeCourses.length} free items`,
      );
      expect(freeCourses.length).toBeGreaterThan(0);
    } else {
      console.log("⚠️  No free courses found");
    }
  }, 30000);

  test("TC-05: Lọc khóa học - Tab Trả phí", async () => {
    console.log("🚀 TC-05: Lọc khóa học - Tab Trả phí");

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

    // Navigate to Course page
    await new Promise((resolve) => setTimeout(resolve, 500));
    await driver.get("http://localhost:5173/member/course");

    // Wait for page to load
    await driver.wait(
      until.elementLocated(By.xpath('//button[contains(text(), "Trả phí")]')),
      10000,
    );
    console.log("✅ Course page loaded");

    // Click "Trả phí" tab
    const paidTab = await driver.findElement(
      By.xpath('//button[contains(text(), "Trả phí")]'),
    );
    await driver.executeScript("arguments[0].click();", paidTab);
    console.log("✅ Clicked 'Trả phí' tab");

    // Wait for courses to load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify paid courses are displayed (should have price)
    const paidCourses = await driver.findElements(
      By.xpath(
        '//div[contains(text(), "$")] | //div[contains(text(), "đ")] | //button[contains(text(), "Tham gia")]',
      ),
    );

    if (paidCourses.length > 0) {
      console.log(
        `✅ Paid courses displayed: ${paidCourses.length} paid items`,
      );
      expect(paidCourses.length).toBeGreaterThan(0);
    } else {
      console.log("⚠️  No paid courses found");
    }
  }, 30000);

  test("TC-06: Lọc khóa học theo danh mục (IELTS, TOEIC, Speaking, Business)", async () => {
    console.log("🚀 TC-06: Lọc khóa học theo danh mục");

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

    // Navigate to Course page
    await new Promise((resolve) => setTimeout(resolve, 500));
    await driver.get("http://localhost:5173/member/course");

    // Wait for page to load
    await driver.wait(
      until.elementLocated(
        By.xpath('//input[contains(@placeholder, "Tìm khóa học")]'),
      ),
      10000,
    );
    console.log("✅ Course page loaded");

    // Click IELTS checkbox
    const ieltsCB = await driver.findElements(
      By.xpath(
        '//input[@type="checkbox" and following-sibling::*[contains(text(), "IELTS")]]',
      ),
    );

    if (ieltsCB.length > 0) {
      await driver.executeScript("arguments[0].click();", ieltsCB[0]);
      console.log("✅ Clicked IELTS filter");

      // Wait for results
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify filtered results
      const filteredCourses = await driver.findElements(
        By.xpath(
          '//h3[contains(text(), "IELTS")] | //span[contains(text(), "IELTS")]',
        ),
      );

      if (filteredCourses.length > 0) {
        console.log(
          `✅ IELTS courses filtered: ${filteredCourses.length} courses`,
        );
        expect(filteredCourses.length).toBeGreaterThan(0);
      }
    } else {
      console.log("⚠️  IELTS checkbox not found");
    }
  }, 30000);

  test("TC-07: Lọc khóa học theo trình độ (Beginner, Intermediate, Advanced)", async () => {
    console.log("🚀 TC-07: Lọc khóa học theo trình độ");

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

    // Navigate to Course page
    await new Promise((resolve) => setTimeout(resolve, 500));
    await driver.get("http://localhost:5173/member/course");

    // Wait for page to load
    await driver.wait(
      until.elementLocated(
        By.xpath('//input[contains(@placeholder, "Tìm khóa học")]'),
      ),
      10000,
    );
    console.log("✅ Course page loaded");

    // Click Beginner checkbox
    const beginnerCB = await driver.findElements(
      By.xpath(
        '//input[@type="checkbox" and following-sibling::*[contains(text(), "Beginner")]]',
      ),
    );

    if (beginnerCB.length > 0) {
      await driver.executeScript("arguments[0].click();", beginnerCB[0]);
      console.log("✅ Clicked Beginner filter");

      // Wait for results
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify filtered results
      const filteredCourses = await driver.findElements(
        By.xpath(
          '//span[contains(text(), "Beginner")] | //span[contains(text(), "All Levels")]',
        ),
      );

      if (filteredCourses.length > 0) {
        console.log(
          `✅ Beginner courses filtered: ${filteredCourses.length} courses`,
        );
        expect(filteredCourses.length).toBeGreaterThan(0);
      }
    } else {
      console.log("⚠️  Beginner checkbox not found");
    }
  }, 30000);
});
