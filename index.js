const dotenv = require("dotenv");
const { launchBrowser } = require("./util/Browser");
const GoogleAuth = require("./util/GoogleAuth");
const Observer = require("./util/Observer");
const Delay = require("./Hooks/Delay");
dotenv.config({ path: ".env" });

class ChatAutomation {
  constructor() {
    this.browser = null;
    this.chatGpt = "https://chatgpt.com/auth/login?sso";
    this.youtubeMusic = "https://music.youtube.com/";
    this.page = null;
    this.AuthPage = null;
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
      this.AuthPage = await this.browser.newPage();
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
      await new GoogleAuth().Login(this.AuthPage, this.browser);
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

  async chatGptChanges() {
    try {
      // Navigate to the ChatGPT login page
      await this.AuthPage.goto(this.chatGpt, {
        waitUntil: "domcontentloaded",
      });

      console.log("✅ Navigated to ChatGPT login page.");

      await this.AuthPage.focus("body");
      await this.AuthPage.keyboard.press("Tab");
      await Delay(4000); // Slight delay for clarity
      console.log("✅ Navigated to the login button using Tab.");

      // Press Enter to activate the button
      await this.AuthPage.keyboard.press("Enter");

      console.log("✅ Clicked 'Log in' button.");

      // Wait for the Google login button (".social-btn") to appear
      await this.AuthPage.waitForSelector(".social-btn", { visible: true });

      // Find and click the "Continue with Google" button
      await this.AuthPage.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll(".social-btn"));
        const googleButton = buttons.find((btn) =>
          btn.innerText.includes("Continue with Google")
        );
        if (googleButton) {
          googleButton.click();
        } else {
          throw new Error("Google login button not found.");
        }
      });
      console.log("✅ Clicked 'Continue with Google' button.");
    } catch (err) {
      console.error("❌ An error occurred in chatGptChanges:", err.message);
      throw err;
    }
  }

  /**
   * Navigate to the room link
   */
  async navigate(link) {
    try {
      if (!link) throw new Error("❌ Room link is not defined.");
      const pages = await this.browser.pages();

      // Navigate to the specified link
      await this.page.goto(link, { waitUntil: "domcontentloaded" });
      let fftTab = pages.find((page) => page.url().includes(link));
      await fftTab.bringToFront();

      console.log("✅ Clicked the 'Sign in now!' button.");
    } catch (error) {
      console.error(`❌ Failed to navigate to ${link}:`, error.message);
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
      await this.chatGptChanges();
      await this.navigate(this.roomLink);
      await this.observe();
    } catch (error) {
      console.log(error);
      console.error("An error occurred during automation:");
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
