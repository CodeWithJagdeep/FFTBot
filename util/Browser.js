const puppeteer = require("puppeteer");
// const puppeteer = require("puppeteer-firefox");

const launchBrowser = async (isheadless) => {
  try {
    const browser = await puppeteer.launch({
      headless: isheadless,
      browser: "chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });
    return browser;
  } catch (error) {
    console.error("Error launching browser:", error);
    throw error;
  }
};

module.exports = { launchBrowser };
