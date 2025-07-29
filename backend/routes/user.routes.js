import express from "express";
import {
  getAllUsers,
  getMe,
  getUserProfile,
  userUpdateDetails,
} from "../controllers/user.controller.js";
import { protectRoute } from "../controllers/auth.controller.js";

const router = express.Router();

router.route("/").get(protectRoute, getAllUsers);
router
  .route("/me")
  .get(protectRoute, getMe)
  .patch(protectRoute, userUpdateDetails);

router.route("/:id").get(protectRoute, getUserProfile);

export default router;
