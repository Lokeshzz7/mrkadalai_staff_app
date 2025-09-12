import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import { apiRequest } from '../utils/api';

const Settings = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    designation: '',
    phone: '',
    imageUrl: '',
    outlet: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    designation: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiRequest('/staff/profile/');
      setUser(response.profile);
      setEditForm({
        name: response.profile.name,
        phone: response.profile.phone || '',
        designation: response.profile.designation || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      alert('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form when canceling edit
      setEditForm({
        name: user.name,
        phone: user.phone || '',
        designation: user.designation || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    try {
      setUpdating(true);
      const response = await apiRequest('/staff/profile/', {
        method: 'PUT',
        body: editForm
      });
      
      setUser(response.profile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      // Use fetch directly for file upload instead of apiRequest
      const token = localStorage.getItem("token");
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500/api';
      
      const response = await fetch(`${API_BASE_URL}/staff/profile/upload-image/`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || response.statusText);
      }

      setUser(prev => ({
        ...prev,
        imageUrl: data.imageUrl
      }));
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async () => {
    if (!user.imageUrl) {
      alert('No image to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

    try {
      setUploading(true);
      await apiRequest('/staff/profile/delete-image/', {
        method: 'DELETE'
      });

      setUser(prev => ({
        ...prev,
        imageUrl: null
      }));
      alert('Image deleted successfully!');
    } catch (error) {
      console.error('Failed to delete image:', error);
      alert('Failed to delete image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      {/* Profile Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800">Profile</h3>

        {/* Profile Picture Row */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full border border-gray-400 overflow-hidden bg-gray-100">
            {user.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="primary" 
              disabled={uploading}
              onClick={() => document.getElementById('image-upload').click()}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
            {user.imageUrl && (
              <Button 
                variant="danger" 
                onClick={handleImageDelete}
                disabled={uploading}
              >
                {uploading ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </div>

        {/* Information Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Name and Email */}
            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                type="text"
                name="name"
                value={isEditing ? editForm.name : user.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-2 border border-gray-300 rounded ${
                  isEditing ? 'bg-white' : 'bg-gray-100'
                }`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
              />
            </div>

            {/* Designation and Phone */}
            <div>
              <label className="text-sm text-gray-600">Designation</label>
              <input
                type="text"
                name="designation"
                value={isEditing ? editForm.designation : user.designation}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-2 border border-gray-300 rounded ${
                  isEditing ? 'bg-white' : 'bg-gray-100'
                }`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <input
                type="text"
                name="phone"
                value={isEditing ? editForm.phone : (user.phone || '')}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full p-2 border border-gray-300 rounded ${
                  isEditing ? 'bg-white' : 'bg-gray-100'
                }`}
              />
            </div>
          </div>

          {/* Outlet Information (Read-only) */}
          {user.outlet && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-600">Outlet</label>
                <input
                  type="text"
                  value={user.outlet.name || ''}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Outlet Address</label>
                <input
                  type="text"
                  value={user.outlet.address || ''}
                  disabled
                  className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-x-4">
          {!isEditing ? (
            <Button variant="secondary" onClick={handleEditToggle}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button 
                variant="primary" 
                onClick={handleSaveChanges}
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleEditToggle}
                disabled={updating}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;