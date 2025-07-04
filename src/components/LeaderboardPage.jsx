import React, { useState, useEffect } from "react";
import { GiTrophy, GiCoinsPile } from "react-icons/gi";
import { FiX, FiAward, FiTrendingUp } from "react-icons/fi";
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

  // � GET RANK ICON
  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="text-yellow-500 text-xl" />;
    if (rank === 2) return <FaStar className="text-gray-400 text-xl" />;
    if (rank === 3) return <FaFire className="text-orange-500 text-xl" />;
    return <span className="text-[#5E5854] font-bold">#{rank}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#2c5e4a] via-[#1a3a2a] to-[#0f2419] overflow-hidden">
      <div className="h-full flex flex-col">

        {/* � STUNNING HEADER WITH ANIMATED BACKGROUND */}
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

            <div className="flex items-center space-x-3">
              {/* Real-time indicator */}
              <div className="hidden sm:flex items-center space-x-2 bg-[#f8d56b]/20 px-3 py-1 rounded-full border border-[#f8d56b]/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-[#f8d56b] text-xs font-medium">LIVE</span>
              </div>

              <button
                onClick={onClose}
                className="p-2 sm:p-3 rounded-full bg-[#f8d56b]/20 hover:bg-[#f8d56b]/30 transition-all duration-300 group"
              >
                <FiX className="text-white group-hover:text-[#f8d56b] text-xl sm:text-2xl transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* 🎯 MODERN LEADERBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5] p-4 sm:p-6">

          {/* Top 3 Podium Section */}
          {!loading && !error && leaderboardData.length >= 3 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-[#2c5e4a] mb-6 text-center font-cinzel">
                🏆 Champions Podium
              </h3>
              <div className="flex justify-center items-end space-x-4 mb-8">
                {/* 2nd Place */}
                <div className="text-center transform hover:scale-105 transition-all duration-300">
                  <div className="relative mb-3">
                    <div className="w-16 h-20 bg-gradient-to-t from-gray-400 to-gray-300 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-white font-bold text-lg">2</span>
                    </div>
                    <img
                      src={leaderboardData[1]?.avatar || "/assets/images/Alexrivera.jpeg"}
                      alt={leaderboardData[1]?.name}
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full border-4 border-gray-300 object-cover"
                    />
                  </div>
                  <div className="text-sm font-medium text-[#2c5e4a]">{leaderboardData[1]?.name}</div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <GiCoinsPile className="text-gray-400 text-sm" />
                    <span className="text-gray-600 font-bold text-sm">{leaderboardData[1]?.coins}</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center transform hover:scale-105 transition-all duration-300">
                  <div className="relative mb-3">
                    <div className="w-20 h-24 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-end justify-center pb-2 shadow-lg">
                      <FaCrown className="text-white text-xl" />
                    </div>
                    <img
                      src={leaderboardData[0]?.avatar || "/assets/images/Alexrivera.jpeg"}
                      alt={leaderboardData[0]?.name}
                      className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full border-4 border-yellow-400 object-cover shadow-lg"
                    />
                  </div>
                  <div className="text-base font-bold text-[#2c5e4a]">{leaderboardData[0]?.name}</div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <GiCoinsPile className="text-yellow-500 text-lg" />
                    <span className="text-yellow-600 font-bold text-lg">{leaderboardData[0]?.coins}</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center transform hover:scale-105 transition-all duration-300">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg flex items-end justify-center pb-2">
                      <span className="text-white font-bold text-lg">3</span>
                    </div>
                    <img
                      src={leaderboardData[2]?.avatar || "/assets/images/Alexrivera.jpeg"}
                      alt={leaderboardData[2]?.name}
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full border-4 border-orange-400 object-cover"
                    />
                  </div>
                  <div className="text-sm font-medium text-[#2c5e4a]">{leaderboardData[2]?.name}</div>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <GiCoinsPile className="text-orange-500 text-sm" />
                    <span className="text-orange-600 font-bold text-sm">{leaderboardData[2]?.coins}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-4 h-4 bg-[#f8a95d] rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-[#f8a95d] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-4 h-4 bg-[#f8a95d] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-[#5E5854] font-medium">Loading champions...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-lg font-medium">{error}</div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-[#5E5854] text-lg">No top champions yet. Start traveling to earn your spot!</div>
              </div>
            ) : (
              leaderboardData.map((user) => {
                const badge = getBadge(user);
                const isCurrentUser = currentUser && (user.email === currentUser.email || user.id === currentUser.id);

                return (
                  <div
                    key={user.id}
                    className={`relative bg-white rounded-xl p-4 shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                      isCurrentUser
                        ? "border-[#f8a95d] bg-gradient-to-r from-[#fff4d9] to-[#fef0c7] ring-2 ring-[#f8a95d]/50"
                        : "border-[#e1d9c8] hover:border-[#f8a95d]/50"
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-[#2c5e4a] to-[#1a3a2a] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      {user.rank <= 3 ? (
                        getRankIcon(user.rank)
                      ) : (
                        <span className="text-white font-bold text-sm">#{user.rank}</span>
                      )}
                    </div>

                    {/* Current User Badge */}
                    {isCurrentUser && (
                      <div className="absolute -top-2 -right-2 bg-[#f8a95d] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        YOU
                      </div>
                    )}

                    <div className="flex items-center space-x-4 ml-6">
                      {/* Avatar */}
                      <div className="relative">
                        <img
                          src={user.avatar || "/assets/images/Alexrivera.jpeg"}
                          alt={user.name}
                          className="w-16 h-16 rounded-full border-4 border-[#f8d56b] object-cover shadow-md"
                          onError={(e) => {
                            e.target.src = "/assets/images/Alexrivera.jpeg";
                          }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] rounded-full px-2 py-1">
                          <span className="text-white text-xs font-bold">L{user.level}</span>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-bold text-[#2c5e4a]">{user.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color} bg-gradient-to-r from-[#f8d56b] to-[#f8a95d] text-white`}>
                            {badge.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-[#5E5854]">
                          <div className="flex items-center space-x-1">
                            <FiTrendingUp className="text-[#f8a95d]" />
                            <span>{user.totalTrips} trips</span>
                          </div>
                          <div className="text-xs">
                            {user.tripsHosted} hosted • {user.tripsJoined} joined
                          </div>
                        </div>
                      </div>

                      {/* Coins */}
                      <div className="text-right">
                        <div className="flex items-center space-x-1 justify-end mb-1">
                          <GiCoinsPile className="text-[#f8a95d] text-2xl" />
                          <span className="text-2xl font-bold text-[#f8a95d]">{user.coins}</span>
                        </div>
                        <div className="text-xs text-[#5E5854]">
                          Since {new Date(user.lastActive).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 🌟 STUNNING FOOTER */}
          <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] border-t border-[#f8d56b]/20 p-4 mt-6">
            <div className="text-center">
              <p className="text-[#f8d56b] text-sm font-medium">
                🌟 © {new Date().getFullYear()} NomadNova • Connecting Travelers Worldwide
              </p>
              <p className="text-white/60 text-xs mt-1">
                Top 10 real-time rankings • Updated every second
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}