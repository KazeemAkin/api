import { DynamicObjectType } from "../types/global.data";
import axios, { AxiosResponse } from "axios";

const API_KEY = process.env.TERMII_API_KEY;
const TERMII_ID = process.env.TERMII_ID;
const TERMII_SMS_URL = process.env.TERMII_SMS_URL;

const SendSMS = async (
  payload: DynamicObjectType,
  channel: string = "generic",
  type: string = "plain"
) => {
  try {
    const to = payload?.receiver || null;
    const message = payload?.message || null;
    if (!to || !message) {
      return false;
    }

    const data = {
      to,
      from: TERMII_ID,
      api_key: API_KEY,
      type,
      channel,
      sms: message,
    };
    const options = {
      method: "POST",
      url: TERMII_SMS_URL,
      headers: {
        "Content-Type": "application/json",
      },
      data,
    };

    const response: AxiosResponse = await axios(options);
    if (!response.status || response.status !== 200) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default SendSMS;
