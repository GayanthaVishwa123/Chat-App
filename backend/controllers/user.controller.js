import User from "../models/user.model.js";
import multer from "multer";

const multerStorerage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "./img");
  },
  filename: (req, res, cb) => {
    const ext = File.mimetype.split("/")[1];
    const uniqename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    cb(null, uniqename);
  },
});
const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: multerStorerage,
  fileFilter: multerFileFilter,
});

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;

    //  Get all users except the logged-in user
    const users = await User.find({ _id: { $ne: userId } });

    res.status(200).json({
      status: "success",
      message: "All users (excluding current user)",
      length: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

// Get current logged-in user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Error in getMe:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

// Get profile of any user by ID
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { user },
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({
      status: "error",
      message: "Server error. Please try again later.",
    });
  }
};
export const UpdateProfile = upload.single("photo");

// Utility function to filter allowed fields for update
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Update user details (username, photo, bio)
export const userUpdateDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    if (req.file) filterObj.photo = req.file.filename;

    // Prevent updating email or password here
    if (req.body.password || req.body.email) {
      return res.status(400).json({
        status: "fail",
        message: "This route is not for updating password or email",
      });
    }

    // Filter only allowed fields
    const filteredBody = filterObj(req.body, "username", "photo", "bio");

    // Update user
    const updatedUser = await User.findByIdAndUpdate(userId, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong while updating user",
    });
  }
};
