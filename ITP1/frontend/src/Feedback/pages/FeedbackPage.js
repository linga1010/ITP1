import { useState, useEffect } from "react";
import { getFeedbacks, addFeedback, updateFeedback, deleteFeedback } from "../api";
import FeedbackForm from "../components/FeedbackForm";
import FeedbackItem from "../components/FeedbackItem";

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const data = await getFeedbacks();
      setFeedbacks(data);
    };
    fetchFeedbacks();
    setIsAdmin(false);
  }, []);

  const handleAddFeedback = async (formData) => {
    const newFeedback = await addFeedback(formData);
    if (newFeedback) {
      setFeedbacks([...feedbacks, newFeedback]);
    }
  };

  const handleEditFeedback = async (id, formData) => {
    const updatedFeedback = await updateFeedback(id, formData);
    if (updatedFeedback) {
      setFeedbacks(
        feedbacks.map((feedback) =>
          feedback._id === id ? updatedFeedback : feedback
        )
      );
    }
    setEditing(null);
  };

  const handleDeleteFeedback = async (id) => {
    const result = await deleteFeedback(id);
    if (result) {
      setFeedbacks(feedbacks.filter((feedback) => feedback._id !== id));
    }
  };

  const toggleFeedbackVisibility = () => {
    setIsFeedbackVisible(!isFeedbackVisible);
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f4f4f4',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      minHeight: '100vh',
      textAlign: 'center',
    }}>
      <div style={{
        width: '80%',
        maxWidth: '800px',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        margin: '20px auto',
      }}>
        <h2 style={{
          fontSize: '24px',
          marginBottom: '20px',
          color: '#333',
        }}>Give Your Feedback</h2>
        <FeedbackForm
          editFeedback={editing}
          setEditing={setEditing}
          onAdd={handleAddFeedback}
          onEdit={handleEditFeedback}
        />
        <button
          onClick={toggleFeedbackVisibility}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            marginTop: '10px',
          }}
        >
          {isFeedbackVisible ? "Hide Feedbacks" : "View Feedbacks"}
        </button>

        {isFeedbackVisible && (
          <>
            <h3 style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: '#333',
            }}>Your Feedbacks</h3>
            {feedbacks.length === 0 ? (
              <p>No feedback available.</p>
            ) : (
              feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <FeedbackItem
                    feedback={feedback}
                    onEdit={setEditing}
                    onDelete={handleDeleteFeedback}
                    isAdmin={isAdmin}
                  />
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
