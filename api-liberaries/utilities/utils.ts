/* eslint-disable @typescript-eslint/no-explicit-any */
// import uuid from "uuid";
import { has, forEach } from "lodash";
import * as uuid from "uuid";
import { DynamicObjectType } from "../types/global.data";
// import libphonenumber from "google-libphonenumber";

export const isNumber = (value: string | number | unknown = null) => {
  try {
    return (
      typeof value === "number" &&
      value === value &&
      value !== Infinity &&
      value !== -Infinity
    );
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const isBoolean = (value: any = null) => {
  return typeof value === "boolean" || value === true || value === false;
};

export const isUndefined = (value: any = null) => {
  return typeof value === "undefined" || value === undefined;
};

export const isObject = (value: any = null) => {
  return typeof value === "object" &&
    Object.prototype.toString.call(value) === "[object Object]"
    ? true
    : false;
};

export const isArray = (value: any = null) => {
  return (typeof value === "object" &&
    Object.prototype.toString.call(value) === "[object Array]") ||
    Array.isArray(value)
    ? true
    : false;
};

export const isString = (value: any = null) => {
  return typeof value === "string";
};

export const isNull = (value: any = null) => {
  return value === null ? true : false;
};

export const empty = (value: any = null) => {
  let flag = false;
  if (isString(value) && (value === "" || value.trim() === "")) flag = true;
  else if (isNumber(value) && value === 0) flag = true;
  else if (isBoolean(value) && value === false) flag = true;
  else if (isObject(value) && Object.values(value).length === 0) flag = true;
  else if (isArray(value) && value.length === 0) flag = true;
  else if (isUndefined(value)) flag = true;
  else if (isNull(value)) flag = true;
  else if (Array.isArray(value) && value.length === 0) flag = true;
  else if (typeof value === "object" && Object.keys(value).length === 0)
    flag = true;

  return flag;
};

export const isDbObjectValid = (data: any) => {
  if (
    !empty(data) &&
    !isUndefined(data) &&
    isObject(data) &&
    has(data, "_id")
  ) {
    return true;
  }
  return false;
};

export const reIndex = (
  array: Array<DynamicObjectType>,
  key: string = "_id"
) => {
  const indexed_array: DynamicObjectType = {};
  if ((isArray(array) || isObject(array)) && !empty(array)) {
    forEach(array, (item) => {
      if (isObject(item) && has(item, key)) {
        indexed_array[item[key]] = item;
      }
    });
    return indexed_array;
  } else {
    return {};
  }
};

export const reIndexedToArray = (reIndexedArray: DynamicObjectType) => {
  return Object.keys(reIndexedArray).map((key) => reIndexedArray[key]);
};

export function sanitizeAndValidateRequest(
  body: DynamicObjectType,
  schema: DynamicObjectType
) {
  const result: DynamicObjectType = {
    sanitizedValues: {},
    errors: {},
  };

  // Helper function to validate UUID
  function validateUUID(id: string) {
    return uuid.validate(id);
  }

  // Helper function to recursively sanitize and validate objects
  function sanitizeObject(
    obj: DynamicObjectType,
    objSchema: DynamicObjectType
  ) {
    const sanitizedObject: DynamicObjectType = {};
    const objectErrors: DynamicObjectType = {};

    for (const field in objSchema) {
      const { type, rules = {} } = objSchema[field];
      const value = obj[field];

      let sanitizedValue;
      let errorMessage = null;

      switch (type) {
        case "string":
          sanitizedValue = String(value).trim();
          if (empty(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(field)} is required.`;
          }
          if (rules.minLength && sanitizedValue.length < rules.minLength) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be at least ${rules.minLength} characters long.`;
          }
          if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be no more than ${rules.maxLength} characters long.`;
          }
          break;

        case "number":
          sanitizedValue = Number(value);
          if (empty(sanitizedValue) && sanitizedValue !== 0) {
            errorMessage = `Field '${puritifyFieldName(field)} is required.`;
          }
          if (isNaN(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be a valid number.`;
          }
          if (rules.min && sanitizedValue < rules.min) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be greater than or equal to ${rules.min}.`;
          }
          if (rules.max && sanitizedValue > rules.max) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be less than or equal to ${rules.max}.`;
          }
          break;

        case "boolean":
          sanitizedValue = Boolean(value);
          break;

        case "email": {
          sanitizedValue = String(value).trim().toLowerCase();
          if (empty(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(field)} is required.`;
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be a valid email address.`;
          }
          break;
        }

        case "date":
          sanitizedValue = new Date(value);
          if (empty(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(field)} is required.`;
          }
          if (isNaN(sanitizedValue.getTime())) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be a valid date.`;
          }
          break;

        case "url":
          sanitizedValue = String(value).trim();
          if (empty(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(field)} is required.`;
          }
          try {
            new URL(sanitizedValue);
          } catch (e) {
            console.log(e);
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be a valid URL.`;
          }
          break;

        case "uuid":
          sanitizedValue = String(value).trim();
          if (!validateUUID(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be a valid id.`;
          }
          break;

        case "array":
          if (empty(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(field)} is required.`;
          }
          if (!Array.isArray(value)) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be an array.`;
          } else {
            sanitizedValue = value.map((item) =>
              rules.itemsType
                ? sanitizeAndValidateRequest(
                    { item },
                    { item: rules.itemsType }
                  ).sanitizedValues.item
                : item
            );
          }
          break;

        case "object":
          if (empty(sanitizedValue)) {
            errorMessage = `Field '${puritifyFieldName(field)} is required.`;
          }
          if (typeof value !== "object" || Array.isArray(value)) {
            errorMessage = `Field '${puritifyFieldName(
              field
            )}' must be a valid object.`;
          } else {
            const sanitizedSubObject = sanitizeObject(value, rules.schema);
            sanitizedValue = sanitizedSubObject.sanitizedValues;
            if (Object.keys(sanitizedSubObject.errors).length > 0) {
              objectErrors[field] = sanitizedSubObject.errors;
            }
          }
          break;

        default:
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' has an unsupported type '${type}'.`;
      }

      // Set the sanitized value or error
      if (errorMessage) {
        objectErrors[field] = errorMessage;
      } else {
        sanitizedObject[field] = sanitizedValue;
      }
    }

    return { sanitizedValues: sanitizedObject, errors: objectErrors };
  }

  // Iterate through schema to validate and sanitize each field in the body
  for (const field in schema) {
    const { type, rules = {} } = schema[field];
    const value = body[field];

    let sanitizedValue;
    let errorMessage = null;

    // Sanitize and validate input based on type
    switch (type) {
      case "string":
        sanitizedValue = String(value).trim();
        if (empty(sanitizedValue)) {
          errorMessage = `Field '${puritifyFieldName(field)} is required.`;
        }
        if (rules.minLength && sanitizedValue.length < rules.minLength) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be at least ${rules.minLength} characters long.`;
        }
        if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be no more than ${rules.maxLength} characters long.`;
        }
        break;

      case "number":
        sanitizedValue = Number(value);
        if (empty(sanitizedValue) && sanitizedValue !== 0) {
          errorMessage = `Field '${puritifyFieldName(field)} is required.`;
        }
        if (isNaN(sanitizedValue)) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be a valid number.`;
        }
        if (rules.min && sanitizedValue < rules.min) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be greater than or equal to ${rules.min}.`;
        }
        if (rules.max && sanitizedValue > rules.max) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be less than or equal to ${rules.max}.`;
        }
        break;

      case "boolean":
        sanitizedValue = Boolean(value);
        break;

      case "email": {
        sanitizedValue = String(value).trim().toLowerCase();
        if (empty(sanitizedValue)) {
          errorMessage = `Field '${puritifyFieldName(field)} is required.`;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sanitizedValue)) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be a valid email address.`;
        }
        break;
      }

      case "date":
        sanitizedValue = new Date(value);
        if (isNaN(sanitizedValue.getTime())) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be a valid date.`;
        }
        break;

      case "url":
        sanitizedValue = String(value).trim();
        if (empty(sanitizedValue)) {
          errorMessage = `Field '${puritifyFieldName(field)} is required.`;
        }
        try {
          new URL(sanitizedValue);
        } catch (e) {
          console.log(e);
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be a valid URL.`;
        }
        break;

      case "uuid":
        sanitizedValue = String(value).trim();
        if (empty(sanitizedValue)) {
          errorMessage = `Field '${puritifyFieldName(field)} is required.`;
        }
        if (!validateUUID(sanitizedValue)) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be a valid id.`;
        }
        break;

      case "array":
        if (!Array.isArray(value)) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be an array.`;
        } else {
          sanitizedValue = value.map((item) =>
            rules.itemsType
              ? sanitizeAndValidateRequest({ item }, { item: rules.itemsType })
                  .sanitizedValues.item
              : item
          );
        }
        break;

      case "object":
        if (typeof value !== "object" || Array.isArray(value)) {
          errorMessage = `Field '${puritifyFieldName(
            field
          )}' must be a valid object.`;
        } else {
          const sanitizedSubObject = sanitizeObject(value, rules.schema);
          sanitizedValue = sanitizedSubObject.sanitizedValues;
          if (Object.keys(sanitizedSubObject.errors).length > 0) {
            result.errors[field] = sanitizedSubObject.errors;
          }
        }
        break;

      default:
        errorMessage = `Field '${puritifyFieldName(
          field
        )}' has an unsupported type '${type}'.`;
    }

    // Set the sanitized value or error
    if (errorMessage) {
      result.errors[field] = errorMessage;
    } else {
      result.sanitizedValues[field] = sanitizedValue;
    }
  }

  return result;
}

export const compareTimes = (time1: string, time2: string) => {
  // Convert the time strings into Date objects for comparison
  const date1 = convertTo24HourFormat(time1);
  const date2 = convertTo24HourFormat(time2);

  // Compare the two Date objects
  if (date1 > date2) {
    return -1;
  }

  if (date1 == date2) {
    return 0;
  }

  if (date1 < date2) {
    return 1;
  }

  return -1;
};

export const convertTo24HourFormat = (time: string) => {
  const [timePart, modifier] = time.split(" ");
  const [_hours, minutes] = timePart.split(":");
  let hours = _hours;

  if (modifier === "PM" && hours !== "12") {
    hours = String(parseInt(hours, 10) + 12); // Convert PM hour to 24-hour format
  } else if (modifier === "AM" && hours === "12") {
    hours = "0"; // Midnight case
  }

  return `${hours.padStart(2, "0")}:${minutes}`;
};

export const findMatchingElements = (
  array1: Array<string | number | null | undefined>,
  array2: Array<string | number | null | undefined>
) => {
  return array1.filter((item) => array2.includes(item));
};

export const timeStringToDate = (timeString: string) => {
  return new Date(`1970-01-01T${convertTo24HourFormat(timeString)}`);
};

export const convertTo12HourFormat = (time: DynamicObjectType) => {
  const [hours, minutes] = time.split(":");
  const hoursInt = parseInt(hours, 10);
  const modifier = hoursInt >= 12 ? "PM" : "AM";
  const displayHours = hoursInt % 12 || 12; // Convert '0' hour to '12'

  return `${String(displayHours).padStart(2, "0")}:${minutes} ${modifier}`;
};

export const sanitizePhoneNumber = (phone: string) => {
  if (empty(phone)) return "";
  // Remove all non-numeric characters
  phone = phone.replace(/[^0-9]/g, "");
  // Check if the phone number is valid (e.g., length)
  if (phone.length < 10 || phone.length > 15) {
    return "";
  }
  return phone;
};

export const puritifyFieldName = (field: string) => {
  if (empty(field)) return "";
  return field
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const toInternationalFormat = (
  phoneNumber: string,
  countryCode: string
) => {
  // const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
  try {
    if (isString(countryCode) && countryCode.includes("+")) {
      countryCode = countryCode.replace("+", "");
    }

    if (phoneNumber.charAt(0) === "0") {
      phoneNumber = phoneNumber.replace(/^0+/, "");
    }

    // if (countryCode) {
    const parsedNumber = `${countryCode}${phoneNumber}`;
    // } else {
    //   parsedNumber = phoneUtil.parseAndKeepRawInput(phoneNumber);
    // }

    // Check if the number is valid
    // if (!phoneUtil.isValidNumber(parsedNumber)) {
    //   return { error: "Invalid phone number" };
    // }
    if (!isString(parsedNumber)) {
      return { error: "Invalid phone number" };
    }

    // Format in E.164 (e.g., +15551234567)
    // const e164Format = phoneUtil.format(
    //   parsedNumber,
    //   libphonenumber.PhoneNumberFormat.E164
    // );

    // Optional: also get national format or international with spaces
    // const international = phoneUtil.format(parsedNumber, libphonenumber.PhoneNumberFormat.INTERNATIONAL);
    // const national = phoneUtil.format(parsedNumber, libphonenumber.PhoneNumberFormat.NATIONAL);

    // return {
    //   e164,
    //   international, // e.g., +1 555 123 4567
    //   national,      // e.g., (555) 123-4567
    //   countryCode: parsedNumber.getCountryCode(),
    //   isValid: true
    // };

    return parsedNumber;
  } catch (error: unknown) {
    return { error: error || "Failed to parse number" };
  }
};
