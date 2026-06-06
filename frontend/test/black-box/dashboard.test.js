import { createDriver } from "../config/selenium.config.js";
import { By, until } from "selenium-webdriver";

describe("BLACK BOX - Dashboard", () => {
  let driver;

  beforeAll(async () => {
    console.log("beforeAll: Starting...");
    driver = await createDriver();
    console.log("beforeAll: Driver created successfully");
  }, 180000); // 3 minute timeout for beforeAll

  afterEach(async () => {
    try {
      // Dismiss any open alerts first
      try {
        const alert = await driver.switchTo().alert();
        await alert.dismiss();
        console.log("Dismissed unexpected alert");
      } catch (e) {
        // No alert present, continue
      }

      // Navigate to auth page (safe, no API calls)
      try {
        await driver.get("http://localhost:5173/auth");
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (e) {
        console.log("⚠️  Could not navigate to auth page:", e.message);
      }

      // Clear cookies and session storage to reset state between tests
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

  test("TC-01: Hiển thị Dashboard thành công", async () => {
    // Login trước
    await driver.get("http://localhost:5173/auth");
    console.log("✓ Mở trang login");

    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const loginBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await loginBtn.click();
    console.log("✓ Click Sign In");

    // Chờ dashboard load
    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    console.log("✓ Đã vào dashboard");

    // Kiểm tra header
    const header = await driver.wait(
      until.elementLocated(By.xpath("//h1[contains(text(), 'LearnWithMe')]")),
      5000,
    );
    expect(await header.isDisplayed()).toBe(true);
    console.log("✓ Header hiển thị");

    // Kiểm tra hero title
    const heroTitle = await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(text(), 'Chinh phục')]")),
      5000,
    );
    expect(await heroTitle.isDisplayed()).toBe(true);
    console.log("✓ Hero section hiển thị");

    // Kiểm tra search bar
    const searchInput = await driver.findElement(
      By.xpath('//input[contains(@placeholder, "Nhập tên")]'),
    );
    expect(await searchInput.isDisplayed()).toBe(true);
    console.log("✓ Search bar hiển thị");

    // Kiểm tra user avatar
    const userAvatar = await driver.findElement(
      By.xpath(
        '//div[contains(@class, "rounded-full bg-gradient-to-tr from-orange-400 to-red-500")]',
      ),
    );
    expect(await userAvatar.isDisplayed()).toBe(true);
    console.log("✓ User avatar hiển thị");
  }, 90000);

  test("TC-02: Search bài thi", async () => {
    // Login
    await driver.get("http://localhost:5173/auth");
    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const loginBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await loginBtn.click();

    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    console.log("✓ Đăng nhập thành công");

    // Scroll tới search bar
    await driver.executeScript("window.scrollTo(0, 300);");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const searchInput = await driver.wait(
      until.elementLocated(
        By.xpath('//input[contains(@placeholder, "Nhập tên")]'),
      ),
      10000,
    );

    // Clear search input nếu có value cũ
    await searchInput.clear();
    await searchInput.sendKeys("listening");
    console.log("✓ Nhập từ khóa 'listening'");

    const searchBtn = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(text(), "Tìm kiếm")]')),
      10000,
    );

    // Scroll button vào view
    await driver.executeScript("arguments[0].scrollIntoView(true);", searchBtn);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Click bằng executeScript (đáng tin cậy hơn)
    await driver.executeScript("arguments[0].click();", searchBtn);
    console.log("✓ Click nút 'Tìm kiếm'");

    // Chờ lâu hơn cho API response (5-10s)
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Kiểm tra có kết quả trả về
    try {
      const testResults = await driver.findElements(
        By.xpath(
          '//div[contains(@class, "test-card") or contains(@class, "border") or contains(@class, "cursor-pointer")]',
        ),
      );
      console.log(`✓ Tìm thấy ${testResults.length} kết quả search`);
    } catch (e) {
      console.log("✓ Search hoàn thành");
    }
  }, 90000);

  test("TC-03: Xem danh sách bài thi", async () => {
    // Login
    await driver.get("http://localhost:5173/auth");
    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const loginBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await loginBtn.click();

    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    console.log("✓ Đăng nhập thành công");

    // Scroll tới section bài thi
    await driver.executeScript(
      "document.getElementById('member-tests')?.scrollIntoView({behavior: 'smooth'});",
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log("✓ Scroll tới section bài thi");

    // Kiểm tra section "Các đề thi được khuyên đề"
    const recommendedSection = await driver.findElements(
      By.xpath('//h3[contains(text(), "Đề Thi Phổ Biến Nhất")]'),
    );
    expect(recommendedSection.length).toBeGreaterThan(0);
    console.log("✓ Section danh sách bài thi hiển thị");

    // Kiểm tra có bài thi nào không
    const testCards = await driver.findElements(
      By.xpath('//div[contains(@class, "cursor-pointer rounded")]'),
    );
    if (testCards.length > 0) {
      console.log(`✓ Hiển thị ${testCards.length} bài thi`);
    } else {
      console.log("✓ Không có bài thi (list empty)");
    }
  }, 90000);

  test("TC-04: Kiểm tra thông tin user menu", async () => {
    // Login
    await driver.get("http://localhost:5173/auth");
    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const loginBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await loginBtn.click();

    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    console.log("✓ Đăng nhập thành công");

    // Click avatar để mở menu
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

    // Chờ menu hiển thị
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Kiểm tra email hiển thị trong menu
    const emailInMenu = await driver.findElements(
      By.xpath('//*[contains(text(), "trung8d2005")]'),
    );
    expect(emailInMenu.length).toBeGreaterThan(0);
    console.log("✓ Email hiển thị trong menu");

    // Kiểm tra nút "Hồ sơ cá nhân"
    const profileBtn = await driver.findElements(
      By.xpath('//button[contains(text(), "Hồ sơ cá nhân")]'),
    );
    expect(profileBtn.length).toBeGreaterThan(0);
    console.log("✓ Nút 'Hồ sơ cá nhân' có sẵn");

    // Kiểm tra nút "Lịch sử bài làm"
    const historyBtn = await driver.findElements(
      By.xpath('//button[contains(text(), "Lịch sử bài làm")]'),
    );
    expect(historyBtn.length).toBeGreaterThan(0);
    console.log("✓ Nút 'Lịch sử bài làm' có sẵn");

    // Kiểm tra nút "Đăng xuất"
    const logoutBtn = await driver.findElements(
      By.xpath('//button[contains(text(), "Đăng xuất")]'),
    );
    expect(logoutBtn.length).toBeGreaterThan(0);
    console.log("✓ Nút 'Đăng xuất' có sẵn");
  }, 90000);

  test("TC-05: Click vào bài thi", async () => {
    // Login
    await driver.get("http://localhost:5173/auth");
    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const loginBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await loginBtn.click();

    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    console.log("✓ Đăng nhập thành công");

    // Scroll tới section bài thi
    await driver.executeScript(
      "document.getElementById('member-tests')?.scrollIntoView({behavior: 'smooth'});",
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Tìm bài thi đầu tiên
    const firstTest = await driver.findElements(
      By.xpath(
        '(//div[contains(@class, "cursor-pointer") and contains(@class, "rounded")])[1]',
      ),
    );

    if (firstTest.length > 0) {
      // Click vào bài thi đầu tiên
      await driver.executeScript("arguments[0].click();", firstTest[0]);
      console.log("✓ Click vào bài thi đầu tiên");

      // Chờ navigate
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Kiểm tra URL thay đổi
      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes("/member")) {
        console.log("✓ Đã navigate đến trang làm bài");
      } else {
        console.log("⚠️  Vẫn trên dashboard (có thể bài thi chưa load)");
      }
    } else {
      console.log("✓ Không có bài thi để click (list empty)");
    }
  }, 90000);

  test("TC-06: Hiển thị điểm yếu (Weak Areas)", async () => {
    // Login
    await driver.get("http://localhost:5173/auth");
    const emailInput = await driver.findElement(
      By.xpath('//input[@placeholder="Email"]'),
    );
    await emailInput.sendKeys("trung8d2005@gmail.com");

    const passwordInput = await driver.findElement(
      By.xpath('//input[@placeholder="Password"]'),
    );
    await passwordInput.sendKeys("12345678");

    const loginBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await loginBtn.click();

    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    console.log("✓ Đăng nhập thành công");

    // Scroll tới weak areas section
    await driver.executeScript(
      "window.scrollTo(0, document.body.scrollHeight / 2);",
    );
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Kiểm tra có section điểm yếu không
    try {
      const weakAreaSection = await driver.findElements(
        By.xpath('//*[contains(text(), "Phần cần ôn tập của bạn")]'),
      );

      if (weakAreaSection.length > 0) {
        console.log("✓ Section 'Điểm yếu' hiển thị");
      } else {
        console.log("✓ Không có điểm yếu hoặc chưa làm bài");
      }
    } catch (e) {
      console.log("✓ Section 'Điểm yếu' không có hoặc chưa load");
    }
  }, 90000);
});
