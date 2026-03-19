import bcrypt from "bcrypt";
import { empty, isString } from "../utilities/utils";

export const generate_salt = () => {
  try {
    const salt = bcrypt.genSaltSync(
      Number(process.env.BCRYPT_SALT_ROUNDS || 10),
    );
    return salt;
  } catch (error) {
    console.error("Error generating salt:", error);
    return false;
  }
};

export const hash_password = (password: string) => {
  try {
    if (empty(password) || !isString(password)) {
      return false;
    }

    const salt = exports.generate_salt();
    if (!salt) {
      return false;
    }

    const hashed_password = bcrypt.hashSync(password, salt);
    return hashed_password;
  } catch (error) {
    console.error("Error hashing password:", error);
    return false;
  }
};

export const compare_password = async (
  password: string,
  hashed_password: string,
) => {
  try {
    if (empty(password) || !isString(password) || empty(hashed_password)) {
      return false;
    }

    const isMatch = await bcrypt.compare(password, hashed_password);
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    return false;
  }
};
