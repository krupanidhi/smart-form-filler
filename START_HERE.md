# 👋 START HERE

## Welcome to Smart Form Filler!

This tool automatically fills web forms using AI-powered field detection - **no XPath required**.

## 🚀 Quick Start (Choose One)

### Option 1: Fastest Way (1 command)

```bash
cd C:\Users\KPeterson\CascadeProjects\smart-form-filler
npm install && npx playwright install chromium && node examples/test-local-form.js
```

### Option 2: Step by Step

```bash
# 1. Navigate to project
cd C:\Users\KPeterson\CascadeProjects\smart-form-filler

# 2. Install dependencies
npm install

# 3. Install browser
npx playwright install chromium

# 4. Run test
node examples/test-local-form.js
```

### Option 3: Windows PowerShell Script

```powershell
cd C:\Users\KPeterson\CascadeProjects\smart-form-filler
.\setup.ps1
node examples/test-local-form.js
```

## 📖 What to Read First

1. **GET_STARTED.md** ← Start here (3-minute guide)
2. **README.md** ← Full documentation
3. **USAGE_GUIDE.md** ← Detailed examples
4. **examples/** folder ← Working code

## 🎯 Your First Test

After installation, create `test.js`:

```javascript
import { SmartFormFiller } from './src/form-filler.js';

const filler = new SmartFormFiller({ headless: false });

// Replace with your form URL
await filler.goto('https://www.w3schools.com/html/html_forms.asp');

// Magic happens here!
await filler.fillForm();

console.log('✅ Done! Check the browser.');

await filler.page.waitForTimeout(10000);
await filler.close();
```

Run it:
```bash
node test.js
```

## 🎓 Learning Path

**Beginner:**
1. Read GET_STARTED.md
2. Run `node examples/test-local-form.js`
3. Try `node examples/simple-usage.js`

**Intermediate:**
1. Read USAGE_GUIDE.md
2. Try `node examples/custom-data.js`
3. Try `node examples/analyze-form.js`

**Advanced:**
1. Read ARCHITECTURE.md
2. Try `node examples/test-automation.js`
3. Integrate with your test suite

## 💡 Common Tasks

### Fill Any Form
```javascript
import { quickFill } from './src/index.js';
await quickFill('https://your-form-url.com');
```

### Use Custom Data
```javascript
await filler.fillForm({
  'email': 'your@email.com',
  'name': 'Your Name',
});
```

### Analyze Form First
```javascript
const analysis = await filler.analyzeForm();
console.log(analysis);
```

### Use in Tests
```javascript
const result = await filler.fillForm();
expect(result.filled).toBeGreaterThan(0);
```

## 📁 Project Files

```
smart-form-filler/
├── START_HERE.md          ← You are here
├── GET_STARTED.md         ← Read this next
├── README.md              ← Full documentation
├── USAGE_GUIDE.md         ← Detailed guide
├── ARCHITECTURE.md        ← Technical details
├── PROJECT_SUMMARY.md     ← Project overview
│
├── src/                   ← Source code
│   ├── field-detector.js  ← Detects fields
│   ├── data-generator.js  ← Generates data
│   ├── form-filler.js     ← Main tool
│   └── index.js           ← Entry point
│
├── examples/              ← Code examples
│   ├── test-local-form.js ← Start here!
│   ├── simple-usage.js
│   ├── custom-data.js
│   └── analyze-form.js
│
└── test-forms/            ← Test resources
    └── sample-form.html   ← Beautiful test form
```

## ❓ Need Help?

**Installation issues?**
→ Check QUICKSTART.md

**How to use?**
→ Check USAGE_GUIDE.md

**How it works?**
→ Check ARCHITECTURE.md

**Code examples?**
→ Check examples/ folder

## 🎉 Ready to Go!

Run this now:
```bash
node examples/test-local-form.js
```

You'll see the tool:
1. ✅ Open a beautiful test form
2. ✅ Detect all 20+ fields
3. ✅ Fill with realistic data
4. ✅ Submit the form
5. ✅ Take screenshots

**Happy automating! 🚀**

---

**Next:** Open GET_STARTED.md for the 3-minute tutorial
