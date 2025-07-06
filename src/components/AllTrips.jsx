import React, { useState, useEffect } from "react";
import { FiMapPin, FiCalendar, FiUsers, FiArrowLeft, FiSearch, FiFilter, FiDollarSign, FiClock, FiRefreshCw, FiX, FiActivity, FiMessageSquare } from "react-icons/fi";
import { BsRecord2Fill } from 'react-icons/bs';
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Define the backend URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// 🎯 REAL-TIME CATEGORIES - Will be populated from backend data
const defaultCategories = [
  "All", "Adventure", "Beach", "City", "Mountain", "Cultural", "Wildlife", "Food", "Sports", "Relaxation"
];

// 🚀 TRANSPORT OPTIONS FOR FILTERING
const transportOptions = [
  "All", "Flight", "Train", "Bus", "Car", "Bike", "Boat", "Multiple"
];

// 💰 BUDGET RANGES FOR FILTERING
const budgetRanges = [
  { label: "All Budgets", min: 0, max: Infinity },
  { label: "Under ₹10,000", min: 0, max: 10000 },
  { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
  { label: "₹25,000 - ₹50,000", min: 25000, max: 50000 },
  { label: "₹50,000 - ₹1,00,000", min: 50000, max: 100000 },
  { label: "Above ₹1,00,000", min: 100000, max: Infinity }
];

// Helper function to generate activities based on category
const generateActivitiesFromCategory = (category) => {
  const activityMap = {
    'Adventure': ['Hiking', 'Rock Climbing', 'Zip-lining', 'Rafting', 'Paragliding'],
    'Beach': ['Swimming', 'Snorkeling', 'Beach Volleyball', 'Sunbathing', 'Beach Parties'],
    'City': ['City Tours', 'Museum Visits', 'Shopping', 'Local Cuisine Tasting', 'Nightlife'],
    'Cultural': ['Historical Site Visits', 'Local Festivals', 'Art Galleries', 'Traditional Performances', 'Cooking Classes'],
    'Mountain': ['Trekking', 'Skiing', 'Mountain Biking', 'Photography', 'Camping'],
    'Road Trip': ['Scenic Drives', 'Local Stops', 'Photography', 'Camping', 'Local Food Tasting']
  };
  
  return activityMap[category] || ['Sightseeing', 'Local Cuisine', 'Photography', 'Shopping', 'Relaxation'];
};

export default function AllTrips({ currentUser }) {
  // 🚀 STATE MANAGEMENT FOR REAL-TIME DATA
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔍 SEARCH AND FILTER STATES
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTransport, setSelectedTransport] = useState("All");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState(0); // Index of budgetRanges
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, price-low, price-high, spots
  const [showFilters, setShowFilters] = useState(false);

  // 📊 DYNAMIC CATEGORIES FROM BACKEND DATA
  const [categories, setCategories] = useState(defaultCategories);

  const navigate = useNavigate();

  // � USER AUTHENTICATION AND JOIN TRIP STATES

  const [joinedTrips, setJoinedTrips] = useState([]); // array of trip ids
  const [notifications, setNotifications] = useState([]);

  // Get effective user (fallback for development)
  const effectiveUser = currentUser || {
    id: 'development-user',
    _id: 'development-user',
    fullName: 'Development User',
    email: 'dev@example.com',
    avatar: '/assets/images/default-avatar.jpg'
  };

  // �🚀 FETCH REAL-TIME TRIPS FROM BACKEND
  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${BACKEND_URL}/api/trips`);

      if (response.data.success) {
        const tripsData = response.data.trips;
        console.log('🚀 Fetched real-time trips:', tripsData);

        // Transform backend data to match frontend format
        const transformedTrips = tripsData.map(trip => ({
          id: trip._id,
          title: trip.destination,
          destination: trip.destination,
          departure: trip.departure,
          date: `${new Date(trip.fromDate).toLocaleDateString()} - ${new Date(trip.toDate).toLocaleDateString()}`,
          fromDate: trip.fromDate,
          toDate: trip.toDate,
          image: trip.coverImage || "/assets/images/default-trip.jpeg",
          spots: Math.max(0, trip.maxPeople - (trip.currentParticipants || 0)),
          maxSpots: trip.maxPeople,
          currentParticipants: trip.currentParticipants || 0,
          category: trip.category || "Adventure",
          transport: trip.transport || "Multiple",
          budget: trip.budget?.amount || 0,
          currency: trip.budget?.currency || "INR",
          description: trip.description || "",
          organizer: trip.createdBy?.fullName || "Unknown",
          organizerEmail: trip.createdBy?.email,
          createdAt: trip.createdAt,
          status: trip.status || "upcoming",
          accommodation: trip.accommodation || "Will discuss further", // Ensure accommodation is included
          activities: trip.activities || generateActivitiesFromCategory(trip.category || "Adventure") // Ensure activities are included
        }));

        setTrips(transformedTrips);

        // 📊 Extract unique categories from real data
        const uniqueCategories = ["All", ...new Set(transformedTrips.map(trip => trip.category))];
        setCategories(uniqueCategories);

      } else {
        throw new Error(response.data.message || 'Failed to fetch trips');
      }
    } catch (err) {
      console.error('❌ Error fetching trips:', err);
      setError(err.message || 'Failed to load trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // � FETCH USER'S JOINED TRIPS
  const fetchJoinedTrips = async () => {
    try {
      const userIdForAPI = effectiveUser._id || effectiveUser.id;
      if (userIdForAPI && userIdForAPI !== 'development-user') {
        const response = await fetch(`/api/joined-trips/${userIdForAPI}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setJoinedTrips(data.map(trip => trip.id || trip._id));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching joined trips:', error);
    }
  };

  // �🔄 FETCH TRIPS AND JOINED TRIPS ON COMPONENT MOUNT
  useEffect(() => {
    fetchTrips();
    fetchJoinedTrips();
  }, [effectiveUser]);

  // 🚀 JOIN TRIP FUNCTIONALITY - Same logic as Dashboard.jsx
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
      alert("🚫 Cannot Join Your Own Trip\n\nYou cannot join a trip that you created. Use 'Manage Trip' to see participants and trip details.");
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

        // Show success notification
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "success",
            title: "🎉 Successfully Joined Trip!",
            message: `You have joined the trip to ${tripObj.destination}. The organizer has been notified.`,
            date: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);

        alert(`🎉 Successfully joined the trip to ${tripObj.destination}! The organizer has been notified.`);

        // 🔄 REFRESH DATA TO GET BACKEND UPDATES
        // Refresh trips to get updated participant counts
        setTimeout(() => {
          fetchTrips(); // 📊 Refresh trips with updated statistics
        }, 500); // Small delay to ensure backend data is updated

      } catch (error) {
        console.error("Error joining trip:", error);
        alert("❌ Failed to Join Trip\n\n" + (error.message || "An unexpected error occurred while joining the trip."));
      }
    } else {
      alert("⚠️ Already Joined\n\nYou have already joined this trip.");
    }
  };

  // 🚪 LEAVE TRIP FUNCTIONALITY - Same logic as Dashboard.jsx
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
      fetchTrips();
      fetchJoinedTrips();

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

    } catch (error) {
      console.error("Error leaving trip:", error);
      alert("❌ Failed to Leave Trip\n\n" + (error.message || "An unexpected error occurred while leaving the trip."));
    }
  };

  // 🔍 ADVANCED FILTERING LOGIC
  const filteredTrips = trips.filter((trip) => {
    // Search filter
    const matchesSearch = search === "" ||
      trip.title.toLowerCase().includes(search.toLowerCase()) ||
      trip.destination.toLowerCase().includes(search.toLowerCase()) ||
      trip.departure.toLowerCase().includes(search.toLowerCase()) ||
      trip.organizer.toLowerCase().includes(search.toLowerCase());

    // Category filter
    const matchesCategory = selectedCategory === "All" || trip.category === selectedCategory;

    // Transport filter
    const matchesTransport = selectedTransport === "All" || trip.transport === selectedTransport;

    // Budget filter
    const selectedBudget = budgetRanges[selectedBudgetRange];
    const matchesBudget = trip.budget >= selectedBudget.min && trip.budget <= selectedBudget.max;

    return matchesSearch && matchesCategory && matchesTransport && matchesBudget;
  });

  // 🔄 SORTING LOGIC
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "price-low":
        return a.budget - b.budget;
      case "price-high":
        return b.budget - a.budget;
      case "spots":
        return b.spots - a.spots;
      case "newest":
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="min-h-screen bg-[#f8f4e3]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-6 flex flex-col sm:flex-row justify-between items-center shadow-md">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-white hover:text-[#f8d56b] font-medium text-base mb-4 sm:mb-0"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white tracking-wide drop-shadow-sm">
            All Trips
          </h2>
          {!loading && (
            <p className="text-[#f8d56b] text-sm mt-1">
              {trips.length} ongoing & upcoming trips available
            </p>
          )}
        </div>
        <button
          onClick={fetchTrips}
          disabled={loading}
          className="flex items-center text-white hover:text-[#f8d56b] font-medium text-base mb-4 sm:mb-0 disabled:opacity-50"
        >
          <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* 🔍 ENHANCED SEARCH AND FILTER SECTION */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-8">
        {/* Search Bar and Filter Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search trips, destinations, organizers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] outline-none text-[#2c5e4a] bg-white/90 shadow-sm"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#5E5854] w-5 h-5" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-3 rounded-lg font-semibold text-sm shadow-sm transition-colors ${
              showFilters
                ? "bg-[#f8d56b] text-[#2c5e4a]"
                : "bg-white text-[#5E5854] border border-[#d1c7b7] hover:bg-[#f8f4e3]"
            }`}
          >
            <FiFilter className="mr-2" />
            Filters {filteredTrips.length !== trips.length && `(${filteredTrips.length})`}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[#5E5854] text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] outline-none text-[#2c5e4a] bg-white text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="spots">Most Spots Available</option>
            </select>
          </div>
        </div>

        {/* 🎛️ ADVANCED FILTERS PANEL */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-[#d1c7b7] p-6 mb-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Category Filter */}
              <div>
                <label className="block text-[#2c5e4a] font-semibold mb-3">Category</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat
                          ? "bg-[#f8d56b] text-[#2c5e4a] font-semibold"
                          : "bg-[#f8f4e3] text-[#5E5854] hover:bg-[#f0d9b5]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transport Filter */}
              <div>
                <label className="block text-[#2c5e4a] font-semibold mb-3">Transport</label>
                <div className="space-y-2">
                  {transportOptions.map((transport) => (
                    <button
                      key={transport}
                      onClick={() => setSelectedTransport(transport)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedTransport === transport
                          ? "bg-[#f8d56b] text-[#2c5e4a] font-semibold"
                          : "bg-[#f8f4e3] text-[#5E5854] hover:bg-[#f0d9b5]"
                      }`}
                    >
                      {transport}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Filter */}
              <div>
                <label className="block text-[#2c5e4a] font-semibold mb-3">Budget Range</label>
                <div className="space-y-2">
                  {budgetRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedBudgetRange(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedBudgetRange === index
                          ? "bg-[#f8d56b] text-[#2c5e4a] font-semibold"
                          : "bg-[#f8f4e3] text-[#5E5854] hover:bg-[#f0d9b5]"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter Summary & Clear */}
              <div>
                <label className="block text-[#2c5e4a] font-semibold mb-3">Filter Summary</label>
                <div className="space-y-2">
                  <div className="text-sm text-[#5E5854] bg-[#f8f4e3] p-3 rounded-lg">
                    <p><strong>{sortedTrips.length}</strong> trips found</p>
                    <p className="text-xs mt-1">
                      {selectedCategory !== "All" && `Category: ${selectedCategory}`}
                      {selectedTransport !== "All" && ` • Transport: ${selectedTransport}`}
                      {selectedBudgetRange !== 0 && ` • Budget: ${budgetRanges[selectedBudgetRange].label}`}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedTransport("All");
                      setSelectedBudgetRange(0);
                      setSearch("");
                      setSortBy("newest");
                    }}
                    className="w-full px-3 py-2 bg-[#f87c6d] hover:bg-[#f8a95d] text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🚀 REAL-TIME TRIP CARDS */}
        {loading ? (
          // 🔄 LOADING STATE
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f8a95d] mb-4"></div>
            <p className="text-[#5E5854] text-lg">Loading real-time trips...</p>
          </div>
        ) : error ? (
          // ❌ ERROR STATE
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg font-semibold mb-2">Failed to load trips</p>
            <p className="text-[#5E5854] mb-4">{error}</p>
            <button
              onClick={fetchTrips}
              className="px-6 py-3 bg-[#f8a95d] hover:bg-[#f87c6d] text-white rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {sortedTrips.length === 0 ? (
              // 📭 NO TRIPS FOUND
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#2c5e4a] mb-2">No trips found</h3>
                <p className="text-[#5E5854] mb-4">
                  {search || selectedCategory !== "All" || selectedTransport !== "All" || selectedBudgetRange !== 0
                    ? "Try adjusting your filters or search terms"
                    : "No ongoing or upcoming trips available at the moment"}
                </p>
                {(search || selectedCategory !== "All" || selectedTransport !== "All" || selectedBudgetRange !== 0) && (
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedTransport("All");
                      setSelectedBudgetRange(0);
                      setSearch("");
                    }}
                    className="px-6 py-3 bg-[#f8a95d] hover:bg-[#f87c6d] text-white rounded-lg font-semibold transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              // 🎯 REAL-TIME TRIP CARDS
              sortedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="group relative bg-white rounded-3xl overflow-hidden shadow-xl border border-[#d1c7b7] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                  onClick={() => {
                    // TODO: Add trip details modal or navigation
                    console.log('Trip clicked:', trip);
                  }}
                >
                  <div className="relative h-56">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/assets/images/default-trip.jpeg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className={`text-white text-sm font-semibold px-3 py-1 rounded-full shadow flex items-center ${
                        trip.spots > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <FiUsers className="mr-1" />
                        {trip.spots > 0 ? `${trip.spots} Spots Left` : 'FULL'}
                      </div>
                      {trip.status === 'ongoing' && (
                        <div className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow flex items-center">
                          <BsRecord2Fill className="mr-1" color="red" /> LIVE
                        </div>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 bg-[#f8d56b] text-[#2c5e4a] text-xs font-bold px-3 py-1 rounded-full shadow">
                      {trip.category}
                    </div>

                    {/* Trip Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-[#f8d56b] transition-colors">
                        {trip.title}
                      </h3>
                      <p className="text-white/90 text-sm flex items-center mb-1">
                        <FiMapPin className="mr-1" /> {trip.departure} → {trip.destination}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-b from-[#fffaf0] to-[#f8f4e3]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-[#5E5854] text-sm">
                        <FiCalendar className="mr-1" />
                        <span>{trip.date}</span>
                      </div>
                      <div className="flex items-center text-[#2c5e4a] font-semibold">
                        <FiDollarSign className="mr-1" />
                        <span>{trip.currency} {trip.budget.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-[#5E5854] text-sm">
                        <FiUsers className="mr-1" />
                        <span>{trip.currentParticipants}/{trip.maxSpots} joined</span>
                      </div>
                      <div className="text-[#5E5854] text-sm">
                         {trip.transport}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-[#5E5854] text-sm">
                        by <span className="font-semibold text-[#2c5e4a]">{trip.organizer}</span>
                      </div>
                      <div className="flex items-center text-[#5E5854] text-xs">
                        <FiClock className="mr-1" />
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {trip.description && (
                      <p className="text-[#5E5854] text-sm mt-3 line-clamp-2">
                        {trip.description}
                      </p>
                    )}

                    {/* 🚀 JOIN TRIP BUTTON / JOINED ACTIONS */}
                    <div className="mt-4 pt-3 border-t border-[#d1c7b7]">
                      {joinedTrips.includes(trip.id) ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center py-2 px-4 bg-green-500 text-white rounded-lg text-sm font-semibold">
                            <FiActivity className="mr-1" /> Already Joined
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                // TODO: Add group chat functionality for AllTrips
                                alert("Group Chat feature coming soon for AllTrips page!");
                              }}
                              className="py-2 px-3 bg-[#f8a95d] hover:bg-[#f87c6d] text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center"
                            >
                              <FiMessageSquare className="mr-1" /> Chat
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click
                                handleLeaveTrip(trip.id);
                              }}
                              className="py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center"
                            >
                              <FiX className="mr-1" /> Leave
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleJoinTrip(trip.id);
                          }}
                          disabled={trip.spots === 0}
                          className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                            trip.spots === 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#f8a95d] hover:bg-[#f87c6d] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                          }`}
                        >
                          {trip.spots === 0 ? (
                            <><FiX className="inline mr-1" /> Trip Full</>
                          ) : (
                            <><FiActivity className="inline mr-1" /> Join Trip ({trip.spots} spots left)</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
