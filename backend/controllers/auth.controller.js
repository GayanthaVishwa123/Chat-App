import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { promisify } from "util";
import sendmailer from "../utilis/email.js";
import crypto from "crypto";

// JWT token generate
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const protectRoute = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log("Authorization Header:", req.headers.authorization);
    console.log("Token:", `"${token}"`);

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please login to get access.",
      });
    }

    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "User no longer exists.",
      });
    }

    if (
      currentUser.changedPasswordAfter &&
      currentUser.changedPasswordAfter(decoded.iat)
    ) {
      return res.status(401).json({
        message: "Password recently changed. Please log in again.",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token or session expired, please login again.",
    });
  }
};

export const signUpUser = async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;

  if (!username || !email || !password || !passwordConfirm) {
    return res.status(400).json({
      status: "error",
      message:
        "All fields (username, email, password, passwordConfirm) are required.",
    });
  }

  if (password !== passwordConfirm) {
    return res.status(400).json({
      status: "error",
      message: "Passwords do not match.",
    });
  }

  try {
    // Create new user with selected fields only
    const newUser = await User.create({
      username,
      email,
      password,
      passwordConfirm,
    });
    req.user = newUser;
    next();

    res.status(201).json({
      status: "success",
      message: "User created successfully.",
      user: newUser,
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

export const gmailverification = async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: "Username and email are required" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  const emailVerificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const confirmURL = `${req.protocol}://${req.get(
    "host"
  )}/chat-app/v1/auth/verify-email/${emailVerificationToken}`;
  console.log("confirmURL :", confirmURL);
  // Send verification email
  try {
    const emailSender = new sendmailer(user, "Email Verification");
    await emailSender.sendWelcomeEmail(confirmURL);

    console.log("Verification email sent to:", user.email);

    res.status(200).json({
      status: "success",
      message: "Verification email sent!",
    });
  } catch (err) {
    console.error("Verification Email Error:", err);
    res.status(500).json({
      status: "error",
      message: "Could not send verification email",
    });
  }
};

// verified email route
export const verifiedEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Received token:", token);

    const gmailVerifyTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    console.log("Hashed token:", gmailVerifyTokenHash);

    const user = await User.findOne({
      emailVerificationToken: gmailVerifyTokenHash,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Your email has been verified successfully!",
    });
  } catch (err) {
    console.error("Email Verification Error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong during verification",
    });
  }
};

// login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }

    const checkUser = await User.findOne({ email }).select("+password");

    if (!checkUser) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    if (!checkUser.isVerified) {
      return res.status(403).json({
        status: "fail",
        message: "Please verify your email before logging in.",
      });
    }

    const isPasswordCorrect = await checkUser.correctPassword(
      password,
      checkUser.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const token = generateToken(checkUser._id);

    res.status(200).json({
      status: "success",
      token,
      message: "Login successful",
      user: {
        id: checkUser._id,
        username: checkUser.username,
        email: checkUser.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error. Please try again later.",
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide current, new and confirm passwords",
      });
    }

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "New password and confirm password do not match",
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const isCorrect = await user.correctPassword(
      currentPassword,
      user.password
    );
    if (!isCorrect) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      status: "success",
      token,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

// forget password
export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "No user found with that email address",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/chat-app/v1/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}\nIf you didn't request this, please ignore this email.`;
  try {
    await sendmailer({
      email: user.email,
      subject: "Your password reset token (valid for 10 mins)",
      message: message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err) {
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.status(500).json({
      status: "error",
      message: "There was an error sending the email. Try again later!",
    });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { newPassword, newPasswordConfirm } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Token is invalid or has expired",
      });
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const newToken = generateToken(user._id);

    res.status(200).json({
      status: "success",
      message: "Password reset successful. You are now logged in.",
      token: newToken,
    });
  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong during password reset.",
    });
  }
};

export const updatedEmailer = async (req, res) => {
  try {
    const { currentemail, newemail } = req.body;

    const user = await User.findOne({ email: currentemail });
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Current email not found",
      });
    }

    user.email = newemail;
    user.isVerified = false;

    const token = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const confirmURL = `${req.protocol}://${req.get(
      "host"
    )}/chat-app/v1/auth/verify-email/${token}`;

    const message = `
Hi ${user.username},

You updated your email on Chat App.  
Please verify your new email by clicking the link below:

👉 Verify Now: ${confirmURL}

This link will expire in 10 minutes.

If you didn’t request this, please ignore.

– Chat App Team`;

    await sendmailer({
      email: newemail,
      subject: "Verify Your New Email Address",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Email updated. Verification sent to your new email.",
    });
  } catch (err) {
    console.error("Update Email Error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while updating your email.",
    });
  }
};
