import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.services.js";
import { error } from "console";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import { use } from "react";
import { parse } from "path";
export const analyzeResume=async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({message:"Resume required"})
        }
        const filePath=req.file.path
        const fileBuffer=await fs.promises.readFile(filePath);
        const uint8Array=new Uint8Array(fileBuffer)
        const pdf=await pdfjsLib.getDocument({data:uint8Array}).promise;
        let resumeText="";


        for(let pageName=1; pageName<=pdf.numPages;pageName++){
            const page=await pdf.getPage(pageName);
            const content=await page.getTextContent();

            const pageText = content.items.map(item => item.str).join(" ");
            resumeText += pageText + "\n";
        }
        resumeText =resumeText.replace(/\s+/g," ").trim();


        const messages=[
            {
                role:"system",
                content:`
                Extract structured data from resume.
                Return strictly JSON:
                {
                "role":"string",
                "experience":"string",
                "projects":[project1,project2],
                "skills":["skill1","skill2"]
                }
                `
            },
            {
                role:"user",
                content:resumeText
            }
        ];

        const aiResponse=await askAi({messages});
        const cleanResponse = aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed=JSON.parse(aiResponse);
        fs.unlinkSync(filePath)

        res.json({
            role:parsed.role,
            experience:parsed.experience,
            projects:parsed.projects,
            skills:parsed.skills,
            resumeText
        });

    }catch(err){
    console.log(err);

    if(req.file && fs.existsSync(req.file.path)){
        fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
        message: err.message
    });
}
} 

export const generateQuestions=async(req,res)=>{
try{
    const {role,experience,mode,resumeText,projects,skills}=req.body;
    role=role?.trim();
    experience=experience?.trim();
    mode=mode?.trim();

    if(!role || !experience || !mode){
        return res.status(400).json({message:"role , experience and mode are required!"})
    }

    const user=await User.findById(req.userId);

    if(!user){
        return res.status(400).json({message:"User not found!"});
    }
    if(user.credits<50){
        return res.status(400).json({message:"Not enough credits. Minimum 50 credits required"});
    }
    const projectText=Array.isArray(projects) && projects.length ? projects.join(","):"None";
    const SkillText=Array.isArray(skills) && skills.length ? skills.join(","):"None";
    const safeResume=resumeText?.trim() || "None";

    const userPrompt=`
    Role :${role}
    Experience:${experience}
    InterviewMode:${mode}
    projects:${projectText}
    Skills:${SkillText}
    Resumetext:${safeResume}
    `;

    if(!userPrompt.trim()){
        return res.status(400).json({message:"prompt content is empty"});
    }

    const messages = [

      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
      }
      ,
      {
        role: "user",
        content: userPrompt
      }
    ];

    const aiResponse=await askAi(messages);

    if(!aiResponse || !aiResponse.trim()){
        return res.status(500).json({message:"Ai do not given response"});
    }

    const questionArray=aiResponse
    .split("\n")
    .map((q)=>q.trim())
    .filter(q=>q.length>0)
    .slice(0,5);

    if(questionArray.length===0){
       return res.status(500).json({message:"AI fails to generate questions!"});
    }

    user.credits-=50;
    await user.save();

    const interview=await Interview.create({
        userId:user._id,
        role,
        experience,
        mode,
        resumeText:safeResume,
        questions:questionArray.map((q,index)=>({
            question:q,
            difficulty : ["easy","easy","medium","medium","hard"][index],
            timeLimit:[60,60,90,90,120][index],
        }))
    })

    res.json({
        interviewId:interview._id,
        creditisLeft:user.credits,
        userName:user.name,
        questions:interview.questions
    })
}catch(err){
    console.log(err.message);
            return res.status(500).json({message:`failed to create interview ${err}`});
}
}

export const submitAnswer=async(req,res)=>{
    try{
        const {interviewId,questionIndex,answer,timeTaken}=req.body;

        const interview= await Interview.findById(interviewId);
        const question=interview.questions[questionIndex];


        //no answer

        if(!answer){
            question.score=0;
            question.feedback="you did not submit answer.";
            question.answer="";
            await interview.save();
            return res.json({feedback:question.feedback});
        }

        //if time exceeded

        if(timeTaken>question.timeLimit){
            question.score=0;
            question.feedback="time limit exceeded. answer not evaluated!";
            question.answer=answer;
            await interview.save();

            return res.json({feedback:question.feedback});
        }

        // get evaluated

        const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      }
      ,
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];

    const aiResponse=askAi(messages);
    
    const parsed=JSON.parse(aiResponse);
    question.confidence=parsed.confidence;
    question.communication=parsed.communication;
    question.correctness=parsed.correctness;
    question.score=parsed.finalScore;
    question.feedback=parsed.feedback;

    await interview.save();

    return res.status(200).json({feedback:parsed.feedback});
    }catch(err){
        return res.status(500).json({message:`failed to submit answer ${err}`});
    }
} 