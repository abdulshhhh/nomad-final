import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  FiCalendar, FiMapPin, FiUsers, FiDollarSign, 
  FiHome, FiTruck, FiActivity 
} from 'react-icons/fi';

export default function TripDetailsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  
  // Filtering and sorting states
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);

  // Add this state to store the cost breakdown
  const [costBreakdown, setCostBreakdown] = useState(null);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        // Fetch all trips
        const response = await axios.get(`${BACKEND_URL}/api/trips`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        if (!response.data || !response.data.success) {
          throw new Error("Failed to fetch trips data");
        }
        
        // For each trip, fetch additional details like joined users
        const tripsWithDetails = await Promise.all(
          response.data.trips.map(async (trip) => {
            try {
              // Fetch organizer details
              const organizerResponse = await axios.get(`${BACKEND_URL}/api/profile/${trip.createdBy}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              
              // Fetch joined users if available
              let joinedUsers = [];
              if (trip.joinedMembers && trip.joinedMembers.length > 0) {
                const joinedUsersPromises = trip.joinedMembers.map(userId => 
                  axios.get(`${BACKEND_URL}/api/profile/${userId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                  })
                );
                const joinedUsersResponses = await Promise.all(joinedUsersPromises);
                joinedUsers = joinedUsersResponses.map(res => res.data.profile || {});
              }
              
              // If we have organizer data, add it to the trip
              const organizer = organizerResponse.data && organizerResponse.data.profile 
                ? organizerResponse.data.profile 
                : { fullName: "Unknown User" };
              
              return {
                ...trip,
                organizer: organizer.fullName || organizer.name || "Unknown User",
                organizerAvatar: organizer.avatar || "/assets/images/default-avatar.jpg",
                joinedUsers: joinedUsers,
                // Format dates for display
                formattedFromDate: new Date(trip.fromDate).toLocaleDateString(),
                formattedToDate: new Date(trip.toDate).toLocaleDateString(),
                // Calculate duration
                duration: Math.ceil((new Date(trip.toDate) - new Date(trip.fromDate)) / (1000 * 60 * 60 * 24)) + " days",
                // For mock data compatibility
                title: trip.destination,
                date: `${new Date(trip.fromDate).toLocaleDateString()} - ${new Date(trip.toDate).toLocaleDateString()}`,
                spots: trip.maxPeople - (trip.joinedMembers ? trip.joinedMembers.length : 0),
                maxSpots: trip.maxPeople,
                participants: trip.joinedMembers ? trip.joinedMembers.length : 0,
                image: trip.coverImage || "/assets/images/default-trip.jpeg",
                // Include accommodation data
                accommodation: trip.accommodation || "Will discuss further",
                // Generate activities based on trip category
                activities: generateActivitiesFromCategory(trip.category)
              };
            } catch (err) {
              console.log(`Could not fetch details for trip ${trip._id}:`, err.message);
              return {
                ...trip,
                organizer: "Unknown User",
                organizerAvatar: "/assets/images/default-avatar.jpg",
                joinedUsers: [],
                formattedFromDate: new Date(trip.fromDate).toLocaleDateString(),
                formattedToDate: new Date(trip.toDate).toLocaleDateString(),
                duration: Math.ceil((new Date(trip.toDate) - new Date(trip.fromDate)) / (1000 * 60 * 60 * 24)) + " days",
                title: trip.destination,
                date: `${new Date(trip.fromDate).toLocaleDateString()} - ${new Date(trip.toDate).toLocaleDateString()}`,
                spots: trip.maxPeople,
                maxSpots: trip.maxPeople,
                participants: 0,
                image: trip.coverImage || "/assets/images/default-trip.jpeg"
              };
            }
          })
        );
        
        // If no trips from backend or for testing, use mock data
        const tripsData = tripsWithDetails.length > 0 ? tripsWithDetails : [];

        // If no trips are found, you might want to show an error message
        if (tripsData.length === 0) {
          return (
            <div className="container mx-auto px-4 py-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No Trip Data Available</h2>
                <p className="text-gray-600">The requested trip could not be found or has been removed.</p>
                <button 
                  onClick={() => navigate('/trips')}
                  className="mt-4 bg-[#2c5e4a] text-white px-4 py-2 rounded hover:bg-[#1a3a2a] transition"
                >
                  Back to Trips
                </button>
              </div>
            </div>
          );
        }
        
        setTrips(tripsData);
        setFilteredTrips(tripsData);
      } catch (err) {
        console.error("Error fetching trips:", err.message);
        setError(`Error loading trips: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [BACKEND_URL]);

  // Apply filters and sorting whenever filter criteria change
  useEffect(() => {
    let result = [...trips];
    
    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(trip => 
        trip.category && trip.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter(trip => {
        const tripFromDate = new Date(trip.fromDate);
        return tripFromDate >= fromDate;
      });
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(trip => {
        const tripToDate = new Date(trip.toDate);
        return tripToDate <= toDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === "date") {
        valueA = new Date(a.fromDate);
        valueB = new Date(b.fromDate);
      } else if (sortBy === "destination") {
        valueA = a.destination.toLowerCase();
        valueB = b.destination.toLowerCase();
      } else if (sortBy === "participants") {
        valueA = a.participants;
        valueB = b.participants;
      }
      
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredTrips(result);
  }, [trips, sortBy, sortOrder, categoryFilter, dateFrom, dateTo]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleTripClick = (trip) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
  };

  const handleBackToList = () => {
    setShowTripDetails(false);
    setSelectedTrip(null);
  };

  if (loading) return <div className="p-8 text-center">Loading trips...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FiMap className="text-[#f8d56b] text-2xl mr-2" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#f8d56b]">
                Trip Management
              </h1>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-[#f8d56b] text-[#2c5e4a] px-4 py-2 rounded-lg flex items-center hover:bg-[#f0c550] transition"
            >
              <FiHome className="mr-2" /> Back to Admin
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showTripDetails ? (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#2c5e4a] mb-4 font-cinzel">
              All Trips
            </h2>
            
            {/* Filters Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="mb-4 bg-[#2c5e4a] text-[#f8d56b] px-4 py-2 rounded-lg flex items-center hover:bg-[#1a3a2a] transition"
            >
              <FiFilter className="mr-2" /> 
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
            
            {/* Filters Panel */}
            {showFilters && (
              <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Sort Options */}
                  <div>
                    <label className="block text-[#2c5e4a] font-medium mb-2">Sort By</label>
                    <div className="flex items-center">
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg px-3 py-2 mr-2 text-[#2c5e4a]"
                      >
                        <option value="date">Date</option>
                        <option value="destination">Destination</option>
                        <option value="participants">Participants</option>
                      </select>
                      <button 
                        onClick={toggleSortOrder}
                        className="bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg p-2 text-[#2c5e4a]"
                      >
                        {sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Category Filter */}
                  <div>
                    <label className="block text-[#2c5e4a] font-medium mb-2">Category</label>
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg px-3 py-2 text-[#2c5e4a]"
                    >
                      <option value="all">All Categories</option>
                      <option value="adventure">Adventure</option>
                      <option value="beach">Beach</option>
                      <option value="city">City</option>
                      <option value="cultural">Cultural</option>
                      <option value="mountain">Mountain</option>
                      <option value="road trip">Road Trip</option>
                    </select>
                  </div>
                  
                  {/* Date From Filter */}
                  <div>
                    <label className="block text-[#2c5e4a] font-medium mb-2">Date From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg px-3 py-2 text-[#2c5e4a]"
                    />
                  </div>
                  
                  {/* Date To Filter */}
                  <div>
                    <label className="block text-[#2c5e4a] font-medium mb-2">Date To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg px-3 py-2 text-[#2c5e4a]"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Trips List */}
            <div className="grid gap-4">
              {filteredTrips.map((trip) => (
                <div
                  key={trip._id || trip.id}
                  onClick={() => handleTripClick(trip)}
                  className="flex flex-col sm:flex-row bg-white rounded-xl shadow border border-[#d1c7b7] overflow-hidden hover:shadow-xl transition cursor-pointer"
                >
                  <div className="sm:w-1/4 h-40 sm:h-auto">
                    <img
                      src={trip.image}
                      alt={trip.title || trip.destination}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-[#2c5e4a] font-cinzel mb-1">
                          {trip.title || trip.destination}
                        </h3>
                        <p className="text-[#5E5854] flex items-center text-sm mb-1">
                          <FiMapPin className="mr-1 text-[#2c5e4a]" /> {trip.destination}
                        </p>
                        <p className="text-[#5E5854] flex items-center text-sm mb-1">
                          <FiCalendar className="mr-1 text-[#2c5e4a]" /> {trip.date}
                        </p>
                        <p className="text-[#5E5854] flex items-center text-sm">
                          <FiUsers className="mr-1 text-[#2c5e4a]" /> {trip.participants} / {trip.maxSpots} participants
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0 flex flex-col items-start sm:items-end">
                        <div className="flex items-center mb-1">
                          <img
                            src={trip.organizerAvatar}
                            alt={trip.organizer}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="text-[#2c5e4a] text-sm font-medium">
                            Posted by: {trip.organizer}
                          </span>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <span className="bg-[#f8d56b] text-[#2c5e4a] px-2 py-0.5 rounded-full text-xs font-bold shadow">
                            {trip.category || trip.tags?.[0] || "Trip"}
                          </span>
                          <span className="bg-[#f87c6d] text-white px-2 py-0.5 rounded-full text-xs font-bold shadow">
                            {trip.transport || "Transport"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredTrips.length === 0 && (
                <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-6 text-center text-[#5E5854]">
                  No trips found matching the current filters.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Trip Details View */
          <div className="mb-6">
            <div className="flex items-center mb-6">
              <button
                onClick={handleBackToList}
                className="bg-[#2c5e4a] text-[#f8d56b] px-4 py-2 rounded-lg flex items-center hover:bg-[#1a3a2a] transition mr-4"
              >
                <FiChevronDown className="mr-2 transform rotate-90" /> Back to Trips
              </button>
              <h2 className="text-2xl font-bold text-[#2c5e4a] font-cinzel">
                Trip Details
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trip Info */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow border border-[#d1c7b7] overflow-hidden">
                <div className="h-64 relative">
                  <img
                    src={selectedTrip.image}
                    alt={selectedTrip.title || selectedTrip.destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white font-cinzel mb-1">
                      {selectedTrip.title || selectedTrip.destination}
                    </h3>
                    <p className="text-white flex items-center text-sm">
                      <FiMapPin className="mr-1" /> {selectedTrip.destination}
                    </p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-lg font-bold text-[#2c5e4a] mb-3">Trip Information</h4>
                      <div className="space-y-2 text-[#5E5854]">
                        <p className="flex items-center">
                          <FiCalendar className="mr-2 text-[#2c5e4a]" /> 
                          <span className="font-medium">From:</span> {selectedTrip.formattedFromDate}
                        </p>
                        <p className="flex items-center">
                          <FiCalendar className="mr-2 text-[#2c5e4a]" /> 
                          <span className="font-medium">To:</span> {selectedTrip.formattedToDate}
                        </p>
                        <p className="flex items-center">
                          <FiUsers className="mr-2 text-[#2c5e4a]" /> 
                          <span className="font-medium">Participants:</span> {selectedTrip.participants} / {selectedTrip.maxSpots}
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2 text-[#2c5e4a]">🚗</span> 
                          <span className="font-medium">Transport:</span> {selectedTrip.transport || "Not specified"}
                        </p>
                        <p className="flex items-center">
                          <span className="mr-2 text-[#2c5e4a]">💰</span> 
                          <span className="font-medium">Budget:</span> {selectedTrip.budget?.currency || "₹"}{selectedTrip.budget?.amount || selectedTrip.price}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-[#2c5e4a] mb-3">Organizer</h4>
                      <div className="flex items-center mb-4">
                        <img
                          src={selectedTrip.organizerAvatar}
                          alt={selectedTrip.organizer}
                          className="w-12 h-12 rounded-full mr-3 border-2 border-[#f8d56b]"
                        />
                        <div>
                          <p className="font-bold text-[#2c5e4a]">{selectedTrip.organizer}</p>
                          <p className="text-sm text-[#5E5854]">Trip Organizer</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedTrip.tags && selectedTrip.tags.map((tag, index) => (
                          <span key={index} className="bg-[#f8d56b] text-[#2c5e4a] px-2 py-0.5 rounded-full text-xs font-bold shadow">
                            {tag}
                          </span>
                        ))}
                        {selectedTrip.category && !selectedTrip.tags && (
                          <span className="bg-[#f8d56b] text-[#2c5e4a] px-2 py-0.5 rounded-full text-xs font-bold shadow">
                            {selectedTrip.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-[#2c5e4a] mb-3">Description</h4>
                    <p className="text-[#5E5854]">
                      {selectedTrip.description || "No description provided for this trip."}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Participants */}
              <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-6 h-fit">
                <h4 className="text-lg font-bold text-[#2c5e4a] mb-4">Participants ({selectedTrip.participants})</h4>
                
                {selectedTrip.joinedUsers && selectedTrip.joinedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {selectedTrip.joinedUsers.map((user, index) => (
                      <div key={index} className="flex items-center p-3 bg-[#f8f4e3] rounded-lg">
                        <img
                          src={user.avatar}
                          alt={user.fullName || user.name}
                          className="w-10 h-10 rounded-full mr-3 border border-[#d1c7b7]"
                        />
                        <div>
                          <p className="font-medium text-[#2c5e4a]">{user.fullName || user.name}</p>
                          <p className="text-xs text-[#5E5854]">Joined: {new Date(user.joinedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#5E5854] text-center py-4">No participants have joined this trip yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add this helper function to generate activities based on trip category
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
}

// Add the calculateCostBreakdown function
const calculateCostBreakdown = (trip) => {
  if (!trip || !trip.budget) return null;
  
  const totalBudget = parseFloat(trip.budget.amount || trip.budget);
  const currency = trip.budget.currency || trip.currency || 'INR';
  
  // Different breakdown based on accommodation setting
  let accommodationCost = 0;
  let transportCost = 0;
  let mealsCost = 0;
  let activitiesCost = 0;
  let baseCost = 0;
  
  if (trip.accommodation === 'Included') {
    // If accommodation is included, allocate 40% of budget to it
    accommodationCost = Math.round(totalBudget * 0.4);
    transportCost = Math.round(totalBudget * 0.3);
    mealsCost = Math.round(totalBudget * 0.15);
    activitiesCost = Math.round(totalBudget * 0.15);
    baseCost = totalBudget - accommodationCost - transportCost - mealsCost - activitiesCost;
  } else if (trip.accommodation === 'Not included') {
    // If accommodation is not included, allocate more to other categories
    accommodationCost = 0;
    transportCost = Math.round(totalBudget * 0.4);
    mealsCost = Math.round(totalBudget * 0.3);
    activitiesCost = Math.round(totalBudget * 0.2);
    baseCost = Math.round(totalBudget * 0.1);
  } else {
    // Default breakdown for "Will discuss further"
    baseCost = totalBudget;
    accommodationCost = 0;
    transportCost = 0;
    mealsCost = 0;
    activitiesCost = 0;
  }
  
  return {
    basePrice: { amount: baseCost, currency },
    accommodation: { amount: accommodationCost, currency },
    transport: { amount: transportCost, currency },
    meals: { amount: mealsCost, currency },
    activities: { amount: activitiesCost, currency },
    total: { amount: totalBudget, currency }
  };
};

// Update the useEffect to calculate cost breakdown when trip is selected
useEffect(() => {
  if (selectedTrip) {
    setCostBreakdown(calculateCostBreakdown(selectedTrip));
  }
}, [selectedTrip]);

// When fetching trip details, make sure to get all members
const fetchTripDetails = async (tripId) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/trips/${tripId}`);
    
    if (response.data && response.data.success) {
      const tripData = response.data.trip;
      
      // Ensure we have the complete list of participants
      const organizer = {
        id: tripData.organizerId,
        _id: tripData.organizerId,
        name: tripData.organizer,
        fullName: tripData.organizer,
        avatar: tripData.organizerAvatar || "/assets/images/default-avatar.webp",
        role: 'organizer',
        isHost: true
      };
      
      // Get all participants (excluding organizer)
      const participants = Array.isArray(tripData.joinedMembers) 
        ? tripData.joinedMembers.map(member => ({
            ...member,
            role: 'participant',
            isHost: false
          }))
        : [];
      
      // Set trip with all members
      setSelectedTrip({
        ...tripData,
        allMembers: [organizer, ...participants]
      });
    }
  } catch (error) {
    console.error("Error fetching trip details:", error);
  }
};

{/* Trip Members Section */}
<div className="mt-6">
  <h3 className="text-xl font-bold text-[#2c5e4a] mb-4">Trip Members</h3>
  <TripMembers 
    members={selectedTrip.allMembers || []}
    organizers={selectedTrip.allMembers?.filter(m => m.isHost || m.role === 'organizer') || []}
    participants={selectedTrip.allMembers?.filter(m => !m.isHost && m.role !== 'organizer') || []}
    onViewProfile={handleViewProfile}
  />
</div>
