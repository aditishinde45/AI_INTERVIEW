import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  generateQuestions,
  evaluateInterview,
  saveInterview,
  getInterviewHistory,
  getInterviewById,
  deleteInterview,
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

// Dynamic AI Question Generation & Evaluation (authenticated)
interviewRouter.post("/generate-questions", isAuth, generateQuestions);
interviewRouter.post("/evaluate", isAuth, evaluateInterview);

// Interview History & Persistence endpoints
interviewRouter.post("/save", isAuth, saveInterview);
interviewRouter.get("/history", isAuth, getInterviewHistory);
interviewRouter.get("/:id", isAuth, getInterviewById);
interviewRouter.delete("/:id", isAuth, deleteInterview);

export default interviewRouter;
