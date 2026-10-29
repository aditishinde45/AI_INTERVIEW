import mongoose from "mongoose";

const questionReviewSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, default: "General" },
  userAnswer: { type: String, default: "" },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: "" },
  keyPointsCovered: { type: Number, default: 0 },
  totalKeyPoints: { type: Number, default: 0 },
  idealConcept: { type: String, default: "" }
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    default: "Junior / Entry"
  },
  mode: {
    type: String,
    default: "technical"
  },
  persona: {
    type: String,
    enum: ["female", "male"],
    default: "female"
  },
  overallScore: {
    type: Number,
    required: true,
    default: 0
  },
  technicalScore: {
    type: Number,
    default: 0
  },
  communicationScore: {
    type: Number,
    default: 0
  },
  confidenceScore: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  answeredCount: {
    type: Number,
    default: 0
  },
  timeSpentSeconds: {
    type: Number,
    default: 0
  },
  resumeName: {
    type: String,
    default: null
  },
  strengths: {
    type: [String],
    default: []
  },
  improvements: {
    type: [String],
    default: []
  },
  questionReviews: {
    type: [questionReviewSchema],
    default: []
  }
}, { timestamps: true });

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
