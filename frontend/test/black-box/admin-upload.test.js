import { createDriver } from "../config/selenium.config.js";
import { By, until, Key } from "selenium-webdriver";
import path from "path";
import fs from "fs";

describe("BLACK BOX - Admin Upload Đề Thi", () => {
    let driver;

    // Lấy đường dẫn tuyệt đối đến file JSON trong thư mục 'data'
    const currentDir = process.cwd();
    const jsonFilePath = path.resolve(currentDir, "data", "ets2022_test1_lc_en (1).json");

    const clearUnexpectedAlerts = async (driver) => {
        try {
            await driver.wait(until.alertIsPresent(), 2000);
            const alert = await driver.switchTo().alert();
            console.log(`🚨 Bỏ qua alert hệ thống: "${await alert.getText()}"`);
            await alert.accept();
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (e) { }
    };

    beforeAll(async () => {
        console.log("📋 beforeAll: Starting Admin Upload Tests...");
        driver = await createDriver();

        // Kiểm tra an toàn: Đảm bảo file JSON thực sự tồn tại ở đường dẫn
        if (!fs.existsSync(jsonFilePath)) {
            console.error(`❌ KHÔNG TÌM THẤY FILE JSON tại: ${jsonFilePath}`);
            console.error("Vui lòng tạo thư mục 'data' ở thư mục gốc và bỏ file JSON vào đó.");
        }
    }, 180000);

    afterEach(async () => {
        try {
            try {
                const alert = await driver.switchTo().alert();
                await alert.dismiss();
            } catch (e) { }
            try {
                await driver.get("http://localhost:5173/auth");
                await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (e) { }
            try {
                await driver.manage().deleteAllCookies();
                await driver.executeScript("sessionStorage.clear(); localStorage.clear();");
            } catch (e) { }
        } catch (e) { }
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    const loginAsAdminAndOpenUploadModal = async () => {
        await driver.get("http://localhost:5173/auth");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Dùng tài khoản admin
        await driver.findElement(By.xpath('//input[@placeholder="Email"]')).sendKeys("string@gmail.com");
        await driver.findElement(By.xpath('//input[@placeholder="Password"]')).sendKeys("12345678");

        const signInBtn = await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]'));
        await driver.executeScript("arguments[0].click();", signInBtn);

        await driver.wait(until.urlContains("/admin"), 10000);

        // Click nút "+ ĐĂNG ĐỀ THI" trên Header
        const uploadBtnXPath = '//span[contains(text(), "ĐĂNG ĐỀ THI")]';

        const uploadBtn = await driver.wait(
            until.elementLocated(By.xpath(uploadBtnXPath)),
            15000
        );
        await driver.executeScript("arguments[0].click();", uploadBtn);

        // Chờ Modal "Upload Đề TOEIC" hiện ra
        await driver.wait(
            until.elementLocated(By.xpath('//h2[contains(text(), "Upload Đề")] | //*[contains(text(), "Upload Đề TOEIC")]')),
            5000
        );
    };

    test("TC-01: Thực hiện luồng Upload JSON hoàn chỉnh", async () => {
        console.log("🚀 TC-01: Upload file và submit");
        await loginAsAdminAndOpenUploadModal();

        await new Promise((resolve) => setTimeout(resolve, 1500)); // Chờ animation Modal mở xong

        // 1. TÌM VÀ NHẬP TITLE (Thêm Key.TAB để ép React lưu state)
        const titleXPath = '//h2[contains(., "Upload Đề")]/following-sibling::div[1]//input';
        const titleInput = await driver.wait(
            until.elementLocated(By.xpath(titleXPath)),
            5000
        );
        await driver.executeScript("arguments[0].focus();", titleInput);
        await titleInput.clear();
        await titleInput.sendKeys("Listening Test 1 - ETS 2022", Key.TAB);
        console.log("✅ Đã nhập Title");

        // 2. TÌM VÀ NHẬP TIME (MINUTES) - ĐÂY LÀ TRƯỜNG BỊ THIẾU
        const timeInput = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "Time")]/following::input[1]')),
            5000
        );
        await driver.executeScript("arguments[0].focus();", timeInput);
        await timeInput.clear();
        await timeInput.sendKeys("45", Key.TAB);
        console.log("✅ Đã nhập Thời gian (45 phút)");

        // 3. Chọn Skill Listening
        const skillDropdown = await driver.wait(
            until.elementLocated(By.xpath('//select[@name="skill"]')),
            5000
        );
        await skillDropdown.click();
        await new Promise((resolve) => setTimeout(resolve, 500));

        const listeningOption = await driver.wait(
            until.elementLocated(By.xpath('//select[@name="skill"]//option[contains(text(), "Listening")]')),
            5000
        );
        await listeningOption.click();
        console.log("✅ Đã đổi Skill sang Listening");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 4. Upload File JSON
        const fileInput = await driver.wait(
            until.elementLocated(By.xpath('//input[@type="file"]')),
            10000
        );
        await fileInput.sendKeys(jsonFilePath);
        console.log("✅ Đã đính kèm file JSON");

        // 5. Chờ nút Submit đổi tên thành "Upload ETS — 100 câu hỏi"
        const submitBtn = await driver.wait(
            until.elementLocated(By.xpath('//button[contains(., "Upload ETS") and contains(., "100 câu hỏi")]')),
            15000
        );
        console.log("✅ Hệ thống đã parse thành công 100 câu hỏi");

        // 6. Click nút Submit
        await driver.executeScript("arguments[0].click();", submitBtn);
        console.log("⏳ Đang gửi API tải 100 câu hỏi lên Server, quá trình này mất khoảng 26s...");

        // 7. Ép Selenium CHỜ ĐÚNG 35 GIÂY ĐỂ ĐÓN ALERT THÀNH CÔNG
        try {
            await driver.wait(until.alertIsPresent(), 35000); // Chờ tối đa 35 giây
            const alert = await driver.switchTo().alert();
            const alertText = await alert.getText();

            // Kiểm tra xem Alert có chứa chữ "thành công" không
            expect(alertText.toLowerCase()).toContain("thành công");
            console.log(`🎉 BINGO! Alert phản hồi: "${alertText}"`);

            await alert.accept(); // Bấm OK

            await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (e) {
            console.log("❌ Lỗi: Không nhận được Alert thành công!");
            throw e;
        }
    }, 90000);
});