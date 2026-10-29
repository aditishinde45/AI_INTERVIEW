import User from "../models/user.model.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: `Failed to get user details: ${err}` });
  }
};

/**
 * Deduct 50 credits to start an interview
 */
export const deductCredits = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const COST_PER_INTERVIEW = 50;

    if (user.credits < COST_PER_INTERVIEW) {
      return res.status(400).json({
        message: `Insufficient credits. You need ${COST_PER_INTERVIEW} credits to start an interview, but currently have ${user.credits || 0}.`,
        currentCredits: user.credits || 0,
        requiredCredits: COST_PER_INTERVIEW
      });
    }

    user.credits -= COST_PER_INTERVIEW;
    await user.save();

    return res.status(200).json({
      message: `${COST_PER_INTERVIEW} credits deducted successfully.`,
      user
    });
  } catch (err) {
    console.error("Deduct credits error:", err);
    return res.status(500).json({ message: `Error deducting credits: ${err.message}` });
  }
};

/**
 * Add credits after UPI payment
 */
export const addCredits = async (req, res) => {
  try {
    const userId = req.userId;
    const { credits, amount, transactionId, upiId } = req.body;

    const creditAmount = Number(credits);
    if (!creditAmount || creditAmount <= 0) {
      return res.status(400).json({ message: "Invalid credit amount requested." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.credits = (user.credits || 0) + creditAmount;
    await user.save();

    return res.status(200).json({
      message: `Successfully added ${creditAmount} credits via UPI!`,
      transactionId: transactionId || "UPI-" + Date.now(),
      amount: amount || 0,
      upiId: upiId || "interviewiq@upi",
      user
    });
  } catch (err) {
    console.error("Add credits error:", err);
    return res.status(500).json({ message: `Error adding credits: ${err.message}` });
  }
};

/**
 * Parse uploaded resume (PDF or Text) and extract skills/projects for tailored questions
 */
export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No resume file provided." });
    }

    let extractedText = "";

    if (req.file.mimetype === "application/pdf" || req.file.originalname.endsWith(".pdf")) {
      const parsed = await pdfParse(req.file.buffer);
      extractedText = parsed.text || "";
    } else {
      extractedText = req.file.buffer.toString("utf-8");
    }

    // Common technical and soft skills to identify in resume
    const KNOWN_SKILLS = [
      "React", "React Native", "Next.js", "Node.js", "Express", "MongoDB", "TypeScript",
      "JavaScript", "Python", "Java", "C++", "Go", "Docker", "Kubernetes", "AWS",
      "Azure", "GCP", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API",
      "Tailwind CSS", "Redux", "Zustand", "HTML5", "CSS3", "Git", "CI/CD",
      "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "FastAPI",
      "Django", "Spring Boot", "Microservices", "System Design", "Agile", "Scrum"
    ];

    const detectedSkills = [];
    const lowerText = extractedText.toLowerCase();

    KNOWN_SKILLS.forEach((skill) => {
      const pattern = new RegExp(`\\b${skill.toLowerCase().replace('+', '\\+')}\\b`, 'i');
      if (pattern.test(lowerText) && !detectedSkills.includes(skill)) {
        detectedSkills.push(skill);
      }
    });

    // Detect project snippets or highlights
    const projectMatches = [];
    const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/project|developed|engineered|designed|architected|built/i.test(line) && line.length > 25 && line.length < 160) {
        if (!projectMatches.includes(line)) {
          projectMatches.push(line);
          if (projectMatches.length >= 3) break;
        }
      }
    }

    // Formulate tailored resume questions
    const primarySkill1 = detectedSkills[0] || "Frontend/Backend development";
    const primarySkill2 = detectedSkills[1] || "modern software engineering";
    const primarySkill3 = detectedSkills[2] || "scalable systems";
    const featuredProject = projectMatches[0] || "a key project mentioned in your experience";

    const customQuestions = [
      {
        id: "resume-1",
        question: `Your resume highlights work with ${primarySkill1} and ${primarySkill2}. Could you share an architectural challenge you encountered using these, and how you solved it?`,
        category: "Resume Project Focus",
        hint: `Reference concrete metrics and challenges from your ${primarySkill1} projects.`,
        keyPoints: [primarySkill1, primarySkill2, "architecture", "scalability", "tradeoffs", "solution"]
      },
      {
        id: "resume-2",
        question: `In your resume, you noted: "${featuredProject.slice(0, 90)}...". What was your specific individual contribution and technical ownership on this?`,
        category: "Resume Experience",
        hint: "Explain your role clearly using the STAR methodology (Situation, Task, Action, Result).",
        keyPoints: ["STAR format", "individual contribution", "technical ownership", "impact", "outcomes"]
      },
      {
        id: "resume-3",
        question: `You also list ${primarySkill3} on your resume. How do you approach testing, performance optimization, and reliability when using ${primarySkill3}?`,
        category: "Resume Deep Dive",
        hint: `Discuss testing strategies, profiling, and best practices in ${primarySkill3}.`,
        keyPoints: [primarySkill3, "testing", "performance optimization", "debugging", "reliability"]
      }
    ];

    return res.status(200).json({
      message: "Resume parsed successfully!",
      resumeName: req.file.originalname,
      detectedSkills: detectedSkills.slice(0, 10),
      customQuestions,
      snippet: extractedText.slice(0, 300) + "..."
    });
  } catch (err) {
    console.error("Resume parse error:", err);
    return res.status(500).json({ message: `Failed to parse resume: ${err.message}` });
  }
};