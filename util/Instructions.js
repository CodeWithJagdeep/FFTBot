const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getParenElement(page, classname) {
  try {
    // Wait for the element to be available before interacting with it
    await page.waitForSelector("div.ant-tabs-tab");
    console.log(`Looking for div.ant-tabs-tab with text '${classname}'`);

    const success = await page.evaluate((classname) => {
      // Find all the tabs and loop through them to find the one containing 'classname'
      const tabs = document.querySelectorAll("div.ant-tabs-tab");

      for (let tab of tabs) {
        const blindDiv = tab.querySelector(".blind");
        if (blindDiv && blindDiv.innerText.trim() === classname) {
          console.log(`Found the '${classname}' tab`);
          // Click on the 'ant-tabs-tab' that contains the 'classname' text
          tab.click();
          return true; // Successfully clicked the tab
        }
      }

      console.log(`No tab with '${classname}' found`);
      return false; // No tab with 'classname' found
    }, classname); // Pass classname to the browser context

    if (!success) {
      console.log("Failed to click the tab");
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error during getParenElement:", error);
    return false; // Return false in case of error
  }
}

async function getListItems(page) {
  return new Promise(async (resolve, reject) => {
    try {
      // Interact with the page to get the list items
      const result = await page.evaluate(() => {
        try {
          // Find the first element with the class 'thumbnail'
          const thumbnailElement = document.querySelector(".thumbnail");

          if (!thumbnailElement) {
            console.log("No element with class 'thumbnail' found");
            return { success: false, message: "Thumbnail not found" }; // Return failure
          }

          // Find the closest ancestor with class 'ant-list-item'
          const listItem = thumbnailElement.closest("li.ant-list-item");

          if (!listItem) {
            console.log("No parent element with class 'ant-list-item' found");
            return { success: false, message: "No parent list item found" }; // Return failure
          }

          // Click the list item
          console.log("Clicking on the list item");
          listItem.click();

          return { success: true }; // Return success
        } catch (err) {
          console.error("Error in page.evaluate:", err);
          return { success: false, message: err.message }; // Return failure with error message
        }
      });

      if (result.success) {
        return resolve(true); // Successfully clicked the item
      } else {
        console.log(result.message); // Log the message if there was a failure
        return reject(result.message); // Reject with the error message
      }
    } catch (err) {
      console.error("Error in getListItems:", err);
      return reject("An error occurred in the getListItems function");
    }
  });
}

const intructions = async (page, command) => {
  try {
    console.log("Received command:", command); // Log the command received
    let song = command.toLowerCase().split("play")[1].trim(); // Get the song or message after 'play'
    console.log("Extracted song/message:", song);

    // Wait for and click the "Youtube" tab
    const parentElement = await getParenElement(page, "Youtube");
    if (!parentElement) {
      console.log("Parent element was not found or click failed");
      return false; // Return early if parent element was not found or clicked
    }
    console.log("Parent element clicked successfully");
    await delay(3000); // Wait for list items to load
    // Now interact with the 'input' and search button in the main context

    await page.evaluate((song) => {
      const inputElement = document.querySelector("input");
      if (inputElement) {
        inputElement.value = song; // Set the input value to the song
        console.log("Input value set");
      } else {
        console.log("Input element not found");
      }
    }, song); // Pass 'song' to page.evaluate() as an argument

    // Wait for the search button to be available
    await page.waitForSelector("span.ant-input-suffix .ant-input-search-icon");
    console.log("Search button found");

    // Click the search button
    await page.click("span.ant-input-suffix .ant-input-search-icon");
    console.log("Search button clicked");

    // Wait for the page to update and items to appear
    await delay(10000); // Wait for list items to load

    // Wait for the element to be available before interacting with it
    await page.waitForSelector("div.ant-tabs-tab");
    console.log(`Looking for div.ant-tabs-tab with text '`);

    const success = await page.evaluate(() => {
      // Find all the tabs and loop through them to find the one containing 'classname'
      const tabs = document.querySelectorAll(".result");
      console.log(tabs);
    }); // Pass classname to the browser context
    // Wait for and click the "Chat Box" tab
    const chatBoxClicked = await getParenElement(page, "Chat Box");
    if (!chatBoxClicked) {
      console.log("Failed to click 'Chat Box' tab");
      return false;
    }

    return result; // Return the result from the list item evaluation
  } catch (error) {
    console.error("Error during instructions function:", error);
    return false; // Return false if any error occurs outside evaluate
  }
};

module.exports = intructions;
