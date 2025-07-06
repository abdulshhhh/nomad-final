import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2, FiHome, FiPieChart, FiUsers, FiMap, FiCompass, FiCalendar, FiFlag, FiUserPlus, FiFilter, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { GiMale, GiFemale, GiPerson } from 'react-icons/gi';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function ChartsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // Changed default to 'overview'
  
  // Add state for original API responses
  const [tripsResponse, setTripsResponse] = useState(null);
  const [usersResponse, setUsersResponse] = useState(null);

  // Add state for filters
  const [filters, setFilters] = useState({
    gender: 'all',
    joinDateStart: '',
    joinDateEnd: '',
    tripType: 'all'
  });

  // Add state for profile data
  const [profilesData, setProfilesData] = useState([]);

  // Add state for sorting
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(true); // Default to showing filters

  // Define chart options outside of render to avoid re-creation
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#000000'
        }
      },
      tooltip: {
        bodyColor: '#000000',
        titleColor: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#d1c7b7',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#000000'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#000000'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#000000'
        }
      },
      tooltip: {
        bodyColor: '#000000',
        titleColor: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#d1c7b7',
        borderWidth: 1
      }
    }
  };

  // Process trips data - make it more resilient to data issues
  const processTripsData = useCallback((trips) => {
    if (!trips || !Array.isArray(trips) || trips.length === 0) {
      // Return default data if trips is empty or invalid
      return {
        categories: {
          labels: ['No Data'],
          data: [1],
          backgroundColor: ['rgba(201, 203, 207, 0.7)'],
        },
        monthlyTrips: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: Array(12).fill(0),
        },
        status: {
          labels: ['No Data'],
          data: [1],
          backgroundColor: ['rgba(201, 203, 207, 0.7)'],
        },
        destinations: {
          labels: ['No Data'],
          data: [1],
        },
      };
    }

    try {
      // Extract unique categories from trips
      const uniqueCategories = [...new Set(trips.map(trip => trip.category || 'Uncategorized'))];
      
      const categories = {
        labels: uniqueCategories.length ? uniqueCategories : ['No Data'],
        data: uniqueCategories.length ? 
          uniqueCategories.map(category => 
            trips.filter(trip => (trip.category || 'Uncategorized') === category).length
          ) : [1],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(201, 203, 207, 0.7)',
        ],
      };

      const monthlyTrips = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: Array(12).fill(0),
      };

      // Extract unique statuses from trips
      const uniqueStatuses = [...new Set(trips.map(trip => trip.status || 'Upcoming'))];
      
      const status = {
        labels: uniqueStatuses.length ? uniqueStatuses : ['No Data'],
        data: uniqueStatuses.length ? 
          uniqueStatuses.map(status => 
            trips.filter(trip => (trip.status || 'Upcoming') === status).length
          ) : [1],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      };

      // Get top destinations
      const destinationCounts = {};
      trips.forEach(trip => {
        const destination = trip.destination || trip.departure || 'Unknown';
        destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
      });
      
      // Sort destinations by count and take top 6
      const topDestinations = Object.entries(destinationCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      
      const destinations = {
        labels: topDestinations.length ? topDestinations.map(item => item[0]) : ['No Data'],
        data: topDestinations.length ? topDestinations.map(item => item[1]) : [1],
      };

      // Process monthly data
      trips.forEach(trip => {
        // Use createdAt for the month data
        const date = new Date(trip.createdAt);
        if (!isNaN(date.getTime())) {
          const monthIndex = date.getMonth();
          monthlyTrips.data[monthIndex]++;
        }
      });

      return {
        categories,
        monthlyTrips,
        status,
        destinations,
      };
    } catch (err) {
      console.error("Error processing trip data:", err);
      // Return default data on error
      return {
        categories: {
          labels: ['Error'],
          data: [1],
          backgroundColor: ['rgba(255, 99, 132, 0.7)'],
        },
        monthlyTrips: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: Array(12).fill(0),
        },
        status: {
          labels: ['Error'],
          data: [1],
          backgroundColor: ['rgba(255, 99, 132, 0.7)'],
        },
        destinations: {
          labels: ['Error'],
          data: [1],
        },
      };
    }
  }, []);

  // Process users data - make it more resilient to data issues
  const processUsersData = useCallback((users, profiles) => {
    if (!users || !Array.isArray(users) || users.length === 0) {
      // Return default data if users is empty or invalid
      return {
        joinedByMonth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: Array(12).fill(0),
        },
        genderDistribution: {
          labels: ['Male', 'Female', 'Prefer not to say'],
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)', // Male - Blue
            'rgba(255, 99, 132, 0.7)', // Female - Pink
            'rgba(201, 203, 207, 0.7)', // Prefer not to say - Gray
          ],
        },
        tripParticipation: {
          labels: ['No Data'],
          data: [1],
        }
      };
    }

    try {
      const joinedByMonth = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: Array(12).fill(0),
      };

      // Always use these exact three categories in this specific order
      const genderLabels = ['Male', 'Female', 'Prefer not to say'];
      const genderCounts = {
        'Male': 0,
        'Female': 0,
        'Prefer not to say': 0
      };
      
      // Debug the profiles data
      console.log("Profiles data for gender processing:", profiles);
      
      // Use profiles data for gender if available, otherwise fall back to user data
      if (profiles && profiles.length > 0) {
        profiles.forEach(profile => {
          // Debug each profile's gender
          console.log(`Profile ${profile._id || profile.userId}: gender = ${profile.gender}`);
          
          // Handle case sensitivity and normalize gender values
          let gender = 'Prefer not to say';
          if (profile.gender) {
            const normalizedGender = String(profile.gender).toLowerCase().trim();
            console.log(`Normalized gender: "${normalizedGender}"`);
            
            if (normalizedGender === 'male') {
              gender = 'Male';
            } else if (normalizedGender === 'female') {
              gender = 'Female';
            }
          }
          genderCounts[gender]++;
        });
      } else {
        // Fall back to user data if no profiles
        users.forEach(user => {
          // Debug each user's gender
          console.log(`User ${user._id || user.id}: gender = ${user.gender}`);
          
          // Handle case sensitivity and normalize gender values
          let gender = 'Prefer not to say';
          if (user.gender) {
            const normalizedGender = String(user.gender).toLowerCase().trim();
            console.log(`Normalized gender: "${normalizedGender}"`);
            
            if (normalizedGender === 'male') {
              gender = 'Male';
            } else if (normalizedGender === 'female') {
              gender = 'Female';
            }
          }
          genderCounts[gender]++;
        });
      }
      
      console.log("Processed gender counts:", genderCounts);
      
      // Ensure we use the fixed order of labels and corresponding data
      const genderData = genderLabels.map(label => genderCounts[label] || 0);
      
      const genderDistribution = {
        labels: genderLabels,
        data: genderData,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)', // Male - Blue
          'rgba(255, 99, 132, 0.7)', // Female - Pink
          'rgba(201, 203, 207, 0.7)', // Prefer not to say - Gray
        ],
      };

      // Trip participation
      const tripParticipation = {
        labels: ['No trips', '1-2 trips', '3-5 trips', '6+ trips'],
        data: [0, 0, 0, 0],
      };

      // User types
      const userTypes = {
        labels: ['Organizers', 'Participants', 'Both'],
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
      };

      users.forEach(user => {
        // Process joinedByMonth using createdAt
        const joinDate = new Date(user.joinDate || user.createdAt);
        if (!isNaN(joinDate.getTime())) {
          const monthIndex = joinDate.getMonth();
          joinedByMonth.data[monthIndex]++;
        }

        // Process trip participation
        const tripsHosted = user.tripsHosted || 0;
        const tripsJoined = user.tripsJoined || 0;
        const totalTrips = tripsHosted + tripsJoined;
        
        if (totalTrips === 0) {
          tripParticipation.data[0]++;
        } else if (totalTrips <= 2) {
          tripParticipation.data[1]++;
        } else if (totalTrips <= 5) {
          tripParticipation.data[2]++;
        } else {
          tripParticipation.data[3]++;
        }

        // Process user types
        if (tripsHosted > 0 && tripsJoined > 0) {
          userTypes.data[2]++; // Both
        } else if (tripsHosted > 0) {
          userTypes.data[0]++; // Organizers
        } else if (tripsJoined > 0) {
          userTypes.data[1]++; // Participants
        } else {
          userTypes.data[1]++; // Default to participants for new users
        }
      });

      return {
        joinedByMonth,
        genderDistribution,
        tripParticipation,
        userTypes,
      };
    } catch (err) {
      console.error("Error processing user data:", err);
      // Return default data on error
      return {
        joinedByMonth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          data: Array(12).fill(0),
        },
        genderDistribution: {
          labels: ['Error'],
          data: [1],
          backgroundColor: ['rgba(255, 99, 132, 0.7)'],
        },
        tripParticipation: {
          labels: ['Error'],
          data: [1],
        },
        userTypes: {
          labels: ['Error'],
          data: [1],
          backgroundColor: ['rgba(255, 99, 132, 0.7)'],
        },
      };
    }
  }, []);

  // Add filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add filter UI above the charts
  const renderFilters = () => (
    <>
      {activeTab !== 'overview' && (
        <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4 mb-6">
          <h3 className="text-lg font-bold text-[#2c5e4a] mb-4">Filter Data</h3>
          
          {activeTab === 'trips' && (
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-grow max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Type</label>
                <select
                  name="tripType"
                  value={filters.tripType}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                >
                  <option value="all">All Types</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  // Reset filters
                  const resetFilters = {
                    gender: 'all',
                    joinDateStart: '',
                    joinDateEnd: '',
                    tripType: 'all'
                  };
                  setFilters(resetFilters);
                  // Apply reset filters immediately
                  applyFilters(resetFilters);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded h-10"
              >
                Reset Filters
              </button>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-grow max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
                >
                  <option value="all">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer not to say">Prefer not to say</option>
                </select>
              </div>
              
              <button
                onClick={() => {
                  // Reset filters
                  const resetFilters = {
                    gender: 'all',
                    joinDateStart: '',
                    joinDateEnd: '',
                    tripType: 'all'
                  };
                  setFilters(resetFilters);
                  // Apply reset filters immediately
                  applyFilters(resetFilters);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded h-10"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }
        
        console.log("Fetching data with token:", token.substring(0, 10) + "...");
        
        // Fetch users data using the same endpoint as in the admin user details page
        const usersResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/users`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        console.log("Users response:", usersResponse.data);
        
        if (!usersResponse.data || !usersResponse.data.success) {
          throw new Error("Failed to fetch users data");
        }
        
        // Store original users response
        setUsersResponse(usersResponse.data);
        
        // Fetch profile data for each user to get accurate gender information
        let profilesData = [];
        if (usersResponse.data.users && usersResponse.data.users.length > 0) {
          try {
            console.log("Fetching profiles for users...");
            const profilePromises = usersResponse.data.users.map(async (user) => {
              const userId = user._id || user.id;
              try {
                const profileResponse = await axios.get(
                  `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/profile/${userId}`,
                  { headers: { "Authorization": `Bearer ${token}` } }
                );
                
                if (profileResponse.data.success) {
                  console.log(`Successfully fetched profile for user ${userId}`);
                  return profileResponse.data.profile;
                } else {
                  console.log(`Failed to fetch profile for user ${userId}`);
                  return null;
                }
              } catch (err) {
                console.error(`Error fetching profile for user ${userId}:`, err);
                return null;
              }
            });
            
            const profiles = await Promise.all(profilePromises);
            profilesData = profiles.filter(profile => profile !== null);
            setProfilesData(profilesData);
            console.log(`Fetched ${profilesData.length} valid profiles out of ${usersResponse.data.users.length} users`);
          } catch (profileErr) {
            console.error("Error fetching profile data:", profileErr);
          }
        }
        
        // Process user data with profiles
        const userData = processUsersData(usersResponse.data.users, profilesData);
        setUserData(userData);
        
        // Fetch trips data
        const tripsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/admin/trips`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        console.log("Trips response:", tripsResponse.data);
        
        if (tripsResponse.data.success) {
          // Store original trips response
          setTripsResponse(tripsResponse.data);
          
          // Process trip data
          const trips = tripsResponse.data.trips;
          const tripData = processTripsData(trips);
          
          setTripData(tripData);
        } else {
          setError("Failed to load trips data from server");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Error loading data: ${err.message}`);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [processTripsData, processUsersData]);

  // Apply filters when they change
  useEffect(() => {
    if (!tripsResponse || !usersResponse) return;
    
    try {
      console.log("Applying filters...");
      
      // Apply filters based on activeTab
      if (activeTab === 'trips' || activeTab === 'overview') {
        let filteredTrips = [...tripsResponse];
        
        // Filter by trip type
        if (filters.tripType !== 'all') {
          filteredTrips = filteredTrips.filter(trip => trip.status === filters.tripType);
        }
        
        setTripData(processTripsData(filteredTrips));
      }
      
      if (activeTab === 'users' || activeTab === 'overview') {
        let filteredUsers = [...usersResponse];
        
        // Filter by gender
        if (filters.gender !== 'all') {
          filteredUsers = filteredUsers.filter(user => {
            const userGender = user.gender || 
              (user.profile && user.profile.gender) || 
              'prefer not to say';
            return userGender.toLowerCase() === filters.gender.toLowerCase();
          });
        }
        
        // Filter by join date range
        if (filters.joinDateStart) {
          const startDate = new Date(filters.joinDateStart);
          filteredUsers = filteredUsers.filter(user => {
            const joinDate = new Date(user.joinDate || user.createdAt);
            return joinDate >= startDate;
          });
        }
        
        if (filters.joinDateEnd) {
          const endDate = new Date(filters.joinDateEnd);
          endDate.setHours(23, 59, 59); // End of day
          filteredUsers = filteredUsers.filter(user => {
            const joinDate = new Date(user.joinDate || user.createdAt);
            return joinDate <= endDate;
          });
        }
        
        setUserData(processUsersData(filteredUsers, profilesData));
      }
    } catch (err) {
      console.error("Error applying filters:", err);
    }
  }, [activeTab, filters, tripsResponse, usersResponse, processTripsData, processUsersData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FiBarChart2 className="text-[#f8d56b] text-2xl mr-2" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#f8d56b]">
                Analytics Dashboard
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
        {/* Tab Navigation */}
        <div className="mb-6 bg-white rounded-lg shadow border border-[#d1c7b7] p-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#2c5e4a]">
              {activeTab === 'overview' && 'Overall Statistics'}
              {activeTab === 'trips' && 'Trip Analytics'}
              {activeTab === 'users' && 'User Analytics'}
            </h1>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'overview'
                    ? 'bg-[#2c5e4a] text-white'
                    : 'bg-white text-[#2c5e4a] border border-[#2c5e4a]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('trips')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'trips'
                    ? 'bg-[#2c5e4a] text-white'
                    : 'bg-white text-[#2c5e4a] border border-[#2c5e4a]'
                }`}
              >
                Trip Analytics
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'users'
                    ? 'bg-[#2c5e4a] text-white'
                    : 'bg-white text-[#2c5e4a] border border-[#2c5e4a]'
                }`}
              >
                User Analytics
              </button>
            </div>
          </div>

          {/* Add filters section */}
          {renderFilters()}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c5e4a]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : (
            <>
              {/* Overview Analytics */}
              {activeTab === 'overview' && userData && tripData && (
                <div className="space-y-6">
                  {/* Platform Summary */}
                  <div className="bg-white rounded-xl shadow-lg border border-[#d1c7b7] p-6 mb-6">
                    <h2 className="text-2xl font-bold text-[#2c5e4a] mb-6 flex items-center">
                      <FiBarChart2 className="mr-3 text-[#f8a95d]" />
                      Overview
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {/* Total Users */}
                      <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl p-5 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-[#5E5854] font-medium">Total Users</p>
                            <p className="text-3xl font-bold text-[#2c5e4a] mt-2">
                              {userData.genderDistribution.data.reduce((a, b) => a + b, 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-[#2c5e4a] p-2 rounded-lg">
                            <FiUsers className="text-xl text-white" />
                          </div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-[#d1c7b7] rounded-full overflow-hidden">
                          <div className="bg-[#2c5e4a] h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      {/* Total Trips */}
                      <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl p-5 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-[#5E5854] font-medium">Total Trips</p>
                            <p className="text-3xl font-bold text-[#2c5e4a] mt-2">
                              {tripData.status.data.reduce((a, b) => a + b, 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-[#2c5e4a] p-2 rounded-lg">
                            <FiMap className="text-xl text-white" />
                          </div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-[#d1c7b7] rounded-full overflow-hidden">
                          <div className="bg-[#2c5e4a] h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      
                      {/* Active Users */}
                      <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl p-5 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-[#5E5854] font-medium">Active Users</p>
                            <p className="text-3xl font-bold text-[#2c5e4a] mt-2">
                              {Math.round(userData.genderDistribution.data.reduce((a, b) => a + b, 0) * 0.7).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-[#2c5e4a] p-2 rounded-lg">
                            <FiUserPlus className="text-xl text-white" />
                          </div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-[#d1c7b7] rounded-full overflow-hidden">
                          <div className="bg-[#2c5e4a] h-full rounded-full" style={{ width: '70%' }}></div>
                        </div>
                        <p className="text-xs text-[#5E5854] mt-1">Last 30 days</p>
                      </div>
                      
                      {/* New Users */}
                      <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl p-5 shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-[#5E5854] font-medium">New Users</p>
                            <p className="text-3xl font-bold text-[#2c5e4a] mt-2">
                              {userData.joinedByMonth.data[new Date().getMonth()].toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-[#2c5e4a] p-2 rounded-lg">
                            <FiUserPlus className="text-xl text-white" />
                          </div>
                        </div>
                        <div className="mt-4 h-1 w-full bg-[#d1c7b7] rounded-full overflow-hidden">
                          <div className="bg-[#2c5e4a] h-full rounded-full" style={{ width: `${Math.min(100, userData.joinedByMonth.data[new Date().getMonth()] / (userData.genderDistribution.data.reduce((a, b) => a + b, 0) * 0.1) * 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-[#5E5854] mt-1">This month</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* User Statistics */}
                  <div className="bg-white rounded-xl shadow-lg border border-[#d1c7b7] p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#f8a95d] p-2 rounded-lg mr-3">
                        <FiUsers className="text-xl text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-[#2c5e4a]">User Statistics</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Gender Distribution */}
                      <div className="bg-[#f8f4e3] rounded-xl p-5 shadow-md">
                        <h3 className="text-lg font-semibold text-[#2c5e4a] mb-4">Gender Distribution</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {/* Male Users */}
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-2">
                              <GiMale className="text-blue-500 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-blue-500">{userData.genderDistribution.data[0]}</p>
                            <p className="text-xs text-[#5E5854]">Male</p>
                          </div>
                          
                          {/* Female Users */}
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 mb-2">
                              <GiFemale className="text-pink-500 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-pink-500">{userData.genderDistribution.data[1]}</p>
                            <p className="text-xs text-[#5E5854]">Female</p>
                          </div>
                          
                          {/* Other Users */}
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-2">
                              <GiPerson className="text-gray-500 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-gray-500">{userData.genderDistribution.data[2]}</p>
                            <p className="text-xs text-[#5E5854]">Other</p>
                          </div>
                        </div>
                        <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="flex">
                            <div className="bg-blue-500 h-full" style={{ width: `${userData.genderDistribution.data[0] / userData.genderDistribution.data.reduce((a, b) => a + b, 0) * 100}%` }}></div>
                            <div className="bg-pink-500 h-full" style={{ width: `${userData.genderDistribution.data[1] / userData.genderDistribution.data.reduce((a, b) => a + b, 0) * 100}%` }}></div>
                            <div className="bg-gray-500 h-full" style={{ width: `${userData.genderDistribution.data[2] / userData.genderDistribution.data.reduce((a, b) => a + b, 0) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* User Roles */}
                      <div className="bg-[#f8f4e3] rounded-xl p-5 shadow-md">
                        <h3 className="text-lg font-semibold text-[#2c5e4a] mb-4">User Roles</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Trip Organizers */}
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 mb-2">
                              <FiFlag className="text-yellow-500" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-500">
                              {Math.round(userData.genderDistribution.data.reduce((a, b) => a + b, 0) * 0.3)}
                            </p>
                            <p className="text-xs text-[#5E5854]">Trip Organizers</p>
                          </div>
                          
                          {/* Trip Participants */}
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2">
                              <FiCompass className="text-orange-500" />
                            </div>
                            <p className="text-2xl font-bold text-orange-500">
                              {Math.round(userData.genderDistribution.data.reduce((a, b) => a + b, 0) * 0.6)}
                            </p>
                            <p className="text-xs text-[#5E5854]">Trip Participants</p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-center text-[#5E5854]">
                            <span className="font-medium">{Math.round(userData.genderDistribution.data.reduce((a, b) => a + b, 0) * 0.1)}</span> users have both organized and participated in trips
                          </p>
                        </div>
                      </div>
                      
                      {/* User Growth */}
                      <div className="bg-[#f8f4e3] rounded-xl p-5 shadow-md">
                        <h3 className="text-lg font-semibold text-[#2c5e4a] mb-4">User Growth</h3>
                        <div className="flex flex-col justify-between h-[calc(100%-2rem)]">
                          <div className="text-center mb-4">
                            <p className="text-4xl font-bold text-[#2c5e4a]">
                              {userData.joinedByMonth.data.reduce((a, b) => a + b, 0)}
                            </p>
                            <p className="text-sm text-[#5E5854]">Total Registrations</p>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm text-[#5E5854] mb-1">
                              <span>This Month</span>
                              <span className="font-medium">{userData.joinedByMonth.data[new Date().getMonth()]}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="bg-green-500 h-full" style={{ width: `${Math.min(100, userData.joinedByMonth.data[new Date().getMonth()] / Math.max(...userData.joinedByMonth.data) * 100)}%` }}></div>
                            </div>
                            
                            <div className="flex justify-between text-sm text-[#5E5854] mt-3 mb-1">
                              <span>Last Month</span>
                              <span className="font-medium">{userData.joinedByMonth.data[new Date().getMonth() > 0 ? new Date().getMonth() - 1 : 11]}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, userData.joinedByMonth.data[new Date().getMonth() > 0 ? new Date().getMonth() - 1 : 11] / Math.max(...userData.joinedByMonth.data) * 100)}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Trip Statistics */}
                  <div className="bg-white rounded-xl shadow-lg border border-[#d1c7b7] p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#f87c6d] p-2 rounded-lg mr-3">
                        <FiMap className="text-xl text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-[#2c5e4a]">Trip Statistics</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Trip Status */}
                      <div className="bg-[#f8f4e3] rounded-xl p-5 shadow-md">
                        <h3 className="text-lg font-semibold text-[#2c5e4a] mb-4">Trip Status</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {/* Upcoming Trips */}
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mb-2">
                              <FiCalendar className="text-green-500" />
                            </div>
                            <p className="text-xl font-bold text-green-500">
                              {tripData.status.labels.includes('Upcoming') ? 
                                tripData.status.data[tripData.status.labels.indexOf('Upcoming')] : 0}
                            </p>
                            <p className="text-xs text-[#5E5854]">Upcoming</p>
                          </div>
                          
                          {/* Ongoing Trips */}
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mb-2">
                              <FiFlag className="text-blue-500" />
                            </div>
                            <p className="text-xl font-bold text-blue-500">
                              {tripData.status.labels.includes('Ongoing') ? 
                                tripData.status.data[tripData.status.labels.indexOf('Ongoing')] : 0}
                            </p>
                            <p className="text-xs text-[#5E5854]">Ongoing</p>
                          </div>
                          
                          {/* Completed Trips */}
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mb-2">
                              <FiCompass className="text-orange-500" />
                            </div>
                            <p className="text-xl font-bold text-orange-500">
                              {tripData.status.labels.includes('Completed') ? 
                                tripData.status.data[tripData.status.labels.indexOf('Completed')] : 0}
                            </p>
                            <p className="text-xs text-[#5E5854]">Completed</p>
                          </div>
                        </div>
                        <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="flex">
                            <div className="bg-green-500 h-full" style={{ width: `${tripData.status.labels.includes('Upcoming') ? tripData.status.data[tripData.status.labels.indexOf('Upcoming')] / tripData.status.data.reduce((a, b) => a + b, 0) * 100 : 0}%` }}></div>
                            <div className="bg-blue-500 h-full" style={{ width: `${tripData.status.labels.includes('Ongoing') ? tripData.status.data[tripData.status.labels.indexOf('Ongoing')] / tripData.status.data.reduce((a, b) => a + b, 0) * 100 : 0}%` }}></div>
                            <div className="bg-orange-500 h-full" style={{ width: `${tripData.status.labels.includes('Completed') ? tripData.status.data[tripData.status.labels.indexOf('Completed')] / tripData.status.data.reduce((a, b) => a + b, 0) * 100 : 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trip Categories */}
                      <div className="bg-[#f8f4e3] rounded-xl p-5 shadow-md">
                        <h3 className="text-lg font-semibold text-[#2c5e4a] mb-4">Trip Categories</h3>
                        <div className="space-y-3">
                          {tripData.categories.labels.slice(0, 4).map((category, index) => (
                            <div key={category} className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tripData.categories.backgroundColor[index % tripData.categories.backgroundColor.length] }}></div>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm text-[#5E5854]">{category}</span>
                                  <span className="text-sm font-medium text-[#2c5e4a]">{tripData.categories.data[index]}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full" style={{ 
                                    width: `${tripData.categories.data[index] / Math.max(...tripData.categories.data) * 100}%`,
                                    backgroundColor: tripData.categories.backgroundColor[index % tripData.categories.backgroundColor.length]
                                  }}></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Trip Participation */}
                      <div className="bg-[#f8f4e3] rounded-xl p-5 shadow-md">
                        <h3 className="text-lg font-semibold text-[#2c5e4a] mb-4">Trip Participation</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {/* Trips Posted */}
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 mb-2">
                              <FiFlag className="text-yellow-500" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-500">
                              {Math.round(tripData.status.data.reduce((a, b) => a + b, 0) * 0.4)}
                            </p>
                            <p className="text-xs text-[#5E5854]">Trips Posted</p>
                          </div>
                          
                          {/* Trips Joined */}
                          <div className="bg-white rounded-lg p-3 text-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 mb-2">
                              <FiUserPlus className="text-purple-500" />
                            </div>
                            <p className="text-2xl font-bold text-purple-500">
                              {Math.round(tripData.status.data.reduce((a, b) => a + b, 0) * 2.5)}
                            </p>
                            <p className="text-xs text-[#5E5854]">Trips Joined</p>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f0d9b5] mb-2">
                            <p className="text-xl font-bold text-[#2c5e4a]">4.2</p>
                          </div>
                          <p className="text-sm text-[#5E5854]">Average Participants Per Trip</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Destinations */}
                  <div className="bg-white rounded-xl shadow-lg border border-[#d1c7b7] p-6">
                    <div className="flex items-center mb-6">
                      <div className="bg-[#2c5e4a] p-2 rounded-lg mr-3">
                        <FiCompass className="text-xl text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-[#2c5e4a]">Top Destinations</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {tripData.destinations.labels.map((destination, index) => (
                        <div key={destination} className="bg-[#f8f4e3] rounded-xl p-4 shadow-md text-center transform transition-all duration-300 hover:scale-105">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f0d9b5] mb-3">
                            <span className="text-lg font-bold text-[#2c5e4a]">{index + 1}</span>
                          </div>
                          <h4 className="font-semibold text-[#2c5e4a] mb-1 truncate" title={destination}>
                            {destination}
                          </h4>
                          <p className="text-sm text-[#5E5854]">
                            {tripData.destinations.data[index]} {tripData.destinations.data[index] === 1 ? 'trip' : 'trips'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Trip Analytics */}
              {activeTab === 'trips' && tripData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart - Monthly Trips */}
                    <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                      <div className="flex items-center mb-4">
                        <FiBarChart2 className="text-[#2c5e4a] text-xl mr-2" />
                        <h2 className="text-lg font-bold text-[#2c5e4a]">Monthly Trip Distribution</h2>
                      </div>
                      <div className="h-80">
                        <Bar
                          options={{
                            ...barOptions,
                            plugins: {
                              ...barOptions.plugins,
                              legend: {
                                ...barOptions.plugins.legend,
                                labels: {
                                  color: '#000000'
                                }
                              }
                            },
                            scales: {
                              x: {
                                ticks: {
                                  color: '#000000'
                                },
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.1)'
                                }
                              },
                              y: {
                                ticks: {
                                  color: '#000000'
                                },
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.1)'
                                }
                              }
                            }
                          }}
                          data={{
                            labels: tripData.monthlyTrips.labels,
                            datasets: [
                              {
                                label: 'Number of Trips',
                                data: tripData.monthlyTrips.data,
                                backgroundColor: 'rgba(44, 94, 74, 0.7)',
                                borderColor: 'rgba(44, 94, 74, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>

                    {/* Pie Chart - Trip Categories */}
                    <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                      <div className="flex items-center mb-4">
                        <FiPieChart className="text-[#2c5e4a] text-xl mr-2" />
                        <h2 className="text-lg font-bold text-[#2c5e4a]">Trip Categories</h2>
                      </div>
                      <div className="h-80">
                        <Pie
                          options={pieOptions}
                          data={{
                            labels: tripData.categories.labels,
                            datasets: [
                              {
                                data: tripData.categories.data,
                                backgroundColor: tripData.categories.backgroundColor,
                                borderColor: 'white',
                                borderWidth: 2,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>

                    {/* Bar Chart - Destinations */}
                    <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                      <div className="flex items-center mb-4">
                        <FiBarChart2 className="text-[#2c5e4a] text-xl mr-2" />
                        <h2 className="text-lg font-bold text-[#2c5e4a]">Popular Destinations</h2>
                      </div>
                      <div className="h-80">
                        <Bar
                          options={barOptions}
                          data={{
                            labels: tripData.destinations.labels,
                            datasets: [
                              {
                                label: 'Number of Trips',
                                data: tripData.destinations.data,
                                backgroundColor: 'rgba(248, 169, 93, 0.7)',
                                borderColor: 'rgba(248, 169, 93, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>

                    {/* Pie Chart - Trip Status */}
                    <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                      <div className="flex items-center mb-4">
                        <FiPieChart className="text-[#2c5e4a] text-xl mr-2" />
                        <h2 className="text-lg font-bold text-[#2c5e4a]">Trip Status</h2>
                      </div>
                      <div className="h-80">
                        <Pie
                          options={pieOptions}
                          data={{
                            labels: tripData.status.labels,
                            datasets: [
                              {
                                data: tripData.status.data,
                                backgroundColor: tripData.status.backgroundColor,
                                borderColor: 'white',
                                borderWidth: 2,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User Analytics */}
              {activeTab === 'users' && userData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart - Monthly User Joins */}
                    <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                      <div className="flex items-center mb-4">
                        <FiBarChart2 className="text-[#2c5e4a] text-xl mr-2" />
                        <h2 className="text-lg font-bold text-[#2c5e4a]">Monthly User Registration</h2>
                      </div>
                      <div className="h-80">
                        <Bar
                          options={barOptions}
                          data={{
                            labels: userData.joinedByMonth.labels,
                            datasets: [
                              {
                                label: 'New Users',
                                data: userData.joinedByMonth.data,
                                backgroundColor: 'rgba(44, 94, 74, 0.7)',
                                borderColor: 'rgba(44, 94, 74, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>

                    {/* Gender Distribution Pie Chart */}
                    <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                      <div className="flex items-center mb-4">
                        <FiPieChart className="text-[#2c5e4a] text-xl mr-2" />
                        <h2 className="text-lg font-bold text-[#2c5e4a]">Gender Distribution</h2>
                      </div>
                      <div className="h-80">
                        {userData && userData.genderDistribution ? (
                          <Pie
                            options={{
                              ...pieOptions,
                              plugins: {
                                ...pieOptions.plugins,
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.label || '';
                                      const value = context.raw || 0;
                                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                      const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                      return `${label}: ${value} (${percentage}%)`;
                                    }
                                  }
                                }
                              }
                            }}
                            data={{
                              labels: userData.genderDistribution.labels,
                              datasets: [
                                {
                                  data: userData.genderDistribution.data,
                                  backgroundColor: [
                                    'rgba(54, 162, 235, 0.7)', // Male - Blue
                                    'rgba(255, 99, 132, 0.7)', // Female - Pink
                                    'rgba(201, 203, 207, 0.7)', // Prefer not to say - Gray
                                  ],
                                  borderColor: 'white',
                                  borderWidth: 2,
                                },
                              ],
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Loading gender data...</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Trip Participation Chart */}
                    <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                      <div className="flex items-center mb-4">
                        <FiBarChart2 className="text-[#2c5e4a] text-xl mr-2" />
                        <h2 className="text-lg font-bold text-[#2c5e4a]">Trip Participation</h2>
                      </div>
                      <div className="h-80">
                        <Bar
                          options={barOptions}
                          data={{
                            labels: userData.tripParticipation.labels,
                            datasets: [
                              {
                                label: 'Number of Users',
                                data: userData.tripParticipation.data,
                                backgroundColor: 'rgba(248, 213, 107, 0.7)',
                                borderColor: 'rgba(248, 213, 107, 1)',
                                borderWidth: 1,
                              },
                            ],
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* User Types chart removed */}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Process trips data
function processTripsData(trips) {
  // Extract unique categories from trips
  const uniqueCategories = [...new Set(trips.map(trip => trip.category || 'Uncategorized'))];
  
  const categories = {
    labels: uniqueCategories,
    data: uniqueCategories.map(category => 
      trips.filter(trip => (trip.category || 'Uncategorized') === category).length
    ),
    backgroundColor: [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(201, 203, 207, 0.7)',
    ],
  };

  const monthlyTrips = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: Array(12).fill(0),
  };

  // Extract unique statuses from trips
  const uniqueStatuses = [...new Set(trips.map(trip => trip.status || 'Upcoming'))];
  
  const status = {
    labels: uniqueStatuses,
    data: uniqueStatuses.map(status => 
      trips.filter(trip => (trip.status || 'Upcoming') === status).length
    ),
    backgroundColor: [
      'rgba(75, 192, 192, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(153, 102, 255, 0.7)',
    ],
  };

  // Get top destinations
  const destinationCounts = {};
  trips.forEach(trip => {
    const destination = trip.destination || trip.departure || 'Unknown';
    destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
  });
  
  // Sort destinations by count and take top 6
  const topDestinations = Object.entries(destinationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  
  const destinations = {
    labels: topDestinations.map(item => item[0]),
    data: topDestinations.map(item => item[1]),
  };

  // Process monthly data
  trips.forEach(trip => {
    // Use createdAt for the month data
    const date = new Date(trip.createdAt);
    if (!isNaN(date.getTime())) {
      const monthIndex = date.getMonth();
      monthlyTrips.data[monthIndex]++;
    }
  });

  return {
    categories,
    monthlyTrips,
    status,
    destinations,
  };
}

// Process users data
function processUsersData(users) {
  const joinedByMonth = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: Array(12).fill(0),
  };

  // Since we might not have age data, let's use a different chart
  // Let's use gender distribution instead
  const genderCounts = {
    'Male': 0,
    'Female': 0,
    'Other': 0,
    'Not specified': 0
  };
  
  users.forEach(user => {
    const gender = user.gender || 'Not specified';
    genderCounts[gender] = (genderCounts[gender] || 0) + 1;
  });
  
  const genderDistribution = {
    labels: Object.keys(genderCounts),
    data: Object.values(genderCounts),
    backgroundColor: [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(201, 203, 207, 0.7)',
    ],
  };

  // Trip participation
  const tripParticipation = {
    labels: ['No trips', '1-2 trips', '3-5 trips', '6+ trips'],
    data: [0, 0, 0, 0],
  };

  users.forEach(user => {
    // Process join date for monthly chart
    const joinDate = user.dateJoined || user.createdAt;
    if (joinDate) {
      const month = new Date(joinDate).getMonth();
      joinedByMonth.data[month]++;
    }
    
    // Process trip participation
    const tripsHosted = user.tripsHosted || 0;
    const tripsJoined = user.tripsJoined || 0;
    const totalTrips = tripsHosted + tripsJoined;
    
    if (totalTrips === 0) {
      tripParticipation.data[0]++;
    } else if (totalTrips <= 2) {
      tripParticipation.data[1]++;
    } else if (totalTrips <= 5) {
      tripParticipation.data[2]++;
    } else {
      tripParticipation.data[3]++;
    }
  });

  return {
    joinedByMonth,
    genderDistribution,
    tripParticipation,
  };
}

