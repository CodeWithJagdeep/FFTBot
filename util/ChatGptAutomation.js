const { default: puppeteer } = require("puppeteer");
const Delay = require("../Hooks/Delay");
const GoogleAuth = require("../util/GoogleAuth");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

/**
 * ChatGPT Automation Class
 * High-Level Function to Get ChatGPT Answers
 * @param {string} message - The message to process
 * @returns {Promise<string[]>} - The responses from ChatGPT
 */
class ChatGPTAutomation {
  constructor(page, browser) {
    this.userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
    this.url = "https://chat.openai.com"; // Updated ChatGPT URL
    this.geminiUrl = "https://gemini.google.com/";
    this.browser = browser;
    this.page = page;
  }

  /**
   * Handle predefined responses based on specific conditions
   * @param {string} message - The input message
   * @returns {string|null} - Predefined response if conditions are met, otherwise null
   */
  handleConditions(message) {
    if (
      message.toLowerCase().includes("who is your owner") ||
      message.toLowerCase().includes("who's your owner") ||
      message.toLowerCase().includes("who created you") ||
      message.toLowerCase().includes("who owned you") ||
      message.toLowerCase().includes("who made you")
    ) {
      return `Hello! I’m ${process.env.owner}, your AI companion. I’ve been created by Aadarsh to randomly join rooms, greet you, and hang out for a while. If you need anything, just let me know!`;
    }
    return null;
  }

  async launchBrowser() {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          "--disable-blink-features=AutomationControlled", // Avoid detection
          "--disable-extensions-file-access-check", // Bypass file access check
        ],
      });
      console.log("Browser launched successfully!");
      return browser;
    } catch (error) {
      console.error("Error launching browser:");
      throw error;
    }
  }

  async ChatGptAuth() {
    await page.waitForSelector('[data-testid="login-button"]', {
      visible: true,
    });
    await page.click('[data-testid="login-button"]');
  }

  async ProcessWithGemini(message) {
    console.log("Starting ProcessWithGemini...");
    const newTab = await this.browser.newPage(); // Open a new tab
    await newTab.bringToFront(); // Bring the new tab to the foreground
    console.log("New tab opened and focused.");

    try {
      // Step 1: Authenticate user via Google

      // Step 2: Navigate to the target URL and configure user agent
      console.log("Navigating to Gemini URL...");
      await newTab.goto(this.geminiUrl, { waitUntil: "domcontentloaded" });
      console.log("Setting custom user agent...");
      await newTab.setUserAgent(this.userAgent);

      // Step 3: Enter the message into the input field
      console.log("Typing the message...");
      await newTab.keyboard.type(message, { delay: 10 });

      // Wait for UI stabilization
      console.log("Waiting for stability...");
      await Delay(5000);

      // Step 4: Submit the message by pressing Enter
      console.log("Submitting the message...");
      await newTab.keyboard.press("Enter");

      // Step 5: Wait for the response to appear
      const responseSelector = ".model-response-text.ng-star-inserted";
      console.log("Waiting for the response element...");
      await newTab.waitForSelector(responseSelector, { timeout: 15000 });

      // Step 6: Extract the response text
      console.log("Extracting response text...");
      const extractedText = await newTab.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : null; // Return text or null
      }, responseSelector);

      if (extractedText) {
        console.log("Extracted Text:", extractedText);
        return extractedText;
      } else {
        console.log("No response text found.");
      }
    } catch (error) {
      console.error("An error occurred in ProcessWithGemini:");
    } finally {
      // Ensure the new tab is closed
      console.log("Closing the new tab...");
      await newTab.close();
      console.log("New tab closed, returning to the original tab.");
    }
  }

  /**
   * Process the message and fetch responses from ChatGPT
   * @param {string} message - The input message
   * @returns {Promise<string[]>} - The responses from ChatGPT
   */
  async processMessage(message) {
    let browser, page;

    try {
      // Check for predefined responses
      const predefinedResponse = this.handleConditions(message);
      if (predefinedResponse) {
        return [predefinedResponse]; // Ensure consistent return type
      }

      // Launch browser
      browser = await this.launchBrowser();
      page = await browser.newPage();
      // Set user agent and navigate to ChatGPT URL
      await page.setUserAgent(this.userAgent);
      await page.goto(this.url, { waitUntil: "domcontentloaded" });
      await Delay(2000);
      console.log(`Processing message: ${message}`);
      //   this.ChatGptAuth();
      //   Type message into the text area
      await page.waitForSelector("textarea");
      await page.type(
        "textarea",
        `${message} make only reply dont give any suggestion`
      );
      await page.waitForSelector('[data-testid="send-button"]', {
        visible: true,
      });
      await page.click('[data-testid="send-button"]');
      await Delay(2000); // Wait for the response to load
      console.log("Reply sent.");
      // Click send button
      await page.waitForSelector('[data-testid="send-button"]', {
        visible: true,
      });
      await page.click('[data-testid="send-button"]');
      // Wait for assistant response
      console.log("Reply sent. Extracting response...");
      await page.waitForSelector('[data-message-author-role="assistant"]', {
        visible: true,
      });
      await Delay(8000); // Wait for the response to load
      // Extract response text
      const responses = await page.evaluate(() => {
        const elements = document.querySelectorAll(
          '[data-message-author-role="assistant"]'
        );
        return Array.from(elements).map((el) => el.innerText.trim());
      });
      console.log("Responses retrieved:", responses);
      return responses;
    } catch (error) {
      console.error("Error while processing message whill retreving answer");
      throw new Error("Failed to retrieve responses.");
    } finally {
      // Ensure proper cleanup
      if (page) await page.close().catch(console.error);
      if (browser) await browser.close().catch(console.error);
    }
  }

  /**
   * Get responses to a message
   * @param {string} message - The input message
   * @returns {Promise<string[]>} - The responses from ChatGPT
   */
  async getAnswers(message) {
    try {
      return await this.processMessage(message);
    } catch (error) {
      console.error("Failed to retrieve answers");
      throw error;
    }
  }
}

module.exports = ChatGPTAutomation;
