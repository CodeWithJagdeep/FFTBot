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

  async ProcessWithGemini(message) {
    const pages = await browser.pages(); // Get all open tabs (pages)
    try {
      // Locate the Gemini tab
      let geminiTab = pages.find((page) =>
        page.url().includes("gemini.google.com")
      );
      await geminiTab.bringToFront();
      console.log("Typing the message...");
      Delay(1500);
      await geminiTab.keyboard.type(
        `${message} make only reply dont give any suggestion`,
        { delay: 10 }
      );
      // Wait for UI stabilization
      console.log("Waiting for stability...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      // Submit the message by pressing Enter
      console.log("Submitting the message...");
      await geminiTab.keyboard.press("Enter");

      // Wait for the response to appear
      const responseSelector = ".model-response-text.ng-star-inserted";
      console.log("Waiting for the response element...");
      await geminiTab.waitForSelector(responseSelector, { timeout: 15000 });

      // Extract the response text
      console.log("Extracting response text...");
      const extractedText = await geminiTab.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : null;
      }, responseSelector);

      if (extractedText) {
        console.log("Extracted Text:", extractedText);
      } else {
        console.log("No response text found.");
      }
    } catch (error) {
      console.error("Error checking tabs:", error);
    } finally {
      let fftTab = pages.find((page) => page.url().includes("free4talk.com")); // Get all open tabs (pages)
      await fftTab.bringToFront();
    }
  }

  /**
   * Process the message and fetch responses from ChatGPT
   * @param {string} message - The input message
   * @returns {Promise<string[]>} - The responses from ChatGPT
   */
  async processMessage(message) {
    const pages = await this.browser.pages(); // Get all open tabs (pages)
    try {
      // Locate the Gemini tab
      let newTab = pages.find((page) => page.url().includes("chatgpt.com"));
      await newTab.bringToFront();
      await Delay(2000);
      console.log(`Processing message: ${message}`);
      //   this.ChatGptAuth();
      //   Type message into the text area
      await newTab.waitForSelector("textarea");
      await newTab.type(
        "textarea",
        `${message} make super roasted way reply in hindi but use english letters only reply dont give any suggestion also use emoji to show little human feeling`
      );
      await newTab.waitForSelector('[data-testid="send-button"]', {
        visible: true,
      });
      await newTab.click('[data-testid="send-button"]');
      await Delay(2000); // Wait for the response to load
      console.log("Reply sent.");
      // Click send button
      await newTab.waitForSelector('[data-testid="send-button"]', {
        visible: true,
      });
      await newTab.click('[data-testid="send-button"]');
      // Wait for assistant response
      console.log("Reply sent. Extracting response...");
      await newTab.waitForSelector('[data-message-author-role="assistant"]', {
        visible: true,
      });
      await Delay(6000); // Wait for the response to load
      // Extract response text
      const responses = await newTab.evaluate(() => {
        const elements = document.querySelectorAll(
          '[data-message-author-role="assistant"]'
        );
        return Array.from(elements).map((el) => el.innerText.trim());
      });
      const latestReply = responses[responses.length - 1];
      console.log("Responses retrieved:", responses);
      return latestReply;
    } catch (error) {
      console.error("Error checking tabs:", error);
    } finally {
      await Delay(2000);
      let fftTab = pages.find((page) => page.url().includes("free4talk.com")); // Get all open tabs (pages)
      await fftTab.bringToFront();
    }
    // let browser, page;
    // try {
    //   // Check for predefined responses
    //   const predefinedResponse = this.handleConditions(message);
    //   if (predefinedResponse) {
    //     return [predefinedResponse]; // Ensure consistent return type
    //   }
    //   // Launch browser
    //   browser = await this.launchBrowser();
    //   page = await browser.newPage();
    //   // Set user agent and navigate to ChatGPT URL
    //   await page.setUserAgent(this.userAgent);
    //   await page.goto(this.url, { waitUntil: "domcontentloaded" });
    //   await Delay(2000);
    //   console.log(`Processing message: ${message}`);
    //   //   this.ChatGptAuth();
    //   //   Type message into the text area
    //   await page.waitForSelector("textarea");
    //   await page.type(
    //     "textarea",
    //     `${message} make only reply dont give any suggestion`
    //   );
    //   await page.waitForSelector('[data-testid="send-button"]', {
    //     visible: true,
    //   });
    //   await page.click('[data-testid="send-button"]');
    //   await Delay(2000); // Wait for the response to load
    //   console.log("Reply sent.");
    //   // Click send button
    //   await page.waitForSelector('[data-testid="send-button"]', {
    //     visible: true,
    //   });
    //   await page.click('[data-testid="send-button"]');
    //   // Wait for assistant response
    //   console.log("Reply sent. Extracting response...");
    //   await page.waitForSelector('[data-message-author-role="assistant"]', {
    //     visible: true,
    //   });
    //   await Delay(8000); // Wait for the response to load
    //   // Extract response text
    //   const responses = await page.evaluate(() => {
    //     const elements = document.querySelectorAll(
    //       '[data-message-author-role="assistant"]'
    //     );
    //     return Array.from(elements).map((el) => el.innerText.trim());
    //   });
    //   console.log("Responses retrieved:", responses);
    //   return responses;
    // } catch (error) {
    //   console.error("Error while processing message whill retreving answer");
    //   throw new Error("Failed to retrieve responses.");
    // } finally {
    //   // Ensure proper cleanup
    //   if (page) await page.close().catch(console.error);
    //   if (browser) await browser.close().catch(console.error);
    // }
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
      console.log(error);
      console.error("Failed to retrieve answers");
      throw error;
    }
  }
}

module.exports = ChatGPTAutomation;
