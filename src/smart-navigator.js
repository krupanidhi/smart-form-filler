/**
 * Smart Navigator
 * Intelligently handles multi-step flows by detecting buttons and toggles automatically
 */

export class SmartNavigator {
  constructor(page) {
    this.page = page;
  }

  /**
   * Automatically detect and click toggles/checkboxes for agreements
   */
  async handleAgreements() {
    console.log('🔍 Looking for agreement toggles/checkboxes...');
    
    const toggleSelectors = [
      'button[role="switch"]',
      '[role="switch"]',
      '.slds-checkbox_toggle',
      'input[type="checkbox"]',
      'lightning-input',
    ];
    
    for (const selector of toggleSelectors) {
      try {
        const element = await this.page.locator(selector).first();
        const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          const text = await this.page.evaluate(() => document.body.innerText.toLowerCase());
          
          // Check if page contains agreement-related text
          if (text.includes('agree') || text.includes('terms') || text.includes('accept') || text.includes('consent')) {
            console.log(`✅ Found agreement toggle: ${selector}`);
            
            // Check current state
            const role = await element.getAttribute('role').catch(() => null);
            if (role === 'switch') {
              const isPressed = await element.getAttribute('aria-pressed').catch(() => 'false');
              if (isPressed === 'false') {
                await element.click();
                console.log('✅ Toggle clicked (agreed)\n');
                await this.page.waitForTimeout(1000);
                return true;
              }
            } else {
              const isChecked = await element.isChecked().catch(() => false);
              if (!isChecked) {
                await element.check();
                console.log('✅ Checkbox checked (agreed)\n');
                await this.page.waitForTimeout(1000);
                return true;
              }
            }
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log('ℹ️  No agreement toggles found\n');
    return false;
  }

  /**
   * Automatically detect and click navigation buttons (Next, Continue, Finish, etc.)
   */
  async clickNavigationButton() {
    console.log('🔍 Looking for navigation buttons...');
    
    // Read page text to understand what action is needed
    const pageText = await this.page.evaluate(() => document.body.innerText.toLowerCase());
    console.log('📄 Page says:', pageText.substring(0, 200).replace(/\n/g, ' '));
    
    // Detect which button to click based on page instructions
    let priorityButtons = [];
    
    if (pageText.includes('click') && pageText.includes('finish')) {
      console.log('💡 Page instructs to click "Finish"\n');
      priorityButtons = ['Finish', 'Done', 'Complete'];
    } else if (pageText.includes('click') && pageText.includes('next')) {
      console.log('💡 Page instructs to click "Next"\n');
      priorityButtons = ['Next', 'Continue', 'Proceed'];
    } else if (pageText.includes('click') && pageText.includes('continue')) {
      console.log('💡 Page instructs to click "Continue"\n');
      priorityButtons = ['Continue', 'Next', 'Proceed'];
    } else if (pageText.includes('click') && pageText.includes('submit')) {
      console.log('💡 Page instructs to click "Submit"\n');
      priorityButtons = ['Submit', 'Send', 'Confirm'];
    } else if (pageText.includes('click') && pageText.includes('accept')) {
      console.log('💡 Page instructs to click "Accept"\n');
      priorityButtons = ['Accept', 'Agree', 'Confirm'];
    }
    
    // Common button texts for navigation (in priority order)
    const buttonTexts = [
      ...priorityButtons,
      'Finish',
      'Done',
      'Complete',
      'Next',
      'Continue',
      'Proceed',
      'Submit',
      'Accept',
      'Confirm',
      'OK',
    ];
    
    for (const buttonText of buttonTexts) {
      try {
        // Try multiple strategies
        const strategies = [
          { 
            name: `text="${buttonText}"`, 
            action: async () => {
              await this.page.locator(`text="${buttonText}"`).click({ timeout: 3000 });
            }
          },
          { 
            name: `getByRole`, 
            action: async () => {
              await this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click({ timeout: 3000 });
            }
          },
          { 
            name: `button:has-text`, 
            action: async () => {
              await this.page.locator(`button:has-text("${buttonText}")`).click({ timeout: 3000 });
            }
          },
          {
            name: `JavaScript click`,
            action: async () => {
              const clicked = await this.page.evaluate((text) => {
                // Search in main document
                const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a[role="button"]'));
                
                // Also search in iframes
                const iframes = Array.from(document.querySelectorAll('iframe'));
                const iframeButtons = iframes.flatMap(iframe => {
                  try {
                    return Array.from(iframe.contentDocument?.querySelectorAll('button, input[type="submit"], input[type="button"]') || []);
                  } catch {
                    return [];
                  }
                });
                
                const allButtons = [...buttons, ...iframeButtons];
                
                const targetButton = allButtons.find(btn => {
                  const btnText = (btn.textContent || btn.value || '').toLowerCase();
                  return btnText.includes(text.toLowerCase());
                });
                
                if (targetButton) {
                  targetButton.click();
                  return true;
                }
                return false;
              }, buttonText);
              
              if (!clicked) {
                throw new Error('Button not found');
              }
            }
          },
        ];
        
        for (const strategy of strategies) {
          try {
            console.log(`🔄 Trying ${strategy.name} for "${buttonText}"...`);
            
            // Wait for button to be enabled (not disabled)
            if (strategy.name !== 'JavaScript click') {
              try {
                await this.page.waitForSelector(`button:has-text("${buttonText}"):not([disabled])`, { timeout: 5000 });
                console.log(`   Button is enabled`);
              } catch (e) {
                console.log(`   Waiting for button to be enabled...`);
                await this.page.waitForTimeout(2000);
              }
            }
            
            await strategy.action();
            console.log(`✅ Clicked "${buttonText}" button using ${strategy.name}\n`);
            
            // Wait for navigation
            const urlBefore = this.page.url();
            console.log(`   Waiting for page to respond...`);
            await this.page.waitForTimeout(5000);
            await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
            const urlAfter = this.page.url();
            
            if (urlBefore !== urlAfter) {
              console.log(`   ✅ Navigation occurred: ${urlAfter}\n`);
            } else {
              console.log(`   ℹ️  No navigation (URL unchanged)\n`);
            }
            
            return buttonText;
          } catch (e) {
            console.log(`⚠️  ${strategy.name} failed: ${e.message}`);
            continue;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    // Fallback: Click any submit button
    try {
      await this.page.click('button[type="submit"]', { timeout: 2000 });
      console.log('✅ Clicked submit button\n');
      await this.page.waitForTimeout(3000);
      return 'Submit';
    } catch (e) {
      console.log('ℹ️  No navigation buttons found\n');
      return null;
    }
  }

  /**
   * Intelligently navigate through multi-step flows
   * @param {number} maxSteps - Maximum number of steps to attempt
   */
  async autoNavigate(maxSteps = 10) {
    console.log('🤖 Starting intelligent auto-navigation...\n');
    
    let step = 0;
    let consecutiveSameUrl = 0;
    let lastUrl = '';
    
    while (step < maxSteps) {
      step++;
      console.log(`📍 Step ${step}:\n`);
      
      const currentUrl = this.page.url();
      
      // Check if we're stuck (same URL 3 times in a row with no actions)
      if (currentUrl === lastUrl) {
        consecutiveSameUrl++;
        if (consecutiveSameUrl >= 3) {
          console.log('⚠️  Same URL visited 3 times, stopping to avoid infinite loop\n');
          break;
        }
      } else {
        consecutiveSameUrl = 0;
      }
      lastUrl = currentUrl;
      
      // Wait for page to stabilize
      await this.page.waitForTimeout(2000);
      
      // Get page content to understand context
      const pageText = await this.page.evaluate(() => document.body.innerText.toLowerCase());
      
      // Check if we've reached a final page
      if (this.isFinalPage(pageText, currentUrl)) {
        console.log('✅ Reached final page!\n');
        break;
      }
      
      // Handle agreements
      const agreementHandled = await this.handleAgreements();
      
      // Click navigation button
      const buttonClicked = await this.clickNavigationButton();
      
      // If nothing was clicked, we're done
      if (!agreementHandled && !buttonClicked) {
        console.log('ℹ️  No more actions to take\n');
        break;
      }
      
      // Wait for potential navigation
      await this.page.waitForTimeout(2000);
      
      // Check if URL changed
      const newUrl = this.page.url();
      if (newUrl === currentUrl && !agreementHandled) {
        console.log('ℹ️  No navigation occurred\n');
        break;
      }
    }
    
    if (step >= maxSteps) {
      console.log('⚠️  Reached maximum steps\n');
    }
    
    console.log(`✅ Auto-navigation complete after ${step} steps\n`);
    return step;
  }

  /**
   * Detect if we've reached a final/home page
   */
  isFinalPage(pageText, url) {
    // Check for common final page indicators
    const finalPageIndicators = [
      'dashboard',
      'home',
      'welcome',
      'logged in',
      'my account',
      'profile',
      'main menu',
    ];
    
    const urlLower = url.toLowerCase();
    
    // Check URL
    if (urlLower.includes('home') || 
        urlLower.includes('dashboard') || 
        urlLower.includes('main') ||
        (!urlLower.includes('login') && !urlLower.includes('agreement') && !urlLower.includes('flow'))) {
      return true;
    }
    
    // Check page content
    for (const indicator of finalPageIndicators) {
      if (pageText.includes(indicator)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Detect if page has a form to fill
   */
  async hasFormToFill() {
    const formFields = await this.page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
      return Array.from(inputs).filter(el => el.offsetParent !== null).length;
    });
    
    return formFields > 0;
  }
}
