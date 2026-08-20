import express from "express";
import isAuth from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
import { analyzeResume, finishInterview, generateQuestions, submitAnswer } from "../controllers/interview.Controller.js";
const interviewRouter=express.Router();
interviewRouter.post("/resume",isAuth,upload.single("resume"),analyzeResume);
interviewRouter.post("/generate-questions",isAuth,generateQuestions);
interviewRouter.post("/submit-answer",isAuth,submitAnswer);
interviewRouter.post("/finish",isAuth,finishInterview);

export default interviewRouter;