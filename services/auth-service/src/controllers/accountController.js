import { accountService } from "../services/accountService.js";
import { StatusCodes } from "http-status-codes";

const resolveCreateAccountStatus = (error) => {
  if (error?.code === 11000) {
    return StatusCodes.CONFLICT;
  }

  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return StatusCodes.BAD_REQUEST;
  }

  return StatusCodes.INTERNAL_SERVER_ERROR;
};

const resolveCreateAccountMessage = (error) => {
  if (error?.code === 11000) {
    return "Email already exists";
  }

  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return "Invalid account information";
  }

  return "Error creating account";
};

const createAccount = async (req, res) => {
  try {
    const createdAccount = await accountService.createAccount(req.body);
    res.status(StatusCodes.CREATED).json({
      message: "Account created successfully",
      account: createdAccount,
    });
  } catch (error) {
    res.status(resolveCreateAccountStatus(error)).json({
      message: resolveCreateAccountMessage(error),
      error: error.message,
    });
  }
};

const loginAccount = async (req, res) => {
  try {
    const { account, token } = await accountService.loginAccount(req.body);
    res.status(StatusCodes.OK).json({
      message: "Account logged in successfully",
      account,
      token,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error during account login on controller",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const account = await accountService.changePassword(req);
    res.status(StatusCodes.OK).json({
      message: "Password changed successfully",
      account,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error changing password",
      error: error.message,
    });
  }
};

const removeAccount = async (req, res) => {
  try {
    const account = await accountService.removeAccount(req.params.id);
    res.status(StatusCodes.OK).json({
      message: "Account deleted successfully",
      account,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error deleting account",
      error: error.message,
    });
  }
};

const updateAccount = async (req, res) => {
  try {
    const account = await accountService.updateAccount(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: "Account updated successfully",
      account,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error updating account",
      error: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const account = await accountService.forgetPassword(req.body);
    res.status(StatusCodes.OK).json({
      message: "Password reset successfully",
      account,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error during password reset",
      error: error.message,
    });
  }
};

const getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountService.getAllAccounts();
    res.status(StatusCodes.OK).json({
      message: "Accounts fetched successfully",
      accounts,
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
};
