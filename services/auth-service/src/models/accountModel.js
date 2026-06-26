import mongoose from "mongoose";
import { randomUUID } from "crypto";

const accountSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
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
  const account = new Account(data);
  await account.save();
  return account;
};

const login = async (data) => {
  const account = await Account.findOne({ Email: data.Email });
  if (!account) {
    throw new Error("Account not found");
  }
  if (account.Password !== data.Password) {
    throw new Error("Invalid password");
  }
  return account;
};

const changePassword = async (data) => {
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
};

const remove = async (id) => {
  const account = await Account.findByIdAndDelete(id);
  if (!account) {
    throw new Error("Account not found");
  }
  return account;
};

const update = async (id, data) => {
  const account = await Account.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!account) {
    throw new Error("Account not found");
  }
  return account;
};

const forget = async (data) => {
  const account = await Account.findOne({ Email: data.Email });
  if (!account) {
    throw new Error("Account not found");
  }
  account.Password = data.newPassword;
  await account.save();
  return account;
};

const getAll = async () => {
  return Account.find();
};

export { Account, create, login, changePassword, remove, update, forget, getAll };
