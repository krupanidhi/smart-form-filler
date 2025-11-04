# Fill ANY Page - Quick Reference

## 🚀 Three Ways to Fill Any Form

### 1. Command Line (Easiest)

```bash
# Fill any form
node fill-any-form.js https://example.com/form

# With custom data
node fill-any-form.js https://example.com/form --data "email=test@example.com,name=John"

# Fill and submit
node fill-any-form.js https://example.com/form --submit

# Analyze only
node fill-any-form.js https://example.com/form --analyze-only

# Keep browser open
node fill-any-form.js https://example.com/form --keep-open
```

### 2. Import Function (Most Flexible)

```javascript
import { quickFill } from './src/universal-filler.js';

// One line!
await quickFill('https://example.com/form', {
  'email': 'test@example.com',
  'name': 'John Doe',
});
```

### 3. Full Control

```javascript
import { fillAnyForm } from './src/universal-filler.js';

const result = await fillAnyForm('https://example.com/form', {
  customData: { 'email': 'test@example.com' },
  submit: true,
  analyze: true,
  keepOpen: true,
});
```

## 📋 Common Use Cases

### Login Pages

```bash
# Command line
node fill-any-form.js https://example.com/login --data "username=myuser,password=mypass" --submit

# Or in code
import { fillAndSubmit } from './src/universal-filler.js';

await fillAndSubmit('https://example.com/login', {
  'username': 'myuser',
  'password': 'mypass',
});
```

### Contact Forms

```bash
node fill-any-form.js https://example.com/contact --data "name=John,email=john@example.com,message=Hello"
```

### Registration Forms

```javascript
import { fillAnyForm } from './src/universal-filler.js';

await fillAnyForm('https://example.com/register', {
  customData: {
    'firstName': 'John',
    'lastName': 'Doe',
    'email': 'john@example.com',
    'password': 'SecurePass123!',
    'confirmPassword': 'SecurePass123!',
  },
  submit: true,
});
```

### Survey Forms

```bash
node fill-any-form.js https://example.com/survey --slow --keep-open
```

### Multi-Step Forms

```javascript
import { SmartFormFiller } from './src/form-filler.js';

const filler = new SmartFormFiller({ headless: false });

// Step 1
await filler.goto('https://example.com/form/step1');
await filler.fillForm({ 'name': 'John', 'email': 'john@example.com' });
await filler.submit();

// Step 2
await filler.page.waitForNavigation();
await filler.fillForm({ 'address': '123 Main St', 'city': 'New York' });
await filler.submit();

// Step 3
await filler.page.waitForNavigation();
await filler.fillForm({ 'payment': 'credit card' });
await filler.submit();

await filler.close();
```

## 🎯 Real Examples

### Your HRSA Login

```bash
# Command line
node fill-any-form.js https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn --data "username=YOUR_USER,password=YOUR_PASS" --keep-open

# Or create a script
import { quickFill } from './src/universal-filler.js';

await quickFill('https://ehbsec.hrsa.gov/EAuthNS/internal/account/SignIn', {
  'username': 'your_username',
  'password': 'your_password',
});
```

### Google Forms

```bash
node fill-any-form.js "https://docs.google.com/forms/d/YOUR_FORM_ID/viewform" --slow
```

### Job Applications

```javascript
await fillAnyForm('https://company.com/careers/apply', {
  customData: {
    'name': 'John Doe',
    'email': 'john@example.com',
    'phone': '555-1234',
    'resume': 'path/to/resume.pdf',
    'coverLetter': 'I am interested in...',
  },
  beforeFill: async (page) => {
    // Accept terms
    await page.check('#accept-terms');
  },
  submit: true,
});
```

### E-commerce Checkout

```javascript
const filler = new SmartFormFiller({ headless: false });

// Shipping info
await filler.goto('https://store.com/checkout');
await filler.fillForm({
  'name': 'John Doe',
  'address': '123 Main St',
  'city': 'New York',
  'zip': '10001',
});
await filler.submit();

// Payment info
await filler.page.waitForNavigation();
await filler.fillForm({
  'cardNumber': '4111111111111111',
  'expiry': '12/25',
  'cvv': '123',
});

await filler.close();
```

## 🔧 Advanced Options

### Wait for Dynamic Content

```javascript
await fillAnyForm('https://example.com/form', {
  waitForSelector: '#email-field', // Wait for this element
  customData: { 'email': 'test@example.com' },
});
```

### Custom Submit Button

```javascript
await fillAnyForm('https://example.com/form', {
  customData: { 'name': 'John' },
  submit: true,
  submitSelector: '#custom-submit-button',
});
```

### Before/After Hooks

```javascript
await fillAnyForm('https://example.com/form', {
  beforeFill: async (page) => {
    // Click cookie banner
    await page.click('#accept-cookies').catch(() => {});
    
    // Select dropdown
    await page.selectOption('#country', 'US');
  },
  
  afterFill: async (page) => {
    // Check terms
    await page.check('#terms');
    
    // Take custom screenshot
    await page.screenshot({ path: 'my-screenshot.png' });
  },
});
```

### Fill Multiple Pages

```javascript
import { fillMultipleForms } from './src/universal-filler.js';

const results = await fillMultipleForms([
  {
    url: 'https://site1.com/form',
    customData: { 'email': 'test@example.com' },
  },
  {
    url: 'https://site2.com/form',
    customData: { 'name': 'John Doe' },
  },
  {
    url: 'https://site3.com/form',
    customData: { 'company': 'Acme Corp' },
  },
], {
  headless: true,
  submit: false,
});

console.log('Results:', results);
```

## 📝 Template for Your Own Pages

Create a file `my-form.js`:

```javascript
import { fillAnyForm } from './src/universal-filler.js';

async function fillMyForm() {
  const result = await fillAnyForm('YOUR_URL_HERE', {
    customData: {
      // Add your field names and values
      'fieldName1': 'value1',
      'fieldName2': 'value2',
    },
    
    // Options
    analyze: true,      // See what fields are detected
    submit: false,      // Change to true when ready
    headless: false,    // Show browser
    keepOpen: true,     // Keep open for review
    
    // Optional: Custom logic
    beforeFill: async (page) => {
      // Add any setup code here
    },
    
    afterFill: async (page) => {
      // Add any cleanup code here
    },
  });
  
  console.log('Result:', result);
}

fillMyForm();
```

Run it:
```bash
node my-form.js
```

## 🐛 Troubleshooting

### Fields Not Filled?

```bash
# Analyze first to see what's detected
node fill-any-form.js YOUR_URL --analyze-only

# Then use exact field names
node fill-any-form.js YOUR_URL --data "exactFieldName=value"
```

### Page Loads Slowly?

```javascript
await fillAnyForm(url, {
  waitForSelector: '#main-form', // Wait for form to appear
  beforeFill: async (page) => {
    await page.waitForTimeout(3000); // Extra wait
  },
});
```

### Submit Button Not Found?

```javascript
await fillAnyForm(url, {
  submit: true,
  submitSelector: '#your-submit-button-id',
});
```

### Need to See What's Happening?

```bash
# Slow down and keep open
node fill-any-form.js YOUR_URL --slow --keep-open
```

## 💡 Pro Tips

1. **Always analyze first:**
   ```bash
   node fill-any-form.js YOUR_URL --analyze-only
   ```

2. **Use --keep-open for debugging:**
   ```bash
   node fill-any-form.js YOUR_URL --keep-open
   ```

3. **Check screenshots folder** after each run

4. **Start without --submit** until you're confident

5. **Use environment variables** for sensitive data:
   ```javascript
   customData: {
     'username': process.env.MY_USERNAME,
     'password': process.env.MY_PASSWORD,
   }
   ```

## 📚 More Examples

See `examples/fill-any-page.js` for 8 complete examples:

```bash
node examples/fill-any-page.js 1  # Quick fill
node examples/fill-any-page.js 2  # With options
node examples/fill-any-page.js 3  # Fill and submit
node examples/fill-any-page.js 4  # Analyze only
node examples/fill-any-page.js 5  # Multiple forms
node examples/fill-any-page.js 6  # Custom logic
node examples/fill-any-page.js 7  # Login flow
node examples/fill-any-page.js 8  # HRSA login
```

---

**You can now fill ANY form on ANY page!** 🎉
