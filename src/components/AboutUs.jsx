import React from "react";
import { FiArrowLeft, FiUsers, FiGlobe, FiHeart, FiMapPin, FiCode, FiLayers, FiServer, FiDatabase, FiShield, FiTrendingUp, FiTarget, FiEye, FiZap, FiMessageCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function AboutUs() {
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1);
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
              >
                <FiArrowLeft className="text-xl" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-white/30"></div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white font-cinzel">
                About Us
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
            <img 
              src="/assets/images/NomadNovalogo.jpg" 
              alt="NomadNova Logo" 
              className="w-12 h-12 rounded-full border-2 border-[#f8d56b]"
            />
            <h2 className="text-2xl sm:text-4xl font-bold text-white font-cinzel">NomadNova</h2>
          </div>
          <p className="text-white/90 text-sm sm:text-base max-w-3xl mx-auto font-southmind">
            Connecting Travelers, Creating Adventures - A modern full-stack travel platform that transforms solo wanderers into connected communities
          </p>
        </section>

        <div className="bg-white rounded-2xl shadow-xl border border-[#d1c7b7] overflow-hidden">
          <div className="p-6 sm:p-8 space-y-8">
            {/* Who We Are */}
            <section>
              <h3 className="flex items-center text-2xl font-bold text-[#2c5e4a] mb-4">
                <FiGlobe className="mr-3 text-[#4a708a]" /> Who We Are
              </h3>
              <p className="text-[#5E5854] leading-relaxed">
                NomadNova is a travel companion built for the curious and the adventurous. Our platform connects explorers, digital nomads, and local enthusiasts to discover hidden gems, share unique experiences, and build a global travel community grounded in trust, safety, and exploration.
              </p>
              <div className="border-b border-[#d1c7b7] my-6"></div>
            </section>
            
            {/* Our Mission */}
            <section>
              <h3 className="flex items-center text-2xl font-bold text-[#2c5e4a] mb-4">
                <FiTarget className="mr-3 text-[#4a708a]" /> Our Mission
              </h3>
              <p className="text-[#5E5854] leading-relaxed">
                To empower travelers to explore the world authentically and safely by fostering meaningful connections, sharing travel wisdom, and providing real-time insights tailored to personal journeys.
              </p>
              <div className="border-b border-[#d1c7b7] my-6"></div>
            </section>
            
            {/* Our Vision */}
            <section>
              <h3 className="flex items-center text-2xl font-bold text-[#2c5e4a] mb-4">
                <FiEye className="mr-3 text-[#4a708a]" /> Our Vision
              </h3>
              <p className="text-[#5E5854] leading-relaxed mb-4">
                To become the world's most trusted platform for community-powered travel—where every journey is inspired by people, not just algorithms.
              </p>
              <p className="text-[#5E5854] leading-relaxed mb-2">
                We envision a world where:
              </p>
              <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                <li>Travel is safe, inclusive, and accessible</li>
                <li>Communities support one another through shared experiences</li>
                <li>Exploration becomes more about people and purpose, not just destinations</li>
              </ul>
              <div className="border-b border-[#d1c7b7] my-6"></div>
            </section>
            
            {/* Our Goals */}
            <section>
              <h3 className="flex items-center text-2xl font-bold text-[#2c5e4a] mb-4">
                <FiZap className="mr-3 text-[#4a708a]" /> Our Goals
              </h3>
              
              <div className="space-y-6">
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-2">1. Build Trust-First Communities</h4>
                  <p className="text-[#5E5854]">
                    Create a secure space where users can safely connect, share, and support one another.
                  </p>
                </div>
                
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-2">2. Highlight Local and Hidden Experiences</h4>
                  <p className="text-[#5E5854]">
                    Go beyond the obvious. Help travelers discover what guidebooks miss—through real stories and community tips.
                  </p>
                </div>
                
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-2">3. Encourage Sustainable & Responsible Travel</h4>
                  <p className="text-[#5E5854]">
                    Promote practices that respect local cultures, nature, and heritage.
                  </p>
                </div>
                
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-2">4. Leverage Technology for Meaningful Discovery</h4>
                  <p className="text-[#5E5854]">
                    Use smart design, location-based features, and user insights to create personalized travel experiences.
                  </p>
                </div>
                
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-2">5. Foster Global Belonging</h4>
                  <p className="text-[#5E5854]">
                    Whether you're a solo traveler or digital nomad, feel like you're part of something bigger wherever you go.
                  </p>
                </div>
              </div>
              <div className="border-b border-[#d1c7b7] my-6"></div>
            </section>
            
            {/* Join the Journey */}
            <section>
              <h3 className="flex items-center text-2xl font-bold text-[#2c5e4a] mb-4">
                <FiMessageCircle className="mr-3 text-[#4a708a]" /> Join the Journey
              </h3>
              <p className="text-[#5E5854] leading-relaxed font-medium">
                At NomadNova, we're not just building an app we're nurturing a movement. Come travel with us.
              </p>
              
              <div className="mt-6 text-center">
                <p className="text-[#2c5e4a] font-medium">Built with ❤ for travelers, by travelers</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Footer - Match Dashboard Footer */}
      <footer className="bg-[#2c5e4a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-[#f8d56b] font-bold text-2xl font-cinzel mb-4">
              NomadNova
            </div>
            <p className="text-white/80 text-sm">
              © {new Date().getFullYear()} NomadNova. All rights reserved. | Connecting travelers worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
<<<<<<< HEAD
=======



>>>>>>> 0ea2c5719a18a65ae7d7d76ad43cb00d3ded42f8
