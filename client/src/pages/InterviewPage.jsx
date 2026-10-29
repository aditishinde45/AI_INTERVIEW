import React, { useState } from 'react';
import { BsRobot, BsArrowLeft, BsCheckCircleFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import Step1Setup from '../components/Step1Setup.jsx';
import Step2Interview from '../components/Step2Interview.jsx';
import Step3Report from '../components/Step3Report.jsx';

import axios from 'axios';
import { ServeUrl } from '../App';

function InterviewPage() {
  const [step, setStep] = useState(1);
  const [interviewData, setInterviewData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleRestart = () => {
    setInterviewData(null);
    setReportData(null);
    setStep(1);
  };

  const handleFinishInterview = async (report) => {
    setReportData(report);
    setStep(3);

    // Save to database
    try {
      setIsSaving(true);
      const payload = {
        role: interviewData?.role || report.role,
        experience: interviewData?.experience || "Junior / Entry",
        mode: interviewData?.mode || "technical",
        persona: interviewData?.persona || "female",
        overallScore: report.overallScore ?? 0,
        technicalScore: report.technicalScore ?? 0,
        communicationScore: report.communicationScore ?? 0,
        confidenceScore: report.confidenceScore ?? 0,
        totalQuestions: report.totalQuestions ?? 0,
        answeredCount: report.answeredCount ?? 0,
        timeSpentSeconds: report.timeSpentSeconds ?? 0,
        resumeName: interviewData?.resumeData?.fileName || null,
        strengths: report.strengths || [],
        improvements: report.improvements || [],
        questionReviews: report.questionReviews || []
      };

      const res = await axios.post(`${ServeUrl}/api/interview/save`, payload, {
        withCredentials: true,
      });

      if (res.data?.interview) {
        setReportData((prev) => ({
          ...prev,
          _id: res.data.interview._id,
          savedAt: res.data.interview.createdAt,
          isSaved: true
        }));
      }
    } catch (err) {
      console.warn("Could not save interview to backend:", err?.response?.data || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="bg-black text-white p-2 rounded-xl">
              <BsRobot size={18} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-gray-900 block leading-tight">
                InterviewIQ<span className="text-green-600">.AI</span>
              </span>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block">
                Live Simulation Lab
              </span>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="hidden sm:flex items-center gap-6 text-xs font-semibold">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step > 1
                    ? 'bg-green-600 text-white'
                    : step === 1
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > 1 ? <BsCheckCircleFill size={12} /> : '1'}
              </span>
              <span>Setup</span>
            </div>

            <div className="w-8 h-[2px] bg-gray-200" />

            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step > 2
                    ? 'bg-green-600 text-white'
                    : step === 2
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > 2 ? <BsCheckCircleFill size={12} /> : '2'}
              </span>
              <span>Live Interview</span>
            </div>

            <div className="w-8 h-[2px] bg-gray-200" />

            <div
              className={`flex items-center gap-2 ${
                step === 3 ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === 3
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                3
              </span>
              <span>Report</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black py-2 px-3 rounded-lg hover:bg-gray-100 transition"
            >
              History
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black py-2 px-3 rounded-lg hover:bg-gray-100 transition"
            >
              <BsArrowLeft size={14} />
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-4">
        {step === 1 && (
          <Step1Setup
            onStart={(data) => {
              setInterviewData(data);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <Step2Interview
            interviewData={interviewData}
            onfinish={handleFinishInterview}
          />
        )}

        {step === 3 && (
          <Step3Report
            report={reportData}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

export default InterviewPage;
