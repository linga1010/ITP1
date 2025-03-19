import { useState, useEffect } from "react";
import { getFeedbacks, addFeedback, updateFeedback, deleteFeedback } from "../api";
import FeedbackItem from "../components/FeedbackItem";
import FeedbackForm from "../components/FeedbackForm";
import './FeedbackPage.css';

const FeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [editing, setEditing] = useState(null); // To store feedback being edited
  const [isAdmin, setIsAdmin] = useState(false); // Set this based on the user's role, for now assuming it's false

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const data = await getFeedbacks();
      setFeedbacks(data); // Set the fetched feedback data into state
    };

    fetchFeedbacks(); // Fetch feedback data on page load

    // Simulate a user check (for demonstration purposes)
    // Set isAdmin to true if the logged-in user is an admin
    setIsAdmin(false); // Set to true if the user is an admin
  }, []);

  const handleAddFeedback = async (feedback) => {
    const newFeedback = await addFeedback(feedback); // Send POST request to add feedback
    setFeedbacks((prevFeedbacks) => [...prevFeedbacks, newFeedback]); // Update state with the new feedback
  };

  const handleEditFeedback = async (id, updatedFeedback) => {
    const updatedData = await updateFeedback(id, updatedFeedback); // Update feedback in the backend
    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.map((feedback) =>
        feedback._id === id ? updatedData : feedback
      )
    ); // Update the feedback in the state
    setEditing(null); // Clear editing state after saving
  };

  const handleDelete = async (id) => {
    const result = await deleteFeedback(id); // Delete feedback from the backend
    if (result) {
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.filter((feedback) => feedback._id !== id)
      ); // Update the state to remove deleted feedback
    }
  };

  return (
    <div>
      <h2>Give Your Feedback</h2>
      <FeedbackForm editFeedback={editing} setEditing={setEditing} onAdd={handleAddFeedback} onEdit={handleEditFeedback} />
      <h3>Your Feedbacks</h3>
      {feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        feedbacks.map((feedback) => (
          <FeedbackItem
            key={feedback._id}
            feedback={feedback}
            onEdit={setEditing} // Pass setEditing to populate feedback for editing
            onDelete={handleDelete}
            isAdmin={isAdmin} // Pass isAdmin prop to conditionally show the "Edit" button
          />
        ))
      )}
    </div>
  );
};

export default FeedbackPage;
