import React, { useState, useEffect } from "react";
import { FiX, FiEdit, FiTrendingUp, FiAward, FiMapPin, FiCalendar, FiUsers, FiStar } from "react-icons/fi";
import { GiCoinsPile, GiTrophy } from "react-icons/gi";
import { FaCrown, FaFire, FaMedal, FaGem } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";

// 🏆 DYNAMIC PROFILE DASHBOARD WITH REAL-TIME UPDATES
export default function ProfilePage({ onClose, currentUser }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 🔥 FETCH DYNAMIC PROFILE DATA
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = currentUser?.id || currentUser?._id;
      const response = await axios.get(`http://localhost:5000/api/leaderboard/profile/${userId}`);
      if (response.data.success) {
        setProfileData(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 REAL-TIME PROFILE UPDATES
  useEffect(() => {
    if (currentUser) {
      fetchProfile();

      // Set up Socket.IO for real-time updates
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Listen for coin updates
      newSocket.on('coinUpdate', (data) => {
        if (data.userId === (currentUser.id || currentUser._id)) {
          console.log('Coin update received:', data);
          fetchProfile(); // Refresh profile data
        }
      });

      // Listen for leaderboard updates
      newSocket.on('leaderboardUpdate', (data) => {
        if (data.userId === (currentUser.id || currentUser._id)) {
          console.log('Leaderboard update received:', data);
          
          // Update local state immediately for better UX
          if (data.action === 'join' || data.action === 'host') {
            setProfileData(prev => ({
              ...prev,
              totalTrips: (prev.totalTrips || 0) + 1,
              ...(data.action === 'join' ? { tripsJoined: (prev.tripsJoined || 0) + 1 } : {}),
              ...(data.action === 'host' ? { tripsHosted: (prev.tripsHosted || 0) + 1 } : {})
            }));
          } else if (data.action === 'abandon' || data.action === 'abandon_participant') {
            setProfileData(prev => ({
              ...prev,
              totalTrips: Math.max(0, (prev.totalTrips || 0) - 1),
              ...(data.action === 'abandon_participant' ? { tripsJoined: Math.max(0, (prev.tripsJoined || 0) - 1) } : {}),
              ...(data.action === 'abandon' ? { tripsHosted: Math.max(0, (prev.tripsHosted || 0) - 1) } : {})
            }));
          }
          
          // Also fetch full profile data to ensure consistency
          fetchProfile();
        }
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  // 🏅 GET NOMADNOVA TITLE BASED ON TOTAL TRIPS
  const getNomadNovaTitle = (totalTrips) => {
    const trips = totalTrips || 0;

    if (trips >= 150) return { icon: <FaCrown className="text-purple-500" />, title: "🏆 NomadNova Elite", color: "from-purple-400 to-purple-600" };
    if (trips >= 100) return { icon: <FaCrown className="text-yellow-500" />, title: "👑 NomadNova", color: "from-yellow-400 to-yellow-600" };
    if (trips >= 85) return { icon: <FaGem className="text-indigo-500" />, title: "🌍 Realm Roamer", color: "from-indigo-400 to-indigo-600" };
    if (trips >= 75) return { icon: <FaMedal className="text-blue-500" />, title: "🚀 Sky Conqueror", color: "from-blue-400 to-blue-600" };
    if (trips >= 50) return { icon: <FaFire className="text-green-500" />, title: "🌟 Globe Guru", color: "from-green-400 to-green-600" };
    if (trips >= 45) return { icon: <FaFire className="text-red-500" />, title: "🔥 Border Breaker", color: "from-red-400 to-red-600" };
    if (trips >= 35) return { icon: <FaMedal className="text-orange-500" />, title: "✈️ Continental Hopper", color: "from-orange-400 to-orange-600" };
    if (trips >= 20) return { icon: <FaGem className="text-cyan-500" />, title: "🛩️ Jetsetter Junior", color: "from-cyan-400 to-cyan-600" };
    if (trips >= 15) return { icon: <FaMedal className="text-teal-500" />, title: "🗺️ Route Rookie", color: "from-teal-400 to-teal-600" };
    if (trips >= 10) return { icon: <FaFire className="text-pink-500" />, title: "🏙️ City Sampler", color: "from-pink-400 to-pink-600" };
    if (trips >= 5) return { icon: <FiStar className="text-emerald-500" />, title: "📍 Map Marker", color: "from-emerald-400 to-emerald-600" };

    return { icon: <FiStar className="text-gray-500" />, title: "🌱 New Traveler", color: "from-gray-400 to-gray-600" };
  };

  // 🏆 GET ACHIEVEMENT ICON
  const getAchievementIcon = (type) => {
    switch (type) {
      case 'first_trip': return '🎉';
      case 'social_butterfly': return '🦋';
      case 'explorer': return '🌍';
      case 'host_master': return '👑';
      case 'coin_collector': return '💰';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#f8f4e3]/90 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-[#f8a95d] rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-[#f8a95d] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-4 h-4 bg-[#f8a95d] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <span className="ml-2 text-[#5E5854]">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#f8f4e3]/90 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-[#5E5854]">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 bg-[#f8a95d] text-white px-4 py-2 rounded-lg hover:bg-[#f87c6d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const nomadTitle = getNomadNovaTitle(profileData?.totalTrips || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f8f4e3]/90 backdrop-blur-sm">
      <div className="w-full max-w-6xl rounded-xl overflow-hidden shadow-2xl border border-[#e1d9c8] bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={profileData?.avatar || currentUser?.avatar || "/assets/images/default-avatar.webp"}
                alt={profileData?.name}
                className="w-16 h-16 rounded-full border-4 border-[#f8d56b] object-cover"
                onError={(e) => {
                  e.target.src = "/assets/images/default-avatar.webp";
                }}
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] rounded-full p-2">
                {nomadTitle.icon}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{profileData?.name}</h2>
              <p className="text-[#f8d56b]">{nomadTitle.title} • {profileData?.totalTrips || 0} trips</p>
              <p className="text-white/80 text-sm">Rank #{profileData?.rank} • {profileData?.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f8d56b] rounded-full text-white hover:text-[#2c5e4a] transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Stats Overview */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Coins */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Total Coins</p>
                <p className="text-2xl font-bold">{profileData?.coins || 0}</p>
              </div>
              <GiCoinsPile className="text-3xl text-yellow-200" />
            </div>
          </div>

          {/* Trips Hosted */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Trips Hosted</p>
                <p className="text-2xl font-bold">{profileData?.tripsHosted || 0}</p>
              </div>
              <FiMapPin className="text-3xl text-blue-200" />
            </div>
          </div>

          {/* Trips Joined */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Trips Joined</p>
                <p className="text-2xl font-bold">{profileData?.tripsJoined || 0}</p>
              </div>
              <FiUsers className="text-3xl text-green-200" />
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Level Progress</p>
                <p className="text-2xl font-bold">{profileData?.levelProgress || 0}%</p>
              </div>
              <FiTrendingUp className="text-3xl text-purple-200" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Level Progress Bar */}
          <div className="bg-white rounded-xl p-6 border border-[#d1c7b7]">
            <h3 className="text-xl font-bold text-[#2c5e4a] mb-4 flex items-center">
              <FiTrendingUp className="mr-2" />
              Level Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#5E5854]">Level {profileData?.level}</span>
                <span className="text-[#5E5854]">Level {(profileData?.level || 1) + 1}</span>
              </div>
              <div className="w-full bg-[#e1d9c8] rounded-full h-4">
                <div
                  className={`bg-gradient-to-r ${nomadTitle.color} h-4 rounded-full transition-all duration-500`}
                  style={{ width: `${profileData?.levelProgress || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-[#5E5854] text-center">
                {50 - ((profileData?.coins || 0) % 50)} more coins to next level
              </p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl p-6 border border-[#d1c7b7]">
            <h3 className="text-xl font-bold text-[#2c5e4a] mb-4 flex items-center">
              <FiAward className="mr-2" />
              Achievements ({profileData?.achievements?.length || 0})
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {profileData?.achievements?.length > 0 ? (
                profileData.achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#f8f4e3] to-[#fef0c7] rounded-lg border border-[#d1c7b7]"
                  >
                    <div className="text-2xl">{getAchievementIcon(achievement.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#2c5e4a]">{achievement.title}</h4>
                      <p className="text-sm text-[#5E5854]">{achievement.description}</p>
                      <p className="text-xs text-[#f8a95d] font-medium">+{achievement.coins} coins</p>
                    </div>
                    <div className="text-xs text-[#5E5854]">
                      {new Date(achievement.earnedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#5E5854]">
                  <FiAward className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No achievements yet</p>
                  <p className="text-sm">Start hosting and joining trips to earn achievements!</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Activity Summary */}
        <div className="p-6">
          <div className="bg-white rounded-xl p-6 border border-[#d1c7b7]">
            <h3 className="text-xl font-bold text-[#2c5e4a] mb-4 flex items-center">
              <FiCalendar className="mr-2" />
              Activity Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#f8f4e3] rounded-lg">
                <div className="text-2xl font-bold text-[#2c5e4a]">{profileData?.totalTrips || 0}</div>
                <div className="text-sm text-[#5E5854]">Total Trips</div>
              </div>
              <div className="text-center p-4 bg-[#f8f4e3] rounded-lg">
                <div className="text-2xl font-bold text-[#2c5e4a]">{profileData?.experience || 0}</div>
                <div className="text-sm text-[#5E5854]">Experience Points</div>
              </div>
              <div className="text-center p-4 bg-[#f8f4e3] rounded-lg">
                <div className="text-2xl font-bold text-[#2c5e4a]">
                  {profileData?.lastActive ? new Date(profileData.lastActive).toLocaleDateString() : 'Today'}
                </div>
                <div className="text-sm text-[#5E5854]">Last Active</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

