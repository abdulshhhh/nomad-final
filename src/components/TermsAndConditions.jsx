import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiFileText, FiUsers, FiLock, FiShield } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [referrer, setReferrer] = useState("/dashboard");
  
  useEffect(() => {
    // Check if we have a state with a referrer
    if (location.state && location.state.from) {
      setReferrer(location.state.from);
    } else if (document.referrer) {
      // Use document.referrer as fallback
      const referrerUrl = new URL(document.referrer);
      // Extract the path from the referrer URL
      const path = referrerUrl.pathname;
      if (path && path !== "/terms-and-conditions") {
        setReferrer(path);
      }
    }
  }, [location]);
  
  const handleGoBack = () => {
    navigate(referrer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
      {/* Header - Match Dashboard Header */}
      <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-white hover:text-[#f8d56b] transition-colors"
                aria-label="Go back"
              >
                <FiArrowLeft className="text-xl" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-white/30"></div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-cinzel">
                Terms & Conditions
              </h1>
            </div>
            {/* NomadNova Logo/Brand */}
            <div className="flex items-center">
              <img 
                src="/assets/images/NomadNovalogo.jpg" 
                alt="NomadNova Logo" 
                className="w-10 h-10 rounded-full mr-2"
              />
              <div className="text-[#f8d56b] font-bold text-xl font-cinzel">
                NomadNova
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section - Match Dashboard Style */}
        <section className="text-center bg-gradient-to-r from-[#6F93AD] to-[#4a708a] rounded-2xl p-4 sm:p-8 border border-[#5E5854] shadow-xl mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <FiFileText className="text-3xl text-white" />
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold text-white font-cinzel">NomadNova – Terms and Conditions</h2>
              <p className="text-white/80 text-sm sm:text-base">Effective Date: July 07, 2025</p>
            </div>
          </div>
          <p className="text-white/90 text-sm sm:text-base max-w-2xl mx-auto">
            Please read these terms carefully before using our travel platform. By using NomadNova, you agree to these terms and conditions.
          </p>
        </section>

        <div className="bg-white rounded-2xl shadow-xl border border-[#d1c7b7] overflow-hidden">
          {/* Terms Content */}
          <div className="p-6 sm:p-8 space-y-6">

            {/* Section 1: User Responsibilities */}
            <div className="bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5] rounded-xl p-6 border border-[#d1c7b7] shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] p-3 rounded-full">
                  <FiUsers className="text-xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2c5e4a] font-cinzel">1. User Responsibilities</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#d1c7b7]">
                <ul className="space-y-3 text-[#5E5854] leading-relaxed">
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#f87c6d] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Users must provide accurate information when creating an account and keep their credentials secure.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#f87c6d] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Users are responsible for all activities that occur under their account.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#f87c6d] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Users must comply with all applicable laws and regulations when using our platform.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 2: Privacy & Data Security */}
            <div className="bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5] rounded-xl p-6 border border-[#d1c7b7] shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-[#6F93AD] to-[#4a708a] p-3 rounded-full">
                  <FiLock className="text-xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2c5e4a] font-cinzel">2. Privacy & Data Security</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#d1c7b7]">
                <ul className="space-y-3 text-[#5E5854] leading-relaxed">
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#4a708a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>We collect and process personal data as described in our Privacy Policy.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#4a708a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Users consent to our data practices when they use our services.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#4a708a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>We implement reasonable security measures to protect user data.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 3: Safety and Security Measures */}
            <div className="bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5] rounded-xl p-6 border border-[#d1c7b7] shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-[#f8d56b] to-[#f8a95d] p-3 rounded-full">
                  <FiShield className="text-xl text-[#2c5e4a]" />
                </div>
                <h3 className="text-xl font-bold text-[#2c5e4a] font-cinzel">3. Safety and Security Measures</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#d1c7b7]">
                <ul className="space-y-3 text-[#5E5854] leading-relaxed">
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#f8a95d] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Users should follow safety guidelines when meeting travel companions.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#f8a95d] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>We provide safety features but cannot guarantee complete safety during travel.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#f8a95d] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Users should report suspicious behavior through our reporting system.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Section 4: Account Termination */}
            <div className="bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5] rounded-xl p-6 border border-[#d1c7b7] shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-3 rounded-full">
                  <FiFileText className="text-xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2c5e4a] font-cinzel">4. Account Termination</h3>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#d1c7b7]">
                <ul className="space-y-3 text-[#5E5854] leading-relaxed">
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#2c5e4a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>We reserve the right to suspend or terminate accounts that violate our terms.</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-[#2c5e4a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Users can deactivate their accounts at any time via the settings panel.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-[#6F93AD] to-[#4a708a] rounded-xl p-6 border border-[#5E5854] shadow-xl text-center">
              <h3 className="text-lg font-bold text-white mb-3 font-cinzel">Contact Us</h3>
              <p className="text-white/90 leading-relaxed">
                If you have any questions about these Terms & Conditions, please contact us at{' '}
                <a href="mailto:support@nomadnova.com" className="text-[#f8d56b] hover:text-white font-semibold transition-colors underline">
                  support@nomadnova.com
                </a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
