import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsSearch,
  BsTrophy,
  BsClock,
  BsBarChartFill,
  BsTrash3,
  BsEye,
  BsCalendar3,
  BsCheckCircleFill,
  BsLightbulbFill,
  BsChevronDown,
  BsChevronUp,
  BsPrinter,
  BsRobot,
  BsFileEarmarkPdf,
  BsX,
  BsArrowRepeat,
  BsArrowLeft,
  BsPlayFill,
  BsPersonBadge
} from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ServeUrl } from '../App';
import AuthModel from '../components/AuthModel';

function HistoryPage() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgScore: 0,
    highestScore: 0,
    totalTimeSpent: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modal for viewing full generated report
  const [selectedReport, setSelectedReport] = useState(null);
  const [expandedQuestionIdx, setExpandedQuestionIdx] = useState(0);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auth modal
  const [showAuth, setShowAuth] = useState(false);

  // Fetch interview history from database
  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${ServeUrl}/api/interview/history`, {
        withCredentials: true
      });
      if (res.data) {
        setInterviews(res.data.interviews || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to load interview history:', err.response?.data || err.message);
      if (err.response?.status === 401 || err.response?.status === 400) {
        // Not logged in
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, [userData]);

  // Handle Delete
  const handleDeleteInterview = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview record? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeletingId(id);
      await axios.delete(`${ServeUrl}/api/interview/${id}`, {
        withCredentials: true
      });

      // Update state
      const updated = interviews.filter((item) => item._id !== id);
      setInterviews(updated);

      // Recalculate stats
      const total = updated.length;
      const sum = updated.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
      const avg = total > 0 ? Math.round(sum / total) : 0;
      const highest = total > 0 ? Math.max(...updated.map((item) => item.overallScore || 0)) : 0;
      const time = updated.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);

      setStats({
        totalInterviews: total,
        avgScore: avg,
        highestScore: highest,
        totalTimeSpent: time
      });

      if (selectedReport?._id === id) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Failed to delete interview:', err);
      alert('Failed to delete interview report. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  const formatTime = (secs = 0) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const m = mins % 60;
      return `${hrs}h ${m}m`;
    }
    return `${mins}m ${rem}s`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Unique roles for filter tabs
  const rolesList = ['All', ...new Set(interviews.map((item) => item.role).filter(Boolean))];

  // Filtered & Sorted Interviews
  const filteredInterviews = interviews
    .filter((item) => {
      const matchesSearch =
        item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.experience?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRoleFilter === 'All' || item.role === selectedRoleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'highestScore') return (b.overallScore || 0) - (a.overallScore || 0);
      if (sortBy === 'lowestScore') return (a.overallScore || 0) - (b.overallScore || 0);
      return 0;
    });

  const getScoreBadge = (score = 0) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'Excellent',
        color: 'text-emerald-600'
      };
    }
    if (score >= 65) {
      return {
        bg: 'bg-green-50 text-green-700 border-green-200',
        text: 'Good',
        color: 'text-green-600'
      };
    }
    if (score >= 40) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        text: 'Fair',
        color: 'text-amber-600'
      };
    }
    if (score > 0) {
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        text: 'Needs Work',
        color: 'text-orange-600'
      };
    }
    return {
      bg: 'bg-gray-100 text-gray-600 border-gray-200',
      text: 'No Attempt',
      color: 'text-gray-500'
    };
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <BsBarChartFill size={11} />
                Interview Archive & Performance Log
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Past Interviews & <span className="text-green-600">Reports</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Review your complete simulation history, track improvement trends, and inspect deep question feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                navigate('/interview');
              }}
              className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-full text-xs shadow-md flex items-center gap-2 transition"
            >
              <BsPlayFill size={18} className="text-green-400" />
              Start New Interview
            </button>
          </div>
        </div>

        {/* Not Logged In Banner */}
        {!userData && !isLoading && (
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm text-center mb-10">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BsRobot size={30} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to view your interview history</h2>
            <p className="text-gray-500 text-xs max-w-md mx-auto mb-6">
              Your mock interviews, AI feedback, and progress analytics are securely saved to your account.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold shadow-md hover:bg-gray-800 transition"
            >
              Sign In / Create Account
            </button>
          </div>
        )}

        {/* Analytics Summary Stats (Only when logged in) */}
        {userData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Total Interviews */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 block mb-1">
                Total Sessions
              </span>
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900">
                {stats.totalInterviews}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                {stats.totalInterviews === 1 ? '1 Interview Completed' : `${stats.totalInterviews} Interviews Completed`}
              </span>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-500 block mb-1">
                Average Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-extrabold text-green-600">
                  {stats.avgScore}
                </span>
                <span className="text-gray-400 text-sm font-semibold">/100</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Across all completed tracks
              </span>
            </div>

            {/* Highest Score */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 block">
                  Peak Score
                </span>
                <BsTrophy size={14} className="text-amber-500" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-extrabold text-amber-500">
                  {stats.highestScore}
                </span>
                <span className="text-gray-400 text-sm font-semibold">/100</span>
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Personal best evaluation
              </span>
            </div>

            {/* Total Practice Time */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 block">
                  Practice Time
                </span>
                <BsClock size={14} className="text-blue-500" />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-gray-900">
                {formatTime(stats.totalTimeSpent)}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Time spent in live interviews
              </span>
            </div>
          </div>
        )}

        {/* Search & Filters Toolbar */}
        {userData && interviews.length > 0 && (
          <div className="bg-white rounded-3xl p-4 md:p-5 border border-gray-200 shadow-sm mb-6 space-y-3.5 overflow-hidden">
            {/* Top Row: Search Input & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-80">
                <BsSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search by role, experience, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-green-500 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                  >
                    <BsX size={16} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <span className="text-[11px] font-semibold text-gray-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-green-500 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highestScore">Highest Score</option>
                  <option value="lowestScore">Lowest Score</option>
                </select>
              </div>
            </div>

            {/* Bottom Row: Role Filter Pills with safe horizontal scroll */}
            <div className="w-full min-w-0 pt-2 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto pb-1.5">
              {rolesList.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRoleFilter(role)}
                  title={role}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition max-w-[220px] truncate shrink-0 ${
                    selectedRoleFilter === role
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-xs font-semibold">Retrieving your interview archives...</p>
          </div>
        )}

        {/* Empty State (When user has 0 interviews) */}
        {!isLoading && userData && interviews.length === 0 && (
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-gray-200 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <BsRobot size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No Past Interviews Yet</h2>
            <p className="text-gray-500 text-xs max-w-md mx-auto mb-8 leading-relaxed">
              You haven't conducted any mock interviews yet. Start your first AI-powered interview to generate detailed performance reports, speech analysis, and targeted improvement suggestions!
            </p>
            <button
              onClick={() => navigate('/interview')}
              className="bg-black hover:bg-gray-800 text-white font-bold px-8 py-3.5 rounded-full text-xs shadow-md transition inline-flex items-center gap-2"
            >
              <BsPlayFill size={18} className="text-green-400" />
              Start Your First Interview (50 Credits)
            </button>
          </div>
        )}

        {/* Empty Search Results */}
        {!isLoading && userData && interviews.length > 0 && filteredInterviews.length === 0 && (
          <div className="bg-white rounded-3xl p-12 border border-gray-200 shadow-sm text-center">
            <h3 className="font-bold text-gray-900 text-lg mb-1">No Matching Interviews</h3>
            <p className="text-gray-400 text-xs mb-4">
              No interview reports matched your search query "{searchQuery}" or selected filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRoleFilter('All');
              }}
              className="text-xs text-green-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Interviews Cards List */}
        {!isLoading && userData && filteredInterviews.length > 0 && (
          <div className="space-y-4">
            {filteredInterviews.map((item, idx) => {
              const badge = getScoreBadge(item.overallScore);
              return (
                <motion.div
                  key={item._id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-3xl p-6 md:p-7 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  {/* Left: Role Info & Badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-3 py-0.5 rounded-full">
                        {item.role}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        {item.experience}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full capitalize">
                        {item.mode} Mode
                      </span>
                      {item.resumeName && (
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <BsFileEarmarkPdf size={11} />
                          Resume Tailored
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                      {item.role} Simulation
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-2">
                      <span className="flex items-center gap-1">
                        <BsCalendar3 size={12} />
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BsClock size={12} />
                        Duration: {formatTime(item.timeSpentSeconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BsPersonBadge size={12} />
                        Interviewer: {item.persona === 'male' ? 'Alex' : 'Sarah'}
                      </span>
                      <span>
                        {item.questionReviews?.length || item.totalQuestions || 0} Questions
                      </span>
                    </div>
                  </div>

                  {/* Middle: Mini Metrics Meters */}
                  <div className="hidden lg:grid grid-cols-3 gap-3 w-64 shrink-0 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Tech</span>
                      <span className="text-sm font-bold text-gray-900">{item.technicalScore || 0}%</span>
                      <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${item.technicalScore || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Comm</span>
                      <span className="text-sm font-bold text-gray-900">{item.communicationScore || 0}%</span>
                      <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${item.communicationScore || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block uppercase">Tone</span>
                      <span className="text-sm font-bold text-gray-900">{item.confidenceScore || 0}%</span>
                      <div className="w-full bg-gray-200 h-1 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${item.confidenceScore || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Overall Score Badge & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className={`text-2xl md:text-3xl font-extrabold ${badge.color}`}>
                          {item.overallScore}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">/100</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedReport(item);
                          setExpandedQuestionIdx(0);
                        }}
                        className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <BsEye size={13} />
                        View Report
                      </button>

                      <button
                        onClick={(e) => handleDeleteInterview(item._id, e)}
                        disabled={isDeleting && deletingId === item._id}
                        title="Delete report"
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition"
                      >
                        <BsTrash3 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* FULL REPORT MODAL POPUP */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 md:p-8 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
              >
                <BsX size={20} />
              </button>

              {/* Modal Top Header */}
              <div className="mb-6 pr-10">
                <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full">
                  Detailed Interview Report
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-2">
                  {selectedReport.role} <span className="text-green-600">Evaluation</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Conducted on {formatDate(selectedReport.createdAt)} • Duration: {formatTime(selectedReport.timeSpentSeconds)}
                </p>
              </div>

              {/* Overview Score Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Overall Score
                  </span>
                  <div className="my-2">
                    <span className="text-4xl font-extrabold text-green-400">
                      {selectedReport.overallScore}
                    </span>
                    <span className="text-gray-400 text-sm"> / 100</span>
                  </div>
                  <span className="text-[11px] text-gray-300">
                    {selectedReport.overallScore >= 75 ? 'Certified Ready' : 'Needs Practice'}
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Technical Depth
                  </span>
                  <div className="my-2 text-3xl font-extrabold text-gray-900">
                    {selectedReport.technicalScore || 0}%
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${selectedReport.technicalScore || 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Communication
                  </span>
                  <div className="my-2 text-3xl font-extrabold text-gray-900">
                    {selectedReport.communicationScore || 0}%
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full"
                      style={{ width: `${selectedReport.communicationScore || 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col justify-between">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Confidence & Tone
                  </span>
                  <div className="my-2 text-3xl font-extrabold text-gray-900">
                    {selectedReport.confidenceScore || 0}%
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${selectedReport.confidenceScore || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50/40 border border-green-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BsCheckCircleFill className="text-green-600" size={15} />
                    <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                      Key Strengths Demonstrated
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {selectedReport.strengths?.map((str, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BsLightbulbFill className="text-amber-500" size={15} />
                    <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                      Actionable Recommendations
                    </h4>
                  </div>
                  <ul className="space-y-2">
                    {selectedReport.improvements?.map((imp, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Question-by-Question Deep Dive */}
              <div className="mb-6">
                <h4 className="font-bold text-sm text-gray-900 mb-3">
                  Question Reviews & Transcripts ({selectedReport.questionReviews?.length || 0})
                </h4>

                <div className="space-y-3">
                  {selectedReport.questionReviews?.map((item, qIdx) => {
                    const isExp = expandedQuestionIdx === qIdx;
                    return (
                      <div
                        key={qIdx}
                        className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50/50"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedQuestionIdx(isExp ? null : qIdx)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-100/70 transition"
                        >
                          <div className="flex items-center gap-3 pr-4">
                            <span className="w-6 h-6 rounded-lg bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                              {qIdx + 1}
                            </span>
                            <div>
                              <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider block">
                                {item.category}
                              </span>
                              <h5 className="font-bold text-xs text-gray-900 line-clamp-1">
                                {item.question}
                              </h5>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                item.score >= 70
                                  ? 'bg-green-100 text-green-700'
                                  : item.score >= 40
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-600'
                              }`}
                            >
                              {item.score}/100
                            </span>
                            {isExp ? <BsChevronUp size={13} /> : <BsChevronDown size={13} />}
                          </div>
                        </button>

                        {isExp && (
                          <div className="p-4 border-t border-gray-200 bg-white space-y-3 text-xs">
                            <div>
                              <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                                Candidate Answer:
                              </span>
                              <p className="text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100 italic leading-relaxed">
                                {item.userAnswer ? `"${item.userAnswer}"` : <span className="text-gray-400">No response recorded</span>}
                              </p>
                            </div>

                            <div>
                              <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                                AI Feedback:
                              </span>
                              <p className="text-gray-700 bg-green-50/40 p-3 rounded-xl border border-green-100 leading-relaxed">
                                {item.feedback}
                              </p>
                            </div>

                            {item.idealConcept && (
                              <div>
                                <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">
                                  Key Concepts to Include:
                                </span>
                                <p className="text-gray-600 bg-blue-50/30 p-3 rounded-xl border border-blue-100 leading-relaxed">
                                  {item.idealConcept}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Footer in Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-xl transition"
                >
                  <BsPrinter size={14} />
                  Print / Export PDF
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReport(null);
                      navigate('/interview');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-black hover:bg-gray-800 px-5 py-2.5 rounded-xl shadow-sm transition"
                  >
                    <BsArrowRepeat size={14} />
                    Retake This Track
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="text-xs font-semibold text-gray-500 hover:text-black px-3 py-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal if user clicks sign in */}
      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer />
    </div>
  );
}

export default HistoryPage;
