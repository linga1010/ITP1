import { useState, useEffect } from "react";
import { getFeedbacks, deleteFeedback } from "../api"; // Assuming api.js is set up properly
import FeedbackItem from "../components/FeedbackItem"; // Adjust import path if necessary

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const data = await getFeedbacks();
      setFeedbacks(data); // Set the fetched feedback data into state
    };

    fetchFeedbacks(); // Fetch feedback data
  }, []);

  const handleDelete = async (id) => {
    const result = await deleteFeedback(id); // Call the API to delete feedback
    if (result) {
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.filter((feedback) => feedback._id !== id)
      );
    }
  };

  return (
    <div className="admin-feedback-page">
      <h2>Admin Feedbacks</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        feedbacks.map((feedback) => (
          <FeedbackItem
            key={feedback._id}
            feedback={feedback}
            onDelete={handleDelete} // Admin can only delete feedback
            isAdmin={true} // Pass isAdmin as true for the admin page
          />
        ))
      )}
    </div>
  );
};

export default AdminFeedbackPage;
