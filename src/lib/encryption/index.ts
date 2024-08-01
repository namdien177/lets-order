import * as crypto from "node:crypto";
import bcrypt from "bcrypt";

const saltRounds = 12;

export const hashText = (text: string) => {
  return bcrypt.hash(text, saltRounds);
};

export const compareHash = (text: string, hash: string) => {
  return bcrypt.compare(text, hash);
};

export const generateRandomString = (length: number) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};
