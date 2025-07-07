import React, { useState, useEffect } from "react";
import { GiTrophy, GiCoinsPile } from "react-icons/gi";
import { FiX, FiAward, FiTrendingUp, FiUsers } from "react-icons/fi";
import { FaFire, FaCrown, FaStar } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";

// 🏆 DYNAMIC LEADERBOARD COMPONENT WITH REAL-TIME UPDATES

export default function LeaderboardPage({ onClose, currentUser = {} }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // 🔥 FETCH DYNAMIC LEADERBOARD DATA (TOP 10 ONLY)
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/leaderboard');
      if (response.data.success) {
        // 🏆 LIMIT TO TOP 10 USERS ONLY
        const top10Users = response.data.leaderboard.slice(0, 10);
        setLeaderboardData(top10Users);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 REAL-TIME LEADERBOARD UPDATES
  useEffect(() => {
    fetchLeaderboard();

    // Set up Socket.IO for real-time updates
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for leaderboard updates
    newSocket.on('leaderboardUpdate', (data) => {
      console.log('Leaderboard update received:', data);
      fetchLeaderboard(); // Refresh leaderboard data
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 🎯 GET BADGE BASED ON RANK AND STATS
  const getBadge = (user) => {
    if (user.rank === 1) return { title: "👑 Champion", color: "text-yellow-500" };
    if (user.rank === 2) return { title: "🥈 Elite", color: "text-gray-400" };
    if (user.rank === 3) return { title: "🥉 Master", color: "text-orange-500" };
    if (user.coins >= 200) return { title: "💎 Diamond", color: "text-blue-500" };
    if (user.coins >= 100) return { title: "🔥 Gold", color: "text-yellow-600" };
    if (user.coins >= 50) return { title: "⭐ Silver", color: "text-gray-500" };
    if (user.totalTrips >= 5) return { title: "🌟 Explorer", color: "text-green-500" };
    return { title: "🚀 Rising Star", color: "text-purple-500" };
  };

  //   GET RANK ICON
  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500 text-xl" />;
    if (rank === 2) return <FaStar className="text-gray-400 text-xl" />;
    if (rank === 3) return <FaFire className="text-orange-500 text-xl" />;
    return <span className="text-[#5E5854] font-bold">#{rank}</span>;
  };

  return (
    <>
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-x-12 {
          transform: rotateX(12deg);
        }
        .rotate-x-6 {
          transform: rotateX(6deg);
        }
        .rotate-y-12 {
          transform: rotateY(12deg);
        }
        .transform-gpu {
          transform-style: preserve-3d;
        }
        .border-3 {
          border-width: 3px;
        }
        .w-18 {
          width: 4.5rem;
        }
        .h-18 {
          height: 4.5rem;
        }
      `}</style>
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#2c5e4a] via-[#1a3a2a] to-[#0f2419] overflow-hidden">
        <div className="h-full flex flex-col">

        {/*   STUNNING HEADER WITH ANIMATED BACKGROUND */}
        <div className="relative bg-gradient-to-r from-[#2c5e4a] via-[#1a3a2a] to-[#2c5e4a] p-4 sm:p-6 border-b border-[#f8d56b]/20">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#f8d56b]/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-[#f8a95d]/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <div className="relative flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#f8d56b] rounded-full blur-md opacity-50 animate-pulse"></div>
                <GiTrophy className="relative text-[#f8d56b] text-3xl sm:text-4xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-cinzel">
                  Top 10 Leaderboard
                </h1>
                <p className="text-[#f8d56b] text-sm sm:text-base">
                  🌟 Top 10 Travel Champions • Live Rankings
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Stats Preview */}
              <div className="hidden lg:flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <div className="text-center">
                  <div className="text-[#f8d56b] text-xl font-bold">{leaderboardData.length}</div>
                  <div className="text-white/70 text-xs">Champions</div>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <div className="text-[#f8d56b] text-xl font-bold">
                    {leaderboardData.reduce((sum, user) => sum + (user.coins || 0), 0)}
                  </div>
                  <div className="text-white/70 text-xs">Total Coins</div>
                </div>
              </div>

              {/* Real-time indicator */}
              <div className="hidden sm:flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-sm font-bold">LIVE</span>
              </div>

              <button
                onClick={onClose}
                className="group p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-[#f8d56b]/50"
              >
                <FiX className="text-white group-hover:text-[#f8d56b] text-2xl sm:text-3xl transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* 🎯 MODERN LEADERBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5] p-4 sm:p-6">

          {/* Enhanced 3D Podium Section */}
          {!loading && !error && leaderboardData.length >= 3 && (
            <div className="mb-12">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-[#2c5e4a] mb-2 font-cinzel">
                  🏆 Champions Podium
                </h3>
                <p className="text-[#5E5854] text-lg">The Elite Travel Champions</p>
                <div className="w-24 h-1 bg-gradient-to-r from-[#f8d56b] to-[#f8a95d] mx-auto mt-3 rounded-full"></div>
              </div>

              {/* 3D Podium Container - Fixed Alignment */}
              <div className="relative perspective-1000 mb-8">
                <div className="flex justify-center items-end space-x-4 sm:space-x-6 lg:space-x-8 max-w-4xl mx-auto">

                  {/* 2nd Place - Silver */}
                  <div className="group text-center transform hover:scale-105 transition-all duration-500 flex-shrink-0">
                    <div className="relative mb-4">
                      {/* Floating Crown Effect */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="w-6 h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">2</span>
                        </div>
                      </div>

                      {/* Enhanced Podium Base */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-16 h-20 bg-gradient-to-t from-gray-500 via-gray-400 to-gray-300 rounded-t-xl shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-t-xl"></div>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">2</span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Profile Picture */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full blur-sm opacity-50 animate-pulse"></div>
                            <img
                              src={leaderboardData[1]?.avatar || "/assets/images/Alexrivera.jpeg"}
                              alt={leaderboardData[1]?.name}
                              className="relative w-16 h-16 rounded-full border-3 border-gray-300 object-cover shadow-xl ring-2 ring-white/50 group-hover:ring-gray-300/70 transition-all duration-300"
                              onError={(e) => {
                                e.target.src = "/assets/images/Alexrivera.jpeg";
                              }}
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <span className="text-white text-xs font-bold">L{leaderboardData[1]?.level || 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2">
                      <div className="text-sm font-bold text-[#2c5e4a] group-hover:text-gray-600 transition-colors truncate max-w-[120px]">
                        {leaderboardData[1]?.name}
                      </div>
                      <div className="flex items-center justify-center space-x-1 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <GiCoinsPile className="text-gray-500 text-lg" />
                        <span className="text-gray-700 font-bold text-sm">{leaderboardData[1]?.coins}</span>
                      </div>
                      <div className="text-xs text-[#5E5854] font-medium">Silver Champion</div>
                    </div>
                  </div>

                  {/* 1st Place - Gold */}
                  <div className="group text-center transform hover:scale-105 transition-all duration-500 z-10 flex-shrink-0">
                    <div className="relative mb-4">
                      {/* Floating Crown Effect */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="relative">
                          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-lg opacity-50 animate-pulse"></div>
                          <FaCrown className="relative text-yellow-400 text-2xl drop-shadow-xl" />
                        </div>
                      </div>

                      {/* Enhanced Podium Base */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-20 h-24 bg-gradient-to-t from-yellow-600 via-yellow-500 to-yellow-400 rounded-t-xl shadow-2xl">
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-t-xl"></div>
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                            <FaCrown className="text-white text-lg drop-shadow-lg" />
                          </div>
                          {/* Sparkle Effects */}
                          <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                          <div className="absolute top-3 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                          <div className="absolute bottom-5 right-2 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                        </div>

                        {/* Enhanced Profile Picture */}
                        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                            <img
                              src={leaderboardData[0]?.avatar || "/assets/images/Alexrivera.jpeg"}
                              alt={leaderboardData[0]?.name}
                              className="relative w-20 h-20 rounded-full border-4 border-yellow-400 object-cover shadow-2xl ring-3 ring-white/50 group-hover:ring-yellow-400/70 transition-all duration-300"
                              onError={(e) => {
                                e.target.src = "/assets/images/Alexrivera.jpeg";
                              }}
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <span className="text-white text-xs font-bold">L{leaderboardData[0]?.level || 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2">
                      <div className="text-base font-bold text-[#2c5e4a] group-hover:text-yellow-600 transition-colors truncate max-w-[140px]">
                        {leaderboardData[0]?.name}
                      </div>
                      <div className="flex items-center justify-center space-x-1 bg-gradient-to-r from-yellow-50 to-yellow-100 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl border border-yellow-200">
                        <GiCoinsPile className="text-yellow-500 text-xl" />
                        <span className="text-yellow-700 font-bold text-lg">{leaderboardData[0]?.coins}</span>
                      </div>
                      <div className="text-sm text-yellow-600 font-bold">👑 Gold Champion</div>
                    </div>
                  </div>

                  {/* 3rd Place - Bronze */}
                  <div className="group text-center transform hover:scale-105 transition-all duration-500 flex-shrink-0">
                    <div className="relative mb-4">
                      {/* Floating Crown Effect */}
                      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 animate-bounce">
                        <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xs">3</span>
                        </div>
                      </div>

                      {/* Enhanced Podium Base */}
                      <div className="relative flex flex-col items-center">
                        <div className="w-14 h-16 bg-gradient-to-t from-orange-600 via-orange-500 to-orange-400 rounded-t-xl shadow-xl">
                          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-t-xl"></div>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">3</span>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Profile Picture */}
                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full blur-sm opacity-50 animate-pulse"></div>
                            <img
                              src={leaderboardData[2]?.avatar || "/assets/images/Alexrivera.jpeg"}
                              alt={leaderboardData[2]?.name}
                              className="relative w-14 h-14 rounded-full border-3 border-orange-400 object-cover shadow-xl ring-2 ring-white/50 group-hover:ring-orange-400/70 transition-all duration-300"
                              onError={(e) => {
                                e.target.src = "/assets/images/Alexrivera.jpeg";
                              }}
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <span className="text-white text-xs font-bold">L{leaderboardData[2]?.level || 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-2">
                      <div className="text-sm font-bold text-[#2c5e4a] group-hover:text-orange-600 transition-colors truncate max-w-[110px]">
                        {leaderboardData[2]?.name}
                      </div>
                      <div className="flex items-center justify-center space-x-1 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <GiCoinsPile className="text-orange-500 text-lg" />
                        <span className="text-orange-700 font-bold text-sm">{leaderboardData[2]?.coins}</span>
                      </div>
                      <div className="text-xs text-[#5E5854] font-medium">Bronze Champion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Leaderboard List */}
          <div className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-[#f8a95d]/30 border-t-[#f8a95d] rounded-full animate-spin mx-auto"></div>
                    <GiTrophy className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#f8a95d] text-2xl" />
                  </div>
                  <p className="text-[#5E5854] font-medium text-lg">Loading champions...</p>
                  <p className="text-[#5E5854]/70 text-sm mt-2">Fetching real-time rankings</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                  <div className="text-red-500 text-xl font-bold mb-2">Oops! Something went wrong</div>
                  <div className="text-red-600 text-lg">{error}</div>
                  <button
                    onClick={fetchLeaderboard}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] border border-[#e1d9c8] rounded-2xl p-8 max-w-md mx-auto">
                  <GiTrophy className="text-[#f8a95d] text-4xl mx-auto mb-4" />
                  <div className="text-[#2c5e4a] text-xl font-bold mb-2">No Champions Yet!</div>
                  <div className="text-[#5E5854] text-lg">Start traveling to earn your spot on the leaderboard!</div>
                </div>
              </div>
            ) : (
              leaderboardData.map((user) => {
                const badge = getBadge(user);
                const isCurrentUser = currentUser && (user.email === currentUser.email || user.id === currentUser.id);

                return (
                  <div
                    key={user.id}
                    className={`group relative bg-white rounded-2xl p-6 shadow-xl border-2 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 ${
                      isCurrentUser
                        ? "border-[#f8a95d] bg-gradient-to-br from-[#fff8e7] via-[#fff4d9] to-[#fef0c7] ring-4 ring-[#f8a95d]/30 shadow-[#f8a95d]/20"
                        : "border-[#e1d9c8] hover:border-[#f8a95d]/60 hover:bg-gradient-to-br hover:from-white hover:to-[#fefbf3]"
                    }`}
                  >
                    {/* Enhanced Rank Badge */}
                    <div className={`absolute -top-4 -left-4 w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-2xl transition-all duration-300 group-hover:scale-110 ${
                      user.rank <= 3
                        ? user.rank === 1
                          ? "bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600"
                          : user.rank === 2
                            ? "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500"
                            : "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600"
                        : "bg-gradient-to-br from-[#2c5e4a] via-[#3a7a5a] to-[#1a3a2a]"
                    }`}>
                      {user.rank <= 3 ? (
                        <div className="text-center">
                          {getRankIcon(user.rank)}
                          <div className="text-white text-xs font-bold mt-1">#{user.rank}</div>
                        </div>
                      ) : (
                        <span className="text-white font-bold text-lg">#{user.rank}</span>
                      )}
                    </div>

                    {/* Enhanced Current User Badge */}
                    {isCurrentUser && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-pulse border-2 border-white">
                        <span className="flex items-center space-x-1">
                          <span>👤</span>
                          <span>YOU</span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-6 ml-8">
                      {/* Enhanced Avatar with Status */}
                      <div className="relative group/avatar">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#f8d56b] to-[#f8a95d] rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                        <img
                          src={user.avatar || "/assets/images/Alexrivera.jpeg"}
                          alt={user.name}
                          className="relative w-20 h-20 rounded-full border-4 border-[#f8d56b] object-cover shadow-xl ring-4 ring-white/50 group-hover/avatar:ring-[#f8d56b]/50 transition-all duration-300 group-hover/avatar:scale-110"
                          onError={(e) => {
                            e.target.src = "/assets/images/Alexrivera.jpeg";
                          }}
                        />
                        {/* Online Status Indicator */}
                        <div className="absolute top-0 right-0 w-6 h-6 bg-green-400 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                        </div>
                        {/* Level Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] rounded-full px-3 py-1 shadow-lg border-2 border-white">
                          <span className="text-white text-sm font-bold">L{user.level || 1}</span>
                        </div>
                      </div>

                      {/* Enhanced User Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-[#2c5e4a] group-hover:text-[#f8a95d] transition-colors duration-300">{user.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-lg border border-white/50 ${badge.color} bg-gradient-to-r from-[#f8d56b] to-[#f8a95d] text-white`}>
                            {badge.title}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center space-x-2 bg-[#f8f4e3] rounded-lg px-3 py-2">
                            <FiTrendingUp className="text-[#f8a95d] text-lg" />
                            <div>
                              <div className="font-bold text-[#2c5e4a]">{user.totalTrips}</div>
                              <div className="text-[#5E5854] text-xs">Total Trips</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 bg-[#f8f4e3] rounded-lg px-3 py-2">
                            <FiUsers className="text-[#f8a95d] text-lg" />
                            <div>
                              <div className="font-bold text-[#2c5e4a]">{user.tripsHosted}</div>
                              <div className="text-[#5E5854] text-xs">Hosted</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-[#5E5854]">
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            <span>Active Traveler</span>
                          </div>
                          <div className="text-xs bg-[#f0d9b5] px-2 py-1 rounded-full">
                            {user.tripsJoined} joined
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Coins Display */}
                      <div className="text-right space-y-2">
                        <div className="flex items-center space-x-2 justify-end bg-gradient-to-r from-[#fff8e7] to-[#fef0c7] rounded-xl px-4 py-3 shadow-lg border border-[#f8d56b]/30">
                          <GiCoinsPile className="text-[#f8a95d] text-3xl animate-pulse" />
                          <div>
                            <div className="text-2xl font-bold text-[#f8a95d]">{user.coins}</div>
                            <div className="text-xs text-[#5E5854] font-medium">Coins</div>
                          </div>
                        </div>

                        {/* Level Progress Bar */}
                        <div className="bg-[#f0d9b5] rounded-full p-1 shadow-inner">
                          <div className="bg-gradient-to-r from-[#f8d56b] to-[#f8a95d] h-2 rounded-full transition-all duration-500"
                               style={{width: `${Math.min(((user.coins % 50) / 50) * 100, 100)}%`}}>
                          </div>
                        </div>
                        <div className="text-xs text-[#5E5854] text-center">
                          {50 - (user.coins % 50)} coins to next level
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#f8a95d]/5 to-[#f87c6d]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                );
              })
            )}
          </div>

          {/* 🌟 ENHANCED FOOTER */}
          <div className="relative bg-gradient-to-r from-[#2c5e4a] via-[#1a3a2a] to-[#2c5e4a] border-t border-[#f8d56b]/20 p-6 mt-8 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-2 left-4 w-16 h-16 bg-[#f8d56b] rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-2 right-4 w-12 h-12 bg-[#f8a95d] rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            <div className="relative text-center space-y-4">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  <GiTrophy className="text-[#f8d56b] text-2xl" />
                  <span className="text-[#f8d56b] text-lg font-bold">Elite Champions</span>
                </div>
                <div className="w-px h-6 bg-[#f8d56b]/30"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-sm font-medium">Real-time Updates</span>
                </div>
              </div>

              <p className="text-[#f8d56b] text-lg font-semibold">
                🌟 © {new Date().getFullYear()} NomadNova • Connecting Travelers Worldwide
              </p>
              <div className="flex items-center justify-center space-x-6 text-white/70 text-sm">
                <span>Top 10 Rankings</span>
                <span>•</span>
                <span>Live Updates</span>
                <span>•</span>
                <span>Global Community</span>
              </div>

              {/* Achievement Stats */}
              <div className="flex items-center justify-center space-x-8 mt-4 pt-4 border-t border-[#f8d56b]/20">
                <div className="text-center">
                  <div className="text-[#f8d56b] text-xl font-bold">{leaderboardData.length}</div>
                  <div className="text-white/60 text-xs">Active Champions</div>
                </div>
                <div className="text-center">
                  <div className="text-[#f8d56b] text-xl font-bold">
                    {leaderboardData.reduce((sum, user) => sum + (user.totalTrips || 0), 0)}
                  </div>
                  <div className="text-white/60 text-xs">Total Adventures</div>
                </div>
                <div className="text-center">
                  <div className="text-[#f8d56b] text-xl font-bold">
                    {leaderboardData.reduce((sum, user) => sum + (user.coins || 0), 0)}
                  </div>
                  <div className="text-white/60 text-xs">Coins Earned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}