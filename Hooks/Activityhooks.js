const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

async function ActivityHook(page) {
  let [
    currentJoinNodes,
    currentLeaveNodes,
    kickedNode,
    callingMe,
    roomId,
    currentPromotedNode,
    userReplies,
    getMessages,
  ] = await Promise.all([
    page.evaluate((owner) => {
      return Array.from(document.querySelectorAll(".join")).map(
        (node) => node.textContent || node.outerHTML
      );
    }, process.env.owner), // Pass owner to the page context

    page.evaluate((owner) => {
      return Array.from(document.querySelectorAll(".leave")).map(
        (node) => node.textContent || node.outerHTML
      );
    }, process.env.owner), // Pass owner to the page context

    page.evaluate((owner) => {
      const kickedSpan = Array.from(document.querySelectorAll("span")).find(
        (span) => span.textContent.includes("has kicked")
      );
      return kickedSpan ? kickedSpan.textContent : null;
    }, process.env.owner), // Pass owner to the page context

    page.evaluate((owner) => {
      const elements = document.querySelectorAll("div[data-message-id]");

      // Filter messages containing a <code> tag with a mention
      const filteredData = Array.from(elements)
        .filter((el) => {
          const userName = el.querySelector(".name.primary span");
          const user = userName ? userName.innerText.trim() : ""; // Extract the user's name
          const mention = el.querySelector("code"); // Find the <code> element containing the mention
          return (
            mention && mention.innerText.includes(`@${owner}`) && user !== owner
          ); // Check if the mention contains "@owner"
        })
        // Check if the <div> contains a <code> tag
        .map((el) => {
          const userName = el.querySelector(".name.primary span"); // Extract the user's name
          const mention = el.querySelector("code"); // Find the <code> element containing the mention
          const message = el.querySelector(".text.main-content p"); // Extract the message text from the <p> tag
          const messageId = el.getAttribute("data-message-id");
          const pmMode = el.className.includes("pm-mode");
          // Return an object containing the user's name, mention, and message text
          return {
            messageId: messageId || "", // Include the `data-message-id`
            user: userName ? userName.innerText.trim() : "",
            mention: mention ? mention.innerText.trim() : "",
            message: message ? message.innerText.trim() : "",
            pmMode: pmMode,
          };
        })
        .filter(
          (item) => item.messageId && item.user && item.mention && item.message
        ); // Filter out messages missing user, mention, or message text

      return filteredData;
    }, process.env.owner), // Pass owner to the page context

    page.evaluate(() => {
      return window.location.pathname.split("/")[2]; // Extract the roomId from the URL
    }),

    page.evaluate(() => {
      // Find all span elements
      const spans = document.querySelectorAll("span");

      // Regex pattern to match either "to Co-Owner" or "to Guest"
      const pattern = /has set .*? to (Co-Owner|Guest)/;

      // Find the span that matches the pattern
      const targetSpan = Array.from(spans).find((span) =>
        pattern.test(span.textContent)
      );

      // Return the matching span's text or null if not found
      return targetSpan ? targetSpan.textContent : null;
    }),

    page.evaluate((owner) => {
      const elements = document.querySelectorAll("div[data-message-id]");
      const filteredData = Array.from(elements)
        .filter((el) => {
          // Find all quote elements within the current div
          const quotes = el.querySelectorAll(".quote");
          // Check if any of the quote elements contain the name "Veronica" (or the owner variable)
          return Array.from(quotes).some((quote) =>
            quote.innerText.includes(owner)
          );
        })
        .map((el) => {
          const userName = el.querySelector(".name.primary span"); // Extract the user's name
          const message = el.querySelector(".text.main-content p"); // Extract the message text from the <p> tag
          const messageId = el.getAttribute("data-message-id");
          const pmMode = el.className.includes("pm-mode");
          // Return an object containing the user's name and message text
          return {
            messageId: messageId || "", // Include the `data-message-id`
            user: userName ? userName.innerText.trim() : "",
            message: message ? message.innerText.trim() : "",
            pmMode: pmMode,
          };
        })
        .filter((item) => item.messageId && item.user && item.message); // Filter out entries missing user or message text

      return filteredData;
    }, process.env.owner), // Pass owner to the page context

    page.evaluate(() => {
      const elements = document.querySelectorAll("div[data-message-id]");
      // Filter messages containing a <code> tag with a mention
      const filteredData = Array.from(elements)
        .map((el) => {
          const userName = el.querySelector(".name.primary span"); // Extract the user's name
          const message = el.querySelector(".text.main-content .unverified"); // Extract the message text from the <p> tag
          const messageId = el.getAttribute("data-message-id");
          console.log(userName, message, messageId);
          // Return an object containing the user's name, mention, and message text
          return {
            messageId: messageId || "", // Include the `data-message-id`
            user: userName ? userName.innerText.trim() : "",
            message: message ? message.href : "",
          };
        })
        .filter((item) => item.messageId && item.user && item.message); // Filter out messages missing user, mention, or message text

      return filteredData;
    }), // Pass owner to the page context
  ]);

  return [
    currentJoinNodes,
    currentLeaveNodes,
    kickedNode,
    callingMe,
    roomId,
    currentPromotedNode,
    userReplies,
    getMessages,
  ];
}

module.exports = ActivityHook;
