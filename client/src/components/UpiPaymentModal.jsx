import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsCoin,
  BsQrCodeScan,
  BsCheckCircleFill,
  BsCopy,
  BsCheck,
  BsShieldLock,
  BsLightningChargeFill,
  BsArrowRight,
  BsX
} from 'react-icons/bs';
import { SiGooglepay, SiPhonepe, SiPaytm } from 'react-icons/si';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { ServeUrl } from '../App';
import { setUserData } from '../redux/userSlice';

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 99,
    interviews: '2 Mock Interviews',
    tag: 'Quick Start',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 250,
    price: 199,
    interviews: '5 Mock Interviews',
    tag: 'Most Popular',
    popular: true
  },
  {
    id: 'master',
    name: 'Master Pack',
    credits: 500,
    price: 349,
    interviews: '10 Mock Interviews',
    tag: 'Best Value (30% OFF)',
    popular: false
  }
];

const MERCHANT_UPI_ID = 'interviewiq@okhdfcbank';

function UpiPaymentModal({ isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [selectedPack, setSelectedPack] = useState(CREDIT_PACKAGES[1]); // Default Pro pack
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const upiIntentUrl = `upi://pay?pa=${MERCHANT_UPI_ID}&pn=InterviewIQ.AI&am=${selectedPack.price}&cu=INR&tn=CreditPack_${selectedPack.credits}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiIntentUrl
  )}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(MERCHANT_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleVerifyPayment = async (isDevInstant = false) => {
    try {
      setLoading(true);
      setError(null);

      const txnId = isDevInstant
        ? `DEV_UPI_${Date.now().toString().slice(-6)}`
        : utrNumber.trim();

      if (!isDevInstant && txnId.length < 4) {
        setError('Please enter a valid 12-digit UPI Reference / UTR Number.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${ServeUrl}/api/user/add-credits`,
        {
          credits: selectedPack.credits,
          amount: selectedPack.price,
          upiId: MERCHANT_UPI_ID,
          transactionId: txnId
        },
        { withCredentials: true }
      );

      dispatch(setUserData(response.data.user));
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess(response.data.user);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Payment verification failed:', err);
      setError(err.response?.data?.message || 'Failed to verify payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="relative w-full max-w-2xl bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden my-6"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <BsX size={24} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-500/20 text-green-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <BsLightningChargeFill size={11} /> Instant Credit Refill
            </span>
          </div>
          <h2 className="text-2xl font-bold">Purchase Interview Credits</h2>
          <p className="text-gray-300 text-xs mt-1">
            Current Balance: <strong className="text-green-400 font-bold">{userData?.credits || 0} Credits</strong> • Each mock interview requires 50 credits.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Success Splash */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 text-center space-y-2"
              >
                <BsCheckCircleFill className="text-green-600 mx-auto text-4xl animate-bounce" />
                <h3 className="font-extrabold text-lg text-green-900">
                  Payment Verified Successfully!
                </h3>
                <p className="text-xs text-green-700">
                  +{selectedPack.credits} Credits added to your account. Your new balance is{' '}
                  <strong>{userData?.credits} Credits</strong>.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <>
              {/* Package Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">
                  1. Select Credit Package:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CREDIT_PACKAGES.map((pack) => {
                    const isSelected = selectedPack.id === pack.id;
                    return (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => setSelectedPack(pack)}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-green-600 bg-green-50/40 shadow-md ring-2 ring-green-600/20'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        {pack.popular && (
                          <span className="absolute -top-2.5 right-3 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {pack.tag}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900 mb-1">
                          <BsCoin className="text-amber-500" size={16} />
                          {pack.credits} Credits
                        </div>
                        <div className="text-xl font-extrabold text-gray-900 mb-1">
                          ₹{pack.price}
                        </div>
                        <p className="text-[11px] text-gray-500">{pack.interviews}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* UPI QR & Payment Info */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">
                  2. Scan QR or Pay directly via UPI:
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Dynamic QR */}
                  <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm shrink-0 flex flex-col items-center">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-40 h-40 object-contain rounded-lg"
                    />
                    <span className="text-[10px] text-gray-400 font-medium mt-1 flex items-center gap-1">
                      <BsQrCodeScan size={10} /> Scan with any UPI App
                    </span>
                  </div>

                  {/* UPI Details & Supported Apps */}
                  <div className="flex-1 space-y-4 w-full">
                    {/* Official UPI ID Box */}
                    <div>
                      <span className="text-xs text-gray-500 font-medium block mb-1">
                        Merchant UPI ID / VPA:
                      </span>
                      <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-xl border border-gray-200 shadow-sm">
                        <code className="text-xs font-mono font-bold text-gray-800 flex-1 truncate">
                          {MERCHANT_UPI_ID}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg hover:bg-green-100 transition"
                        >
                          {copiedUpi ? (
                            <>
                              <BsCheck size={14} /> Copied!
                            </>
                          ) : (
                            <>
                              <BsCopy size={12} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quick App Icons & Mobile Pay Link */}
                    <div>
                      <span className="text-[11px] text-gray-400 font-medium block mb-1.5">
                        Supported UPI Payment Apps:
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
                          <SiGooglepay className="text-blue-500" size={16} /> GPay
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
                          <SiPhonepe className="text-purple-600" size={16} /> PhonePe
                        </span>
                        <span className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 shadow-2xs">
                          <SiPaytm className="text-sky-500" size={16} /> Paytm
                        </span>
                      </div>
                    </div>

                    <a
                      href={upiIntentUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:text-green-800 underline"
                    >
                      Open UPI App on Device <BsArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 3: Enter UTR Reference Number */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-2">
                  3. Enter 12-Digit UPI UTR / Reference ID:
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 429182390192 (from your UPI receipt)"
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleVerifyPayment(false)}
                    className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Add Credits'}
                  </button>
                </div>

                {error && (
                  <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
                )}
              </div>

              {/* Dev Simulation Instant Pay Button */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <BsShieldLock size={13} className="text-green-600" />
                  Bank-Grade UPI Direct Settlement
                </span>

                <button
                  type="button"
                  onClick={() => handleVerifyPayment(true)}
                  className="text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 transition"
                  title="Simulate instant UPI approval for testing without charging real money"
                >
                  ⚡ Instant Approval (Dev Mode)
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default UpiPaymentModal;
