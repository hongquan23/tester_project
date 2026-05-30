
import { createDriver } from '../config/selenium.config.js';
import { By, until } from 'selenium-webdriver';

describe('BLACK BOX - Authentication', () => {
    let driver;

    beforeAll(async () => {
        console.log('📋 beforeAll: Starting...');
        driver = await createDriver();
        console.log('📋 beforeAll: Driver created successfully');
    }, 180000); // 3 minute timeout for beforeAll

    afterEach(async () => {
        try {
            // Clear cookies and session storage to reset state between tests
            await driver.manage().deleteAllCookies();
            await driver.executeScript('sessionStorage.clear(); localStorage.clear();');
            console.log('🧹 Cleared cookies and storage');
        } catch (e) {
            console.log('⚠️  Could not clear cookies:', e.message);
        }
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    test('TC-01: Đăng nhập thành công', async () => {
        // Bước 1: Mở trang login
        await driver.get('http://localhost:5173/auth');
        console.log('✓ Mở trang login thành công');

        // Bước 2: Nhập email
        const emailInput = await driver.findElement(By.xpath('//input[@placeholder="Email"]'));
        await emailInput.sendKeys('trung8d2005@gmail.com');
        console.log('✓ Nhập email: trung8d2005@gmail.com');

        // Bước 3: Nhập password
        const passwordInput = await driver.findElement(By.xpath('//input[@placeholder="Password"]'));
        await passwordInput.sendKeys('12345678');
        console.log('✓ Nhập password');

        // Bước 4: Click nút Sign In
        const loginBtn = await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]'));
        await loginBtn.click();
        console.log('✓ Click nút Sign In');

        // Bước 5: Kiểm tra điều hướng đến Dashboard
        await driver.wait(until.urlContains('/member/dashboard'), 10000);
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toContain('/member/dashboard');
        console.log('✓ Điều hướng đến Dashboard thành công');

        // Bước 6: Kiểm tra Dashboard heading
        const dashboardHeading = await driver.wait(
            until.elementLocated(By.xpath('//h1[contains(text(), "LearnWithMe")]')),
            10000
        );
        const isDisplayed = await dashboardHeading.isDisplayed();
        expect(isDisplayed).toBe(true);
        console.log('✓ Dashboard title hiển thị');
    }, 90000); // 90 second timeout for this test

    test('TC-02: Đăng nhập thất bại - Email sai', async () => {
        // Wait to ensure cookies are cleared
        await new Promise(resolve => setTimeout(resolve, 500));

        await driver.get('http://localhost:5173/auth');
        console.log('✓ Mở trang login');

        const emailInput = await driver.findElement(By.xpath('//input[@placeholder="Email"]'));
        await emailInput.sendKeys('invalid@example.com');
        console.log('✓ Nhập email sai');

        const passwordInput = await driver.findElement(By.xpath('//input[@placeholder="Password"]'));
        await passwordInput.sendKeys('12345678');
        console.log('✓ Nhập password');

        const loginBtn = await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]'));
        await loginBtn.click();
        console.log('✓ Click nút Sign In');

        // Kiểm tra error message
        const errorMsg = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "Invalid")]')),
            5000
        );
        expect(await errorMsg.isDisplayed()).toBe(true);
        console.log('✓ Hiển thị error message');
    }, 90000); // 90 second timeout for this test

    test('TC-03: Logout thành công', async () => {
        // Wait to ensure cookies are cleared
        await new Promise(resolve => setTimeout(resolve, 500));

        // Login trước
        await driver.get('http://localhost:5173/auth');
        console.log('✓ Mở trang login');

        const emailInput = await driver.findElement(By.xpath('//input[@placeholder="Email"]'));
        await emailInput.sendKeys('trung8d2005@gmail.com');
        const passwordInput = await driver.findElement(By.xpath('//input[@placeholder="Password"]'));
        await passwordInput.sendKeys('12345678');
        const loginBtn = await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]'));
        await loginBtn.click();
        console.log('✓ Đăng nhập thành công');

        // Wait for dashboard
        await driver.wait(until.urlContains('/member/dashboard'), 10000);
        console.log('✓ Đã vào dashboard');

        // Click avatar/user menu in header
        const avatarBtn = await driver.wait(
            until.elementLocated(By.xpath('//div[contains(@class, "avatar")] | //button[contains(., "T")]')),
            5000
        );
        await avatarBtn.click();
        console.log('✓ Click avatar menu');

        // Click "Đăng xuất" option in dropdown
        const logoutOption = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(), "Đăng xuất")]')),
            5000
        );
        await logoutOption.click();
        console.log('✓ Click Đăng xuất');

        // Kiểm tra điều hướng về login
        await driver.wait(until.urlContains('/auth'), 10000);
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toContain('/auth');
        console.log('✓ Logout thành công');
    }, 90000); // 90 second timeout for this test
});