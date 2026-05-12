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
  try {
    const newAccount = {
      ...data,
    };
    const createdAccount = await create(newAccount);
    return createdAccount;
  } catch (error) {
    throw new Error("Error creating account");
  }
};
const loginAccount = async (data) => {
  try {
    const account = await login(data);
    const token = generateToken(account);
    return { account, token };
  } catch (error) {
    throw new Error("Error during account login");
  }
};
const changePasswordAcc = async (data) => {
  try {
    if (data.body.newPassword !== data.body.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    const account = await changePassword(data);
    return account;
  } catch (error) {
    throw new Error("Error changing password");
  }
};
const removeAccount = async (id) => {
  try {
    const account = await remove(id);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  } catch (error) {
    throw new Error("Error deleting account");
  }
};
const updateAccount = async (id, data) => {
  try {
    const account = await update(id, data);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  } catch (error) {
    throw new Error("Error updating account");
  }
};
const forgetPassword = async (data) => {
  try {
    if (data.newPassword !== data.confirmPassword) {
      throw new Error("Passwords do not match");
    }
    const account = await forget(data);
    if (!account) {
      throw new Error("Account not found");
    }
    // Implement password reset logic here
    return account;
  } catch (error) {
    throw new Error("Error during password reset");
  }
};
const getAllAccounts = async () => {
  try {
    const accounts = await getAll();
    return accounts;
  } catch (error) {
    throw new Error("Error fetching accounts");
  }
};
export const accountService = {
  createAccount,
  loginAccount,
  changePassword: changePasswordAcc,
  removeAccount,
  updateAccount,
  forgetPassword,
  getAllAccounts,
  // more
};