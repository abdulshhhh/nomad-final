import React from "react";
import { FiArrowLeft, FiUsers, FiGlobe, FiHeart, FiMapPin, FiCode, FiLayers, FiServer, FiDatabase, FiShield, FiTrendingUp } from "react-icons/fi";
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
            {/* Project Overview */}
            <section>
              <h3 className="text-2xl font-bold text-[#2c5e4a] mb-4"> Project Overview</h3>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[#4a708a] mb-2">The Problem We Solved</h4>
                <p className="text-[#5E5854] leading-relaxed">
                  Travel planning is often lonely and overwhelming. Solo travelers struggle to find like-minded companions, while group organizers face challenges coordinating trips and managing participants. Traditional travel platforms focus on bookings but ignore the human connection that makes travel truly memorable.
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[#4a708a] mb-2">Our Solution</h4>
                <p className="text-[#5E5854] leading-relaxed">
                  NomadNova is a comprehensive travel community platform that bridges the gap between solo travelers and group adventures. We've created an ecosystem where travel enthusiasts can discover trips, join communities, and build lasting connections through shared experiences.
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-[#4a708a] mb-2">Who It's For</h4>
                <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                  <li> Solo Travelers seeking adventure companions</li>
                  <li> Trip Organizers wanting to create and manage group experiences</li>
                  <li> Travel Communities looking for a centralized platform to connect</li>
                  <li> Travel Agencies needing modern tools for group coordination</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-[#4a708a] mb-2">The Experience</h4>
                <p className="text-[#5E5854] leading-relaxed">
                  Users enter a beautifully designed platform where they can instantly browse upcoming trips, join adventures that match their interests, communicate with fellow travelers in real-time, and build their travel reputation through our gamified points system.
                </p>
              </div>
            </section>
            
            {/* Key Features */}
            <section>
              <h3 className="text-2xl font-bold text-[#2c5e4a] mb-4"> Key Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="flex items-center text-lg font-semibold text-[#4a708a] mb-3">
                    <FiMapPin className="mr-2 text-[#2c5e4a]" /> Core Travel Features
                  </h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>Smart Trip Discovery: Browse curated travel experiences with advanced filtering</li>
                    <li>One-Click Trip Joining: Seamless registration for adventures with instant confirmation</li>
                    <li>Dynamic Trip Creation: Intuitive trip posting with rich media support and detailed itineraries</li>
                    <li>Real-Time Group Chat: Live communication channels for each trip community</li>
                    <li>Interactive Trip Management: Comprehensive dashboard for organizers to manage participants</li>
                  </ul>
                </div>
                
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="flex items-center text-lg font-semibold text-[#4a708a] mb-3">
                    <FiUsers className="mr-2 text-[#2c5e4a]" /> Community & Social
                  </h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>Traveler Profiles: Rich user profiles showcasing travel history and preferences</li>
                    <li>Leaderboard System: Gamified points system rewarding active community participation</li>
                    <li>Member Discovery: Find and connect with like-minded travelers</li>
                    <li>Trip Reviews & Ratings: Community-driven quality assurance</li>
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="flex items-center text-lg font-semibold text-[#4a708a] mb-3">
                    <FiGlobe className="mr-2 text-[#2c5e4a]" /> Smart Features
                  </h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>Intelligent Notifications: Real-time updates for trip changes, new messages, and community activities</li>
                    <li>Advanced Search & Filters: Find perfect trips by destination, budget, dates, and travel style</li>
                    <li>Responsive Design: Seamless experience across desktop, tablet, and mobile devices</li>
                    <li>Google Maps Integration: Visual trip locations and destination exploration</li>
                  </ul>
                </div>
                
                <div className="bg-[#f8f4e3] p-4 rounded-lg">
                  <h4 className="flex items-center text-lg font-semibold text-[#4a708a] mb-3">
                    <FiShield className="mr-2 text-[#2c5e4a]" /> Security & Trust
                  </h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>Secure Authentication: Google OAuth integration with JWT token management</li>
                    <li>Data Protection: Enterprise-grade security for user information and payment data</li>
                    <li>Community Moderation: Built-in tools for maintaining safe travel communities</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Tech Stack */}
            <section>
              <h3 className="text-2xl font-bold text-[#2c5e4a] mb-4">⚙ Tech Stack Architecture</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[#f0f5ff] p-4 rounded-lg">
                  <h4 className="flex items-center text-lg font-semibold text-[#4a708a] mb-3">
                    <FiLayers className="mr-2 text-[#2c5e4a]" /> Frontend Excellence
                  </h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>React 18 - Modern component-based UI with hooks and context</li>
                    <li>Vite - Lightning-fast development server and optimized builds</li>
                    <li>Tailwind CSS - Utility-first styling for rapid, responsive design</li>
                    <li>React Router - Seamless single-page application navigation</li>
                    <li>Axios - Robust HTTP client for API communication</li>
                    <li>Socket.IO Client - Real-time bidirectional communication</li>
                  </ul>
                </div>
                
                <div className="bg-[#f0f5ff] p-4 rounded-lg">
                  <h4 className="flex items-center text-lg font-semibold text-[#4a708a] mb-3">
                    <FiServer className="mr-2 text-[#2c5e4a]" /> Backend Powerhouse
                  </h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>Node.js - High-performance JavaScript runtime for scalable server-side applications</li>
                    <li>Express.js - Minimal, flexible web application framework</li>
                    <li>Socket.IO - Real-time engine for instant messaging and live updates</li>
                    <li>Multer - Efficient file upload handling for trip images</li>
                    <li>Cors - Cross-origin resource sharing configuration</li>
                    <li>Concurrently - Development workflow optimization</li>
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#f0f5ff] p-4 rounded-lg">
                  <h4 className="flex items-center text-lg font-semibold text-[#4a708a] mb-3">
                    <FiDatabase className="mr-2 text-[#2c5e4a]" /> Database & Storage
                  </h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>MongoDB - Flexible NoSQL database perfect for travel data's dynamic nature</li>
                    <li>Mongoose - Elegant MongoDB object modeling with built-in validation</li>
                    <li>GridFS - Efficient large file storage for high-resolution travel images</li>
                  </ul>
                </div>
                
                <div className="bg-[#f0f5ff] p-4 rounded-lg">
                  <h4 className="flex items-center text-lg font-semibold text-[#4a708a] mb-3">
                    <FiShield className="mr-2 text-[#2c5e4a]" /> Authentication & Security
                  </h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>Google OAuth 2.0 - Secure, user-friendly social authentication</li>
                    <li>JWT (JSON Web Tokens) - Stateless authentication with secure token management</li>
                    <li>Passport.js - Comprehensive authentication middleware</li>
                    <li>bcrypt - Industry-standard password hashing</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Future Roadmap */}
            <section>
              <h3 className="text-2xl font-bold text-[#2c5e4a] mb-4"> Future Roadmap</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#d1c7b7] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-3"> Phase 1: Mobile Excellence</h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>React Native App: Native iOS and Android applications</li>
                    <li>Push Notifications: Real-time trip updates and community alerts</li>
                    <li>Offline Capabilities: Access trip details without internet connectivity</li>
                  </ul>
                </div>
                
                <div className="border border-[#d1c7b7] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-3">Phase 2: Smart Travel Intelligence</h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>AI-Powered Recommendations: Machine learning trip suggestions based on user preferences</li>
                    <li>Real-Time Location Tracking: Live location sharing during active trips</li>
                    <li>Smart Itinerary Builder: Automated day-by-day trip planning with local insights</li>
                  </ul>
                </div>
                
                <div className="border border-[#d1c7b7] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-3"> Phase 3: Integrated Commerce</h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>Payment Processing: Secure trip payments and cost splitting</li>
                    <li>Travel Insurance Integration: One-click travel protection</li>
                    <li>Local Experience Marketplace: Book activities and experiences directly through the platform</li>
                  </ul>
                </div>
                
                <div className="border border-[#d1c7b7] p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-[#4a708a] mb-3"> Phase 4: Advanced Community</h4>
                  <ul className="text-[#5E5854] leading-relaxed list-disc pl-5 space-y-1">
                    <li>Video Chat Integration: Virtual trip planning sessions</li>
                    <li>Travel Mentorship Program: Connect experienced travelers with newcomers</li>
                    <li>Corporate Travel Solutions: Enterprise features for company retreats and team building</li>
                  </ul>
                </div>
              </div>
            </section>
            
            {/* Project Impact */}
            <section>
              <h3 className="text-2xl font-bold text-[#2c5e4a] mb-4"> Project Impact</h3>
              <p className="text-[#5E5854] leading-relaxed mb-4">
                NomadNova represents the future of travel community platforms - where technology enhances human connection rather than replacing it. By combining modern web technologies with thoughtful user experience design, we've created a platform that doesn't just facilitate travel booking, but builds lasting communities around shared adventures.
              </p>
              <p className="text-[#5E5854] leading-relaxed font-medium">
                Ready to transform how the world travels together.
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


