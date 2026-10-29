import Interview from "../models/interview.model.js";
import {
  generateDynamicQuestions,
  evaluateInterviewWithAi,
} from "../services/openRouter.services.js";

/**
 * Fallback question pools in case of external network/API failure
 */
const FALLBACK_BANK = {
  "Frontend Developer": [
    {
      id: "fe-1",
      question: "Can you explain the Virtual DOM mechanism in React and how reconciliation optimizes render performance?",
      category: "React Architecture",
      hint: "Discuss diffing algorithms, batching, fiber nodes, and state batching.",
      keyPoints: ["Virtual DOM", "diffing algorithm", "reconciliation", "batching", "re-render optimization"]
    },
    {
      id: "fe-2",
      question: "How does the JavaScript Event Loop coordinate execution across the Call Stack, Microtask queue, and Macrotask queue?",
      category: "JavaScript Core",
      hint: "Walk through Promises, setTimeout, requestAnimationFrame, and render phases.",
      keyPoints: ["Call Stack", "Event Loop", "Microtasks (Promises)", "Macrotasks (setTimeout)", "non-blocking I/O"]
    },
    {
      id: "fe-3",
      question: "What strategies and metrics do you use to diagnose and optimize Core Web Vitals (LCP, INP, CLS) in a modern web application?",
      category: "Web Performance",
      hint: "Discuss code-splitting, tree-shaking, responsive images, SSR/SSG, and layout shifts.",
      keyPoints: ["Largest Contentful Paint (LCP)", "Interaction to Next Paint (INP)", "Cumulative Layout Shift (CLS)", "code splitting", "caching"]
    },
    {
      id: "fe-4",
      question: "How do you architect state management in a large-scale React app, and how do you choose between Server State, Global State, and Local State?",
      category: "State Management",
      hint: "Contrast React Query/RTK Query with Redux/Zustand and native useState/useReducer.",
      keyPoints: ["server state vs client state", "cache invalidation", "Zustand/Redux", "re-render boundaries", "props drilling"]
    }
  ],
  "Backend Developer": [
    {
      id: "be-1",
      question: "How do you design a database schema for scale, and how do you determine when to partition, shard, or read-replicate?",
      category: "Database Design",
      hint: "Discuss B-Tree indexes, query execution plans, sharding keys, and replication lag.",
      keyPoints: ["indexing strategies", "read replicas", "horizontal sharding", "replication lag", "ACID vs BASE"]
    },
    {
      id: "be-2",
      question: "Explain the differences between synchronous REST, gRPC, and asynchronous message broker architectures like Kafka or RabbitMQ.",
      category: "System Architecture",
      hint: "Discuss network overhead, HTTP/2 multiplexing, backpressure, event-driven decoupling.",
      keyPoints: ["REST vs gRPC", "Protocol Buffers", "message brokers (Kafka/RabbitMQ)", "event-driven architecture", "idempotency"]
    },
    {
      id: "be-3",
      question: "How do you implement resilient rate limiting and token bucket / leaky bucket algorithms to protect APIs from abuse?",
      category: "API Security & Reliability",
      hint: "Discuss sliding window logs, Redis atomic scripts, distributed token buckets, and 429 status codes.",
      keyPoints: ["Token Bucket", "sliding window rate limiting", "Redis atomic operations", "HTTP 429", "DDoS mitigation"]
    }
  ],
  "Full Stack Developer": [
    {
      id: "fs-1",
      question: "Walk through end-to-end authentication security in a full-stack system: JWTs vs Session cookies, CSRF, and XSS mitigations.",
      category: "Full Stack Security",
      hint: "Explain HttpOnly cookies, SameSite policies, refresh token rotation, and Content Security Policy.",
      keyPoints: ["HttpOnly cookies", "JWT access & refresh tokens", "SameSite lax/strict", "CSRF tokens", "XSS protection"]
    },
    {
      id: "fs-2",
      question: "How do you maintain data consistency across distributed services or microservices when a business operation spans multiple databases?",
      category: "Distributed Systems",
      hint: "Discuss the Saga pattern, two-phase commits, outbox pattern, and eventual consistency.",
      keyPoints: ["Saga pattern", "transactional outbox", "eventual consistency", "compensating transactions", "idempotency keys"]
    },
    {
      id: "fs-3",
      question: "How do you implement full-stack caching layers from CDN edge caching down to Redis in-memory and database query caches?",
      category: "System Optimization",
      hint: "Discuss cache-control headers, stale-while-revalidate, cache stampede, and TTL invalidation.",
      keyPoints: ["Edge CDN caching", "Redis cache-aside", "stale-while-revalidate", "cache invalidation", "cache penetration"]
    }
  ],
  "HR & Behavioral": [
    {
      id: "hr-1",
      question: "Describe a situation where a critical production incident occurred. How did you manage communications, triage, and post-incident prevention?",
      category: "Ownership & Crisis Management",
      hint: "Use STAR format: Situation, Task, Action, Result. Focus on blameless post-mortem and mitigation.",
      keyPoints: ["STAR method", "incident response", "blameless post-mortem", "root-cause analysis", "automated guards"]
    },
    {
      id: "hr-2",
      question: "Tell me about a time you had a strong technical disagreement with a team member or leader. How did you reach consensus?",
      category: "Collaboration & Conflict",
      hint: "Focus on data-driven benchmarking, active listening, and committing to team decisions.",
      keyPoints: ["active listening", "data-driven tradeoffs", "disagree and commit", "respectful collaboration", "positive delivery"]
    }
  ]
};

/**
 * Controller to generate dynamic questions using OpenRouter AI
 */
export const generateQuestions = async (req, res) => {
  try {
    const { role, experience, mode, questionCount, resumeData } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Call OpenRouter AI
    const aiQuestions = await generateDynamicQuestions({
      role,
      experience: experience || "Junior / Entry",
      mode: mode || "technical",
      questionCount: Number(questionCount) || 3,
      resumeData: resumeData || null,
    });

    if (aiQuestions && Array.isArray(aiQuestions) && aiQuestions.length > 0) {
      return res.status(200).json({
        questions: aiQuestions,
        source: "ai",
      });
    }

    // Fallback if AI service is temporarily degraded
    console.log("Using dynamic fallback question pool for:", role);
    let pool = FALLBACK_BANK[role] || FALLBACK_BANK["Frontend Developer"];
    if (mode === "behavioral") {
      pool = FALLBACK_BANK["HR & Behavioral"];
    } else if (mode === "mixed") {
      pool = [...pool.slice(0, 2), ...FALLBACK_BANK["HR & Behavioral"].slice(0, 1)];
    }

    // Shuffle and pick required count
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const finalCount = Math.min(Math.max(Number(questionCount) || 3, 1), shuffled.length);

    return res.status(200).json({
      questions: shuffled.slice(0, finalCount),
      source: "fallback",
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ message: `Failed to generate questions: ${error.message}` });
  }
};

/**
 * Controller to evaluate interview answers using OpenRouter AI
 */
export const evaluateInterview = async (req, res) => {
  try {
    const {
      role,
      experience,
      mode,
      questions,
      answers,
      totalTimeSeconds,
    } = req.body;

    if (!role || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Role and questions array are required" });
    }

    // Call OpenRouter AI to evaluate answers
    const report = await evaluateInterviewWithAi({
      role,
      experience: experience || "Junior / Entry",
      mode: mode || "technical",
      questions,
      answers: answers || {},
      totalTimeSeconds: Number(totalTimeSeconds) || 0,
    });

    if (report) {
      return res.status(200).json({ report, source: "ai" });
    }

    return res.status(500).json({ message: "AI evaluation service did not return report" });
  } catch (error) {
    console.error("Error evaluating interview:", error);
    return res.status(500).json({ message: `Evaluation failed: ${error.message}` });
  }
};

/**
 * Save completed interview session and report to database
 */
export const saveInterview = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not identified" });
    }

    const {
      role,
      experience,
      mode,
      persona,
      overallScore,
      technicalScore,
      communicationScore,
      confidenceScore,
      totalQuestions,
      answeredCount,
      timeSpentSeconds,
      resumeName,
      strengths,
      improvements,
      questionReviews,
    } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Interview role is required" });
    }

    const newInterview = new Interview({
      userId,
      role,
      experience: experience || "Junior / Entry",
      mode: mode || "technical",
      persona: persona || "female",
      overallScore: Number(overallScore) || 0,
      technicalScore: Number(technicalScore) || 0,
      communicationScore: Number(communicationScore) || 0,
      confidenceScore: Number(confidenceScore) || 0,
      totalQuestions: Number(totalQuestions) || 0,
      answeredCount: Number(answeredCount) || 0,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      resumeName: resumeName || null,
      strengths: Array.isArray(strengths) ? strengths : [],
      improvements: Array.isArray(improvements) ? improvements : [],
      questionReviews: Array.isArray(questionReviews) ? questionReviews : [],
    });

    const savedInterview = await newInterview.save();

    return res.status(201).json({
      message: "Interview saved successfully",
      interview: savedInterview,
    });
  } catch (error) {
    console.error("Error saving interview:", error);
    return res.status(500).json({ message: `Failed to save interview: ${error.message}` });
  }
};

/**
 * Fetch all interviews for the authenticated user, along with summary stats
 */
export const getInterviewHistory = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not identified" });
    }

    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });

    const totalInterviews = interviews.length;
    let avgScore = 0;
    let highestScore = 0;
    let totalTimeSpent = 0;

    if (totalInterviews > 0) {
      const sumScores = interviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
      avgScore = Math.round(sumScores / totalInterviews);
      highestScore = Math.max(...interviews.map((item) => item.overallScore || 0));
      totalTimeSpent = interviews.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
    }

    return res.status(200).json({
      interviews,
      stats: {
        totalInterviews,
        avgScore,
        highestScore,
        totalTimeSpent,
      },
    });
  } catch (error) {
    console.error("Error fetching interview history:", error);
    return res.status(500).json({ message: `Failed to fetch history: ${error.message}` });
  }
};

/**
 * Get detailed report for a single interview session
 */
export const getInterviewById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const interview = await Interview.findOne({ _id: id, userId });
    if (!interview) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    return res.status(200).json({ interview });
  } catch (error) {
    console.error("Error fetching interview by ID:", error);
    return res.status(500).json({ message: `Failed to fetch interview: ${error.message}` });
  }
};

/**
 * Delete an interview report from user history
 */
export const deleteInterview = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const deleted = await Interview.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Interview session not found or already deleted" });
    }

    return res.status(200).json({
      message: "Interview session deleted successfully",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return res.status(500).json({ message: `Failed to delete interview: ${error.message}` });
  }
};
