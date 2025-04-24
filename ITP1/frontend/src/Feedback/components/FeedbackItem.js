import React from 'react';

const FeedbackItem = ({ feedback, onEdit, onDelete, isAdmin }) => {
  const handleDelete = (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this feedback?");
    
    // If user confirms, delete feedback
    if (isConfirmed) {
      onDelete(id);
    }
  };

  const handleEdit = (feedback) => {
    // Scroll to the top when edit button is clicked
    window.scrollTo(0, 0);
    onEdit(feedback);
  };

  return (
    <div style={{
      marginBottom: '20px',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      backgroundColor: '#f9f9f9',
      textAlign: 'center',
    }}>
      <div style={{ marginBottom: '10px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: feedback.rating >= star ? "gold" : "gray" }}>
            &#9733;
          </span>
        ))}
      </div>
      <p style={{ fontSize: '14px', marginBottom: '10px' }}>{feedback.comment}</p>
      
      {/* Display uploaded photo if available */}
      {feedback.photo && (
        <img
          src={`http://localhost:5000/uploads/${feedback.photo}`}
          alt="Feedback"
          style={{
            maxWidth: '200px',
            display: 'block',
            margin: '10px auto',
            borderRadius: '5px',
          }}
        />
      )}

      {/* Edit and Delete buttons, centered */}
      {!isAdmin && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '10px',
        }}>
          <button
            onClick={() => handleEdit(feedback)}
            style={{
              width: '120px',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(feedback._id)}
            style={{
              width: '120px',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackItem;
