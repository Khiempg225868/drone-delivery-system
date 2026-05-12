import { accountService } from "../services/accountService.js";
import { StatusCodes } from "http-status-codes";

const createAccount = async (req, res, next) => {
  try {
    const createdAccount = await accountService.createAccount(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Account created successfully",
      account: createdAccount,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating account",
      error: error.message,
    });
  }
};
const loginAccount = async (req, res, next) => {
  try {
    const { account, token } = await accountService.loginAccount(req.body);
    res.status(StatusCodes.OK).json({
      message: "Account logged in successfully",
      account: account,
      token: token,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error during account login on controller",
      error: error.message,
    });
  }
};
const changePassword = async (req, res, next) => {
  try {
    const account = await accountService.changePassword(req);
    res.status(StatusCodes.OK).json({
      message: "Password changed successfully",
      account: account,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error changing password",
      error: error.message,
    });
  }
};
const removeAccount = async (req, res, next) => {
  try {
    const removedAccount = await accountService.removeAccount(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Account removed successfully",
      account: removedAccount,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error removing account",
      error: error.message,
    });
  }
};
const updateAccount = async (req, res, next) => {
  try {
    const updatedAccount = await accountService.updateAccount(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json({
      message: "Account updated successfully",
      account: updatedAccount,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error updating account",
      error: error.message,
    });
  }
};
const forgetPassword = async (req, res, next) => {
  try {
    const account = await accountService.forgetPassword(req.body);
    res.status(StatusCodes.OK).json({
      message: "Password reset successfully",
      account: account,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error during password reset",
      error: error.message,
    });
  }
};
const getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.status(StatusCodes.OK).json({
      message: "Accounts fetched successfully",
      accounts: accounts,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching accounts",
      error: error.message,
    });
  }
};
export const accountController = {
  createAccount,
  loginAccount,
  changePassword,
  removeAccount,
  updateAccount,
  forgetPassword,
  getAllAccounts,
  // more
};