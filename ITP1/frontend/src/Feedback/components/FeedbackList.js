import { useState, useEffect } from "react";
import { getFeedbacks, deleteFeedback } from "../api"; // Make sure your API functions are set up
import FeedbackItem from "./FeedbackItem";

const FeedbackList = ({ setEditing }) => {
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
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.filter((feedback) => feedback._id !== id)
      );
    }
  };

  return (
    <div>
      {feedbacks.length === 0 ? (
        <p>No feedback available.</p>
      ) : (
        feedbacks.map((feedback) => (
          <FeedbackItem
            key={feedback._id}
            feedback={feedback}
            onDelete={handleDelete}
            onEdit={setEditing}
          />
        ))
      )}
    </div>
  );
};

export default FeedbackList;
