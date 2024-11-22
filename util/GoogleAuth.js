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
  async Login(page) {
    if (!page || typeof page.goto !== "function") {
      throw new Error("Invalid Puppeteer page instance provided.");
    }

    try {
      // Navigate to the Google login page
      await page.goto(this.url, { waitUntil: "domcontentloaded" });
      console.log("Navigated to Google Sign-In page.");
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      // Enter email and proceed
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', this.email);
      await page.click("#identifierNext");
      console.log("Email submitted.");

      // Wait for password input and proceed
      await page.waitForSelector('input[type="password"]', { visible: true });
      await page.type('input[type="password"]', this.password);
      await page.click("#passwordNext");
      console.log("Password submitted.");

      // Wait for navigation to confirm login success
      await page.waitForNavigation({ waitUntil: "networkidle2" });
      console.log("Login successful.");

      // Optional: Dynamic wait instead of static delay
      await page.waitForSelector("body", { visible: true });
      console.log("Post-login actions completed.");
    } catch (error) {
      console.error("Error during Google login:", error.message);
      throw error;
    }
  }
}

module.exports = GoogleAuth;

// await page.goto("https://accounts.google.com/signin");
// await page.waitForSelector('input[type="email"]');
// await page.type('input[type="email"]', process.env.email);
// await page.click("#identifierNext");
// await page.waitForSelector('input[type="password"]', { visible: true });
// await page.type('input[type="password"]', process.env.password);
// await page.click("#passwordNext");

// await page.waitForNavigation();

// console.log("Login successful.");
// await Delay(10000);
