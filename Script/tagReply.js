const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

async function tagHook(page, messageId) {
  try {
    // Wait for the message element to exist in the DOM
    await page.waitForSelector(`div[data-message-id="${messageId}"]`, {
      timeout: 5000, // Adjust timeout as needed
    });

    // Execute the script within the browser context
    await page.evaluate((messageId) => {
      // Locate the element by data-message-id
      const messageElement = document.querySelector(
        `div[data-message-id="${messageId}"]`
      );

      if (!messageElement) {
        console.error(`Message element with ID ${messageId} not found.`);
        return;
      }

      console.log(`Message element with ID ${messageId} found.`);

      // Find the child div with the class 'actions'
      const actionsDiv = messageElement.querySelector("div.actions");

      if (!actionsDiv) {
        console.error("Actions div not found.");
        return;
      }

      console.log("Actions div found.");

      // Make the actions div visible (if necessary)
      actionsDiv.style.visibility = "visible";
      console.log(
        "Actions div visibility set to:",
        actionsDiv.style.visibility
      );

      // Debug all buttons within the actions div
      const buttons = actionsDiv.querySelectorAll("button");
      console.log(`Found ${buttons.length} buttons in actionsDiv.`);

      // Find the button with a span containing the text "Reply"
      const button = Array.from(buttons).find((btn) => {
        const span = btn.querySelector("span");
        console.log(
          "Button span text:",
          span ? span.innerText.trim() : "No span found"
        );
        return span && span.innerText.trim() === "Reply";
      });

      if (button) {
        console.log("Found the Reply button. Dispatching click...");
        // Simulate a full user click event
        button.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
        console.log("Dispatched click on Reply button.");
      } else {
        console.error("Reply button not found.");
      }
    }, messageId);
  } catch (error) {
    console.error(`Error in tagHook for messageId: ${messageId}`, error);
  }
}

module.exports = tagHook;
