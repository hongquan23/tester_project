// frontend/test/debug-chrome.js

import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { execSync } from 'child_process';

console.log('\n🔍 ===== CHROME DIAGNOSTICS =====\n');

// Check Chrome version
try {
  console.log('📌 Checking Chrome version...');
  const chromeVersion = execSync('wmic datafile where name="C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe" get Version /value').toString();
  console.log('Chrome Info:', chromeVersion);
} catch (e) {
  console.log('⚠️ Could not get Chrome version via WMI');
}

// Check Chrome executable
try {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  console.log('✓ Chrome found at:', chromePath);
} catch (e) {
  console.log('❌ Chrome not found');
}

// Test WebDriver connection
console.log('\n📦 Testing Selenium WebDriver...');
console.log('Creating Chrome options...');

const options = new chrome.Options();
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');
options.addArguments('--disable-gpu');

console.log('✓ Options created');
console.log('⏳ Attempting to connect (this will timeout after 30s)...\n');

(async () => {
  try {
    const driver = await Promise.race([
      new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout after 30s')), 30000)
      )
    ]);

    console.log('✅ SUCCESS! WebDriver connected!');
    
    // Test navigation
    console.log('Testing navigation to localhost:5173...');
    await driver.get('http://localhost:5173/login');
    console.log('✅ Navigation successful!');
    
    const title = await driver.getTitle();
    console.log('Page title:', title);
    
    await driver.quit();
    console.log('✅ Driver quit successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
})();