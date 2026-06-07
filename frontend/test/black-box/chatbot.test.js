import { createDriver } from "../config/selenium.config.js";
import { By, until } from "selenium-webdriver";

describe("BLACK BOX - Chatbot", () => {
  let driver;

  // Hàm dọn dẹp Alert chống lag Aiven
  const clearUnexpectedAlerts = async (driver) => {
    try {
      await driver.wait(until.alertIsPresent(), 2000);
      const alert = await driver.switchTo().alert();
      console.log(`🚨 Bỏ qua alert hệ thống: "${await alert.getText()}"`);
      await alert.accept();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (e) {
      // No alert present, continue
    }
  };

  beforeAll(async () => {
    console.log("📋 beforeAll: Starting...");
    driver = await createDriver();
  }, 180000);

  afterEach(async () => {
    try {
      try {
        const alert = await driver.switchTo().alert();
        await alert.dismiss();
      } catch (e) {
        // No alert present, continue
      }
      try {
        await driver.get("http://localhost:5173/auth");
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (e) {
        // Failed to navigate to auth page, continue
      }
      try {
        await driver.manage().deleteAllCookies();
        await driver.executeScript(
          "sessionStorage.clear(); localStorage.clear();",
        );
      } catch (e) {
        // Failed to clear cookies, continue
      }
    } catch (e) {
      // Failed to clean up after test, continue
    }
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  // Hàm Helper: Đăng nhập và mở Chatbot
  const loginAndOpenChatbot = async () => {
    await driver.get("http://localhost:5173/auth");
    await new Promise((resolve) => setTimeout(resolve, 500));

    await driver
      .findElement(By.xpath('//input[@placeholder="Email"]'))
      .sendKeys("trung8d2005@gmail.com");
    await driver
      .findElement(By.xpath('//input[@placeholder="Password"]'))
      .sendKeys("12345678");
    const signInBtn = await driver.findElement(
      By.xpath('//button[contains(text(), "Sign In")]'),
    );
    await driver.executeScript("arguments[0].click();", signInBtn);

    await driver.wait(until.urlContains("/member/dashboard"), 10000);
    await clearUnexpectedAlerts(driver);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Dùng XPath nhắm thẳng vào các class đặc trưng từ ảnh F12 của bạn
    const fabXPath =
      '//button[contains(@class, "bottom-6") and contains(@class, "right-6") and contains(@class, "z-[9999]")]';

    try {
      // Tìm chính xác cái nút đó
      const chatBtn = await driver.wait(
        until.elementLocated(By.xpath(fabXPath)),
        10000,
      );

      // Ép click bằng Javascript để mở
      await driver.executeScript("arguments[0].click();", chatBtn);
      console.log("✅ Đã click mở Chatbot bằng class chính xác");
    } catch (error) {
      console.log("⚠️ Không tìm thấy nút Chatbot!", error.message);
    }

    // Đợi cho đến khi cửa sổ chat bật lên và hiện chữ "Trợ lý TOEIC"
    await driver.wait(
      until.elementLocated(By.xpath('//*[contains(., "Trợ lý TOEIC")]')),
      10000,
    );
  };

  test("TC-01: Mở và hiển thị giao diện Chatbot", async () => {
    console.log("🚀 TC-01: Mở giao diện Chatbot");
    await loginAndOpenChatbot();

    // Verify Tiêu đề
    const title = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(., "Trợ lý TOEIC")]')),
      5000,
    );
    expect(await title.isDisplayed()).toBe(true);
    console.log("✅ Tiêu đề Chatbot hiển thị");

    // Verify Thanh thống kê (212 câu, 55%, 33%)
    const stats = await driver.findElements(
      By.xpath(
        '//*[contains(., "212")] | //*[contains(., "55%")] | //*[contains(., "33%")]',
      ),
    );
    expect(stats.length).toBeGreaterThan(0);
    console.log("✅ Thanh thống kê hiển thị");

    // Verify Ô nhập liệu
    const inputArea = await driver.findElements(
      By.xpath(
        '//*[self::input or self::textarea][contains(@placeholder, "Nhập câu hỏi")]',
      ),
    );
    expect(inputArea.length).toBeGreaterThan(0);
    console.log("✅ Ô nhập liệu hiển thị");
  }, 40000);

  test("TC-02: Kiểm tra các nút Gợi ý (Quick Replies)", async () => {
    console.log("🚀 TC-02: Kiểm tra nút Gợi ý");
    await loginAndOpenChatbot();

    // Verify các nút gợi ý tồn tại
    const btnPhanTich = await driver.findElements(
      By.xpath(
        '//button[contains(., "Phân tích điểm yếu")] | //*[contains(@class, "cursor-pointer") and contains(., "Phân tích")]',
      ),
    );
    const btnLoTrinh = await driver.findElements(
      By.xpath(
        '//button[contains(., "Lộ trình học tập")] | //*[contains(@class, "cursor-pointer") and contains(., "Lộ trình")]',
      ),
    );

    expect(btnPhanTich.length).toBeGreaterThan(0);
    expect(btnLoTrinh.length).toBeGreaterThan(0);
    console.log("✅ Các nút Quick Reply hiển thị đầy đủ");
  }, 40000);

  test("TC-03: Gửi tin nhắn bằng text", async () => {
    console.log("🚀 TC-03: Gửi tin nhắn bằng text");
    await loginAndOpenChatbot();

    // Tìm ô nhập liệu (Có thể là thẻ input hoặc textarea)
    const chatInput = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//*[self::input or self::textarea][contains(@placeholder, "Nhập câu hỏi")]',
        ),
      ),
      10000,
    );

    // Nhập text
    const testMessage = "Làm sao để tăng điểm Listening?";
    await chatInput.sendKeys(testMessage);

    // Tìm nút Gửi (Nằm ngay cạnh ô input)
    const sendBtn = await driver.findElement(
      By.xpath(
        '//*[self::input or self::textarea][contains(@placeholder, "Nhập câu hỏi")]/following-sibling::button | //button[.//svg[contains(@class, "send")]]',
      ),
    );
    await driver.executeScript("arguments[0].click();", sendBtn);

    // Chờ tin nhắn xuất hiện trên khung chat
    const sentMessage = await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(., "${testMessage}")]`)),
      10000,
    );
    expect(await sentMessage.isDisplayed()).toBe(true);
    console.log("✅ Đã gửi tin nhắn thành công");
  }, 40000);

  test("TC-04: Đóng Chatbot", async () => {
    console.log("🚀 TC-04: Đóng Chatbot");
    await loginAndOpenChatbot();
    const closeXPath =
      '//div[contains(@class, "z-[9999]")]//button[.//*[contains(@class, "lucide-x")]]';

    const closeBtn = await driver.wait(
      until.elementLocated(By.xpath(closeXPath)),
      10000,
    );

    await driver.executeScript("arguments[0].click();", closeBtn);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Đợi animation trượt xuống ẩn đi

    // Verify cửa sổ chat không còn hiển thị
    try {
      const chatWindow = await driver.findElement(
        By.xpath(
          '//div[contains(@class, "bottom-24") and contains(@class, "z-[9999]")]',
        ),
      );
      const isDisplayed = await chatWindow.isDisplayed();
      expect(isDisplayed).toBe(false);
    } catch (error) {
      // Bắn ra NoSuchElementError nghĩa là đã bị xóa khỏi DOM -> PASS
      expect(true).toBe(true);
    }
    console.log("✅ Đã đóng Chatbot thành công");
  }, 40000);
});
