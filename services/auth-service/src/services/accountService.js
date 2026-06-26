import { generateToken } from "../config/jwt.js";
import {
  create,
  login,
  changePassword,
  update,
  remove,
  forget,
  getAll,
} from "../models/accountModel.js";

const createAccount = async (data) => {
  const newAccount = {
    ...data,
    FullName: data.FullName?.trim(),
    Email: data.Email?.trim().toLowerCase(),
    Phone: data.Phone?.trim(),
  };

  if (!newAccount.DateOfBirth) {
    delete newAccount.DateOfBirth;
  }

  return create(newAccount);
};

const loginAccount = async (data) => {
  const account = await login(data);
  const token = generateToken(account);
  return { account, token };
};

const changePasswordAcc = async (data) => {
  if (data.body.newPassword !== data.body.confirmPassword) {
    throw new Error("Passwords do not match");
  }
  return changePassword(data);
};

const removeAccount = async (id) => {
  return remove(id);
};

const updateAccount = async (id, data) => {
  return update(id, data);
};

const forgetPassword = async (data) => {
  if (data.newPassword !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }
  return forget(data);
};

const getAllAccounts = async () => {
  return getAll();
};

export const accountService = {
  createAccount,
  loginAccount,
  changePassword: changePasswordAcc,
  removeAccount,
  updateAccount,
  forgetPassword,
  getAllAccounts,
};
