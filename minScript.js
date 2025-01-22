// Create a new MutationObserver instance
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      // Loop through the added nodes
      mutation.addedNodes.forEach((node) => {
        const messageDivs = node.querySelectorAll(".message");
        messageDivs.forEach((messageDiv) => {
          processMessageDiv(messageDiv);
        });
      });
    }
  }
});

// Function to process each "message" div
function processMessageDiv(div) {
  // Get the inner text of the message div and its children
  const innerText = div.innerText.toLowerCase(); // Normalize text case
  const htmlContent = div.innerHTML; // Get the raw HTML content inside the div

  // Keywords to check
  const keywords = ["join"];

  // Check if the inner text contains any of the keywords
  const containsKeyword = keywords.some((keyword) =>
    innerText.includes(keyword)
  );

  if (containsKeyword) {
    // Extract name (if the format matches "Name joined. [Time]")
    const name = div.innerText.split("joined.")[0].slice(11).trim();
    if (name) {
      return typeInTextarea(name); // Call function to type the name in a textarea
    }
  }
}

// Function to type the name in a textarea
async function typeInTextarea(name) {
  // Find the first textarea on the page
  const textarea = document.querySelector("textarea");
  const button = document.querySelector(".send-box");

  if (textarea) {
    // Dynamically find React props for the textarea
    const textareaPropsKey = Object.keys(textarea).find((key) =>
      key.startsWith("__reactProps$")
    );
    const buttonPropsKey = Object.keys(button).find((key) =>
      key.startsWith("__reactProps$")
    );

    // Access React props
    const textareaProps = textarea[textareaPropsKey];
    const buttonProps = button[buttonPropsKey];

    textareaProps.onChange({
      target: {
        value: `>> Welcome \`\`@${name}\`\`! Hope you had a wonderful day😊`,
      },
      preventDefault: () => console.log("preventDefault called"),
      stopPropagation: () => console.log("stopPropagation called"),
    });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    buttonProps.onClick({
      type: "click",
      preventDefault: () => console.log("preventDefault called"),
      stopPropagation: () => console.log("stopPropagation called"),
      target: button, // Use the button itself as the target
      currentTarget: button,
      parentNode: button.parentNode, // Ensure a valid parentNode is included
    });
    textareaProps.onChange({
      target: {
        value: ``,
      },
      preventDefault: () => console.log("preventDefault called"),
      stopPropagation: () => console.log("stopPropagation called"),
    });
  } else {
    console.log("No textarea found on the page.");
  }
}

// Observer options
const config = {
  childList: true, // Detect additions or removals of child nodes
  subtree: true, // Observe changes in the entire DOM subtree
};

// Start observing the entire document
observer.observe(document.body, config);

console.log(
  "MutationObserver is now observing the DOM for specific message divs."
);
