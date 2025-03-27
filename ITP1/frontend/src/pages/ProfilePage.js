// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

const defaultProfilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingProfilePic, setIsEditingProfilePic] = useState(false);

  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProfilePic, setNewProfilePic] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const fetchProfile = () => {
    const token = localStorage.getItem('token');
    axios
      .get('http://localhost:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUser(response.data);
      })
      .catch(() => {
        setError('❌ Error fetching profile');
      });
  };

  // Upload file to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'vkaura'); // Replace with your unsigned preset
    try {
      setUploading(true);
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dsi3mcpie/upload', // Replace with your cloud name
        formData
      );
      setUploading(false);
      return response.data.secure_url;
    } catch (err) {
      setUploading(false);
      setError('❌ Image upload failed.');
      return null;
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const url = await uploadImageToCloudinary(file);
    if (url) {
      setNewProfilePic(url);
      setMessage('Image uploaded. Please confirm to update profile.');
    }
  };

  const handleUpdate = (field) => {
    setMessage('');
    setError('');

    // Validate phone number if updating phone
    if (field === 'phone') {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(newPhone)) {
        setError('❌ Invalid phone number format, Phone must be 10 digits and start with 0');
        return;
      }
    }

    const token = localStorage.getItem('token');
    const updatedData = {
      [field]:
        field === 'name'
          ? newName
          : field === 'address'
          ? newAddress
          : field === 'phone'
          ? newPhone
          : field === 'profilePic'
          ? newProfilePic
          : '',
    };

    axios
      .put('http://localhost:5000/api/users/profile', updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setMessage(`✅ ${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
        fetchProfile();
        if (field === 'name') setIsEditingName(false);
        if (field === 'address') setIsEditingAddress(false);
        if (field === 'phone') setIsEditingPhone(false);
        if (field === 'profilePic') setIsEditingProfilePic(false);
      })
      .catch(() => {
        setError(`❌ Error updating ${field}`);
      });
  };

  // Remove profile picture by sending the default image URL directly
  const handleRemoveProfilePic = () => {
    const token = localStorage.getItem('token');
    axios
      .put(
        'http://localhost:5000/api/users/profile',
        { profilePic: defaultProfilePicUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setMessage("✅ ProfilePic updated successfully");
        fetchProfile();
        setIsEditingProfilePic(false);
      })
      .catch(() => {
        setError("❌ Error updating profilePic");
      });
  };

  // Prepare a cropped image URL using Cloudinary transformations
  const getCroppedImageUrl = (url) => {
    return url.replace('/upload/', '/upload/c_fill,w_150,h_150,g_face/');
  };

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="profile-info">
        {/* Display Profile Picture */}
        <div className="profile-pic-section">
          <img
            src={
              user.profilePic
                ? getCroppedImageUrl(user.profilePic)
                : defaultProfilePicUrl
            }
            style={{ width: '150px', height: '150px', borderRadius: '50%' }}
            alt="Profile"
            className="profile-pic"
          />
          {isEditingProfilePic ? (
            <div>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {uploading && <p>Uploading image...</p>}
              {newProfilePic && (
                <div>
                  <button onClick={() => handleUpdate('profilePic')}>Confirm</button>
                  <button onClick={() => setIsEditingProfilePic(false)}>Cancel</button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  setIsEditingProfilePic(true);
                  setNewProfilePic(user.profilePic || defaultProfilePicUrl);
                }}
              >
                Change Profile Pic
              </button>
              {user.profilePic && user.profilePic !== defaultProfilePicUrl && (
                <button onClick={handleRemoveProfilePic}>Remove Profile Pic</button>
              )}
            </div>
          )}
        </div>

        <p>
          <strong>Name:</strong> {user.name}
        </p>
        {isEditingName ? (
          <div>
            <input
              type="text"
              placeholder="New Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={() => handleUpdate('name')}>Confirm</button>
            <button onClick={() => setIsEditingName(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setNewName(user.name); setIsEditingName(true); }}>Change Name</button>
        )}

        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Address:</strong> {user.address}
        </p>
        {isEditingAddress ? (
          <div>
            <input
              type="text"
              placeholder="New Address"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
            />
            <button onClick={() => handleUpdate('address')}>Confirm</button>
            <button onClick={() => setIsEditingAddress(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setNewAddress(user.address); setIsEditingAddress(true); }}>Change Address</button>
        )}

        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
        {isEditingPhone ? (
          <div>
            <input
              type="number"
              placeholder="New Phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <button onClick={() => handleUpdate('phone')}>Confirm</button>
            <button onClick={() => setIsEditingPhone(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setNewPhone(user.phone); setIsEditingPhone(true); }}>Change Phone</button>
        )}
      </div>
      <button className="profile-btn back-btn" onClick={() => navigate('/view-profile')}>
        ⬅ Back to Profile
      </button>
    </div>
  );
};

export default ProfilePage;
