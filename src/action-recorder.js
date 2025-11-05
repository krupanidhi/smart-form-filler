/**
 * Action Recorder
 * Records user actions in the browser and generates automation scripts
 * Captures: clicks, form fills, navigation - NO XPATH!
 */

export class ActionRecorder {
  constructor(page, options = {}) {
    this.page = page;
    this.actions = [];
    this.isRecording = false;
    this.keepPasswords = options.keepPasswords || false;
  }

  /**
   * Start recording user actions
   */
  async startRecording() {
    console.log('🎬 Starting action recording...\n');
    this.isRecording = true;
    this.actions = [];

    // Set up page event listeners to capture actions in Node.js
    this.page.on('console', msg => {
      const text = msg.text();
      if (text.startsWith('__ACTION__:')) {
        try {
          const action = JSON.parse(text.replace('__ACTION__:', ''));
          this.actions.push(action);
        } catch (e) {
          // Ignore parse errors
        }
      }
    });

    // Re-inject recording script on every page navigation
    this.page.on('load', async () => {
      if (this.isRecording) {
        try {
          await this._injectRecordingScript();
        } catch (e) {
          // Silently ignore injection errors during navigation - this is expected
        }
      }
    });

    // Inject recording script into the current page
    await this._injectRecordingScript();
  }

  /**
   * Inject recording script into page
   */
  async _injectRecordingScript() {
    try {
      // Wait for page to be ready
      await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
      
      const keepPasswords = this.keepPasswords;
      
      await this.page.evaluate((keepPwd) => {
        // Skip if already injected
        if (window.__recordingInjected) return;
        window.__recordingInjected = true;
        window.__keepPasswords = keepPwd;
      // Store actions in window object
      window.__recordedActions = [];

      // Helper to get smart selector (no XPath!)
      window.__getSmartSelector = (element) => {
        const selectors = [];

        // Priority 1: ID (but use attribute selector if it has special chars)
        if (element.id) {
          // Check if ID has special characters that need escaping
          if (/[:\[\](){}]/.test(element.id)) {
            selectors.push({ type: 'id', value: element.id, selector: `[id="${element.id}"]` });
          } else {
            selectors.push({ type: 'id', value: element.id, selector: `#${element.id}` });
          }
        }

        // Priority 2: Name
        if (element.name) {
          selectors.push({ type: 'name', value: element.name, selector: `[name="${element.name}"]` });
        }

        // Priority 3: Placeholder
        if (element.placeholder) {
          selectors.push({ type: 'placeholder', value: element.placeholder, selector: `[placeholder="${element.placeholder}"]` });
        }

        // Priority 4: ARIA label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) {
          selectors.push({ type: 'aria-label', value: ariaLabel, selector: `[aria-label="${ariaLabel}"]` });
        }

        // Priority 5: Text content (for buttons/links)
        if (element.textContent && element.textContent.trim()) {
          const text = element.textContent.trim();
          if (text.length < 50) { // Only short text
            selectors.push({ type: 'text', value: text, selector: `text="${text}"` });
          }
        }

        // Priority 6: Class (if unique enough)
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ').filter(c => c && !c.startsWith('ng-') && !c.startsWith('_'));
          if (classes.length > 0) {
            selectors.push({ type: 'class', value: classes[0], selector: `.${classes[0]}` });
          }
        }

        // Priority 7: Type + role
        const role = element.getAttribute('role');
        if (role) {
          selectors.push({ type: 'role', value: role, selector: `[role="${role}"]` });
        }

        return selectors[0] || { type: 'tag', value: element.tagName.toLowerCase(), selector: element.tagName.toLowerCase() };
      };

      // Helper to get element info
      window.__getElementInfo = (element) => {
        return {
          tagName: element.tagName.toLowerCase(),
          type: element.type || null,
          id: element.id || null,
          name: element.name || null,
          className: element.className || null,
          placeholder: element.placeholder || null,
          ariaLabel: element.getAttribute('aria-label') || null,
          text: element.textContent?.trim().substring(0, 100) || null,
          value: element.value || null,
        };
      };

      // Record clicks
      document.addEventListener('click', (e) => {
        const element = e.target;
        const selector = window.__getSmartSelector(element);
        const elementInfo = window.__getElementInfo(element);

        const action = {
          type: 'click',
          timestamp: Date.now(),
          selector: selector,
          element: elementInfo,
          url: window.location.href,
        };

        window.__recordedActions.push(action);
        
        // Send to Node.js via console
        console.log('__ACTION__:' + JSON.stringify(action));
        console.log('🖱️ Recorded click:', selector.selector);
      }, true);

      // Record input changes
      document.addEventListener('input', (e) => {
        const element = e.target;
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
          const selector = window.__getSmartSelector(element);
          const elementInfo = window.__getElementInfo(element);

          // Record password based on keepPasswords flag
          const value = (element.type === 'password' && !window.__keepPasswords) ? '***HIDDEN***' : element.value;

          const action = {
            type: 'input',
            timestamp: Date.now(),
            selector: selector,
            element: elementInfo,
            value: value,
            url: window.location.href,
          };

          window.__recordedActions.push(action);
          
          // Send to Node.js via console
          console.log('__ACTION__:' + JSON.stringify(action));
          console.log('⌨️ Recorded input:', selector.selector, '=', value);
        }
      }, true);

      // Record form submissions
      document.addEventListener('submit', (e) => {
        const form = e.target;
        const selector = window.__getSmartSelector(form);

        const action = {
          type: 'submit',
          timestamp: Date.now(),
          selector: selector,
          url: window.location.href,
        };

        window.__recordedActions.push(action);
        
        // Send to Node.js via console
        console.log('__ACTION__:' + JSON.stringify(action));
        console.log('📤 Recorded submit:', selector.selector);
      }, true);

      // Record navigation
      let lastUrl = window.location.href;
      setInterval(() => {
        if (window.location.href !== lastUrl) {
          const action = {
            type: 'navigation',
            timestamp: Date.now(),
            from: lastUrl,
            to: window.location.href,
          };
          
          window.__recordedActions.push(action);
          
          // Send to Node.js via console
          console.log('__ACTION__:' + JSON.stringify(action));
          console.log('🧭 Recorded navigation:', window.location.href);
          lastUrl = window.location.href;
        }
      }, 500);

      console.log('✅ Recording started! Interact with the page...');
      }, keepPasswords);
    } catch (error) {
      // Silently ignore injection errors during navigation - this is expected
      // The script will be re-injected on the next page load
    }
  }

  /**
   * Stop recording and retrieve actions
   */
  async stopRecording() {
    console.log('\n🛑 Stopping recording...\n');
    this.isRecording = false;

    // Actions are already stored in this.actions via console listener
    // No need to retrieve from page
    
    console.log(`✅ Recorded ${this.actions.length} actions\n`);
    return this.actions;
  }

  /**
   * Get recorded actions
   */
  getActions() {
    return this.actions;
  }

  /**
   * Generate automation script from recorded actions
   */
  generateScript(options = {}) {
    const { format = 'playwright', includeComments = true } = options;

    if (this.actions.length === 0) {
      return '// No actions recorded';
    }

    let script = '';

    if (format === 'playwright') {
      script += this._generatePlaywrightScript(includeComments);
    } else if (format === 'smart-form-filler') {
      script += this._generateSmartFormFillerScript(includeComments);
    }

    return script;
  }

  /**
   * Generate Playwright script
   */
  _generatePlaywrightScript(includeComments) {
    let script = `/**
 * Generated Automation Script
 * Created: ${new Date().toISOString()}
 * Total Actions: ${this.actions.length}
 */

import { chromium } from 'playwright';

async function runAutomation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

`;

    // Group actions by URL
    const actionsByUrl = this._groupActionsByUrl();

    for (const [url, actions] of Object.entries(actionsByUrl)) {
      if (includeComments) {
        script += `  // Navigate to: ${url}\n`;
      }
      script += `  await page.goto('${url}');\n`;
      script += `  await page.waitForLoadState('networkidle');\n\n`;

      for (const action of actions) {
        if (action.type === 'input') {
          if (includeComments) {
            script += `  // Fill ${action.element.name || action.element.placeholder || 'field'}\n`;
          }
          const value = action.value === '***HIDDEN***' ? 'YOUR_PASSWORD_HERE' : action.value;
          script += `  await page.fill('${action.selector.selector}', '${value}');\n`;
        } else if (action.type === 'click') {
          if (includeComments) {
            script += `  // Click ${action.element.text || action.element.name || 'element'}\n`;
          }
          script += `  await page.click('${action.selector.selector}');\n`;
          script += `  await page.waitForTimeout(1000);\n`;
        } else if (action.type === 'submit') {
          if (includeComments) {
            script += `  // Submit form\n`;
          }
          script += `  await page.click('button[type="submit"]');\n`;
          script += `  await page.waitForLoadState('networkidle');\n`;
        }
        script += '\n';
      }
    }

    script += `  console.log('✅ Automation complete!');\n`;
    script += `  await page.waitForTimeout(5000);\n`;
    script += `  await browser.close();\n`;
    script += `}\n\n`;
    script += `runAutomation();\n`;

    return script;
  }

  /**
   * Generate Smart Form Filler script
   */
  _generateSmartFormFillerScript(includeComments) {
    let script = `/**
 * Generated Smart Form Filler Script
 * Created: ${new Date().toISOString()}
 * Total Actions: ${this.actions.length}
 */

import { SmartFormFiller } from './src/form-filler.js';
import { SmartNavigator } from './src/smart-navigator.js';

async function runWorkflow() {
  const filler = new SmartFormFiller({
    headless: false,
    screenshot: true,
  });

  try {
`;

    // Get first URL
    const firstUrl = this.actions[0]?.url || 'https://example.com';
    script += `    // Navigate to starting page\n`;
    script += `    await filler.goto('${firstUrl}');\n\n`;

    // Extract form data
    const formData = this._extractFormData();
    
    if (Object.keys(formData).length > 0) {
      script += `    // Fill form with data\n`;
      script += `    await filler.fillForm({\n`;
      for (const [key, value] of Object.entries(formData)) {
        const displayValue = value === '***HIDDEN***' ? 'YOUR_PASSWORD_HERE' : value;
        script += `      '${key}': '${displayValue}',\n`;
      }
      script += `    });\n\n`;
    }

    // Check if there's a submit action or login button click
    const hasSubmit = this.actions.some(a => 
      a.type === 'submit' || 
      (a.type === 'click' && a.element.type === 'submit') ||
      (a.type === 'click' && a.element.text && a.element.text.toLowerCase().includes('log in'))
    );
    
    if (hasSubmit) {
      script += `    // Submit form\n`;
      script += `    await filler.submit();\n\n`;
      
      // Check if there are multiple URLs (multi-page flow)
      const urls = [...new Set(this.actions.map(a => a.url))];
      if (urls.length > 1) {
        script += `    // Auto-navigate through multi-step flow (login/agreement pages)\n`;
        script += `    const navigator = new SmartNavigator(filler.page);\n`;
        script += `    await navigator.autoNavigate();\n\n`;
        
        // Add post-login actions (navigations and clicks after reaching home page)
        const postLoginActions = this._getPostLoginActionsWithNav();
        if (postLoginActions.length > 0) {
          script += `    // Post-login actions\n`;
          
          for (const action of postLoginActions) {
            if (action.type === 'navigation') {
              // Navigate directly to the URL
              script += `    console.log('🧭 Navigating to: ${action.to}');\n`;
              script += `    await filler.page.goto('${action.to}');\n`;
              script += `    await filler.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});\n`;
              script += `    await filler.page.waitForTimeout(3000); // Wait for dynamic content\n\n`;
            } else if (action.type === 'click' && action.selector) {
              // Execute click
              const selector = action.selector.selector;
              const description = action.element.text || action.element.ariaLabel || action.element.tagName || 'element';
              
              script += `    console.log('🖱️  Clicking: ${description}');\n`;
              script += `    await filler.page.waitForSelector('${selector}', { timeout: 10000 }).catch(() => {});\n`;
              script += `    await filler.page.click('${selector}').catch(() => console.log('⚠️  Click failed'));\n`;
              script += `    await filler.page.waitForTimeout(2000); // Wait between actions\n\n`;
            }
          }
        }
      }
    }

    script += `    console.log('✅ Workflow complete!');\n`;
    script += `    await filler.page.waitForTimeout(5000);\n`;
    script += `    await filler.close();\n`;
    script += `  } catch (error) {\n`;
    script += `    console.error('❌ Error:', error);\n`;
    script += `    await filler.close();\n`;
    script += `  }\n`;
    script += `}\n\n`;
    script += `runWorkflow();\n`;

    return script;
  }

  /**
   * Group actions by URL
   */
  _groupActionsByUrl() {
    const grouped = {};
    
    for (const action of this.actions) {
      if (action.type === 'navigation') continue;
      
      const url = action.url;
      if (!grouped[url]) {
        grouped[url] = [];
      }
      grouped[url].push(action);
    }

    return grouped;
  }

  /**
   * Extract form data from input actions
   */
  _extractFormData() {
    const formData = {};
    
    for (const action of this.actions) {
      if (action.type === 'input') {
        const key = action.element.name || action.element.placeholder || action.element.id || 'field';
        // Trim whitespace from values
        formData[key] = action.value ? action.value.trim() : action.value;
      }
    }

    return formData;
  }

  /**
   * Get actions that happened after form submission
   */
  _getPostSubmitActions() {
    const submitIndex = this.actions.findIndex(a => 
      a.type === 'submit' || (a.type === 'click' && a.element.type === 'submit')
    );

    if (submitIndex === -1) return [];

    return this.actions.slice(submitIndex + 1);
  }

  /**
   * Get actions that happened after reaching home page (post-login)
   */
  _getPostLoginActions() {
    // Find actions after we reach a page that looks like home (not login/flow/agreement)
    const homePageIndex = this.actions.findIndex(a => {
      const url = a.url?.toLowerCase() || '';
      return url.includes('/s/') && 
             !url.includes('login') && 
             !url.includes('flow') && 
             !url.includes('agreement') &&
             !url.includes('frontdoor');
    });

    if (homePageIndex === -1) return [];

    // Get all clicks after home page, excluding useless ones
    return this.actions.slice(homePageIndex).filter(a => {
      // Only keep clicks
      if (a.type !== 'click') return false;
      
      // Exclude useless clicks on containers without text/links
      const uselessSelectors = ['flowruntimeFlowRuntime'];
      if (uselessSelectors.some(s => a.selector?.selector?.includes(s))) return false;
      
      return true;
    });
  }

  /**
   * Get actions with navigation events after reaching home page
   */
  _getPostLoginActionsWithNav() {
    // Find actions after we reach a page that looks like home
    const homePageIndex = this.actions.findIndex(a => {
      const url = a.url?.toLowerCase() || '';
      return url.includes('/s/') && 
             !url.includes('login') && 
             !url.includes('flow') && 
             !url.includes('agreement') &&
             !url.includes('frontdoor');
    });

    if (homePageIndex === -1) return [];

    // Get all navigations and clicks after home page
    return this.actions.slice(homePageIndex + 1).filter(a => {
      // Keep navigation events
      if (a.type === 'navigation') return true;
      
      // Keep clicks, excluding useless ones
      if (a.type === 'click') {
        const uselessSelectors = ['flowruntimeFlowRuntime', 'navigation'];
        if (uselessSelectors.some(s => a.selector?.selector?.includes(s))) return false;
        return true;
      }
      
      return false;
    });
  }

  /**
   * Save actions to JSON file
   */
  async saveToFile(filename = 'recorded-actions.json') {
    const fs = await import('fs/promises');
    await fs.writeFile(filename, JSON.stringify(this.actions, null, 2));
    console.log(`✅ Actions saved to ${filename}`);
  }

  /**
   * Save generated script to file
   */
  async saveScript(filename, format = 'playwright') {
    const fs = await import('fs/promises');
    const script = this.generateScript({ format });
    await fs.writeFile(filename, script);
    console.log(`✅ Script saved to ${filename}`);
  }

  /**
   * Print summary of recorded actions
   */
  printSummary() {
    console.log('📊 Recording Summary:\n');
    console.log(`Total Actions: ${this.actions.length}`);
    
    const actionTypes = {};
    for (const action of this.actions) {
      actionTypes[action.type] = (actionTypes[action.type] || 0) + 1;
    }

    console.log('\nAction Breakdown:');
    for (const [type, count] of Object.entries(actionTypes)) {
      console.log(`  ${type}: ${count}`);
    }

    console.log('\nRecorded Fields:');
    const formData = this._extractFormData();
    for (const [key, value] of Object.entries(formData)) {
      const displayValue = value === '***HIDDEN***' ? '(hidden)' : value;
      console.log(`  ${key}: ${displayValue}`);
    }

    console.log('');
  }
}
