import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiUsers, FiMapPin, FiCalendar } from 'react-icons/fi';
import { BACKEND_URL } from '../config';

export default function TripMemories({ tripType, onClose, currentUser }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add defensive check for currentUser
  useEffect(() => {
    const fetchTripData = async () => {
      try {
        setLoading(true);
        
        // Check if currentUser exists and has an id
        if (!currentUser || !currentUser.id) {
          console.error("Current user is undefined or missing ID");
          setError("User information is missing. Please try again later.");
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('authToken');
        const userId = currentUser.id;
        
        // Determine endpoint based on trip type
        const endpoint = tripType === 'posted' 
          ? `${BACKEND_URL}/api/trips?createdBy=${userId}` 
          : `${BACKEND_URL}/api/joined-trips/${userId}`;
          
        console.log(`Fetching ${tripType} trips for user ${userId} from ${endpoint}`);
        
        const response = await axios.get(endpoint, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        console.log(`${tripType} trips response:`, response.data);
        
        // Handle different response formats
        const tripsData = Array.isArray(response.data) ? response.data : 
                          (response.data.trips || response.data.data || []);
                          
        if (Array.isArray(tripsData) && tripsData.length > 0) {
          setTrips(tripsData.map(trip => ({
            ...trip,
            id: trip._id || trip.id,
            memories: trip.memories || []
          })));
        } else {
          setTrips([]);
        }
      } catch (error) {
        console.error(`Error fetching ${tripType} trips:`, error);
        setError(`Failed to load ${tripType} trips. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [tripType, currentUser]);

  const handleTripClick = (trip) => {
    // Handle trip click - navigate to trip details or show modal
    console.log("Trip clicked:", trip);
    // Implement navigation or modal display logic here
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full border border-[#d1c7b7] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-[#2c5e4a]">
            {tripType === 'posted' ? 'Trips Posted' : 'Trips Joined'}
          </h3>
          <button
            onClick={onClose}
            className="text-[#5E5854] hover:text-[#f87c6d] text-3xl font-bold"
          >
            <FiX />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c5e4a]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <>
            {/* Trip List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <div
                    key={trip._id || trip.id}
                    onClick={() => handleTripClick(trip)}
                    className="bg-white rounded-xl overflow-hidden border border-[#d1c7b7] cursor-pointer hover:border-[#f8a95d] transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg"
                  >
                    <div className="relative">
                      <img
                        src={trip.image || trip.coverImage || "/assets/images/default-trip.jpeg"}
                        alt={trip.title || trip.destination}
                        className="w-full h-32 sm:h-48 object-cover"
                        onError={(e) => {
                          e.target.src = "/assets/images/default-trip.jpeg";
                        }}
                      />
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                        <span className="bg-[#f8a95d] text-white text-xs px-2 py-1 rounded-full">
                          {new Date(trip.fromDate || trip.startDate).toLocaleDateString()} - {new Date(trip.toDate || trip.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-[#2c5e4a] text-lg mb-1">{trip.title || trip.destination}</h3>
                      <p className="text-[#5E5854] text-sm mb-2">{trip.description?.substring(0, 80) || "No description available"}...</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[#5E5854] text-xs flex items-center">
                          <FiUsers className="mr-1" /> {trip.joinedMembers?.length || trip.numberOfPeople || 0} travelers
                        </span>
                        <span className="text-[#f8a95d] text-xs font-medium">View Details</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-8 text-center">
                  <p className="text-[#5E5854]">No {tripType} trips found.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
