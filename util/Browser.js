const puppeteer = require("puppeteer");
const path = require("path");

const launchBrowser = async (isHeadless) => {
  try {
    const extensionPath = path.resolve(__dirname, "../extension/ezyZip");

    console.log("Extension path:", extensionPath);
    const browser = await puppeteer.launch({
      headless: isHeadless,
      args: [
        "--disable-blink-features=AutomationControlled", // Avoid detection
        "--disable-extensions-file-access-check", // Bypass file access check
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--no-sandbox", // Disable sandboxing for Linux
        "--disable-setuid-sandbox", // Avoid permission issues in Linux
        "--disable-dev-shm-usage", // Use /tmp for shared memory to avoid space issues
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
