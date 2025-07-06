import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiHome, FiFilter, FiChevronDown, FiChevronUp, FiUsers, FiTrash2, FiAlertCircle, FiDownload } from "react-icons/fi";
import { BsCircleFill } from "react-icons/bs";
import io from 'socket.io-client';

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [socket, setSocket] = useState(null);
  
  // Filtering and sorting states
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [genderFilter, setGenderFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        if (!token) {
          console.error("No authentication token found");
          setError("Authentication required. Please log in again.");
          setLoading(false);
          navigate('/login'); // Redirect to login page
          return;
        }

        // Log token for debugging (first few characters only)
        console.log("Using token:", token.substring(0, 10) + "...");

        // First get basic user data
        const userResponse = await axios.get(`${BACKEND_URL}/api/admin/users`, {
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        });
        
        if (!userResponse.data || !userResponse.data.success) {
          throw new Error("Failed to fetch users data");
        }
        
        // For each user, fetch their profile data to get phone number
        const usersWithProfiles = await Promise.all(
          userResponse.data.users.map(async (user) => {
            try {
              const profileResponse = await axios.get(`${BACKEND_URL}/api/profile/${user._id || user.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
              });
              
              // If profile exists, merge it with user data
              if (profileResponse.data && profileResponse.data.success && profileResponse.data.profile) {
                return {
                  ...user,
                  ...profileResponse.data.profile,
                  // Ensure we have consistent property names
                  phone: profileResponse.data.profile.phone || user.phone || user.phoneNumber,
                  fullName: profileResponse.data.profile.fullName || user.fullName || user.name,
                  avatar: profileResponse.data.profile.avatar || user.avatar || user.profilePicture,
                  gender: profileResponse.data.profile.gender || user.gender || "prefer not to say"
                };
              }
              return {
                ...user,
                gender: user.gender || "prefer not to say"
              };
            } catch (err) {
              console.log(`Could not fetch profile for user ${user._id || user.id}:`, err.message);
              return {
                ...user,
                gender: user.gender || "prefer not to say"
              };
            }
          })
        );
        
        setUsers(usersWithProfiles);
        setFilteredUsers(usersWithProfiles);
        
        // Fetch online status
        fetchOnlineStatus();
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setError(`Error loading users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    
    // Set up interval to refresh online status
    const statusInterval = setInterval(() => {
      fetchOnlineStatus();
    }, 60000); // Refresh every minute
    
    // Connect to socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    
    // Listen for online status updates
    newSocket.on('userStatusUpdate', (data) => {
      setOnlineUsers(prevStatus => ({
        ...prevStatus,
        [data.userId]: data.isOnline
      }));
    });
    
    // Clean up socket on unmount
    return () => {
      clearInterval(statusInterval);
      if (socket) socket.disconnect();
    };
  }, [BACKEND_URL]);
  
  const fetchOnlineStatus = async () => {
    try {
      console.log("Generating random online status for demo purposes");
      const randomStatus = {};
      users.forEach(user => {
        randomStatus[user._id || user.id] = Math.random() > 0.5;
      });
      setOnlineUsers(randomStatus);
    } catch (err) {
      console.error("Error generating online status:", err.message);
    }
  };

  // Apply filters and sorting whenever filter criteria change
  useEffect(() => {
    let result = [...users];
    
    // Apply gender filter
    if (genderFilter !== "all") {
      result = result.filter(user => 
        user.gender && user.gender.toLowerCase() === genderFilter.toLowerCase()
      );
    }
    
    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter(user => {
        const userDate = new Date(user.dateJoined || user.createdAt || 0);
        return userDate >= fromDate;
      });
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      result = result.filter(user => {
        const userDate = new Date(user.dateJoined || user.createdAt || 0);
        return userDate <= toDate;
      });
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === "name") {
        valueA = (a.fullName || a.name || "").toLowerCase();
        valueB = (b.fullName || b.name || "").toLowerCase();
      } else if (sortBy === "date") {
        valueA = new Date(a.dateJoined || a.createdAt || 0);
        valueB = new Date(b.dateJoined || b.createdAt || 0);
      }
      
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredUsers(result);
  }, [users, sortBy, sortOrder, genderFilter, dateFrom, dateTo]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  const handleDeleteUser = (e, user) => {
    e.stopPropagation(); // Prevent triggering any parent click handlers
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setLoading(true);
      
      // For demo purposes, just update the UI state
      console.log(`Removing user from UI: ${userToDelete.fullName || userToDelete.name || userToDelete.email}`);
      
      // Remove user from state
      setUsers(prevUsers => prevUsers.filter(user => 
        (user._id || user.id) !== (userToDelete._id || userToDelete.id)
      ));
      setFilteredUsers(prevFiltered => prevFiltered.filter(user => 
        (user._id || user.id) !== (userToDelete._id || userToDelete.id)
      ));
      
      // Show success message
      alert(`User ${userToDelete.fullName || userToDelete.name || userToDelete.email} has been removed.`);
      
      // Reset UI state
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      console.error("Error handling user deletion:", err);
      alert(`Failed to remove user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelDeleteUser = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleExportUsers = () => {
    // Create CSV format
    const csvHeaders = 'ID,Name,Email,Phone,Joined Date,Trips Hosted,Trips Joined,Gender,Status';
    const csvData = users.map(user => 
      `"${user._id}","${user.fullName || user.name || user.email}","${user.email}","${user.phone || user.phoneNumber || "—"}","${user.dateJoined || user.createdAt ? new Date(user.dateJoined || user.createdAt).toLocaleDateString() : "—"}","${user.tripsHosted || 0}","${user.tripsJoined || 0}","${user.gender || "Prefer not to say"}","${user.status || "Active"}"`
    ).join('\n');
    const csvContent = `${csvHeaders}\n${csvData}`;

    // Create downloadable CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && users.length === 0) return <div className="p-8 text-center">Loading users...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FiUsers className="text-[#f8d56b] text-2xl mr-2" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#f8d56b]">
                User Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-[#f8d56b] text-[#2c5e4a] px-4 py-2 rounded-lg flex items-center hover:bg-[#f0c550] transition"
              >
                <FiHome className="mr-2" /> Back to Admin
              </button>
              <button
                onClick={handleExportUsers}
                className="bg-[#f8d56b] text-[#2c5e4a] px-4 py-2 rounded-lg flex items-center hover:bg-[#f0c550] transition"
              >
                <FiDownload className="mr-2" /> Export Users
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#2c5e4a] mb-4 font-cinzel">
            All Users
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
                      <option value="name">Name</option>
                      <option value="date">Date Joined</option>
                    </select>
                    <button 
                      onClick={toggleSortOrder}
                      className="bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg p-2 text-[#2c5e4a]"
                    >
                      {sortOrder === "asc" ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>
                </div>
                
                {/* Gender Filter */}
                <div>
                  <label className="block text-[#2c5e4a] font-medium mb-2">Gender</label>
                  <select 
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg px-3 py-2 text-[#2c5e4a]"
                  >
                    <option value="all">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer not to say">Prefer not to say</option>
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
          
          {/* Users List */}
          <div className="grid gap-4">
            {filteredUsers.map((user) => {
              const userId = user._id || user.id;
              const isOnline = onlineUsers[userId];
              
              return (
                <div
                  key={userId}
                  className="flex flex-col sm:flex-row items-center bg-white rounded-xl shadow border border-[#d1c7b7] p-3 hover:shadow-xl transition"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || user.profilePicture || "/assets/images/default-avatar.webp"}
                      alt="Profile"
                      className="w-12 h-12 rounded-full border-2 border-[#f8d56b] object-cover mb-2 sm:mb-0 sm:mr-4"
                    />
                    <div className="absolute bottom-1 right-1 sm:bottom-0 sm:right-3">
                      <BsCircleFill 
                        className={`${isOnline ? 'text-green-500' : 'text-gray-400'} text-xs`} 
                        title={isOnline ? 'Online' : 'Offline'}
                      />
                    </div>
                  </div>
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <div className="text-[#2c5e4a] font-bold text-base font-cinzel flex items-center">
                        {user.fullName || user.name || user.email}
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div className="text-[#5E5854] text-xs">{user.email}</div>
                      <div className="text-[#f87c6d] text-xs mt-1">
                        Joined:{" "}
                        <span className="font-semibold text-[#2c5e4a]">
                          {user.dateJoined || user.createdAt 
                            ? new Date(user.dateJoined || user.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <div className="text-[#2c5e4a] font-medium text-sm">
                        <span className="mr-2 text-[#a8c4b8]">Phone:</span>
                        {user.phone || user.phoneNumber || "—"}
                      </div>
                      <div className="text-[#2c5e4a] font-medium text-sm">
                        <span className="mr-2 text-[#a8c4b8]">Gender:</span>
                        {user.gender || "Prefer not to say"}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="bg-[#f8d56b] text-[#2c5e4a] px-2 py-0.5 rounded-full text-xs font-bold shadow">
                          Trips Posted: {user.tripsHosted || 0}
                        </span>
                        <span className="bg-[#f87c6d] text-white px-2 py-0.5 rounded-full text-xs font-bold shadow">
                          Trips Joined: {user.tripsJoined || 0}
                        </span>
                        <button
                          onClick={(e) => handleDeleteUser(e, user)}
                          className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow flex items-center hover:bg-red-600 transition"
                        >
                          <FiTrash2 className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-6 text-center text-[#5E5854]">
                No users found matching the current filters.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center text-red-500 mb-4">
              <FiAlertCircle className="text-3xl mr-2" />
              <h3 className="text-xl font-bold">Confirm Delete</h3>
            </div>
            <p className="mb-6 text-[#5E5854]">
              Are you sure you want to delete the user <span className="font-bold text-[#2c5e4a]">{userToDelete?.fullName || userToDelete?.name || userToDelete?.email}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteUser}
                className="px-4 py-2 border border-gray-300 rounded-lg text-[#5E5854] hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
              >
                <FiTrash2 className="mr-2" /> Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {loading && users.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-[#2c5e4a] font-bold">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
