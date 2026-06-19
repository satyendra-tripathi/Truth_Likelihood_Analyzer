import { Router } from "express";
import { analyzeStatement } from "../controllers/analysis.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/", protect, analyzeStatement);
export default router;
