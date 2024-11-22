const fs = require("fs");
const path = require("path");

class Logger {
  constructor(logFile = "log.txt") {
    // Ensure log file path is absolute
    this.loggerfile = path.isAbsolute(logFile)
      ? logFile
      : path.resolve(logFile);
  }

  /**
   * Log a message to the log file with a timestamp
   * @param {string} logMessage - The message to log
   */
  logToFile(logMessage) {
    const timestamp = new Date().toISOString(); // Get the current timestamp
    const message = `${timestamp} - ${logMessage}\n`; // Format the log message with a timestamp

    try {
      // Append the message to the log file
      fs.appendFileSync(this.loggerfile, message, { encoding: "utf8" });
      console.log("Log written:", message.trim());
    } catch (error) {
      // Enhanced error handling
      console.error("Error writing to log file:", error.message);
    }
  }
}

module.exports = Logger;
