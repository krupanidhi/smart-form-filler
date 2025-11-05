# 🤖 Smart Form Filler

An intelligent web form automation tool that uses AI-powered field detection and DOM analysis to automatically fill forms **without relying on XPath or brittle selectors**.

## ✨ Features

- 🎯 **Intelligent Field Detection** - Automatically identifies form fields using multiple strategies
- 🧠 **AI-Powered Classification** - Recognizes field types (email, phone, name, etc.) without manual configuration
- 📝 **Smart Data Generation** - Generates realistic test data using Faker.js
- 🔍 **No XPath Required** - Uses robust selectors (ID, name, label, ARIA) instead of fragile XPath
- 🎬 **Action Recorder** - Record browser actions and generate automation scripts (NEW!)
- 🤖 **Smart Navigator** - Intelligently handles multi-step flows (agreements, Next, Finish buttons)
- 🌐 **Multi-language Support** - Works with forms in different languages
- 📸 **Screenshot Capture** - Automatically captures screenshots for debugging
- 🎨 **Vision AI Integration** - Optional GPT-4 Vision support for enhanced detection
- 🚀 **Easy Integration** - Simple API for test automation

## 🚀 Quick Start

### Installation

```bash
cd C:\Users\KPeterson\CascadeProjects\smart-form-filler
npm install
```

### Basic Usage

```javascript
import { SmartFormFiller } from './src/form-filler.js';

const filler = new SmartFormFiller({
  headless: false,  // Show browser
  screenshot: true, // Save screenshots
});

// Navigate and fill
await filler.goto('https://example.com/form');
await filler.fillForm();
await filler.close();
```

### One-Liner Quick Fill

```javascript
import { quickFill } from './src/index.js';

await quickFill('https://example.com/form');
```

## 🎬 Action Recorder (NEW!)

Record your browser actions and automatically generate automation scripts!

### Record Actions

```bash
node record-actions.js https://example.com/login
```

**What it does:**
1. Opens browser to your URL
2. Records ALL your actions (clicks, inputs, navigation)
3. Generates automation scripts when you press Ctrl+C

**What it captures:**
- ✅ Form inputs (by name, placeholder, ID)
- ✅ Button clicks (by text, role, aria-label)
- ✅ Multi-step workflows
- ✅ Page navigation
- ❌ NO XPATH - only semantic selectors!

### Generated Scripts

**Playwright format:**
```javascript
await page.fill('[name="username"]', 'myuser');
await page.click('text="Log in"');
await page.click('[role="switch"]'); // Agreement toggle
await page.click('text="Next"');
```

**Smart Form Filler format:**
```javascript
await filler.fillForm({ username: 'myuser', password: 'pass' });
await filler.submit();
await navigator.autoNavigate(); // Handles Next, Finish, etc.
```

📖 **[Full Action Recorder Guide](./ACTION_RECORDER_GUIDE.md)**

## 📖 Usage Examples

### 1. Simple Form Filling

```javascript
import { SmartFormFiller } from './src/form-filler.js';

const filler = new SmartFormFiller();
await filler.goto('https://example.com/contact');
const result = await filler.fillForm();

console.log(`Filled ${result.filled}/${result.total} fields`);
await filler.close();
```

### 2. Custom Test Data

```javascript
const filler = new SmartFormFiller({
  customData: {
    'email': 'test@example.com',
    'firstName': 'John',
    'lastName': 'Doe',
    'company': 'Acme Corp',
  },
});

await filler.goto('https://example.com/signup');
await filler.fillForm();
```

### 3. Form Analysis

```javascript
const filler = new SmartFormFiller();
await filler.goto('https://example.com/form');

// Analyze form structure
const analysis = await filler.analyzeForm();
console.log(analysis);
// {
//   totalFields: 8,
//   requiredFields: 3,
//   optionalFields: 5,
//   fieldTypes: { email: 1, text: 4, tel: 1, textarea: 2 }
// }
```

### 4. Complete Automation Flow

```javascript
const result = await filler.automate('https://example.com/form', {
  analyze: true,        // Analyze form first
  submit: true,         // Submit after filling
  submitSelector: '#submit-btn',
  customData: {
    'email': 'test@example.com',
  },
  keepOpen: false,      // Close browser when done
});
```

### 5. Test Automation

```javascript
import { SmartFormFiller } from './src/form-filler.js';

async function testRegistration() {
  const filler = new SmartFormFiller({ headless: true });
  
  await filler.goto('https://example.com/register');
  await filler.fillForm({
    'username': 'testuser',
    'password': 'SecurePass123!',
  });
  
  await filler.submit();
  
  // Verify success
  await filler.page.waitForSelector('.success');
  await filler.close();
}
```

## 🎯 How It Works

### 1. Field Detection

The tool uses multiple strategies to detect form fields:

- **DOM Analysis** - Scans for `input`, `textarea`, `select` elements
- **Visibility Check** - Filters out hidden fields
- **Context Extraction** - Captures labels, placeholders, ARIA attributes
- **Relationship Mapping** - Finds associated labels and nearby text

### 2. Field Classification

Fields are classified using:

- **Pattern Matching** - Regex patterns for common field types
- **HTML5 Types** - Native input types (email, tel, date, etc.)
- **Semantic Analysis** - Label and placeholder text analysis
- **Context Clues** - Surrounding text and attributes

### 3. Smart Selectors

Instead of XPath, the tool uses:

1. **ID selector** - `#email-input` (most reliable)
2. **Name attribute** - `[name="email"]`
3. **Placeholder** - `[placeholder="Enter email"]`
4. **ARIA label** - `[aria-label="Email address"]`
5. **Label text** - Playwright's text selector
6. **Fallback** - nth-of-type when needed

### 4. Data Generation

Realistic test data is generated based on field type:

- **Email** - `faker.internet.email()`
- **Name** - `faker.person.fullName()`
- **Phone** - `faker.phone.number()`
- **Address** - `faker.location.streetAddress()`
- **Company** - `faker.company.name()`
- And 20+ more field types...

## 🔧 Configuration Options

```javascript
const filler = new SmartFormFiller({
  headless: false,           // Run in headless mode
  slowMo: 100,              // Slow down actions (ms)
  screenshot: true,         // Take screenshots
  locale: 'en',             // Data generation locale
  customData: {},           // Custom field values
});
```

## 📊 API Reference

### SmartFormFiller

#### Methods

- `init()` - Initialize browser
- `goto(url)` - Navigate to URL
- `detectFields()` - Detect all form fields
- `fillForm(customData)` - Fill entire form
- `fillField(field, value)` - Fill single field
- `analyzeForm()` - Get form structure analysis
- `submit(selector)` - Submit form
- `takeScreenshot(name)` - Capture screenshot
- `close()` - Close browser
- `automate(url, options)` - Complete automation flow

### FieldDetector

- `detectFields(page)` - Detect fields on page
- `classifyField(field)` - Classify field type
- `getSelector(field)` - Get robust selector

### DataGenerator

- `generateData(field)` - Generate data for field
- `generateDataSet(fields)` - Generate data for all fields
- `setCustomData(data)` - Set custom values

## 🎨 Vision AI Enhancement (Optional)

For advanced field detection using GPT-4 Vision:

```bash
# Set API key
cp .env.example .env
# Add your OpenAI API key to .env
```

```javascript
import { VisionAnalyzer } from './src/vision-analyzer.js';

const analyzer = new VisionAnalyzer(process.env.OPENAI_API_KEY);
const fields = await analyzer.analyzeScreenshot('form.png');
```

## 📸 Screenshots

Screenshots are automatically saved to `screenshots/` directory with timestamps.

## 🧪 Running Examples

```bash
# Basic demo
npm run demo

# Custom data demo
npm run demo custom

# Quick fill demo
npm run demo quick

# Run specific example
node examples/simple-usage.js
node examples/custom-data.js
node examples/analyze-form.js
node examples/test-automation.js
```

## 🔍 Supported Field Types

The tool automatically recognizes:

- ✉️ Email
- 🔒 Password
- 📱 Phone
- 👤 Name (First, Last, Full)
- 🏠 Address (Street, City, State, ZIP)
- 🌍 Country
- 🏢 Company
- 🌐 Website/URL
- 📅 Date
- 🎂 Age
- ⚧️ Gender
- 👨‍💼 Username
- 💬 Message/Comment
- 📧 Subject
- 💳 Credit Card
- 🔐 CVV/Security Code
- And more...

## 🎯 Use Cases

- **Test Automation** - Automated form testing in CI/CD
- **QA Testing** - Manual testing with auto-fill
- **Load Testing** - Generate test data for performance tests
- **Demo Data** - Populate demo environments
- **Accessibility Testing** - Verify form field detection
- **Cross-browser Testing** - Test forms across browsers

## 🛡️ Best Practices

1. **Always verify** - Check filled data before submission
2. **Use custom data** - Provide specific test data when needed
3. **Analyze first** - Run `analyzeForm()` to understand structure
4. **Handle errors** - Wrap in try-catch for production use
5. **Screenshot on failure** - Capture state for debugging
6. **Respect rate limits** - Add delays for production sites

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- Additional field type patterns
- More language support
- Enhanced vision AI integration
- Better error handling
- Performance optimizations

## 📝 License

MIT License - feel free to use in your projects!

## 🙏 Acknowledgments

- **Playwright** - Browser automation
- **Faker.js** - Test data generation
- **OpenAI** - Vision AI capabilities

## 📞 Support

For issues or questions:
1. Check the examples in `examples/` directory
2. Review the API documentation above
3. Open an issue on GitHub

---

**Made with ❤️ for test automation engineers**
