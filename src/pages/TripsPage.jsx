
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMap, FiHome, FiTrash2, FiFilter, FiCalendar, FiUsers, FiDollarSign, FiChevronUp, FiChevronDown, FiSearch, FiDownload } from 'react-icons/fi';
import { BsCircleFill } from 'react-icons/bs';

export default function TripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);
  
  // Filtering and sorting states
  const [sortBy, setSortBy] = useState('fromDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        
        // Check if backend is reachable at all
        try {
          console.log("Checking backend connectivity at:", BACKEND_URL);
          const healthCheck = await axios.get(`${BACKEND_URL}/health`, { 
            timeout: 3000,
            validateStatus: function (status) {
              return status < 500; // Only treat 500+ errors as actual errors
            }
          });
          console.log("Backend health check response:", healthCheck.status);
        } catch (healthError) {
          console.error("Backend health check failed:", healthError.message);
          setError(`Cannot connect to backend server at ${BACKEND_URL}. Please check if the server is running.`);
        }
        
        // Try multiple possible endpoints
        const possibleEndpoints = [
          '/api/trips'  // This is the correct endpoint based on your backend code
        ];

        let tripsData = null;

        for (const endpoint of possibleEndpoints) {
          try {
            console.log(`Trying endpoint: ${BACKEND_URL}${endpoint}`);
            const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              timeout: 5000,  // Increased timeout
              validateStatus: function (status) {
                return status < 500; // Only treat 500+ errors as actual errors
              }
            });
            
            if (response.status === 200 && response.data) {
              console.log(`Successful response from ${endpoint}:`, response.data);
              
              // Extract trips data from response
              const extractedData = Array.isArray(response.data) ? response.data : 
                                   (response.data.trips ? response.data.trips : 
                                   (response.data.success ? response.data.trips : []));
              
              if (extractedData && extractedData.length > 0) {
                tripsData = extractedData;
                console.log(`Found ${tripsData.length} trips at endpoint ${endpoint}`);
                break; // Exit the loop if we found data
              }
            }
          } catch (endpointError) {
            console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
            // Continue to next endpoint
          }
        }
        
        if (tripsData && tripsData.length > 0) {
          // Process the trips data
          const tripsWithDetails = tripsData.map(trip => ({
            ...trip,
            id: trip._id || trip.id,
            organizer: trip.organizer || { 
              name: trip.createdBy?.name || 'Unknown', 
              avatar: trip.createdBy?.avatar || '/assets/images/default-avatar.png' 
            },
            formattedFromDate: new Date(trip.fromDate).toLocaleDateString(),
            formattedToDate: new Date(trip.toDate).toLocaleDateString(),
            status: trip.status || 'active',
            joinedMembers: trip.joinedMembers || []
          }));
          
          setTrips(tripsWithDetails);
          setFilteredTrips(tripsWithDetails);
        } else {
          // If no data found from any endpoint, set empty array
          console.log("No data found from any API endpoint");
          setTrips([]);
          setFilteredTrips([]);
        }
      } catch (err) {
        console.error("Error in trip data handling:", err);
        setError(`Error loading trips: ${err.message}`);
        
        // Set empty arrays instead of mock data
        setTrips([]);
        setFilteredTrips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
    
    // Set up interval to refresh data periodically for real-time updates
    const refreshInterval = setInterval(fetchTrips, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(refreshInterval); // Clean up on unmount
  }, [BACKEND_URL]);

  // Filter and sort trips
  useEffect(() => {
    let result = [...trips];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trip => 
        trip.destination?.toLowerCase().includes(query) ||
        trip.organizer?.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(trip => trip.category === categoryFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(trip => trip.status === statusFilter);
    }
    
    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter(trip => new Date(trip.fromDate) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      result = result.filter(trip => new Date(trip.toDate) <= toDate);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;
      
      if (sortBy === 'fromDate') {
        valueA = new Date(a.fromDate);
        valueB = new Date(b.fromDate);
      } else if (sortBy === 'destination') {
        valueA = a.destination.toLowerCase();
        valueB = b.destination.toLowerCase();
      } else if (sortBy === 'budget') {
        valueA = a.budget?.amount || 0;
        valueB = b.budget?.amount || 0;
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredTrips(result);
  }, [trips, sortBy, sortOrder, categoryFilter, statusFilter, dateFrom, dateTo, searchQuery]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  
  const handleDeleteTrip = (e, trip) => {
    e.stopPropagation(); // Prevent triggering any parent click handlers
    setTripToDelete(trip);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      
      // Try to delete from backend using the appropriate endpoint
      try {
        if (isAdmin) {
          // Use admin endpoint
          await axios.delete(`${BACKEND_URL}/api/admin/trips/${tripToDelete.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
        } else {
          // Use regular user endpoint
          await axios.delete(`${BACKEND_URL}/api/trips/${tripToDelete.id}/abandon`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
        }
        console.log(`Successfully deleted trip ${tripToDelete.id}`);
      } catch (deleteError) {
        console.error("Error deleting trip from API:", deleteError);
        // Try alternative endpoint as fallback
        try {
          const alternativeEndpoint = isAdmin 
            ? `/api/trips/${tripToDelete.id}/abandon` 
            : `/api/admin/trips/${tripToDelete.id}`;
          
          await axios.delete(`${BACKEND_URL}${alternativeEndpoint}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          console.log(`Successfully deleted trip using alternative endpoint`);
        } catch (fallbackError) {
          console.error("Fallback delete also failed:", fallbackError);
        }
      }
      
      // Update local state regardless of API success
      setTrips(trips.filter(trip => trip.id !== tripToDelete.id));
      setFilteredTrips(filteredTrips.filter(trip => trip.id !== tripToDelete.id));
      setShowDeleteConfirm(false);
      setTripToDelete(null);
    } catch (err) {
      console.error("Error in delete handling:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelDeleteTrip = () => {
    setShowDeleteConfirm(false);
    setTripToDelete(null);
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(trips.map(trip => trip.category).filter(Boolean))];
  const statuses = ['all', 'active', 'completed', 'cancelled'];

  const handleExportTrips = () => {
    // Create CSV format
    const csvHeaders = 'ID,Title,Destination,Departure,From Date,To Date,Duration,Status,Price,Organizer,Max People,Current Participants,Category,Transport';
    const csvData = filteredTrips.map(trip => 
      `"${trip.id}","${trip.title || trip.destination}","${trip.destination}","${trip.departure || "—"}","${trip.formattedFromDate}","${trip.formattedToDate}","${trip.duration || "—"}","${trip.status || "active"}","${trip.budget?.amount || "—"}","${trip.organizer?.name || trip.organizer || "Unknown"}","${trip.maxPeople || 0}","${trip.joinedMembers?.length || 0}","${trip.category || "—"}","${trip.transport || "—"}"`
    ).join('\n');
    const csvContent = `${csvHeaders}\n${csvData}`;

    // Create downloadable CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-[#f8d56b] text-[#2c5e4a] px-4 py-2 rounded-lg flex items-center hover:bg-[#f0c550] transition"
              >
                <FiHome className="mr-2" /> Back to Admin
              </button>
              <button
                onClick={handleExportTrips}
                className="bg-[#f8d56b] text-[#2c5e4a] px-4 py-2 rounded-lg flex items-center hover:bg-[#f0c550] transition"
              >
                <FiDownload className="mr-2" /> Export Trips
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-auto flex-grow">
              <input
                type="text"
                placeholder="Search trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#d1c7b7] focus:outline-none focus:ring-2 focus:ring-[#2c5e4a]"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2c5e4a] text-[#f8d56b] rounded-lg hover:bg-[#1a3a2a] transition"
              >
                <FiFilter />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              <span className="text-[#2c5e4a] font-medium">
                {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} found
              </span>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl shadow border border-[#d1c7b7] p-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Sort Options */}
                <div>
                  <label className="block text-[#2c5e4a] font-medium mb-2">Sort By</label>
                  <div className="flex items-center">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg px-3 py-2 mr-2 text-[#2c5e4a]"
                    >
                      <option value="destination">Destination</option>
                      <option value="fromDate">Date</option>
                      <option value="budget">Budget</option>
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
                    <option value="Beach">Beach</option>
                    <option value="Mountain">Mountain</option>
                    <option value="City">City</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Cultural">Cultural</option>
                  </select>
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-[#2c5e4a] font-medium mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg px-3 py-2 text-[#2c5e4a]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                {/* Date Range */}
                <div>
                  <label className="block text-[#2c5e4a] font-medium mb-2">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-[#f8f4e3] border border-[#d1c7b7] rounded-lg px-3 py-2 text-[#2c5e4a]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#2c5e4a] font-medium mb-2">To Date</label>
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
        </div>
        
        {/* Trip List */}
        {loading && trips.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c5e4a]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiMap className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900">No trips found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => {
              const tripId = trip._id || trip.id;
              return (
                <div
                  key={tripId}
                  className="flex flex-col sm:flex-row items-center bg-white rounded-xl shadow border border-[#d1c7b7] p-3 hover:shadow-xl transition"
                >
                  <div className="relative">
                    <img
                      src={trip.coverImage || "/assets/images/default-trip.jpg"}
                      alt={trip.destination}
                      className="w-16 h-16 rounded-lg border-2 border-[#f8d56b] object-cover mb-2 sm:mb-0 sm:mr-4"
                    />
                    <div className="absolute bottom-1 right-1 sm:bottom-0 sm:right-3">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        trip.status === 'active' ? 'bg-green-500' : 
                        trip.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'
                      }`}></span>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                    <div>
                      <div className="text-[#2c5e4a] font-bold text-base flex items-center">
                        {trip.destination}
                        <span className="ml-2 text-xs bg-[#f8d56b] text-[#2c5e4a] px-2 py-0.5 rounded-full">
                          {trip.category || 'Uncategorized'}
                        </span>
                      </div>
                      
                      <div className="text-[#2c5e4a] text-sm flex items-center">
                        <FiCalendar className="mr-1" />
                        {trip.formattedFromDate} - {trip.formattedToDate}
                      </div>
                      
                      <div className="text-[#2c5e4a] text-sm flex items-center">
                        <FiUsers className="mr-1" />
                        {trip.joinedMembers?.length || 0}/{trip.maxPeople || 0} participants
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[#2c5e4a] font-medium text-sm flex items-center">
                        <span className="mr-2 text-[#a8c4b8]">Organizer:</span>
                        {trip.organizer?.name || 'Unknown'}
                      </div>
                      
                      <div className="text-[#2c5e4a] font-medium text-sm flex items-center">
                        <FiDollarSign className="mr-1" />
                        <span className="mr-2 text-[#a8c4b8]">Budget:</span>
                        {trip.budget?.amount || 0} {trip.budget?.currency || 'USD'}
                      </div>
                      
                      <div className="mt-1 flex flex-wrap gap-2">
                        <span className="bg-[#f8d56b] text-[#2c5e4a] px-2 py-0.5 rounded-full text-xs font-bold shadow">
                          {trip.status || 'active'}
                        </span>
                        <button
                          onClick={(e) => handleDeleteTrip(e, trip)}
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
          </div>
        )}
      </main>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center text-red-500 mb-4">
              <FiTrash2 className="text-3xl mr-2" />
              <h3 className="text-xl font-bold">Confirm Delete</h3>
            </div>
            <p className="mb-6 text-[#5E5854]">
              Are you sure you want to delete the trip to <span className="font-bold text-[#2c5e4a]">{tripToDelete?.destination}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-[#5E5854] hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTrip}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
              >
                <FiTrash2 className="mr-2" /> Delete Trip
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading Overlay */}
      {loading && trips.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-[#2c5e4a] font-bold">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
