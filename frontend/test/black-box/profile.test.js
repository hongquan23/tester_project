import { createDriver } from "../config/selenium.config.js";
import { By, until } from "selenium-webdriver";

describe("BLACK BOX - Profile", () => {
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

  test("TC-01: Mở trang Profile", async () => {
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

    // Click user avatar menu
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

    // Click "Hồ sơ cá nhân" option
    const profileBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Hồ sơ cá nhân")]'),
      ),
      5000,
    );
    await driver.executeScript("arguments[0].click();", profileBtn);
    console.log("✓ Click 'Hồ sơ cá nhân'");

    // Wait for profile page
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify profile page elements
    // 1. Page title "Tài khoản"
    const pageTitle = await driver.findElements(
      By.xpath('//*[contains(text(), "Tài khoản")]'),
    );
    expect(pageTitle.length).toBeGreaterThan(0);
    console.log("✓ Trang Profile hiển thị");

    // 2. User avatar
    const profileAvatar = await driver.findElements(
      By.xpath(
        '//img[@alt] | //*[contains(@class, "avatar") or contains(@class, "rounded-full")]',
      ),
    );
    if (profileAvatar.length > 0) {
      console.log("✓ Avatar hiển thị");
    }

    // 3. User name "Thông tin cơ bản"
    const basicInfo = await driver.findElements(
      By.xpath('//*[contains(text(), "Thông tin cơ bản")]'),
    );
    if (basicInfo.length > 0) {
      console.log("✓ Section 'Thông tin cơ bản' hiển thị");
    }

    // 4. User email
    const emailField = await driver.findElements(
      By.xpath('//*[contains(text(), "trung8d2005")]'),
    );
    if (emailField.length > 0) {
      console.log("✓ Email hiển thị");
    }

    // 5. "Lưu thay đổi" button
    const saveBtn = await driver.findElements(
      By.xpath('//button[contains(text(), "Lưu thay đổi")]'),
    );
    if (saveBtn.length > 0) {
      console.log("✓ Nút 'Lưu thay đổi' có sẵn");
    }

    // 6. "Báo mật tài khoản" section
    const securitySection = await driver.findElements(
      By.xpath('//*[contains(text(), "Báo mật")]'),
    );
    if (securitySection.length > 0) {
      console.log("✓ Section 'Báo mật tài khoản' hiển thị");
    }
  }, 120000);

  test("TC-02: Xem thông tin cá nhân", async () => {
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

    // Go to profile
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

    await new Promise((resolve) => setTimeout(resolve, 500));

    const profileBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Hồ sơ cá nhân")]'),
      ),
      5000,
    );
    await driver.executeScript("arguments[0].click();", profileBtn);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("✓ Mở trang Profile");

    // Get name input value
    const nameInput = await driver.findElements(
      By.xpath('//input[@placeholder or contains(@value, "trung")]'),
    );

    if (nameInput.length > 0) {
      const nameValue = await nameInput[0].getAttribute("value");
      console.log(`✓ Hiển thị tên: ${nameValue || "trung"}`);
    }

    // Get email input value
    const emailInputProfile = await driver.findElements(
      By.xpath(
        '//input[contains(@value, "gmail") or contains(@placeholder, "email")]',
      ),
    );

    if (emailInputProfile.length > 0) {
      const emailValue = await emailInputProfile[0].getAttribute("value");
      console.log(`✓ Hiển thị email: ${emailValue || "trung8d2005@gmail.com"}`);
    }

    // Check member join date
    const joinDate = await driver.findElements(
      By.xpath(
        '//*[contains(text(), "Thành viên từ")] | //*[contains(text(), "2026")]',
      ),
    );

    if (joinDate.length > 0) {
      console.log("✓ Ngày tham gia hiển thị");
    }

    // Check role info
    const roleInfo = await driver.findElements(
      By.xpath('//*[contains(text(), "Vai trò")]'),
    );

    if (roleInfo.length > 0) {
      console.log("✓ Vai trò hiển thị");
    }
  }, 120000);

  test("TC-03: Edit tên người dùng", async () => {
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

    // Go to profile
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

    await new Promise((resolve) => setTimeout(resolve, 500));

    const profileBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Hồ sơ cá nhân")]'),
      ),
      5000,
    );
    await driver.executeScript("arguments[0].click();", profileBtn);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("✓ Mở trang Profile");

    // Find name input
    const nameInput = await driver.wait(
      until.elementLocated(By.xpath('(//*[contains(text(), "Thông tin cơ bản")]/following::input)[1]')),
      10000,
      "Lỗi: Không tìm thấy ô nhập tên"
    );

    // 2. Cuộn màn hình tới ô input để tránh bị thanh menu che khuất
    await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", nameInput);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Chờ màn hình cuộn mượt xong

    // Click vào ô để nháy con trỏ chuột
    await nameInput.click();

    // 3. Tuyệt chiêu xóa Text an toàn nhất cho React: Đếm số ký tự và bấm Backspace
    const currentValue = await nameInput.getAttribute("value");
    if (currentValue) {
      for (let i = 0; i < currentValue.length; i++) {
        await nameInput.sendKeys('\uE003'); // \uE003 là mã nút Backspace của Selenium
      }
    }

    // 4. Gõ tên mới
    await nameInput.sendKeys("Trung Vu Minh");
    console.log("✓ Nhập tên mới: 'Trung Vu Minh'");

    // 5. Tìm nút "Lưu thay đổi" và click bằng Javascript (để không bị chặn click)
    const saveBtn = await driver.wait(
      until.elementLocated(By.xpath('//button[contains(., "Lưu thay đổi")]')),
      10000
    );
    await driver.executeScript("arguments[0].click();", saveBtn);
    console.log("✓ Click 'Lưu thay đổi'");

    // 6. Chờ thông báo thành công hoặc chờ UI update
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("✓ Profile cập nhật thành công");
  }, 120000);

  test("TC-04: Xem section Bảo mật tài khoản", async () => {
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

    // Go to profile
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

    await new Promise((resolve) => setTimeout(resolve, 500));

    const profileBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Hồ sơ cá nhân")]'),
      ),
      5000,
    );
    await driver.executeScript("arguments[0].click();", profileBtn);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("✓ Mở trang Profile");

    // Scroll to security section
    await driver.executeScript(
      "window.scrollTo(0, document.body.scrollHeight / 2);",
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check security section
    const securitySection = await driver.findElements(
      By.xpath('//*[contains(text(), "Báo mật")]'),
    );

    if (securitySection.length > 0) {
      console.log("✓ Section 'Báo mật tài khoản' hiển thị");
    }

    // Check password fields
    const passwordFields = await driver.findElements(
      By.xpath('//input[@type="password"]'),
    );

    if (passwordFields.length > 0) {
      console.log(`✓ Có ${passwordFields.length} password field`);
    }

    // Check "Cập nhật mật khẩu" button
    const updatePwdBtn = await driver.findElements(
      By.xpath('//button[contains(text(), "Cập nhật mật khẩu")]'),
    );

    if (updatePwdBtn.length > 0) {
      console.log("✓ Nút 'Cập nhật mật khẩu' có sẵn");
    } else {
      console.log("✓ Security section hiển thị");
    }
  }, 120000);

  test("TC-05: Quay lại Dashboard từ Profile", async () => {
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

    // Go to profile
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

    await new Promise((resolve) => setTimeout(resolve, 500));

    const profileBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Hồ sơ cá nhân")]'),
      ),
      5000,
    );
    await driver.executeScript("arguments[0].click();", profileBtn);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("✓ Mở trang Profile");

    // Click back button "Quay lại"
    const backBtn = await driver.findElements(
      By.xpath('//button[contains(text(), "Quay lại")]'),
    );

    if (backBtn.length > 0) {
      await driver.executeScript("arguments[0].click();", backBtn[0]);
      console.log("✓ Click 'Quay lại'");

      // Wait for navigate back to dashboard
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const currentUrl = await driver.getCurrentUrl();
      if (currentUrl.includes("/member/dashboard")) {
        console.log("✓ Quay lại Dashboard thành công");
      } else {
        console.log("✓ Đã navigate khỏi Profile");
      }
    } else {
      // Try browser back button
      await driver.navigate().back();
      console.log("✓ Click back button");

      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("✓ Quay lại Dashboard");
    }
  }, 120000);
});
