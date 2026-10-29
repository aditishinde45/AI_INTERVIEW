import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsMic,
  BsMicMute,
  BsVolumeUp,
  BsVolumeMute,
  BsClock,
  BsCheckCircle,
  BsArrowRight,
  BsLightbulb,
  BsChatSquareQuote,
  BsStopCircle,
  BsStars
} from 'react-icons/bs';
import axios from 'axios';
import { ServeUrl } from '../App';
import femaleVideo from '../assets/videos/female-ai.mp4';
import maleVideo from '../assets/videos/male-ai.mp4';
import { evaluateInterviewAnswers } from '../utils/interviewQuestions';

function Step2Interview({ interviewData, onfinish }) {
  const { role, persona, questions = [] } = interviewData || {};
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const currentQ = questions[currentIndex] || {
    id: 'default',
    question: 'Please introduce yourself and your technical background.',
    category: 'General',
    hint: 'Focus on your core skills, recent projects, and career highlights.'
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCurrentAnswer((prev) => {
          // If editing manually, append transcript cleanly
          return transcript.trim();
        });
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const [availableVoices, setAvailableVoices] = useState([]);
  const [activeVoiceName, setActiveVoiceName] = useState('');

  // Pre-load and listen for browser voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        setAvailableVoices(v);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Helper to accurately match a genuine female or male voice
  const getVoiceForPersona = (isFemale, voicesList) => {
    const pool =
      voicesList.length > 0
        ? voicesList
        : 'speechSynthesis' in window
        ? window.speechSynthesis.getVoices()
        : [];
    if (!pool || pool.length === 0) return null;

    const englishVoices = pool.filter(
      (v) =>
        v.lang &&
        (v.lang.startsWith('en') || v.lang.startsWith('en-') || v.lang.startsWith('en_'))
    );
    const targetPool = englishVoices.length > 0 ? englishVoices : pool;

    if (isFemale) {
      // Prioritize recognized natural female voices
      const femaleKeywords = [
        'samantha',
        'victoria',
        'karen',
        'zira',
        'kathy',
        'moira',
        'flo',
        'tessa',
        'fiona',
        'serena',
        'ava',
        'allison',
        'susan',
        'veena',
        'google uk english female',
        'google us english female',
        'female'
      ];

      for (const kw of femaleKeywords) {
        const found = targetPool.find((v) => v.name.toLowerCase().includes(kw));
        if (found) return found;
      }

      // Fallback: exclude known male voices
      const maleKeywords = [
        'alex',
        'daniel',
        'david',
        'fred',
        'george',
        'oliver',
        'rishi',
        'eddy',
        'ralph',
        'male',
        'guy',
        'grandpa'
      ];
      const nonMale = targetPool.find(
        (v) => !maleKeywords.some((m) => v.name.toLowerCase().includes(m))
      );
      return nonMale || targetPool[0];
    } else {
      // Prioritize recognized natural male voices
      const maleKeywords = [
        'alex',
        'daniel',
        'david',
        'eddy',
        'fred',
        'george',
        'oliver',
        'rishi',
        'ralph',
        'google uk english male',
        'google us english male',
        'male',
        'guy'
      ];

      for (const kw of maleKeywords) {
        const found = targetPool.find((v) => v.name.toLowerCase().includes(kw));
        if (found) return found;
      }

      return targetPool[0];
    }
  };

  // Speak the question aloud when it loads with the correct persona voice
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const isFemale = persona === 'female';
    const chosenVoice = getVoiceForPersona(isFemale, availableVoices);

    if (chosenVoice) {
      utterance.voice = chosenVoice;
      setActiveVoiceName(chosenVoice.name);
    }

    utterance.rate = 1.0;
    utterance.pitch = isFemale ? 1.15 : 0.92;

    utterance.onstart = () => {
      setIsAiSpeaking(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // On question index change: speak question, reset question timer, restore or clear current answer
  useEffect(() => {
    setTimeLeft(120);
    setCurrentAnswer(answers[currentQ.id] || '');
    setShowHint(false);

    // Speak the question aloud after short delay
    const speakTimeout = setTimeout(() => {
      speakQuestion(currentQ.question);
    }, 600);

    return () => {
      clearTimeout(speakTimeout);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIndex]);

  // Overall timer & countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  // Toggle voice recording
  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
    } else {
      try {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          setIsAiSpeaking(false);
        }
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  // Handle advancing or finishing
  const handleNext = async () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const updatedAnswers = {
      ...answers,
      [currentQ.id]: currentAnswer
    };
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Finished all questions - evaluate and generate report via OpenRouter AI
      try {
        setIsEvaluating(true);
        const evalRes = await axios.post(
          `${ServeUrl}/api/interview/evaluate`,
          {
            role,
            experience: interviewData?.experience || "Junior / Entry",
            mode: interviewData?.mode || "technical",
            questions,
            answers: updatedAnswers,
            totalTimeSeconds: totalTimeSpent,
          },
          { withCredentials: true }
        );

        if (evalRes.data?.report) {
          onfinish(evalRes.data.report);
          return;
        }
      } catch (err) {
        console.warn('AI evaluation API failed, falling back to local engine:', err);
      } finally {
        setIsEvaluating(false);
      }

      // Fallback evaluation if backend AI service is unreachable
      const report = evaluateInterviewAnswers(role, questions, updatedAnswers, totalTimeSpent);
      onfinish(report);
    }
  };

  const isLastQuestion = currentIndex === questions.length - 1;
  const wordCount = currentAnswer.trim().split(/\s+/).filter(Boolean).length;
  const progressPercent = Math.round(((currentIndex + 1) / (questions.length || 1)) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Bar with Progress & Timer */}
      <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-xs">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="font-semibold text-sm text-gray-700">{role}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-48 bg-gray-100 h-2.5 rounded-full overflow-hidden hidden md:block">
          <div
            className="bg-green-500 h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              timeLeft < 30
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            <BsClock size={13} />
            <span>
              {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Interview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: AI Avatar Video Stage (5 columns) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-black shadow-xl aspect-video lg:aspect-[4/5] border border-gray-800">
            <video
              ref={videoRef}
              src={persona === 'male' ? maleVideo : femaleVideo}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* AI Status Badge Overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
              <div className="bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium text-white flex items-center gap-2 border border-white/10">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isAiSpeaking
                      ? 'bg-green-500 animate-ping'
                      : isRecording
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>
                  {isAiSpeaking
                    ? 'AI is Speaking...'
                    : isRecording
                    ? 'Listening to you...'
                    : 'AI Interviewer Ready'}
                </span>
              </div>

              {/* Sound Wave Animation */}
              {isAiSpeaking && (
                <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full">
                  <div className="w-1 bg-green-400 rounded-full animate-bounce h-3" />
                  <div className="w-1 bg-green-400 rounded-full animate-bounce h-5 delay-75" />
                  <div className="w-1 bg-green-400 rounded-full animate-bounce h-2 delay-150" />
                </div>
              )}
            </div>

            {/* Bottom Actions Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => speakQuestion(currentQ.question)}
                className="bg-white/90 hover:bg-white text-gray-900 text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur-sm shadow flex items-center gap-1.5 transition-all"
              >
                <BsVolumeUp size={16} className="text-green-600" />
                Repeat Question
              </button>

              <span className="text-[11px] text-gray-300 bg-black/70 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                Interviewer: {persona === 'male' ? 'Alex (Male Voice)' : 'Sarah (Female Voice)'}
                {activeVoiceName ? ` • ${activeVoiceName.split(' ')[0]}` : ''}
              </span>
            </div>
          </div>

          {/* Quick Tip Box */}
          <div className="bg-green-50/70 border border-green-200 rounded-2xl p-4 text-xs text-green-900 flex items-start gap-3">
            <BsLightbulb size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">Interview Pro Tip:</span>
              Speak clearly with concrete examples. Use the STAR methodology (Situation, Task, Action, Result) for comprehensive answers.
            </div>
          </div>
        </div>

        {/* Right: Question & Voice Answer Input Stage (7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          {/* Question Box */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-200 shadow-sm relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2.5 py-1 rounded-md">
                {currentQ.category || 'Interview Question'}
              </span>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-gray-500 hover:text-black flex items-center gap-1 font-medium transition"
              >
                <BsLightbulb size={13} />
                {showHint ? 'Hide Hint' : 'View Hint'}
              </button>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
              {currentQ.question}
            </h2>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl"
                >
                  <span className="font-semibold text-gray-800">Guidance: </span>
                  {currentQ.hint}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Answer Area */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <BsChatSquareQuote size={15} />
                Your Response (Speak or Type):
              </label>
              <span className="text-xs text-gray-400">
                {wordCount} words
              </span>
            </div>

            {/* Answer Textarea */}
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Click 'Start Speaking' to dictate your answer via microphone, or type your detailed response here..."
              className="w-full flex-1 min-h-[160px] p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 text-sm text-gray-800 placeholder-gray-400 resize-none transition-all"
            />

            {/* Bottom Controls inside Answer Box */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
              {/* Mic Dictation Toggle */}
              {voiceSupported ? (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <BsStopCircle size={15} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <BsMic size={15} className="text-green-400" />
                      Start Speaking (Mic)
                    </>
                  )}
                </button>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Microphone dictation not supported in this browser. Please type your response.
                </span>
              )}

              {/* Clear button */}
              {currentAnswer && (
                <button
                  type="button"
                  onClick={() => setCurrentAnswer('')}
                  className="text-xs text-gray-400 hover:text-red-500 font-medium transition"
                >
                  Clear Text
                </button>
              )}
            </div>
          </div>

          {/* Action Footer Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <motion.button
              type="button"
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all ${
                isLastQuestion
                  ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/30'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              {isLastQuestion ? (
                <>
                  <BsCheckCircle size={17} />
                  Finish Interview & View Report
                </>
              ) : (
                <>
                  Next Question
                  <BsArrowRight size={16} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Full-screen AI Evaluation Overlay */}
      <AnimatePresence>
        {isEvaluating && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full flex flex-col items-center"
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <BsStars size={28} className="text-green-400 animate-pulse" />
                </div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-green-400 bg-green-950/80 border border-green-800 px-3.5 py-1 rounded-full mb-3">
                OpenRouter AI Neural Evaluator
              </span>
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2 text-white">
                Evaluating Candidate Responses...
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed max-w-sm">
                AI is grading your technical depth, key terminology, architectural tradeoffs, and communication structure to generate your official performance report.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Step2Interview;
