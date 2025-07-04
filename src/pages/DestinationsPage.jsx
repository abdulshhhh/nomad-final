import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiMapPin } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Import image compression library
// import imageCompression from 'browser-image-compression';

export default function DestinationsPage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newDestination, setNewDestination] = useState({
    name: "",
    country: "",
    visits: "0",
    image: null
  });

  // Add state for upload progress and errors
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Fetch destinations
  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${BACKEND_URL}/api/admin/destinations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDestinations(response.data.destinations);
      } else {
        setError("Failed to load destinations");
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError(err.message || "Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // Handle image upload with compression
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadError(null);
    
    // Check file size (5MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      setUploadError(`Image size (${fileSizeMB.toFixed(2)}MB) exceeds 5MB limit. Please select a smaller image.`);
      return;
    }
    
    // Convert to base64 with manual resizing
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 800px)
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width;
          width = maxDim;
        } else if (height > maxDim) {
          width = (width * maxDim) / height;
          height = maxDim;
        }
        
        // Resize
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get as base64 with reduced quality
        const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
        
        setNewDestination(prev => ({
          ...prev,
          image: resizedImage
        }));
        setUploadProgress(100);
        setIsUploading(false);
      };
      
      img.src = event.target.result;
      setUploadProgress(50); // Set to 50% while processing
    };
    
    setIsUploading(true);
    setUploadProgress(10);
    reader.readAsDataURL(file);
  };

  // Add new destination
  const handleAddDestination = async (e) => {
    e.preventDefault();
    
    if (uploadError) {
      alert("Please fix the image upload error before submitting.");
      return;
    }
    
    if (isUploading) {
      alert("Please wait for the image to finish uploading.");
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Create a smaller payload by resizing the image if needed
      let imageToUpload = newDestination.image;
      
      // If image is base64 and very large, resize it further
      if (imageToUpload && imageToUpload.startsWith('data:image')) {
        const base64Length = imageToUpload.length;
        const base64SizeMB = (base64Length * 3/4) / (1024 * 1024);
        
        if (base64SizeMB > 1) {
          // Create temporary image for resizing
          const img = new Image();
          img.src = imageToUpload;
          await new Promise(resolve => { img.onload = resolve; });
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 800px)
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }
          
          // Resize
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get as base64 with reduced quality
          imageToUpload = canvas.toDataURL('image/jpeg', 0.7);
          console.log('Resized image for upload');
        }
      }
      
      const destinationToUpload = {
        ...newDestination,
        image: imageToUpload
      };
      
      const response = await axios.post(
        `${BACKEND_URL}/api/admin/destinations`, 
        destinationToUpload,
        { 
          headers: { Authorization: `Bearer ${token}` },
          maxContentLength: 10 * 1024 * 1024, // 10MB limit
          maxBodyLength: 10 * 1024 * 1024 // 10MB limit
        }
      );
      
      if (response.data.success) {
        setDestinations(prev => [...prev, response.data.destination]);
        setShowAddForm(false);
        setNewDestination({
          name: "",
          country: "",
          visits: "0",
          image: null
        });
        setUploadProgress(0);
        setUploadError(null);
      }
    } catch (err) {
      console.error("Error adding destination:", err);
      if (err.response && err.response.status === 413) {
        alert("Failed to add destination: Image file is too large. Please use a smaller image or try compressing it further.");
      } else {
        alert("Failed to add destination: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Update destination
  const handleUpdateDestination = async (id) => {
    try {
      const token = localStorage.getItem('authToken');
      const destinationToUpdate = destinations.find(d => d._id === id || d.id === id);
      
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/destinations/${id}`, 
        destinationToUpdate,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setDestinations(prev => 
          prev.map(d => (d._id === id || d.id === id) ? response.data.destination : d)
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error("Error updating destination:", err);
      alert("Failed to update destination: " + (err.response?.data?.message || err.message));
    }
  };

  // Delete destination
  const handleDeleteDestination = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?")) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(
        `${BACKEND_URL}/api/admin/destinations/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setDestinations(prev => prev.filter(d => d._id !== id && d.id !== id));
      }
    } catch (err) {
      console.error("Error deleting destination:", err);
      alert("Failed to delete destination: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FiMapPin className="text-[#f8d56b] text-2xl mr-2" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#f8d56b]">
                Popular Destinations
              </h1>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-[#f8d56b] text-[#2c5e4a] px-4 py-2 rounded-lg flex items-center hover:bg-[#f0c550] transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#2c5e4a]">Manage Destinations</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-[#2c5e4a] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#1a3a2a] transition"
          >
            <FiPlus className="mr-2" /> Add Destination
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2c5e4a]"></div>
            <p className="mt-2 text-[#5E5854]">Loading destinations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div 
                key={destination._id || destination.id} 
                className="bg-white rounded-xl overflow-hidden shadow-md border border-[#d1c7b7] hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={destination.image} 
                    alt={destination.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/assets/images/default-trip.jpg";
                    }}
                  />
                </div>
                
                {editingId === (destination._id || destination.id) ? (
                  <div className="p-4 bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5]">
                    <input
                      type="text"
                      value={destination.name}
                      onChange={(e) => setDestinations(prev => 
                        prev.map(d => (d._id === destination._id || d.id === destination.id) 
                          ? {...d, name: e.target.value} : d)
                      )}
                      className="w-full p-2 mb-2 border border-[#d1c7b7] rounded bg-white text-[#2c2c2c] font-medium"
                      placeholder="Destination name"
                    />
                    <input
                      type="text"
                      value={destination.country}
                      onChange={(e) => setDestinations(prev => 
                        prev.map(d => (d._id === destination._id || d.id === destination.id) 
                          ? {...d, country: e.target.value} : d)
                      )}
                      className="w-full p-2 mb-2 border border-[#d1c7b7] rounded bg-white text-[#2c2c2c] font-medium"
                      placeholder="Country"
                    />
                    <input
                      type="text"
                      value={destination.visits}
                      onChange={(e) => setDestinations(prev => 
                        prev.map(d => (d._id === destination._id || d.id === destination.id) 
                          ? {...d, visits: e.target.value} : d)
                      )}
                      className="w-full p-2 mb-2 border border-[#d1c7b7] rounded bg-white text-[#2c2c2c] font-medium"
                      placeholder="Visits (e.g. 2.3k)"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => handleUpdateDestination(destination._id || destination.id)}
                        className="bg-[#2c5e4a] text-white p-2 rounded hover:bg-[#1a3a2a] transition"
                      >
                        <FiSave />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-[#5E5854] text-white p-2 rounded hover:bg-gray-600 transition"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-b from-[#f8f4e3] to-[#f0d9b5]">
                    <h3 className="font-bold text-lg text-[#2c5e4a]">{destination.name}</h3>
                    <p className="text-[#5E5854]">{destination.country}</p>
                    <p className="text-sm text-[#5E5854]">{destination.visits} visits</p>
                    
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setEditingId(destination._id || destination.id)}
                        className="bg-[#f8a95d] text-white p-2 rounded hover:bg-[#f87c6d] transition"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteDestination(destination._id || destination.id)}
                        className="bg-[#f87c6d] text-white p-2 rounded hover:bg-red-600 transition"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Destination Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl border border-[#d1c7b7] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] flex justify-between items-center p-4">
                <h3 className="text-xl font-bold text-[#f8d56b]">Add New Destination</h3>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDestination({
                      name: "",
                      country: "",
                      visits: "0",
                      image: null
                    });
                  }}
                  className="text-white hover:text-[#f8a95d] transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {/* Form */}
              <div className="p-4 overflow-y-auto">
                <form onSubmit={handleAddDestination}>
                  <div className="mb-4">
                    <label className="block text-[#2c5e4a] font-semibold mb-1">Destination Name</label>
                    <input
                      type="text"
                      value={newDestination.name}
                      onChange={(e) => setNewDestination({...newDestination, name: e.target.value})}
                      className="w-full p-2 border border-[#d1c7b7] rounded bg-white text-[#2c2c2c]"
                      placeholder="e.g. Paris, France"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-[#2c5e4a] font-semibold mb-1">Country</label>
                    <input
                      type="text"
                      value={newDestination.country}
                      onChange={(e) => setNewDestination({...newDestination, country: e.target.value})}
                      className="w-full p-2 border border-[#d1c7b7] rounded bg-white text-[#2c2c2c]"
                      placeholder="e.g. France"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-[#2c5e4a] font-semibold mb-1">Visits</label>
                    <input
                      type="text"
                      value={newDestination.visits}
                      onChange={(e) => setNewDestination({...newDestination, visits: e.target.value})}
                      className="w-full p-2 border border-[#d1c7b7] rounded bg-white text-[#2c2c2c]"
                      placeholder="e.g. 2.3k"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-[#2c5e4a] font-semibold mb-1">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-2 border border-[#d1c7b7] rounded bg-white text-[#2c2c2c]"
                      required
                    />
                    
                    {isUploading && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#2c5e4a] transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-[#5E5854] mt-1">Processing image: {uploadProgress.toFixed(0)}%</p>
                      </div>
                    )}
                    
                    {uploadError && (
                      <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                        {uploadError}
                      </div>
                    )}
                    
                    {newDestination.image && !isUploading && (
                      <div className="mt-2 h-32 overflow-hidden rounded">
                        <img 
                          src={newDestination.image} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Preview section */}
                  {(newDestination.name || newDestination.country || newDestination.visits) && (
                    <div className="mb-4 p-3 bg-white/50 rounded-lg border border-[#d1c7b7]">
                      <h4 className="font-semibold text-[#2c5e4a] mb-2">Preview:</h4>
                      <div className="flex items-start">
                        {newDestination.image && (
                          <div className="w-16 h-16 mr-3 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={newDestination.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#2c5e4a]">{newDestination.name || "Destination Name"}</p>
                          <p className="text-[#5E5854]">{newDestination.country || "Country"}</p>
                          <p className="text-sm text-[#5E5854]">{newDestination.visits || "0"} visits</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewDestination({
                          name: "",
                          country: "",
                          visits: "0",
                          image: null
                        });
                      }}
                      className="px-4 py-2 border border-[#d1c7b7] rounded text-[#5E5854] hover:bg-[#e1d9c8] transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#2c5e4a] text-white rounded hover:bg-[#1a3a2a] transition"
                    >
                      Add Destination
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}





