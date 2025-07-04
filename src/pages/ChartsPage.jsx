import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data for demonstration
        // In a real app, you would fetch this from your API
        
        // Trip data
        const mockTripData = {
          categories: {
            labels: ['Beach', 'Mountain', 'City', 'Adventure', 'Cultural'],
            data: [12, 8, 15, 6, 9],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
          },
          monthlyTrips: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [5, 7, 10, 8, 12, 15, 20, 18, 14, 9, 6, 8],
          },
          status: {
            labels: ['Active', 'Completed', 'Cancelled'],
            data: [25, 35, 5],
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 99, 132, 0.7)',
            ],
          },
          destinations: {
            labels: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Australia'],
            data: [18, 22, 15, 8, 5, 7],
          }
        };
        
        // User data
        const mockUserData = {
          joinedByMonth: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [8, 12, 15, 10, 7, 9, 14, 18, 20, 15, 10, 12],
          },
          ageGroups: {
            labels: ['18-24', '25-34', '35-44', '45-54', '55+'],
            data: [15, 35, 25, 15, 10],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
          },
          genderDistribution: {
            labels: ['Male', 'Female', 'Prefer not to say'],
            data: [45, 40, 15],
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 99, 132, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
          },
          tripParticipation: {
            labels: ['No trips', '1-2 trips', '3-5 trips', '6+ trips'],
            data: [30, 40, 20, 10],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
            ],
          },
          userTypes: {
            labels: ['Organizers', 'Participants', 'Both'],
            data: [20, 60, 20],
            backgroundColor: [
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
          }
        };
        
        setTripData(mockTripData);
        setUserData(mockUserData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

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
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveTab('trips')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                activeTab === 'trips'
                  ? 'bg-[#2c5e4a] text-white'
                  : 'bg-[#f8f4e3] text-[#2c5e4a] hover:bg-[#e1d9c8]'
              }`}
            >
              <FiMap /> Trip Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                activeTab === 'users'
                  ? 'bg-[#2c5e4a] text-white'
                  : 'bg-[#f8f4e3] text-[#2c5e4a] hover:bg-[#e1d9c8]'
              }`}
            >
              <FiUsers /> User Analytics
            </button>
          </div>
        </div>

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
                        options={barOptions}
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

                  {/* Pie Chart - Age Groups */}
                  <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                    <div className="flex items-center mb-4">
                      <FiPieChart className="text-[#2c5e4a] text-xl mr-2" />
                      <h2 className="text-lg font-bold text-[#2c5e4a]">User Age Distribution</h2>
                    </div>
                    <div className="h-80">
                      <Pie
                        options={pieOptions}
                        data={{
                          labels: userData.ageGroups.labels,
                          datasets: [
                            {
                              data: userData.ageGroups.data,
                              backgroundColor: userData.ageGroups.backgroundColor,
                              borderColor: 'white',
                              borderWidth: 2,
                            },
                          ],
                        }}
                      />
                    </div>
                  </div>

                  {/* Bar Chart - Trip Participation */}
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
                              backgroundColor: 'rgba(248, 169, 93, 0.7)',
                              borderColor: 'rgba(248, 169, 93, 1)',
                              borderWidth: 1,
                            },
                          ],
                        }}
                      />
                    </div>
                  </div>

                  {/* Pie Chart - User Types */}
                  <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4">
                    <div className="flex items-center mb-4">
                      <FiPieChart className="text-[#2c5e4a] text-xl mr-2" />
                      <h2 className="text-lg font-bold text-[#2c5e4a]">User Types</h2>
                    </div>
                    <div className="h-80">
                      <Pie
                        options={pieOptions}
                        data={{
                          labels: userData.userTypes.labels,
                          datasets: [
                            {
                              data: userData.userTypes.data,
                              backgroundColor: userData.userTypes.backgroundColor,
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
          </>
        )}
      </main>
    </div>
  );
}

