import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
const accountSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    FullName: {
      type: String,
      required: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
    },
    Password: {
      type: String,
      required: true,
    },
    Phone: {
      type: String,
      required: true,
    },
    Role: {
      type: String,
      enum: ["admin", "operator", "customer"],
      default: "customer",
      required: true,
    },
    DateOfBirth: {
      type: Date,
    },
  },
  { timestamps: true }
);
const Account = mongoose.model("Account", accountSchema);
const create = async (data) => {
  try {
    const account = new Account(data);
    await account.save();
    return account;
  } catch (error) {
    throw new Error("Error creating account");
  }
};
const login = async (data) => {
  try {
    const account = await Account.findOne({ Email: data.Email });
    if (!account) {
      throw new Error("Account not found");
    }
    if (account.Password !== data.Password) {
      throw new Error("Invalid password");
    }
    return account;
  } catch (error) {
    throw new Error("Error during login on account model");
  }
};
const changePassword = async (data) => {
  try {
    const account = await Account.findOne({ Email: data.user.email });
    if (!account) {
      throw new Error("Account not found");
    }
    if (account.Password !== data.body.oldPassword) {
      throw new Error("Invalid old password");
    }
    account.Password = data.body.newPassword;
    await account.save();
    return account;
  } catch (error) {
    throw new Error("Error changing password");
  }
};
const remove = async (id) => {
  try {
    const account = await Account.findByIdAndDelete(id);
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  } catch (error) {
    throw new Error("Error deleting account");
  }
};
const update = async (id, data) => {
  try {
    const account = await Account.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!account) {
      throw new Error("Account not found");
    }
    return account;
  } catch (error) {
    throw new Error("Error updating account");
  }
};
const forget = async (data) => {
  try {
    const account = await Account.findOne({ Email: data.Email });
    account.Password = data.newPassword;
    await account.save();
    if (!account) {
      throw new Error("Account not found");
    }
    // Generate a reset token and send it to the user's email
    return account;
  } catch (error) {
    throw new Error("Error during password reset");
  }
};
const getAll = async () => {
  try {
    const accounts = await Account.find();
    return accounts;
  } catch (error) {
    throw new Error("Error fetching accounts");
  }
};
export {
  Account,
  create,
  login,
  changePassword,
  remove,
  update,
  forget,
  getAll,
};