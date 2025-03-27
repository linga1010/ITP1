import { useState, useEffect } from "react";
import { getFeedbacks, addFeedback, updateFeedback, deleteFeedback } from "../api";
import FeedbackItem from "../components/FeedbackItem";
import FeedbackForm from "../components/FeedbackForm";
import "./FeedbackPage.css"; // Import the updated CSS file

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [editing, setEditing] = useState(null); // To store feedback being edited
  const [isAdmin, setIsAdmin] = useState(false); // Set this based on the user's role

  useEffect(() => {
    document.title = "Feedback Page";
    const fetchFeedbacks = async () => {
      try {
        const data = await getFeedbacks();
        setFeedbacks(data); // Set the fetched feedback data into state
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchFeedbacks(); // Fetch feedback data on page load
  }, []);

  const handleAddFeedback = async (feedback) => {
    try {
      const newFeedback = await addFeedback(feedback);
      setFeedbacks((prevFeedbacks) => [...prevFeedbacks, newFeedback]);
    } catch (error) {
      console.error("Error adding feedback:", error);
    }
  };

  const handleEditFeedback = async (id, updatedFeedback) => {
    try {
      const updatedData = await updateFeedback(id, updatedFeedback);
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.map((feedback) => (feedback._id === id ? updatedData : feedback))
      );
      setEditing(null);
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteFeedback(id);
      if (result) {
        setFeedbacks((prevFeedbacks) => prevFeedbacks.filter((feedback) => feedback._id !== id));
      }
    } catch (error) {
      console.error("Error deleting feedback:", error);
    }
  };

  return (
    <div className="feedback-page">
      <h2>Give Your Feedback</h2>
      <FeedbackForm
        editFeedback={editing}
        setEditing={setEditing}
        onAdd={handleAddFeedback}
        onEdit={handleEditFeedback}
      />
      <h3>Your Feedbacks</h3>
      {feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        feedbacks.map((feedback) => (
          <FeedbackItem
            key={feedback._id}
            feedback={feedback}
            onEdit={setEditing}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        ))
      )}
    </div>
  );
};

export default FeedbackPage;
