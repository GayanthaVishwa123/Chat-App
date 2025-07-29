import express from "express";
const router = express.Router();

import * as authController from "../controllers/auth.controller.js"; // .js extension එක් කරන්න

router
  .route("/signup")
  .post(authController.signUpUser, authController.gmailverification);

router.route("/verify-email/:token").get(authController.verifiedEmail);

router.route("/login").post(authController.loginUser);

router
  .route("/updatePassword")
  .patch(authController.protectRoute, authController.updatePassword);

router
  .route("/forgetPassword")
  .post(authController.protectRoute, authController.forgetPassword);

router
  .route("/resetpassword/:token")
  .patch(authController.protectRoute, authController.resetPassword);

router
  .route("/updateEmail")
  .patch(authController.protectRoute, authController.updatedEmailer);

export default router;
