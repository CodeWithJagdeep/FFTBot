const { launchBrowser } = require("./Browser");
const Delay = require("../Hooks/Delay");

/**
 * ChatGPT Automation Class
 * High-Level Function to Get ChatGPT Answers
 * @param {string} message - The message to process
 * @returns {Promise<string[]>} - The responses from ChatGPT
 */
class ChatGPTAutomation {
  constructor() {
    this.userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
    this.url = "https://chat.openai.com"; // Updated ChatGPT URL
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
      return "Hello! I’m Veronica, your AI companion. I’ve been created by Aadarsh to randomly join rooms, greet you, and hang out for a while. If you need anything, just let me know!";
    }
    return null;
  }

  async ChatGptAuth() {
    await page.waitForSelector('[data-testid="login-button"]', {
      visible: true,
    });
    await page.click('[data-testid="login-button"]');
  }

  async ProcessWithGemini() {
    this.browser = await launchBrowser(false);
    //   page = await browser.newPage();
    const newTab = await this.browser.newPage(); // Open a new tab
    await newTab.bringToFront(); // Focus on the new tab
    console.log("New tab is open.");

    await new GoogleAuth().Login(newTab);
    try {
      // Navigate to the target URL
      await newTab.goto(this.geminiUrl, { waitUntil: "domcontentloaded" });
      await newTab.setUserAgent(this.userAgent);
      // Selector for the target div

      // Wait for the target div to load
      //   await newTab.waitForSelector(selector);

      await newTab.keyboard.type(message, { delay: 10 }); // Add slight delay for more natural typing
      console.log("Text has been added to the div.");

      // Wait briefly for stability
      await Delay(5000);
      // Press Enter
      await newTab.keyboard.press("Enter");
      console.log("Enter key pressed.");
      await Delay(15000);
      // Selector for the target element
      const selector = ".model-response-text.ng-star-inserted";

      // Wait for the element to load
      await page.waitForSelector(selector);

      // Extract the text from the target element
      const extractedText = await newTab.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.innerText.trim() : null; // Return text or null if the element is not found
      }, selector);

      if (extractedText) {
        console.log("Extracted Text:", extractedText);
      } else {
        console.log("Element not found or no text available.");
      }

      //   // Define the selector for the send button
      //   const buttonSelector =
      //     ".send-button.mdc-icon-button.mat-mdc-icon-button.mat-primary";

      //   // Wait for the send button to appear
      //   await newTab.waitForSelector(buttonSelector);

      //   // Click the send button
      //   await newTab.click(buttonSelector);
      console.log("Button clicked and message sent.");
    } catch (error) {
      console.error("Error during processing:", error);
    } finally {
      // Close the new tab and return focus to the original tab
      //   await newTab.close();
      console.log("New tab closed, returning to the original tab.");
    }
  }
  /**
   * Process the message and fetch responses from ChatGPT
   * @param {string} message - The input message
   * @returns {Promise<string[]>} - The responses from ChatGPT
   */
  async processMessage(message) {}

  /**
   * Get responses to a message
   * @param {string} message - The input message
   * @returns {Promise<string[]>} - The responses from ChatGPT
   */
  async getAnswers(message) {
    try {
      return await this.processMessage(message);
    } catch (error) {
      console.error("Failed to retrieve answers:", error);
      throw error;
    }
  }
}

module.exports = ChatGPTAutomation;

// let browser, page;

// try {
//   // Check for predefined responses
//   const predefinedResponse = this.handleConditions(message);
//   if (predefinedResponse) {
//     return [predefinedResponse]; // Ensure consistent return type
//   }

//   // Launch browser
//   browser = await launchBrowser(false);
//   page = await browser.newPage();

//   // Set user agent and navigate to ChatGPT URL
//   await page.setUserAgent(this.userAgent);
//   await page.goto(this.url, { waitUntil: "domcontentloaded" });
//   await Delay(5000);
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
//   await Delay(5000); // Wait for the response to load
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
//   console.error("Error while processing message:", error);
//   throw new Error("Failed to retrieve responses.");
// } finally {
//   // Ensure proper cleanup
//   if (page) await page.close().catch(console.error);
//   if (browser) await browser.close().catch(console.error);
// }

// new ChatGPTAutomation().getAnswers("how r u?");
// const puppeteer = require("puppeteer");
// const Delay = require("../Hooks/Delay");

// const launchBrowser = async () => {
//   try {
//     const browser = await puppeteer.launch({
//       headless: false, // set to true for headless mode (improves performance)
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-blink-features=AutomationControlled",
//       ],
//     });
//     return browser;
//   } catch (error) {
//     console.error("Error launching browser:", error);
//     throw error;
//   }
// };

// // Delay function using setTimeout with Promise
// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const ChatGptAutomation = async (message) => {
//   return new Promise(async (resolve, reject) => {
//     const browser = await launchBrowser();
//     try {
//       const page = await browser.newPage();
//       await page.setUserAgent(
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
//       );

//       await page.goto("https://chatgpt.com", {
//         waitUntil: "domcontentloaded",
//       });

//       console.log(`Processing message: ${message}`);
//       // Conditions for specific questions
//       if (
//         message.toLowerCase().includes("who is your owner") ||
//         message.toLowerCase().includes("who's your owner") ||
//         message.toLowerCase().includes("who created you") ||
//         message.toLowerCase().includes("who owned you") ||
//         message.toLowerCase().includes("who made you")
//       ) {
//         return "Hello! I’m Veronica, your AI companion. I’ve been created by Aadarsh to randomly join rooms, greet you, and hang out for a while. If you need anything, just let me know!";
//       }
//       await page.type(
//         "textarea",
//         `${message} make only reply dont give any suggestion`
//       );
//       await delay(2000);
//       await page.waitForSelector('[data-testid="send-button"]', {
//         visible: true,
//       });
//       await page.click('[data-testid="send-button"]');
//       await delay(5000); // Wait for the response to load
//       console.log("Reply sent.");
//       const texts = await page.evaluate(() => {
//         const elements = document.querySelectorAll(
//           '[data-message-author-role="assistant"]'
//         );
//         return Array.from(elements).map((el) => el.innerText.trim());
//       });

//       resolve(texts);
//     } catch (error) {
//       reject(error);
//     } finally {
//       await browser.close();
//     }
//   });
// };

// module.exports = ChatGptAutomation;
