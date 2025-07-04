import { useState, useEffect } from 'react';
import { FiX, FiChevronLeft, FiStar, FiUsers, FiMapPin, FiCalendar, FiDollarSign } from 'react-icons/fi';

export default function TripMemories({ tripType, onClose, tripsData = [] }) {
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock data for posted trips
  const postedTrips = [
    {
      id: 1,
      title: "European Backpacking Adventure",
      destination: "Multiple Cities, Europe",
      duration: "30 days",
      date: "June 1-30, 2024",
      price: "$2,800",
      image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b",
      participants: 6,
      rating: 4.9,
      status: "completed",
      memories: [
        {
          id: 1,
          type: "photo",
          url: "https://images.unsplash.com/photo-1502602898536-47ad22581b52",
          caption: "Amazing sunset in Paris!",
          location: "Paris, France",
          date: "June 5, 2024"
        },
        {
          id: 2,
          type: "photo",
          url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad",
          caption: "London Bridge at night",
          location: "London, UK",
          date: "June 12, 2024"
        },
        {
          id: 3,
          type: "video",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
          caption: "Swiss Alps hiking adventure",
          location: "Switzerland",
          date: "June 20, 2024"
        }
      ],
      highlights: [
        "Visited 8 countries in 30 days",
        "Made lifelong friendships",
        "Tried 50+ local dishes",
        "Hiked 200+ kilometers"
      ]
    },
    {
      id: 2,
      title: "Southeast Asia Food Tour",
      destination: "Thailand, Vietnam, Cambodia",
      duration: "21 days",
      date: "March 1-21, 2024",
      price: "$1,800",
      image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a",
      participants: 4,
      rating: 4.8,
      status: "completed",
      memories: [
        {
          id: 4,
          type: "photo",
          url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96",
          caption: "Street food in Bangkok",
          location: "Bangkok, Thailand",
          date: "March 3, 2024"
        },
        {
          id: 5,
          type: "photo",
          url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
          caption: "Angkor Wat sunrise",
          location: "Siem Reap, Cambodia",
          date: "March 15, 2024"
        }
      ],
      highlights: [
        "Tried 100+ local dishes",
        "Cooking classes in 3 countries",
        "Visited ancient temples",
        "Met amazing local chefs"
      ]
    }
  ];

  // Mock data for joined trips
  const joinedTrips = [
    {
      id: 3,
      title: "Bali Adventure",
      destination: "Bali, Indonesia",
      duration: "7 days",
      date: "December 10-17, 2024",
      price: "$1,200",
      image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1",
      organizer: "Sarah Chen",
      rating: 4.9,
      status: "completed",
      memories: [
        {
          id: 6,
          type: "photo",
          url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2",
          caption: "Beautiful rice terraces",
          location: "Ubud, Bali",
          date: "December 12, 2024"
        },
        {
          id: 7,
          type: "photo",
          url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5",
          caption: "Sunset at Tanah Lot",
          location: "Tanah Lot, Bali",
          date: "December 14, 2024"
        }
      ],
      highlights: [
        "Visited 5 temples",
        "Learned traditional cooking",
        "Surfing lessons",
        "Yoga retreat experience"
      ]
    },
    {
      id: 4,
      title: "Tokyo Explorer",
      destination: "Tokyo, Japan",
      duration: "5 days",
      date: "October 5-10, 2024",
      price: "$1,800",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf",
      organizer: "Mike Johnson",
      rating: 4.7,
      status: "completed",
      memories: [
        {
          id: 8,
          type: "photo",
          url: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8",
          caption: "Shibuya crossing at night",
          location: "Shibuya, Tokyo",
          date: "October 6, 2024"
        },
        {
          id: 9,
          type: "video",
          url: "https://images.unsplash.com/photo-1528164344705-47542687000d",
          caption: "Sushi making class",
          location: "Tsukiji, Tokyo",
          date: "October 8, 2024"
        }
      ],
      highlights: [
        "Visited 15 neighborhoods",
        "Tried authentic ramen",
        "Cherry blossom viewing",
        "Traditional tea ceremony"
      ]
    }
  ];

  // 🎯 USE REAL TRIPS DATA WHEN AVAILABLE, FALLBACK TO MOCK DATA
  const trips = Array.isArray(tripsData) && tripsData.length > 0
    ? tripsData.map(trip => ({
        ...trip,
        // Enhance real trip data with mock memories until real memory system is implemented
        memories: trip.memories && trip.memories.length > 0 ? trip.memories : [
          {
            id: 1,
            type: "photo",
            url: trip.image || "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
            caption: `Beautiful memories from ${trip.destination}`,
            location: trip.destination,
            date: new Date(trip.fromDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          },
          {
            id: 2,
            type: "photo",
            url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
            caption: `Adventure highlights in ${trip.destination}`,
            location: trip.destination,
            date: new Date(trip.toDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          }
        ],
        highlights: trip.highlights || [
          `Explored ${trip.destination}`,
          `${trip.duration} of adventure`,
          `Traveled via ${trip.transport}`,
          `Unforgettable memories created`
        ]
      }))
    : (tripType === 'posted' ? postedTrips : joinedTrips);

  const handleTripClick = (trip) => {
    setSelectedTrip(trip);
    setShowTripDetails(true);
  };

  const handleBackToList = () => {
    setShowTripDetails(false);
    setSelectedTrip(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-none sm:rounded-2xl w-full h-full sm:h-[85vh] sm:max-w-6xl border-0 sm:border-2 border-[#5E5854] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-3 sm:p-6 border-b border-[#5E5854] flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {showTripDetails && (
                <button
                  onClick={handleBackToList}
                  className="text-white hover:text-[#f8a95d] text-base sm:text-xl font-bold transition-colors flex items-center"
                >
                  <FiChevronLeft className="mr-1" /> Back
                </button>
              )}
              <h2 className="text-lg sm:text-2xl font-cinzel font-bold text-white truncate">
                {tripType === 'photos' ? 'Photo Memories' : 
                 tripType === 'videos' ? 'Video Memories' : 
                 tripType === 'countries' ? 'Countries Visited' : 
                 tripType === 'cities' ? 'Cities Explored' :
                 tripType === 'posted' ? 'Trips You Organized' : 
                 tripType === 'joined' ? 'Trips You Joined' : 'Travel Memories'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-[#f8a95d] transition-colors p-1"
              aria-label="Close memories"
            >
              <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {!showTripDetails ? (
            /* Trip List */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {trips.map((trip) => (
                <div
                  key={trip._id || trip.id}
                  onClick={() => handleTripClick(trip)}
                  className="bg-white rounded-xl overflow-hidden border border-[#d1c7b7] cursor-pointer hover:border-[#f8a95d] transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg"
                >
                  <div className="relative">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-32 sm:h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                      <span className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        {trip.price}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4">
                      <span className="bg-green-500 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        ✓ {trip.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-bold text-[#2c5e4a] mb-1 sm:mb-2 truncate">{trip.title}</h3>
                    <p className="text-[#5E5854] text-xs sm:text-sm mb-1 truncate">{trip.destination}</p>
                    <p className="text-[#5E5854] text-xs sm:text-sm mb-2 truncate">{trip.date}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FiStar className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-1" />
                        <span className="text-[#2c5e4a] text-xs sm:text-sm font-medium">{trip.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="w-3 h-3 sm:w-4 sm:h-4 text-[#2c5e4a] mr-1" />
                        <span className="text-[#5E5854] text-xs sm:text-sm">{trip.participants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Trip Details */
            <div className="space-y-4 sm:space-y-6">
              {/* Trip Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#d1c7b7] shadow-md">
                  <img
                    src={selectedTrip.image}
                    alt={selectedTrip.title}
                    className="w-full h-48 sm:h-64 object-cover rounded-lg mb-3 sm:mb-4"
                  />
                  <h3 className="text-lg sm:text-xl font-bold text-[#2c5e4a] mb-2">{selectedTrip.title}</h3>
                  <div className="space-y-1 sm:space-y-2 text-[#5E5854] text-sm sm:text-base">
                    <p className="flex items-center">
                      <FiMapPin className="mr-2 text-[#2c5e4a] flex-shrink-0" />
                      <span><strong className="text-[#2c5e4a]">Destination:</strong> {selectedTrip.destination}</span>
                    </p>
                    <p className="flex items-center">
                      <FiCalendar className="mr-2 text-[#2c5e4a] flex-shrink-0" />
                      <span><strong className="text-[#2c5e4a]">Date:</strong> {selectedTrip.date}</span>
                    </p>
                    <p className="flex items-center">
                      <FiDollarSign className="mr-2 text-[#2c5e4a] flex-shrink-0" />
                      <span><strong className="text-[#2c5e4a]">Price:</strong> {selectedTrip.price}</span>
                    </p>
                    {selectedTrip.organizer && (
                      <p className="flex items-center">
                        <FiUsers className="mr-2 text-[#2c5e4a] flex-shrink-0" />
                        <span><strong className="text-[#2c5e4a]">Organizer:</strong> {selectedTrip.organizer}</span>
                      </p>
                    )}
                    <div className="flex items-center mt-2">
                      <FiStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mr-1" />
                      <span className="text-[#2c5e4a] font-medium">{selectedTrip.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#d1c7b7] shadow-md">
                  <h3 className="text-lg sm:text-xl font-bold text-[#2c5e4a] mb-3 sm:mb-4">Trip Details</h3>
                  <div className="text-[#5E5854] text-sm sm:text-base">
                    <p className="leading-relaxed">{selectedTrip.description || "Experience the journey of a lifetime with fellow travelers. This trip offers unique experiences, cultural immersion, and unforgettable memories."}</p>
                    
                    {/* Add trip highlights if available */}
                    {selectedTrip.highlights && selectedTrip.highlights.length > 0 && (
                      <div className="mt-3 sm:mt-4">
                        <h4 className="text-base sm:text-lg font-semibold text-[#2c5e4a] mb-2">Trip Highlights</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedTrip.highlights.map((highlight, index) => (
                            <li key={index} className="text-[#5E5854]">{highlight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Memories Gallery */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#d1c7b7] shadow-md">
                <h4 className="text-lg sm:text-xl font-bold text-[#2c5e4a] mb-3 sm:mb-4">
                  Trip Memories ({selectedTrip.memories.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {selectedTrip.memories.map((memory) => (
                    <div
                      key={memory.id}
                      className="bg-[#f8f4e3] rounded-lg overflow-hidden border border-[#d1c7b7] hover:scale-[1.02] transition-transform duration-300 shadow-md"
                    >
                      <div className="relative">
                        <img
                          src={memory.url}
                          alt={memory.caption}
                          className="w-full h-32 sm:h-48 object-cover"
                        />
                        {memory.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-2 sm:p-3">
                              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <p className="font-medium text-[#2c5e4a] text-sm sm:text-base mb-1 truncate">{memory.caption}</p>
                        <div className="flex justify-between items-center text-[#5E5854] text-xs sm:text-sm">
                          <span className="truncate max-w-[60%]">{memory.location}</span>
                          <span>{memory.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
