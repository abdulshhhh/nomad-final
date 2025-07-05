import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

export default function AdminDestinationsPage() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDestination, setNewDestination] = useState({
    name: '',
    country: '',
    visits: '0',
    image: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  // Fetch destinations on component mount
  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/admin/destinations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        setDestinations(response.data.destinations);
      } else {
        setError('Failed to fetch destinations');
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setError('Error fetching destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDestination = async () => {
    try {
      if (!newDestination.name || !newDestination.country || !newDestination.image) {
        setError('Name, country, and image are required');
        return;
      }

      const token = localStorage.getItem('authToken');
      const response = await axios.post('/api/admin/destinations', newDestination, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        setDestinations([response.data.destination, ...destinations]);
        setIsAddingNew(false);
        setNewDestination({
          name: '',
          country: '',
          visits: '0',
          image: ''
        });
        setError(null);
      }
    } catch (error) {
      console.error('Error adding destination:', error);
      setError('Failed to add destination. Please try again.');
    }
  };

  const handleUpdateDestination = async (id) => {
    try {
      const destination = destinations.find(d => d._id === id || d.id === id);
      if (!destination) return;

      const token = localStorage.getItem('authToken');
      const response = await axios.put(`/api/admin/destinations/${id}`, destination, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        setDestinations(destinations.map(d => 
          (d._id === id || d.id === id) ? response.data.destination : d
        ));
        setEditingId(null);
        setError(null);
      }
    } catch (error) {
      console.error('Error updating destination:', error);
      setError('Failed to update destination. Please try again.');
    }
  };

  const handleDeleteDestination = async (id) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.delete(`/api/admin/destinations/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        setDestinations(destinations.filter(d => d._id !== id && d.id !== id));
        setError(null);
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
      setError('Failed to delete destination. Please try again.');
    }
  };

  const handleImageChange = async (e, isNew = true) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadError(null);
    
    // Check file size (5MB limit)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
      setUploadError(`Image size (${fileSizeMB.toFixed(2)}MB) exceeds 5MB limit. Please select a smaller image.`);
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Compression options
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        onProgress: (progress) => setUploadProgress(progress)
      };
      
      // Compress image if it's larger than 1MB
      let processedFile = file;
      if (fileSizeMB > 1) {
        processedFile = await imageCompression(file, options);
        console.log('Compressed image size:', processedFile.size / (1024 * 1024), 'MB');
      }
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isNew) {
          setNewDestination(prev => ({
            ...prev,
            image: reader.result
          }));
        } else {
          setDestinations(prev => 
            prev.map(d => (d._id === editingId || d.id === editingId) 
              ? {...d, image: reader.result} : d)
          );
        }
        setIsUploading(false);
        setUploadProgress(100);
      };
      reader.readAsDataURL(processedFile);
      
    } catch (error) {
      console.error('Error processing image:', error);
      setUploadError('Failed to process image. Please try another image.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-[#f8d56b]">
                Popular Destinations Management
              </h1>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-[#f8d56b] text-[#2c5e4a] px-4 py-2 rounded-lg flex items-center hover:bg-[#f0c550] transition"
            >
              <FiArrowLeft className="mr-2" /> Back to Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <FiX />
            </button>
          </div>
        )}

        {/* Add New Destination Button */}
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="bg-[#2c5e4a] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#1a3a2a] transition mb-6"
          >
            <FiPlus className="mr-2" /> Add New Destination
          </button>
        )}

        {/* Add New Destination Form */}
        {isAddingNew && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-[#d1c7b7]">
            <div className="p-6">
              <h2 className="text-xl font-bold text-[#2c5e4a] mb-4">Add New Destination</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination Name</label>
                  <input
                    type="text"
                    value={newDestination.name}
                    onChange={(e) => setNewDestination({...newDestination, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#2c5e4a] focus:border-[#2c5e4a]"
                    placeholder="e.g. Paris, France"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={newDestination.country}
                    onChange={(e) => setNewDestination({...newDestination, country: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#2c5e4a] focus:border-[#2c5e4a]"
                    placeholder="e.g. France"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visits</label>
                  <input
                    type="text"
                    value={newDestination.visits}
                    onChange={(e) => setNewDestination({...newDestination, visits: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#2c5e4a] focus:border-[#2c5e4a]"
                    placeholder="e.g. 2.3k"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-[#2c5e4a] focus:border-[#2c5e4a]"
                  />
                  {isUploading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-[#2c5e4a] h-2.5 rounded-full" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Uploading: {uploadProgress}%</p>
                    </div>
                  )}
                  {uploadError && (
                    <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                  )}
                  {newDestination.image && (
                    <div className="mt-2">
                      <img 
                        src={newDestination.image} 
                        alt="Preview" 
                        className="h-40 w-auto object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewDestination({
                        name: '',
                        country: '',
                        visits: '0',
                        image: ''
                      });
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddDestination}
                    className="bg-[#2c5e4a] text-white px-4 py-2 rounded hover:bg-[#1a3a2a] transition"
                    disabled={isUploading}
                  >
                    Add Destination
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Destinations List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#d1c7b7]">
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#2c5e4a] mb-4">Popular Destinations</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2c5e4a]"></div>
              </div>
            ) : destinations.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No destinations found. Add your first destination!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((destination) => (
                  <div 
                    key={destination._id || destination.id} 
                    className="border border-[#d1c7b7] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/assets/images/default-trip.jpeg";
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
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(e, false)}
                          className="w-full p-2 mb-2 border border-[#d1c7b7] rounded bg-white text-[#2c2c2c]"
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
                            className="bg-[#2c5e4a] text-white p-2 rounded hover:bg-[#1a3a2a] transition"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteDestination(destination._id || destination.id)}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
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
          </div>
        </div>
      </main>
    </div>
  );
}
