import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload, FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { BACKEND_URL } from '../config';

const MAX_IMAGES = 10;

export default function MemoryUploadModal({ 
  files, 
  onClose, 
  onUpload,
  onSuccess 
}) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  // Add these refs for touch handling
  const touchStartX = useRef(null);
  const previewContainerRef = useRef(null);

  useEffect(() => {
    // Generate previews for all files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    
    // Cleanup function to revoke object URLs
    return () => {
      newPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [files]);

  // Add these navigation functions
  const handlePrevImage = () => {
    if (previews.length <= 1) return;
    setCurrentPreviewIndex(prev => 
      prev === 0 ? previews.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (previews.length <= 1) return;
    setCurrentPreviewIndex(prev => 
      prev === previews.length - 1 ? 0 : prev + 1
    );
  };

  // Add touch handlers for swipe gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    // Prevent default to avoid scrolling while swiping horizontally
    if (touchStartX.current !== null) {
      const currentX = e.touches[0].clientX;
      const diff = touchStartX.current - currentX;
      
      if (Math.abs(diff) > 10) {
        // Prevent page scrolling when intentionally swiping the carousel
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    console.log('Swipe detected:', { 
      start: touchStartX.current, 
      end: touchEndX, 
      diff: diff 
    });
    
    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - go to next image
        console.log('Swiping left - next image');
        handleNextImage();
      } else {
        // Swipe right - go to previous image
        console.log('Swiping right - previous image');
        handlePrevImage();
      }
    }
    
    touchStartX.current = null;
  };

  // Add event listeners programmatically for better control
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    
    const handleTouchStartEvent = (e) => handleTouchStart(e);
    const handleTouchMoveEvent = (e) => handleTouchMove(e);
    const handleTouchEndEvent = (e) => handleTouchEnd(e);
    
    container.addEventListener('touchstart', handleTouchStartEvent, { passive: true });
    container.addEventListener('touchmove', handleTouchMoveEvent, { passive: false }); // non-passive to allow preventDefault
    container.addEventListener('touchend', handleTouchEndEvent, { passive: true });
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStartEvent);
      container.removeEventListener('touchmove', handleTouchMoveEvent);
      container.removeEventListener('touchend', handleTouchEndEvent);
    };
  }, [previews.length]); // Re-attach when the number of previews changes

  const handleUpload = async () => {
    let progressInterval = null;
    
    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);
      
      // Create progress simulation with a reference we can reliably clear
      progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      // Create form data
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('description', description);
      formData.append('location', location);
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      // Send to server
      const response = await axios.post(
        `${BACKEND_URL}/api/memories`, 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(Math.min(percentCompleted, 95));
          }
        }
      );
      
      // Clear the interval immediately after response
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      // Set progress to 100% to indicate completion
      setProgress(100);
      
      // Process successful response
      if (response.data.success) {
        // Call the onUpload callback with the memory data
        if (typeof onUpload === 'function') {
          onUpload({
            files,
            description,
            location,
            date: new Date().toISOString()
          });
        }
        
        // Call onSuccess with the new memory from the server
        if (typeof onSuccess === 'function') {
          onSuccess(response.data.memory);
        }
        
        // Close the modal immediately
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to upload memory');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Ensure interval is cleared on error
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setIsUploading(false);
      setProgress(0);
      setError(error.message || 'An error occurred during upload');
    }
  };

  // Add this function to fetch location suggestions using OpenStreetMap
  const fetchLocationSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      // Using OpenStreetMap Nominatim API (free)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'NomadNova Travel App' // Required by Nominatim ToS
          }
        }
      );
      
      if (response.data && response.data.length > 0) {
        const suggestions = response.data.map(place => ({
          id: place.place_id,
          name: place.display_name,
          lat: place.lat,
          lon: place.lon
        }));
        setLocationSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setLocationSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
    }
  };

  // Add debounce function for location input
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Create debounced version of fetchLocationSuggestions
  const debouncedFetchSuggestions = useRef(
    debounce(fetchLocationSuggestions, 500) // 500ms delay to avoid too many requests
  ).current;

  // Handle location input change
  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    debouncedFetchSuggestions(value);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    setLocation(suggestion.name);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl border border-[#5E5854] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] flex justify-between items-center p-3 border-b border-[#5E5854] flex-shrink-0">
          <h3 className="text-base font-semibold text-white font-cinzel">Share Memory</h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-[#f8a95d] transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content - with scrollbar */}
        <div className="p-3 overflow-y-auto flex-1">
          {/* Image preview - smaller height */}
          <div 
            className="relative mb-3 select-none"
            ref={previewContainerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }} // Add inline style for touch action
          >
            {previews.length > 0 && (
              <img 
                src={previews[currentPreviewIndex]} 
                alt="Memory preview" 
                className="w-full h-48 object-cover rounded-lg border-2 border-[#204231] select-none"
                draggable="false"
              />
            )}
            
            {/* Navigation arrows - only show if multiple images */}
            {previews.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <FiChevronRight size={20} />
                </button>
              </>
            )}
            
            {/* Multiple images navigation dots */}
            {previews.length > 1 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                {previews.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentPreviewIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentPreviewIndex 
                        ? 'bg-[#f8a95d]' 
                        : 'bg-white/50'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Swipe instruction - only show on mobile and if multiple images */}
            {previews.length > 1 && (
              <div className="absolute top-2 left-0 right-0 text-center md:hidden">
                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                  Swipe to navigate
                </span>
              </div>
            )}
          </div>
          
          {/* Image count indicator */}
          {previews.length > 0 && (
            <div className="text-sm text-gray-500 mb-3 text-center">
              {currentPreviewIndex + 1} of {previews.length} {previews.length === 1 ? 'image' : 'images'}
              <span className="ml-1 text-xs">({previews.length}/{MAX_IMAGES} max)</span>
            </div>
          )}
          
          {/* Description input - smaller height */}
          <div className="mb-3">
            <label className="block text-[#204231] font-medium mb-1 text-sm">Caption</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a caption..."
              className="w-full p-2 bg-white/90 border border-[#d1c7b7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f8a95d] focus:border-[#f8a95d] resize-none text-[#5E5854] placeholder-[#5E5854]/60"
              rows={2}
            />
          </div>
          
          {/* Location input */}
          <div className="mb-3 relative">
            <label className="block text-[#204231] font-medium mb-1 text-sm">Location</label>
            <div className="flex items-center bg-white/90 border border-[#d1c7b7] rounded-lg px-2 focus-within:ring-2 focus-within:ring-[#f8a95d] focus-within:border-[#f8a95d]">
              <FiMapPin className="text-[#204231] mr-2" />
              <input
                type="text"
                value={location}
                onChange={handleLocationChange}
                placeholder="Add location (e.g. Paris, France)"
                className="flex-1 p-2 bg-transparent border-none focus:outline-none text-[#5E5854] placeholder-[#5E5854]/60 text-sm"
              />
            </div>
            
            {/* Location suggestions dropdown */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-10 mt-1 w-full bg-white border border-[#d1c7b7] rounded-lg shadow-lg max-h-60 overflow-auto"
              >
                {locationSuggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-2 hover:bg-[#f8f4e3] cursor-pointer text-[#204231] text-sm border-b border-[#d1c7b7] last:border-b-0"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <div className="flex items-center">
                      <FiMapPin className="mr-2 text-[#2c5e4a]" />
                      {suggestion.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mb-3 p-2 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-[#5E5854] bg-[#f8f4e3] flex-shrink-0">
          {isUploading ? (
            <div className="space-y-2">
              <p className="text-[#204231] text-xs font-medium">Uploading memory...</p>
              <div className="w-full bg-[#d1c7b7] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] h-2 rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={handleUpload}
              disabled={isUploading || !files.length}
              className={`w-full py-2 ${
                !files.length 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#f8a95d] to-[#f87c6d] hover:from-[#f87c6d] hover:to-[#f8a95d]'
              } text-white rounded-full flex items-center justify-center font-cinzel font-semibold text-sm`}
            >
              <FiUpload className="mr-2" />
              Share Memory
            </button>
          )}
        </div>
      </div>
    </div>
  );
}





