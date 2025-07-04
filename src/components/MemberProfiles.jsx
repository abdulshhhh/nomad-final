import { useState } from 'react';

export default function MemberProfiles({ trip, onStartChat }) {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const allMembers = [
    {
      id: trip.organizerId,
      name: trip.organizer,
      avatar: trip.organizerAvatar,
      role: 'organizer',
      joinedDate: '2024-11-15', // Organizer created the trip
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
    setSelectedMember(member);
    setShowMemberModal(true);
  };

  const formatJoinedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 rounded-xl shadow-md mb-6">
        <h2 className="text-xl font-bold text-[#f8d56b]">Trip Members</h2>
        <p className="text-[#a8c4b8] text-sm">Connect with your fellow travelers</p>
      </div>
      
      {/* Members Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => handleMemberClick(member)}
            className="bg-gradient-to-r from-[#6F93AD] to-[#4a708a] rounded-xl p-4 border-2 border-[#d1c7b7] hover:border-[#f8d56b] transition-all duration-300 cursor-pointer hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-3 border-[#f8d56b] mx-auto"
                />
                {member.role === 'organizer' && (
                  <div className="absolute -top-1 -right-1 bg-[#f87c6d] rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <h3 className="mt-2 font-bold text-white text-sm sm:text-base truncate">{member.name}</h3>
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
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] -m-4 sm:-m-6 mb-4 sm:mb-6 p-4 sm:p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold text-[#f8d56b] mb-2">Member Profile</h2>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative">
                    <img
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      className="w-16 sm:w-20 h-16 sm:h-20 rounded-full object-cover border-3 border-[#f8d56b]"
                    />
                    {selectedMember.role === 'organizer' && (
                      <div className="absolute -top-2 -right-2 bg-[#f87c6d] rounded-full p-1 sm:p-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">{selectedMember.name}</h3>
                    <p className="text-[#a8c4b8] text-sm capitalize">
                      {selectedMember.role === 'organizer' ? '👑 Trip Organizer' : '🎒 Fellow Traveler'}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="text-[#f8d56b]">★</span>
                      <span className="text-white font-medium ml-1">{selectedMember.rating}</span>
                      <span className="text-[#a8c4b8] text-xs sm:text-sm ml-1">({selectedMember.previousTrips} trips)</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="text-white hover:text-[#f8d56b] text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Member Info */}
            <div className="space-y-3 sm:space-y-4">
              {/* Bio */}
              <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-3 sm:p-4 rounded-xl border border-[#d1c7b7]">
                <h4 className="font-bold text-[#f8d56b] mb-1 sm:mb-2">About</h4>
                <p className="text-[#a8c4b8] text-xs sm:text-sm">{selectedMember.bio}</p>
              </div>

              {/* Interests */}
              <div className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] p-3 sm:p-4 rounded-xl border border-[#d1c7b7]">
                <h4 className="font-bold text-white mb-1 sm:mb-2">Interests</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {selectedMember.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-2 sm:px-3 py-1 bg-[#2c5e4a] text-[#f8d56b] rounded-full text-xs sm:text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Trip Stats */}
              <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 rounded-xl border border-[#d1c7b7]">
                <h4 className="font-bold text-[#f8d56b] mb-2">Travel Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[#f8a95d]">{selectedMember.previousTrips}</p>
                    <p className="text-[#a8c4b8] text-sm">Trips Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#f8a95d]">{selectedMember.rating}</p>
                    <p className="text-[#a8c4b8] text-sm">Average Rating</p>
                  </div>
                </div>
              </div>

              {/* Join Date */}
              <div className="text-center">
                <p className="text-[#5E5854] text-sm">
                  {selectedMember.role === 'organizer' 
                    ? `Created this trip on ${formatJoinedDate(selectedMember.joinedDate)}`
                    : `Joined on ${formatJoinedDate(selectedMember.joinedDate)}`
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 sm:space-x-3 mt-4 sm:mt-6">
              <button
                onClick={() => setShowMemberModal(false)}
                className="flex-1 bg-[#5E5854] hover:bg-[#2c5e4a] text-white py-2 rounded-xl transition-colors font-semibold text-sm sm:text-base"
              >
                Close
              </button>
              {selectedMember.id !== 'current_user' && (
                <button
                  onClick={() => {
                    setShowMemberModal(false);
                    onStartChat();
                  }}
                  className="flex-1 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white py-2 rounded-xl transition-colors font-semibold text-sm sm:text-base"
                >
                  Message
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
