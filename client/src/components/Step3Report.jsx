import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsPrinter,
  BsArrowRepeat,
  BsHouseDoor,
  BsTrophy,
  BsBarChartLine,
  BsLightbulbFill,
  BsChevronDown,
  BsChevronUp,
  BsChatSquareText,
  BsClockHistory
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

function Step3Report({ report, onRestart }) {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!report) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center">
        <h2 className="text-xl font-bold mb-4">No report data found.</h2>
        <button
          onClick={() => (onRestart ? onRestart() : navigate('/'))}
          className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const {
    role,
    overallScore = 0,
    technicalScore = 0,
    communicationScore = 0,
    confidenceScore = 0,
    timeSpentSeconds = 0,
    strengths = [],
    improvements = [],
    questionReviews = [],
    isSaved = false
  } = report;

  // Grade determination
  let grade = 'No Attempt';
  let gradeColor = 'text-red-500 bg-red-50 border-red-200';
  if (overallScore >= 90) {
    grade = 'A+';
    gradeColor = 'text-emerald-600 bg-emerald-50 border-emerald-300';
  } else if (overallScore >= 80) {
    grade = 'A';
    gradeColor = 'text-green-600 bg-green-50 border-green-200';
  } else if (overallScore >= 70) {
    grade = 'B+';
    gradeColor = 'text-blue-600 bg-blue-50 border-blue-200';
  } else if (overallScore >= 60) {
    grade = 'B';
    gradeColor = 'text-yellow-600 bg-yellow-50 border-yellow-200';
  } else if (overallScore >= 40) {
    grade = 'C';
    gradeColor = 'text-orange-600 bg-orange-50 border-orange-200';
  } else if (overallScore > 0) {
    grade = 'D';
    gradeColor = 'text-red-600 bg-red-50 border-red-200';
  } else {
    grade = 'No Attempt';
    gradeColor = 'text-gray-600 bg-gray-100 border-gray-300';
  }

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full">
              Interview Complete
            </span>
            {isSaved && (
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <BsCheckCircleFill size={11} className="text-emerald-600" />
                Saved in History
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
            AI Performance <span className="text-green-600">Analytics</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Target Track: <strong className="text-gray-800">{role}</strong> • Duration: {formatTime(timeSpentSeconds)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <BsClockHistory size={14} className="text-green-600" />
            All History
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold px-4 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <BsPrinter size={15} />
            Print / PDF
          </button>
          <button
            type="button"
            onClick={() => (onRestart ? onRestart() : navigate('/interview'))}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow-sm transition"
          >
            <BsArrowRepeat size={15} />
            Retake Interview
          </button>
        </div>
      </div>

      {/* Overview Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Main Score Hero (5 cols) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-5 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BsTrophy size={160} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">
                Overall Assessment
              </span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${gradeColor}`}>
                Grade: {grade}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-6xl md:text-7xl font-extrabold text-green-400">
                {overallScore}
              </span>
              <span className="text-gray-400 text-xl font-medium">/ 100</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              {overallScore === 0
                ? 'No answers were recorded during this session. Practice answering each question to generate performance metrics.'
                : overallScore >= 80
                ? 'Strong performance! You demonstrated exceptional technical mastery and coherent communication.'
                : overallScore >= 50
                ? 'Good foundation. Strengthening targeted technical points will help elevate your score.'
                : 'Needs improvement. Focus on covering core domain principles and providing structured examples.'}
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-800 text-xs text-gray-400 flex justify-between items-center">
            <span>Session Status: Certified</span>
            <button
              onClick={() => navigate('/')}
              className="text-green-400 hover:text-green-300 flex items-center gap-1 font-semibold"
            >
              <BsHouseDoor size={13} />
              Go to Home
            </button>
          </div>
        </motion.div>

        {/* 3 Metrics Breakdowns (7 cols) */}
        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: 'Technical Depth',
              score: technicalScore,
              desc: 'Keyword accuracy, domain architecture, and precision'
            },
            {
              title: 'Communication',
              score: communicationScore,
              desc: 'Clarity, conciseness, structured STAR flow'
            },
            {
              title: 'Confidence & Tone',
              score: confidenceScore,
              desc: 'Pacing, vocabulary, professional demeanor'
            }
          ].map((metric, i) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-gray-500 block mb-2">
                  {metric.title}
                </span>
                <div className="text-3xl font-extrabold text-gray-900 mb-2">
                  {metric.score}%
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">
                {metric.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-green-200 bg-green-50/20 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BsCheckCircleFill className="text-green-600" size={18} />
            <h3 className="font-bold text-base text-gray-900">Key Strengths Demonstrated</h3>
          </div>
          <ul className="space-y-3">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BsLightbulbFill className="text-amber-500" size={18} />
            <h3 className="font-bold text-base text-gray-900">Actionable Opportunities</h3>
          </div>
          <ul className="space-y-3">
            {improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Breakdown */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BsChatSquareText size={18} className="text-green-600" />
            <h3 className="font-bold text-lg text-gray-900">Question-by-Question Deep Dive</h3>
          </div>
          <span className="text-xs text-gray-400">
            {questionReviews.length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-4">
          {questionReviews.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all bg-gray-50/50"
              >
                {/* Header Row */}
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-gray-100/60 transition"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-green-700 uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-sm text-gray-900">
                        {item.question}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        item.score >= 80
                          ? 'bg-green-100 text-green-700'
                          : item.score >= 60
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {item.score}/100
                    </span>
                    {isExpanded ? <BsChevronUp size={14} /> : <BsChevronDown size={14} />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 border-t border-gray-200 bg-white space-y-4 text-xs">
                    <div>
                      <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Your Answer:
                      </span>
                      <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 italic leading-relaxed">
                        "{item.userAnswer}"
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        AI Evaluator Feedback:
                      </span>
                      <p className="text-gray-700 bg-green-50/50 p-3 rounded-xl border border-green-100 leading-relaxed">
                        {item.feedback}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                        Key Concepts Recommended:
                      </span>
                      <p className="text-gray-600 bg-blue-50/40 p-3 rounded-xl border border-blue-100 leading-relaxed">
                        {item.idealConcept}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Step3Report;
