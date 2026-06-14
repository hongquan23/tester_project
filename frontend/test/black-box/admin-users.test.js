import { createDriver } from "../config/selenium.config.js";
import { By, until } from "selenium-webdriver";

describe("BLACK BOX - Admin Quản lý Người dùng", () => {
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
        console.log("📋 beforeAll: Starting Admin User Tests...");
        driver = await createDriver();
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

    const loginAsAdminAndGoToUsers = async () => {
        await driver.get("http://localhost:5173/auth");
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Dùng tài khoản admin từ ảnh của bạn
        await driver.findElement(By.xpath('//input[@placeholder="Email"]')).sendKeys("string@gmail.com");
        await driver.findElement(By.xpath('//input[@placeholder="Password"]')).sendKeys("12345678");

        const signInBtn = await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]'));
        await driver.executeScript("arguments[0].click();", signInBtn);

        await driver.wait(until.urlContains("/admin"), 10000);

        // Điều hướng vào trang Quản lý người dùng
        await driver.get("http://localhost:5173/admin/users");
        await clearUnexpectedAlerts(driver);

        // Đợi Tiêu đề "Quản lý người dùng" xuất hiện
        await driver.wait(
            until.elementLocated(By.xpath('//h1[contains(text(), "Quản lý người dùng")] | //*[contains(text(), "Quản lý người dùng") and not(contains(text(), "<-"))]')),
            15000
        );
    };

    test("TC-01: Hiển thị giao diện và tiêu đề cột", async () => {
        console.log("🚀 TC-01: Kiểm tra giao diện Quản lý người dùng");
        await loginAsAdminAndGoToUsers();

        // Verify các tiêu đề cột của bảng tồn tại
        const idColumn = await driver.findElements(By.xpath('//*[text()="ID"]'));
        const nameColumn = await driver.findElements(By.xpath('//*[text()="Tên"]'));
        const emailColumn = await driver.findElements(By.xpath('//*[text()="Email"]'));
        const actionColumn = await driver.findElements(By.xpath('//*[text()="Hành động"]'));

        expect(idColumn.length).toBeGreaterThan(0);
        expect(nameColumn.length).toBeGreaterThan(0);
        expect(emailColumn.length).toBeGreaterThan(0);
        expect(actionColumn.length).toBeGreaterThan(0);
        console.log("✅ Các tiêu đề cột hiển thị đầy đủ");
    }, 40000);

    test("TC-02: Hiển thị danh sách dữ liệu User", async () => {
        console.log("🚀 TC-02: Kiểm tra dữ liệu danh sách người dùng");
        await loginAsAdminAndGoToUsers();

        // Verify có dữ liệu user render ra (bắt thông qua dấu @ của email)
        const emailElements = await driver.wait(
            until.elementsLocated(By.xpath('//*[contains(text(), "@gmail.com") or contains(text(), "@example.com")]')),
            10000
        );

        expect(emailElements.length).toBeGreaterThan(0);
        console.log(`✅ Tìm thấy ${emailElements.length} user trong danh sách`);
    }, 40000);

    test("TC-03: Thao tác Xóa người dùng (Icon thùng rác)", async () => {
        console.log("🚀 TC-03: Xóa người dùng");
        await loginAsAdminAndGoToUsers();

        const trashBtnXPath = '(//*[@title="Xoá người dùng"] | //*[name()="svg" and contains(@class, "lucide-trash")])[1]';

        const deleteBtn = await driver.wait(
            until.elementLocated(By.xpath(trashBtnXPath)),
            10000
        );
        await driver.executeScript(
            "arguments[0].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));", 
            deleteBtn
        );

        // Chờ Native Browser Alert xuất hiện
        await driver.wait(until.alertIsPresent(), 5000);

        const alert = await driver.switchTo().alert();
        const alertText = await alert.getText();

        // Verify alert có hiện lên đúng không
        expect(alertText).not.toBeNull();
        console.log(`✅ Alert xóa hiển thị với nội dung: "${alertText}"`);

        // Hủy xóa để bảo toàn dữ liệu user test
        await alert.dismiss();
        console.log("✅ Đã bấm Cancel để không xóa mất user");
    }, 40000);

    test("TC-04: Nút Quay lại", async () => {
        console.log("🚀 TC-04: Kiểm tra nút Quay lại");
        await loginAsAdminAndGoToUsers();

        // Tìm và click nút "<- Quay lại"
        const backBtn = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "Quay lại")]')),
            5000
        );
        await driver.executeScript("arguments[0].click();", backBtn);
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Đợi chuyển trang

        // Verify hệ thống đã chuyển hướng khỏi trang Quản lý User
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).not.toContain("/admin/users");
        console.log("✅ Đã điều hướng quay lại thành công");
    }, 40000);
});