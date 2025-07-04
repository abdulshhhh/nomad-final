import { useNavigate } from 'react-router-dom';
import NotificationSystem from './NotificationSystem';
import GroupChat from './GroupChat';
import MemberProfiles from './MemberProfiles';
import { FiArrowLeft, FiArrowRight, FiCheck, FiX, FiMessageSquare, FiStar, FiEye, FiPlus, FiUser, FiCalendar, FiMapPin, FiDollarSign, FiUsers, FiTruck, FiEdit2, FiHeart, FiChevronLeft, FiChevronRight, FiMail, FiMenu, FiBell, FiLogOut, FiCamera, FiSearch } from 'react-icons/fi';

// Mock data for trips with enhanced structure
const mockTrips = [
  {
    id: 1,
    title: "Bali Adventure",
    destination: "Bali, Indonesia",
    duration: "7 days",
    price: "$1,200",
    image: "/assets/images/baliadventure.jpeg",
    spots: 3,
    maxSpots: 6,
    date: "March 15-22, 2025",
    organizer: "Sarah Chen",
    organizerId: "org_1",
    organizerAvatar: "/assets/images/sarachen.jpeg",
    tags: ["Beach", "Culture", "Adventure"],
    joinedMembers: [
      {
        id: "user_1",
        name: "Alex Rivera",
        avatar: "/assets/images/Alexrivera.jpeg",
        joinedDate: "2024-12-01"
      },
      {
        id: "user_2",
        name: "Maya Patel",
        avatar: "/assets/images/mayapatel.jpeg",
        joinedDate: "2024-12-03"
      },
      {
        id: "user_3",
        name: "Jordan Kim",
        avatar: "/assets/images/jordankim.jpeg",
        joinedDate: "2024-12-05"
      }
    ],
    description: "Explore the beautiful beaches and rich culture of Bali with fellow adventurers. Experience temple visits, beach relaxation, and local cuisine."
  },
  {
    id: 2,
    title: "Tokyo Explorer",
    destination: "Tokyo, Japan",
    duration: "5 days",
    price: "$1,800",
    image: "/assets/images/Tokyo.jpeg",
    spots: 2,
    maxSpots: 4,
    date: "April 10-15, 2025",
    organizer: "Mike Johnson",
    organizerId: "org_2",
    organizerAvatar: "/assets/images/mikejohnson.jpeg",
    tags: ["City", "Food", "Culture"],
    joinedMembers: [
      {
        id: "user_4",
        name: "Sophie Chen",
        avatar: "/assets/images/sophiachen.jpeg",
        joinedDate: "2024-11-28"
      },
      {
        id: "user_5",
        name: "David Park",
        avatar: "/assets/images/davidpark.jpeg",
        joinedDate: "2024-12-02"
      }
    ],
    description: "Discover Tokyo's vibrant culture, amazing food scene, and modern attractions. From traditional temples to cutting-edge technology districts."
  },
  {
    id: 3,
    title: "Swiss Alps Trek",
    destination: "Switzerland",
    duration: "10 days",
    price: "$2,500",
    image: "/assets/images/swissmount.jpeg",
    spots: 4,
    maxSpots: 8,
    date: "May 20-30, 2025",
    organizer: "Emma Wilson",
    organizerId: "org_3",
    organizerAvatar: "/assets/images/emmawilson.jpeg",
    tags: ["Mountains", "Hiking", "Nature"],
    joinedMembers: [
      {
        id: "user_6",
        name: "Carlos Rodriguez",
        avatar: "/assets/images/carlosrodriguez.jpeg",
        joinedDate: "2024-11-25"
      },
      {
        id: "user_7",
        name: "Lisa Zhang",
        avatar: "/assets/images/lisazhang.jpeg",
        joinedDate: "2024-11-30"
      },
      {
        id: "user_8",
        name: "Ahmed Hassan",
        avatar: "/assets/images/ahmedhassen.jpeg",
        joinedDate: "2024-12-01"
      },
      {
        id: "user_9",
        name: "Nina Kowalski",
        avatar: "/assets/images/ninakowalski.jpeg",
        joinedDate: "2024-12-04"
      }
    ],
    description: "Challenge yourself with breathtaking alpine hiking trails, stunning mountain vistas, and cozy mountain huts. Perfect for nature enthusiasts."
  }
];

const completedTrips = [
  {
    id: 1,
    title: "Iceland Northern Lights",
    destination: "Reykjavik, Iceland",
    image: "/assets/images/icelandnorthernlights.jpeg",
    rating: 4.9,
    participants: 8,
    date: "December 2024"
  },
  {
    id: 2,
    title: "Santorini Sunset",
    destination: "Santorini, Greece",
    image: "/assets/images/santorinisunset.jpeg",
    rating: 4.8,
    participants: 6,
    date: "October 2024"
  }
];

const testimonials = [
  {
    id: 1,
    name: "Alex Rodriguez",
    trip: "Bali Adventure",
    rating: 5,
    comment: "Amazing experience! Met incredible people and saw breathtaking places.",
    avatar: "/assets/images/Alexrivera.jpeg"
  },
  {
    id: 2,
    name: "Lisa Park",
    trip: "Tokyo Explorer",
    rating: 5,
    comment: "Perfect organization and wonderful travel companions. Highly recommend!",
    avatar: "/assets/images/lisazhang.jpeg"
  }
];

const popularDestinations = [
  { id: 1, name: "Paris, France", country: "France", visits: "2.3k", image: "/assets/images/paris.webp" },
  { id: 2, name: "New York, USA", country: "USA", visits: "1.8k", image: "/assets/images/newyork.jpeg" },
  { id: 3, name: "Dubai, UAE", country: "UAE", visits: "1.5k", image: "/assets/images/dubai.jpeg" },
  { id: 4, name: "London, UK", country: "UK", visits: "1.2k", image: "/assets/images/london.jpeg" }
];

function Profile({ user, onClose, onMessage, onPhotoClick }) {  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-4xl w-full border border-[#d1c7b7] shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-[#2c5e4a]">Profile</h3>
          <button
            onClick={onClose}
            className="text-[#5E5854] hover:text-[#f87c6d] text-3xl font-bold"
          >
            <FiX />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex flex-col items-center">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-[#f8d56b] object-cover mb-4 cursor-pointer"
                onClick={() => onPhotoClick(user.avatar)}
              />
              <h4 className="text-2xl font-bold text-[#2c5e4a]">{user.fullName || user.name}</h4>
              <p className="text-[#5E5854]">{user.location}</p>
              <button
                onClick={onMessage}
                className="mt-4 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-6 py-2 rounded-full transition-colors font-cinzel flex items-center"
              >
                <FiMail className="mr-2" /> Message
              </button>
            </div>

            <div className="bg-[#f8f4e3] p-4 rounded-xl border border-[#d1c7b7]">
              <h4 className="font-bold text-[#2c5e4a] mb-3">Contact Information</h4>
              <div className="space-y-2 text-[#5E5854]">
                <p className="flex items-center">
                  <FiMail className="mr-2" /> {user.email}
                </p>
                <p className="flex items-center">
                  <FiUser className="mr-2" /> {user.phone}
                </p>
              </div>
            </div>

            <div className="bg-[#f8f4e3] p-4 rounded-xl border border-[#d1c7b7]">
              <h4 className="font-bold text-[#2c5e4a] mb-3">About Me</h4>
              <p className="text-[#5E5854]">{user.bio}</p>
            </div>
          </div>

          {/* Right Column - Photos and Trips */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#f8f4e3] p-4 rounded-xl border border-[#d1c7b7]">
              <h4 className="font-bold text-[#2c5e4a] mb-3">My Photos</h4>
              <div className="grid grid-cols-3 gap-4">
                {user.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square overflow-hidden rounded-lg cursor-pointer"
                    onClick={() => onPhotoClick(photo)}
                  >
                    <img
                      src={photo}
                      alt={`User photo ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#f8f4e3] p-4 rounded-xl border border-[#d1c7b7]">
              <h4 className="font-bold text-[#2c5e4a] mb-3">Upcoming Trips</h4>
              <div className="space-y-4">
                {mockTrips.filter(trip => 
                  trip.joinedMembers.some(member => member.id === user.id)
                ).map(trip => (
                  <div key={trip.id} className="flex items-center bg-white p-3 rounded-lg border border-[#d1c7b7]">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-16 h-16 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <h5 className="font-bold text-[#2c5e4a]">{trip.title}</h5>
                      <p className="text-sm text-[#5E5854]">{trip.destination} • {trip.date}</p>
                    </div>
                  </div>
                ))}
                {mockTrips.filter(trip => 
                  trip.joinedMembers.some(member => member.id === user.id)
                ).length === 0 && (
                  <p className="text-[#5E5854] text-center py-4">No upcoming trips</p>
                )}
              </div>
            </div>

            <div className="bg-[#f8f4e3] p-4 rounded-xl border border-[#d1c7b7]">
              <h4 className="font-bold text-[#2c5e4a] mb-3">The road so far</h4>
              <div className="grid grid-cols-2 gap-4">
                {completedTrips.map(trip => (
                  <div key={trip.id} className="relative rounded-lg overflow-hidden h-32">
                    <img
                      src={trip.image}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                      <h5 className="text-white font-semibold text-sm">{trip.title}</h5>
                      <p className="text-white/80 text-xs">{trip.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [currentTripIndex, setCurrentTripIndex] = useState(0);
  const [currentCompletedIndex, setCurrentCompletedIndex] = useState(0);
  const [showPostTrip, setShowPostTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [availableTrips, setAvailableTrips] = useState(mockTrips);
  const [newTrip, setNewTrip] = useState({
    destination: '',
    departure: '',
    numberOfPeople: 0,
    maxPeople: 0,
    fromDate: '',
    toDate: '',
    transport: '',
    budget: '',
    currency: 'USD', // Add default currency
    description: '',
    category: '',
    coverImage: null
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMemberProfile, setShowMemberProfile] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberProfiles, setShowMemberProfiles] = useState(false);
  const [selectedTripForMembers, setSelectedTripForMembers] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Add a function to handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this to a server
      // For now, we'll just store the file and create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setNewTrip(prev => ({
        ...prev,
        coverImage: imageUrl
      }));
    }
  };

  // Current user data
  const currentUser = {
    id: "current_user",
    name: "Alex Rivera",
    avatar: "/assets/images/Alexrivera.jpeg",
    email: "alex.rivera@nomadnova.com",
    fullName: "Alex Rivera",
    bio: "Passionate traveler and adventure seeker. Love exploring new cultures, meeting amazing people, and creating unforgettable memories around the world!",
    location: "San Francisco, CA",
    phone: "+1 (555) 123-4567",
    photos: [
      "/assets/images/Alexrivera.jpeg",
      "/assets/images/baliadventure.jpeg",
      "/assets/images/Tokyo.jpeg",
      "/assets/images/swissmount.jpeg",
      "/assets/images/icelandnorthernlights.jpeg",
      "/assets/images/santorinisunset.jpeg"
    ]
  };

  // Fix scrolling issues by removing auto-rotate on scroll
  useEffect(() => {
    // Remove auto-rotation completely
    const handleScroll = () => {
      // No action needed, just keeping the handler for future use
    };

    // No interval needed as we're removing auto-rotation
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const formatDate = (date) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrip(prev => ({ 
      ...prev, 
      [name]: name === 'numberOfPeople' || name === 'maxPeople' 
        ? parseInt(value) || 0 
        : value 
    }));
  };

  const handlePostTrip = (e) => {
    e.preventDefault();
    
    // Basic validation - log values to help debug
    console.log("Form data:", newTrip);
    
    // Check each required field individually to identify the missing one
    const requiredFields = {
      destination: newTrip.destination,
      departure: newTrip.departure,
      fromDate: newTrip.fromDate,
      toDate: newTrip.toDate,
      transport: newTrip.transport,
      budget: newTrip.budget,
      maxPeople: newTrip.maxPeople,
      category: newTrip.category
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Generate a unique ID for the new trip
    const tripId = Date.now().toString();
    
    // Create a new trip object with all required fields
    const tripToAdd = {
      id: tripId,
      title: newTrip.destination,
      destination: newTrip.destination,
      duration: `${Math.ceil((new Date(newTrip.toDate) - new Date(newTrip.fromDate)) / (1000 * 60 * 60 * 24))} days`,
      date: `${newTrip.fromDate} to ${newTrip.toDate}`,
      fromDate: newTrip.fromDate,
      toDate: newTrip.toDate,
      price: `$${newTrip.budget}`,
      budget: newTrip.budget,
      transport: newTrip.transport,
      description: newTrip.description || "Experience the journey of a lifetime with fellow travelers.",
      category: newTrip.category,
      spots: parseInt(newTrip.maxPeople, 10),
      maxSpots: parseInt(newTrip.maxPeople, 10),
      image: newTrip.coverImage || "/assets/images/default-trip.jpg",
      organizer: "Current User", // Replace with actual current user name
      organizerId: "current_user_id", // Replace with actual current user ID
      organizerAvatar: "/assets/images/sarachen.jpeg", // Replace with actual current user avatar
      joinedMembers: [],
      tags: [newTrip.category, "Adventure", "Travel"],
      rating: "4.8",
      status: "planning",
      itinerary: [],
      memories: [],
      // Add these properties to ensure compatibility with trip details modal
      joinedDate: new Date().toISOString().split('T')[0],
      reviews: [],
      location: newTrip.destination
    };
    
    console.log("Trip to add:", tripToAdd);
    
    // Update state with the new trip
    setAvailableTrips(prevTrips => [tripToAdd, ...prevTrips]);
    
    // Close the modal
    setShowPostTrip(false);
    
    // Reset form
    setNewTrip({
      destination: '',
      departure: '',
      numberOfPeople: 0,
      maxPeople: 0,
      fromDate: '',
      toDate: '',
      transport: '',
      budget: '',
      currency: 'USD', // Reset to default currency
      description: '',
      category: '',
      coverImage: null
    });
    
    console.log("Trip posted successfully");
  };

  // Handle functions
  const handleJoinTrip = (tripId) => {
    if (!joinedTrips.includes(tripId)) {
      const trip = availableTrips.find(t => t.id === tripId);

      if (trip && trip.spots > 0) {
        const newMember = {
          ...currentUser,
          joinedDate: new Date().toISOString().split('T')[0]
        };

        setJoinedTrips([...joinedTrips, tripId]);

        setAvailableTrips(availableTrips.map(t => {
          if (t.id === tripId) {
            return {
              ...t,
              spots: t.spots - 1,
              joinedMembers: [...t.joinedMembers, newMember]
            };
          }
          return t;
        }));

        const notification = {
          id: Date.now(),
          type: 'join_request',
          tripId: tripId,
          tripTitle: trip.title,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          organizerId: trip.organizerId,
          timestamp: new Date().toISOString(),
          read: false
        };

        setNotifications(prev => [notification, ...prev]);
        alert('Successfully joined the trip! The organizer has been notified.');
      } else {
        alert('Sorry, this trip is full!');
      }
    }
  };

  const handleViewTrip = (trip) => {
    console.log("Viewing trip:", trip); // Add this to debug
    setSelectedTrip({...trip}); // Create a new object to ensure all properties are copied
    setShowTripDetails(true);
  };

  const handleStartGroupChat = () => {
    setShowGroupChat(true);
  };

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const handleShowProfile = () => {
    // Check if we're using the navigate function from react-router
    if (typeof navigate === 'function') {
      navigate('/profile');
    } else {
      // If navigate is not available, we'll use an alternative approach
      window.location.href = '/profile';
    }
    
    // Close the mobile menu after navigation
    setMobileMenuOpen(false);
  };

  const handleProfileMessage = () => {
    alert('Opening message interface...');
  };

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handleViewMemberProfile = (member) => {
    // Format the member data with all required properties
    const formattedMember = {
      id: member.id,
      name: member.name,
      fullName: member.name,
      avatar: member.avatar,
      email: member.email || "traveler@example.com",
      bio: member.bio || "Passionate traveler and adventure seeker.",
      location: member.location || "Traveler",
      phone: member.phone || "+1 (555) 123-4567",
      role: member.role || "member",
      verified: true,
      // Add photos array which might be required by the Profile component
      photos: [
        member.avatar,
        "/assets/images/baliadventure.jpeg",
        "/assets/images/Tokyo.jpeg",
        "/assets/images/swissmount.jpeg",
        "/assets/images/icelandnorthernlights.jpeg",
        "/assets/images/santorinisunset.jpeg"
      ]
    };
    
    // Close other modals
    setShowTripDetails(false);
    setShowMemberProfiles(false);
    setShowPostTrip(false);
    setMobileMenuOpen(false);
    
    // Open the profile modal
    setSelectedMember(formattedMember);
    setShowMemberProfile(true);
  };

  const handleViewAllMembers = (trip) => {
    setSelectedTripForMembers(trip);
    setShowMemberProfiles(true);
  };

  const handleStartChatWithMember = () => {
    // Implement your chat functionality here
    alert('Starting chat with member...');
    setShowMemberProfiles(false);
  };

  // Filtered trips based on search term
  const filteredTrips = availableTrips.filter(trip => 
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center">
                <img 
                  src="/assets/images/NomadNovalogo.jpg" 
                  alt="NomadNova Logo" 
                  className="w-8 h-8 rounded-full mr-2"
                />
                <h1 className="text-xl sm:text-2xl font-bold text-[#f8d56b]">NomadNova</h1>
              </div>
              <nav className="hidden md:flex ml-8 space-x-8">
                <a href="#trips" className="text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel">Trips</a>
                <a href="#completed" className="text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel">Completed</a>
                <a href="#destinations" className="text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel">Destinations</a>
              </nav>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2"
              >
                {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <NotificationSystem
                notifications={notifications}
                showNotifications={showNotifications}
                onToggleNotifications={handleToggleNotifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onClearAll={handleClearAllNotifications}
              />
              <button
                onClick={handleShowProfile}
                className="flex items-center space-x-2 bg-[#6F93AD] hover:bg-[#5E5854] text-white px-4 py-2 rounded-full transition-colors font-cinzel flex items-center justify-center"
              >
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="w-6 h-6 rounded-full border border-white"
                />
              
              </button>
              <button
                onClick={() => setShowPostTrip(true)}
                className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-6 py-2 rounded-full transition-colors font-cinzel shadow-lg flex items-center"
              >
                <FiPlus className="mr-1" />
                Post Trip
              </button>
              <button
                onClick={onLogout}
                className="bg-[#5E5854] hover:bg-[#2c5e4a] text-white px-6 py-2 rounded-full transition-colors font-cinzel"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#1a3a2a] py-4 px-2 rounded-b-lg">
              <nav className="flex flex-col space-y-3">
                <a href="#trips" className="text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4">Trips</a>
                <a href="#completed" className="text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4">Completed</a>
                <a href="#destinations" className="text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4">Destinations</a>
                <hr className="border-[#2c5e4a]" />
                <button
                  onClick={handleShowProfile}
                  className="flex items-center space-x-2 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4 text-left"
                >
                  <img
                    src={currentUser.avatar}
                    alt="Profile"
                    className="w-6 h-6 rounded-full border border-white"
                  />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setShowPostTrip(true)}
                  className="flex items-center space-x-2 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4 text-left"
                >
                  <FiPlus className="mr-1" />
                  <span>Post Trip</span>
                </button>
                <button
                  onClick={handleToggleNotifications}
                  className="flex items-center space-x-2 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4 text-left"
                >
                  <FiBell className="mr-1" />
                  <span>Notifications</span>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="bg-[#f87c6d] text-white text-xs rounded-full px-2 py-0.5 ml-1">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-[#a8c4b8] hover:text-[#f8d56b] transition-colors font-cinzel py-2 px-4 text-left"
                >
                  <FiLogOut className="mr-1" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Welcome Section */}
        <section className="text-center bg-gradient-to-r from-[#6F93AD] to-[#4a708a] rounded-2xl p-4 sm:p-8 border border-[#5E5854] shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-white">Welcome back, Traveler!</h2>
          <p className="font-southmind text-lg sm:text-xl text-white/90">Discover your next adventure with like-minded explorers</p>
        </section>

        {/* Available Trips Carousel */}
        <section id="trips" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h3 className="text-3xl font-bold text-[#2c5e4a]">Available Trips</h3>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search destinations, trip titles, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-[#d1c7b7] rounded-lg focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854] bg-white/90 backdrop-blur-sm"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#5E5854]">
                <FiSearch className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* No Results Message */}
          {filteredTrips.length === 0 && (
            <div className="text-center py-8 bg-white rounded-xl border border-[#d1c7b7]">
              <FiSearch className="w-12 h-12 mx-auto text-[#a8c4b8] mb-4" />
              <h4 className="text-xl font-bold text-[#2c5e4a] mb-2">No trips found</h4>
              <p className="text-[#5E5854]">Try adjusting your search terms or check back later for new trips.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTrips.map((trip, index) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#d1c7b7] shadow-lg transition-all duration-300 transform hover:scale-105 hover:z-10 hover:ring-2 hover:ring-[#f8a95d]"
              >
                <div className="relative">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-40 sm:h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      approx {trip.price}
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-6 bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5]">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg sm:text-xl font-bold text-[#2c5e4a]">{trip.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      joinedTrips.includes(trip.id)
                        ? 'bg-[#f87c6d] text-white'
                        : 'bg-[#f8d56b] text-[#2c5e4a]'
                    }`}>
                      {joinedTrips.includes(trip.id) ? 'JOINED' : 'OPEN'}
                    </span>
                  </div>
                  <p className="text-[#2c5e4a] font-medium mb-2 flex items-center">
                    <FiMapPin className="mr-1" /> {trip.destination}
                  </p>
                  <p className="text-[#5E5854] mb-3 flex items-center">
                    <FiCalendar className="mr-1" /> {trip.duration} • {trip.date}
                  </p>
                  <p className="text-[#5E5854] text-sm mb-3">
                    <span className="font-medium">Category:</span> {trip.tags[0]}
                  </p>
                  <p className="text-[#5E5854] text-sm mb-3">Organized by {trip.organizer}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {trip.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-[#a8c4b8]/30 text-[#2c5e4a] px-2 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                        {tag}
                      </span>
                    ))}
                    {trip.tags.length > 3 && (
                      <span className="bg-[#a8c4b8]/30 text-[#2c5e4a] px-2 py-1 rounded-full text-xs">
                        +{trip.tags.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#2c5e4a] font-medium flex items-center text-sm">
                      <FiUsers className="mr-1" /> {trip.spots} spots
                    </span>
                    <div className="flex items-center text-[#2c5e4a]">
                      <FiStar className="mr-1" />
                      <span className="text-sm">4.8</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleViewTrip(trip);
                      }}
                      className="flex-1 bg-[#5E5854] hover:bg-[#2c5e4a] text-white px-4 py-2 rounded-full transition-colors font-cinzel flex items-center justify-center"
                    >
                      <FiEye className="mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleJoinTrip(trip.id)}
                      disabled={joinedTrips.includes(trip.id)}
                      className={`flex-1 px-4 py-2 rounded-full transition-colors font-cinzel flex items-center justify-center ${
                        joinedTrips.includes(trip.id)
                          ? 'bg-[#a8c4b8] text-[#2c5e4a] cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white'
                      }`}
                    >
                      {joinedTrips.includes(trip.id) ? (
                        <>
                          <FiCheck className="mr-1" /> Joined
                        </>
                      ) : (
                        'Join Trip'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Trip Details Modal */}
        {showTripDetails && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 sm:p-6 flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl font-bold text-white">{selectedTrip.title}</h3>
                <button
                  onClick={() => setShowTripDetails(false)}
                  className="p-2 hover:bg-[#f8d56b] rounded-full text-white hover:text-[#2c5e4a] transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Modal Content */}
                <div className="p-4 sm:p-6">
                  {/* Trip Image and Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="relative h-64 rounded-xl overflow-hidden">
                      <img
                        src={selectedTrip.image}
                        alt={selectedTrip.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {selectedTrip.price}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-[#d1c7b7]">
                      <h4 className="font-bold text-[#2c5e4a] mb-3">Trip Details</h4>
                      <div className="space-y-2 text-[#5E5854]">
                        <p className="flex items-center">
                          <FiMapPin className="mr-2" /> <span className="font-medium">Destination:</span> {selectedTrip.destination}
                        </p>
                        <p className="flex items-center">
                          <FiCalendar className="mr-2" /> <span className="font-medium">Duration:</span> {selectedTrip.duration}
                        </p>
                        <p className="flex items-center">
                          <FiCalendar className="mr-2" /> <span className="font-medium">Dates:</span> {selectedTrip.date}
                        </p>
                        <p className="flex items-center">
                          <FiUsers className="mr-2" /> <span className="font-medium">Available Spots:</span> {selectedTrip.spots}/{selectedTrip.maxSpots}
                        </p>
                        <p className="flex items-center">
                          <FiStar className="mr-2" /> <span className="font-medium">Category:</span> {selectedTrip.tags && selectedTrip.tags.length > 0 ? selectedTrip.tags[0] : 'Adventure'}
                        </p>
                        {selectedTrip.transport && (
                          <p className="flex items-center">
                            <FiNavigation className="mr-2" /> <span className="font-medium">Transport:</span> {selectedTrip.transport}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Trip Description */}
                  <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] mb-6">
                    <h4 className="font-bold text-[#2c5e4a] mb-3">About This Trip</h4>
                    <p className="text-[#5E5854]">{selectedTrip.description || "No description available."}</p>
                  </div>

                  {/* Trip Cost Breakdown and Map */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Cost Breakdown */}
                    <div className="bg-white p-4 rounded-xl border border-[#d1c7b7]">
                      <h4 className="font-bold text-[#2c5e4a] mb-3">Cost Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                          <span className="text-[#5E5854]">Base Price</span>
                          <span className="font-medium text-[#2c5e4a]">{selectedTrip.price}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                          <span className="text-[#5E5854]">Accommodation</span>
                          <span className="font-medium text-[#2c5e4a]">Included</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-[#d1c7b7]">
                          <span className="text-[#5E5854]">Activities</span>
                          <span className="font-medium text-[#2c5e4a]">Included</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="font-bold text-[#2c5e4a]">Total Cost</span>
                          <span className="font-bold text-[#f87c6d]">approx {selectedTrip.price}</span>
                        </div>
                      </div>
                    </div>

                    {/* Google Map */}
                    <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] h-full min-h-[200px]">
                      <h4 className="font-bold text-[#2c5e4a] mb-3">Destination Map</h4>
                      <div className="h-[calc(100%-2rem)] min-h-[150px] rounded-lg overflow-hidden border border-[#d1c7b7]">
                        <iframe
                          title={`Map of ${selectedTrip.destination}`}
                          className="w-full h-full"
                          frameBorder="0"
                          src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(selectedTrip.destination)}`}
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  </div>

                  {/* Trip Statistics */}
                  <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] mb-6">
                    <h4 className="font-bold text-[#2c5e4a] mb-3">Trip Statistics</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="bg-[#f8f4e3] p-3 rounded-lg">
                        <p className="text-2xl font-bold text-[#f87c6d]">{selectedTrip.maxSpots - selectedTrip.spots}</p>
                        <p className="text-[#5E5854] text-sm">Travelers Joined</p>
                      </div>
                      <div className="bg-[#f8f4e3] p-3 rounded-lg">
                        <p className="text-2xl font-bold text-[#f87c6d]">{selectedTrip.duration.split(' ')[0]}</p>
                        <p className="text-[#5E5854] text-sm">Days</p>
                      </div>
                      <div className="bg-[#f8f4e3] p-3 rounded-lg">
                        <p className="text-2xl font-bold text-[#f87c6d]">4.8</p>
                        <p className="text-[#5E5854] text-sm">Rating</p>
                      </div>
                      <div className="bg-[#f8f4e3] p-3 rounded-lg">
                        <p className="text-2xl font-bold text-[#f87c6d]">{selectedTrip.tags?.length || 0}</p>
                        <p className="text-[#5E5854] text-sm">Categories</p>
                      </div>
                    </div>
                  </div>

                  {/* Trip Members */}
                  <div className="bg-white p-4 rounded-xl border border-[#d1c7b7] mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-[#2c5e4a]">Trip Members</h4>
                      <button 
                        onClick={() => handleViewAllMembers(selectedTrip)}
                        className="text-[#f87c6d] hover:text-[#f8a95d] text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                    
                    {/* Organizer */}
                    <div className="mb-4">
                      <p className="text-[#5E5854] mb-2 text-sm">Organizer:</p>
                      <div className="flex items-center bg-[#f8f4e3] p-3 rounded-lg border border-[#d1c7b7]">
                        <img
                          src={selectedTrip.organizerAvatar || "/assets/images/default-avatar.jpg"}
                          alt={selectedTrip.organizer || "Trip Organizer"}
                          className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                          onClick={() => handleViewMemberProfile({
                            id: selectedTrip.organizerId || "organizer_id",
                            name: selectedTrip.organizer || "Trip Organizer",
                            avatar: selectedTrip.organizerAvatar || "/assets/images/default-avatar.jpg",
                            role: 'organizer'
                          })}
                        />
                        <div>
                          <h5 className="font-medium text-[#2c5e4a]">{selectedTrip.organizer || "Trip Organizer"}</h5>
                          <p className="text-xs text-[#5E5854]">Trip Organizer</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Members Preview (showing only a few) */}
                    <div>
                      <p className="text-[#5E5854] mb-2 text-sm">Members ({selectedTrip.joinedMembers?.length || 0}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedTrip.joinedMembers?.slice(0, 4).map(member => (
                          <div key={member.id} className="flex items-center bg-[#f8f4e3] p-3 rounded-lg border border-[#d1c7b7]">
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover mr-3 cursor-pointer"
                              onClick={() => handleViewMemberProfile(member)}
                            />
                            <div>
                              <h5 className="font-medium text-[#2c5e4a]">{member.name}</h5>
                              <p className="text-xs text-[#5E5854]">Joined {member.joinedDate}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedTrip.joinedMembers?.length > 4 && (
                        <div className="mt-3 text-center">
                          <button 
                            onClick={() => handleViewAllMembers(selectedTrip)}
                            className="text-[#f87c6d] hover:text-[#f8a95d] text-sm font-medium"
                          >
                            + {selectedTrip.joinedMembers.length - 4} more members
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => setShowTripDetails(false)}
                      className="flex-1 bg-[#5E5854] hover:bg-[#2c5e4a] text-white py-3 rounded-xl transition-colors font-cinzel"
                    >
                      Close
                    </button>
                    
                    {joinedTrips.includes(selectedTrip.id) ? (
                      <button
                        onClick={() => handleStartGroupChat()}
                        className="flex-1 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white py-3 rounded-xl transition-colors font-cinzel flex items-center justify-center"
                      >
                        <FiMessageSquare className="mr-2" /> Group Chat
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinTrip(selectedTrip.id)}
                        className="flex-1 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white py-3 rounded-xl transition-colors font-cinzel"
                      >
                        Join Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed Trips Section */}
        <section id="completed" className="space-y-4 sm:space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl sm:text-3xl font-bold text-[#2c5e4a]">The road so far</h3>
            <button 
              onClick={() => navigate('/memories')} 
              className="text-[#f87c6d] hover:text-[#f8a95d] text-sm font-medium flex items-center"
            >
              View All <FiArrowRight className="ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {completedTrips.map((trip, index) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#d1c7b7] shadow-lg transition-all duration-300 transform hover:scale-105 hover:z-10 hover:ring-2 hover:ring-[#f8a95d]"
                onClick={() => {
                  setSelectedTrip(trip);
                  setShowTripDetails(true);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className="relative h-48 sm:h-64">
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 sm:p-6">
                    <div className="flex items-center mb-2">
                      <span className="bg-[#f8d56b] text-[#2c5e4a] px-2 py-1 rounded-full text-xs font-bold">
                        Completed
                      </span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold text-white">{trip.title}</h4>
                    <p className="text-white/90">{trip.destination}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-white flex items-center">
                        <FiCalendar className="mr-1" /> {trip.date}
                      </span>
                      <div className="flex items-center">
                        <span className="flex items-center text-white bg-black/30 px-2 py-1 rounded-full">
                          <FiStar className="text-[#f8d56b] mr-1" /> {trip.rating}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-white flex items-center text-sm">
                        <FiUsers className="mr-1" /> {trip.participants} travelers
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle view memories
                          navigate(`/memories/${trip.id}`);
                        }}
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm flex items-center backdrop-blur-sm transition-colors"
                      >
                        <FiCamera className="mr-1" /> The story behind the stroll
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {completedTrips.length === 0 && (
              <div className="col-span-1 sm:col-span-2 bg-white p-6 rounded-xl border border-[#d1c7b7] text-center">
                <div className="flex flex-col items-center justify-center py-8">
                  <FiMapPin className="w-12 h-12 text-[#a8c4b8] mb-4" />
                  <h4 className="text-xl font-bold text-[#2c5e4a] mb-2">No Completed Trips Yet</h4>
                  <p className="text-[#5E5854] mb-4">Your completed trips will appear here.</p>
                  <button 
                    onClick={() => navigate('/trips')}
                    className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-4 py-2 rounded-full transition-colors font-cinzel"
                  >
                    Explore Trips
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-3xl font-bold text-[#2c5e4a]">chronicles of nomads</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#d1c7b7] shadow-lg">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#f8d56b] mr-3 sm:mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-[#2c5e4a]">{testimonial.name}</h4>
                    <p className="text-[#5E5854] text-xs sm:text-sm">{testimonial.trip}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`${i < testimonial.rating ? "text-[#f8d56b] fill-[#f8d56b]" : "text-gray-300"} w-4 h-4 sm:w-5 sm:h-5`}
                    />
                  ))}
                </div>
                <p className="text-[#5E5854] text-sm sm:text-base">{testimonial.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Destinations Section */}
        <section id="destinations" className="space-y-4 sm:space-y-6">
          <h3 className="text-xl sm:text-3xl font-bold text-[#2c5e4a]">Popular Destinations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {popularDestinations.map((destination) => (
              <div 
                key={destination.id} 
                className="relative rounded-xl overflow-hidden h-40 sm:h-56 group cursor-pointer"
                onClick={() => handleDestinationClick(destination)}
              >
                <img 
                  src={destination.image} 
                  alt={destination.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-3 sm:p-4">
                  <h4 className="text-white font-bold text-sm sm:text-lg">{destination.name}</h4>
                  <p className="text-white/80 text-xs sm:text-sm">{destination.country}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Post Trip Modal */}
        {showPostTrip && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
    <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      {/* Modal Header with Close Button */}
      <div className="sticky top-0 bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] z-10 flex justify-between items-center p-4 border-b border-[#5E5854]">
        <h3 className="text-xl sm:text-2xl font-bold text-white">Post a New Trip</h3>
        <button 
          onClick={() => setShowPostTrip(false)}
          className="text-white hover:text-[#f8d56b] p-2 rounded-full"
        >
          <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Form Content */}
      <form className="p-4 sm:p-6" onSubmit={handlePostTrip}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[#5E5854] font-medium mb-2">Destination*</label>
            <input
              type="text"
              name="destination"
              value={newTrip.destination}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
              placeholder="e.g. Bali, Indonesia"
              required
            />
          </div>
          <div>
            <label className="block text-[#5E5854] font-medium mb-2">Departure From*</label>
            <input
              type="text"
              name="departure"
              value={newTrip.departure}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
              placeholder="e.g. New York, USA"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[#5E5854] font-medium mb-2">From Date*</label>
            <input
              type="date"
              name="fromDate"
              value={newTrip.fromDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
              required
            />
          </div>
          <div>
            <label className="block text-[#5E5854] font-medium mb-2">To Date*</label>
            <input
              type="date"
              name="toDate"
              value={newTrip.toDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[#5E5854] font-medium mb-2">Transport*</label>
            <select
              name="transport"
              value={newTrip.transport}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
              required
            >
              <option value="">Select transport</option>
              <option value="Flight">Flight</option>
              <option value="Train">Train</option>
              <option value="Bus">Bus</option>
              <option value="Car">Car</option>
              <option value="Cruise">Cruise</option>
              <option value="Multiple">Multiple</option>
            </select>
          </div>
          <div>
            <label className="block text-[#5E5854] font-medium mb-2">Budget*</label>
            <div className="flex space-x-2">
              <select
                name="currency"
                value={newTrip.currency}
                onChange={handleInputChange}
                className="w-24 px-2 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                required
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="CHF">CHF</option>
                <option value="CNY">CNY</option>
                <option value="INR">INR</option>
                <option value="SGD">SGD</option>
              </select>
              <input
                type="number"
                name="budget"
                value={newTrip.budget}
                onChange={handleInputChange}
                className="flex-1 px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
                placeholder="Enter amount"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[#5E5854] font-medium mb-2">Current Number of People*</label>
            <input
              type="number"
              name="numberOfPeople"
              value={newTrip.numberOfPeople === 0 ? '' : newTrip.numberOfPeople}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
              placeholder="e.g. 2"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-[#5E5854] font-medium mb-2">Max People*</label>
            <input
              type="number"
              name="maxPeople"
              value={newTrip.maxPeople === 0 ? '' : newTrip.maxPeople}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
              placeholder="e.g. 6"
              min="1"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-[#5E5854] font-medium mb-2">Trip Category*</label>
          <select
            name="category"
            value={newTrip.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854]"
            required
          >
            <option value="">Select category</option>
            <option value="Adventure">Adventure</option>
            <option value="Beach">Beach</option>
            <option value="City">City</option>
            <option value="Cultural">Cultural</option>
            <option value="Mountain">Mountain</option>
            <option value="Road Trip">Road Trip</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-[#5E5854] font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={newTrip.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-[#d1c7b7] rounded-lg focus:ring-1 focus:ring-[#f8a95d] focus:border-[#f8a95d] focus:outline-none hover:border-[#f8a95d] text-[#5E5854] min-h-[100px]"
            placeholder="Describe your trip..."
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-[#5E5854] font-medium mb-2">Trip Cover Image</label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="trip-cover-image"
              />
              <label
                htmlFor="trip-cover-image"
                className="flex items-center justify-center w-full px-4 py-2 border border-[#d1c7b7] rounded-lg bg-white hover:bg-[#f8f4e3] text-[#5E5854] cursor-pointer transition-colors"
              >
                <FiCamera className="mr-2" />
                {newTrip.coverImage ? 'Change Image' : 'Upload Image'}
              </label>
            </div>
            {newTrip.coverImage && (
              <div className="w-24 h-24 relative">
                <img
                  src={newTrip.coverImage}
                  alt="Trip cover preview"
                  className="w-full h-full object-cover rounded-lg border border-[#d1c7b7]"
                />
                <button
                  type="button"
                  onClick={() => setNewTrip(prev => ({ ...prev, coverImage: null }))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-xs text-[#5E5854] mt-1">Recommended: landscape orientation, at least 800x600px</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
          <button
            type="button"
            onClick={() => setShowPostTrip(false)}
            className="bg-[#5E5854] hover:bg-[#2c5e4a] text-white px-6 py-2 rounded-full transition-colors font-cinzel"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white px-6 py-2 rounded-full transition-colors font-cinzel"
          >
            Post Trip
          </button>
        </div>
      </form>
    </div>
  </div>
)}
        {/* Group Chat Modal */}
        {showGroupChat && selectedTrip && (
          <GroupChat
            trip={selectedTrip}
            currentUser={currentUser}
            onClose={() => setShowGroupChat(false)}
          />
        )}

        {/* Photo Modal */}
        {showPhotoModal && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative max-w-5xl w-full max-h-[90vh]">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="absolute top-4 right-4 text-white text-4xl z-10 hover:text-[#f87c6d]"
              >
                <FiX />
              </button>
              <img
                src={selectedPhoto}
                alt="Enlarged view"
                className="w-full h-full object-contain max-h-[90vh]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Member Profile Modal */}
      {showMemberProfile && selectedMember && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          {/* Add a fallback in case Profile fails to render */}
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full border border-[#d1c7b7] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-[#2c5e4a]">Profile</h3>
              <button
                onClick={() => setShowMemberProfile(false)}
                className="text-[#5E5854] hover:text-[#f87c6d] text-3xl font-bold"
              >
                <FiX />
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="w-32 h-32 rounded-full border-4 border-[#f8d56b] object-cover mb-4"
              />
              <h4 className="text-2xl font-bold text-[#2c5e4a]">{selectedMember.fullName || selectedMember.name}</h4>
              <p className="text-[#5E5854]">{selectedMember.location}</p>
            </div>
            
            <Profile
              user={selectedMember}
              onClose={() => setShowMemberProfile(false)}
              onMessage={() => handleProfileMessage()}
              onPhotoClick={handlePhotoClick}
            />
          </div>
        </div>
      )}

      {/* Member Profiles Modal */}
      {showMemberProfiles && selectedTripForMembers && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b border-[#d1c7b7]">
              <h3 className="text-xl font-bold text-[#2c5e4a]">Trip Members</h3>
              <button 
                onClick={() => setShowMemberProfiles(false)}
                className="text-[#5E5854] hover:text-[#2c5e4a] p-2 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <MemberProfiles 
                trip={selectedTripForMembers} 
                onStartChat={handleStartChatWithMember} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#2c5e4a] text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4 text-[#f8d56b]">NomadNova</h4>
              <p className="text-[#a8c4b8]">Connecting travelers worldwide for unforgettable shared experiences.</p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Explore</h5>
              <ul className="space-y-2 text-[#a8c4b8]">
                <li><a href="#trips" className="hover:text-[#f8d56b] transition-colors">Available Trips</a></li>
                <li><a href="#completed" className="hover:text-[#f8d56b] transition-colors">Completed Trips</a></li>
                <li><a href="#destinations" className="hover:text-[#f8d56b] transition-colors">Popular Destinations</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Company</h5>
              <ul className="space-y-2 text-[#a8c4b8]">
                <li><a href="#" className="hover:text-[#f8d56b] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#f8d56b] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#f8d56b] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#f8d56b] transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contact Us</h5>
              <ul className="space-y-2 text-[#a8c4b8]">
                <li className="flex items-center"><FiMail className="mr-2" /> hello@nomadnova.com</li>
                <li className="flex items-center"><FiMapPin className="mr-2" /> San Francisco, CA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#3a7a5f] mt-8 pt-8 text-center text-[#a8c4b8]">
            <p>&copy; {new Date().getFullYear()} NomadNova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
