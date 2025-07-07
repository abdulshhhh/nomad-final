import { useState } from 'react';
import {
  FiUser,
  FiGlobe,
  FiLock,
  FiX,
  FiCamera,
  FiCheck,
  FiPlus,
  FiTrash2,
  FiSave,
  FiShield,
  FiBell,
} from 'react-icons/fi';
import { BACKEND_URL } from '../config';

/**
 * ProfileEdit component
 * Allows editing of user profile information and saves updates via backend API.
 * @param {Object} props
 * @param {Object} props.profileData – initial profile data to populate the form
 * @param {Function} props.onClose – callback to close the modal
 * @param {Function} props.onOTPVerification – callback for OTP flows (phone/password)
 * @param {Function} props.onProfileUpdated - callback when profile is successfully updated
 */
export default function ProfileEdit({ profileData, onClose, onOTPVerification, onProfileUpdated }) {
  // ────────────────────────────────────────────────────────────────────────────────
  // Local state
  // ────────────────────────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState({
    fullName: profileData.fullName || '',
    bio: profileData.bio || '',
    location: profileData.location || '',
    phone: profileData.phone || '',
    gender: profileData.gender || 'prefer not to say',
    travelCategories: profileData.travelCategories || [],
    languages: profileData.languages || [],
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(profileData.avatar || '/assets/images/default-avatar.webp');
  const [isSaving, setIsSaving] = useState(false);

  // ────────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (ev) => {
        console.log("Image preview created");
        setPreviewImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      travelCategories: prev.travelCategories.includes(category)
        ? prev.travelCategories.filter((c) => c !== category)
        : [...prev.travelCategories, category],
    }));
  };

  const handleLanguageAdd = (language) => {
    if (language && !formData.languages.includes(language)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, language],
      }));
    }
  };

  const handleLanguageRemove = (language) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== language),
    }));
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    onOTPVerification('password');
  };

  const handlePhoneChange = () => onOTPVerification('phone');

  /**
   * Save profile data to backend.
   * Uses FormData so we can send multipart/form-data with image + JSON values.
   */
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Basic validation
      if (!formData.fullName.trim()) {
        alert('Please enter your full name');
        setIsSaving(false);
        return;
      }
      
      const form = new FormData();
      form.append('fullName', formData.fullName);
      form.append('bio', formData.bio);
      form.append('location', formData.location);
      form.append('phone', formData.phone);
      form.append('gender', formData.gender);
      form.append('travelCategories', JSON.stringify(formData.travelCategories));
      form.append('languages', JSON.stringify(formData.languages));
      
      if (selectedImage) {
        form.append('avatar', selectedImage);
      }

      // Get the auth token
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        alert('You are not logged in. Please log in again.');
        // Redirect to login page or handle accordingly
        return;
      }
      
      console.log("Using token for profile update:", token.substring(0, 10) + "...");
      
      // Use the full URL with BACKEND_URL
      const response = await fetch(`${BACKEND_URL}/api/profile/update`, {
        method: 'POST',
        body: form,
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        
        // Handle token expiration specifically
        if (response.status === 401) {
          // Clear invalid token
          localStorage.removeItem('authToken');
          alert('Your session has expired. Please log in again.');
          // You might want to redirect to login page here
          return;
        }
        
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Profile update successful:', result);
      
      // Create a complete updated profile object
      const updatedProfile = {
        ...formData,
        avatar: previewImage, // Use the preview image as the avatar
        userId: result.profile.userId, // Ensure userId is included
        id: result.profile._id || result.profile.id // Ensure id is included
      };
      
      // Update the parent component with new profile data
      if (typeof onProfileUpdated === 'function') {
        onProfileUpdated(updatedProfile);
      }
      
      // Close the edit form
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const availableCategories = [
    'Adventure', 'Culture', 'Food', 'Photography', 'Nature', 'Beach', 'Mountains', 
    'City', 'History', 'Art', 'Music', 'Sports', 'Wildlife', 'Luxury', 'Budget'
  ];

  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 
    'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi', 'Dutch', 'Swedish'
  ];

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: <FiUser className="w-5 h-5" /> },
    { id: 'travel', label: 'Travel Preferences', icon: <FiGlobe className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <FiLock className="w-5 h-5" /> },
  ];

  // ────────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-70 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-[#f8f4e3] to-[#f0d9b5] rounded-2xl w-full max-w-4xl h-[90vh] sm:h-[80vh] border border-gray-200 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar – desktop */}
        <div className="hidden md:block md:w-64 bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] border-r border-gray-200 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Edit Profile</h3>
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 w-full p-3 rounded-lg font-semibold transition-colors ${
                  activeSection === section.id
                    ? 'bg-[#f8d56b]/20 text-[#f8d56b]'
                    : 'text-gray-300 hover:text-[#f8d56b] hover:bg-[#f8d56b]/10'
                }`}
              >
                {section.icon}
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex md:hidden bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a] border-b border-gray-200 p-3 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 p-2 rounded-lg font-semibold transition-colors whitespace-nowrap mr-2 ${
                activeSection === section.id
                  ? 'bg-[#f8d56b]/20 text-[#f8d56b]'
                  : 'text-gray-300 hover:text-[#f8d56b] hover:bg-[#f8d56b]/10'
              }`}
            >
              {section.icon}
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#2c5e4a] to-[#1a3a2a]">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-2xl font-bold text-white">
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
              <button onClick={onClose} className="text-gray-300 hover:text-white text-xl sm:text-2xl font-bold">
                <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {/* ───────────────────────────────────────────────────────────────────────*/}
            {/* BASIC SECTION */}
            {/* ───────────────────────────────────────────────────────────────────────*/}
            {activeSection === 'basic' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Profile picture */}
                <div className="bg-yellow-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Profile Picture</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-yellow-200 mx-auto sm:mx-0"
                    />
                    <div className="text-center sm:text-left">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="profile-image"
                      />
                      <label
                        htmlFor="profile-image"
                        className="inline-flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-4 py-2 rounded-lg cursor-pointer font-semibold transition-colors text-sm"
                      >
                        <FiCamera className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                        Change Photo
                      </label>
                      <p className="text-gray-500 text-xs sm:text-sm mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Basic info */}
                <div className="bg-amber-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Basic Information</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Full name */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm sm:text-base"
                        required
                      />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm sm:text-base"
                      ></textarea>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm sm:text-base"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Phone Number</label>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm sm:text-base"
                        />
                        <button
                          onClick={handlePhoneChange}
                          className="inline-flex items-center justify-center bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-colors text-sm whitespace-nowrap"
                        >
                          <FiCheck className="mr-1 sm:mr-2 w-4 h-4" />
                          Verify
                        </button>
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm sm:text-base"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────────────────*/}
            {/* TRAVEL PREFERENCES SECTION */}
            {/* ───────────────────────────────────────────────────────────────────────*/}
            {activeSection === 'travel' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Travel categories */}
                <div className="bg-yellow-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Travel Categories</h4>
                  <p className="text-gray-600 text-sm mb-4">Select the types of travel you enjoy most.</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {availableCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                          formData.travelCategories.includes(category)
                            ? 'bg-yellow-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="bg-amber-50 p-4 sm:p-6 rounded-xl border border-gray-200">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Languages</h4>
                  <p className="text-gray-600 text-sm mb-4">Add languages you speak.</p>
                  
                  {/* Selected languages */}
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Your languages:</h5>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.length > 0 ? (
                        formData.languages.map((language) => (
                          <div
                            key={language}
                            className="flex items-center bg-white px-3 py-1 rounded-lg border border-gray-300"
                          >
                            <span className="text-gray-800 text-sm font-medium mr-1">{language}</span>
                            <button
                              onClick={() => handleLanguageRemove(language)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">No languages added yet</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Common languages */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Add a language:</h5>
                    <div className="flex flex-wrap gap-2">
                      {commonLanguages
                        .filter((language) => !formData.languages.includes(language))
                        .map((language) => (
                          <button
                            key={language}
                            onClick={() => handleLanguageAdd(language)}
                            className="flex items-center justify-center p-2 bg-white text-gray-700 rounded-lg hover:bg-yellow-50 hover:text-yellow-700 transition-colors text-xs sm:text-sm font-medium border border-gray-300"
                          >
                            <FiPlus className="mr-1 w-3 h-3" />
                            {language}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────────────────*/}
            {/* SECURITY SECTION */}
            {/* ───────────────────────────────────────────────────────────────────────*/}
            {activeSection === 'security' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Change password */}
                <div className="bg-yellow-50 p-4 sm:p-6 rounded-xl border">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Change Password</h4>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-medium text-sm sm:text-base"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      className="inline-flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors text-xs sm:text-sm"
                    >
                      <FiLock className="mr-1 sm:mr-2 w-4 h-4" /> Change Password (OTP Required)
                    </button>
                  </div>
                </div>

                {/* Account security */}
                <div className="bg-amber-50 p-4 sm:p-6 rounded-xl border">
                  <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Account Security</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {/* 2FA */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                      <div>
                        <p className="text-gray-700 font-semibold text-sm sm:text-base">Two-Factor Authentication</p>
                        <p className="text-gray-500 text-xs sm:text-sm">Add extra security to your account</p>
                      </div>
                      <button className="inline-flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm self-start sm:self-center">
                        <FiShield className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Enable
                      </button>
                    </div>
                    {/* Login notifications */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                      <div>
                        <p className="text-gray-700 font-semibold text-sm sm:text-base">Login Notifications</p>
                        <p className="text-gray-500 text-xs sm:text-sm">Get notified of new logins</p>
                      </div>
                      <button className="inline-flex items-center bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold transition-colors text-xs sm:text-sm self-start sm:self-center">
                        <FiBell className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Enabled
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-6 border-t border-gray-200 bg-white flex justify-end space-x-2 sm:space-x-4">
            <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors text-xs sm:text-sm">
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="inline-flex items-center bg-yellow-600 hover:bg-yellow-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              {isSaving ? 'Saving...' : <><FiSave className="mr-1 sm:mr-2 w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
