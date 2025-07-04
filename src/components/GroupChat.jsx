import { useState, useRef, useEffect } from 'react';
import { FiPhone, FiVideo, FiX, FiMapPin, FiShare2 } from 'react-icons/fi';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Use your backend URL/port

export default function GroupChat({ trip, currentUser, onClose }) {
  console.log('GroupChat component received props:', { trip, currentUser }); // Debug log

  const [messages, setMessages] = useState([
    {
      id: 1,
      userId: trip.organizerId,
      userName: trip.organizer,
      userAvatar: trip.organizerAvatar,
      message: `Welcome to the ${trip.title} group chat! Looking forward to this amazing adventure together! 🌟`,
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      type: 'text'
    },
    {
      id: 2,
      userId: trip.joinedMembers[0]?.id,
      userName: trip.joinedMembers[0]?.name,
      userAvatar: trip.joinedMembers[0]?.avatar,
      message: "So excited! Can't wait to explore together!",
      timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
      type: 'text'
    },
    {
      id: 3,
      userId: trip.joinedMembers[1]?.id,
      userName: trip.joinedMembers[1]?.name,
      userAvatar: trip.joinedMembers[1]?.avatar,
      message: "Has anyone started planning what to pack?",
      timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
      type: 'text'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [showAppPrompt, setShowAppPrompt] = useState(false);
  const [promptType, setPromptType] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [locationWatchId, setLocationWatchId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const messageData = {
        tripId: trip.id,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName,
        userAvatar: currentUser.avatar,
        message: newMessage.trim(),
        type: 'text'
      };

      console.log('Sending message:', messageData);
      socket.emit('sendMessage', messageData);

      // Stop typing indicator
      if (isTyping) {
        socket.emit('stopTyping', { tripId: trip.id, userId: currentUser.id });
        setIsTyping(false);
      }

      setNewMessage('');
    }
  };

  // Handle typing indicators
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      socket.emit('typing', {
        tripId: trip.id,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.fullName
      });
    }

    // Stop typing after 2 seconds of inactivity
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      if (isTyping) {
        socket.emit('stopTyping', { tripId: trip.id, userId: currentUser.id });
        setIsTyping(false);
      }
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const showMobileAppPrompt = (type) => {
    setPromptType(type);
    setShowAppPrompt(true);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,        // 10 seconds
        maximumAge: 0          // Don't use cached position
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setShowLocationModal(true);
          // Store coordinates for sharing
          setLocationData({
            latitude,
            longitude,
            accuracy: position.coords.accuracy, // Store accuracy info
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to access your location. Please check your browser permissions.");
        },
        options
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const shareLocationViaApp = (app) => {
    const { latitude, longitude } = locationData;
    let shareUrl = '';
    
    switch(app) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=My%20current%20location:%20https://maps.google.com/?q=${latitude},${longitude}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=https://maps.google.com/?q=${latitude},${longitude}&text=My%20current%20location`;
        break;
      case 'messenger':
        shareUrl = `https://www.facebook.com/dialog/send?link=https://maps.google.com/?q=${latitude},${longitude}&app_id=YOUR_APP_ID`;
        break;
      case 'chat':
        // Share directly in the chat
        const locationMessage = {
          id: Date.now(),
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          message: `📍 Shared my location: https://maps.google.com/?q=${latitude},${longitude}`,
          timestamp: new Date().toISOString(),
          type: 'location'
        };
        setMessages([...messages, locationMessage]);
        setShowLocationModal(false);
        return;
      default:
        // Default to native share if available
        if (navigator.share) {
          navigator.share({
            title: 'My Current Location',
            text: 'Check out my current location!',
            url: `https://maps.google.com/?q=${latitude},${longitude}`
          });
          setShowLocationModal(false);
          return;
        }
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(`https://maps.google.com/?q=${latitude},${longitude}`);
        alert('Location link copied to clipboard!');
        setShowLocationModal(false);
        return;
    }
    
    window.open(shareUrl, '_blank');
    setShowLocationModal(false);
  };

  // Function to start watching location
  const startWatchingLocation = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocationData({
            latitude,
            longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.error("Error watching location:", error);
        },
        options
      );
      
      setLocationWatchId(watchId);
    }
  };

  // Function to stop watching location
  const stopWatchingLocation = () => {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopWatchingLocation();
    };
  }, []);

  useEffect(() => {
    // Join the trip room for real-time messaging
    socket.emit('joinRoom', trip.id, currentUser.id);

    // Listen for new messages
    socket.on('receiveMessage', (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
    });

    // Listen for user join/leave events
    socket.on('userJoined', (data) => {
      console.log('User joined:', data);
    });

    // Listen for typing indicators
    socket.on('userTyping', (data) => {
      console.log('User typing:', data);
      setTypingUsers(prev => {
        if (!prev.find(user => user.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socket.on('userStoppedTyping', (data) => {
      console.log('User stopped typing:', data);
      setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
    });

    // Fetch existing messages from the database
    fetch(`http://localhost:5000/api/messages/${trip.id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Fetched messages:', data);
        if (Array.isArray(data)) {
          setMessages(data);
        }
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
      });

    // Cleanup on unmount
    return () => {
      socket.off('receiveMessage');
      socket.off('userJoined');
      socket.off('userTyping');
      socket.off('userStoppedTyping');
    };
  }, [trip.id, currentUser.id]);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="rounded-2xl w-full max-w-4xl h-[90vh] sm:h-[80vh] border border-gray-300 shadow-lg flex flex-col"
        style={{
          background: 'linear-gradient(135deg, #f8f4e3 0%, #f0d9b5 100%)',
          color: '#2c5e4a' // mountain green text
        }}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-[#d1c7b7] rounded-t-2xl bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img
              src={trip.image}
              alt={trip.title}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#f8d56b]"
            />
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">{trip.title}</h3>
              <p className="text-xs sm:text-sm text-gray-200">
                {trip.joinedMembers.length + 1} members • {trip.joinedMembers.slice(0, 3).length} online
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => showMobileAppPrompt('voice')}
              className="p-2 bg-[#f8d56b] rounded-full text-[#2c5e4a] hover:bg-[#f8a95d] hover:text-white transition-colors"
              title="Voice Call"
              aria-label="Voice Call"
            >
              <FiPhone className="w-5 h-5" />
            </button>
            <button
              onClick={() => showMobileAppPrompt('video')}
              className="p-2 bg-[#f8d56b] rounded-full text-[#2c5e4a] hover:bg-[#f8a95d] hover:text-white transition-colors"
              title="Video Call"
              aria-label="Video Call"
            >
              <FiVideo className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#f8d56b] rounded-full text-white hover:text-[#2c5e4a] transition-colors"
              title="Close Chat"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-transparent rounded-b-none">
          {/* Disclaimer at the top */}
          <div className="mb-4">
            <div className="bg-[#f8d56b]/80 text-[#2c5e4a] px-4 py-3 rounded-xl text-center text-sm font-semibold shadow">
              🚨 <b>Travel Safe!</b> Never share sensitive info in chat. Meet in public places, respect others, and report any suspicious activity to the organizers. Happy exploring! 🌍✨
            </div>
          </div>
          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-2 mb-2 px-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#f8a95d] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#f8a95d] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-[#f8a95d] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="text-xs text-[#5E5854]">
                {typingUsers.map(user => user.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}

          {messages.map((message, index) => {
            const showDate =
              index === 0 || formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
            const isCurrentUser = message.userId === currentUser.id;

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center my-3 sm:my-4">
                    <span className="bg-[#f8d56b] text-[#2c5e4a] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                )}

                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`flex items-end space-x-1 sm:space-x-2 max-w-[75%] sm:max-w-xs lg:max-w-md ${
                      isCurrentUser ? 'flex-row-reverse space-x-reverse sm:space-x-reverse' : ''
                    }`}
                  >
                    {!isCurrentUser && (
                      <img
                        src={message.userAvatar}
                        alt={message.userName}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#f8d56b] flex-shrink-0"
                      />
                    )}
                    <div
                      className={`rounded-2xl px-3 sm:px-4 py-2 ${
                        isCurrentUser
                          ? 'bg-[#f8a95d] bg-opacity-90 text-white'
                          : 'bg-white bg-opacity-90 text-[#2c5e4a]'
                      }`}
                    >
                      {!isCurrentUser && (
                        <p className="text-xs font-semibold mb-1 opacity-80">{message.userName}</p>
                      )}
                      {message.type === 'location' ? (
                        <div>
                          <p className="text-xs sm:text-sm flex items-center">
                            <FiMapPin className="mr-1" /> 
                            <a 
                              href={message.message.split(': ')[1]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              View shared location
                            </a>
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm">{message.message}</p>
                      )}
                      <p
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-white/70' : 'text-[#2c5e4a]/70'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 border-t border-[#d1c7b7] rounded-b-2xl flex bg-transparent"
        >
          <button
            type="button"
            onClick={handleShareLocation}
            className="p-2 mr-2 bg-[#f8d56b] rounded-full text-[#2c5e4a] hover:bg-[#f8a95d] hover:text-white transition-colors"
            title="Share Location"
            aria-label="Share Location"
          >
            <FiMapPin className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            className="flex-1 px-3 sm:px-4 py-2 text-sm rounded-full border border-[#d1c7b7] focus:outline-none focus:ring-2 focus:ring-[#f8a95d] bg-white text-[#2c5e4a] placeholder-[#5E5854]"
          />
          <button
            type="submit"
            className="ml-2 px-3 sm:px-5 py-2 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d] text-white font-semibold rounded-full transition-colors text-sm sm:text-base"
          >
            Send
          </button>
        </form>
      </div>

      {/* App Download Prompt Modal */}
      {showAppPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl overflow-hidden w-full max-w-md shadow-xl border border-[#d1c7b7]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 border-b border-[#d1c7b7]">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Download Our App</h3>
                <button 
                  onClick={() => setShowAppPrompt(false)}
                  className="text-white/80 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-[#f8d56b]/30 p-4 rounded-full inline-block mb-4">
                  {promptType === 'voice' ? (
                    <FiPhone className="w-12 h-12 text-[#f8a95d]" />
                  ) : (
                    <FiVideo className="w-12 h-12 text-[#f8a95d]" />
                  )}
                </div>
                <p className="text-[#2c5e4a] mb-2">
                  {promptType === 'voice' ? 'Voice' : 'Video'} calls are available exclusively on our mobile app.
                </p>
                <p className="text-[#5E5854] text-sm">
                  Download now to enjoy the full experience!
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button className="flex-1 bg-black text-white py-3 rounded-xl flex items-center justify-center">
                  <span className="mr-2">App Store</span>
                </button>
                <button className="flex-1 bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white py-3 rounded-xl flex items-center justify-center">
                  <span className="mr-2">Google Play</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Sharing Modal */}
      {showLocationModal && locationData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl overflow-hidden w-full max-w-md shadow-xl border border-[#d1c7b7]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] p-4 border-b border-[#d1c7b7]">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Share Your Location</h3>
                <button 
                  onClick={() => setShowLocationModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="bg-[#f8d56b]/30 p-4 rounded-full inline-block mb-4">
                  <FiMapPin className="w-12 h-12 text-[#f8a95d]" />
                </div>
                <p className="text-[#2c5e4a] mb-2">
                  Share your current location with the group
                </p>
                <p className="text-[#5E5854] text-sm mb-4">
                  Choose how you want to share:
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => shareLocationViaApp('whatsapp')}
                    className="bg-[#25D366] text-white py-3 rounded-xl flex items-center justify-center"
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button 
                    onClick={() => shareLocationViaApp('telegram')}
                    className="bg-[#0088cc] text-white py-3 rounded-xl flex items-center justify-center"
                  >
                    <span>Telegram</span>
                  </button>
                  <button 
                    onClick={() => shareLocationViaApp('messenger')}
                    className="bg-[#0084ff] text-white py-3 rounded-xl flex items-center justify-center"
                  >
                    <span>Messenger</span>
                  </button>
                  <button 
                    onClick={() => shareLocationViaApp('chat')}
                    className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] text-white py-3 rounded-xl flex items-center justify-center"
                  >
                    <span>Share in Chat</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
