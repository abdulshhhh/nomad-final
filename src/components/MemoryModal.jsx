import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiMapPin, FiCalendar } from 'react-icons/fi';
import '../styles/memoryDetail.css';

const MemoryModal = ({ memory, onClose, currentUser }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef(null);
  const touchStartX = useRef(null);

  // Handle keyboard events for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

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
    const images = Array.isArray(memory.images) ? memory.images : 
                  (memory.imageUrl ? [memory.imageUrl] : []);
    if (images.length <= 1) return;
    
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    const images = Array.isArray(memory.images) ? memory.images : 
                  (memory.imageUrl ? [memory.imageUrl] : []);
    if (images.length <= 1) return;
    
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // Ensure memory.images is an array
  const images = Array.isArray(memory.images) ? memory.images : 
                (memory.imageUrl ? [memory.imageUrl] : []);

  // Add more detailed console log to debug the avatar issue
  useEffect(() => {
    console.log("MemoryModal received props:", { 
      memory, 
      currentUser,
      "currentUser?.avatar": currentUser?.avatar,
      "memory?.userAvatar": memory?.userAvatar,
      avatarUrl: getAvatarUrl() 
    });
  }, [memory, currentUser]);

  // Improved avatar URL determination function with better logging
  const getAvatarUrl = () => {
    // Check if currentUser has an avatar
    if (currentUser?.avatar) {
      console.log("Using currentUser avatar:", currentUser.avatar);
      return currentUser.avatar;
    }
    
    // Check if memory has user avatar info
    if (memory?.userAvatar) {
      console.log("Using memory userAvatar:", memory.userAvatar);
      return memory.userAvatar;
    }
    
    // Fallback to default
    console.log("Using default avatar - no avatar found in currentUser or memory");
    return "/assets/images/default-avatar.webp";
  };

  // Use the function to get avatar URL
  const avatarUrl = getAvatarUrl();

  // Get user display name from profile or fallback
  const userName = currentUser?.fullName || 
                  currentUser?.name || 
                  memory.userName || 
                  'User';

  return (
    <div className="memory-modal-overlay">
      <div 
        ref={modalRef}
        className="memory-detail-container instagram-style"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 text-white p-2 rounded-full"
          onClick={onClose}
          aria-label="Close memory details"
        >
          <FiX />
        </button>
        
        {/* Memory Header with dark green background */}
        <div className="memory-user-header dark-green">
          <div className="user-avatar">
            <img
              src={avatarUrl}
              alt={`${userName}'s avatar`}
              className="avatar-image"
              onError={(e) => {
                console.error("Avatar failed to load:", e.target.src);
                // Only try fallback once to prevent infinite loop
                if (e.target.src !== "/assets/images/default-avatar.webp") {
                  e.target.onerror = null; // Remove the error handler to prevent loops
                  e.target.src = "/assets/images/default-avatar.webp";
                  console.log("Switched to default avatar");
                }
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
        
        {/* Image Carousel - Medium size */}
        <div className="memory-image-section">
          <div 
            className="carousel-container medium-image"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {images.length > 0 ? (
              <img 
                src={images[currentImageIndex]} 
                alt={memory.description || "Memory"} 
                className="memory-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-gray-100 text-gray-500">
                No image available
              </div>
            )}
            
            {images.length > 1 && (
              <>
                <button 
                  className="carousel-nav prev"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button 
                  className="carousel-nav next"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <FiChevronRight size={24} />
                </button>
                
                <div className="image-counter">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Memory Description - Below image */}
        <div className="memory-description-container">
          {memory.description && (
            <div className="memory-description">
              <span className="description-username">{userName}</span>
              <p>{memory.description}</p>
            </div>
          )}
          
          {memory.date && (
            <div className="memory-date">
              <FiCalendar className="inline mr-1" />
              <span>{new Date(memory.date).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryModal;



