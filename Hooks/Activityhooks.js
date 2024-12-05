async function ActivityHook(page) {
  let [
    currentJoinNodes,
    currentLeaveNodes,
    kickedNode,
    callingMe,
    roomId,
    currentPromotedNode,
    userReplies,
  ] = await Promise.all([
    page.evaluate(() => {
      return Array.from(document.querySelectorAll(".join")).map(
        (node) => node.textContent || node.outerHTML
      );
    }),
    page.evaluate(() => {
      return Array.from(document.querySelectorAll(".leave")).map(
        (node) => node.textContent || node.outerHTML
      );
    }),
    page.evaluate(() => {
      const kickedSpan = Array.from(document.querySelectorAll("span")).find(
        (span) => span.textContent.includes("has kicked")
      );
      return kickedSpan ? kickedSpan.textContent : null;
    }),

    page.evaluate(() => {
      const elements = document.querySelectorAll("div[data-message-id]");

      // Filter messages containing a <code> tag with a mention
      const filteredData = Array.from(elements)
        .filter((el) => {
          const mention = el.querySelector("code"); // Find the <code> element containing the mention
          return mention && mention.innerText.includes("@Psycho"); // Check if the mention contains "@Veronica"
        }) // Check if the <div> contains a <code> tag
        .map((el) => {
          const userName = el.querySelector(".name.primary span"); // Extract the user's name
          const mention = el.querySelector("code"); // Find the <code> element containing the mention
          const message = el.querySelector(".text.main-content p"); // Extract the message text from the <p> tag

          // Return an object containing the user's name, mention, and message text
          return {
            user: userName ? userName.innerText.trim() : "",
            mention: mention ? mention.innerText.trim() : "",
            message: message ? message.innerText.trim() : "",
          };
        })
        .filter((item) => item.user && item.mention && item.message); // Filter out messages missing user, mention, or message text

      return filteredData;
    }),
    await page.evaluate(() => {
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
    page.evaluate(() => {
      const elements = document.querySelectorAll("div[data-message-id]");

      // Filter messages containing a quote or mention with the name "Veronica"
      const filteredData = Array.from(elements)
        .filter((el) => {
          const quote = el.querySelector(".quote"); // Look for a quote element within the div
          return quote && quote.innerText.includes("Psycho"); // Check if the quote contains the name "Veronica"
        })
        .map((el) => {
          const userName = el.querySelector(".name.primary span"); // Extract the user's name
          const message = el.querySelector(".text.main-content p"); // Extract the message text from the <p> tag

          // Return an object containing the user's name and message text
          return {
            user: userName ? userName.innerText.trim() : "",
            message: message ? message.innerText.trim() : "",
          };
        })
        .filter((item) => item.user && item.message); // Filter out entries missing user or message text

      return filteredData;
    }),
  ]);

  return [
    currentJoinNodes,
    currentLeaveNodes,
    kickedNode,
    callingMe,
    roomId,
    currentPromotedNode,
    userReplies,
  ];
}

module.exports = ActivityHook;
