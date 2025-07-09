import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MemberProfiles({ trip, onStartChat }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch complete profile data for all members
  useEffect(() => {
    const fetchMemberProfiles = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const profilesMap = {};
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        
        // Fetch organizer profile
        if (trip.organizerId) {
          try {
            console.log(`Fetching organizer profile for ID: ${trip.organizerId}`);
            
            // Try the profile endpoint first
            const response = await axios.get(`${BACKEND_URL}/api/profile/${trip.organizerId}`, { headers });
            
            if (response.data && response.data.success && response.data.profile) {
              console.log("Organizer profile fetched successfully:", response.data.profile);
              
              // Process avatar URL
              let avatarUrl = response.data.profile.avatar;
              
              // If avatar is not a data URL or absolute URL, ensure it has the correct path
              if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('http')) {
                // If it doesn't start with a slash, add one
                if (!avatarUrl.startsWith('/')) {
                  avatarUrl = `${BACKEND_URL}/${avatarUrl}`;
                } else {
                  avatarUrl = `${BACKEND_URL}${avatarUrl}`;
                }
              }
              
              // If no avatar, try to get it directly
              if (!avatarUrl) {
                avatarUrl = `${BACKEND_URL}/api/users/${trip.organizerId}/avatar`;
              }
              
              profilesMap[trip.organizerId] = {
                ...response.data.profile,
                avatar: avatarUrl
              };
            }
          } catch (err) {
            console.error("Failed to fetch organizer profile:", err);
            
            // Fallback: Try to get avatar directly
            profilesMap[trip.organizerId] = {
              fullName: trip.organizer,
              name: trip.organizer,
              avatar: `${BACKEND_URL}/api/users/${trip.organizerId}/avatar`
            };
          }
        }
        
        // Fetch member profiles
        if (trip.joinedMembers && trip.joinedMembers.length > 0) {
          const fetchPromises = trip.joinedMembers.map(member => {
            const memberId = member.id || member._id;
            if (!memberId) return Promise.resolve(null);
            
            console.log(`Fetching profile for member ID: ${memberId}`);
            
            // Try the profile endpoint first
            return axios.get(`${BACKEND_URL}/api/profile/${memberId}`, { headers })
              .then(response => {
                if (response.data && response.data.success && response.data.profile) {
                  console.log(`Profile fetched successfully for member ${memberId}:`, response.data.profile);
                  
                  // Process avatar URL
                  let avatarUrl = response.data.profile.avatar;
                  
                  // If avatar is not a data URL or absolute URL, ensure it has the correct path
                  if (avatarUrl && !avatarUrl.startsWith('data:') && !avatarUrl.startsWith('http')) {
                    // If it doesn't start with a slash, add one
                    if (!avatarUrl.startsWith('/')) {
                      avatarUrl = `${BACKEND_URL}/${avatarUrl}`;
                    } else {
                      avatarUrl = `${BACKEND_URL}${avatarUrl}`;
                    }
                  }
                  
                  // If no avatar, try to get it directly
                  if (!avatarUrl) {
                    avatarUrl = `${BACKEND_URL}/api/users/${memberId}/avatar`;
                  }
                  
                  return { 
                    id: memberId, 
                    profile: {
                      ...response.data.profile,
                      avatar: avatarUrl
                    }
                  };
                }
                return null;
              })
              .catch(err => {
                console.error(`Failed to fetch profile for member ${memberId}:`, err);
                
                // Fallback: Try to get avatar directly
                return { 
                  id: memberId, 
                  profile: {
                    fullName: member.name,
                    name: member.name,
                    avatar: `${BACKEND_URL}/api/users/${memberId}/avatar`
                  }
                };
              });
          });
          
          const results = await Promise.all(fetchPromises);
          results.forEach(result => {
            if (result && result.id && result.profile) {
              profilesMap[result.id] = result.profile;
            }
          });
        }
        
        console.log("All profiles fetched:", profilesMap);
        setMemberProfiles(profilesMap);
      } catch (error) {
        console.error("Error fetching member profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemberProfiles();
  }, [trip]);

  // Get profile data with fallback
  const getMemberProfile = (member) => {
    const memberId = member.id || member._id;
    if (memberId && memberProfiles[memberId]) {
      return {
        ...member,
        ...memberProfiles[memberId],
        // Ensure these fields are always available
        name: memberProfiles[memberId].fullName || memberProfiles[memberId].name || member.name,
        avatar: memberProfiles[memberId].avatar || member.avatar
      };
    }
    return member;
  };

  // Completely revised getAvatarUrl function with multiple fallback strategies
  const getAvatarUrl = (member) => {
    if (!member) {
      console.log('MemberProfiles: No member provided, using default avatar');
      return "/assets/images/default-avatar.webp";
    }
    
    // Log the member object to debug
    console.log(`MemberProfiles: getAvatarUrl for member:`, {
      id: member.id || member._id,
      name: member.name,
      avatarValue: member.avatar
    });
    
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    
    // STRATEGY 1: Check if avatar is a base64 string
    if (member.avatar && member.avatar.startsWith('data:')) {
      console.log('MemberProfiles: Using base64 avatar');
      return member.avatar;
    }
    
    // STRATEGY 2: Check if avatar is an absolute URL
    if (member.avatar && (member.avatar.startsWith('http://') || member.avatar.startsWith('https://'))) {
      console.log('MemberProfiles: Using absolute URL avatar:', member.avatar);
      return member.avatar;
    }
    
    // STRATEGY 3: Try to construct a full URL with the backend URL
    if (member.avatar) {
      // If it doesn't start with a slash, add the backend URL
      if (!member.avatar.startsWith('/')) {
        const fullUrl = `${BACKEND_URL}/${member.avatar}`;
        console.log('MemberProfiles: Using backend URL + relative path:', fullUrl);
        return fullUrl;
      }
      
      // If it starts with a slash, try both with and without the backend URL
      const fullUrl = `${BACKEND_URL}${member.avatar}`;
      console.log('MemberProfiles: Using backend URL + path with leading slash:', fullUrl);
      return fullUrl;
    }
    
    // STRATEGY 4: Try to use the profilePicture field if available
    if (member.profilePicture) {
      if (member.profilePicture.startsWith('http://') || member.profilePicture.startsWith('https://')) {
        console.log('MemberProfiles: Using profilePicture absolute URL:', member.profilePicture);
        return member.profilePicture;
      }
      
      if (!member.profilePicture.startsWith('/')) {
        const fullUrl = `${BACKEND_URL}/${member.profilePicture}`;
        console.log('MemberProfiles: Using backend URL + profilePicture:', fullUrl);
        return fullUrl;
      }
      
      const fullUrl = `${BACKEND_URL}${member.profilePicture}`;
      console.log('MemberProfiles: Using backend URL + profilePicture with leading slash:', fullUrl);
      return fullUrl;
    }
    
    // STRATEGY 5: Fallback to default
    console.log('MemberProfiles: No valid avatar found, using default');
    return "/assets/images/default-avatar.webp";
  };

  const allMembers = [
    {
      id: trip.organizerId,
      name: trip.organizer,
      avatar: trip.organizerAvatar,
      role: 'organizer',
      joinedDate: '2024-11-15',
      bio: 'Passionate traveler and adventure seeker. Love exploring new cultures and making memories!',
      interests: ['Photography', 'Hiking', 'Local Cuisine'],
      previousTrips: 12,
      rating: 4.9
    },
    ...trip.joinedMembers.map(member => ({
      ...member,
      role: 'member',
      bio: 'Excited to explore and meet new people on this amazing journey!',
      interests: ['Adventure', 'Culture', 'Nature'],
      previousTrips: Math.floor(Math.random() * 8) + 1,
      rating: (Math.random() * 1 + 4).toFixed(1)
    }))
  ];

  const handleMemberClick = (member) => {
    // Use the enhanced profile data when available
    setSelectedMember(getMemberProfile(member));
    setShowMemberModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold text-[#f8d56b]">Trip Members</h2>
          <p className="text-[#a8c4b8] text-sm">Loading member profiles...</p>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={`skeleton-${i}`} className="bg-gradient-to-r from-[#6F93AD] to-[#4a708a] rounded-xl p-4 border-2 border-[#d1c7b7] animate-pulse">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gray-300 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="member-profiles-container" style={{ position: 'relative', zIndex: 1000 }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 rounded-xl shadow-md mb-6">
        <h2 className="text-xl font-bold text-[#f8d56b]">Trip Members</h2>
        <p className="text-[#a8c4b8] text-sm">Connect with your fellow travelers</p>
      </div>
      
      {/* Members Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allMembers.map((member) => (
          <div
            key={member.id || `member-${member.name}`}
            onClick={() => handleMemberClick(member)}
            className="bg-gradient-to-r from-[#6F93AD] to-[#4a708a] rounded-xl p-4 border-2 border-[#d1c7b7] hover:border-[#f8d56b] transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={getAvatarUrl(member)}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-3 border-[#f8d56b] mx-auto"
                  onError={(e) => {
                    console.error("Failed to load avatar:", e.target.src);
                    
                    // Try different strategies if the first one fails
                    if (!e.target.src.includes("default-avatar")) {
                      e.target.onerror = null; // Prevent infinite error loop
                      
                      // Try strategy 1: Direct backend URL
                      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                      const memberId = member.id || member._id;
                      
                      if (memberId) {
                        console.log("Trying direct profile image URL:", `${BACKEND_URL}/api/users/${memberId}/avatar`);
                        e.target.src = `${BACKEND_URL}/api/users/${memberId}/avatar`;
                        return;
                      }
                      
                      // If that fails, use the default avatar
                      e.target.src = "/assets/images/default-avatar.webp";
                    }
                  }}
                />
                {member.role === 'organizer' && (
                  <div className="absolute -top-1 -right-1 bg-[#f87c6d] rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="mt-2 font-bold text-white text-sm sm:text-base truncate">
                {memberProfiles[member.id || member._id]?.fullName || member.name}
              </h3>
              <p className="text-[#f8d56b] text-xs sm:text-sm capitalize">
                {member.role === 'organizer' ? 'Trip Organizer' : 'Fellow Traveler'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Member Details Modal */}
      {showMemberModal && selectedMember && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-2xl p-4 sm:p-6 max-w-md w-full border-2 border-[#d1c7b7] shadow-2xl">
            {/* Modal content */}
            <div className="flex justify-end">
              <button 
                onClick={() => setShowMemberModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={getAvatarUrl(selectedMember)}
                alt={selectedMember.name}
                className="w-20 h-20 rounded-full object-cover border-3 border-[#f8d56b]"
                onError={(e) => {
                  console.error("Failed to load avatar in modal:", e.target.src);
                  
                  // Try different strategies if the first one fails
                  if (!e.target.src.includes("default-avatar")) {
                    e.target.onerror = null; // Prevent infinite error loop
                    
                    // Try strategy 1: Direct backend URL
                    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                    const memberId = selectedMember.id || selectedMember._id;
                    
                    if (memberId) {
                      console.log("Trying direct profile image URL in modal:", `${BACKEND_URL}/api/users/${memberId}/avatar`);
                      e.target.src = `${BACKEND_URL}/api/users/${memberId}/avatar`;
                      return;
                    }
                    
                    // If that fails, use the default avatar
                    e.target.src = "/assets/images/default-avatar.webp";
                  }
                }}
              />
              <div>
                <h3 className="text-xl font-bold text-[#2c5e4a]">
                  {selectedMember.fullName || selectedMember.name}
                </h3>
                <p className="text-[#f87c6d] font-medium">
                  {selectedMember.role === 'organizer' ? 'Trip Organizer' : 'Fellow Traveler'}
                </p>
              </div>
            </div>
            
            {/* Member details */}
            <div className="space-y-3">
              <p className="text-gray-700">{selectedMember.bio}</p>
              
              <div>
                <h4 className="font-semibold text-[#2c5e4a]">Interests</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedMember.interests?.map((interest, index) => (
                    <span 
                      key={`interest-${index}`}
                      className="bg-[#6F93AD] text-white px-2 py-1 rounded-full text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Previous Trips</p>
                  <p className="font-bold text-[#2c5e4a]">{selectedMember.previousTrips || 0}</p>
                </div>
                <div className="bg-white/50 p-2 rounded-lg">
                  <p className="text-xs text-gray-500">Rating</p>
                  <p className="font-bold text-[#2c5e4a]">{selectedMember.rating || "4.5"} ⭐</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    onStartChat(selectedMember);
                    setShowMemberModal(false);
                  }}
                  className="w-full bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Message {selectedMember.fullName || selectedMember.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
