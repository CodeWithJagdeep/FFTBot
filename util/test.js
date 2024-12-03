const puppeteer = require("puppeteer");
const Delay = require("../Hooks/Delay");

(async () => {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: false, // Use non-headless mode to visually observe the browser
    defaultViewport: null,
  });

  console.log("Browser launched.");

  // Start a loop to check the number of open tabs every 10 seconds
  const checkTabs = async () => {
    const pages = await browser.pages(); // Get all open tabs (pages)
    try {
      // Locate the Gemini tab
      let geminiTab = pages.find((page) =>
        page.url().includes("gemini.google.com")
      );
      await geminiTab.bringToFront();
      console.log("Typing the message...");
      Delay(1500);
      await geminiTab.keyboard.type("hi how r u? make only reply dont give any suggestion", { delay: 10 });
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
  };

  // Call the function every 10 seconds
  const intervalId = setInterval(checkTabs, 10000);

  // Stop the loop and close the browser after a certain time (optional)
  setTimeout(async () => {
    clearInterval(intervalId); // Stop checking
    await browser.close(); // Close the browser
    console.log("Browser closed.");
  }, 60000); // Run for 1 minute (optional)
})();
