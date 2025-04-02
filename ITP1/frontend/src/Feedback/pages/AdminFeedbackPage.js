import { useState, useEffect } from "react";
import { getFeedbacks, deleteFeedback } from "../api";
import FeedbackItem from "../components/FeedbackItem";

const AdminFeedbackPage = () => {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const data = await getFeedbacks();
      setFeedbacks(data);
    };
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id) => {
    const result = await deleteFeedback(id);
    if (result) {
      setFeedbacks(feedbacks.filter((feedback) => feedback._id !== id));
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
            onDelete={handleDelete}
            isAdmin={true}
          />
        ))
      )}
    </div>
  );
};

export default AdminFeedbackPage;
