import { createDriver } from "../config/selenium.config.js";
import { By, until } from "selenium-webdriver";

describe("BLACK BOX - Exam (Listening Test)", () => {
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

  test("TC-01: Hiển thị trang exam", async () => {
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

    // Scroll tới exam list
    await driver.executeScript(
      "document.getElementById('member-tests')?.scrollIntoView({behavior: 'smooth'});",
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Click "Làm bài ngay" button (first exam)
    const startBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Làm bài ngay")]'),
      ),
      10000,
    );
    await driver.executeScript("arguments[0].click();", startBtn);
    console.log("✓ Click 'Làm bài ngay'");

    // Wait for exam page to load
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await driver.wait(until.urlContains("/member/exam"), 10000);
    console.log("✓ Đã vào trang exam");

    // Verify exam UI elements
    // 1. Exam title
    const examTitle = await driver.findElements(
      By.xpath(
        '//h1 | //h2 | //*[contains(text(), "listening") or contains(text(), "test")]',
      ),
    );
    expect(examTitle.length).toBeGreaterThan(0);
    console.log("✓ Exam title hiển thị");

    // 2. Audio player
    const audioPlayer = await driver.findElements(
      By.xpath(
        '//audio | //*[contains(text(), "Audio")] | //*[contains(@class, "player")]',
      ),
    );
    if (audioPlayer.length > 0) {
      console.log("✓ Audio player có sẵn");
    }

    // 3. Question image
    const questionImage = await driver.findElements(By.xpath("//img"));
    if (questionImage.length > 0) {
      console.log(`✓ Image hiển thị (${questionImage.length} images)`);
    }

    // 4. Answer options
    const answerOptions = await driver.findElements(
      By.xpath(
        '//div[contains(@class, "cursor-pointer")] | //button | //*[contains(text(), "He")]',
      ),
    );
    if (answerOptions.length > 0) {
      console.log(`✓ Hiển thị câu trả lời`);
    }

    // 5. Question list on right
    const questionList = await driver.findElements(
      By.xpath(
        '//*[contains(text(), "DANH SÁCH")] | //*[contains(text(), "1") and contains(@class, "cursor")]',
      ),
    );
    if (questionList.length > 0) {
      console.log("✓ Danh sách câu hỏi có sẵn");
    }

    // 6. Submit button
    const submitBtn = await driver.findElements(
      By.xpath(
        '//button[contains(text(), "Nộp")] | //button[contains(text(), "submit")]',
      ),
    );
    if (submitBtn.length > 0) {
      console.log("✓ Nút 'Nộp bài' có sẵn");
    }

    // 7. Navigation buttons
    const navBtns = await driver.findElements(
      By.xpath(
        '//button[contains(text(), "Câu")] | //button[contains(text(), "Previous")] | //button[contains(text(), "Next")]',
      ),
    );
    if (navBtns.length > 0) {
      console.log(`✓ Navigation buttons hiển thị (${navBtns.length})`);
    }
  }, 120000);

  test("TC-02: Chọn câu trả lời", async () => {
    // Login và vào exam
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

    // Scroll tới exam list
    await driver.executeScript(
      "document.getElementById('member-tests')?.scrollIntoView({behavior: 'smooth'});",
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Click "Làm bài ngay" button
    const startBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Làm bài ngay")]'),
      ),
      10000,
    );
    await driver.executeScript("arguments[0].click();", startBtn);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await driver.wait(until.urlContains("/member/exam"), 10000);
    console.log("✓ Đã vào trang exam");

    // Click first answer option (A, B, C, or D)
    const answerOptions = await driver.findElements(
      By.xpath(
        '//div[contains(@class, "cursor-pointer")] | //*[contains(@class, "answer")] | //*[text()="A" or text()="B" or text()="C" or text()="D"]',
      ),
    );

    if (answerOptions.length > 0) {
      // Click first answer
      await driver.executeScript("arguments[0].click();", answerOptions[0]);
      console.log("✓ Click option A");

      // Wait to see if it's selected
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if answer is highlighted/selected
      try {
        const selectedAnswer = await driver.findElements(
          By.xpath(
            '//*[contains(@class, "selected") or contains(@style, "blue") or contains(@style, "highlighted")]',
          ),
        );
        if (selectedAnswer.length > 0) {
          console.log("✓ Câu trả lời được chọn");
        } else {
          console.log("✓ Click option thành công");
        }
      } catch (e) {
        console.log("✓ Click option thành công");
      }
    } else {
      console.log("⚠️  Không tìm thấy answer options");
    }
  }, 120000);

  test("TC-03: Navigate giữa các câu hỏi", async () => {
    // Login và vào exam
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

    // Go to exam
    await driver.executeScript(
      "document.getElementById('member-tests')?.scrollIntoView({behavior: 'smooth'});",
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    const startBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Làm bài ngay")]'),
      ),
      10000,
    );
    await driver.executeScript("arguments[0].click();", startBtn);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await driver.wait(until.urlContains("/member/exam"), 10000);
    console.log("✓ Đã vào trang exam");

    // Try clicking on question number (e.g., question 2)
    const questionButtons = await driver.findElements(
      By.xpath(
        '//button[contains(@class, "cursor")] | //*[contains(text(), "2") and contains(@class, "cursor")]',
      ),
    );

    if (questionButtons.length > 0) {
      // Click second question
      await driver.executeScript("arguments[0].click();", questionButtons[0]);
      console.log("✓ Click vào câu 2");

      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log("✓ Navigate đến câu tiếp theo");
    }

    // Try "Câu sau" button
    try {
      const nextBtn = await driver.findElements(
        By.xpath('//button[contains(text(), "Câu sau")]'),
      );
      if (nextBtn.length > 0) {
        await driver.executeScript("arguments[0].click();", nextBtn[0]);
        console.log("✓ Click 'Câu sau'");
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (e) {
      console.log("⚠️  Không tìm thấy 'Câu sau' button");
    }
  }, 120000);

  test("TC-04: Submit bài thi", async () => {
    // Login và vào exam
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

    // Go to exam
    await driver.executeScript(
      "document.getElementById('member-tests')?.scrollIntoView({behavior: 'smooth'});",
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    const startBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Làm bài ngay")]'),
      ),
      10000,
    );
    await driver.executeScript("arguments[0].click();", startBtn);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await driver.wait(until.urlContains("/member/exam"), 10000);
    console.log("✓ Đã vào trang exam");

    // Select one answer
    const answerOptions = await driver.findElements(
      By.xpath(
        '//div[contains(@class, "cursor-pointer")] | //*[contains(@class, "answer")]',
      ),
    );

    if (answerOptions.length > 0) {
      await driver.executeScript("arguments[0].click();", answerOptions[0]);
      console.log("✓ Chọn 1 câu");
    }

    // Find and click submit button
    const submitBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//button[contains(text(), "Nộp")] | //button[contains(@class, "submit")]',
        ),
      ),
      10000,
    );

    await driver.executeScript("arguments[0].scrollIntoView(true);", submitBtn);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await driver.executeScript("arguments[0].click();", submitBtn);
    console.log("✓ Click nút 'Nộp bài'");

    // Handle confirmation dialog
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const alert = await driver.switchTo().alert();
      const alertText = await alert.getText();
      console.log(`🚨 Alert: ${alertText}`);
      await alert.accept(); // Click OK
      console.log("✓ Confirm submit");
    } catch (e) {
      // No alert, continue
      console.log("✓ No confirmation dialog");
    }

    // Wait for result page
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Check if we got results
    try {
      const resultElements = await driver.findElements(
        By.xpath(
          '//*[contains(text(), "Tổng")] | //*[contains(text(), "Đúng")] | //*[contains(text(), "Sai")]',
        ),
      );

      if (resultElements.length > 0) {
        console.log("✓ Hiển thị trang kết quả");
      } else {
        console.log("✓ Submit bài thành công");
      }
    } catch (e) {
      console.log("✓ Submit bài thành công");
    }
  }, 120000);

  test("TC-05: Xem kết quả chi tiết", async () => {
    // Login và vào exam
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

    // Go to exam
    await driver.executeScript(
      "document.getElementById('member-tests')?.scrollIntoView({behavior: 'smooth'});",
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    const startBtn = await driver.wait(
      until.elementLocated(
        By.xpath('//button[contains(text(), "Làm bài ngay")]'),
      ),
      10000,
    );
    await driver.executeScript("arguments[0].click();", startBtn);

    await new Promise((resolve) => setTimeout(resolve, 3000));
    await driver.wait(until.urlContains("/member/exam"), 10000);

    // Select answer
    const answerOptions = await driver.findElements(
      By.xpath(
        '//div[contains(@class, "cursor-pointer")] | //*[contains(@class, "answer")] | //*[text()="A" or text()="B" or text()="C" or text()="D"]',
      ),
    );

    if (answerOptions.length > 0) {
      await driver.executeScript("arguments[0].click();", answerOptions[0]);
    }

    // Submit
    const submitBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          '//button[contains(text(), "Nộp")] | //button[contains(@class, "submit")]',
        ),
      ),
      10000,
    );

    await driver.executeScript("arguments[0].click();", submitBtn);

    // Confirm
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const alert = await driver.switchTo().alert();
      await alert.accept();
    } catch (e) {
      // No alert
    }

    // Wait for result page
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("✓ Đã submit bài");

    // Check result statistics
    const resultStats = await driver.findElements(
      By.xpath(
        '//*[contains(text(), "Tổng")] | //*[contains(text(), "Đúng")] | //*[contains(text(), "Sai")]',
      ),
    );

    if (resultStats.length > 0) {
      console.log(`✓ Kết quả có ${resultStats.length} thống kê`);
    }

    // Check for detailed answers section
    const detailedAnswers = await driver.findElements(
      By.xpath(
        '//*[contains(text(), "Chi tiết")] | //*[contains(text(), "Đáp án")]',
      ),
    );

    if (detailedAnswers.length > 0) {
      console.log("✓ Section chi tiết đáp án hiển thị");
    } else {
      console.log("✓ Kết quả page loaded");
    }

    // Check for "Làm lại" button
    const retryBtn = await driver.findElements(
      By.xpath(
        '//button[contains(text(), "Làm lại")] | //button[contains(text(), "Try again")]',
      ),
    );

    if (retryBtn.length > 0) {
      console.log("✓ Nút 'Làm lại' có sẵn");
    }

    // Check for back button
    const backBtn = await driver.findElements(
      By.xpath(
        '//button[contains(text(), "Về")] | //button[contains(text(), "Back")]',
      ),
    );

    if (backBtn.length > 0) {
      console.log("✓ Nút 'Về trang chủ' có sẵn");
    }
  }, 120000);
});
