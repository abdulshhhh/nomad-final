import React, { useState, useEffect } from "react";
import { useNavigate, Link, Routes, Route } from "react-router-dom"; // Add Link, Routes, Route import
import NotificationSystem from "./NotificationSystem";
import GroupChat from "./GroupChat";
import MemberProfiles from "./MemberProfiles";
import Profile from "./Profile"; // Import Profile component for member profile viewing
import AllTrips from "./AllTrips"; // Import the new component (create this file)
import LeaderboardPage from "./LeaderboardPage";
import io from 'socket.io-client';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiX,
  FiMessageSquare,
  FiStar,
  FiEye,
  FiPlus,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiUsers,
  FiTruck,
  FiEdit2,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiMenu,
  FiBell,
  FiLogOut,
  FiCamera,
  FiSearch,
  FiNavigation,
  FiFilter,
  FiClock,
} from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import axios from "axios";
import { useTrips } from "../context/TripsContext";

// Using real-time database data only - no mock data

// 🚀 REAL-TIME COMPLETED TRIPS ONLY - No dummy data needed

const testimonials = [
  {
    id: 1,
    name: "Alex Rodriguez",
    trip: "Bali Adventure",
    rating: 5,
    comment:
      "Amazing experience! Met incredible people and saw breathtaking places.",
    avatar: "/assets/images/Alexrivera.jpeg",
  },
  {
    id: 2,
    name: "Lisa Park",
    trip: "Tokyo Explorer",
    rating: 5,
    comment:
      "Perfect organization and wonderful travel companions. Highly recommend!",
    avatar: "/assets/images/lisazhang.jpeg",
  },
];

const popularDestinations = [
  {
    id: 1,
    name: "Paris, France",
    country: "France",
    visits: "2.3k",
    image: "/assets/images/paris.webp",
  },
  {
    id: 2,
    name: "New York, USA",
    country: "USA",
    visits: "1.8k",
    image: "/assets/images/newyork.jpeg",
  },
  {
    id: 3,
    name: "Dubai, UAE",
    country: "UAE",
    visits: "1.5k",
    image: "/assets/images/dubai.jpeg",
  },
  {
    id: 4,
    name: "London, UK",
    country: "UK",
    visits: "1.2k",
    image: "/assets/images/london.jpeg",
  },
];

function Dashboard({ onLogout, currentUser, darkMode, setDarkMode }) {
  // --- STATE ---
  const [trips, setTrips] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([
    {
      id: 1,
      title: "Iceland Northern Lights",
      destination: "Reykjavik, Iceland",
      image: "/assets/images/icelandnorthernlights.jpeg",
      rating: 4.9,
      participants: 8,
      date: "December 2024",
    },
    {
      id: 2,
      title: "Santorini Sunset",
      destination: "Santorini, Greece",
      image: "/assets/images/santorinisunset.jpeg",
      rating: "N/A",
      participants: 6,
      date: "October 2024",
    },
  ]);

  // Enhanced user handling for development and production
  const effectiveUser = currentUser || {
    id: 'development-user',
    name: 'Development User',
    fullName: 'Development User',
    email: 'dev@example.com',
    avatar: '/assets/images/default-avatar.webp'
  };

  console.log('Dashboard currentUser:', currentUser);
  console.log('Dashboard effectiveUser:', effectiveUser);

  const [joinedTrips, setJoinedTrips] = useState([]); // array of trip ids
  const { joinedTripsData, setJoinedTripsData } = useTrips();
  const [showPostTrip, setShowPostTrip] = useState(false);
  const [newTrip, setNewTrip] = useState({
    destination: "",
    departure: "",
    fromDate: "",
    toDate: "",
    transport: "",
    currency: "INR",
    budget: "",
    numberOfPeople: 1,
    maxPeople: 1,
    genderPreference: "anyone",
    category: "",
    description: "",
    coverImage: null,
    coverImagePreview: null, // For storing the preview URL
    googleAccountName: "",
    accommodation: "Will discuss further", // Add default value
  });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [realtimeActivities, setRealtimeActivities] = useState([]);
  const [socket, setSocket] = useState(null);

  // Add this near the top of your component, with other state variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const userId = effectiveUser._id || effectiveUser.id;
      if (!userId || userId === 'development-user') {
        // For development user, don't fetch from API
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
      if (response.data.success) {
        // Transform notifications to use 'id' instead of '_id' for frontend compatibility
        const transformedNotifications = response.data.notifications.map(notification => ({
          ...notification,
          id: notification.id || notification._id,
          date: notification.date || notification.createdAt // Use createdAt for date formatting
        }));
        setNotifications(transformedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMemberProfile, setShowMemberProfile] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberProfiles, setShowMemberProfiles] = useState(false);
  const [selectedTripForMembers, setSelectedTripForMembers] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔍 ADVANCED FILTERING STATE
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTransport, setSelectedTransport] = useState('');
  const [maxPeople, setMaxPeople] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, price-low, price-high, popular

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinedTripInfo, setJoinedTripInfo] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCompletedTripDetails, setShowCompletedTripDetails] = useState(false);
  const [selectedCompletedTrip, setSelectedCompletedTrip] = useState(null);
  const [showTripManagement, setShowTripManagement] = useState(false);
  const [managedTrip, setManagedTrip] = useState(null);
  const [tripParticipants, setTripParticipants] = useState([]);

  // 📊 REAL-TIME TRIP DETAILS STATE
  const [tripDetails, setTripDetails] = useState(null);
  const [tripStatistics, setTripStatistics] = useState(null);
  const [tripMembers, setTripMembers] = useState([]);
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [loadingTripDetails, setLoadingTripDetails] = useState(false);

  const navigate = useNavigate();

  // --- JOIN TRIP HANDLER ---
  const handleJoinTrip = async (tripId) => {
    const tripObj = trips.find((t) => t.id === tripId);

    if (!tripObj) {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "error",
          title: "🚫 Trip Not Found",
          message: "The trip you're trying to join could not be found.",
          date: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
      return;
    }

    // 🚫 ROBUST SELF-JOIN PREVENTION
    // Get the current user's ID (handle both _id and id formats)
    const currentUserId = effectiveUser._id || effectiveUser.id;
    const tripCreatorId = tripObj.organizerId || tripObj.createdBy;

    console.log('🔍 Join Trip Debug:', {
      currentUserId,
      tripCreatorId,
      isOwnTrip: currentUserId && tripCreatorId && (currentUserId === tripCreatorId),
      tripObj: {
        id: tripObj.id,
        organizerId: tripObj.organizerId,
        createdBy: tripObj.createdBy,
        organizer: tripObj.organizer,
        title: tripObj.title
      },
      effectiveUser: {
        id: effectiveUser.id,
        _id: effectiveUser._id,
        name: effectiveUser.fullName
      }
    });

    // Check if user is trying to join their own trip
    const isOwnTrip = currentUserId && tripCreatorId && (currentUserId === tripCreatorId);

    if (isOwnTrip) {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "error",
          title: "🚫 Cannot Join Your Own Trip",
          message: "You cannot join a trip that you created. Use 'Manage Trip' to see participants and trip details.",
          date: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
      return;
    }

    if (!joinedTrips.includes(tripId)) {
      try {
        // Use consistent user ID for API call
        const userIdForAPI = effectiveUser._id || effectiveUser.id;

        const response = await fetch("/api/joined-trips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            userId: userIdForAPI,
            tripId: tripId,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          // Handle specific error cases from backend
          if (result.error === 'Cannot join your own trip') {
            alert("🚫 Cannot Join Your Own Trip\n\nYou cannot join a trip that you created. Use 'Manage Trip' to see participants and trip details.");
            return;
          } else if (result.error === 'Already joined this trip') {
            alert("⚠️ Already Joined\n\nYou have already joined this trip.");
            return;
          }
          throw new Error(result.message || "Failed to join trip");
        }

        setJoinedTrips((prev) => [...prev, tripId]);
        setJoinedTripsData((prev) => [...prev, tripObj]);
        setShowJoinModal(true);
        setJoinedTripInfo(tripObj);

        // 🔄 REFRESH DATA TO GET BACKEND UPDATES
        // Refresh both notifications and joined trips data
        setTimeout(() => {
          fetchNotifications();
          fetchTrips(); // 📊 Refresh trips with updated statistics

          // Refresh joined trips data to get the updated list
          const userIdForAPI = effectiveUser._id || effectiveUser.id;
          if (userIdForAPI && userIdForAPI !== 'development-user') {
            fetch(`/api/joined-trips/${userIdForAPI}`)
              .then(res => res.json())
              .then(data => {
                if (Array.isArray(data)) {
                  setJoinedTrips(data.map(trip => trip.id || trip._id));
                  setJoinedTripsData(data);
                }
              })
              .catch((error) => {
                console.error('Error refreshing joined trips:', error);
              });
          }
        }, 500); // Small delay to ensure backend data is updated

        // 🚀 EMIT REAL-TIME PARTICIPANT UPDATE
        if (socket) {
          socket.emit('participantJoined', {
            tripId: tripId,
            userId: effectiveUser.id || effectiveUser._id,
            participant: {
              id: effectiveUser.id || effectiveUser._id,
              name: effectiveUser.fullName,
              email: effectiveUser.email,
              avatar: effectiveUser.avatar || "/assets/images/default-avatar.jpg",
              joinedAt: new Date().toISOString()
            }
          });
        }
      } catch (error) {
        console.error("Error joining trip:", error);
        alert("❌ Failed to Join Trip\n\n" + (error.message || "An unexpected error occurred while joining the trip."));
      }
    }

    // --- POST TRIP HANDLER ---
  };

  // --- LEAVE TRIP HANDLER ---
  const handleLeaveTrip = async (tripId) => {
    const tripObj = trips.find((t) => t.id === tripId);

    if (!tripObj) {
      alert("❌ Trip Not Found\n\nThe trip you're trying to leave could not be found.");
      return;
    }

    // Confirm before leaving
    const confirmLeave = window.confirm(
      `🚪 Leave Trip to ${tripObj.destination}?\n\n` +
      `Are you sure you want to leave this trip?\n\n` +
      `⚠️ WARNING: You will lose 5 coins as a penalty for leaving.\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmLeave) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/joined-trips/leave-trip", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: effectiveUser.id || effectiveUser._id,
          tripId: tripId
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to leave trip");
      }

      // ✅ SUCCESS - Update local state
      setJoinedTrips((prev) => prev.filter(id => id !== tripId));

      // 🔄 Refresh trips data to get updated participant counts
      await fetchTrips();

      // 📢 Show success notification
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "warning", // Use warning type for penalty notifications
          title: "Trip Left Successfully 🚪",
          message: `You have left the trip to ${tripObj.destination}. 5 coins have been deducted as penalty.`,
          timestamp: new Date().toISOString(),
          read: false
        },
        ...prev
      ]);

      // 🚀 EMIT REAL-TIME PARTICIPANT UPDATE
      if (socket) {
        socket.emit('participantLeft', {
          tripId: tripId,
          userId: effectiveUser.id || effectiveUser._id,
          participant: {
            id: effectiveUser.id || effectiveUser._id,
            name: effectiveUser.fullName,
            email: effectiveUser.email,
            leftAt: new Date().toISOString()
          }
        });
      }

      // Close trip details modal if open
      setShowTripDetails(false);

    } catch (error) {
      console.error("Error leaving trip:", error);
      alert("❌ Failed to Leave Trip\n\n" + (error.message || "An unexpected error occurred while leaving the trip."));
    }
  };

  // 🗓️ GET TODAY'S DATE IN YYYY-MM-DD FORMAT FOR DATE VALIDATION
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // 🗓️ GET TOMORROW'S DATE IN YYYY-MM-DD FORMAT (MINIMUM ALLOWED DATE)
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    // 🗓️ ROBUST DATE VALIDATION
    if (name === 'fromDate') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

      if (selectedDate <= today) {
        alert('❌ Trip start date must be at least tomorrow or later. You cannot post trips for today or past dates.');
        return; // Don't update the state with invalid date
      }

      // If toDate is already set and is before the new fromDate, clear toDate
      if (newTrip.toDate && new Date(newTrip.toDate) <= selectedDate) {
        setNewTrip((prev) => ({
          ...prev,
          [name]: value,
          toDate: '' // Clear toDate if it's invalid
        }));
        return;
      }
    }

    if (name === 'toDate') {
      const selectedToDate = new Date(value);
      const fromDate = new Date(newTrip.fromDate);

      if (!newTrip.fromDate) {
        alert('❌ Please select the "From Date" first before selecting the "To Date".');
        return;
      }

      if (selectedToDate <= fromDate) {
        alert('❌ Trip end date must be after the start date.');
        return;
      }

      // Check if toDate is at least one day after fromDate
      const minToDate = new Date(fromDate);
      minToDate.setDate(minToDate.getDate() + 1);

      if (selectedToDate < minToDate) {
        alert('❌ Trip must be at least 1 day long. End date should be at least one day after start date.');
        return;
      }
    }

    setNewTrip((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  // Function to fetch trips from backend
  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/trips`);
      if (response.data.success) {
        // Transform backend data to match frontend format
        console.log(`📥 Raw trips from backend:`, response.data.trips);
        const transformedTrips = response.data.trips.map(trip => {
          // Ensure consistent ID mapping for trip creator
          const creatorId = trip.createdBy?._id || trip.createdBy;
          console.log(`🔄 Transforming trip: ${trip.destination} (ID: ${trip._id})`);

          return {
            id: trip._id,
            title: trip.destination,
            destination: trip.destination,
            duration: `${Math.ceil((new Date(trip.toDate) - new Date(trip.fromDate)) / (1000 * 60 * 60 * 24))} days`,
            date: `${new Date(trip.fromDate).toLocaleDateString()} - ${new Date(trip.toDate).toLocaleDateString()}`,
            fromDate: trip.fromDate,
            toDate: trip.toDate,
            price: `${trip.budget.currency} ${trip.budget.amount}`,
            budget: trip.budget.amount,
            currency: trip.budget.currency,
            spots: trip.maxPeople - (trip.numberOfPeople || 0), // Available spots
            maxSpots: trip.maxPeople,
            currentParticipants: trip.numberOfPeople || 0, // Current joined count
            image: trip.coverImage || "/assets/images/default-trip.jpeg",
            description: trip.description || "Experience the journey of a lifetime with fellow travelers.",
            category: trip.category,
            genderPreference: trip.genderPreference,
            transport: trip.transport,
            organizer: trip.createdBy?.fullName || "Unknown",
            organizerId: creatorId, // Use consistent creator ID
            createdBy: creatorId,   // Add this for backup reference
            organizerAvatar: trip.createdBy?.avatar || "/assets/images/default-avatar.jpg",
            tags: [trip.category, trip.transport],
            joinedMembers: trip.joinedMembers || [],
            departure: trip.departure,
            createdAt: trip.createdAt
          };
        });
        // 📊 ENHANCE TRIPS WITH REAL-TIME STATISTICS
        console.log(`🔄 Enhancing ${transformedTrips.length} trips with real-time statistics...`);

        // Process trips one by one to better debug any issues
        const tripsWithStats = [];
        for (const trip of transformedTrips) {
          try {
            const enhancedTrip = await updateTripWithStats(trip);
            tripsWithStats.push(enhancedTrip);
            console.log(`✅ Enhanced trip ${trip.destination}:`, enhancedTrip);
          } catch (error) {
            console.error(`❌ Failed to enhance trip ${trip.destination}:`, error);
            // Use original trip if statistics fail
            tripsWithStats.push(trip);
          }
        }

        console.log(`✅ All trips enhanced with statistics:`, tripsWithStats);
        setTrips(tripsWithStats);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "error",
          title: "Error Loading Trips",
          message: "Failed to load trips from server",
          date: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    }
  };

  // 🚀 FETCH COMPLETED TRIPS FOR "THE ROAD SO FAR" SECTION
  const fetchCompletedTrips = async () => {
    try {
      console.log('🔍 Fetching completed trips...');
      const response = await axios.get('http://localhost:5000/api/trips/completed?limit=10');

      if (response.data.success) {
        console.log('✅ Completed trips fetched:', response.data.trips);
        setCompletedTrips(response.data.trips);
      } else {
        console.warn('⚠️ Failed to fetch completed trips:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching completed trips:', error);
      // Don't show error notification for completed trips as it's not critical
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Clean up previous preview URL if it exists
      if (newTrip.coverImagePreview) {
        URL.revokeObjectURL(newTrip.coverImagePreview);
      }

      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);

      // Store both the file object (for FormData) and preview URL
      setNewTrip((prev) => ({
        ...prev,
        coverImage: file,
        coverImagePreview: previewUrl
      }));
    }
  };
  const handlePostTrip = async (e) => {
    e.preventDefault();
    
    try {
      // Get token from all possible storage locations
      const token = localStorage.getItem('token') || 
                    localStorage.getItem('authToken') || 
                    sessionStorage.getItem('token');
                  
      if (!token) {
        alert("You must be logged in to post a trip.");
        return;
      }
      
      console.log("Using auth token:", token.substring(0, 10) + "...");  // Log partial token for debugging
      
      // 🗓️ ROBUST DATE VALIDATION BEFORE SUBMISSION
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fromDate = new Date(newTrip.fromDate);
      const toDate = new Date(newTrip.toDate);

      // Check if fromDate is in the future
      if (fromDate <= today) {
        alert('❌ Trip start date must be at least tomorrow. You cannot post trips for today or past dates.');
        return;
      }

      // Check if toDate is after fromDate
      if (toDate <= fromDate) {
        alert('❌ Trip end date must be after the start date.');
        return;
      }

      // Validate required fields
      if (!newTrip.destination || !newTrip.fromDate || !newTrip.toDate || !newTrip.budget) {
        alert('❌ Please fill in all required fields.');
        return;
      }

      const formData = new FormData();
      Object.entries(newTrip).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Update the API call with proper token handling
      const response = await axios.post(
        `${BACKEND_URL}/api/trips`,  // Use BACKEND_URL constant
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.data.success) {
        // Refresh the trips list to get the latest data
        await fetchTrips();

        setShowPostTrip(false);
        setShowSuccessModal(true); // Show the modal here

        // Auto-open trip management after success
        setTimeout(() => {
          try {
            const newTripId = response.data.trip._id || response.data.trip.id;
            if (newTripId) {
              setManagedTrip(response.data.trip);
              setShowTripManagement(true);
            }
          } catch (error) {
            console.error('Error auto-opening trip management:', error);
          }
        }, 2000); // Wait 2 seconds to show success message first

        // Clean up preview URL before resetting
        if (newTrip.coverImagePreview) {
          URL.revokeObjectURL(newTrip.coverImagePreview);
        }

        setNewTrip({
          destination: "",
          departure: "",
          fromDate: "",
          toDate: "",
          transport: "",
          currency: "USD",
          budget: "",
          numberOfPeople: 1,
          maxPeople: 1,
          genderPreference: "anyone",
          category: "",
          description: "",
          coverImage: null,
          coverImagePreview: null,
          googleAccountName: "",
        });
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "success",
            title: `Trip Created: ${response.data.trip.destination}`,
            message: "Your trip has been successfully posted! Opening trip management...",
            date: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error('Error posting trip:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        
        if (error.response.status === 401) {
          alert("Your session has expired. Please log in again.");
          // Optionally redirect to login page
          // window.location.href = '/login';
        } else {
          alert(`Failed to post trip: ${error.response.data.message || error.message}`);
        }
      } else {
        alert(`Failed to post trip: ${error.message}`);
      }
    }
  };

  // 🔍 ADVANCED FILTERING FUNCTION
  const applyAdvancedFilters = (tripsToFilter) => {
    let filtered = tripsToFilter;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(
        (trip) =>
          (trip.title && trip.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (trip.destination && trip.destination.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (trip.tags &&
            trip.tags.some(
              (tag) => tag && tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((trip) => {
        const price = parseFloat(trip.budget) || 0;
        const min = parseFloat(priceRange.min) || 0;
        const max = parseFloat(priceRange.max) || Infinity;
        return price >= min && price <= max;
      });
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((trip) => {
        const tripStart = new Date(trip.fromDate);
        const tripEnd = new Date(trip.toDate);
        const filterStart = dateRange.from ? new Date(dateRange.from) : new Date('1900-01-01');
        const filterEnd = dateRange.to ? new Date(dateRange.to) : new Date('2100-12-31');

        return (tripStart >= filterStart && tripStart <= filterEnd) ||
               (tripEnd >= filterStart && tripEnd <= filterEnd) ||
               (tripStart <= filterStart && tripEnd >= filterEnd);
      });
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((trip) =>
        trip.tags && trip.tags.some(tag =>
          tag && tag.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    // Transport filter
    if (selectedTransport) {
      filtered = filtered.filter((trip) =>
        trip.transport && trip.transport.toLowerCase() === selectedTransport.toLowerCase()
      );
    }

    // Max people filter
    if (maxPeople) {
      filtered = filtered.filter((trip) =>
        parseInt(trip.maxPeople) <= parseInt(maxPeople)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-low':
          return (parseFloat(a.budget) || 0) - (parseFloat(b.budget) || 0);
        case 'price-high':
          return (parseFloat(b.budget) || 0) - (parseFloat(a.budget) || 0);
        case 'popular':
          return (b.joinedMembers?.length || 0) - (a.joinedMembers?.length || 0);
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  };

  // --- FILTERED TRIPS FOR SEARCH ---
  const filteredTrips = applyAdvancedFilters(trips);

  // --- SEPARATE TRIPS BY OWNERSHIP ---
  const currentUserId = effectiveUser._id || effectiveUser.id;
  const myTrips = trips.filter(trip => {
    const tripCreatorId = trip.organizerId || trip.createdBy;
    return currentUserId && tripCreatorId && (currentUserId === tripCreatorId);
  });

  const availableTrips = trips.filter(trip => {
    const tripCreatorId = trip.organizerId || trip.createdBy;
    const isMyTrip = currentUserId && tripCreatorId && (currentUserId === tripCreatorId);
    const isExpired = new Date(trip.toDate) < new Date();
    return !isMyTrip && !isExpired;
  });

  // 🚀 APPLY ADVANCED FILTERING TO TRIP CATEGORIES
  const filteredMyTrips = applyAdvancedFilters(myTrips);
  const filteredAvailableTrips = applyAdvancedFilters(availableTrips);

  // --- TOGGLE NOTIFICATIONS HANDLER ---
  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkNotificationAsRead = async (notificationId) => {
    try {
      // Only make API call if it's a valid MongoDB ObjectId (24 characters)
      if (notificationId && notificationId.length === 24) {
        await axios.patch(`http://localhost:5000/api/notifications/${notificationId}/read`);
      }
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Still update the UI even if API call fails
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      const userId = effectiveUser.id;
      await axios.delete(`http://localhost:5000/api/notifications/user/${userId}/clear-all`);
      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      // Still clear the UI even if API call fails
      setNotifications([]);
    }
  };

  // --- SHOW PROFILE HANDLER ---
  const handleShowProfile = () => {
    if (typeof navigate === "function") {
      navigate("/profile");
    } else {
      window.location.href = "/profile";
    }
    setMobileMenuOpen(false);
  };

  // --- VIEW MEMBER PROFILE HANDLER ---
  const handleViewMemberProfile = async (member) => {
    try {
      // Fetch the complete profile if we don't have it already
      let completeProfile = member;
      
      if (member.id || member._id) {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        try {
          const response = await axios.get(`http://localhost:5000/api/profile/${member.id || member._id}`, { headers });
          
          if (response.data && response.data.success && response.data.profile) {
            completeProfile = {
              ...member,
              ...response.data.profile,
              // Ensure these fields are always available
              name: response.data.profile.fullName || response.data.profile.name || member.name,
              fullName: response.data.profile.fullName || response.data.profile.name || member.name,
              avatar: response.data.profile.avatar || member.avatar
            };
          }
        } catch (err) {
          console.error(`Failed to fetch complete profile for member ${member.id || member._id}:`, err);
        }
      }
      
      // Ensure avatar URL is properly formatted
      let avatarUrl = completeProfile.avatar;
      
      // If avatar is not a data URL or absolute URL, ensure it has the correct path
      if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('http')) {
        // If it doesn't start with a slash, add one
        if (!avatarUrl.startsWith('/')) {
          avatarUrl = `/${avatarUrl}`;
        }
      }
      
      // Format the member data with all required properties
      const formattedMember = {
        id: completeProfile.id || completeProfile._id,
        name: completeProfile.name || completeProfile.fullName,
        fullName: completeProfile.fullName || completeProfile.name,
        avatar: avatarUrl || "/assets/images/default-avatar.webp",
        email: completeProfile.email || "traveler@example.com",
        bio: completeProfile.bio || "Passionate traveler and adventure seeker.",
        location: completeProfile.location || "Traveler",
        phone: completeProfile.phone || "+1 (555) 123-4567",
        role: completeProfile.role || "member",
        verified: completeProfile.verified || true,
        joinedDate: completeProfile.joinedDate,
        level: completeProfile.level || 1,
        coins: completeProfile.coins || 0,
        tripsCompleted: completeProfile.tripsCompleted || 0,
        // Add photos array which might be required by the Profile component
        photos: [
          avatarUrl || "/assets/images/default-avatar.webp",
          "/assets/images/baliadventure.jpeg",
          "/assets/images/Tokyo.jpeg",
          "/assets/images/swissmount.jpeg",
          "/assets/images/icelandnorthernlights.jpeg",
          "/assets/images/santorinisunset.jpeg"
        ]
      };

      console.log("Viewing member profile:", formattedMember);
      setSelectedMember(formattedMember);
      setShowMemberProfile(true);
    } catch (error) {
      console.error('Error viewing member profile:', error);
      // Show a basic profile even if there's an error
      setSelectedMember({
        ...member,
        avatar: member.avatar || "/assets/images/default-avatar.webp",
        bio: "Passionate traveler and adventure seeker.",
        photos: [member.avatar || "/assets/images/default-avatar.webp"]
      });
      setShowMemberProfile(true);
    }
  };

  // --- VIEW ALL MEMBERS HANDLER ---
  const handleViewAllMembers = (trip) => {
    setSelectedTripForMembers(trip);
    setShowMemberProfiles(true);
  };

  // --- PROFILE MESSAGE HANDLER ---
  const handleProfileMessage = () => {
    // Close the member profile modal
    setShowMemberProfile(false);
    // You can add messaging functionality here if needed
    console.log('Message functionality can be implemented here');
  };

  // --- PHOTO CLICK HANDLER ---
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  // --- START CHAT WITH MEMBER HANDLER ---
  const handleStartChatWithMember = (member) => {
    // Close the member profiles modal
    setShowMemberProfiles(false);
    // You can implement chat functionality here
    console.log('Starting chat with member:', member.name);
    // For now, just show an alert
    alert(`Chat functionality with ${member.name} can be implemented here`);
  };

  // --- VIEW TRIP HANDLER ---
  const handleViewTrip = async (trip) => {
    console.log("Viewing trip:", trip); // Add this to debug
    setSelectedTrip({...trip}); // Create a new object to ensure all properties are copied
    setShowTripDetails(true);

    // Fetch detailed trip statistics and organizer info
    const tripId = trip.id || trip._id;
    if (tripId) {
      await fetchTripDetails(tripId);
    }
  };

  // --- MANAGE TRIP HANDLER ---
  const handleManageTrip = async (trip) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const tripId = trip.id || trip._id;
      console.log('Opening trip management for trip ID:', tripId);

      const response = await axios.get(`http://localhost:5000/api/trips/${tripId}/participants`, {
        headers
      });

      if (response.data.success) {
        setManagedTrip(response.data.trip);
        setTripParticipants(response.data.participants);
        setShowTripManagement(true);

        // 🚀 SET UP REAL-TIME PARTICIPANT UPDATES
        if (socket) {
          // Join trip-specific room for real-time updates
          socket.emit('joinTripRoom', tripId);

          // Listen for new participants joining
          socket.on('participantJoined', (data) => {
            if (data.tripId === tripId) {
              setTripParticipants(prev => [...prev, data.participant]);
              setNotifications((prev) => [
                {
                  id: Date.now(),
                  type: "info",
                  title: "New Participant Joined! 👥",
                  message: `${data.participant.name} joined your trip to ${managedTrip?.destination}`,
                  date: new Date().toISOString(),
                  read: false,
                },
                ...prev,
              ]);
            }
          });

          // Listen for participant updates
          socket.on('participantUpdate', (data) => {
            if (data.tripId === tripId) {
              setTripParticipants(data.participants);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching trip participants:', error);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "error",
          title: "Failed to load trip management",
          message: error.response?.data?.error || "Please try again",
          date: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    }
  };

  // 📊 FETCH REAL-TIME TRIP DETAILS
  const fetchTripDetails = async (tripId) => {
    console.log('🔍 fetchTripDetails called with tripId:', tripId);

    if (!tripId) {
      console.warn('⚠️ No tripId provided to fetchTripDetails');
      return;
    }
    
    try {
      setLoadingTripDetails(true);
      
      // Use BACKEND_URL for consistency
      const response = await axios.get(`${BACKEND_URL}/api/trips/${tripId}`);
      
      if (response.data.success) {
        console.log('✅ Trip details fetched:', response.data);
        
        // Extract members from the response
        const organizer = response.data.trip.organizer ? {
          id: response.data.trip.organizerId,
          name: response.data.trip.organizer,
          avatar: response.data.trip.organizerAvatar,
          role: 'organizer'
        } : null;
        
        const members = response.data.trip.joinedMembers || [];
        
        // Combine organizer and members
        const allMembers = organizer ? [organizer, ...members] : members;
        
        console.log('🔍 Fetching profiles for all members:', allMembers);
        
        // Fetch enhanced profiles for all members
        const enhancedMembers = await fetchMemberProfiles(allMembers);
        
        // Separate organizer and members again
        const enhancedOrganizer = enhancedMembers.find(m => m.role === 'organizer');
        const enhancedJoinedMembers = enhancedMembers.filter(m => m.role !== 'organizer');
        
        // Update trip with enhanced member data
        const updatedTrip = {
          ...selectedTrip,
          ...response.data.trip,
          organizer: enhancedOrganizer?.name || response.data.trip.organizer,
          organizerAvatar: enhancedOrganizer?.avatar || response.data.trip.organizerAvatar,
          organizerId: enhancedOrganizer?.id || response.data.trip.organizerId,
          joinedMembers: enhancedJoinedMembers
        };
        
        console.log('🔄 Updating selectedTrip with fetched details:', updatedTrip);
        setSelectedTrip(updatedTrip);
        
        // Set trip members for display
        setTripMembers(enhancedMembers);
        
        // Log the trip members to help debug
        console.log('👥 Trip members set:', enhancedMembers);
      }
    } catch (error) {
      console.error('❌ Error fetching trip details:', error);
    } finally {
      setLoadingTripDetails(false);
    }
  };

  // --- ABANDON TRIP HANDLER ---
  const handleAbandonTrip = async (trip) => {
    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete the trip "${trip.title || trip.destination}" and remove all participants!\n\nThis action cannot be undone. Are you sure you want to abandon this trip?`
    );

    if (!confirmed) return;

    try {
      const tripId = trip.id || trip._id;
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.delete(`http://localhost:5000/api/trips/${tripId}/abandon`, {
        headers
      });

      if (response.data.success) {
        // 🚨 SHOW PENALTY NOTIFICATION
        const penaltyInfo = response.data.penalty;
        const penaltyMessage = penaltyInfo
          ? `Trip abandoned. You lost 5 coins as penalty. ${penaltyInfo.participants} participants were also affected.`
          : "The trip has been permanently deleted";

        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "warning", // Changed to warning to indicate penalty
            title: "Trip Abandoned",
            message: penaltyMessage,
            date: new Date().toISOString(),
            read: false,
            penalty: true,
            coinsLost: -5
          },
          ...prev,
        ]);

        // Close the management modal
        setShowTripManagement(false);

        // Refresh trips list
        fetchTrips();

        // 🔄 REFRESH LEADERBOARD DATA TO SHOW UPDATED COINS
        if (window.location.pathname.includes('profile')) {
          // Trigger profile data refresh if on profile page
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error abandoning trip:', error);
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "error",
          title: "Failed to abandon trip",
          message: error.response?.data?.error || "Please try again",
          date: new Date().toISOString(),
          read: false,
        },
        ...prev,
      ]);
    }
  };

  // 📊 FETCH REAL-TIME TRIP STATISTICS
  const fetchTripStatistics = async (tripId) => {
    try {
      console.log(`🔍 Fetching statistics for trip: ${tripId}`); // Debug log
      console.log(`🌐 Making API call to: http://localhost:5000/api/trips/statistics/${tripId}`);

      const response = await axios.get(`http://localhost:5000/api/trips/statistics/${tripId}`);
      console.log(`📡 API Response status: ${response.status}`, response.data);

      if (response.data.success) {
        console.log(`✅ Statistics received for ${tripId}:`, response.data.statistics); // Debug log
        return response.data.statistics;
      } else {
        console.warn(`⚠️ Statistics API returned success=false for trip ${tripId}:`, response.data);
      }
    } catch (error) {
      console.error(`❌ Error fetching trip statistics for ${tripId}:`, error);
      if (error.response) {
        console.error(`❌ Response status: ${error.response.status}`, error.response.data);
      }
    }
    return null;
  };

  // 🔄 UPDATE TRIP WITH REAL-TIME STATS
  const updateTripWithStats = async (trip) => {
    try {
      console.log(`🔍 Updating stats for trip: ${trip.destination} (ID: ${trip.id})`);
      const stats = await fetchTripStatistics(trip.id);
      if (stats) {
        console.log(`📊 Trip ${trip.destination} stats received:`, stats); // Debug log
        const enhancedTrip = {
          ...trip,
          spots: stats.availableSpots, // Available spots remaining
          maxSpots: stats.maxParticipants, // Maximum capacity
          currentParticipants: stats.currentParticipants, // Current joined count
          occupancyRate: stats.occupancyRate, // Percentage filled
          isFull: stats.isFull, // Whether trip is full
          daysUntilTrip: stats.daysUntilTrip,
          duration: stats.duration
        };
        console.log(`✅ Enhanced trip ${trip.destination}:`, enhancedTrip);
        return enhancedTrip;
      } else {
        console.warn(`⚠️ No statistics received for trip ${trip.destination}`);
        return trip;
      }
    } catch (error) {
      console.error(`❌ Error updating stats for trip ${trip.destination}:`, error);
      return trip; // Return original trip if stats fail
    }
  };

  // --- EFFECTS ---
  const seedDummyTrips = async () => {
    // Check if we're in development mode and if trips have already been seeded
    if (import.meta.env.DEV && !localStorage.getItem('dummyTripsSeeded')) {
      console.log('🌱 Seeding dummy trips for development...');
      
      try {
        // Only seed if no trips exist yet
        const response = await fetch('/api/trips');
        const data = await response.json();
        
        if (Array.isArray(data) && data.length === 0) {
          // No trips exist, seed dummy data
          const dummyTrips = [
            {
              destination: "Bali, Indonesia",
              departure: "New Delhi",
              fromDate: "2023-12-15",
              toDate: "2023-12-25",
              transport: "Flight",
              budget: "50000",
              currency: "INR",
              numberOfPeople: 1,
              maxPeople: 3,
              genderPreference: "anyone",
              category: "beach",
              description: "Looking for travel buddies for a relaxing beach vacation in Bali!",
              coverImage: "/assets/images/destinations/bali.jpg"
            },
            {
              destination: "Bangkok, Thailand",
              departure: "Mumbai",
              fromDate: "2024-01-10",
              toDate: "2024-01-20",
              transport: "Flight",
              budget: "40000",
              currency: "INR",
              numberOfPeople: 2,
              maxPeople: 4,
              genderPreference: "anyone",
              category: "city",
              description: "City exploration and street food adventure in Bangkok!",
              coverImage: "/assets/images/destinations/bangkok.jpg"
            }
          ];
          
          // Add dummy trips to local storage for development
          localStorage.setItem('availableTrips', JSON.stringify(dummyTrips));
          localStorage.setItem('dummyTripsSeeded', 'true');
          
          console.log('✅ Dummy trips seeded successfully');
          return dummyTrips;
        } else {
          console.log('ℹ️ Trips already exist, skipping dummy data seeding');
        }
      } catch (error) {
        console.error('❌ Error seeding dummy trips:', error);
      }
    }
    
    return [];
  };

  // Add this function to seed popular destinations if they don't exist
  const seedPopularDestinations = async () => {
    try {
      // Check if destinations already exist in the database
      const response = await axios.get('/api/public/destinations');
      
      if (response.data.success && response.data.destinations.length === 0) {
        console.log('🌍 Seeding popular destinations...');
        
        // Default popular destinations to seed
        const defaultDestinations = [
          {
            name: "Paris, France",
            country: "France",
            visits: "2.3k",
            image: "/assets/images/paris.webp"
          },
          {
            name: "New York, USA",
            country: "USA",
            visits: "1.8k",
            image: "/assets/images/newyork.jpeg"
          },
          {
            name: "Dubai, UAE",
            country: "UAE",
            visits: "1.5k",
            image: "/assets/images/dubai.jpeg"
          },
          {
            name: "London, UK",
            country: "UK",
            visits: "1.2k",
            image: "/assets/images/london.jpeg"
          }
        ];
        
        // Add destinations to database
        const token = localStorage.getItem('authToken');
        for (const destination of defaultDestinations) {
          await axios.post('/api/admin/destinations', destination, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
        }
        
        console.log('✅ Popular destinations seeded successfully');
      } else {
        console.log('ℹ️ Destinations already exist, skipping seeding');
      }
    } catch (error) {
      console.error('❌ Error seeding popular destinations:', error);
    }
  };

  // Add state for popular destinations
  const [popularDestinations, setPopularDestinations] = useState([]);

  // Add function to fetch popular destinations
  const fetchPopularDestinations = async () => {
    try {
      const response = await axios.get('/api/public/destinations');
      if (response.data.success) {
        setPopularDestinations(response.data.destinations);
      }
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      // Fallback to default destinations if API fails
      setPopularDestinations([
        { id: 1, name: "Paris, France", country: "France", visits: "2.3k", image: "/assets/images/paris.webp" },
        { id: 2, name: "New York, USA", country: "USA", visits: "1.8k", image: "/assets/images/newyork.jpeg" },
        { id: 3, name: "Dubai, UAE", country: "UAE", visits: "1.5k", image: "/assets/images/dubai.jpeg" },
        { id: 4, name: "London, UK", country: "UK", visits: "1.2k", image: "/assets/images/london.jpeg" }
      ]);
    }
  };

  useEffect(() => {
    // Seed dummy trips and popular destinations, then fetch all data
    Promise.all([seedDummyTrips(), seedPopularDestinations()])
      .then(() => {
        fetchTrips();
        fetchCompletedTrips();
        fetchPopularDestinations();
      })
      .catch(error => {
        console.error("Error in initialization:", error);
        // Continue with fetching even if seeding fails
        fetchTrips();
        fetchCompletedTrips();
        fetchPopularDestinations();
      });

    // Fetch notifications
    fetchNotifications();

    // Also fetch joined trips data on initial load
    const userIdForAPI = effectiveUser._id || effectiveUser.id;
    if (userIdForAPI && userIdForAPI !== 'development-user') {
      fetch(`/api/joined-trips/${userIdForAPI}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setJoinedTrips(data.map(trip => trip.id || trip._id));
            setJoinedTripsData(data);
          }
        })
        .catch((error) => {
          console.error('Error fetching joined trips on initial load:', error);
        });
    }

    // Set up Socket.IO connection for real-time updates
    const socketConnection = io('http://localhost:5000');
    setSocket(socketConnection);

    // Connection status tracking
    socketConnection.on('connect', () => {
      console.log('Connected to real-time server');
      setIsConnected(true);
    });

    socketConnection.on('disconnect', () => {
      console.log('Disconnected from real-time server');
      setIsConnected(false);
    });

    // Listen for new trips
    socketConnection.on('newTrip', (data) => {
      console.log('New trip received:', data);
      // Refresh trips list to show new trip
      fetchTrips();

      // Add to real-time activity feed
      setRealtimeActivities(prev => [
        {
          id: Date.now(),
          type: 'trip_posted',
          message: `🌟 New trip to ${data.trip.destination} posted!`,
          timestamp: new Date().toISOString(),
          user: data.trip.organizerName || 'Someone'
        },
        ...prev.slice(0, 9) // Keep only last 10 activities
      ]);

      // Show notification for new trip (if not posted by current user)
      if (data.trip.createdBy !== effectiveUser.id) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "info",
            title: "New Trip Available! 🌟",
            message: data.message,
            date: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }
    });

    // Listen for trip updates (joins, leaves, etc.)
    socketConnection.on('tripUpdated', (updatedTrip) => {
      console.log('Trip updated:', updatedTrip);
      fetchTrips(); // Refresh to get latest data
    });

    // Listen for trip updates
    socketConnection.on('tripUpdated', (data) => {
      console.log('Trip updated:', data);
      fetchTrips();
    });

    // Listen for real-time notifications
    socketConnection.on('newNotification', (data) => {
      console.log('New notification received:', data);
      // Only show notification if it's for the current user
      if (data.userId === effectiveUser.id) {
        setNotifications((prev) => [
          {
            id: data.notification.id,
            type: data.notification.type,
            title: data.notification.title,
            message: data.notification.message,
            tripDestination: data.notification.tripDestination,
            date: data.notification.createdAt,
            read: false,
            metadata: data.notification.metadata
          },
          ...prev,
        ]);
      }
    });

    // 📊 LISTEN FOR REAL-TIME TRIP DETAILS UPDATES
    socketConnection.on('tripDetailsUpdated', (data) => {
      console.log('Trip details updated:', data);
      // If the currently viewed trip is updated, refresh its details
      if (selectedTrip && (selectedTrip.id === data.tripId || selectedTrip._id === data.tripId)) {
        fetchTripDetails(data.tripId);
      }
    });

    // Listen for member join/leave events
    socketConnection.on('tripMemberUpdated', (data) => {
      console.log('Trip member updated:', data);
      // If the currently viewed trip has member changes, refresh details
      if (selectedTrip && (selectedTrip.id === data.tripId || selectedTrip._id === data.tripId)) {
        fetchTripDetails(data.tripId);
      }
    });

    // Listen for cost breakdown updates
    socketConnection.on('tripCostUpdated', (data) => {
      console.log('Trip cost updated:', data);
      // If the currently viewed trip has cost changes, refresh details
      if (selectedTrip && (selectedTrip.id === data.tripId || selectedTrip._id === data.tripId)) {
        fetchTripDetails(data.tripId);
      }
    });

    // 🚀 LISTEN FOR TRIP COMPLETION EVENTS
    socketConnection.on('tripCompleted', (data) => {
      console.log('🎉 Trip completed:', data);

      // Refresh trips list to remove from active trips
      fetchTrips();

      // Refresh completed trips for "The road so far" section
      fetchCompletedTrips();

      // Add to real-time activity feed
      setRealtimeActivities(prev => [
        {
          id: Date.now(),
          type: 'trip_completed',
          message: `🎉 Trip to ${data.destination} completed! ${data.participantCount} travelers`,
          timestamp: new Date().toISOString(),
          user: data.organizer
        },
        ...prev.slice(0, 9) // Keep only last 10 activities
      ]);

      // Show completion notification if user was involved
      const isUserInvolved = data.organizerId === effectiveUser.id ||
                            data.participantIds?.includes(effectiveUser.id);

      if (isUserInvolved) {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "success",
            title: "🎉 Trip Completed!",
            message: `Your trip to ${data.destination} has been completed! ${data.autoCompleted ? 'Automatically completed based on end date.' : ''}`,
            date: new Date().toISOString(),
            read: false,
            tripDestination: data.destination,
            metadata: {
              tripId: data.tripId,
              autoCompleted: data.autoCompleted,
              completionBonus: data.organizerId === effectiveUser.id ? 10 : 5
            }
          },
          ...prev,
        ]);
      }
    });

    // Listen for notification action events
    const handleOpenGroupChat = (e) => {
      setSelectedTrip(e.detail);
      setShowGroupChat(true);
      setShowTripDetails(false);
      setShowNotifications(false);
    };
    const handleOpenTripDetails = (e) => {
      setSelectedTrip(e.detail);
      setShowTripDetails(true);
      setShowGroupChat(false);
      setShowNotifications(false);
    };
    window.addEventListener("openGroupChat", handleOpenGroupChat);
    window.addEventListener("openTripDetails", handleOpenTripDetails);

    return () => {
      socketConnection.disconnect();
      window.removeEventListener("openGroupChat", handleOpenGroupChat);
      window.removeEventListener("openTripDetails", handleOpenTripDetails);
    };
  }, []);

  // Defensive effect: reset newTrip if undefined or null
  useEffect(() => {
    if (!newTrip || typeof newTrip !== "object") {
      setNewTrip({
        destination: "",
        departure: "",
        fromDate: "",
        toDate: "",
        transport: "",
        currency: "INR",
        budget: "",
        numberOfPeople: 1,
        maxPeople: 1,
        genderPreference: "anyone",
        category: "",
        description: "",
        coverImage: null,
        coverImagePreview: null,
      });
    }
  }, [showPostTrip]);

  // Add this state variable at the top of your component
  const [profileData, setProfileData] = useState(null);

  // Add this function to fetch profile data
  const fetchProfileData = async () => {
    try {
      const userId = effectiveUser._id || effectiveUser.id;
      if (!userId || userId === 'development-user') return;

      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:5000/api/profile/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success && response.data.profile) {
        setProfileData(response.data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    }
  };

  // Add this useEffect to fetch profile data when component mounts
  useEffect(() => {
    if (effectiveUser && (effectiveUser._id || effectiveUser.id)) {
      fetchProfileData();
    }
  }, [effectiveUser]);



  useEffect(() => {
    const userIdForAPI = effectiveUser._id || effectiveUser.id;
    console.log('🔍 Fetching joined trips for user:', userIdForAPI);

    if (userIdForAPI && userIdForAPI !== 'development-user') {
      fetch(`/api/joined-trips/${userIdForAPI}`)
        .then(res => res.json())
        .then(data => {
          console.log('📋 Joined trips response:', data);
          if (Array.isArray(data)) {
            const tripIds = data.map(trip => trip.id || trip._id);
            console.log('🎯 Setting joined trip IDs:', tripIds);
            console.log('🎯 Setting joined trips data:', data);
            setJoinedTrips(tripIds);
            setJoinedTripsData(data);
          } else {
            console.warn('⚠️ Joined trips response is not an array:', data);
            setJoinedTrips([]);
            setJoinedTripsData([]);
          }
        })
        .catch((error) => {
          console.error('❌ Error fetching joined trips:', error);
          setJoinedTrips([]);
          setJoinedTripsData([]);
        });
    } else {
      // For development user, clear joined trips
      console.log('🧪 Development user - clearing joined trips');
      setJoinedTrips([]);
      setJoinedTripsData([]);
    }
  }, [effectiveUser]);

  // Cleanup effect for image preview URL
  useEffect(() => {
    return () => {
      // Clean up the preview URL when component unmounts
      if (newTrip.coverImagePreview) {
        URL.revokeObjectURL(newTrip.coverImagePreview);
      }
    };
  }, [newTrip.coverImagePreview]);

  // Add or update this function to fetch member profiles with proper authentication
  const fetchMemberProfiles = async (members) => {
    if (!members || members.length === 0) return [];
    
    try {
      console.log('fetchMemberProfiles: Fetching profiles for', members.length, 'members');
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Create a map to store fetched profiles
      const profilesMap = {};
      
      // Fetch profiles for each member
      const fetchPromises = members.map(member => {
        const memberId = member.id || member._id;
        if (!memberId) {
          console.log('fetchMemberProfiles: Skipping member with no ID');
          return Promise.resolve(null);
        }
        
        console.log(`fetchMemberProfiles: Fetching profile for member ${memberId}`);
        
        // Use BACKEND_URL for consistency
        return axios.get(`${BACKEND_URL}/api/profile/${memberId}`, { headers })
          .then(response => {
            if (response.data && response.data.success && response.data.profile) {
              console.log(`fetchMemberProfiles: Successfully fetched profile for ${memberId}`, response.data.profile);
              return { id: memberId, profile: response.data.profile };
            }
            console.log(`fetchMemberProfiles: No profile data for ${memberId}`);
            return null;
          })
          .catch(err => {
            console.error(`fetchMemberProfiles: Failed to fetch profile for member ${memberId}:`, err);
            return null;
          });
      });
      
      const results = await Promise.all(fetchPromises);
      
      // Process results
      const enhancedMembers = members.map(member => {
        const memberId = member.id || member._id;
        const result = results.find(r => r && r.id === memberId);
        
        if (result && result.profile) {
          // Process avatar URL
          let avatarUrl = result.profile.avatar;
          
          // If avatar is not a data URL or absolute URL, ensure it has the correct path
          if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('http')) {
            // If it doesn't start with a slash, add one
            if (!avatarUrl.startsWith('/')) {
              avatarUrl = `/${avatarUrl}`;
            }
          }
          
          return {
            ...member,
            ...result.profile,
            // Ensure these fields are always available
            name: result.profile.fullName || result.profile.name || member.name,
            avatar: avatarUrl || member.avatar || "/assets/images/default-avatar.webp"
          };
        }
        
        return member;
      });
      
      console.log('fetchMemberProfiles: Returning enhanced members:', enhancedMembers);
      return enhancedMembers;
    } catch (error) {
      console.error("fetchMemberProfiles: Error fetching member profiles:", error);
      return members;
    }
  };

  // Enhanced getAvatarUrl function with better logging and URL handling
  const getAvatarUrl = (member) => {
    if (!member) {
      console.log('getAvatarUrl: No member provided, using default avatar');
      return "/assets/images/default-avatar.webp";
    }
    
    // Log the member object to see what we're working with
    console.log(`getAvatarUrl for member:`, {
      id: member.id || member._id,
      name: member.name,
      avatarValue: member.avatar
    });
    
    // Check if avatar is a base64 string
    if (member.avatar && member.avatar.startsWith('data:')) {
      console.log('getAvatarUrl: Using base64 avatar');
      return member.avatar;
    }
    
    // Check if avatar is an absolute URL
    if (member.avatar && (member.avatar.startsWith('http://') || member.avatar.startsWith('https://'))) {
      console.log('getAvatarUrl: Using absolute URL avatar:', member.avatar);
      return member.avatar;
    }
    
    // Check if avatar is a relative path
    if (member.avatar) {
      // Ensure the path starts with a slash
      const formattedPath = member.avatar.startsWith('/') ? member.avatar : `/${member.avatar}`;
      console.log('getAvatarUrl: Using relative path avatar:', formattedPath);
      return formattedPath;
    }
    
    // Fallback to default
    console.log('getAvatarUrl: No valid avatar found, using default');
    return "/assets/images/default-avatar.webp";
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center relative">
                <div className="flex items-center">
                  <img
                    src="/assets/images/NomadNovalogo.jpg"
                    alt="NomadNova Logo"
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <h1 className="text-xl sm:text-2xl font-bold text-[#f8d56b]">
                    NomadNova
                  </h1>
                </div>
                {/* Make desktop links disappear on mobile */}
                <div className="hidden md:absolute md:left-[calc(100%+1rem)] md:whitespace-nowrap md:flex md:items-center md:h-full">
                  <a
                    href="#trips"
                    className="px-4 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel text-base translate-y-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Trips
                  </a>
                  <a
                    href="#destinations"
                    className="px-4 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel text-base translate-y-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Destinations
                  </a>
                  <a
                    href="#completed"
                    className="px-4 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel text-base translate-y-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Completed
                  </a>
                </div>
              </div>
              {/* Trophy, Connection Status, and Notification Icons */}
              <div className="flex items-center space-x-4">
                {/* Real-Time Connection Status */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>

                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="relative text-yellow-400 hover:text-yellow-500 focus:outline-none"
                  title="Leaderboard"
                >
                  <GiTrophy size={28} />
                </button>
                
                {/* Post Trip Button */}
                <button
                  onClick={() => setShowPostTrip(true)}
                  className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-4 py-1.5 rounded-full transition-colors font-cinzel shadow-md flex items-center text-sm"
                >
                  <FiPlus className="mr-1" />
                  Post Trip
                </button>
                
                <NotificationSystem
                  notifications={notifications}
                  showNotifications={showNotifications}
                  onToggleNotifications={handleToggleNotifications}
                  onMarkAsRead={handleMarkNotificationAsRead}
                  onClearAll={handleClearAllNotifications}
                />
                <button
                onClick={handleShowProfile}
                className="flex items-center space-x-2 text-white transition-colors font-cinzel"
                >
                  <div className="relative w-10 h-10">
                    <img
                    src={profileData?.avatar || effectiveUser.avatar || "/assets/images/default-avatar.webp"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-[#f8d56b] object-cover"
                    onError={(e) => {
                      if (!e.target.src.endsWith("/assets/images/default-avatar.webp")) {
                        e.target.src = "/assets/images/default-avatar.webp";
                      }
                      }}
                      />
                    </div>
                    </button>
                <button
                  onClick={onLogout}
                  className="bg-[#5E5854] hover:bg-[#2c5e4a] text-white px-6 py-2 rounded-full transition-colors font-cinzel"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="bg-[#2c5e4a] h-full w-64 p-6 shadow-lg">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-[#f8d56b]">Menu</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white hover:text-[#f8d56b]"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleShowProfile}
                    className="flex items-center space-x-2 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4 text-left w-full"
                  >
                    <img
                      src={currentUser.avatar}
                      alt="Profile"
                      className="w-6 h-6 rounded-full border border-white"
                    />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowPostTrip(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4 text-left w-full"
                  >
                    <FiPlus className="mr-1" />
                    <span>Post Trip</span>
                  </button>
                  <button
                    onClick={handleToggleNotifications}
                    className="flex items-center space-x-2 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4 text-left w-full"
                  >
                    <FiBell className="mr-1" />
                    <span>Notifications</span>
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="bg-[#f87c6d] text-white text-xs rounded-full px-2 py-0.5 ml-1">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4 text-left w-full"
                  >
                    <FiLogOut className="mr-1" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Welcome Section */}
          <section className="text-center bg-gradient-to-r from-[#6F93AD] to-[#4a708a] rounded-2xl p-4 sm:p-8 border border-[#5E5854] shadow-xl">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-white">
              Welcome back, Traveler!
            </h2>
            <p className="font-southmind text-lg sm:text-xl text-white/90">
              Discover your next adventure with like-minded explorers
            </p>
          </section>

          {/* Search Bar */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <h3 className="text-3xl font-bold text-[#2c5e4a]">
                Trip Explorer
              </h3>
              <div className="space-y-4 w-full">
                {/* Main Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1 sm:max-w-md">
                    <input
                      type="text"
                      placeholder="Search destinations, trip titles, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pr-10 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#2c2c2c] placeholder-gray-500 bg-white backdrop-blur-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#5E5854]">
                      <FiSearch className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Filter Toggle Button */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm shadow transition-all duration-300 flex items-center space-x-2 ${
                      showAdvancedFilters
                        ? 'bg-[#f8a95d] text-white'
                        : 'bg-white border border-[#d1c7b7] text-[#5E5854] hover:border-[#f8a95d]'
                    }`}
                  >
                    <FiFilter className="w-4 h-4" />
                    <span>Filters</span>
                    {(priceRange.min || priceRange.max || dateRange.from || dateRange.to || selectedCategory || selectedTransport || maxPeople) && (
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    )}
                  </button>

                  {/* View All Trips Button */}
                  <Link
                    to="/all-trips"
                    className="px-4 py-2 rounded-lg bg-[#f8d56b] hover:bg-[#f87c6d] text-[#2c5e4a] hover:text-white font-semibold text-sm shadow transition-colors text-center whitespace-nowrap"
                  >
                    View All Trips
                  </Link>
                </div>

                {/* 🔍 ADVANCED FILTERS PANEL */}
                {showAdvancedFilters && (
                  <div className="bg-white rounded-xl border border-[#d1c7b7] p-4 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium text-[#2c5e4a] mb-2">💰 Price Range ($)</label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            placeholder="Min"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                            className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                            className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                          />
                        </div>
                      </div>

                      {/* Date Range */}
                      <div>
                        <label className="block text-sm font-medium text-[#2c5e4a] mb-2">📅 Date Range</label>
                        <div className="flex space-x-2">
                          <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                            className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                          />
                          <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                            className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-[#2c5e4a] mb-2">Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                        >
                          <option value="">All Categories</option>
                          <option value="beach">Beach</option>
                          <option value="city">City</option>
                          <option value="mountain">Mountain</option>
                          <option value="adventure">Adventure</option>
                        </select>
                      </div>

                      {/* Transport */}
                      <div>
                        <label className="block text-sm font-medium text-[#2c5e4a] mb-2">Transport</label>
                        <select
                          value={selectedTransport}
                          onChange={(e) => setSelectedTransport(e.target.value)}
                          className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                        >
                          <option value="">All Transport</option>
                          <option value="flight">Flight</option>
                          <option value="train">Train</option>
                          <option value="car">Car</option>
                          <option value="bus">Bus</option>
                        </select>
                      </div>

                      {/* Max
                            className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-[#2c5e4a] mb-2">🎯 Category</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                        >
                          <option value="">All Categories</option>
                          <option value="adventure">🏔️ Adventure</option>
                          <option value="culture">🏛️ Culture</option>
                          <option value="food">🍜 Food & Culinary</option>
                          <option value="nature">🌿 Nature</option>
                          <option value="photography">📸 Photography</option>
                          <option value="business">💼 Business</option>
                          <option value="relaxation">🧘 Relaxation</option>
                          <option value="sports">⚽ Sports</option>
                        </select>
                      </div>

                      {/* Transport */}
                      <div>
                        <label className="block text-sm font-medium text-[#2c5e4a] mb-2">🚗 Transport</label>
                        <select
                          value={selectedTransport}
                          onChange={(e) => setSelectedTransport(e.target.value)}
                          className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                        >
                          <option value="">Any Transport</option>
                          <option value="flight">✈️ Flight</option>
                          <option value="train">🚂 Train</option>
                          <option value="bus">🚌 Bus</option>
                          <option value="car">🚗 Car</option>
                          <option value="boat">🛥️ Boat</option>
                          <option value="other">🚶 Other</option>
                        </select>
                      </div>

                      {/* Max People */}
                      <div>
                        <label className="block text-sm font-medium text-[#2c5e4a] mb-2">👥 Max Group Size</label>
                        <input
                          type="number"
                          placeholder="Max people"
                          value={maxPeople}
                          onChange={(e) => setMaxPeople(e.target.value)}
                          className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                        />
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="block text-sm font-medium text-[#2c5e4a] mb-2">📊 Sort By</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none text-sm"
                        >
                          <option value="newest">🆕 Newest First</option>
                          <option value="oldest">📅 Oldest First</option>
                          <option value="price-low">💰 Price: Low to High</option>
                          <option value="price-high">💸 Price: High to Low</option>
                          <option value="popular">🔥 Most Popular</option>
                        </select>
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-[#5E5854]">
                        {filteredAvailableTrips.length} trips found
                      </div>
                      <button
                        onClick={() => {
                          setPriceRange({ min: '', max: '' });
                          setDateRange({ from: '', to: '' });
                          setSelectedCategory('');
                          setSelectedTransport('');
                          setMaxPeople('');
                          setSortBy('newest');
                          setSearchTerm('');
                        }}
                        className="px-4 py-2 text-sm text-[#5E5854] hover:text-[#2c5e4a] hover:bg-[#f8f4e3] rounded-lg transition-colors"
                      >
                        🗑️ Clear All Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* My Trips Section */}
          {filteredMyTrips.length > 0 && (
            <section id="my-trips" className="space-y-6 scroll-mt-24">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-[#2c5e4a]">
                  My Trips ({filteredMyTrips.length})
                </h3>
                <div className="text-sm text-[#5E5854] bg-[#f8f4e3] px-3 py-1 rounded-full border border-[#d1c7b7]">
                  Trips hosted by you
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredMyTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl overflow-hidden border-2 border-[#f8a95d] shadow-lg relative"
                  >
                    {/* Host Disclaimer Badge */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-gradient-to-r from-[#2c5e4a] to-[#4a708a] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        HOSTED BY YOU
                      </span>
                    </div>

                    <div className="relative">
                      <img
                        src={trip.image}
                        alt={trip.title}
                        className="w-full h-40 sm:h-48 object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                          {trip.price}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5]">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg sm:text-xl font-bold text-[#2c5e4a]">
                          {trip.title}
                        </h4>
                        <span className="text-xs text-[#5E5854] bg-white px-2 py-1 rounded-full">
                          {trip.category}
                        </span>
                      </div>
                      <p className="text-[#5E5854] mb-3 text-sm">
                        {trip.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-[#5E5854] text-sm">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          {trip.date}
                        </div>
                        <div className="flex items-center text-[#5E5854] text-sm">
                          <FiUsers className="w-4 h-4 mr-1" />
                          <span className={`font-medium ${trip.isFull ? 'text-red-600' : trip.spots <= 2 ? 'text-orange-600' : 'text-green-600'}`}>
                            {trip.currentParticipants || 0}/{trip.maxSpots} joined
                          </span>
                          {trip.isFull && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">FULL</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleManageTrip(trip)}
                          className="flex-1 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-4 py-2 rounded-full transition-colors font-cinzel text-sm"
                        >
                          Manage Trip
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Real-Time Activity Feed */}
          {realtimeActivities.length > 0 && (
            <section className="space-y-4">
              <div className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <h3 className="text-white font-bold text-lg">🔴 Live Activity</h3>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {realtimeActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-white text-sm">
                      <div className="flex items-center justify-between">
                        <span>{activity.message}</span>
                        <span className="text-xs opacity-75">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Available Trips Section */}
          <section id="available-trips" className="space-y-6 scroll-mt-24">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#2c5e4a]">
                Available Trips ({filteredAvailableTrips.length})
              </h3>
              <div className="text-sm text-[#5E5854] bg-[#f8f4e3] px-3 py-1 rounded-full border border-[#d1c7b7]">
                Trips you can join
              </div>
            </div>

            {/* No Results Message */}
            {filteredAvailableTrips.length === 0 && (
              <div className="text-center py-8 bg-white rounded-xl border border-[#d1c7b7]">
                <FiSearch className="w-12 h-12 mx-auto text-[#a8c4b8] mb-4" />
                <h4 className="text-xl font-bold text-[#2c5e4a] mb-2">
                  No available trips found
                </h4>
                <p className="text-[#5E5854]">
                  Try adjusting your search terms or check back later for new
                  trips.
                </p>
                {/* Add a button to create a new trip */}
                <button
                  onClick={() => setShowPostTrip(true)}
                  className="mt-4 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-4 py-2 rounded-full transition-colors font-cinzel"
                >
                  <FiPlus className="inline mr-1" />
                  Post a Trip
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAvailableTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#d1c7b7] shadow-lg transition-all duration-300 transform hover:scale-105 hover:z-10 hover:ring-2 hover:ring-[#f8a95d]"
                >
                  <div className="relative">
                    <img
                      src={trip.image || trip.coverImage || "/assets/images/default-trip.jpeg"}
                      alt={trip.title}
                      className="w-full h-40 sm:h-48 object-cover"
                      onError={(e) => {
                        console.log('🖼️ Image failed to load for trip:', trip.title, 'Original src:', e.target.src);
                        e.target.src = "/assets/images/default-trip.jpeg";
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        approx {trip.price}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5]">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg sm:text-xl font-bold text-[#2c5e4a]">
                        {trip.title}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          joinedTrips.includes(trip.id)
                            ? "bg-[#f87c6d] text-white"
                            : "bg-[#f8d56b] text-[#2c5e4a]"
                        }`}
                      >
                        {joinedTrips.includes(trip.id) ? "JOINED" : "OPEN"}
                      </span>
                    </div>
                    <p className="text-[#2c5e4a] font-medium mb-2 flex items-center">
                      <FiMapPin className="mr-1" /> {trip.destination}
                    </p>
                    <p className="text-[#5E5854] mb-3 flex items-center">
                      <FiCalendar className="mr-1" /> {trip.duration} •{" "}
                      {trip.date}
                    </p>
                    <p className="text-[#5E5854] text-sm mb-3">
                      <span className="font-medium">Category:</span>{" "}
                      {(Array.isArray(trip.tags) && trip.tags.length > 0) ? trip.tags[0] : "Adventure"}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(Array.isArray(trip.tags) ? trip.tags.slice(0, 3) : []).map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#a8c4b8]/30 text-[#2c5e4a] px-2 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg"
                        >
                          {tag}
                        </span>
                      ))}
                      {Array.isArray(trip.tags) && trip.tags.length > 3 && (
                        <span className="bg-[#a8c4b8]/30 text-[#2c5e4a] px-2 py-1 rounded-full text-xs">
                          +{trip.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[#2c5e4a] font-medium flex items-center text-sm">
                        <FiUsers className="mr-1" /> {trip.spots} spots
                      </span>
                      <div className="flex items-center text-[#2c5e4a]">
                        <FiStar className="mr-1" />
                        <span className="text-sm">N/A</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => handleViewTrip(trip)}
                        className="flex-1 bg-[#5E5854] hover:bg-[#2c5e4a] text-white px-4 py-2 rounded-full transition-colors font-cinzel flex items-center justify-center"
                      >
                        <FiEye className="mr-1" /> View
                      </button>
                      <button
                        onClick={() => handleJoinTrip(trip.id)}
                        disabled={joinedTrips.includes(trip.id) || trip.isFull}
                        className={`flex-1 px-4 py-2 rounded-full transition-colors font-cinzel flex items-center justify-center ${
                          joinedTrips.includes(trip.id) || trip.isFull
                            ? "bg-[#a8c4b8] text-[#2c5e4a] cursor-not-allowed"
                            : "bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white"
                        }`}
                      >
                        {joinedTrips.includes(trip.id) ? (
                          <>
                            <FiCheck className="mr-1" /> Joined
                          </>
                        ) : trip.isFull ? (
                          <>
                            <FiX className="mr-1" /> FULL
                          </>
                        ) : (
                          "Join Trip"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Add a section to display upcoming trips from joinedTripsData */}
          <section className="space-y-6 scroll-mt-24">
            <h3 className="text-2xl font-bold text-[#2c5e4a]">
              Upcoming Trips
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {(Array.isArray(joinedTripsData) ? joinedTripsData : [])
                .filter(trip => {
                  // Filter for valid trips with required data
                  return trip && (trip.id || trip._id) && (trip.title || trip.destination);
                })
                .map((trip) => (
                  <div
                    key={trip.id || trip._id}
                    className="bg-white rounded-xl overflow-hidden border border-[#d1c7b7] shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={async () => {
                      console.log('🔍 Trip card clicked:', trip);
                      console.log('🔍 Trip ID:', trip.id || trip._id);

                      // Ensure trip has all required fields for modal display
                      const tripForModal = {
                        ...trip,
                        title: trip.title || trip.destination,
                        image: trip.image || trip.coverImage || '/assets/images/default-trip.jpeg',
                        organizer: trip.organizer || 'Unknown',
                        organizerId: trip.organizerId || trip.createdBy,
                        spots: trip.spots || (trip.maxPeople - trip.numberOfPeople),
                        maxSpots: trip.maxSpots || trip.maxPeople,
                        currentParticipants: trip.currentParticipants || trip.numberOfPeople || 0,
                        duration: trip.duration || 'N/A',
                        date: trip.date || 'N/A',
                        price: trip.price || 'N/A',
                        tags: trip.tags || [trip.category],
                        joinedMembers: trip.joinedMembers || []
                      };

                      setSelectedTrip(tripForModal);
                      setShowTripDetails(true);

                      console.log('🔍 Modal state set - showTripDetails:', true);
                      console.log('🔍 Selected trip set:', tripForModal);

                      // Fetch real-time trip details
                      try {
                        await fetchTripDetails(trip.id || trip._id);
                        console.log('✅ Trip details fetched successfully');
                      } catch (error) {
                        console.error('❌ Error fetching trip details:', error);
                      }
                    }}
                  >
                    <img
                      src={trip.image || trip.coverImage || '/assets/images/default-trip.jpeg'}
                      alt={trip.title || trip.destination}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        console.log('🖼️ Upcoming trip image failed to load:', trip.title, 'Original src:', e.target.src);
                        e.target.src = '/assets/images/default-trip.jpeg';
                      }}
                    />
                    <div className="p-4">
                      <h4 className="text-lg font-bold text-[#2c5e4a] mb-2">
                        {trip.title || trip.destination}
                      </h4>
                      <p className="text-[#5E5854] mb-2">{trip.destination}</p>
                      <div className="flex justify-between items-center text-sm text-[#5E5854]">
                        <span className="flex items-center">
                          <FiCalendar className="mr-1" /> {trip.date || trip.fromDate}
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Joined
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              {(!Array.isArray(joinedTripsData) || joinedTripsData.length === 0) && (
                <div className="col-span-full text-center py-8">
                  <div className="text-[#5E5854]/50 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                  </div>
                  <p className="text-[#5E5854] text-lg font-medium">No upcoming trips yet</p>
                  <p className="text-[#5E5854]/70 text-sm mt-2">Join some trips to see them here!</p>
                </div>
              )}
            </div>
          </section>

          {/* Enhanced Trip Details Modal */}
          {console.log('🔍 Modal render check - showTripDetails:', showTripDetails, 'selectedTrip:', selectedTrip)}
          {showTripDetails && selectedTrip && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 sm:p-6 flex justify-between items-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedTrip.title}
                  </h3>
                  <button
                    onClick={() => setShowTripDetails(false)}
                    className="p-2 hover:bg-[#f8d56b] rounded-full text-white hover:text-[#2c5e4a] transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Modal Content */}
                  <div className="p-4 sm:p-6">
                    {/* Trip Image and Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="relative h-64 rounded-xl overflow-hidden">
                        <img
                          src={selectedTrip.image}
                          alt={selectedTrip.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {selectedTrip.price}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-[#d1c7b7]">
                        <h4 className="font-bold text-[#2c5e4a] mb-3">
                          Trip Details
                        </h4>
                        <div className="space-y-2 text-[#5E5854]">
                          <p className="flex items-center">
                            <FiMapPin className="mr-2" />{" "}
                            <span className="font-medium">Destination:</span>{" "}
                            {selectedTrip.destination}
                          </p>
                          <p className="flex items-center">
                            <FiCalendar className="mr-2" />{" "}
                            <span className="font-medium">Duration:</span>{" "}
                            {selectedTrip.duration}
                          </p>
                          <p className="flex items-center">
                            <FiCalendar className="mr-2" />{" "}
                            <span className="font-medium">Dates:</span>{" "}
                            {selectedTrip.date}
                          </p>
                          <p className="flex items-center">
                            <FiUsers className="mr-2" />{" "}
                            <span className="font-medium">
                              Participants:
                            </span>{" "}
                            <span className={`ml-2 font-bold ${selectedTrip.isFull ? 'text-red-600' : selectedTrip.spots <= 2 ? 'text-orange-600' : 'text-green-600'}`}>
                              {selectedTrip.currentParticipants || 0}/{selectedTrip.maxSpots}
                            </span>
                            {selectedTrip.occupancyRate && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({selectedTrip.occupancyRate}% full)
                              </span>
                            )}
                          </p>
                          <p className="flex items-center">
                            <FiStar className="mr-2" />{" "}
                            <span className="font-medium">Category:</span>{" "}
                            {selectedTrip.tags && selectedTrip.tags.length > 0
                              ? selectedTrip.tags[0]
                              : "Adventure"}
                          </p>
                          {selectedTrip.transport && (
                            <p className="flex items-center">
                              <FiNavigation className="mr-2" />{" "}
                              <span className="font-medium">Transport:</span>{" "}
                              {selectedTrip.transport}
                            </p>
                          )}
                          {/* Gender Preference */}
                          <p className="flex items-center">
                            <FiUsers className="mr-2" />{" "}
                            <span className="font-medium">
                              Gender Preference:
                            </span>
                            <span
                              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                selectedTrip.genderPreference === "womenOnly"
                                  ? "bg-pink-100 text-pink-700"
                                  : selectedTrip.genderPreference === "menOnly"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {selectedTrip.genderPreference === "womenOnly"
                                ? "Women Only"
                                : selectedTrip.genderPreference === "menOnly"
                                ? "Men Only"
                                : "Anyone Welcome"}
                            </span>
                          </p>
                          {/* Removed Trip Priority section */}
                        </div>
                      </div>
                    </div>

                    {/* Trip Description */}
                    <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] mb-6">
                      <h4 className="font-bold text-[#2c5e4a] mb-3">
                        About This Trip
                      </h4>
                      <p className="text-[#5E5854]">
                        {selectedTrip.description ||
                          "No description available."}
                      </p>
                    </div>

                    {/* Trip Cost Breakdown and Map */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Cost Breakdown - Real-time Data */}
                      <div className="bg-white p-4 rounded-xl border border-[#d1c7b7]">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-bold text-[#2c5e4a]">
                            Cost Breakdown
                          </h4>
                          {costBreakdown && (
                            <span className="text-xs text-[#5E5854] bg-[#f8f4e3] px-2 py-1 rounded">
                              Per Person
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {costBreakdown ? (
                            <>
                              <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                                <span className="text-[#5E5854]">Base Price</span>
                                <span className="font-medium text-[#2c5e4a]">
                                  {costBreakdown.basePrice.currency} {costBreakdown.basePrice.amount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                                <span className="text-[#5E5854]">Accommodation</span>
                                <span className="font-medium text-[#2c5e4a]">
                                  {costBreakdown.accommodation.currency} {costBreakdown.accommodation.amount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                                <span className="text-[#5E5854]">Transport</span>
                                <span className="font-medium text-[#2c5e4a]">
                                  {costBreakdown.transport.currency} {costBreakdown.transport.amount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                                <span className="text-[#5E5854]">Meals</span>
                                <span className="font-medium text-[#2c5e4a]">
                                  {costBreakdown.meals.currency} {costBreakdown.meals.amount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                                <span className="text-[#5E5854]">Activities</span>
                                <span className="font-medium text-[#2c5e4a]">
                                  {costBreakdown.activities.currency} {costBreakdown.activities.amount}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-[#2c5e4a]">Total Cost</span>
                                <span className="font-bold text-[#f87c6d]">
                                  {costBreakdown.total.currency} {costBreakdown.total.amount}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                                <span className="text-[#5E5854]">Base Price</span>
                                <span className="font-medium text-[#2c5e4a]">
                                  {selectedTrip.price}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                                <span className="text-[#5E5854]">Accommodation</span>
                                <span className="font-medium text-[#2c5e4a]">Included</span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                                <span className="text-[#5E5854]">Activities</span>
                                <span className="font-medium text-[#2c5e4a]">Included</span>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                <span className="font-bold text-[#2c5e4a]">Total Cost</span>
                                <span className="font-bold text-[#f87c6d]">
                                  approx {selectedTrip.price}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Google Map */}
                      <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] h-full min-h-[200px]">
                        <h4 className="font-bold text-[#2c5e4a] mb-3">
                          Destination Map
                        </h4>
                        <div className="h-[calc(100%-2rem)] min-h-[150px] rounded-lg overflow-hidden border border-[#d1c7b7]">
                          <iframe
                            title={`Map of ${selectedTrip.destination}`}
                            className="w-full h-full"
                            frameBorder="0"
                            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
                              selectedTrip.destination
                            )}`}
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    </div>

                    {/* Trip Statistics - Real-time Data */}
                    <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-[#2c5e4a]">
                          Trip Statistics
                        </h4>
                        {loadingTripDetails && (
                          <div className="text-[#f87c6d] text-sm">
                            Loading real-time data...
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="bg-[#f8f4e3] p-3 rounded-lg">
                          <p className="text-2xl font-bold text-[#f87c6d]">
                            {tripStatistics ? tripStatistics.participantsJoined : (selectedTrip.maxSpots - selectedTrip.spots)}
                          </p>
                          <p className="text-[#5E5854] text-sm">
                            Travelers Joined
                          </p>
                        </div>
                        <div className="bg-[#f8f4e3] p-3 rounded-lg">
                          <p className="text-2xl font-bold text-[#f87c6d]">
                            {tripStatistics ? tripStatistics.durationDays :
                             (selectedTrip.duration && typeof selectedTrip.duration === 'string' ? selectedTrip.duration.split(" ")[0] :
                              (selectedTrip.fromDate && selectedTrip.toDate ?
                                Math.ceil((new Date(selectedTrip.toDate) - new Date(selectedTrip.fromDate)) / (1000 * 60 * 60 * 24)) :
                                "N/A"))}
                          </p>
                          <p className="text-[#5E5854] text-sm">Days</p>
                        </div>
                        <div className="bg-[#f8f4e3] p-3 rounded-lg">
                          <p className="text-2xl font-bold text-[#f87c6d]">
                            {tripStatistics ? tripStatistics.averageRating : "N/A"}
                          </p>
                          <p className="text-[#5E5854] text-sm">Rating</p>
                        </div>
                        <div className="bg-[#f8f4e3] p-3 rounded-lg">
                          <p className="text-2xl font-bold text-[#f87c6d]">
                            {tripStatistics ? tripStatistics.spotsRemaining : (selectedTrip.spots || 0)}
                          </p>
                          <p className="text-[#5E5854] text-sm">Spots Left</p>
                        </div>
                      </div>
                    </div>

                    {/* Trip Members - Real-time Data */}
                    <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-[#2c5e4a]">
                          Trip Members
                        </h4>
                        <div className="flex items-center space-x-2">
                          {tripMembers.length > 0 && (
                            <span className="text-xs text-[#5E5854] bg-[#f8f4e3] px-2 py-1 rounded">
                              {tripMembers.length} Total
                            </span>
                          )}
                          <button
                            onClick={() => handleViewAllMembers(selectedTrip)}
                            className="text-[#f87c6d] hover:text-[#f8a95d] text-sm font-medium"
                          >
                            View All
                          </button>
                        </div>
                      </div>

                      {loadingTripDetails ? (
                        <div className="bg-[#f8f4e3] p-4 rounded-lg border border-[#d1c7b7] text-center">
                          <p className="text-[#5E5854] text-sm">Loading trip members...</p>
                        </div>
                      ) : tripMembers.length > 0 ? (
                        <>
                          {/* Organizer */}
                          {tripMembers.filter(member => member.role === 'organizer').map((organizer) => (
                            <div key={organizer.id} className="mb-4">
                              <p className="text-[#5E5854] mb-2 text-sm">
                                Organizer:
                              </p>
                              <div className="flex items-center bg-[#f8f4e3] p-3 rounded-lg border border-[#d1c7b7]">
                                <img
                                  src={getAvatarUrl(organizer)}
                                  alt={organizer.name}
                                  className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                                  onClick={() => handleViewMemberProfile(organizer)}
                                  onError={(e) => {
                                    console.log("Avatar load error for organizer:", {
                                      name: organizer.name,
                                      failedSrc: e.target.src,
                                      avatarProp: organizer.avatar
                                    });
                                    
                                    // Try a different approach if the first one fails
                                    if (!e.target.src.includes("default-avatar")) {
                                      e.target.onerror = null; // Prevent infinite error loop
                                      
                                      // Try with BACKEND_URL if it's a relative path
                                      if (organizer.avatar && !organizer.avatar.startsWith('/') && 
                                          !organizer.avatar.startsWith('http') && !organizer.avatar.startsWith('data:')) {
                                        console.log("Trying with BACKEND_URL:", `${BACKEND_URL}/${organizer.avatar}`);
                                        e.target.src = `${BACKEND_URL}/${organizer.avatar}`;
                                      } else {
                                        console.log("Falling back to default avatar");
                                        e.target.src = "/assets/images/default-avatar.webp";
                                      }
                                    }
                                  }}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h5 className="font-medium text-[#2c5e4a] cursor-pointer hover:text-[#f87c6d]"
                                        onClick={() => handleViewMemberProfile(organizer)}>
                                      {organizer.name}
                                    </h5>
                                  </div>
                                  <p className="text-xs text-[#5E5854]">Trip Creator</p>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Members Preview (showing only a few) */}
                          <div>
                            <p className="text-[#5E5854] mb-2 text-sm">
                              Members ({tripMembers.filter(member => member.role === 'member').length}):
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {tripMembers
                                .filter(member => member.role === 'member')
                                .slice(0, 4)
                                .map((member) => (
                                  <div
                                    key={member.id || `member-${member.name}`}
                                    className="flex items-center bg-[#f8f4e3] p-3 rounded-lg border border-[#d1c7b7]"
                                  >
                                    <img
                                      src={getAvatarUrl(member)}
                                      alt={member.name}
                                      className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                                      onClick={() => handleViewMemberProfile(member)}
                                      onError={(e) => {
                                        console.log("Avatar load error for member:", {
                                          name: member.name,
                                          failedSrc: e.target.src,
                                          avatarProp: member.avatar
                                        });
                                        
                                        // Try a different approach if the first one fails
                                        if (!e.target.src.includes("default-avatar")) {
                                          e.target.onerror = null; // Prevent infinite error loop
                                      
                                          // Try with BACKEND_URL if it's a relative path
                                          if (member.avatar && !member.avatar.startsWith('/') && 
                                              !member.avatar.startsWith('http') && !member.avatar.startsWith('data:')) {
                                            console.log("Trying with BACKEND_URL:", `${BACKEND_URL}/${member.avatar}`);
                                            e.target.src = `${BACKEND_URL}/${member.avatar}`;
                                          } else {
                                            console.log("Falling back to default avatar");
                                            e.target.src = "/assets/images/default-avatar.webp";
                                          }
                                        }
                                      }}
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <h5 className="font-medium text-[#2c5e4a] cursor-pointer hover:text-[#f87c6d]"
                                            onClick={() => handleViewMemberProfile(member)}>
                                          {member.name}
                                        </h5>
                                      </div>
                                      <p className="text-xs text-[#5E5854]">
                                        Joined {new Date(member.joinedDate || Date.now()).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                            {tripMembers.filter(member => member.role === 'member').length > 4 && (
                              <div className="mt-3 text-center">
                                <button
                                  onClick={() => handleViewAllMembers(selectedTrip)}
                                  className="text-[#f87c6d] hover:text-[#f8a95d] text-sm font-medium"
                                >
                                  + {tripMembers.filter(member => member.role === 'member').length - 4} more members
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Fallback to static data */}
                          <div className="mb-4">
                            <p className="text-[#5E5854] mb-2 text-sm">
                              Organizer:
                            </p>
                            <div className="flex items-center bg-[#f8f4e3] p-3 rounded-lg border border-[#d1c7b7]">
                              <img
                                src={selectedTrip.organizerAvatar || "/assets/images/default-avatar.jpg"}
                                alt={selectedTrip.organizer || "Trip Organizer"}
                                className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                                onClick={() =>
                                  handleViewMemberProfile({
                                    id: selectedTrip.organizerId || "organizer_id",
                                    name: selectedTrip.organizer || "Trip Organizer",
                                    avatar: selectedTrip.organizerAvatar || "/assets/images/default-avatar.jpg",
                                    role: "organizer",
                                  })
                                }
                              />
                              <div>
                                <h5 className="font-medium text-[#2c5e4a]">
                                  {selectedTrip.organizer || "Trip Organizer"}
                                </h5>
                                <p className="text-xs text-[#5E5854]">
                                  Trip Organizer
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <p className="text-[#5E5854] mb-2 text-sm">
                              Members ({selectedTrip.joinedMembers?.length || 0}):
                            </p>
                            {selectedTrip.joinedMembers && selectedTrip.joinedMembers.length > 0 ? (
                              <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {selectedTrip.joinedMembers
                                    .slice(0, 4)
                                    .map((member) => (
                                      <div
                                        key={member.id}
                                        className="flex items-center bg-[#f8f4e3] p-3 rounded-lg border border-[#d1c7b7]"
                                      >
                                        <img
                                          src={member.avatar || "/assets/images/default-avatar.jpg"}
                                          alt={member.name}
                                          className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                                          onClick={() => handleViewMemberProfile(member)}
                                        />
                                        <div>
                                          <h5 className="font-medium text-[#2c5e4a] cursor-pointer"
                                              onClick={() => handleViewMemberProfile(member)}>
                                            {member.name}
                                          </h5>
                                          <p className="text-xs text-[#5E5854]">
                                            Joined {member.joinedDate}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                                {selectedTrip.joinedMembers.length > 4 && (
                                  <div className="mt-3 text-center">
                                    <button
                                      onClick={() => handleViewAllMembers(selectedTrip)}
                                      className="text-[#f87c6d] hover:text-[#f8a95d] text-sm font-medium"
                                    >
                                      + {selectedTrip.joinedMembers.length - 4} more members
                                    </button>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="bg-[#f8f4e3] p-4 rounded-lg border border-[#d1c7b7] text-center">
                                <p className="text-[#5E5854] text-sm">
                                  No members have joined this trip yet. Be the first to join!
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <button
                        onClick={() => setShowTripDetails(false)}
                        className="flex-1 bg-[#5E5854] hover:bg-[#2c5e4a] text-white py-3 rounded-xl transition-colors font-cinzel"
                      >
                        Close
                      </button>

                      {joinedTrips.includes(selectedTrip.id) ? (
                        <>
                          <button
                            onClick={() => {
                              console.log('Opening group chat for trip:', selectedTrip?.id); // Debug log
                              console.log('Selected trip data:', selectedTrip); // Debug log
                              console.log('Current user:', currentUser); // Debug log
                              setShowGroupChat(true);
                              setShowTripDetails(false);
                            }}
                            className="flex-1 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white py-3 rounded-xl transition-colors font-cinzel flex items-center justify-center"
                          >
                            <FiMessageSquare className="mr-2" /> Group Chat
                          </button>
                          <button
                            onClick={() => handleLeaveTrip(selectedTrip.id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl transition-colors font-cinzel flex items-center justify-center"
                          >
                            <FiX className="mr-2" /> Leave Trip
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleJoinTrip(selectedTrip.id)}
                          disabled={selectedTrip.isFull}
                          className={`flex-1 py-3 rounded-xl transition-colors font-cinzel ${
                            selectedTrip.isFull
                              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white"
                          }`}
                        >
                          {selectedTrip.isFull ? "Trip Full" : "Join Trip"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trip Management Modal */}
          {showTripManagement && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 sm:p-6 flex justify-between items-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Trip Management: {managedTrip?.destination || managedTrip?.title}
                  </h3>
                  <button
                    onClick={() => setShowTripManagement(false)}
                    className="p-2 hover:bg-[#f8d56b] rounded-full text-white hover:text-[#2c5e4a] transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Trip Overview */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-[#d1c7b7]">
                        <h4 className="text-lg font-bold text-[#2c5e4a] mb-3">Trip Overview</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#5E5854]">Destination:</span>
                            <span className="font-medium text-[#2c5e4a]">{managedTrip?.destination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5E5854]">Dates:</span>
                            <span className="font-medium text-[#2c5e4a]">
                              {managedTrip?.fromDate && new Date(managedTrip.fromDate).toLocaleDateString()} - {managedTrip?.toDate && new Date(managedTrip.toDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5E5854]">Participants:</span>
                            <span className="font-medium text-[#2c5e4a]">
                              {managedTrip?.currentParticipants || 0} / {managedTrip?.maxPeople || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5E5854]">Budget:</span>
                            <span className="font-medium text-[#2c5e4a]">
                              {managedTrip?.budget ? `${managedTrip.budget.currency || 'INR'} ${managedTrip.budget.amount || managedTrip.budget}` : 'Not specified'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5E5854]">Transport:</span>
                            <span className="font-medium text-[#2c5e4a]">{managedTrip?.transport || 'Not specified'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#5E5854]">Status:</span>
                            <span className={`font-medium ${new Date(managedTrip?.toDate) > new Date() ? 'text-green-600' : 'text-red-600'}`}>
                              {new Date(managedTrip?.toDate) > new Date() ? 'Active' : 'Completed'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-white rounded-xl p-4 border border-[#d1c7b7]">
                        <h4 className="text-lg font-bold text-[#2c5e4a] mb-3">Quick Actions</h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              console.log('Opening group chat for managed trip:', managedTrip);
                              console.log('Trip participants:', tripParticipants);

                              // 🚀 FORMAT TRIP DATA FOR GROUP CHAT
                              const formattedTripForChat = {
                                id: managedTrip._id || managedTrip.id,
                                title: managedTrip.destination || managedTrip.title,
                                destination: managedTrip.destination,
                                image: managedTrip.coverImage || managedTrip.image || "/assets/images/default-trip.jpeg",
                                organizerId: managedTrip.createdBy || managedTrip.organizerId || effectiveUser.id,
                                organizer: managedTrip.organizerName || effectiveUser.fullName,
                                organizerAvatar: managedTrip.organizerAvatar || effectiveUser.avatar || "/assets/images/default-avatar.jpg",
                                joinedMembers: tripParticipants.map(p => ({
                                  id: p.id || p._id,
                                  name: p.name || p.fullName,
                                  avatar: p.avatar || "/assets/images/default-avatar.jpg"
                                })),
                                fromDate: managedTrip.fromDate,
                                toDate: managedTrip.toDate,
                                budget: managedTrip.budget,
                                transport: managedTrip.transport
                              };

                              console.log('Formatted trip for group chat:', formattedTripForChat);
                              setSelectedTrip(formattedTripForChat);
                              setShowGroupChat(true);
                              setShowTripManagement(false);
                            }}
                            className="w-full bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white py-2 rounded-lg transition-colors text-sm"
                          >
                            Open Group Chat
                          </button>
                          <button
                            onClick={() => {
                              // 📊 ENHANCED EXPORT PARTICIPANTS DATA
                              const exportData = {
                                tripDetails: {
                                  destination: managedTrip.destination,
                                  fromDate: managedTrip.fromDate,
                                  toDate: managedTrip.toDate,
                                  budget: `${managedTrip.budget?.currency || 'INR'} ${managedTrip.budget?.amount || managedTrip.budget}`,
                                  transport: managedTrip.transport,
                                  maxPeople: managedTrip.maxPeople,
                                  currentParticipants: tripParticipants.length
                                },
                                participants: tripParticipants.map((p, index) => ({
                                  serialNo: index + 1,
                                  name: p.name || p.fullName,
                                  email: p.email,
                                  joinedAt: p.joinedAt ? new Date(p.joinedAt).toLocaleDateString() : 'N/A',
                                  phone: p.phone || 'Not provided',
                                  status: 'Confirmed'
                                }))
                              };

                              // Create detailed text format
                              const detailedText = `
🌟 TRIP PARTICIPANTS REPORT
═══════════════════════════════════════

📍 Trip Details:
• Destination: ${exportData.tripDetails.destination}
• Dates: ${new Date(exportData.tripDetails.fromDate).toLocaleDateString()} - ${new Date(exportData.tripDetails.toDate).toLocaleDateString()}
• Budget: ${exportData.tripDetails.budget}
• Transport: ${exportData.tripDetails.transport}
• Capacity: ${exportData.tripDetails.currentParticipants}/${exportData.tripDetails.maxPeople}

👥 Participants (${exportData.participants.length}):
${exportData.participants.map(p =>
  `${p.serialNo}. ${p.name}
   📧 ${p.email}
   📅 Joined: ${p.joinedAt}
   📱 Phone: ${p.phone}
   ✅ Status: ${p.status}`
).join('\n\n')}

═══════════════════════════════════════
Generated on: ${new Date().toLocaleString()}
Export by: ${effectiveUser.fullName} (${effectiveUser.email})
                              `.trim();

                              // Create CSV format
                              const csvHeaders = 'Serial No,Name,Email,Joined Date,Phone,Status';
                              const csvData = exportData.participants.map(p =>
                                `${p.serialNo},"${p.name}","${p.email}","${p.joinedAt}","${p.phone}","${p.status}"`
                              ).join('\n');
                              const csvContent = `${csvHeaders}\n${csvData}`;

                              // Copy detailed text to clipboard
                              navigator.clipboard.writeText(detailedText);

                              // Also create downloadable CSV file
                              const blob = new Blob([csvContent], { type: 'text/csv' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `${managedTrip.destination.replace(/[^a-zA-Z0-9]/g, '_')}_participants_${new Date().toISOString().split('T')[0]}.csv`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);

                              setNotifications((prev) => [
                                {
                                  id: Date.now(),
                                  type: "success",
                                  title: "📊 Participants Data Exported Successfully!",
                                  message: `Detailed report copied to clipboard & CSV file downloaded (${tripParticipants.length} participants)`,
                                  date: new Date().toISOString(),
                                  read: false,
                                },
                                ...prev,
                              ]);
                            }}
                            className="w-full bg-[#2c5e4a] hover:bg-[#1a3a2a] text-white py-2 rounded-lg transition-colors text-sm"
                          >
                            Export Participants List
                          </button>
                          <button
                            onClick={() => handleAbandonTrip(managedTrip)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                          >
                            Abandon Trip
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Real-Time Participants List */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl p-4 border border-[#d1c7b7]">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-[#2c5e4a]">
                              Live Participants ({tripParticipants.length}/{managedTrip?.maxPeople || 0})
                          </h4>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  const headers = {};
                                  if (token) {
                                    headers['Authorization'] = `Bearer ${token}`;
                                  }

                                  const tripId = managedTrip._id || managedTrip.id;
                                  const response = await axios.get(`http://localhost:5000/api/trips/${tripId}/participants`, {
                                    headers
                                  });

                                  if (response.data.success) {
                                    setTripParticipants(response.data.participants);
                                    setNotifications((prev) => [
                                      {
                                        id: Date.now(),
                                        type: "success",
                                        title: "Participants Refreshed! ✅",
                                        message: `Updated participant list (${response.data.participants.length} participants)`,
                                        date: new Date().toISOString(),
                                        read: false,
                                      },
                                      ...prev,
                                    ]);
                                  }
                                } catch (error) {
                                  console.error('Error refreshing participants:', error);
                                }
                              }}
                              className="text-xs bg-[#f8d56b] hover:bg-[#f8a95d] text-[#2c5e4a] px-2 py-1 rounded-full transition-colors"
                            >
                            Refresh
                            </button>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-[#5E5854]">Real-time updates</span>
                            </div>
                          </div>
                        </div>

                        {tripParticipants.length === 0 ? (
                          <div className="text-center py-8 text-[#5E5854]">
                            <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="font-medium">No participants yet</p>
                            <p className="text-sm">Share your trip to get more joiners!</p>
                            <div className="mt-4 p-3 bg-[#f8f4e3] rounded-lg border border-[#d1c7b7]">
                              <p className="text-xs text-[#2c5e4a]">
                                 Tip: Use the "Export Report" button to download participant data anytime
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {tripParticipants
                              .sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate)) // Sort by most recent first
                              .map((participant, index) => {
                                const joinedDate = new Date(participant.joinedDate);
                                const memberSince = new Date(participant.memberSince);
                                const daysSinceJoined = Math.floor((new Date() - joinedDate) / (1000 * 60 * 60 * 24));
                                const isRecentJoin = daysSinceJoined <= 1;

                                return (
                                  <div
                                    key={participant.id}
                                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                                      isRecentJoin
                                        ? 'bg-gradient-to-r from-green-50 to-[#f8f4e3] border-green-200 shadow-md'
                                        : 'bg-[#f8f4e3] border-[#d1c7b7]'
                                    }`}
                                  >
                                    <div className="relative">
                                      <img
                                        src={participant.avatar || "/assets/images/Alexrivera.jpeg"}
                                        alt={participant.name}
                                        className="w-12 h-12 rounded-full border-2 border-[#f8d56b] object-cover"
                                        onError={(e) => {
                                          e.target.src = "/assets/images/Alexrivera.jpeg";
                                        }}
                                      />
                                      {isRecentJoin && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs">✓</span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2">
                                        <h5 className="font-medium text-[#2c5e4a]">{participant.name}</h5>
                                        {index === 0 && (
                                          <span className="text-xs bg-[#f8d56b] text-[#2c5e4a] px-2 py-1 rounded-full font-medium">
                                            Latest
                                          </span>
                                        )}
                                        {isRecentJoin && (
                                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                            New!
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-[#5E5854] mt-1">{participant.email}</p>
                                      <div className="flex items-center space-x-4 mt-2">
                                        <div className="flex items-center space-x-1">
                                          <FiCalendar className="w-3 h-3 text-[#5E5854]" />
                                          <span className="text-xs text-[#5E5854]">
                                            {joinedDate.toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: joinedDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                                            })} at {joinedDate.toLocaleTimeString('en-US', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: true
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <FiClock className="w-3 h-3 text-[#5E5854]" />
                                          <span className="text-xs text-[#5E5854]">
                                            {daysSinceJoined === 0 ? 'Today' :
                                             daysSinceJoined === 1 ? 'Yesterday' :
                                             `${daysSinceJoined} days ago`}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="space-y-1">
                                        <span className="text-xs text-[#5E5854] bg-white px-2 py-1 rounded-full block">
                                          Member since {memberSince.getFullYear()}
                                        </span>
                                        <span className="text-xs text-[#2c5e4a] font-medium">
                                          #{index + 1}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        {/* Participants Summary */}
                        {tripParticipants.length > 0 && (
                          <div className="mt-4 p-3 bg-gradient-to-r from-[#f8f4e3] to-[#f0d9b5] rounded-lg border border-[#d1c7b7]">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-lg font-bold text-[#2c5e4a]">{tripParticipants.length}</p>
                                <p className="text-xs text-[#5E5854]">Total Joined</p>
                              </div>
                              <div>
                                <p className="text-lg font-bold text-[#2c5e4a]">
                                  {Math.max(0, (managedTrip?.maxPeople || 0) - tripParticipants.length)}
                                </p>
                                <p className="text-xs text-[#5E5854]">Spots Left</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-[#d1c7b7] p-4 sm:p-6">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowTripManagement(false)}
                      className="px-6 py-2 border border-[#d1c7b7] text-[#5E5854] rounded-lg hover:bg-[#f8f4e3] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completed Trips Section */}
          <section
            id="completed"
            className="space-y-4 sm:space-y-6 scroll-mt-24"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl sm:text-3xl font-bold text-[#2c5e4a]">
                The road so far
              </h3>
              <button
                onClick={() =>
                  navigate("/profile", { state: { activeTab: "memories" } })
                }
                className="text-[#f87c6d] hover:text-[#f8a95d] text-sm font-medium flex items-center"
              >
                View All <FiArrowRight className="ml-1" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* 🚀 REAL-TIME COMPLETED TRIPS ONLY */}
              {completedTrips.length > 0 ? (
                completedTrips.map((trip, index) => (
                  <div
                    key={trip._id || trip.id}
                    className="bg-white rounded-2xl overflow-hidden border border-[#d1c7b7] shadow-lg transition-all duration-300 transform hover:scale-105 hover:z-10 hover:ring-2 hover:ring-[#f8a95d]"
                    onClick={() => {
                      setSelectedCompletedTrip(trip);
                      setShowCompletedTripDetails(true);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="relative h-48 sm:h-64">
                      <img
                        src={trip.coverImage || "/assets/images/default-trip.jpeg"}
                        alt={trip.destination}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('🖼️ Completed trip image failed to load:', trip.destination, 'Original src:', e.target.src);
                          e.target.src = "/assets/images/default-trip.jpeg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6">
                        <div className="flex items-center mb-2">
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                             Completed
                          </span>
                          {trip.autoCompleted && (
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold ml-2">
                               Auto
                            </span>
                          )}
                        </div>
                        <h4 className="text-xl sm:text-2xl font-bold text-white">
                          {trip.destination}
                        </h4>
                        <p className="text-white/90">{trip.departure} → {trip.destination}</p>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-white flex items-center">
                            <FiCalendar className="mr-1" />
                            {trip.completedAt ?
                              new Date(trip.completedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                              new Date(trip.toDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                            }
                          </span>
                          <div className="flex items-center">
                            <span className="flex items-center text-white bg-black/30 px-2 py-1 rounded-full">
                              <FiStar className="text-[#f8d56b] mr-1" />
                              {trip.rating || 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-white flex items-center text-sm">
                            <FiUsers className="mr-1" /> {trip.participantCount || trip.numberOfPeople || 0} travelers
                          </span>
                          <span className="text-white/80 text-sm">
                            by {trip.createdBy?.fullName || trip.organizer || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // 📭 NO COMPLETED TRIPS MESSAGE
                <div className="col-span-1 sm:col-span-2 bg-white p-8 rounded-xl border border-[#d1c7b7] text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <FiMapPin className="w-16 h-16 text-[#a8c4b8] mb-4" />
                    <h4 className="text-xl font-bold text-[#2c5e4a] mb-2">No Completed Trips Yet</h4>
                    <p className="text-gray-600 mb-4">
                      When trips reach their end date, they'll automatically appear here as completed adventures.
                    </p>
                    <p className="text-sm text-gray-500">
                      🤖 Trips are automatically completed when their end date is reached
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-3xl font-bold text-[#2c5e4a]">
              Chronicles of Nomads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-2xl p-4 sm:p-6 border border-[#d1c7b7] shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#f8d56b] mr-3 sm:mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-[#2c5e4a]">
                        {testimonial.name}
                      </h4>
                      <p className="text-[#5E5854] text-xs sm:text-sm">
                        {testimonial.trip}
                      </p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`${
                          i < testimonial.rating
                            ? "text-[#f8d56b] fill-[#f8d56b]"
                            : "text-gray-300"
                        } w-4 h-4 sm:w-5 sm:h-5`}
                      />
                    ))}
                  </div>
                  <p className="text-[#5E5854] text-sm sm:text-base">
                    {testimonial.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Destinations Section */}
          <section id="destinations" className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-3xl font-bold text-[#2c5e4a]">Popular Destinations</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {popularDestinations.map((destination) => (
                <div 
                  key={destination._id || destination.id} 
                  className="relative rounded-xl overflow-hidden h-40 sm:h-56 group cursor-pointer"
                  onClick={() => handleDestinationClick(destination)}
                >
                  <img 
                    src={destination.image} 
                    alt={destination.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/assets/images/default-trip.jpeg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-3 sm:p-4">
                    <h4 className="text-white font-bold text-lg">{destination.name}</h4>
                    <p className="text-white/80 text-sm">{destination.country}</p>
                    <p className="text-white/70 text-xs">{destination.visits} visits</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Post Trip Modal */}
          {showPostTrip && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
              <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header with Close Button */}
                <div className="sticky top-0 bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] z-10 flex justify-between items-center p-4 border-b border-[#5E5854]">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Post a New Trip</h3>
                  <button 
                    onClick={() => setShowPostTrip(false)}
                    className="text-white hover:text-[#f8d56b] p-2 rounded-full"
                  >
                    <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Form Content */}
                <form className="p-4 sm:p-6" onSubmit={handlePostTrip}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[#5E5854] font-medium mb-2">
                        Destination<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="destination"
                        value={newTrip.destination}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                        placeholder="e.g. Bali, Indonesia"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#5E5854] font-medium mb-2">
                        Departure From<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="departure"
                        value={newTrip.departure}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                        placeholder="e.g. New York, USA"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[#5E5854] font-medium mb-2">
                        From<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="fromDate"
                        value={newTrip.fromDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#5E5854] font-medium mb-2">
                        To<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="toDate"
                        value={newTrip.toDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[#5E5854] font-medium mb-2">
                        Transport<span className="text-red-500">*</span>
                      </label>
                      <select
                        name="transport"
                        value={newTrip.transport}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                        required
                      >
                        <option value="">Select transport</option>
                        <option value="Flight">Flight</option>
                        <option value="Train">Train</option>
                        <option value="Bus">Bus</option>
                        <option value="Car">Car</option>
                        <option value="Cruise">Cruise</option>
                        <option value="Multiple">Multiple</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#5E5854] font-medium mb-2">
                        Budget<span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-2">
                        <select
                          name="currency"
                          value={newTrip.currency}
                          onChange={handleInputChange}
                          className="w-24 px-2 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                          required
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="AUD">AUD</option>
                          <option value="CAD">CAD</option>
                          <option value="CHF">CHF</option>
                          <option value="CNY">CNY</option>
                          <option value="INR">INR</option>
                          <option value="SGD">SGD</option>
                        </select>
                        <input
                          type="number"
                          name="budget"
                          value={newTrip.budget}
                          onChange={handleInputChange}
                          className="flex-1 px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                          placeholder="Enter amount"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[#5E5854] font-medium mb-2">
                        Current Number of People
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="numberOfPeople"
                        value={
                          newTrip.numberOfPeople === 0
                            ? ""
                            : newTrip.numberOfPeople
                        }
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                        placeholder="e.g. 2"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[#5E5854] font-medium mb-2">
                        Max People<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="maxPeople"
                        value={newTrip.maxPeople === 0 ? "" : newTrip.maxPeople}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                        placeholder="e.g. 6"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[#5E5854] font-medium mb-2">
                      Comfortable with
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="genderPreference"
                          value="anyone"
                          checked={newTrip.genderPreference === "anyone"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            newTrip.genderPreference === "anyone"
                              ? "bg-[#2c5e4a] text-white"
                              : "bg-[#f8f4e3] text-[#5E5854] hover:bg-[#f0d9b5]"
                          }`}
                        >
                          Male
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="genderPreference"
                          value="menOnly"
                          checked={newTrip.genderPreference === "menOnly"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            newTrip.genderPreference === "menOnly"
                              ? "bg-[#2c5e4a] text-white"
                              : "bg-[#f8f4e3] text-[#5E5854] hover:bg-[#f0d9b5]"
                          }`}
                        >
                          Female
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="genderPreference"
                          value="womenOnly"
                          checked={newTrip.genderPreference === "womenOnly"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            newTrip.genderPreference === "womenOnly"
                              ? "bg-[#2c5e4a] text-white"
                              : "bg-[#f8f4e3] text-[#5E5854] hover:bg-[#f0d9b5]"
                          }`}
                        >
                          Couple
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[#5E5854] font-medium mb-2">
                      Trip Category<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={newTrip.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Beach">Beach</option>
                      <option value="City">City</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Mountain">Mountain</option>
                      <option value="Road Trip">Road Trip</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[#5E5854] font-medium mb-2">
                      Accommodation<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="accommodation"
                      value={newTrip.accommodation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                      required
                    >
                      <option value="Included">Included</option>
                      <option value="Not included">Not included</option>
                      <option value="Will discuss further">Will discuss further</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[#5E5854] font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={newTrip.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854] min-h-[100px]"
                      placeholder="Describe your trip..."
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="block text-[#5E5854] font-medium mb-2">
                      Trip Cover Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="trip-cover-image"
                        />
                        <label
                          htmlFor="trip-cover-image"
                          className="flex items-center justify-center w-full px-4 py-2 border border-[#d1c7b7] rounded-lg bg-white hover:bg-[#f8f4e3] text-[#5E5854] cursor-pointer transition-colors"
                        >
                          <FiCamera className="mr-2" />
                          {newTrip.coverImage ? "Change Image" : "Upload Image"}
                        </label>
                      </div>
                      {newTrip.coverImage && newTrip.coverImagePreview && (
                        <div className="w-24 h-24 relative">
                          <img
                            src={newTrip.coverImagePreview}
                            alt="Trip cover preview"
                            className="w-full h-full object-cover rounded-lg border border-[#d1c7b7]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              // Clean up the preview URL
                              if (newTrip.coverImagePreview) {
                                URL.revokeObjectURL(newTrip.coverImagePreview);
                              }
                              setNewTrip((prev) => ({
                                ...prev,
                                coverImage: null,
                                coverImagePreview: null,
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#5E5854] mt-1">
                      Recommended: landscape orientation, at least 800x600px
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPostTrip(false)}
                      className="bg-[#5E5854] hover:bg-[#2c5e4a] text-white px-6 py-2 rounded-full transition-colors font-cinzel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-6 py-2 rounded-full transition-colors font-cinzel"
                    >
                      Post Trip
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
                <h2 className="text-2xl font-bold text-[#2c5e4a] mb-4">Trip Posted!</h2>
                <p className="text-[#5E5854] mb-6">Your trip has been successfully posted.</p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-6 py-2 rounded-full font-cinzel"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Group Chat Modal */}
          {showGroupChat && selectedTrip && (
            <GroupChat
              trip={selectedTrip}
              currentUser={effectiveUser}
              onClose={() => {
                console.log('Closing group chat');
                setShowGroupChat(false);
              }}
            />
          )}

          {/* Photo Modal */}
          {showPhotoModal && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="relative max-w-5xl w-full max-h-[90vh]">
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="absolute top-4 right-4 text-white text-4xl z-10 hover:text-[#f87c6d]"
                >
                  <FiX />
                </button>
                <img
                  src={selectedPhoto}
                  alt="Enlarged view"
                  className="w-full h-full object-contain max-h-[90vh]"
                />
              </div>
            </div>
          )}

          {/* Member Profile Modal */}
          {showMemberProfile && selectedMember && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <img
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      className="w-32 h-32 rounded-full border-4 border-[#f8d56b] object-cover mb-4"
                    />
                    <h4 className="text-2xl font-bold text-[#2c5e4a]">{selectedMember.fullName || selectedMember.name}</h4>
                    <p className="text-[#5E5854]">{selectedMember.location}</p>
                  </div>
                  
                  <Profile
                    currentUser={currentUser}
                    userId={selectedMember.id || selectedMember._id}
                    onClose={() => setShowMemberProfile(false)}
                    onMessage={() => handleProfileMessage()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Member Profiles Modal */}
          {showMemberProfiles && selectedTripForMembers && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-[#d1c7b7]">
                  <h3 className="text-xl font-bold text-[#2c5e4a]">
                    Trip Members
                  </h3>
                  <button
                    onClick={() => setShowMemberProfiles(false)}
                    className="text-[#5E5854] hover:text-[#2c5e4a] p-2 rounded-full"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <MemberProfiles
                    trip={selectedTripForMembers}
                    onStartChat={handleStartChatWithMember}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Join Notification Modal */}
          {showJoinModal && joinedTripInfo && (
            <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center">
              <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
                <h2 className="text-2xl font-bold text-[#2c5e4a] mb-4">
                  Trip Joined!
                </h2>
                <p className="text-[#5E5854] mb-6 text-center">
                  You have successfully joined{" "}
                  <span className="font-bold">{joinedTripInfo.title}</span>.
                  <br />
                  What would you like to do next?
                </p>
                <img
                  src={joinedTripInfo.image}
                  alt={joinedTripInfo.title}
                  className="w-32 h-32 object-cover rounded-xl mb-6 border border-[#d1c7b7]"
                />
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    className="flex-1 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white py-3 rounded-xl font-cinzel text-lg"
                    onClick={() => {
                      setShowJoinModal(false);
                      setShowTripDetails(true);
                      setSelectedTrip(joinedTripInfo);
                    }}
                  >
                    Know More About This Trip
                  </button>
                  <button
                    className="flex-1 bg-[#2c5e4a] hover:bg-[#5E5854] text-white py-3 rounded-xl font-cinzel text-lg"
                    onClick={() => {
                      setShowJoinModal(false);
                      setShowGroupChat(true);
                      setSelectedTrip(joinedTripInfo);
                    }}
                  >
                    Go to Group Chat
                  </button>
                </div>
                <button
                  className="mt-6 text-[#f87c6d] hover:text-[#f8a95d] text-sm underline"
                  onClick={() => setShowJoinModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}



          {showSuccessModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
                <h2 className="text-2xl font-bold text-[#2c5e4a] mb-4">Trip Posted!</h2>
                <p className="text-[#5E5854] mb-6">Your trip has been successfully posted.</p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-6 py-2 rounded-full font-cinzel"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Completed Trip Details Modal */}
          {showCompletedTripDetails && selectedCompletedTrip && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl w-full max-w-3xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 sm:p-6 flex justify-between items-center">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedCompletedTrip.title} <span className="ml-2 bg-[#f8d56b] text-[#2c5e4a] px-2 py-1 rounded-full text-xs font-bold">Completed</span>
                  </h3>
                  <button
                    onClick={() => setShowCompletedTripDetails(false)}
                    className="p-2 hover:bg-[#f8d56b] rounded-full text-white hover:text-[#2c5e4a] transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="relative h-64 rounded-xl overflow-hidden">
                        <img
                          src={selectedCompletedTrip.image}
                          alt={selectedCompletedTrip.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {selectedCompletedTrip.rating} ★
                          </span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#d1c7b7]">
                        <h4 className="font-bold text-[#2c5e4a] mb-3">
                          Trip Details
                        </h4>
                        <div className="space-y-2 text-[#5E5854]">
                          <p><span className="font-medium">Destination:</span> {selectedCompletedTrip.destination}</p>
                          <p><span className="font-medium">Date:</span> {selectedCompletedTrip.date}</p>
                          <p><span className="font-medium">Participants:</span> {selectedCompletedTrip.participants}</p>
                          <p><span className="font-medium">Status:</span> Completed</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] mb-6">
                      <h4 className="font-bold text-[#2c5e4a] mb-3">About This Trip</h4>
                      <p className="text-[#5E5854]">
                        {selectedCompletedTrip.description || "No description available."}
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowCompletedTripDetails(false)}
                        className="bg-[#5E5854] hover:bg-[#2c5e4a] text-white px-6 py-2 rounded-full transition-colors font-cinzel"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="bg-[#2c5e4a] text-white py-12 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4 text-[#f8d56b]">
                NomadNova
              </h4>
              <p className="text-[#a8c4b8]">
                Connecting travelers worldwide for unforgettable shared
                experiences.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Explore</h5>
              <ul className="space-y-2 text-[#a8c4b8]">
                <li>
                  <a
                    href="#trips"
                    className="hover:text-[#f8d56b] transition-colors"
                  >
                    Available Trips
                  </a>
                </li>
                <li>
                  <a
                    href="#completed"
                    className="hover:text-[#f8d56b] transition-colors"
                  >
                    The road so far
                  </a>
                </li>
                <li>
                  <a
                    href="#destinations"
                    className="hover:text-[#f8d56b] transition-colors"
                  >
                    Popular Destinations
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Company</h5>
              <ul className="space-y-2 text-[#a8c4b8]">
                <li>
                  <a
                    href="/about-us"
                    className="hover:text-[#f8d56b] transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-and-conditions"
                    className="hover:text-[#f8d56b] transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy-policy"
                    className="hover:text-[#f8d56b] transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contact</h5>
              <ul className="space-y-2 text-[#a8c4b8]">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:info@nomadnova.com"
                    className="hover:text-[#f8d56b]"
                  >
                    info@nomadnova.com
                  </a>
                </li>
                <li>
                  Support:{" "}
                  <a
                    href="mailto:support@nomadnova.com"
                    className="hover:text-[#f8d56b]"
                  >
                    support@nomadnova.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-[#a8c4b8] text-sm">
            &copy; {new Date().getFullYear()} NomadNova. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 🏆 LEADERBOARD MODAL */}
      {showLeaderboard && (
        <LeaderboardPage
          onClose={() => setShowLeaderboard(false)}
          currentUser={effectiveUser}
        />
      )}
    </>
  );
}

export default Dashboard;
