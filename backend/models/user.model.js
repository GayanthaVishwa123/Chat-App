import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { type } from "os";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match!",
      },
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "Hi I always use this chat app",
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // 1 second delay to ensure JWT is issued after password change
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // reset token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createEmailVerificationToken = function () {
  const GmailToken = crypto.randomBytes(32).toString("hex");

  // Gmail token
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(GmailToken)
    .digest("hex");

  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
  return GmailToken;
};

const User = mongoose.model("User", userSchema);

export default User;
