const Logger = require("./logger");
const {
  WelcomeMessages,
  funnyLeavingMessages,
  roastedKickMessages,
  fallbackMessage,
} = require("../data/Message");
const ActivityHook = require("../Hooks/Activityhooks");
const ChatGPTAutomation = require("./ChatGptAutomation");

class Observer {
  constructor(page, browser) {
    this.page = page;
    this.Logger = new Logger();
    this.browser = browser;
    // State management
    this.currentJoinNodes = [];
    this.currentLeaveNodes = [];
    this.kickedNode = "";
    this.callingMe = [];
    this.roomId = "";
    this.kickedUserName = [];
    this.previousJoinNodes = [];
    this.previousLeaveNodes = new Set();
    this.previousKickedNodes = new Set();
    this.previousQuestionNodes = [];
    this.songPlayed = new Set();

    // Flags
    this.isBusy = false;

    // Message templates
    this.welcomeMessages = WelcomeMessages;
    this.funnyLeavingMessages = funnyLeavingMessages;
    this.roastedKickMessages = roastedKickMessages;
    this.fallbackMessage = fallbackMessage;
  }

  /**
   * Sends a message via the page's textarea
   * @param {string} message - The message to send
   */
  async messageSender(message) {
    try {
      await this.page.type("textarea", message);
      await this.page.keyboard.press("Enter");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  async joinedUser() {
    try {
      const newJoinNodes = this.currentJoinNodes.filter(
        (node) => !this.previousJoinNodes.includes(node)
      );
      for (const node of newJoinNodes) {
        const username = node.split("joined.")[0].slice(11).trim();
        if (!this.previousJoinNodes.includes(username)) {
          const logMessage = `User Joined: ${username}`;
          this.Logger.logToFile(logMessage);
          console.log(logMessage);
          const messages = this.welcomeMessages(username);
          const message = messages[Math.floor(Math.random() * messages.length)];
          await this.messageSender(message);
          this.previousJoinNodes.push(username); // Track processed users
        }
      }
    } catch (err) {
      console.error("Error processing joined users:", err);
    }
  }

  async leavedUserMessage() {
    try {
      const newLeaveNodes = this.currentLeaveNodes.filter(
        (node) => !this.previousLeaveNodes.has(node)
      );
      for (const node of newLeaveNodes) {
        const username = node.split("left.")[0].slice(11).trim();
        if (
          !this.previousLeaveNodes.has(username) &&
          !this.kickedUserName.includes(username)
        ) {
          console.log(`User Left: ${username}`);
          const messages = this.funnyLeavingMessages(username);
          const message = messages[Math.floor(Math.random() * messages.length)];
          await this.messageSender(message);
        }
        this.previousLeaveNodes.add(node); // Track processed leave events
      }
    } catch (err) {
      console.error("Error processing leave messages:", err);
    }
  }

  async AiResponse() {
    try {
      const newMessages = this.callingMe.filter(
        (node) =>
          !this.previousQuestionNodes.some(
            (state) =>
              state.username === node.user &&
              state.message === node.message &&
              state.roomId === this.roomId
          )
      );
      for (const node of newMessages) {
        this.previousQuestionNodes.push({
          username: node.user,
          message: node.message,
          roomId: this.roomId,
        });
        const sanitizedNode = node.message.replace(/@Veronica/g, "").trim();
        try {
          const ans = await new ChatGPTAutomation(this.page, this.browser).getAnswers(sanitizedNode);
          const response = ans
            ? `\`\`@${node.user}\`\` ${ans}`
            : `\`\`@${node.user}\`\` I couldn't understand your query.`;
          await this.messageSender(response);
        } catch (error) {
          console.error("Error generating AI response:", error);
          const fallback = this.fallbackMessage(node.user);
          const fallbackMessage =
            fallback[Math.floor(Math.random() * fallback.length)];
          await this.messageSender(fallbackMessage);
        }
      }
    } catch (err) {
      console.error("Error processing AI responses:", err);
    }
  }

  async kickedUser() {
    try {
      if (this.kickedNode && !this.previousKickedNodes.has(this.kickedNode)) {
        const kicker = this.kickedNode.split("has kicked")[0].trim();
        const username = this.kickedNode.split("has kicked")[1].trim();
        const messages = this.roastedKickMessages(username, kicker);
        const message = messages[Math.floor(Math.random() * messages.length)];
        await this.messageSender(message);
        this.kickedUserName.push(username);
        this.previousKickedNodes.add(this.kickedNode); // Track processed kick events
        console.log(`User Kicked: ${this.kickedNode}`);
      }
    } catch (err) {
      console.error("Error processing kicked users:", err);
    }
  }

  async ObservePageChange() {
    setInterval(async () => {
      if (this.isBusy) return; // Skip iteration if bot is busy
      this.isBusy = true;
      try {
        [
          this.currentJoinNodes,
          this.currentLeaveNodes,
          this.kickedNode,
          this.callingMe,
          this.roomId,
        ] = await ActivityHook(this.page);

        await this.AiResponse();
        await this.joinedUser();
        await this.leavedUserMessage();
        await this.kickedUser();
      } catch (error) {
        console.error("Error observing page changes:", error);
      } finally {
        this.isBusy = false; // Mark bot as free after processing
      }
    }, 5000);
  }
}

module.exports = Observer;
