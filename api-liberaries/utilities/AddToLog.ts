import fs from "fs";
import path from "path";

const AddToLog = (fileName: string, logMessage: string, dirName: string) => {
  const logDirectory = path.join(__dirname, "logs/" + dirName);
  const logFile = path.join(logDirectory, `${fileName}.txt`);

  // Ensure the logs directory exists
  // if (!fs.existsSync(logDirectory)) {
  //   fs.mkdirSync(logDirectory, { recursive: true });
  // }

  // const timestamp = new Date().toISOString();
  // const logEntry = `[${timestamp}] ${logMessage}\n`;

  // fs.appendFile(logFile, logEntry, (err) => {
  //   if (err) {
  //     console.error("Error writing to log file", err);
  //   }
  // });
};

module.exports = AddToLog;
