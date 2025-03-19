import { useState, useEffect } from "react";

const FeedbackForm = ({ editFeedback, setEditing, onAdd, onEdit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (editFeedback) {
      setRating(editFeedback.rating); // Set initial rating if editing
      setComment(editFeedback.comment); // Set initial comment if editing
    }
  }, [editFeedback]); // Trigger effect when editFeedback changes

  const handleSubmit = (e) => {
    e.preventDefault();

    const feedback = { rating, comment };

    if (editFeedback) {
      // If we're editing, pass the id and updated data to onEdit
      onEdit(editFeedback._id, feedback);
    } else {
      // Otherwise, add new feedback
      onAdd(feedback);
    }

    // Clear the form after submitting
    setRating(0);
    setComment("");
    setEditing(null); // Clear editing mode
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Enter your feedback"
        rows="4"
      ></textarea>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => setRating(star)}
            style={{ color: rating >= star ? "gold" : "gray" }}
            className="star"
          >
            &#9733;
          </span>
        ))}
      </div>
      <button type="submit">{editFeedback ? "Update Feedback" : "Submit Feedback"}</button>
    </form>
  );
};

export default FeedbackForm;
