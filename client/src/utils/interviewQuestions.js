export const QUESTION_BANK = {
  "Frontend Developer": [
    {
      id: "fe-1",
      question: "Can you explain the Virtual DOM in React and how reconciliation works to optimize UI rendering?",
      category: "React Core",
      hint: "Mention the diffing algorithm, Fiber tree, and how batched updates prevent unnecessary reflows.",
      keyPoints: ["Virtual DOM tree", "diffing algorithm", "reconciliation", "keys in lists", "minimal DOM updates", "Fiber"],
    },
    {
      id: "fe-2",
      question: "What strategies do you use to optimize the performance and Core Web Vitals (LCP, CLS, INP) of a modern web application?",
      category: "Performance",
      hint: "Discuss code splitting, lazy loading, image optimization, memoization, and critical CSS.",
      keyPoints: ["code splitting", "lazy loading", "image optimization", "memoization", "debouncing", "caching", "critical rendering path"],
    },
    {
      id: "fe-3",
      question: "How do you manage complex application state, and when would you choose Redux Toolkit or Zustand over React Context?",
      category: "State Management",
      hint: "Compare frequency of updates, selector subscriptions, devtools, and prop drilling vs global store.",
      keyPoints: ["global state", "re-rendering", "selectors", "middleware", "Context API vs Redux/Zustand", "action dispatching"],
    },
    {
      id: "fe-4",
      question: "How do browser rendering engines handle HTML parsing, CSSOM construction, and layout/paint? How does JavaScript execution affect this?",
      category: "Browser Internals",
      hint: "Talk about render blocking resources, async/defer scripts, reflow and repaint costs.",
      keyPoints: ["DOM tree", "CSSOM", "render tree", "reflow", "repaint", "async and defer", "event loop"],
    },
    {
      id: "fe-5",
      question: "Tell me about a difficult frontend bug or responsive design challenge you solved recently. What was your debugging methodology?",
      category: "Problem Solving",
      hint: "Use the STAR method: Situation, Task, Action, Result. Highlight DevTools, breakpoints, and root cause analysis.",
      keyPoints: ["STAR method", "DevTools", "root cause", "responsive breakpoints", "cross-browser compatibility", "testing"],
    }
  ],
  "Backend Developer": [
    {
      id: "be-1",
      question: "How does the Node.js event loop work, and how does it handle non-blocking asynchronous I/O despite being single-threaded?",
      category: "Node.js Architecture",
      hint: "Discuss the libuv thread pool, microtask queue (Promises), macrotask queue (timers, I/O), and process.nextTick.",
      keyPoints: ["libuv", "call stack", "event loop phases", "microtasks", "macrotasks", "non-blocking I/O", "thread pool"],
    },
    {
      id: "be-2",
      question: "How do you design a secure, stateless authentication system using JWTs and refresh tokens with HTTP-only cookies?",
      category: "Security & Auth",
      hint: "Cover token expiration, rotation, CSRF protection, SameSite cookie attributes, and secret key storage.",
      keyPoints: ["JWT signature", "access token", "refresh token rotation", "httpOnly cookies", "SameSite", "CSRF protection"],
    },
    {
      id: "be-3",
      question: "When designing relational vs NoSQL databases (e.g., PostgreSQL vs MongoDB), what trade-offs guide your indexing and schema design?",
      category: "Databases",
      hint: "Discuss ACID vs BASE, relational integrity, embedding vs referencing in MongoDB, and B-Tree indexes.",
      keyPoints: ["ACID compliance", "indexes", "normalization vs denormalization", "query patterns", "transactions", "scalability"],
    },
    {
      id: "be-4",
      question: "How do you implement caching with Redis to reduce database load, and how do you handle cache invalidation and stampedes?",
      category: "Caching & Scaling",
      hint: "Discuss TTL strategies, write-through vs cache-aside, mutex locks for stampedes, and eviction policies.",
      keyPoints: ["cache-aside pattern", "TTL", "cache invalidation", "cache stampede", "eviction policy", "Redis data structures"],
    },
    {
      id: "be-5",
      question: "Describe how you would design a rate limiter middleware for a high-traffic RESTful API to prevent abuse and DDoS attacks.",
      category: "System Design",
      hint: "Mention token bucket, sliding window counter algorithms, Redis IP tracking, and HTTP 429 status code.",
      keyPoints: ["token bucket", "sliding window", "Redis counters", "HTTP 429", "IP/user throttling", "graceful degradation"],
    }
  ],
  "Full Stack Developer": [
    {
      id: "fs-1",
      question: "Walk me through the architecture of a full-stack application you built. How do the frontend, API layer, database, and background services interact?",
      category: "Architecture",
      hint: "Discuss API contracts, client-server decoupling, state synchronization, and database interaction.",
      keyPoints: ["client-server architecture", "REST/GraphQL", "state synchronization", "ORM/ODM", "environment configurations", "scalability"],
    },
    {
      id: "fs-2",
      question: "How do you handle end-to-end data validation and error handling across both the frontend forms and backend controllers?",
      category: "Data Integrity",
      hint: "Discuss schema validators like Zod or Joi, sanitize inputs, standard HTTP error responses, and user-friendly error states.",
      keyPoints: ["Zod/Joi validation", "sanitization", "SQL/NoSQL injection prevention", "HTTP status codes", "consistent error format"],
    },
    {
      id: "fs-3",
      question: "How do you approach real-time bidirectional communication between client and server (e.g., WebSockets vs Server-Sent Events)?",
      category: "Real-time Communication",
      hint: "Compare WebSockets (full-duplex) with SSE (unidirectional), heartbeats, reconnect handling, and scalability.",
      keyPoints: ["WebSockets", "SSE", "reconnection logic", "Socket.io", "event-driven", "latency reduction"],
    },
    {
      id: "fs-4",
      question: "What CI/CD pipelines and deployment strategies (e.g. blue-green, rolling) do you establish to ensure zero downtime deployments?",
      category: "DevOps & Deployment",
      hint: "Talk about automated tests, Docker containers, migration handling, and health check probes.",
      keyPoints: ["CI/CD pipelines", "Docker", "automated testing", "zero downtime", "blue-green deployments", "health checks"],
    },
    {
      id: "fs-5",
      question: "Tell me about a time you had to optimize an end-to-end user flow that was sluggish. What metrics did you look at on frontend vs backend?",
      category: "Performance & Troubleshooting",
      hint: "Discuss network waterfall, query optimization, indexing, payload reduction, and caching.",
      keyPoints: ["profiling", "network payload size", "database queries", "caching", "lazy loading", "measurable improvements"],
    }
  ],
  "HR & Behavioral": [
    {
      id: "hr-1",
      question: "Tell me about yourself, your background in software engineering, and what drives your passion for building technology.",
      category: "Introduction",
      hint: "Structure your response with: Past experience -> Current role/skills -> Future goals aligned with high-impact work.",
      keyPoints: ["professional journey", "key achievements", "passion for problem solving", "collaboration", "continuous learning"],
    },
    {
      id: "hr-2",
      question: "Describe a situation where you had a strong technical disagreement with a team member or leader. How did you resolve it?",
      category: "Conflict Resolution",
      hint: "Use STAR: Situation, Task, Action, Result. Focus on active listening, data/metrics over ego, and team alignment.",
      keyPoints: ["STAR format", "active listening", "data-driven decisions", "compromise", "mutual respect", "positive project outcome"],
    },
    {
      id: "hr-3",
      question: "Tell me about a time when a project deadline was suddenly moved up or requirements changed drastically. How did you handle the pressure?",
      category: "Adaptability",
      hint: "Focus on prioritization, scope negotiation, transparent communication, and maintaining code quality.",
      keyPoints: ["prioritization", "scope management", "transparent communication", "stress management", "successful delivery"],
    },
    {
      id: "hr-4",
      question: "Can you share an experience where you made a mistake or a production incident occurred? What steps did you take to fix and learn from it?",
      category: "Accountability",
      hint: "Show ownership without shifting blame, rapid mitigation, post-mortem analysis, and automated preventive measures.",
      keyPoints: ["ownership", "rapid rollback/mitigation", "blameless post-mortem", "root cause analysis", "preventive safeguards"],
    },
    {
      id: "hr-5",
      question: "Where do you see your career evolving in the next 3 to 5 years, and what skills are you actively developing to achieve that vision?",
      category: "Career Vision",
      hint: "Highlight technical mastery, mentorship, architectural ownership, and industry leadership.",
      keyPoints: ["technical depth", "mentorship/leadership", "architectural vision", "curiosity", "impact"],
    }
  ],
  "Data Scientist & AI": [
    {
      id: "ds-1",
      question: "How do you detect and handle overfitting in machine learning models, and how do you choose between L1 and L2 regularization?",
      category: "ML Foundations",
      hint: "Discuss cross-validation, learning curves, dropout, L1 feature selection (sparsity) vs L2 weight shrinkage.",
      keyPoints: ["overfitting", "cross-validation", "L1 Lasso vs L2 Ridge", "sparsity", "regularization", "learning curves"],
    },
    {
      id: "ds-2",
      question: "Explain the architectural differences between traditional RNNs/LSTMs and Transformer self-attention mechanisms in modern LLMs.",
      category: "Deep Learning & NLP",
      hint: "Discuss parallelization, vanishing gradients, Query-Key-Value attention matrices, and positional encodings.",
      keyPoints: ["Transformers", "self-attention", "parallel training", "QKV matrices", "vanishing gradient", "positional encoding"],
    },
    {
      id: "ds-3",
      question: "When evaluating classification models on heavily imbalanced datasets, why is accuracy misleading, and what metrics do you rely on?",
      category: "Evaluation Metrics",
      hint: "Discuss Precision, Recall, F1-Score, ROC-AUC, PR-AUC, and resampling techniques (SMOTE).",
      keyPoints: ["class imbalance", "Precision and Recall", "F1-Score", "ROC-AUC", "PR-AUC curve", "cost matrix"],
    },
    {
      id: "ds-4",
      question: "How do you evaluate and mitigate hallucination and drift when deploying LLMs into production pipelines (e.g., RAG systems)?",
      category: "Generative AI",
      hint: "Discuss Retrieval-Augmented Generation, vector embeddings, chunking strategies, ground truth evaluations, and guardrails.",
      keyPoints: ["RAG architecture", "vector embeddings", "groundedness", "chunking", "guardrails", "cosine similarity"],
    },
    {
      id: "ds-5",
      question: "Describe an end-to-end data pipeline you developed, from raw feature engineering to model deployment and monitoring.",
      category: "MLOps",
      hint: "Cover data cleaning, feature stores, model registry, containerization, and monitoring for data/concept drift.",
      keyPoints: ["feature engineering", "data drift", "model monitoring", "Docker/FastAPI", "model registry", "continuous integration"],
    }
  ]
};

export const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "HR & Behavioral",
  "Data Scientist & AI"
];

export const EXPERIENCE_LEVELS = [
  { level: "Junior / Entry", exp: "0 - 2 Years", badge: "Beginner" },
  { level: "Mid-Level", exp: "3 - 5 Years", badge: "Intermediate" },
  { level: "Senior / Lead", exp: "5+ Years", badge: "Advanced" }
];

export const INTERVIEW_MODES = [
  { id: "technical", title: "Technical Focus", desc: "Core algorithms, architecture, and language mastery" },
  { id: "behavioral", title: "Behavioral & HR", desc: "STAR method, leadership, communication, team fit" },
  { id: "mixed", title: "Comprehensive Mixed", desc: "Balanced technical scrutiny with culture and scenarios" }
];

/**
 * Intelligent evaluation function that grades the response strictly based on actual answer content,
 * technical keyword hits, length, and articulation.
 *
 * If no response is provided (empty), ALL scores are 0.
 */
export function evaluateInterviewAnswers(role, questions, answers, totalTimeSeconds) {
  let totalScore = 0;
  let totalTechScore = 0;
  let totalCommScore = 0;
  let totalConfidenceScore = 0;
  let answeredCount = 0;
  const questionReviews = [];

  questions.forEach((q) => {
    const rawAns = answers[q.id] || "";
    const ans = rawAns.trim();
    const wordCount = ans ? ans.split(/\s+/).filter(Boolean).length : 0;

    // Check if the answer is completely empty
    if (wordCount === 0) {
      questionReviews.push({
        question: q.question,
        category: q.category,
        userAnswer: "(No response provided)",
        score: 0,
        feedback: "No response was recorded for this question. Practice verbalizing this concept to build confidence.",
        keyPointsCovered: 0,
        totalKeyPoints: q.keyPoints?.length || 0,
        idealConcept: `Ideal answer should highlight: ${q.keyPoints?.join(", ")}.`
      });
      return;
    }

    answeredCount++;

    // 1. Check technical keyword matches
    let matchedKeywords = 0;
    const lowerAns = ans.toLowerCase();
    (q.keyPoints || []).forEach((kw) => {
      if (lowerAns.includes(kw.toLowerCase())) {
        matchedKeywords++;
      }
    });

    const totalKeyPoints = q.keyPoints?.length || 4;
    const keyPointRatio = matchedKeywords / totalKeyPoints;

    // Technical depth score for this question (0 - 100)
    // Directly proportional to key concepts mentioned
    let qTechScore = 0;
    if (matchedKeywords > 0) {
      qTechScore = Math.round(keyPointRatio * 100);
    } else {
      // If words are written but zero technical keywords matched:
      // Very low score based strictly on effort (max 15%)
      qTechScore = Math.min(15, Math.round(wordCount * 0.5));
    }
    qTechScore = Math.min(100, Math.max(0, qTechScore));

    // 2. Communication score: based on articulated structure and length
    let qCommScore = 0;
    if (wordCount >= 45) {
      qCommScore = 95;
    } else if (wordCount >= 25) {
      qCommScore = 75;
    } else if (wordCount >= 10) {
      qCommScore = 50;
    } else {
      qCommScore = Math.min(30, wordCount * 4);
    }

    // 3. Question overall score: 70% technical accuracy, 30% communication
    let qScore = Math.round((qTechScore * 0.7) + (qCommScore * 0.3));
    qScore = Math.min(100, Math.max(0, qScore));

    // 4. Confidence score: based on completeness and articulation
    let qConfScore = Math.round((qCommScore * 0.6) + (qTechScore * 0.4));
    qConfScore = Math.min(100, Math.max(0, qConfScore));

    totalScore += qScore;
    totalTechScore += qTechScore;
    totalCommScore += qCommScore;
    totalConfidenceScore += qConfScore;

    // Dynamic feedback based on actual performance
    let feedback = "";
    if (qScore >= 80) {
      feedback = "Excellent response! You demonstrated strong conceptual clarity, addressed key architectural aspects, and communicated with high confidence.";
    } else if (qScore >= 50) {
      feedback = `Solid answer. You covered ${matchedKeywords} of ${totalKeyPoints} key concepts. Providing deeper real-world examples would make it standout.`;
    } else {
      feedback = `Basic attempt. Key domain terms like ${q.keyPoints?.slice(0, 3).join(", ") || "core principles"} were missing. Focus on technical depth and structured explanation.`;
    }

    questionReviews.push({
      question: q.question,
      category: q.category,
      userAnswer: ans,
      score: qScore,
      feedback,
      keyPointsCovered: matchedKeywords,
      totalKeyPoints,
      idealConcept: `Ideal answer should highlight: ${q.keyPoints?.join(", ")}.`
    });
  });

  const totalQuestions = questions.length || 1;

  // STRICT ZERO CHECK: If user answered 0 questions, ALL scores MUST BE 0!
  if (answeredCount === 0) {
    return {
      role,
      overallScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
      totalQuestions,
      answeredCount: 0,
      timeSpentSeconds: totalTimeSeconds,
      strengths: ["No answers were submitted during this session."],
      improvements: [
        "Attempt answering questions using the microphone or text editor to receive performance grading.",
        "Use the STAR method (Situation, Task, Action, Result) to organize answers before speaking.",
        "Review key domain concepts and terminology for this role."
      ],
      questionReviews
    };
  }

  // Calculate strict averages based on actual answers
  const overallScore = Math.round(totalScore / totalQuestions);
  const technicalScore = Math.round(totalTechScore / totalQuestions);
  const communicationScore = Math.round(totalCommScore / totalQuestions);
  const confidenceScore = Math.round(totalConfidenceScore / totalQuestions);

  const strengths = [];
  const improvements = [];

  if (technicalScore >= 75) {
    strengths.push("Deep conceptual understanding of core architectural and domain concepts.");
  } else if (technicalScore >= 40) {
    strengths.push("Good foundational awareness of role-specific principles.");
  }

  if (communicationScore >= 75) {
    strengths.push("Clear articulation and well-structured thought process.");
  } else if (communicationScore >= 40) {
    strengths.push("Demonstrated ability to convey core ideas.");
  }

  if (strengths.length === 0) {
    strengths.push("Completed interview session participation.");
  }

  if (technicalScore < 70) {
    improvements.push("Incorporate more industry-standard terminology and concrete system tradeoffs.");
  }
  if (communicationScore < 70) {
    improvements.push("Adopt the STAR method (Situation, Task, Action, Result) for scenario and experience-based questions.");
  }
  if (improvements.length === 0) {
    improvements.push("Continue practicing advanced architectural deep-dives and edge-case handling.");
  }

  return {
    role,
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    totalQuestions,
    answeredCount,
    timeSpentSeconds: totalTimeSeconds,
    strengths,
    improvements,
    questionReviews
  };
}
