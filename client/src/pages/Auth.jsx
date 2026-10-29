import React, { useState, useEffect } from 'react';
import { BsRobot, BsLightningChargeFill, BsEnvelope } from 'react-icons/bs';
import { IoSparkles } from 'react-icons/io5';
import { motion } from 'motion/react';
import { FcGoogle } from 'react-icons/fc';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServeUrl } from '../App.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserData } from '../redux/userSlice.js';

function Auth({ isModel = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    if (userData && !isModel) {
      navigate('/');
    }
  }, [userData, isModel, navigate]);

  // Handle Google OAuth via Firebase
  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await signInWithPopup(auth, provider);
      const user = response.user;
      const name = user.displayName || user.email?.split('@')[0] || 'User';
      const email = user.email;

      const result = await axios.post(
        `${ServeUrl}/api/auth/google`,
        { name, email },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      if (!isModel) {
        navigate('/');
      }
    } catch (err) {
      console.error('Google Auth error:', err);
      let message = 'Failed to sign in with Google. You can also sign in directly with Email below.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google popup was closed before completing. Try again or use Email sign-in below.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Google sign-in request was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Popup was blocked by your browser. Please allow popups or use Email sign-in below.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'Domain not authorized in Firebase Console. Please use Email sign-in below.';
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      setShowEmailForm(true);
    } finally {
      setLoading(false);
    }
  };

  // Direct Email / Quick Sign-In (Guaranteed to work without popups)
  const handleEmailAuth = async (overrideEmail = null, overrideName = null) => {
    const targetEmail = (overrideEmail || emailInput).trim();
    const targetName = (overrideName || nameInput || targetEmail.split('@')[0] || 'Candidate').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await axios.post(
        `${ServeUrl}/api/auth/google`,
        { name: targetName, email: targetEmail },
        { withCredentials: true }
      );

      dispatch(setUserData(result.data));
      if (!isModel) {
        navigate('/');
      }
    } catch (err) {
      console.error('Email Auth error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full ${isModel ? 'py-2' : 'min-h-screen bg-[#f3f3f3] flex items-center justify-center px-4 py-12'}`}>
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`w-full ${isModel ? 'max-w-md p-6 sm:p-8 rounded-3xl' : 'max-w-lg p-8 sm:p-12 rounded-[32px]'} bg-white shadow-2xl border border-gray-200`}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-black text-white p-2 rounded-xl">
            <BsRobot size={18} />
          </div>
          <h2 className="font-extrabold text-lg tracking-tight">InterviewIQ.AI</h2>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 leading-snug mb-2">
          Welcome to{' '}
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full inline-flex items-center gap-1.5 text-xl sm:text-2xl">
            <IoSparkles size={16} />
            Smart Interview
          </span>
        </h1>

        <p className="text-gray-500 text-center text-xs sm:text-sm leading-relaxed mb-6">
          Sign in to start live simulation interviews, practice questions, and track your performance analytics.
        </p>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs leading-relaxed text-center font-medium">
            {error}
          </div>
        )}

        {/* Primary Google Auth Button */}
        <motion.button
          onClick={handleGoogleAuth}
          disabled={loading}
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-black text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'
          }`}
        >
          <FcGoogle size={20} />
          {loading ? 'Authenticating...' : 'Continue with Google'}
        </motion.button>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider absolute">
            or sign in with email
          </span>
        </div>

        {/* Email Sign In Form */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your Name (e.g. Aditi Shinde)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            disabled={loading}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-green-500 transition"
          />

          <input
            type="email"
            placeholder="Your Email (e.g. aditi@example.com)"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEmailAuth();
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-green-500 transition"
          />

          <button
            type="button"
            onClick={() => handleEmailAuth()}
            disabled={loading || !emailInput.trim()}
            className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <BsEnvelope size={14} />
            Continue with Email
          </button>
        </div>

        {/* One-Click Demo Login */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => handleEmailAuth('aditi.candidate@example.com', 'Aditi Shinde')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-xl transition"
          >
            <BsLightningChargeFill size={13} className="text-amber-500" />
            Quick 1-Click Demo Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default Auth;
