const FeedbackItem = ({ feedback, onEdit, onDelete, isAdmin }) => {
    return (
      <div className="feedback-item">
        {/* Displaying Star Rating */}
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              style={{ color: feedback.rating >= star ? "gold" : "gray" }}
              className="star"
            >
              &#9733;
            </span>
          ))}
        </div>
  
        {/* Feedback Comment */}
        <p>{feedback.comment}</p>
  
        {/* Only show Edit button if not admin */}
        {!isAdmin && (
          <button onClick={() => onEdit(feedback)}>Edit</button>
        )}
        
        {/* Show Delete button for both regular users and admins */}
        <button onClick={() => onDelete(feedback._id)}>Delete</button>
      </div>
    );
  };
  
  export default FeedbackItem;
  