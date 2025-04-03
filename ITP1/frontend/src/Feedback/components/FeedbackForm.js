import { useState, useEffect, useRef } from "react";
import "./FeedbackForm.css";

const FeedbackForm = ({ editFeedback, setEditing, onAdd, onEdit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editFeedback) {
      setRating(editFeedback.rating);
      setComment(editFeedback.comment);
      setPhoto(null);
      setPhotoError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [editFeedback]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setPhotoError("File size exceeds 2MB. Please upload a smaller file.");
        setPhoto(null);
        return;
      }
      setPhotoError("");
      setPhoto(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (comment.length < 25) {
      alert("Your comment must be at least 25 characters long.");
      return;
    }
    if (comment.length > 80) {
      alert("Your comment can't be more than 80 characters long.");
      return;
    }
    if (rating === 0) {
      alert("Please provide a rating.");
      return;
    }

    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment);
    if (photo) {
      formData.append("photo", photo);
    }

    if (editFeedback) {
      onEdit(editFeedback._id, formData);
    } else {
      onAdd(formData);
    }

    setSuccessMessage("Thank you for your feedback!");

    setRating(0);
    setComment("");
    setPhoto(null);
    setEditing(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const getEmoji = (rating) => {
    switch (rating) {
      case 1:
        return "😞";
      case 2:
        return "😐";
      case 3:
        return "🙂";
      case 4:
        return "😃";
      case 5:
        return "😍";
      default:
        return "";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Enter your feedback"
        rows="4"
        required
      ></textarea>

      {/* Star Rating and Emoji Display on the Same Line */}
      <div className="rating-container">
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              style={{
                color: rating >= star ? "gold" : "gray",
                cursor: "pointer",
                fontSize: "30px",
              }}
            >
              &#9733;
            </span>
          ))}
        </div>
        {rating > 0 && <span className="emoji">{getEmoji(rating)}</span>}
      </div>

      <div>
        <label htmlFor="photo">If You have any issues Upload Photo:</label>
        <input
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {photoError && <p style={{ color: "red", fontSize: "12px" }}>{photoError}</p>}
      </div>

      <button type="submit">
        {editFeedback ? "Update Feedback" : "Submit Feedback"}
      </button>

      {successMessage && (
        <div className="success-popup">
          <div className="popup-content">
            <p>{successMessage}</p>
          </div>
        </div>
      )}
    </form>
  );
};

export default FeedbackForm;
