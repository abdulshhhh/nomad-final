import { useState, useEffect, useRef } from 'react';
import { FiLock, FiRefreshCw, FiX, FiMail, FiAlertTriangle } from 'react-icons/fi';

export default function OTPVerification({ type, onClose, onVerified }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isResending, setIsResending] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      alert('Please enter all 6 digits');
      return;
    }

    // Simulate verification (in real app, this would call an API)
    if (otpString === '123456') {
      onVerified();
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        alert('Too many failed attempts. Please try again later.');
        onClose();
      } else {
        alert('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      setTimeLeft(300); // Reset timer
      setOtp(['', '', '', '', '', '']);
      setAttempts(0);
      inputRefs.current[0]?.focus();
      alert('New OTP sent successfully!');
    }, 2000);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTitle = () => {
    switch (type) {
      case 'password':
        return 'Verify Password Change';
      case 'phone':
        return 'Verify Phone Number';
      default:
        return 'OTP Verification';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'password':
        return 'We\'ve sent a verification code to your email.';
      case 'phone':
        return 'We\'ve sent a verification code to your phone.';
      default:
        return 'Please enter the verification code.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-2xl w-full max-w-sm border-2 border-[#5E5854] shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-3 rounded-t-2xl border-b border-[#5E5854]">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">{getTitle()}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-[#EC8E3D] transition-colors"
              aria-label="Close verification"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Icon */}
          <div className="text-center">
            <div className="w-12 h-12 bg-[#EC8E3D] rounded-full flex items-center justify-center mx-auto mb-2">
              <FiMail className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-[#204231] text-center">
              {getDescription()}
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-3">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-9 h-10 text-center text-lg font-bold bg-[#6F93AD] border-2 border-[#5E5854] rounded-lg text-[#204231] focus:outline-none focus:ring-2 focus:ring-[#EC8E3D] focus:border-[#EC8E3D] transition-colors"
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-xs text-[#204231]/70">
                Code expires in <span className="font-bold text-[#EC8E3D]">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <p className="text-xs text-red-600 font-semibold">Code has expired</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleVerify}
              disabled={otp.join('').length !== 6 || timeLeft === 0}
              className="w-full bg-[#EC8E3D] hover:bg-[#EE9C8F] disabled:bg-[#5E5854] disabled:cursor-not-allowed text-white py-2 rounded-xl font-cinzel transition-colors flex items-center justify-center"
            >
              <FiLock className="w-4 h-4 mr-2" />
              <span className="text-sm">Verify Code</span>
            </button>

            <div className="text-center">
              <button
                onClick={handleResendOTP}
                disabled={isResending || timeLeft > 240} // Can resend after 1 minute
                className="text-[#EC8E3D] hover:text-[#EE9C8F] font-cinzel disabled:text-[#5E5854] disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto"
              >
                <FiRefreshCw className={`w-3 h-3 mr-1 ${isResending ? 'animate-spin' : ''}`} />
                <span className="text-xs">{isResending ? 'Sending...' : 'Resend OTP'}</span>
              </button>
            </div>
          </div>

          {/* Testing tip */}
          <div className="text-xs text-center text-[#204231]">
            For testing, use code: <span className="font-bold">123456</span>
          </div>
        </div>
      </div>
    </div>
  );
}
