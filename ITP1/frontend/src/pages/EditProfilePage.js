import '../styles/Profile.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const defaultProfilePicUrl = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const ProfilePage = () => {
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState({ name: false, address: false, phone: false, profilePic: false });
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', profilePic: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [navigate]);

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
    if (!token) return;

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

  const uploadImageToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'vkaura');

    try {
      setUploading(true);
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dsi3mcpie/upload',
        data
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
      setFormData((prev) => ({ ...prev, profilePic: url }));
      setMessage('✅ Image uploaded. Please confirm to update profile.');
    }
  };

  const handleUpdate = (field) => {
    setMessage('');
    setError('');

    if (field === 'phone') {
      const phoneRegex = /^0\d{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        setError('❌ Invalid phone number. Must be 10 digits and start with 0.');
        return;
      }
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .put(
        'http://localhost:5000/api/users/profile',
        { [field]: formData[field] },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setMessage(`✅ ${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully.`);
        fetchProfile();
        // Reset edit state and clear form data for that field
        setIsEditing((prev) => ({ ...prev, [field]: false }));
        setFormData((prev) => ({ ...prev, [field]: '' }));
      })
      .catch(() => {
        setError(`❌ Error updating ${field}`);
      });
  };

  const handleRemoveProfilePic = () => {
    const token = localStorage.getItem('token');
    axios
      .put(
        'http://localhost:5000/api/users/profile',
        { profilePic: defaultProfilePicUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setMessage('✅ Profile picture removed.');
        fetchProfile();
        setIsEditing((prev) => ({ ...prev, profilePic: false }));
        setFormData((prev) => ({ ...prev, profilePic: '' }));
      })
      .catch(() => {
        setError('❌ Error removing profile picture.');
      });
  };

  const getCroppedImageUrl = (url) => url.replace('/upload/', '/upload/c_fill,w_150,h_150,g_face/');

  const handleBackToProfile = () => {
    if (!user || !user.isAdmin) {
      navigate('/view-profile');
    } else if (user.isAdmin) {
      navigate('/admin/view-profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="profile-info">
        <div className="profile-pic-section">
          <img
            src={user.profilePic ? getCroppedImageUrl(user.profilePic) : defaultProfilePicUrl}
            alt="Profile"
            className="profile-pic"
            style={{ width: '150px', height: '150px', borderRadius: '50%' }}
          />
          {isEditing.profilePic ? (
            <div>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              {uploading && <p>Uploading image...</p>}
              {formData.profilePic && formData.profilePic !== user.profilePic && (
                <button onClick={() => handleUpdate('profilePic')}>
                  Confirm
                </button>
              )}
              <button
                onClick={() => {
                  setIsEditing((prev) => ({ ...prev, profilePic: false }));
                  setFormData((prev) => ({ ...prev, profilePic: '' }));
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div>
              <button onClick={() => setIsEditing((prev) => ({ ...prev, profilePic: true }))}>
                Change Profile Pic
              </button>
              {user.profilePic && user.profilePic !== defaultProfilePicUrl && (
                <button onClick={handleRemoveProfilePic}>Remove</button>
              )}
            </div>
          )}
        </div>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <p>
          <strong>Name:</strong> {user.name}
        </p>
        {isEditing.name ? (
          <div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            {formData.name.trim() !== '' && formData.name !== user.name && (
              <button onClick={() => handleUpdate('name')}>Confirm</button>
            )}
            <button
              onClick={() => {
                setIsEditing((prev) => ({ ...prev, name: false }));
                setFormData((prev) => ({ ...prev, name: '' }));
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setFormData((prev) => ({ ...prev, name: user.name || '' }));
              setIsEditing((prev) => ({ ...prev, name: true }));
            }}
          >
            Change Name
          </button>
        )}

     
        <p>
          <strong>Address:</strong> {user.address}
        </p>
        {isEditing.address ? (
          <div>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />
            {formData.address.trim() !== '' && formData.address !== user.address && (
              <button onClick={() => handleUpdate('address')}>Confirm</button>
            )}
            <button
              onClick={() => {
                setIsEditing((prev) => ({ ...prev, address: false }));
                setFormData((prev) => ({ ...prev, address: '' }));
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setFormData((prev) => ({ ...prev, address: user.address || '' }));
              setIsEditing((prev) => ({ ...prev, address: true }));
            }}
          >
            Change Address
          </button>
        )}

        <p>
          <strong>Phone:</strong> {user.phone}
        </p>
        {isEditing.phone ? (
          <div>
           <input
  type="tel"
  value={formData.phone}
  onChange={(e) =>
    setFormData((prev) => ({ ...prev, phone: e.target.value }))
  }
  pattern="\d*"
  inputMode="numeric"
  onKeyDown={(e) => {
    if (!/^\d$/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  }}
/>

            {formData.phone.trim() !== '' && formData.phone !== user.phone && (
              <button onClick={() => handleUpdate('phone')}>Confirm</button>
            )}
            <button
              onClick={() => {
                setIsEditing((prev) => ({ ...prev, phone: false }));
                setFormData((prev) => ({ ...prev, phone: '' }));
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setFormData((prev) => ({ ...prev, phone: user.phone || '' }));
              setIsEditing((prev) => ({ ...prev, phone: true }));
            }}
          >
            Change Phone
          </button>
        )}
      </div>

      <button className="profile-btn back-btn" onClick={handleBackToProfile}>
        ⬅ Back to Profile
      </button>
    </div>
  );
};

export default ProfilePage;
