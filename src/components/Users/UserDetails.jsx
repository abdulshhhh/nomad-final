import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function UserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        console.log(`Attempting to fetch user data for ID: ${userId}`);
        
        // Try to get profile data first (more detailed)
        try {
          console.log(`Trying profile endpoint: ${BACKEND_URL}/api/profile/${userId}`);
          const profileResponse = await axios.get(
            `${BACKEND_URL}/api/profile/${userId}`,
            { 
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              timeout: 5000 // Add timeout to avoid hanging requests
            }
          );
          
          console.log('Profile response:', profileResponse.data);
          
          if (profileResponse.data && profileResponse.data.success) {
            setUser(profileResponse.data.profile);
            setLoading(false);
            return;
          }
        } catch (profileErr) {
          console.log("Profile fetch failed:", profileErr.message);
        }
        
        // Fallback to user endpoint
        console.log(`Trying user endpoint: ${BACKEND_URL}/api/auth/users/${userId}`);
        const userResponse = await axios.get(
          `${BACKEND_URL}/api/auth/users/${userId}`,
          { 
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            timeout: 5000
          }
        );
        
        console.log('User response:', userResponse.data);
        
        if (userResponse.data && userResponse.data.success) {
          setUser(userResponse.data.user);
        } else {
          setError("Failed to fetch user data");
        }
      } catch (err) {
        console.error("Error fetching user details:", err.message);
        setError(`Error loading user data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, BACKEND_URL]);

  if (loading) return <div className="p-8 text-center">Loading user data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!user) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-[#d1c7b7] overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center">
            <img
              src={user.avatar || user.profilePicture || "/assets/images/default-avatar.webp"}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-[#f8d56b] object-cover mb-6"
            />
            <h2 className="text-2xl font-bold text-[#2c5e4a] mb-4">{user.fullName || user.name || user.email}</h2>
            
            <div className="w-full space-y-4 mt-4">
              <div className="bg-[#f8f4e3] p-4 rounded-xl border border-[#d1c7b7]">
                <h4 className="font-bold text-[#2c5e4a] mb-3">Contact Information</h4>
                <div className="space-y-2 text-[#5E5854]">
                  <p><span className="font-semibold">Email:</span> {user.email}</p>
                  <p><span className="font-semibold">Phone:</span> {user.phone || user.phoneNumber || "Not provided"}</p>
                  <p><span className="font-semibold">Location:</span> {user.location || "Not provided"}</p>
                </div>
              </div>
              
              <div className="bg-[#f8f4e3] p-4 rounded-xl border border-[#d1c7b7]">
                <h4 className="font-bold text-[#2c5e4a] mb-3">User Statistics</h4>
                <div className="space-y-2 text-[#5E5854]">
                  <p><span className="font-semibold">Trips Hosted:</span> {user.tripsHosted || 0}</p>
                  <p><span className="font-semibold">Trips Joined:</span> {user.tripsJoined || 0}</p>
                  <p><span className="font-semibold">Member Since:</span> {user.dateJoined || "Unknown"}</p>
                </div>
              </div>
              
              {user.bio && (
                <div className="bg-[#f8f4e3] p-4 rounded-xl border border-[#d1c7b7]">
                  <h4 className="font-bold text-[#2c5e4a] mb-3">About</h4>
                  <p className="text-[#5E5854]">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
