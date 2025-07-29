import express from "express";
const router = express.Router();

import * as chatController from "../controllers/chat.controller.js";
import { protectRoute } from "../controllers/auth.controller.js";

router
  .route("/")
  .get(protectRoute, chatController.getUserChats)
  .post(protectRoute, chatController.createChats);

router
  .route("/rename")
  .patch(
    protectRoute,
    chatController.checkAdminOnly,
    chatController.renameGroup
  );

router
  .route("/add")
  .patch(
    protectRoute,
    chatController.checkAdminOnly,
    chatController.addUserToGroup
  );

router.route("/user-leave").patch(protectRoute, chatController.userleaveGroup);

router
  .route("/remove-group")
  .delete(
    protectRoute,
    chatController.checkAdminOnly,
    chatController.groupRemove
  );

export default router;
