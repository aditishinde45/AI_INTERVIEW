import express from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth.js";
import {
  getCurrentUser,
  deductCredits,
  addCredits,
  parseResume
} from "../controllers/user.controller.js";

const userRouter = express.Router();

// Memory storage for fast, clean in-memory resume processing without cluttering disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.post("/deduct-credits", isAuth, deductCredits);
userRouter.post("/add-credits", isAuth, addCredits);
userRouter.post("/parse-resume", isAuth, upload.single("resume"), parseResume);

export default userRouter;