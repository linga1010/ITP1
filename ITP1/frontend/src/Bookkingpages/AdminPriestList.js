import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Adminnaviagtion from "../Component/Adminnavigation";

const AdminPriestList = () => {
  const [priests, setPriests] = useState([]);
  const [editingPriest, setEditingPriest] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dailyCharge: '',
    photoFile: null,
    unavailableDates: []
  });

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/priests');
      const filteredPriests = res.data.map(priest => ({
        ...priest,
        unavailableDates: priest.unavailableDates.filter(date => new Date(date) >= new Date())
      }));
      setPriests(filteredPriests);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (priest) => {
    setEditingPriest(priest._id);
    setFormData({
      name: priest.name,
      dailyCharge: priest.dailyCharge,
      photoFile: null,
      unavailableDates: priest.unavailableDates ? priest.unavailableDates.map(date => new Date(date)) : []
    });
  };

  const handleDateChange = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to midnight

    if (date < today) {
      alert("You cannot select dates in the past.");
      return;
    }

    const exists = formData.unavailableDates.some(d => d.getTime() === date.getTime());
    if (exists) {
      setFormData({
        ...formData,
        unavailableDates: formData.unavailableDates.filter(d => d.getTime() !== date.getTime())
      });
    } else {
      setFormData({
        ...formData,
        unavailableDates: [...formData.unavailableDates, date]
      });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photoFile: e.target.files[0] });
  };

  const handleUpdate = async (id) => {
    const updateData = new FormData();
    updateData.append('name', formData.name);
    updateData.append('dailyCharge', formData.dailyCharge);

    if (formData.photoFile) {
      updateData.append('photoFile', formData.photoFile);
    }

    updateData.append('unavailableDates', JSON.stringify(formData.unavailableDates));

    try {
      await axios.put(`http://localhost:5000/api/priests/${id}`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Priest updated successfully');
      setEditingPriest(null);
      fetchPriests();
    } catch (error) {
      console.error(error);
      alert('Error updating priest');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/priests/${id}`);
      alert('Priest deleted successfully');
      fetchPriests();
    } catch (error) {
      console.error(error);
      alert('Error deleting priest');
    }
  };

  const photoPreview = formData.photoFile ? URL.createObjectURL(formData.photoFile) : null;

  return (
    <div className="admin-dashboard-container">
      <Adminnaviagtion />
      <div className="main-content">
        <h2>Priest List</h2>
        {priests.map(priest => (
          <div key={priest._id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            {editingPriest === priest._id ? (
              <div>
                <div>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label>Daily Charge:</label>
                  <input
                    type="number"
                    value={formData.dailyCharge}
                    onChange={e => setFormData({ ...formData, dailyCharge: e.target.value })}
                  />
                </div>
                <div>
                  <label>Change Photo:</label>
                  <input type="file" onChange={handleFileChange} />
                  {photoPreview && <img src={photoPreview} alt="Photo Preview" className="photo-preview" />}
                  {!photoPreview && priest.photo && (
                    <div>
                      <p>Current Photo:</p>
                      <img src={`http://localhost:5000${priest.photo}`} alt="Current Photo" width="100" />
                    </div>
                  )}
                </div>
                <div>
                  <label>Unavailable Dates:</label>
                  <DatePicker
                    selected={null}
                    onChange={handleDateChange}
                    inline
                    highlightDates={formData.unavailableDates}
                    dayClassName={date =>
                      formData.unavailableDates.some(d => d.getTime() === date.getTime()) ? 'selected-date' : ''
                    }
                    minDate={new Date()} // Disable past dates, including today
                  />
                </div>
                <button onClick={() => handleUpdate(priest._id)}>Save</button>
                <button onClick={() => setEditingPriest(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <h3>{priest.name}</h3>
                <img src={`http://localhost:5000${priest.photo}`} alt={priest.name} width="100" />
                <p>Daily Charge: ${priest.dailyCharge}</p>
                <p>Unavailable Dates: {priest.unavailableDates.map(date => new Date(date).toLocaleDateString()).join(', ')}</p>
                <button onClick={() => handleEditClick(priest)}>Edit</button>
                <button onClick={() => handleDelete(priest._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
        <style>
          {`
            .selected-date {
              background-color: green !important;
              color: white !important;
            }
            .photo-preview {
              margin-top: 10px;
              max-width: 100%;
              height: auto;
              border: 1px solid #ccc;
              border-radius: 5px;
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default AdminPriestList;
