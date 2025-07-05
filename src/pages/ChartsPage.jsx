import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBarChart2, FiHome, FiPieChart, FiUsers, FiMap } from 'react-icons/fi';
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
  const [activeTab, setActiveTab] = useState('trips');
  
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
  const processUsersData = useCallback((users) => {
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

      // Simplified gender distribution with exactly three categories
      const genderCounts = {
        'Male': 0,
        'Female': 0,
        'Prefer not to say': 0
      };
      
      users.forEach(user => {
        // Handle case sensitivity and normalize gender values
        let gender = 'Prefer not to say';
        if (user.gender) {
          const normalizedGender = user.gender.toLowerCase().trim();
          if (normalizedGender === 'male') {
            gender = 'Male';
          } else if (normalizedGender === 'female') {
            gender = 'Female';
          } else {
            // All other values go to "Prefer not to say"
            gender = 'Prefer not to say';
          }
        }
        genderCounts[gender]++;
        
        // Process join date for monthly chart
        if (user.joinDate || user.createdAt) {
          const date = new Date(user.joinDate || user.createdAt);
          if (!isNaN(date.getTime())) {
            const month = date.getMonth();
            joinedByMonth.data[month]++;
          }
        }
      });
      
      console.log("Processed gender counts:", genderCounts);
      
      const genderDistribution = {
        labels: Object.keys(genderCounts),
        data: Object.values(genderCounts),
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
    <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4 mb-6">
      <h3 className="text-lg font-bold text-[#2c5e4a] mb-4">Filter Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activeTab === 'users' && (
          <>
            <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date (From)</label>
              <input
                type="date"
                name="joinDateStart"
                value={filters.joinDateStart}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date (To)</label>
              <input
                type="date"
                name="joinDateEnd"
                value={filters.joinDateEnd}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-black"
              />
            </div>
          </>
        )}
        {activeTab === 'trips' && (
          <>
            <div>
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
          </>
        )}
        <div className="flex items-end">
          <button
            onClick={() => {
              // Reset filters
              setFilters({
                gender: 'all',
                joinDateStart: '',
                joinDateEnd: '',
                tripType: 'all'
              });
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
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
        
        setUsersResponse(usersResponse.data);
        
        // Process the data directly from the API response
        const processedUserData = processUsersData(usersResponse.data.users);
        setUserData(processedUserData);
        
        // Fetch additional profile data if needed
        if (usersResponse.data.users && usersResponse.data.users.length > 0) {
          try {
            const profilePromises = usersResponse.data.users.map(async (user) => {
              const userId = user._id || user.id;
              const profileResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/leaderboard/profile/${userId}`,
                { headers: { "Authorization": `Bearer ${token}` } }
              );
              return profileResponse.data.success ? profileResponse.data.profile : null;
            });
            
            const profiles = await Promise.all(profilePromises);
            setProfilesData(profiles.filter(profile => profile !== null));
          } catch (profileErr) {
            console.error("Error fetching profile data:", profileErr);
          }
        }
        
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
      if (activeTab === 'trips') {
        // Filter trips by type if not "all"
        if (filters.tripType !== 'all') {
          // Create filtered trip data
          const filteredTrips = tripsResponse.trips.filter(
            trip => trip.status === filters.tripType
          );
          setTripData(processTripsData(filteredTrips));
        } else {
          // Reset to all trips
          setTripData(processTripsData(tripsResponse.trips));
        }
      } else if (activeTab === 'users') {
        // Filter users
        let filteredUsers = usersResponse.users;
        
        // Filter by gender
        if (filters.gender !== 'all') {
          filteredUsers = filteredUsers.filter(user => user.gender === filters.gender);
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
        
        setUserData(processUsersData(filteredUsers));
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2c5e4a]">Analytics Dashboard</h1>
          <div className="flex space-x-4">
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
                                backgroundColor: userData.genderDistribution.backgroundColor,
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
      </main>
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

