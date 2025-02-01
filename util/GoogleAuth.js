const Delay = require("../Hooks/Delay");

class GoogleAuth {
  constructor() {
    // Default values for development; replace with actual credentials in production
    this.email = process.env.email || "email@example.com";
    this.password = process.env.password || "password";
    this.url = "https://accounts.google.com/signin";
  }

  /**
   * Logs into Google using Puppeteer.
   * @param {object} page - Puppeteer page instance
   * @returns {Promise<void>}
   */
  async Login(page, browser) {
    if (!page || typeof page.goto !== "function") {
      throw new Error("Invalid Puppeteer page instance provided.");
    }

    try {
      const pages = await browser.pages();
      // Navigate to the Google login page
      await page.goto(this.url, { waitUntil: "domcontentloaded" });
      console.log("Navigated to Google Sign-In page.");
      Delay(2000);
      let authTab = pages.find((page) =>
        page.url().includes("accounts.google.com")
      );
      await authTab.bringToFront();
      await authTab.waitForNavigation({ waitUntil: "domcontentloaded" });
      // Enter email and proceed
      await authTab.waitForSelector('input[type="email"]');
      await authTab.type('input[type="email"]', this.email);
      await authTab.click("#identifierNext");
      console.log("Email submitted.");

      // Wait for password input and proceed
      await authTab.waitForSelector('input[type="password"]', {
        visible: true,
      });
      await authTab.type('input[type="password"]', this.password);
      await authTab.click("#passwordNext");
      console.log("Password submitted.");

      // Wait for navigation to confirm login success
      await authTab.waitForNavigation({ waitUntil: "networkidle2" });
      console.log("Login successful.");

      // Optional: Dynamic wait instead of static delay
      await authTab.waitForSelector("body", { visible: true });
      Delay(30*1000);
      console.log("Post-login actions completed.");
    } catch (error) {
      console.error("Error during Google login:");
      throw error;
    }
  }
}

module.exports = GoogleAuth;
