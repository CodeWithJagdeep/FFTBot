const puppeteer = require("puppeteer");
const path = require("path");

const launchBrowser = async (isHeadless) => {
  try {
    const extensionPath = path.resolve(__dirname, "../extension/ezyZip");

    console.log("Extension path:", extensionPath);
    const browser = await puppeteer.launch({
      headless: isHeadless,
      executablePath:
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Ensure this is correct
      args: [
        "--disable-blink-features=AutomationControlled", // Avoid detection
        "--disable-extensions-file-access-check", // Bypass file access check
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    console.log("Browser launched successfully!");
    return browser;
  } catch (error) {
    console.error("Error launching browser:");
    throw error;
  }
};

module.exports = { launchBrowser };
