import { AppRequest, DynamicObjectType } from "../types/global.data";
import { empty, isString } from "./utils";

class Utilities {
  //generate access code
  static async generateAccessCode(): Promise<number> {
    const minm = 10000;
    const maxm = 99999;
    return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
  }

  /**
   * Get expiration time based on duration in minutes
   * @param duration
   * @returns
   */
  static getExpirationTime(duration: number) {
    const now = new Date();
    now.setMinutes(now.getMinutes() + duration);
    const epochTime = Math.floor(now.getTime() / 1000);
    return epochTime;
  }

  /**
   * Get current epoch time
   * @returns
   */
  static getNow() {
    const now = new Date();
    now.setMinutes(now.getMinutes());
    const epochTime = Math.floor(now.getTime() / 1000);
    return epochTime;
  }

  // generate password
  static async generatePassword(length: number): Promise<string> {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  // generate Id
  static async generateId(length: number): Promise<string> {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  // generate registration number
  static async generateRegNo(currentSN: number): Promise<string> {
    const now = new Date();
    // Extract year, month, and day
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so we add 1 and pad with 0 if needed
    const currentDay = String(now.getDate()).padStart(2, "0"); // Pad with 0 if needed

    // Assuming "sn" is a running serial number, initialize it to 100000
    const sn = currentSN + 1;

    // Concatenate all the parts to form the registration number
    const registrationNumber = `${currentYear}${currentMonth}${currentDay}${sn}`;
    return registrationNumber;
  }

  // is dev
  static isDev(req: AppRequest): boolean {
    const environment = process.env.NODE_ENV;
    if (environment && environment === "production") {
      return false;
    } else if (
      req &&
      req.hostname &&
      isString(req.hostname) &&
      (req.hostname.includes("local.") === true ||
        req.hostname.includes("local-") === true ||
        req.hostname.includes("dev.") === true)
    ) {
      return true;
    }

    return true;
  }

  // Get ordinal suffix for a given day
  static getOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  // Humanize the date
  static humanizeDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const ordinalSuffix = this.getOrdinalSuffix(day);
      const weekday = new Intl.DateTimeFormat("en-US", {
        weekday: "short",
      }).format(date);
      const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        date
      );
      const year = date.getFullYear();

      return `${weekday} ${day}${ordinalSuffix} ${month}, ${year}`;
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  // get input type date format
  static getInputDateFormat(now: DynamicObjectType): string {
    try {
      if (empty(now)) {
        now = new Date();
      }
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      return formattedDate;
    } catch (error) {
      console.log(error);
      return "";
    }
  }

  static isBase64(str: string): boolean {
    try {
      if (empty(str) || !isString(str)) return false;
      str = str.trim();
      if (!str) return false;

      // Regular expression for Base64
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;

      // Check if string matches Base64 pattern and length is multiple of 4
      return base64Regex.test(str) && str.length % 4 === 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default Utilities;
