import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight, FiArrowLeft, FiMapPin } from 'react-icons/fi';
import '../styles/memoryDetail.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const MemoryDetail = () => {
  const { memoryId } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchMemoryDetails = async () => {
      try {
        setLoading(true);
        
        if (!memoryId) {
          setError("No memory ID provided");
          setLoading(false);
          return;
        }
        
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        // Try the detail endpoint first
        try {
          const response = await axios.get(
            `${BACKEND_URL}/api/memories/detail/${memoryId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (response.data.success) {
            setMemory(response.data.memory);
            
            // Fetch user details if we have a userId
            if (response.data.memory.userId) {
              try {
                // First try to get profile data which has more details
                const profileResponse = await axios.get(
                  `${BACKEND_URL}/api/profile/${response.data.memory.userId}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                
                if (profileResponse.data.success) {
                  setUser(profileResponse.data.profile);
                  return;
                }
              } catch (profileErr) {
                console.log("Profile fetch failed, trying user endpoint");
              }
              
              // Fallback to user endpoint
              try {
                const userResponse = await axios.get(
                  `${BACKEND_URL}/api/users/${response.data.memory.userId}`
                );
                
                if (userResponse.data.success) {
                  setUser(userResponse.data.user);
                }
              } catch (userErr) {
                console.error("Error fetching user details:", userErr.message);
              }
            }
            return;
          }
        } catch (detailErr) {
          console.log("Detail endpoint failed, trying regular endpoint");
        }
        
        // If detail endpoint fails, try the regular endpoint
        const response = await axios.get(
          `${BACKEND_URL}/api/memories/${memoryId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setMemory(response.data.memory);
          
          // Fetch user details if we have a userId
          if (response.data.memory.userId) {
            try {
              // First try to get profile data which has more details
              const profileResponse = await axios.get(
                `${BACKEND_URL}/api/profile/${response.data.memory.userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              if (profileResponse.data.success) {
                setUser(profileResponse.data.profile);
                return;
              }
            } catch (profileErr) {
              console.log("Profile fetch failed, trying user endpoint");
            }
            
            // Fallback to user endpoint
            try {
              const userResponse = await axios.get(
                `${BACKEND_URL}/api/users/${response.data.memory.userId}`
              );
              
              if (userResponse.data.success) {
                setUser(userResponse.data.user);
              }
            } catch (userErr) {
              console.error("Error fetching user details:", userErr.message);
            }
          }
        } else {
          setError('Failed to load memory details');
        }
      } catch (err) {
        console.error('Error fetching memory details:', err.message);
        setError(`Error loading memory: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (memoryId) {
      fetchMemoryDetails();
    } else {
      setError("No memory ID provided");
      setLoading(false);
    }
  }, [memoryId]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next image
        handleNextImage();
      } else {
        // Swipe right - go to previous image
        handlePrevImage();
      }
    }
    
    touchStartX.current = null;
  };

  const handlePrevImage = () => {
    if (!memory?.images || memory.images.length <= 1) return;
    setCurrentImageIndex(prev => 
      prev === 0 ? memory.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!memory?.images || memory.images.length <= 1) return;
    setCurrentImageIndex(prev => 
      prev === memory.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleGoBack = () => {
    navigate(-1); // This will go back to the previous page
  };

  if (loading) {
    return (
      <div className="memory-detail-page">
        <header className="memory-detail-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button onClick={handleGoBack} className="back-button">
                <FiArrowLeft /> Back to Memories
              </button>
            </div>
          </div>
        </header>
        <div className="memory-detail-container loading">
          <div className="loading-spinner"></div>
          <p>Loading memory...</p>
        </div>
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="memory-detail-page">
        <header className="memory-detail-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button onClick={handleGoBack} className="back-button">
                <FiArrowLeft /> Back to Memories
              </button>
            </div>
          </div>
        </header>
        <div className="memory-detail-container error">
          <p>{error || 'Memory not found'}</p>
          <button onClick={handleGoBack} className="back-button-alt">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Ensure memory.images is an array
  const images = Array.isArray(memory.images) ? memory.images : 
                (memory.imageUrl ? [memory.imageUrl] : []);

  // Get user display name from profile or fallback
  const userName = user?.fullName || user?.name || 'User';
  
  // Get user avatar with fallback
  const userAvatar = user?.avatar || user?.profilePicture || '/assets/images/default-avatar.jpg';

  return (
    <div className="memory-detail-page">
      {/* Header with dark green background */}
      <header className="memory-detail-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button onClick={handleGoBack} className="back-button">
              <FiArrowLeft /> Back to Memories
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="memory-detail-container instagram-style">
          {/* User header - now with dark green background */}
          <div className="memory-user-header dark-green">
            <div className="user-avatar">
              <img 
                src={userAvatar} 
                alt={userName} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/default-avatar.jpg';
                }}
              />
            </div>
            <div className="user-info">
              <h3 className="user-name">{userName}</h3>
              {memory.location && (
                <p className="memory-location">
                  <FiMapPin className="location-icon" /> {memory.location}
                </p>
              )}
            </div>
          </div>
          
          {/* Image carousel */}
          <div 
            className="memory-image-section"
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="carousel-container medium-image">
              {images.length > 0 ? (
                images.slice(0, 10).map((image, idx) => (
                  <img 
                    key={idx}
                    src={image} 
                    alt={`Memory ${idx + 1}`} 
                    className="memory-image"
                    draggable="false"
                    style={{display: idx === currentImageIndex ? 'block' : 'none'}}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/placeholder-image.jpg';
                    }}
                  />
                ))
              ) : (
                <div className="no-images">No images available</div>
              )}
              
              {images.length > 1 && (
                <>
                  <button 
                    className="carousel-nav prev" 
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <FiChevronLeft />
                  </button>
                  <button 
                    className="carousel-nav next" 
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <FiChevronRight />
                  </button>
                  
                  <div className="image-counter">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Memory description */}
          <div className="memory-description-container">
            {memory.description && (
              <div className="memory-description">
                <span className="description-username">{userName}</span>
                <p>{memory.description}</p>
              </div>
            )}
            
            <div className="memory-date">
              {new Date(memory.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetail;
