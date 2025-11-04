# HRSA Login Automation Guide

## Quick Start

### Step 1: Run the Basic Example

```bash
node examples/hrsa-login.js
```

This will:
1. Open the HRSA login page
2. Detect all form fields
3. Fill username and password
4. Take screenshots
5. Wait for you to review (won't submit automatically)

### Step 2: Customize Your Credentials

Edit `examples/hrsa-login.js` and replace:

```javascript
await filler.fillForm({
  'username': 'YOUR_ACTUAL_USERNAME',
  'password': 'YOUR_ACTUAL_PASSWORD',
});
```

### Step 3: Enable Submission (When Ready)

Uncomment this line to actually submit:

```javascript
await filler.submit();
```

## Advanced Usage

### Analyze Form First

```javascript
// See what fields are detected
const analysis = await filler.analyzeForm();
console.log(analysis);
```

### Custom Field Names

If the auto-detection doesn't work, specify exact field names:

```javascript
await filler.fillForm({
  // Try multiple possible field names
  'username': 'your_username',
  'user': 'your_username',
  'email': 'your_username',
  'login': 'your_username',
  
  'password': 'your_password',
  'pass': 'your_password',
  'pwd': 'your_password',
});
```

### Manual Filling (Fallback)

If automatic detection fails, use manual selectors:

```javascript
// Fill by ID
await filler.page.fill('#username', 'your_username');
await filler.page.fill('#password', 'your_password');

// Fill by name attribute
await filler.page.fill('[name="username"]', 'your_username');
await filler.page.fill('[name="password"]', 'your_password');

// Fill by type
await filler.page.fill('input[type="text"]', 'your_username');
await filler.page.fill('input[type="password"]', 'your_password');
```

### Wait for Elements

If the page loads slowly:

```javascript
// Wait for specific element
await filler.page.waitForSelector('#username');

// Wait for network to be idle
await filler.page.waitForLoadState('networkidle');

// Wait for specific time
await filler.page.waitForTimeout(2000); // 2 seconds
```

### Handle Login Button

```javascript
// Click login button
await filler.page.click('button[type="submit"]');

// Or by text
await filler.page.click('text=Sign In');
await filler.page.click('text=Login');

// Wait for navigation after login
await filler.page.waitForNavigation();
```

## Complete Example

```javascript
import { SmartFormFiller } from '../src/form-filler.js';

async function loginToHRSA() {
  const filler = new SmartFormFiller({
    headless: false,
    screenshot: true,
  });

  try {
    // Navigate
    await filler.goto('https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn');
    
    // Wait for page
    await filler.page.waitForLoadState('networkidle');
    
    // Fill form
    await filler.fillForm({
      'username': 'your_username',
      'password': 'your_password',
    });
    
    // Take screenshot
    await filler.takeScreenshot('before-login');
    
    // Submit
    await filler.submit();
    
    // Wait for login to complete
    await filler.page.waitForNavigation();
    
    // Verify login success
    const url = filler.page.url();
    console.log('Current URL:', url);
    
    // Take screenshot of logged-in page
    await filler.takeScreenshot('after-login');
    
    await filler.close();
    
  } catch (error) {
    console.error('Login failed:', error);
    await filler.takeScreenshot('login-error');
    await filler.close();
  }
}

loginToHRSA();
```

## Debugging Tips

### 1. See What Fields Are Detected

```javascript
const fields = await filler.detectFields();
console.log(JSON.stringify(fields, null, 2));
```

### 2. Keep Browser Open

```javascript
// Don't close immediately
await filler.page.waitForTimeout(30000); // 30 seconds
await filler.close();
```

### 3. Slow Down Actions

```javascript
const filler = new SmartFormFiller({
  headless: false,
  slowMo: 500, // 500ms delay between actions
});
```

### 4. Take Screenshots at Each Step

```javascript
await filler.takeScreenshot('step1-loaded');
await filler.fillForm({ ... });
await filler.takeScreenshot('step2-filled');
await filler.submit();
await filler.takeScreenshot('step3-submitted');
```

### 5. Inspect Page Elements

```javascript
// Get all input fields
const inputs = await filler.page.$$('input');
console.log(`Found ${inputs.length} input fields`);

// Get field attributes
const username = await filler.page.$('#username');
const name = await username.getAttribute('name');
console.log('Username field name:', name);
```

## Common Issues

### Issue 1: Fields Not Detected

**Solution:** Wait longer for page to load

```javascript
await filler.page.waitForLoadState('networkidle');
await filler.page.waitForTimeout(2000);
```

### Issue 2: Wrong Field Filled

**Solution:** Use specific field names

```javascript
await filler.fillForm({
  'specificFieldName': 'value',
});
```

### Issue 3: Submit Button Not Found

**Solution:** Use specific selector

```javascript
await filler.page.click('#login-button');
// or
await filler.page.click('button:has-text("Sign In")');
```

### Issue 4: CAPTCHA or 2FA

**Solution:** Pause before submission

```javascript
await filler.fillForm({ ... });
console.log('Please complete CAPTCHA manually...');
await filler.page.waitForTimeout(60000); // Wait 60 seconds
await filler.submit();
```

## Security Notes

⚠️ **Important:**
- Never commit credentials to git
- Use environment variables for sensitive data
- Test with test accounts first
- Be aware of rate limiting

### Using Environment Variables

Create `.env` file:
```
HRSA_USERNAME=your_username
HRSA_PASSWORD=your_password
```

In your code:
```javascript
import dotenv from 'dotenv';
dotenv.config();

await filler.fillForm({
  'username': process.env.HRSA_USERNAME,
  'password': process.env.HRSA_PASSWORD,
});
```

## Run Examples

```bash
# Basic example
node examples/hrsa-login.js

# Advanced example with fallbacks
node examples/hrsa-login-advanced.js
```

## Next Steps

1. Run `node examples/hrsa-login.js` to test
2. Check screenshots in `screenshots/` folder
3. Adjust field names if needed
4. Enable submission when ready
5. Add to your test automation suite

---

**Need help?** Check the main [USAGE_GUIDE.md](USAGE_GUIDE.md) for more details.
