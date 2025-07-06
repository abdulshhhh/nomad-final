import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  FiUser, FiMapPin, FiCalendar, FiStar, FiGlobe, FiEdit2, FiMessageSquare, 
  FiShare, FiX, FiPlus, FiCheck, FiAward, FiCamera, FiHeart, FiFlag, 
  FiClock, FiBookmark, FiUsers, FiNavigation, FiMail, FiPhone, FiVideo, FiMap
} from 'react-icons/fi';
import { FaPlaneDeparture } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProfileEdit from './ProfileEdit';
import TripMemories from './TripMemories';
import OTPVerification from './OTPVerification';
import MemoryUploadModal from './MemoryUploadModal';
import Memories from './Memories';
import MemoryModal from './MemoryModal';
import { FiTrash2 } from 'react-icons/fi';
import { BACKEND_URL } from '../config';

export default function Profile({ currentUser, onClose, onMessage }) {
  console.log("Profile component rendering with currentUser:", currentUser);
  
  const location = useLocation();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showTripMemories, setShowTripMemories] = useState(false);
  const [selectedTripType, setSelectedTripType] = useState('');
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otpType, setOTPType] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [joinedTripsData, setJoinedTripsData] = useState([]);
  const [profileData, setProfileData] = useState({
    fullName: '',
    location: '',
    bio: '',
    avatar: '',
    phone: '',
    email: '',
    travelCategories: [],
    languages: [],
    memories: [],
    trips: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Add these state variables at the beginning of the component
  const [userMemories, setUserMemories] = useState([]);
  const [memoryCounts, setMemoryCounts] = useState({
    photos: 0,
    countries: 0,
    cities: 0
  });
  const [showMemoryUploadModal, setShowMemoryUploadModal] = useState(false);
  const [selectedMemoryFiles, setSelectedMemoryFiles] = useState([]);
  const [randomMemories, setRandomMemories] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [featuredMemory, setFeaturedMemory] = useState(null);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderTimerRef = useRef(null);
  const sliderIntervalRef = useRef(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Add this state variable
  const [userStats, setUserStats] = useState({
    tripsHosted: 0,
    tripsJoined: 0
  });

  // Add this function to fetch user stats from the leaderboard API
  const fetchUserStats = async () => {
    try {
      const userId = currentUser?.id || currentUser?._id;
      if (!userId) return;
      
      console.log('Fetching user stats from leaderboard for user:', userId);
      
      // Use the leaderboard profile endpoint which has all the stats
      const response = await fetch(`/api/leaderboard/profile/${userId}`);
      const data = await response.json();
      
      console.log('Leaderboard profile data:', data);
      
      if (data.success && data.profile) {
        setUserStats({
          tripsHosted: data.profile.tripsHosted || 0,
          tripsJoined: data.profile.tripsJoined || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // Call this function when the component mounts
  useEffect(() => {
    if (currentUser) {
      fetchUserStats();
    }
  }, [currentUser]);

  // Add this function to handle the automatic rotation
  const startSliderInterval = () => {
    // Clear any existing interval first
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current);
    }
    
    // Only set up the interval if we have multiple memories and slider isn't paused
    if (userMemories && userMemories.length > 1) {
      sliderIntervalRef.current = setInterval(() => {
        if (!isPaused) {
          setCurrentMemoryIndex(prevIndex => (prevIndex + 1) % userMemories.length);
        }
      }, 4000); // 4 seconds interval
    }
    
    return () => {
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current);
      }
    };
  };

  // Set up the slider interval
  useEffect(() => {
    const cleanup = startSliderInterval();
    return cleanup;
  }, [userMemories, isPaused]);

  console.log("Initial state set with isLoading:", isLoading);
  
  // Add a useRef to track if we've already fetched data
  const dataFetchedRef = useRef(false);

  // Add this function to handle avatar display
  const getAvatarUrl = () => {
    // Always return a default image to stop the blinking
    return "/assets/images/default-avatar.jpg";
  };

  // Add this to debug the avatar URL
  useEffect(() => {
    if (profileData) {
      console.log("Avatar URL:", getAvatarUrl(profileData));
    }
  }, [profileData]);

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true); // Set loading to true before fetch
        console.log("Fetching profile data for user:", currentUser?.id);
        
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${BACKEND_URL}/api/profile/${currentUser.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        console.log("Profile data received:", response.data);
        
        if (response.data.success && response.data.profile) {
          // Log the avatar data specifically
          console.log("Avatar from API:", 
            response.data.profile.avatar ? 
            `[Base64 data: ${response.data.profile.avatar.substring(0, 30)}...]` : 
            "No avatar");
          
          setProfileData(response.data.profile);
        } else {
          throw new Error("Invalid profile data received");
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        // Fallback to currentUser if available
        if (currentUser) {
          console.log("Using fallback profile data from currentUser");
          setProfileData({
            ...currentUser,
            fullName: currentUser.fullName || "New User",
            bio: currentUser.bio || "",
            location: currentUser?.location || "",
            phone: currentUser?.phone || "",
            travelCategories: currentUser?.travelCategories || [],
            languages: currentUser?.languages || [],
            avatar: currentUser?.avatar || "/assets/images/default-avatar.jpg",
          });
        }
      } finally {
        setIsLoading(false); // Always set loading to false when done
      }
    };

    if (currentUser && currentUser.id) {
      fetchProfileData();
    } else {
      setIsLoading(false); // Set loading to false if no user to fetch
    }
  }, [currentUser, BACKEND_URL]);

  // Fetch joined trips from backend
  useEffect(() => {
    if (currentUser && currentUser.id) {
      const token = localStorage.getItem('authToken');
      axios.get(`/api/joined-trips/${currentUser.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
        .then(res => setJoinedTripsData(Array.isArray(res.data) ? res.data : []))
        .catch(err => {
          setJoinedTripsData([]);
          console.error('Failed to fetch joined trips', err);
        });
    }
  }, [currentUser]);

  // Add this useEffect to fetch memories when the profile loads
  useEffect(() => {
    const fetchUserMemories = async () => {
      if (currentUser && currentUser.id) {
        try {
          setIsLoadingMemory(true);
          console.log("Fetching memories for user:", currentUser.id);
          const token = localStorage.getItem('authToken');
          const response = await axios.get(`${BACKEND_URL}/api/memories/${currentUser.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log("Memories response:", response.data);
          
          if (response.data.success) {
            setUserMemories(response.data.memories);
            
            // Set a featured memory if we have any
            if (response.data.memories && response.data.memories.length > 0) {
              // Pick a random memory to feature
              const randomIndex = Math.floor(Math.random() * response.data.memories.length);
              const selectedMemory = response.data.memories[randomIndex];
              console.log("Selected featured memory:", selectedMemory);
              setFeaturedMemory(selectedMemory);
            }
            
            // Update memory counts
            const countries = new Set();
            const cities = new Set();
            
            response.data.memories.forEach(memory => {
              if (memory.location) {
                const parts = memory.location.split(',').map(part => part.trim());
                if (parts.length > 1) {
                  countries.add(parts[parts.length - 1]); // Country
                  cities.add(parts[0]); // City
                } else if (parts.length === 1) {
                  // If only one part, assume it's a country
                  countries.add(parts[0]);
                }
              }
            });
            
            setMemoryCounts(prev => ({
              photos: response.data.memories.length,
              countries: countries.size,
              cities: cities.size,
              trips: joinedTripsData.length // Use the joined trips data
            }));
          }
        } catch (err) {
          console.error('Failed to fetch user memories:', err);
        } finally {
          setIsLoadingMemory(false);
        }
      }
    };

    fetchUserMemories();
  }, [currentUser, joinedTripsData, refreshTrigger]);

  // Fix the close button functionality
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      // If onClose is not provided, navigate back
      if (typeof navigate === 'function') {
        navigate('/dashboard');
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  // Ensure we have a valid avatar URL
  useEffect(() => {
    if (profileData && !profileData.avatar && currentUser && currentUser.avatar) {
      setProfileData(prev => ({
        ...prev,
        avatar: currentUser.avatar
      }));
    }
  }, [profileData, currentUser]);

  // Debug the avatar URL
  useEffect(() => {
    console.log("Avatar URL:", profileData?.avatar);
  }, [profileData]);

  // Add this useEffect to debug the user IDs
  useEffect(() => {
    if (currentUser && profileData) {
      console.log("Current user ID:", currentUser.id);
      console.log("Profile user ID:", profileData.id);
      console.log("Profile userId:", profileData.userId);
      console.log("Should show edit button:", 
        currentUser.id === profileData.id || 
        currentUser.id === profileData.userId ||
        true // Force it to show for debugging
      );
    }
  }, [currentUser, profileData]);

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleViewTripMemories = (type) => {
    console.log(`Viewing ${type} trips for user:`, currentUser);
    setSelectedTripType(type);
    setShowTripMemories(true);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profileData.fullName}'s Profile - NomadNova`,
        text: `Check out ${profileData.fullName}'s travel profile on NomadNova!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const MAX_IMAGES = 10;

  const handleUploadMemories = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (files.length > MAX_IMAGES) {
        alert(`You can only upload a maximum of ${MAX_IMAGES} images at once.`);
        // Reset the file input
        e.target.value = '';
        return;
      }
      setShowMemoryUploadModal(true);
      setSelectedMemoryFiles(files);
    }
  };

  // Handle memory upload completion
  const handleMemoryUploadComplete = (memoryData) => {
    console.log("Memory upload complete:", memoryData);
    
    // Create new memory objects from the uploaded files
    const newMemories = memoryData.files.map(file => ({
      _id: Date.now() + Math.random().toString(36).substring(7), // Temporary ID
      imageUrl: URL.createObjectURL(file),
      description: memoryData.description,
      location: memoryData.location,
      createdAt: new Date().toISOString(),
      userId: currentUser.id
    }));
    
    // Add new memories to the state
    setUserMemories(prev => [...newMemories, ...prev]);
    
    // Update counts
    setMemoryCounts(prev => ({
      photos: prev.photos + newMemories.length,
      countries: memoryData.location && memoryData.location.includes(',') 
        ? prev.countries + 1 
        : prev.countries,
      cities: memoryData.location ? prev.cities + 1 : prev.cities
    }));
    
    // Refresh memories from the server to get the actual data
    setTimeout(() => {
      fetchUserMemories();
    }, 1000);
  };

  const handleProfileUpdated = (updatedProfile) => {
    console.log("Profile updated:", updatedProfile);
    
    // Make sure we're properly handling the avatar from the updated profile
    const updatedData = {
      ...profileData,
      ...updatedProfile,
      // Ensure avatar is properly updated
      avatar: updatedProfile.avatar || profileData.avatar
    };
    console.log("Updated profile data:", updatedData);
    setProfileData(updatedData);
    
    // Update the user data in localStorage to persist across reloads
    if (currentUser && currentUser.id) {
      const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...updatedData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    setShowEditProfile(false);
    
    // Force a refresh of the profile data from the server
    const token = localStorage.getItem('authToken');
    if (token && currentUser && currentUser.id) {
      axios.get(`${BACKEND_URL}/api/profile/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          console.log("Refreshed profile data:", response.data);
          setProfileData(response.data);
          
          // Update localStorage with the fresh data
          const refreshedUser = { ...JSON.parse(localStorage.getItem('user')), ...response.data };
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        })
        .catch(err => console.error('Failed to refresh profile data:', err));
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiUser className="w-5 h-5" /> },
    { id: 'trips', label: 'Trips', icon: <FaPlaneDeparture className="w-5 h-5" /> },
    { id: 'memories', label: 'Memories', icon: <FiCamera className="w-5 h-5" /> },
    { id: 'reviews', label: 'Reviews', icon: <FiStar className="w-5 h-5" /> }
  ];

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Add a loading indicator
  return (
    <>
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-60 flex items-center justify-center p-2 sm:p-4">
        {/* Main container with dashboard-matching background */}
        <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden mx-auto">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#2c5e4a] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#2c5e4a] font-medium">Loading profile...</p>
              </div>
            </div>
          ) : (
            // Rest of your component
            <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
              {/* Header with Instagram-like layout */}
              <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-2">
                <div className="flex justify-between items-center">
                  {/* Title instead of close button on left */}
                  <h3 className="text-white font-semibold text-sm">Profile</h3>
                  
                  <div className="flex items-center gap-3">
                    {/* Share button */}
                    <button
                      onClick={handleShare}
                      className="text-gray-300 hover:text-white transition-colors flex flex-col items-center"
                      title="Share Profile"
                    >
                      <FiShare className="w-4 h-4 mb-0.5" />
                      <span className="text-xs">Share</span>
                    </button>
                    
                    {/* Close button */}
                    <button
                      onClick={handleClose}
                      className="text-white bg-yellow-500/30 hover:bg-yellow-500/60 transition-colors -mt-2 p-1 rounded-full"
                      title="Close"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                {/* Profile info with dynamic image */}
                <div className="flex items-center mt-2">
                  <div className="relative mr-4">
                    {profileData && profileData.avatar && profileData.avatar.startsWith('data:image') ? (
                      <img
                        src={profileData.avatar}
                        alt={profileData?.fullName || "User"}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                        onError={(e) => {
                          console.log("Image load error, using fallback");
                          e.target.onerror = null;
                          e.target.src = "/assets/images/default-avatar.jpg";
                        }}
                      />
                    ) : (
                      <img
                        src="/assets/images/default-avatar.jpg"
                        alt={profileData?.fullName || "User"}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    )}
                    {/* Edit button */}
                    {currentUser && (
                      <button
                        onClick={handleEditProfile}
                        className="absolute -bottom-1 -right-1 bg-white hover:bg-gray-100 rounded-full p-1 shadow-md transition-colors"
                        title="Edit Profile"
                      >
                        <FiEdit2 className="w-3 h-3 text-gray-700" />
                      </button>
                    )}
                  </div>
                  
                  {/* Name and bio next to profile picture */}
                  <div>
                    <h2 className="text-base font-cinzel font-bold text-white mb-1">{profileData.fullName}</h2>
                    <div className="flex items-center text-gray-200 text-xs mb-2">
                      <FiMapPin className="mr-1 w-3 h-3" />
                      <span>{profileData.location}</span>
                    </div>
                    
                    {/* Travel stats - with opacity adjustments */}
                    <div className="flex space-x-3 mt-0.5 mb-1">
                      <div className="bg-gradient-to-r from-yellow-300/30 to-yellow-500/20 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center border border-yellow-300/20">
                        <FaPlaneDeparture className="mr-1 w-3 h-3 text-yellow-300" />
                        <span className="text-white text-xs font-semibold">{userStats.tripsHosted + userStats.tripsJoined} trips</span>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-300/30 to-yellow-500/20 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center border border-yellow-300/20">
                        <FiGlobe className="mr-1 w-3 h-3 text-yellow-300" />
                        <span className="text-white text-xs font-semibold">{profileData.totalCountries || memoryCounts.countries || 0} countries</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Follow/Message buttons - more compact */}
                <div className="flex mt-3 space-x-2">
                  {currentUser.id === profileData.id ? (
                    <div className="text-gray-200 text-xs flex items-center">
                      <FiCalendar className="mr-1 w-3 h-3" />
                      <span>Member since {formatMemberSince(profileData.createdAt || profileData.joinedDate)}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Main action buttons */}
              <div className="flex flex-wrap justify-between px-3 sm:px-4 py-2 bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a]">
                <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
                  {/* Removed follow/message buttons */}
                </div>
              </div>

              {/* Navigation Tabs - Instagram style */}
              <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] border-t border-gray-700/30">
                <div className="flex justify-around">
                  {tabs && tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-3 font-medium text-xs transition-colors relative flex-1 ${
                        activeTab === tab.id
                          ? 'text-[#f8d56b]'
                          : 'text-gray-200 hover:text-[#f8d56b]'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        {tab.icon}
                        <span className="mt-1">{tab.label}</span>
                      </div>
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f8d56b]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
                {activeTab === 'overview' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* About Section */}
                    <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-[#204231]">
                      <h3 className="text-base sm:text-lg font-cinzel font-semibold text-[#204231] mb-2 sm:mb-3">About</h3>
                      <p className="text-green-900 leading-relaxed text-sm sm:text-base">{profileData.bio}</p>
                    </div>

                    {/* Travel Interests and Memory Highlights side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Travel Categories */}
                      <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-[#204231]">
                        <h3 className="text-base sm:text-lg font-cinzel font-semibold text-[#204231] mb-2 sm:mb-3">Travel Interests</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData?.travelCategories?.map((category, index) => (
                            <span
                              key={index}
                              className="px-2 sm:px-3 py-1 bg-yellow-100 text-[#204231] rounded-full text-xs sm:text-sm font-medium border border-[#204231]"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Memory Highlights - Auto-rotating Slider with smaller container */}
                      <div className="bg-yellow-50 p-4 sm:p-5 rounded-lg border border-[#204231] relative z-0">
                        <h3 className="text-base sm:text-lg font-cinzel font-semibold text-[#204231] mb-2">Memory Highlights</h3>
                        
                        {isLoadingMemory ? (
                          <div className="flex items-center justify-center h-36">
                            <div className="animate-pulse flex space-x-4">
                              <div className="rounded-full bg-slate-200 h-8 w-8"></div>
                              <div className="flex-1 space-y-4 py-1">
                                <div className="h-2 bg-slate-200 rounded"></div>
                                <div className="space-y-2">
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : userMemories && userMemories.length > 0 ? (
                          <div 
                            className="relative h-40 sm:h-48 rounded-lg overflow-hidden z-0"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            onTouchStart={() => setIsPaused(true)}
                            onTouchEnd={() => {
                              // Add a small delay before resuming on mobile
                              setTimeout(() => setIsPaused(false), 1000);
                            }}
                          >
                            {userMemories.map((memory, index) => (
                              <div
                                key={memory._id || index}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                                  index === currentMemoryIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                }`}
                              >
                                <img
                                  src={memory.images?.[0] || memory.imageUrl || '/assets/images/paris.webp'}
                                  alt="Travel memory"
                                  className="w-full h-full object-cover transform scale-105 transition-transform duration-10000 ease-in-out"
                                  style={{ transform: index === currentMemoryIndex ? 'scale(1.05)' : 'scale(1)' }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/images/paris.webp';
                                  }}
                                />
                                
                                {/* Add delete button */}
                                {index === currentMemoryIndex && (
                                  <button 
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMemory(memory._id);
                                    }}
                                    title="Delete memory"
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                            
                            {/* Slider dots */}
                            {userMemories.length > 1 && (
                              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20">
                                {userMemories.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => {
                                      setCurrentMemoryIndex(index);
                                      // Pause briefly when manually selecting a slide
                                      setIsPaused(true);
                                      setTimeout(() => setIsPaused(false), 2000);
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                      index === currentMemoryIndex 
                                        ? 'bg-[#f8a95d] w-3' 
                                        : 'bg-white/70'
                                    }`}
                                    aria-label={`View memory ${index + 1}`}
                                  />
                                ))}
                              </div>
                            )}
                            
                            {/* Pause indicator - only show when paused */}
                            {isPaused && userMemories.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                Paused
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <FiCamera className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm">No memories yet. Start capturing your travel moments!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'trips' && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Trip Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div
                        onClick={() => handleViewTripMemories('posted')}
                        className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-[#204231] cursor-pointer hover:border-[#204231] transition-colors"
                      >
                        <h3 className="text-base sm:text-lg font-cinzel font-semibold text-[#204231] mb-2">Trips Posted</h3>
                        <p className="text-xl sm:text-2xl font-cinzel font-bold text-yellow-500 mb-2 trips-posted-count">
                          {userStats.tripsHosted}
                        </p>
                        <p className="text-[#204231] text-xs sm:text-sm">Click to view details and memories</p>
                      </div>

                      <div
                        onClick={() => handleViewTripMemories('joined')}
                        className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-[#204231] cursor-pointer hover:border-[#204231] transition-colors"
                      >
                        <h3 className="text-base sm:text-lg font-cinzel font-semibold text-[#204231] mb-2">Trips Joined</h3>
                        <p className="text-xl sm:text-2xl font-cinzel font-bold text-yellow-500 mb-2 trips-joined-count">
                          {userStats.tripsJoined}
                        </p>
                        <p className="text-[#204231] text-xs sm:text-sm">Click to view details and memories</p>
                      </div>
                    </div>

                    {/* Upcoming Trips - fetched from backend */}
                    <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-[#204231]">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base sm:text-lg font-cinzel font-semibold text-gray-800">Upcoming Trips</h3>
                        <button className="text-yellow-500 text-xs sm:text-sm font-medium">View All</button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {(Array.isArray(joinedTripsData) && joinedTripsData.length > 0) ? joinedTripsData.map((trip) => (
                          <div key={trip._id} className="bg-yellow-100 rounded-lg p-3 sm:p-4 border border-[#204231] hover:shadow-md transition-shadow">
                            <div className="relative h-32 mb-2 rounded-lg overflow-hidden">
                              <img
                                src={trip.image || trip.coverImage || "/assets/images/default-trip.jpeg"}
                                alt={trip.tripTitle || trip.destination}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log('Image failed to load:', e.target.src);
                                  e.target.onerror = null; // Prevent infinite loop
                                  e.target.src = "/assets/images/default-trip.jpeg";
                                }}
                              />
                            </div>
                            <h4 className="font-cinzel font-semibold text-gray-800 mb-1 text-sm sm:text-base">{trip.tripTitle || trip.destination}</h4>
                            <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">{trip.destination}</p>
                            <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">{trip.date || `${new Date(trip.fromDate).toLocaleDateString()} - ${new Date(trip.toDate).toLocaleDateString()}`}</p>
                            <div className="flex justify-between items-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                Member
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                Confirmed
                              </span>
                            </div>
                          </div>
                        )) : (
                          <p className="text-gray-500 text-sm col-span-3">No upcoming trips yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'memories' && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 p-4 sm:p-6 rounded-lg border border-[#204231]">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base sm:text-lg font-cinzel font-semibold text-[#204231]">
                          My Travel Memories
                        </h3>
                        <button
                          onClick={() => document.getElementById('memory-upload').click()}
                          className="bg-[#2c5e4a] hover:bg-[#204231] text-white text-xs px-3 py-1.5 rounded-full flex items-center"
                        >
                          <FiPlus className="mr-1 w-3 h-3" /> Add Memory
                        </button>
                        <input
                          id="memory-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleUploadMemories}
                          className="hidden"
                        />
                      </div>
                      
                      {userMemories.length === 0 ? (
                        <div className="text-center py-8">
                          <FiCamera className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                          <p className="text-gray-500">No memories yet. Start capturing your travel moments!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {userMemories.map((memory, index) => {
                            // Make sure memory._id is a string
                            const memoryId = memory._id ? String(memory._id) : `temp-${index}`;
                            
                            return (
                              <div
                                key={memoryId}
                                className="relative aspect-square rounded-md overflow-hidden shadow-sm cursor-pointer transition-shadow"
                              >
                                <img
                                  src={memory.images?.[0] || memory.imageUrl || '/placeholder-image.jpg'}
                                  alt={memory.description || "Travel memory"}
                                  className="w-full h-full object-cover"
                                  onClick={() => {
                                    const memoryId = memory._id ? String(memory._id) : null;
                                    if (!memoryId) {
                                      console.error("Invalid memory ID:", memory);
                                      return;
                                    }
                                    setSelectedMemory(memory);
                                    setShowMemoryModal(true);
                                  }}
                                  onError={(e) => {
                                    console.error("Failed to load memory image:", 
                                      memory.images?.[0] || memory.imageUrl || 'No image URL');
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder-image.jpg';
                                  }}
                                />
                                <div className="absolute top-1 right-1 flex gap-1">
                                  {memory.pinned && (
                                    <div className="text-yellow-400">
                                      <FiStar className="w-3 h-3 fill-current" />
                                    </div>
                                  )}
                                  <button 
                                    className="bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMemory(memory._id);
                                    }}
                                    title="Delete memory"
                                  >
                                    <FiTrash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                    {/* Stats Cards with Card Deck Effect */}
                    <div className="grid grid-cols-3 gap-6 mt-6">
                      {/* Photos Card */}
                      <div className="card-container">
                        <div className="stat-card">
                          <div className="card-image" style={{backgroundImage: "url('/assets/images/paris.webp')"}}></div>
                        </div>
                        <div className="card-label">Photos</div>
                        <div className="card-count">{memoryCounts.photos}</div>
                        <div className="card-deck">
                          <div className="mini-card mini-card-1" style={{backgroundImage: "url('/assets/images/paris.webp')"}}></div>
                          <div className="mini-card mini-card-2" style={{backgroundImage: "url('/assets/images/paris.webp')"}}></div>
                          <div className="mini-card mini-card-3" style={{backgroundImage: "url('/assets/images/paris.webp')"}}></div>
                        </div>
                      </div>
                      
                      {/* Countries Card */}
                      <div className="card-container">
                        <div className="stat-card">
                          <div className="card-image" style={{backgroundImage: "url('/assets/images/dubai.jpeg')"}}></div>
                        </div>
                        <div className="card-label">Countries</div>
                        <div className="card-count">{memoryCounts.countries}</div>
                        <div className="card-deck">
                          <div className="mini-card mini-card-1" style={{backgroundImage: "url('/assets/images/dubai.jpeg')"}}></div>
                          <div className="mini-card mini-card-2" style={{backgroundImage: "url('/assets/images/dubai.jpeg')"}}></div>
                          <div className="mini-card mini-card-3" style={{backgroundImage: "url('/assets/images/dubai.jpeg')"}}></div>
                        </div>
                      </div>
                      
                      {/* Trips Card */}
                      <div className="card-container">
                        <div className="stat-card">
                          <div className="card-image" style={{backgroundImage: "url('/assets/images/london.jpeg')"}}></div>
                        </div>
                        <div className="card-label">Trips</div>
                        <div className="card-count">{joinedTripsData.length}</div>
                        <div className="card-deck">
                          <div className="mini-card mini-card-1" style={{backgroundImage: "url('/assets/images/london.jpeg')"}}></div>
                          <div className="mini-card mini-card-2" style={{backgroundImage: "url('/assets/images/london.jpeg')"}}></div>
                          <div className="mini-card mini-card-3" style={{backgroundImage: "url('/assets/images/london.jpeg')"}}></div>
                        </div>
                      </div>
                    </div>

                    {/* Inline CSS for the card effect */}
                    <style>
                    {`
                      .card-container {
                        position: relative;
                        height: 120px;
                        perspective: 1000px;
                      }
                      
                      .stat-card {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        overflow: hidden;
                        transition: transform 0.3s ease;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        z-index: 1;
                      }
                      
                      .card-container:hover .stat-card {
                        transform: translateY(-5px);
                      }
                      
                      .card-label {
                        position: absolute;
                        top: 10px;
                        left: 10px;
                        font-size: 12px;
                        font-weight: 600;
                        color: white;
                        background-color: rgba(0, 0, 0, 0.6);
                        padding: 2px 8px;
                        border-radius: 10px;
                        z-index: 20;
                        pointer-events: none;
                      }
                      
                      .card-count {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-size: 36px;
                        font-weight: 700;
                        color: white;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                        z-index: 20;
                        transition: transform 0.3s ease;
                        pointer-events: none;
                      }
                      
                      .card-container:hover .card-count {
                        transform: translate(-50%, -50%) scale(1.1);
                        text-shadow: 0 0 10px rgba(255, 255, 255, 0.7), 0 2px 4px rgba(0, 0, 0, 0.5);
                      }
                      
                      .card-image {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background-size: cover;
                        background-position: center;
                      }
                      
                      .card-image::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
                      }
                      
                      .card-deck {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        z-index: 5;
                        opacity: 0;
                        transition: opacity 0.3s ease;
                        pointer-events: none;
                      }
                      
                      .card-container:hover .card-deck {
                        opacity: 1;
                      }
                      
                      .mini-card {
                        position: absolute;
                        width: 80%;
                        height: 90%;
                        background-size: cover;
                        background-position: center;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                        top: 5%;
                        left: 10%;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        z-index: 6;
                      }
                      
                      .mini-card::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
                        border-radius: 7px;
                      }
                      
                      .card-container:hover .mini-card-1 {
                        transform: rotate(-15deg) translateX(-30px) translateY(-10px);
                      }
                      
                      .card-container:hover .mini-card-2 {
                        transform: rotate(0deg) translateY(-20px);
                      }
                      
                      .card-container:hover .mini-card-3 {
                        transform: rotate(15deg) translateX(30px) translateY(-10px);
                      }
                    `}</style>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Reviews Received */}
                    <div className="bg-yellow-50 p-6 rounded-lg border border-[#204231]">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-[#204231]">Reviews Received</h3>
                          <div className="flex items-center mt-1">
                            <FiStar className="text-yellow-400 fill-yellow-400 mr-1" />
                            <span className="text-gray-600 font-medium">N/A</span>
                            <span className="text-gray-500 text-sm ml-1">({profileData.followers} reviews)</span>
                          </div>
                        </div>
                        <button className="text-yellow-500 text-sm font-medium">View All</button>
                      </div>
                      <div className="space-y-4">
                        {[
                          {
                            id: 1,
                            reviewer: "Sarah Chen",
                            avatar: "/assets/images/sarachen.jpeg",
                            rating: 5,
                            comment: "Alex was an amazing travel companion! Very organized and always positive. Would definitely travel with again!",
                            trip: "European Backpacking",
                            date: "December 2024"
                          },
                          {
                            id: 2,
                            reviewer: "Mike Johnson",
                            avatar: "/assets/images/mikejohnson.jpeg",
                            rating: 5,
                            comment: "Great organizer and very knowledgeable about local cultures. Made our trip unforgettable!",
                            trip: "Southeast Asia Food Tour",
                            date: "November 2024"
                          },
                          {
                            id: 3,
                            reviewer: "Emma Wilson",
                            avatar: "/assets/images/emmawilson.jpeg",
                            rating: 4,
                            comment: "Friendly and reliable. Good communication throughout the trip planning process.",
                            trip: "Swiss Alps Trek",
                            date: "October 2024"
                          }
                        ].map((review) => (
                          <div key={review.id} className="bg-[#f8f4e3] p-4 rounded-lg border border-[#d1c7b7]">
                            <div className="flex items-start space-x-3">
                              <img
                                src={review.avatar}
                                alt={review.reviewer}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-800">{review.reviewer}</h4>
                                    <p className="text-gray-500 text-xs">{review.trip} • {review.date}</p>
                                  </div>
                                  <div className="flex">
                                    {[...Array(review.rating)].map((_, i) => (
                                      <FiStar key={i} className="text-yellow-400 fill-yellow-400 w-4 h-4" />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-gray-600 mt-2 text-sm">"{review.comment}"</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showEditProfile && (
          <ProfileEdit
            profileData={profileData}
            onClose={() => setShowEditProfile(false)}
            onProfileUpdated={handleProfileUpdated}
            onOTPVerification={(type) => {
              setOTPType(type);
              setShowOTPVerification(true);
            }}
          />
        )}

        {showTripMemories && (
          <TripMemories
            tripType={selectedTripType}
            onClose={() => setShowTripMemories(false)}
            currentUser={currentUser}
          />
        )}

        {showOTPVerification && (
          <OTPVerification
            type={otpType}
            onClose={() => setShowOTPVerification(false)}
            onVerified={() => {
              setShowOTPVerification(false);
              alert('Verification successful!');
            }}
          />
        )}

        {showMemoryUploadModal && (
          <MemoryUploadModal
            files={selectedMemoryFiles}
            onClose={() => {
              setShowMemoryUploadModal(false);
              setSelectedMemoryFiles([]);  // Clear selected files when closing
            }}
            onUpload={handleMemoryUploadComplete}
            onSuccess={(newMemory) => {
              // Refresh memories after successful upload
              // Use the useEffect dependency instead of calling fetchUserMemories directly
              // This will trigger the useEffect that fetches memories
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
        {showMemoryModal && selectedMemory && (
          <MemoryModal 
            memory={{
              ...selectedMemory,
              // Add user information to the memory object for better context
              userName: currentUser?.fullName || currentUser?.name,
              userAvatar: profileData?.avatar || currentUser?.avatar // Use profileData avatar as first choice
            }} 
            onClose={() => setShowMemoryModal(false)}
            currentUser={{
              ...currentUser,
              avatar: profileData?.avatar || currentUser?.avatar // Ensure avatar is included
            }}
          />
        )}
      </div>
    </>
  );
}

const handleDeleteMemory = async (memoryId) => {
  if (!memoryId) {
    console.error('No memory ID provided');
    return;
  }
  
  if (window.confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
    try {
      console.log("Deleting memory with ID:", memoryId);
      const token = localStorage.getItem('authToken');
      
      const response = await axios.delete(
        `${BACKEND_URL}/api/memories/${memoryId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      console.log("Delete response:", response);
      
      if (response.status === 200) {
        // Remove the deleted memory from state
        setUserMemories(prev => prev.filter(memory => memory._id !== memoryId));
        console.log("Memory deleted successfully");
      } else {
        console.error("Failed to delete memory with status:", response.status);
      }
    } catch (err) {
      console.error('Error deleting memory:', err);
      console.error('Memory ID:', memoryId);
      
      if (err.response && err.response.status === 401) {
        alert("Your session has expired. Please log in again.");
      }
    }
  }
};

const formatMemberSince = (dateString) => {
  if (!dateString) return "Unknown";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown";
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
};

const formatJoinedDate = (dateString) => {
  if (!dateString) return "Unknown";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown";
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });
};
