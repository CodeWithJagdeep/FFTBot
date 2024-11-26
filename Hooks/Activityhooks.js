async function ActivityHook(page) {
  let [currentJoinNodes, currentLeaveNodes, kickedNode, callingMe, roomId] =
    await Promise.all([
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
            return mention && mention.innerText.includes(process.env.owner); // Check if the mention contains "@Veronica"
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
    ]);

  return [currentJoinNodes, currentLeaveNodes, kickedNode, callingMe, roomId];
}

module.exports = ActivityHook;
