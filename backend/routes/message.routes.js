import express from "express";
const router = express.Router();

import * as messageController from "../controllers/message.controller.js";
import { protectRoute } from "../controllers/auth.controller.js";

router.route("/:id").get(protectRoute, messageController.getMessages);
router.route("/send").post(protectRoute, messageController.sendMessage);
router
  .route("/conversation/:id")
  .get(protectRoute, messageController.getReceivedMessages);

router.patch("/seen/:id", protectRoute, messageController.markMessageAsSeen);

export default router;
