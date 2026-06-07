import { createDriver } from "../config/selenium.config.js";
import { By, until, Key } from "selenium-webdriver";

describe("BLACK BOX - Admin Quản lý Đề thi", () => {
    let driver;

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
        console.log("📋 beforeAll: Starting Admin Exam Tests...");
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
                // Ignore navigation errors
            }
            try {
                await driver.manage().deleteAllCookies();
                await driver.executeScript("sessionStorage.clear(); localStorage.clear();");
            } catch (e) {
                // Ignore cookie clearing errors
            }
        } catch (e) {
            console.log("afterEach error:", e.message);
        }
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });
    const loginAsAdminAndGoToExams = async () => {
        await driver.get("http://localhost:5173/auth");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // ⚠️ LƯU Ý: Đổi email và pass này thành TÀI KHOẢN ADMIN của bạn
        await driver.findElement(By.xpath('//input[@placeholder="Email"]')).sendKeys("string@gmail.com");
        await driver.findElement(By.xpath('//input[@placeholder="Password"]')).sendKeys("12345678");

        const signInBtn = await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]'));
        await driver.executeScript("arguments[0].click();", signInBtn);

        // Chờ login xong, điều hướng thẳng vào trang quản lý đề (Sửa lại URL nếu team bạn để route khác)
        await driver.wait(until.urlContains("/admin/dashboard"), 10000);
        await driver.get("http://localhost:5173/admin/exams");
        await clearUnexpectedAlerts(driver);

        // Đợi Tiêu đề "Đề thi vừa đăng" xuất hiện
        await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "Đề thi vừa đăng")]')),
            15000
        );
    };

    test("TC-01: Hiển thị danh sách đề thi đầy đủ", async () => {
        console.log("🚀 TC-01: Kiểm tra giao diện danh sách đề thi");
        await loginAsAdminAndGoToExams();

        // Verify thẻ đề thi tồn tại (Ví dụ kiểm tra các nút "Xem đề")
        const viewButtons = await driver.findElements(By.xpath('//button[contains(text(), "Xem đề")]'));
        expect(viewButtons.length).toBeGreaterThan(0);

        console.log(`✅ Tìm thấy ${viewButtons.length} thẻ đề thi trên màn hình`);
    }, 40000);

    test("TC-02: Chỉnh sửa nhanh thời gian làm bài (Quick Edit)", async () => {
        console.log("🚀 TC-02: Test chức năng Quick Edit thời gian");
        await loginAsAdminAndGoToExams();

        const timeDisplay = await driver.wait(
            until.elementLocated(By.xpath('(//span[@title="Click để sửa thời gian"])[1]')),
            10000
        );
        await driver.executeScript("arguments[0].click();", timeDisplay);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 2. Chờ ô input số hiện ra
        const timeInput = await driver.wait(
            until.elementLocated(By.xpath('//input[@type="number"]')),
            5000
        );

        // 3. Xóa số cũ, nhập số mới
        await timeInput.sendKeys(Key.chord(Key.CONTROL, "a"), Key.DELETE);
        await timeInput.sendKeys("60");

        // 4. Click dấu Check màu xanh
        const saveBtn = await driver.findElement(
            By.xpath('//button[contains(@class, "emerald") or contains(text(), "✓")]')
        );
        await driver.executeScript("arguments[0].click();", saveBtn);

        await clearUnexpectedAlerts(driver);
        console.log("✅ Đã thao tác đổi thời gian thành công");
    }, 40000);

    test("TC-03: Click nút Xem đề", async () => {
        console.log("🚀 TC-03: Click nút Xem đề");
        await loginAsAdminAndGoToExams();

        // Click nút "Xem đề" của card ĐẦU TIÊN
        const firstViewBtn = await driver.wait(
            until.elementLocated(By.xpath('(//button[contains(text(), "Xem đề")])[1]')),
            5000
        );
        await driver.executeScript("arguments[0].click();", firstViewBtn);
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Verify hệ thống đã chuyển hướng khỏi trang hiện tại (Hoặc bung modal chi tiết)
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).not.toBe("http://localhost:5173/admin/exams");
        console.log("✅ Đã chuyển hướng sang trang Xem đề");
    }, 40000);

    test("TC-04: Xóa đề thi (Nút thùng rác)", async () => {
        console.log("🚀 TC-04: Xóa đề thi");
        await loginAsAdminAndGoToExams();

        // 1. Tìm nút Xóa (thùng rác) nằm NGAY CẠNH nút "Xem đề" của card ĐẦU TIÊN
        const trashBtnXPath = '(//button[contains(text(), "Xem đề")])[1]/following-sibling::button';

        const deleteBtn = await driver.wait(
            until.elementLocated(By.xpath(trashBtnXPath)),
            5000
        );
        await driver.executeScript("arguments[0].click();", deleteBtn);

        // 2. Chờ Native Browser Alert xuất hiện
        await driver.wait(until.alertIsPresent(), 5000);

        // 3. Switch (chuyển hướng) Selenium sang cái Alert đó
        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();

        // Verify nội dung Alert có chứa chuỗi xác nhận không
        expect(alertText).toContain("Bạn có chắc chắn muốn xóa đề thi");
        console.log(`✅ Alert xóa hiển thị với nội dung: "${alertText}"`);
        await alert.dismiss();
        console.log("✅ Đã bấm Cancel để giữ lại đề thi");
    }, 40000);
});