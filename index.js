const dotenv = require("dotenv");
const { launchBrowser } = require("./util/Browser");
const GoogleAuth = require("./util/GoogleAuth");
const Observer = require("./util/Observer");
dotenv.config({ path: ".env" });

class ChatAutomation {
  constructor() {
    this.browser = null;

    this.page = null;
    this.userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
    this.roomLink = process.env.roomlink;
  }
  /**
   * Initialize the browser and page
   * @param {boolean} headless - Whether to run the browser in headless mode
   */

  async initializeBrowser(headless = false) {
    try {
      this.browser = await launchBrowser(headless);
      this.page = await this.browser.newPage();

      await this.page.setUserAgent(this.userAgent);
      await this.page.setViewport({ width: 1280, height: 500 });
      await this.page.setBypassCSP(true);
      // You can also use screen resolution dynamically using `window.innerWidth` & `window.innerHeight`:
      await this.page.evaluate(() => {
        window.resizeTo(1920, 1080); // Resize the window to full size
      });
      console.log("Browser initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize browser:", error);
      throw error;
    }
  }

  /**
   * Perform Google login
   */

  async login() {
    try {
      await new GoogleAuth().Login(this.page);
      console.log("Login completed successfully.");
    } catch (error) {
      console.error("Login failed:", error.message);
      throw error;
    }
  }

  /**
   * Observe page changes and handle interactions
   */

  async observe() {
    try {
      await new Observer(this.page, this.browser).ObservePageChange();
      console.log("Started observing page changes.");
    } catch (error) {
      console.error("Failed to observe page changes:", error);
      throw error;
    }
  }

  /**
   * Navigate to the room link
   */
  async navigate() {
    try {
      if (!this.roomLink) throw new Error("Room link is not defined.");
      await this.page.goto(this.roomLink, { waitUntil: "domcontentloaded" });
      console.log("Navigated to the room link.");
    } catch (error) {
      console.error("Failed to navigate to the room link:", error.message);
      throw error;
    }
  }

  /**
   * Run the full automation process
   */
  async run() {
    try {
      await this.initializeBrowser(false);
      await this.login();
      await this.navigate();
      await this.observe();
    } catch (error) {
      console.error("An error occurred during automation:", error);
    } finally {
      if (this.browser) {
        // await this.browser.close();
        // console.log("Browser closed.");
      }
    }
  }
}

module.exports = ChatAutomation;

// Example usage
if (require.main === module) {
  const automation = new ChatAutomation();
  automation.run();
}

// const main = async () => {
//   const browser = await launchBrowser(false);
//   const page = await browser.newPage();
//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
//   );

//   // Initial login
//   await googleLogin(page);

//   // Navigate to the room page and ensure login is valid
//   await navigateToPage(page, process.env.roomlink);

//   // Start observing the page for new joins and message them
//   await observePageChanges(page);
// };

// // Run the main function
// main().catch((error) => {
//   console.error("An error occurred:", error);
// });
