import { Router } from "express";
import { deleteHistoryItem, getHistory } from "../controllers/history.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.get("/", protect, getHistory);
router.delete("/:id", protect, deleteHistoryItem);
export default router;
