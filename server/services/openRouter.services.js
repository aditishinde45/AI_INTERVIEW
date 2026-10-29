import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;
const CANDIDATE_MODELS = [
  "deepseek/deepseek-chat",
  "qwen/qwen-2.5-72b-instruct",
  "meta-llama/llama-3.3-70b-instruct",
];

/**
 * Safely strips markdown code fences (e.g. ```json ... ```) and parses JSON
 */
export const cleanJsonParse = (rawText) => {
  if (!rawText || typeof rawText !== "string") return null;
  try {
    const cleaned = rawText
      .replace(/```(?:json)?/gi, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (err) {
    // Attempt extracting between first [ or { and last ] or }
    const firstBracket = rawText.indexOf("[");
    const lastBracket = rawText.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(rawText.slice(firstBracket, lastBracket + 1));
      } catch (e) {}
    }

    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.slice(firstBrace, lastBrace + 1));
      } catch (e) {}
    }
    console.error("cleanJsonParse failed to parse JSON:", rawText);
    return null;
  }
};

/**
 * Helper to call OpenRouter with model failover
 */
export const callOpenRouter = async (messages, temperature = 0.5, maxTokens = 2000) => {
  if (!API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not defined in environment variables");
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5174",
            "X-Title": "InterviewIQ.AI",
          },
          timeout: 25000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        return { content, model };
      }
    } catch (err) {
      lastError = err;
      console.warn(`Model ${model} failed:`, err.response?.status, err.response?.data?.error?.message || err.message);
      // Try next model in list
    }
  }

  throw new Error(`All OpenRouter models failed. Last error: ${lastError?.message}`);
};

/**
 * Dynamically generate realistic interview questions tailored to Role, Experience, Mode & Resume
 */
export const generateDynamicQuestions = async ({
  role,
  experience = "Mid Level",
  mode = "technical",
  questionCount = 3,
  resumeData = null,
}) => {
  const count = Math.min(Math.max(Number(questionCount) || 3, 1), 7);

  let resumeContext = "";
  if (resumeData) {
    if (resumeData.detectedSkills?.length) {
      resumeContext += `Candidate Skills extracted from resume: ${resumeData.detectedSkills.join(", ")}.\n`;
    }
    if (resumeData.detectedProjects?.length) {
      resumeContext += `Candidate Projects mentioned in resume: ${resumeData.detectedProjects.join("; ")}.\n`;
    }
    if (resumeData.summary) {
      resumeContext += `Candidate Background Summary: ${resumeData.summary.slice(0, 300)}.\n`;
    }
  }

  const systemPrompt = `You are a Principal Technical Interviewer and Engineering Hiring Manager at a top-tier tech firm.
Your task is to generate exactly ${count} distinct, authentic, high-quality interview questions.

Rules:
1. Role: "${role}"
2. Target Experience Level: "${experience}"
3. Interview Mode: "${mode}" (if "technical", focus on architecture, coding concepts, real-world tradeoffs, and system design; if "behavioral", focus on leadership, team collaboration, conflict resolution, STAR methodology; if "mixed", include both).
4. ${resumeContext ? `Incorporate candidate background: ${resumeContext}` : "Make questions modern, diverse, and practical, not generic textbook trivia."}
5. Each question must have:
   - "id": a unique string identifier (e.g. "ai-q-1", "ai-q-2")
   - "question": clear, engaging question text
   - "category": topic category (e.g. "System Architecture", "React & State", "Concurrency", "Behavioral / Leadership")
   - "hint": a helpful 1-2 sentence guiding tip for the candidate
   - "keyPoints": array of 3-5 key concepts or keywords an ideal candidate answer should cover

Return ONLY a valid JSON array of question objects. Do NOT include markdown backticks or any conversation outside the JSON.`;

  const userPrompt = `Generate ${count} dynamic interview questions for a ${experience} ${role} in ${mode} mode.`;

  try {
    const { content } = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      0.7
    );

    const parsed = cleanJsonParse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((q, idx) => ({
        id: q.id ? String(q.id) : `ai-q-${Date.now()}-${idx + 1}`,
        question: q.question || `Technical question on ${role}`,
        category: q.category || "Technical",
        hint: q.hint || "Focus on key principles, practical experience, and tradeoffs.",
        keyPoints: Array.isArray(q.keyPoints) && q.keyPoints.length ? q.keyPoints : ["Core principles", "Tradeoffs", "Best practices"],
      }));
    }
  } catch (err) {
    console.error("AI question generation failed, falling back to dynamic generator:", err.message);
  }

  // Graceful fallback if OpenRouter is unreachable
  return null;
};

/**
 * Rigorously evaluate interview answers using AI
 */
export const evaluateInterviewWithAi = async ({
  role,
  experience = "Mid Level",
  mode = "technical",
  questions = [],
  answers = {},
  totalTimeSeconds = 0,
}) => {
  const totalQuestions = questions.length || 1;

  // Count non-empty answers
  let answeredCount = 0;
  questions.forEach((q) => {
    const ans = (answers[q.id] || "").trim();
    if (ans.length > 5 && !/^(no answer|skip|blank|n\/a|none|\.)$/i.test(ans)) {
      answeredCount++;
    }
  });

  // STRICT ZERO RULE: If the candidate answered 0 questions, return 0% across the board
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
      strengths: ["No answers were submitted during this simulation session."],
      improvements: [
        "Use the microphone or type your responses into the answer box before advancing.",
        "Structure answers using the STAR method (Situation, Task, Action, Result) for comprehensive coverage.",
        "Review core domain concepts and practice explaining technical tradeoffs."
      ],
      questionReviews: questions.map((q) => ({
        question: q.question,
        category: q.category || "General",
        userAnswer: (answers[q.id] || "").trim() || "No answer provided",
        score: 0,
        feedback: "No substantive answer was recorded. Practice verbalizing or typing your response to earn credit.",
        keyPointsCovered: 0,
        totalKeyPoints: q.keyPoints?.length || 3,
        idealConcept: `Ideal answer should highlight: ${q.keyPoints?.join(", ") || "core concepts and practical examples"}.`
      }))
    };
  }

  // Construct detailed evaluation prompt for OpenRouter AI
  const systemPrompt = `You are an expert, strict, calibrated senior engineering hiring manager and technical interviewer.
Evaluate the candidate based STRICTLY on their actual provided answers to each question.

CRITICAL EVALUATION RULES:
1. Rigorous Scoring:
   - If a question was skipped, blank, or gibberish (e.g. less than 10 words or unrelated text), its score MUST be 0.
   - For answered questions, evaluate technical correctness, depth, terminology, architectural awareness, and structure. Do NOT hand out random or artificially inflated scores.
2. Metrics Calculation:
   - "overallScore": 0-100 (weighted average of all questions, reflecting unattempted questions as 0).
   - "technicalScore": 0-100 (domain accuracy, architectural soundness, depth).
   - "communicationScore": 0-100 (clarity, conciseness, structured flow).
   - "confidenceScore": 0-100 (professional tone, definitive assertions vs hesitation).
   - If a candidate answered only a subset of questions, penalize the overall and metric scores proportionally.
3. Feedback:
   - Provide concrete, personalized constructive feedback for each question explaining what was strong and what specific technical concepts or edge cases were missed.
   - Provide 2-3 genuine Strengths demonstrated in their answers.
   - Provide 2-3 targeted Actionable Improvements.

Return ONLY a valid JSON object matching this schema:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "confidenceScore": number (0-100),
  "strengths": string[],
  "improvements": string[],
  "questionReviews": [
    {
      "question": string,
      "category": string,
      "userAnswer": string,
      "score": number (0-100),
      "feedback": string,
      "keyPointsCovered": number,
      "totalKeyPoints": number,
      "idealConcept": string
    }
  ]
}
Do NOT return markdown backticks or commentary outside the JSON.`;

  const questionPrompts = questions.map((q, idx) => {
    const candidateAns = (answers[q.id] || "").trim();
    return `[Question ${idx + 1}] (${q.category || "Technical"})
Question: ${q.question}
Expected Key Points: ${q.keyPoints?.join(", ") || "Domain best practices"}
Candidate Answer: "${candidateAns || "[NO ANSWER GIVEN]"}"`;
  }).join("\n\n");

  const userPrompt = `Role: ${role}
Experience: ${experience}
Mode: ${mode}
Total Questions: ${totalQuestions}
Answered Questions Count: ${answeredCount}
Duration: ${totalTimeSeconds} seconds

Interview Transcript:
${questionPrompts}`;

  try {
    const { content } = await callOpenRouter(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      0.3,
      2500
    );

    const parsed = cleanJsonParse(content);
    if (parsed && typeof parsed.overallScore === "number") {
      return {
        role,
        overallScore: Math.min(100, Math.max(0, Math.round(parsed.overallScore))),
        technicalScore: Math.min(100, Math.max(0, Math.round(parsed.technicalScore || parsed.overallScore))),
        communicationScore: Math.min(100, Math.max(0, Math.round(parsed.communicationScore || parsed.overallScore))),
        confidenceScore: Math.min(100, Math.max(0, Math.round(parsed.confidenceScore || parsed.overallScore))),
        totalQuestions,
        answeredCount,
        timeSpentSeconds: totalTimeSeconds,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Demonstrated technical participation."],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["Continue practicing technical deep dives."],
        questionReviews: Array.isArray(parsed.questionReviews)
          ? parsed.questionReviews.map((rev, i) => {
              const origQ = questions[i] || {};
              return {
                question: rev.question || origQ.question || `Question ${i + 1}`,
                category: rev.category || origQ.category || "Technical",
                userAnswer: (answers[origQ.id] || "").trim() || rev.userAnswer || "No answer recorded",
                score: Math.min(100, Math.max(0, Math.round(rev.score || 0))),
                feedback: rev.feedback || "Evaluated by AI.",
                keyPointsCovered: Number(rev.keyPointsCovered) || (rev.score > 50 ? 2 : 0),
                totalKeyPoints: Number(rev.totalKeyPoints) || origQ.keyPoints?.length || 3,
                idealConcept: rev.idealConcept || `Focus on: ${origQ.keyPoints?.join(", ") || "core principles"}.`
              };
            })
          : []
      };
    }
  } catch (err) {
    console.error("AI report evaluation failed:", err.message);
  }

  return null;
};