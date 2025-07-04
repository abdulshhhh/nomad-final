import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiStar, FiMapPin, FiX, FiTrash2, FiCheck } from 'react-icons/fi';
import '../styles/memories.css';
import MemoryModal from './MemoryModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Memories = ({ userId, showOnlyPinned = false, onRefresh }) => {
  const navigate = useNavigate();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMemories, setSelectedMemories] = useState([]);

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/memories/${userId}`);
      
      console.log("Memory response:", response.data);
      
      if (response.data.success) {
        // Log the first memory's image to check format
        if (response.data.memories.length > 0) {
          const firstMemory = response.data.memories[0];
          console.log("First memory:", {
            id: firstMemory._id,
            hasImages: !!firstMemory.images,
            imageCount: firstMemory.images?.length || 0,
            firstImagePreview: firstMemory.images?.[0]?.substring(0, 50) + '...' || 'No image'
          });
        }
        
        setMemories(response.data.memories);
      } else {
        setError('Failed to load memories');
      }
    } catch (err) {
      console.error('Error fetching memories:', err);
      setError('Error loading memories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (memoryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${BACKEND_URL}/api/memories/pin/${memoryId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data.success) {
        setMemories(memories.map(memory => 
          memory._id === memoryId 
            ? { ...memory, pinned: !memory.pinned } 
            : memory
        ));
      }
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const refresh = () => {
    fetchMemories();
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedMemories([]);
  };

  // Toggle memory selection
  const toggleMemorySelection = (memoryId, e) => {
    e.stopPropagation(); // Prevent opening the memory
    
    setSelectedMemories(prev => {
      if (prev.includes(memoryId)) {
        return prev.filter(id => id !== memoryId);
      } else {
        return [...prev, memoryId];
      }
    });
  };

  // Select all memories
  const selectAllMemories = () => {
    if (selectedMemories.length === displayedMemories.length) {
      setSelectedMemories([]);
    } else {
      setSelectedMemories(displayedMemories.map(memory => memory._id));
    }
  };

  // Delete selected memories
  const deleteSelectedMemories = async () => {
    if (selectedMemories.length === 0) {
      alert("Please select at least one memory to delete.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedMemories.length} selected ${selectedMemories.length === 1 ? 'memory' : 'memories'}? This action cannot be undone.`)) {
      try {
        setIsDeleting(true);
        const token = localStorage.getItem('token');
        
        // Delete memories one by one
        const deletePromises = selectedMemories.map(memoryId => 
          axios.delete(
            `${BACKEND_URL}/api/memories/${memoryId}`,
            { headers: { Authorization: `Bearer ${token}` }}
          )
        );
        
        await Promise.all(deletePromises);
        
        // Remove deleted memories from state
        setMemories(memories.filter(memory => !selectedMemories.includes(memory._id)));
        setSelectedMemories([]);
        setIsSelectMode(false);
        
      } catch (err) {
        console.error('Error deleting memories:', err);
        alert("An error occurred while deleting memories.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle single memory deletion
  const handleDeleteMemory = async (memoryId, e) => {
    e.stopPropagation(); // Prevent opening the memory modal
    
    if (window.confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        const token = localStorage.getItem('token');
        const response = await axios.delete(
          `${BACKEND_URL}/api/memories/${memoryId}`,
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        if (response.data.success) {
          // Remove the deleted memory from state
          setMemories(memories.filter(memory => memory._id !== memoryId));
        } else {
          alert("Failed to delete memory. Please try again.");
        }
      } catch (err) {
        console.error('Error deleting memory:', err);
        alert("An error occurred while deleting the memory.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMemories();
    }
  }, [userId]);

  useEffect(() => {
    if (typeof onRefresh === 'function') {
      onRefresh({ refresh });
    }
  }, [onRefresh]);

  const displayedMemories = showOnlyPinned 
    ? memories.filter(memory => memory.pinned)
    : memories;

  if (loading) return <div>Loading memories...</div>;
  if (error) return <div>{error}</div>;

  const handleMemoryClick = (memory) => {
    if (isSelectMode) {
      toggleMemorySelection(memory._id, { stopPropagation: () => {} });
    } else {
      // Instead of navigating, show the modal
      setSelectedMemory(memory);
      setShowMemoryModal(true);
    }
  };

  return (
    <div className="memories-container">
      {/* Action bar */}
      <div className="memories-action-bar">
        {isSelectMode ? (
          <>
            <div className="select-actions">
              <button 
                onClick={selectAllMemories}
                className="select-action-button"
              >
                {selectedMemories.length === displayedMemories.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="selected-count">
                {selectedMemories.length} selected
              </span>
            </div>
            <div className="memory-actions-buttons">
              <button 
                onClick={deleteSelectedMemories}
                className="delete-action-button"
                disabled={isDeleting || selectedMemories.length === 0}
              >
                <FiTrash2 /> Delete Selected
              </button>
              <button 
                onClick={toggleSelectMode}
                className="cancel-action-button"
              >
                <FiX /> Cancel
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={toggleSelectMode}
            className="select-mode-button"
          >
            Select Memories
          </button>
        )}
      </div>

      {displayedMemories.length === 0 ? (
        <p>No memories found.</p>
      ) : (
        <div className="memories-grid">
          {displayedMemories.map(memory => (
            <div 
              key={memory._id} 
              className={`memory-card ${isSelectMode && selectedMemories.includes(memory._id) ? 'selected' : ''}`}
              onClick={() => handleMemoryClick(memory)}
            >
              <div className="memory-image">
                {memory.images && memory.images.length > 0 ? (
                  <img 
                    src={memory.images[0]} 
                    alt={memory.description || "Travel memory"} 
                    onError={(e) => {
                      console.error("Failed to load image:", memory.images[0]);
                      e.target.onerror = null;
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                ) : (
                  <img 
                    src="/placeholder-image.jpg" 
                    alt="Placeholder" 
                  />
                )}
                {memory.images && memory.images.length > 1 && (
                  <div className="multiple-images-indicator">+{memory.images.length - 1}</div>
                )}
                <div className="memory-actions">
                  {isSelectMode ? (
                    <button 
                      className={`select-button ${selectedMemories.includes(memory._id) ? 'selected' : ''}`}
                      onClick={(e) => toggleMemorySelection(memory._id, e)}
                    >
                      {selectedMemories.includes(memory._id) ? <FiCheck /> : null}
                    </button>
                  ) : (
                    <>
                      <button 
                        className={`pin-button ${memory.pinned ? 'pinned' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePin(memory._id);
                        }}
                        title={memory.pinned ? "Unpin memory" : "Pin memory"}
                      >
                        <FiStar />
                      </button>
                      <button 
                        className="delete-button"
                        onClick={(e) => handleDeleteMemory(memory._id, e)}
                        title="Delete memory"
                        disabled={isDeleting}
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="memory-details">
                {memory.description && <p>{memory.description}</p>}
                {memory.location && (
                  <p className="memory-location">
                    <FiMapPin /> {memory.location}
                  </p>
                )}
                <p className="memory-date">
                  {new Date(memory.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {showMemoryModal && selectedMemory && (
        <MemoryModal 
          memory={selectedMemory} 
          onClose={() => setShowMemoryModal(false)} 
        />
      )}
    </div>
  );
};

export default Memories;

