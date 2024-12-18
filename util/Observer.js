const Logger = require("./logger");
const wrtc = require("wrtc");
const WebSocket = require("ws");
const {
  WelcomeMessages,
  funnyLeavingMessages,
  roastedKickMessages,
  fallbackMessage,
  SpendingTime,
} = require("../data/Message");
const ActivityHook = require("../Hooks/Activityhooks");
const ChatGPTAutomation = require("./ChatGptAutomation");
const dotenv = require("dotenv");
const tagHook = require("../Script/tagReply");
const intructions = require("./Instructions");
const Delay = require("../Hooks/Delay");
dotenv.config({ path: "../.env" });

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
    this.JoinedUserTimes = [];
    this.isIntroduce = [];
    this.currentPromotedNode = [];
    this.prevPromotedNode = [];
    this.userReplies = [];
    this.prevReply = [];
    this.doWelcome = false;
    // Flags
    this.isBusy = false;
    this.songPlaying = { isPlaying: true, timeStamp: null };
    // Message templates
    this.welcomeMessages = WelcomeMessages;
    this.funnyLeavingMessages = funnyLeavingMessages;
    this.roastedKickMessages = roastedKickMessages;
    this.fallbackMessage = fallbackMessage;
    this.TimeSpend = SpendingTime;
    this.getMessages = [];
    this.allPrevMessage = [];
    this.waitTime = 0;
    this.MesCombo = "";
  }

  async ActiveReplyTab(node) {
    return await this.page.evaluate(async (node) => {
      // Make actions visible
      try {
        let invisibleDiv = document.querySelectorAll(
          ".flrtHK.message .actions"
        );
        invisibleDiv.forEach((action) => {
          action.style.visibility = "visible";
          action.style.lineHeight = "normal";
        });

        // Wait for the DOM update
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Find the message box by data-message-id
        const msgbox = document.querySelectorAll(
          `div[data-message-id="${node.messageId}"]`
        );

        if (msgbox.length > 0) {
          // Proceed to find the button inside the msgbox
          const replyb = Array.from(
            msgbox[0].querySelectorAll(".ant-btn-background-ghost")
          ).find((btn) => {
            const span = btn.querySelector("span");
            return (
              span &&
              span.innerText.trim() === `${node.pmMode ? "PM" : "Reply"}`
            );
          });

          if (replyb) {
            console.log(replyb);
            replyb.click();

            return true; // Return true indicating success
          } else {
            return false; // Return false if the button isn't found
          }
        } else {
          return false; // Return false if the message box is not found
        }
      } catch (err) {
        console.log(err);
      }
    }, node);
  }

  async selfIntroduce() {
    await this.page.waitForSelector("textarea");
    const newMessages = this.isIntroduce.filter(
      (node) => node.roomId == this.roomId
    )[0];
    if (!newMessages) {
      await this.messageSender(
        `Hello! I’m ${process.env.owner}, your AI companion. I’ve been created by Aadarsh to randomly join rooms, greet you, and hang out for a while. If you need anything, just let me know!`
      );
      this.isIntroduce.push({
        roomId: this.roomId,
      });
    }
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
      // console.error("Error sending message:", err);
      console.log("got error");
    }
  }

  async closeQuote() {
    return await this.page.evaluate(async () => {
      // Make actions visible
      try {
        let pmcontainer = document.querySelector(".extra");
        if (pmcontainer) {
          let pmclose = pmcontainer.querySelector("button");
          pmclose.click();
        }
      } catch (err) {
        console.log(err);
      }
    });
  }

  async processResponse(node) {
    const sanitizedNode = node.message
      .replace(new RegExp(`@${process.env.owner}`, "gi"), "") // Replace @Veronica (case-insensitive)
      .trim();

    try {
      const logMessage = `${node.user}: ${node.message}`;
      this.Logger.logToFile(logMessage);
      const ans = await new ChatGPTAutomation(
        this.page,
        this.browser
      ).getAnswers(
        `${sanitizedNode},reply like real human,roasting behaviour use emojis, keep chat under 10-15 words, male proceptive`
      );
      const sanitizedans = ans.replace(
        new RegExp(`${node.user}`, "gi"),
        `\`\`@${node.user}\`\``
      );
      const response = ans
        ? sanitizedans
        : `\`\`@${node.user}\`\` mai bhul gaye hum kaha the 😂😂`;
      this.prevReply.push({
        username: process.env.owner,
        message: ans,
        roomId: this.roomId,
      });
      await this.messageSender(response);
      await this.closeQuote();
    } catch (error) {
      console.error("Error generating AI response:");
      const fallback = this.fallbackMessage(node.user);
      const fallbackMessage =
        fallback[Math.floor(Math.random() * fallback.length)];
      await this.messageSender(fallbackMessage);
    }
  }

  async makeReply() {
    try {
      const newMessages = this.userReplies.filter(
        (node) =>
          !this.prevReply.some(
            (state) =>
              state.username === node.user &&
              state.message === node.message &&
              state.roomId === this.roomId
          )
      );
      console.log(newMessages);
      for (const node of newMessages) {
        this.prevReply.push({
          username: node.user,
          message: node.message,
          roomId: this.roomId,
        });
        // console.log(node);
        if (node.user !== "Roshni") {
          await this.ActiveReplyTab(node);
          return await this.processResponse(node);
        }
      }
    } catch (err) {
      console.error("Error processing AI responses:", err);
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
          if (this.doWelcome) {
            const messages = this.welcomeMessages(username);
            const message =
              messages[Math.floor(Math.random() * messages.length)];
            await this.messageSender(message);
          }
          this.previousJoinNodes.push(username); // Track processed users
          let currentTime = Date.now();
          this.JoinedUserTimes.push({
            username: username,
            joinedTime: currentTime,
          });
        }
      }
    } catch (err) {
      console.error("Error processing joined users:");
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
          // const messages = this.funnyLeavingMessages(username);
          // const message = messages[Math.floor(Math.random() * messages.length)];
          // await this.messageSender(message);
          let leavedUser = this.JoinedUserTimes.filter(
            (node) => node.username == username
          )[0];
          if (leavedUser) {
            let currentTime = Date.now(); // Corrected to Date.now() instead of new Date.now()
            let timeDifference = currentTime - leavedUser.joinedTime;

            // Convert the time difference to minutes and hours
            let differenceInMinutes = Math.floor(timeDifference / (60 * 1000)); // Total minutes
            let differenceInHours = Math.floor(differenceInMinutes / 60); // Extract hours from total minutes
            let remainingMinutes = differenceInMinutes % 60; // Remaining minutes after hours

            if (differenceInHours > 0) {
              let spendingTime = `${differenceInHours} hour(s) and ${remainingMinutes} minute(s)`;
              const messages = this.TimeSpend(username, spendingTime);
              const message =
                messages[Math.floor(Math.random() * messages.length)];
              await this.messageSender(message);
              return this.previousLeaveNodes.add(node);
            } else if (differenceInMinutes > 0) {
              let spendingTime = `${remainingMinutes} minute(s)`;
              const messages = this.TimeSpend(username, spendingTime);
              const message =
                messages[Math.floor(Math.random() * messages.length)];
              await this.messageSender(message);
              return this.previousLeaveNodes.add(node);
            } else {
              const messages = this.funnyLeavingMessages(username);
              const message =
                messages[Math.floor(Math.random() * messages.length)];
              await this.messageSender(message);
              return this.previousLeaveNodes.add(node);
            }
          }
        }
        // Track processed leave events
        this.previousLeaveNodes.add(node);
      }
    } catch (err) {
      console.error("Error processing leave messages");
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
        console.log("on tag", node);
        if (node.message.includes("get link")) {
          let url = await intructions(this.page, node.message);
          if (url) {
            return await this.messageSender(url);
          }
          return await this.messageSender("didnt found url");
        }
        if (
          node.message.includes("get unknown messages") &&
          node.user == "Aadarsh"
        ) {
          return await this.showUnverifiedMessage();
        }

        const sanitizedNode = node.message
          .replace(new RegExp(`@${process.env.owner}`, "gi"), "") // Replace @Veronica (case-insensitive)
          .trim();

        if (sanitizedNode == "welcome users" && node.user == "Aadarsh") {
          this.doWelcome = true;
          return await this.messageSender("jaisa apka hukum");
        }
        if (sanitizedNode == "dont welcome users" && node.user == "Aadarsh") {
          this.doWelcome = false;
          return await this.messageSender("jaisa apka hukum");
        }

        if (node.pmMode) {
          await this.ActiveReplyTab(node);
          return await this.processResponse(node);
        }

        return await this.processResponse(node);
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
      console.error("Error processing kicked users:");
    }
  }

  async PromotedNode() {
    if (this.currentPromotedNode) {
      if (!this.prevPromotedNode.includes(this.currentPromotedNode)) {
        const ans = await new ChatGPTAutomation(
          this.page,
          this.browser
        ).getAnswers(this.currentPromotedNode);
        const response = ans
          ? `\`\`@${node.user}\`\` ${ans}`
          : `\`\`@${node.user}\`\` Tu kahi jake dub maar 😂😂 bhosdike.`;
        await this.messageSender(response);
        this.prevPromotedNode(this.currentPromotedNode);
      }
    }
  }

  async showUnverifiedMessage() {
    for (let node of this.allPrevMessage) {
      const response = `\`\`@${node.user}\`\` sends ${node.message}`;
      await this.messageSender(response);
    }
  }
  async getAllRecentMessage() {
    // Filter out new messages that are not already processed
    const newMessages = this.getMessages.filter(
      (node) =>
        !this.allPrevMessage.some(
          (state) =>
            state.username === node.user &&
            state.message === node.message &&
            state.roomId === this.roomId
        )
    );

    // Process all new messages
    for (const node of newMessages) {
      this.allPrevMessage.push({
        username: node.user,
        message: node.message,
        roomId: this.roomId,
        read: false,
      });
    }
  }

  async ObservePageChange() {
    setInterval(async () => {
      if (this.isBusy) return; // Skip iteration if bot is busy
      [
        this.currentJoinNodes,
        this.currentLeaveNodes,
        this.kickedNode,
        this.callingMe,
        this.roomId,
        this.currentPromotedNode,
        this.userReplies,
        this.getMessages,
      ] = await ActivityHook(this.page);

      this.isBusy = true;
      try {
        // await this.getAllRecentMessage();
        await this.makeReply();
        await this.AiResponse();
        await this.joinedUser();
        // await this.leavedUserMessage();
        await this.kickedUser();

        // await this.PromotedNode();
      } catch (error) {
        console.log(error);
        console.error("Error observing page changes:");
      } finally {
        this.isBusy = false; // Mark bot as free after processing
      }
    }, 5000);
  }
}

module.exports = Observer;
