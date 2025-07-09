import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function TripMembers({ members, onViewProfile }) {
  const [memberAvatars, setMemberAvatars] = useState({});
  
  // Fetch avatars for all members when component mounts
  useEffect(() => {
    const fetchAvatars = async () => {
      const avatarMap = {};
      
      for (const member of members) {
        const memberId = member.id || member._id;
        if (!memberId) continue;
        
        try {
          // Try to get avatar directly from API
          const response = await axios.get(`${BACKEND_URL}/api/users/${memberId}/avatar`, {
            responseType: 'blob'
          });
          
          // Create object URL from blob
          const avatarUrl = URL.createObjectURL(response.data);
          avatarMap[memberId] = avatarUrl;
        } catch (error) {
          console.error(`Failed to fetch avatar for member ${memberId}:`, error);
          avatarMap[memberId] = "/assets/images/default-avatar.webp";
        }
      }
      
      setMemberAvatars(avatarMap);
    };
    
    if (members && members.length > 0) {
      fetchAvatars();
    }
    
    // Cleanup function to revoke object URLs
    return () => {
      Object.values(memberAvatars).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [members]);
  
  // Enhance the getAvatar function to ensure it always returns a valid image URL
  const getAvatar = (member) => {
    const memberId = member.id || member._id;
    
    // If we have a cached avatar, use it
    if (memberId && memberAvatars[memberId]) {
      return memberAvatars[memberId];
    }
    
    // Otherwise use member's avatar if available and valid
    if (member.avatar && (member.avatar.startsWith('data:') || member.avatar.startsWith('http'))) {
      return member.avatar;
    }
    
    // Fallback to default
    return "/assets/images/default-avatar.webp";
  };
  
  // Group members by role
  const organizers = members.filter(m => m.role === 'organizer');
  const participants = members.filter(m => m.role === 'participant');
  
  return (
    <div className="trip-members">
      {/* Organizers Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Trip Organizer</h3>
        {organizers.map(organizer => (
          <div 
            key={organizer.id || organizer._id} 
            className="flex items-center bg-[#f8f4e3] p-3 rounded-lg border border-[#d1c7b7] mb-2"
            onClick={() => onViewProfile(organizer)}
          >
            <img
              src={getAvatar(organizer)}
              alt={organizer.name || organizer.fullName}
              className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
              onError={(e) => {
                console.log("Fallback to default avatar");
                e.target.onerror = null;
                e.target.src = "/assets/images/default-avatar.webp";
              }}
            />
            <div>
              <h5 className="font-medium cursor-pointer">
                {organizer.name || organizer.fullName}
              </h5>
              <p className="text-xs text-gray-500">Trip Organizer</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Participants Section */}
      {participants.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Participants</h3>
          {participants.map(participant => (
            <div 
              key={participant.id || participant._id} 
              className="flex items-center bg-white p-3 rounded-lg border border-gray-200 mb-2"
              onClick={() => onViewProfile(participant)}
            >
              <img
                src={getAvatar(participant)}
                alt={participant.name || participant.fullName}
                className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                onError={(e) => {
                  console.log("Fallback to default avatar");
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/assets/images/default-avatar.webp";
                }}
              />
              <div>
                <h5 className="font-medium cursor-pointer">
                  {participant.name || participant.fullName}
                </h5>
                <p className="text-xs text-gray-500">Participant</p>
                {participant.joinedDate && (
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(participant.joinedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
