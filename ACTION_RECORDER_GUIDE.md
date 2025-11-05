# 🎬 Action Recorder - Record & Generate Automation Scripts

## Overview

The Action Recorder captures all your browser interactions and automatically generates automation scripts. No XPath, no brittle selectors - just smart, semantic element detection!

## 🚀 Quick Start

### Record Your Actions

```bash
node record-actions.js https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/
```

### What Happens:

1. **Browser opens** to your URL
2. **Perform your workflow** (login, click buttons, fill forms, navigate)
3. **Press Ctrl+C** when done
4. **Scripts are generated automatically!**

## 📋 What It Captures

### ✅ Captured Actions:
- **Form Inputs** - by name, placeholder, ID, aria-label
- **Button Clicks** - by text, name, ID, role
- **Form Submissions** - automatic detection
- **Page Navigation** - tracks URL changes
- **Multi-step Workflows** - complete login flows

### ❌ What It Doesn't Use:
- **NO XPath** - only semantic selectors
- **NO Brittle Selectors** - smart element detection
- **NO Hardcoded Positions** - uses element properties

## 🎯 Use Cases

### 1. Record a Login Flow

```bash
node record-actions.js https://example.com/login
```

**You do:**
1. Fill username
2. Fill password
3. Click "Log in"
4. Click agreement toggle
5. Click "Next"
6. Click "Finish"
7. Press Ctrl+C

**It generates:**
- `generated-playwright-script.js` - Standalone Playwright script
- `generated-smart-filler-script.js` - Smart Form Filler script
- `recorded-actions.json` - Raw action data

### 2. Record Multi-Page Workflow

```bash
node record-actions.js https://example.com/app
```

Captures:
- Login page actions
- Agreement page actions
- Dashboard navigation
- Form submissions
- Button clicks across pages

### 3. Record Complex Forms

```bash
node record-actions.js https://example.com/registration
```

Captures:
- Text inputs
- Dropdowns
- Checkboxes
- Radio buttons
- File uploads
- Multi-step forms

## 📝 Generated Scripts

### Playwright Script Format

```javascript
import { chromium } from 'playwright';

async function runAutomation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to: https://example.com/login
  await page.goto('https://example.com/login');
  
  // Fill username
  await page.fill('[name="username"]', 'myuser');
  
  // Fill password
  await page.fill('[name="password"]', 'YOUR_PASSWORD_HERE');
  
  // Click Log in
  await page.click('button:has-text("Log in")');
  
  // Click Agree
  await page.click('[role="switch"]');
  
  // Click Next
  await page.click('text="Next"');
  
  await browser.close();
}

runAutomation();
```

### Smart Form Filler Script Format

```javascript
import { SmartFormFiller } from './src/form-filler.js';
import { SmartNavigator } from './src/smart-navigator.js';

async function runWorkflow() {
  const filler = new SmartFormFiller({
    headless: false,
    screenshot: true,
  });

  // Fill form with data
  await filler.fillForm({
    'username': 'myuser',
    'password': 'YOUR_PASSWORD_HERE',
  });

  // Submit form
  await filler.submit();

  // Auto-navigate through multi-step flow
  const navigator = new SmartNavigator(filler.page);
  await navigator.autoNavigate();

  await filler.close();
}

runWorkflow();
```

## 🎨 Advanced Usage

### Specify Output Format

```bash
# Generate only Playwright script
node record-actions.js https://example.com --format playwright

# Generate only Smart Form Filler script
node record-actions.js https://example.com --format smart-form-filler

# Generate both (default)
node record-actions.js https://example.com --format both
```

### Custom Output Filename

```bash
node record-actions.js https://example.com --output my-workflow.js
```

### Programmatic Usage

```javascript
import { chromium } from 'playwright';
import { ActionRecorder } from './src/action-recorder.js';

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
const recorder = new ActionRecorder(page);

// Start recording
await page.goto('https://example.com');
await recorder.startRecording();

// ... user performs actions ...

// Stop and get actions
await recorder.stopRecording();
const actions = recorder.getActions();

// Generate script
const script = recorder.generateScript({ format: 'playwright' });
console.log(script);

// Save to file
await recorder.saveScript('my-automation.js', 'playwright');
```

## 🔍 How It Works

### 1. Injection
Injects JavaScript into the page to monitor DOM events

### 2. Smart Selector Detection
For each element, it tries (in order):
1. **ID** - `#login-button`
2. **Name** - `[name="username"]`
3. **Placeholder** - `[placeholder="Enter email"]`
4. **ARIA Label** - `[aria-label="Submit form"]`
5. **Text Content** - `text="Log in"`
6. **Class** - `.submit-btn`
7. **Role** - `[role="button"]`

### 3. Action Capture
Records:
- Click events with element info
- Input changes with field names
- Form submissions
- URL navigation

### 4. Script Generation
Converts actions to:
- Playwright commands
- Smart Form Filler commands
- Human-readable code with comments

## 📊 Output Files

### `recorded-actions.json`
Raw action data in JSON format:

```json
[
  {
    "type": "input",
    "timestamp": 1699123456789,
    "selector": {
      "type": "name",
      "value": "username",
      "selector": "[name=\"username\"]"
    },
    "element": {
      "tagName": "input",
      "type": "text",
      "name": "username",
      "placeholder": "Username"
    },
    "value": "myuser",
    "url": "https://example.com/login"
  },
  {
    "type": "click",
    "timestamp": 1699123457890,
    "selector": {
      "type": "text",
      "value": "Log in",
      "selector": "text=\"Log in\""
    },
    "element": {
      "tagName": "button",
      "type": "submit",
      "text": "Log in"
    },
    "url": "https://example.com/login"
  }
]
```

### Generated Scripts
- Fully runnable automation scripts
- Comments explaining each action
- Password fields marked as `YOUR_PASSWORD_HERE`
- Smart selectors (no XPath!)

## 🛡️ Security

- **Passwords are hidden** - recorded as `***HIDDEN***`
- **Sensitive data** - marked in generated scripts
- **Local only** - no data sent anywhere
- **You control** - review scripts before running

## 💡 Tips

### Best Practices:
1. **Start fresh** - Begin from the login page
2. **Go slow** - Give page time to load between actions
3. **Complete flow** - Finish the entire workflow
4. **Review script** - Check generated code before running
5. **Update passwords** - Replace `YOUR_PASSWORD_HERE` with actual values

### Common Workflows:
- **Login flows** - Username → Password → Submit → Agreement → Next → Finish
- **Form submissions** - Fill all fields → Submit → Confirmation
- **Multi-page** - Page 1 → Next → Page 2 → Next → Page 3 → Submit
- **Search & filter** - Enter search → Click search → Apply filters → View results

## 🔧 Troubleshooting

### "No actions recorded"
- Make sure you interacted with the page
- Check browser console for errors
- Try clicking and typing again

### "Generated script doesn't work"
- Review the selectors in the script
- Some elements may need manual adjustment
- Check if page structure changed

### "Password not filled"
- Replace `YOUR_PASSWORD_HERE` with actual password
- Or use environment variables for security

## 🎉 Example: Complete PARS Login

```bash
# Record the PARS login workflow
node record-actions.js https://hrsa-dcpaas--dcpuat.sandbox.my.site.com/pars/s/login/
```

**Actions performed:**
1. Fill username: `sarokiasamy2@dmigs.com.dcp.dcpuat`
2. Fill password: `Grantee@123`
3. Click "Log in"
4. Click agreement toggle
5. Click "Next"
6. Click "Finish"
7. Press Ctrl+C

**Generated script works for:**
- ✅ Future logins
- ✅ Automated testing
- ✅ Batch processing
- ✅ CI/CD pipelines

## 🚀 Next Steps

1. **Record your workflow** - `node record-actions.js <url>`
2. **Review generated scripts** - Check the output files
3. **Update passwords** - Replace placeholders
4. **Run automation** - `node generated-playwright-script.js`
5. **Integrate** - Use in your testing or automation pipeline

---

**Built with ❤️ for developers who hate XPath!**
