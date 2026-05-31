
import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import chromedriver from 'chromedriver';

export const createDriver = async () => {
    try {
        console.log('🔧 Starting WebDriver initialization...');
        console.log('ℹ️  Chromedriver service:', chromedriver.path);

        let options = new chrome.Options();
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--disable-extensions');
        options.addArguments('--disable-popup-blocking');
        options.addArguments('--disable-notifications');
        options.addArguments('--disable-blink-features=AutomationControlled');
        options.addArguments('--window-size=1920,1080');

        const driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .setChromeService(new chrome.ServiceBuilder(chromedriver.path))
            .build();

        console.log('✅ WebDriver connected successfully');

        await driver.manage().setTimeouts({
            implicit: 15000,
            pageLoad: 30000
        });

        console.log('✅ Timeouts configured');
        return driver;
    } catch (error) {
        console.error('❌ ERROR during WebDriver initialization:', error.message);
        throw error;
    }
};