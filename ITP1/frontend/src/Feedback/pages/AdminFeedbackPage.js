import { useState, useEffect } from "react";
import { getFeedbacks, deleteFeedback, toggleLikeFeedback } from "../api";
import Adminnaviagtion from "../../Component/Adminnavigation";

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
    const confirmDelete = window.confirm("Are you sure you want to delete this feedback?");
    if (!confirmDelete) return;

    const result = await deleteFeedback(id, "admin@admin.com");
    if (result) {
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== id));
    }
  };

  const handleLike = async (id) => {
    const updated = await toggleLikeFeedback(id, "admin@admin.com");
    if (updated) {
      setFeedbacks((prev) =>
        prev.map((fb) => (fb._id === id ? updated : fb))
      );
    }
  };

  const getEmoji = (rating) => {
    switch (rating) {
      case 1: return "😞";
      case 2: return "😐";
      case 3: return "🙂";
      case 4: return "😃";
      case 5: return "😍";
      default: return "";
    }
  };

  return (
    <div className="admin-feedback-page" style={{
      backgroundImage: "url('/your-background-image.jpg')", // your background image
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "Arial, sans-serif"
    }}>
      <div className="admin-dashboard-container" style={{ maxWidth: "1300px", margin: "0 auto" }}>
        <Adminnaviagtion />

        <div className="main-content" style={{
          background: "rgba(255,255,255,0.85)",
          padding: "30px",
          borderRadius: "12px",
          marginTop: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}>
          <h2 style={{ marginBottom: "20px", marginLeft:"350px", color: "#333", textAlign: "center" }}>All Users's Feedbacks</h2>

          {feedbacks.length === 0 ? (
            <p style={{ textAlign: "center" }}>No feedback available.</p>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",    // 🌟 2 Cards per row
              gap: "50px",
              justifyContent: "center",
              alignItems: "start",
            }}>
              {feedbacks.map((feedback) => {
                const hasLiked = feedback.likes.includes("admin@admin.com");

                return (
                  <div
                    key={feedback._id}
                    style={{
                      width: "90%",           // important: take full column space
                      minHeight: "400px",
                      backgroundColor: "#fff",
                      padding: "20px",
                      marginLeft:"50px",
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "center",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    {/* User Email */}
                    <p style={{ margin: 0, fontWeight: "bold", color: "#555" }}>
                      <span style={{ color: "#999" }}>User Email:</span> {feedback.userEmail}
                    </p>

                    {/* Rating and Emoji */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "10px 0" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          style={{
                            color: feedback.rating >= star ? "gold" : "gray",
                            fontSize: "22px",
                          }}
                        >
                          ★
                        </span>
                      ))}
                      <span style={{ marginLeft: "8px", fontSize: "22px" }}>{getEmoji(feedback.rating)}</span>
                    </div>

                    {/* Comment */}
                    <p style={{ margin: "10px 0", color: "#333", fontSize: "15px" }}>
                      <span style={{ color: "#999" }}>Message:</span> {feedback.comment}
                    </p>

                    {/* Like Heart */}
                    <button
                      onClick={() => handleLike(feedback._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        fontSize: "30px",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <span style={{ color: hasLiked ? "red" : "black" }}>
                        {hasLiked ? "❤️" : "🤍"}
                      </span>
                      <span style={{ fontSize: "16px", color: "#333" }}>
                        {feedback.likes.length}
                      </span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(feedback._id)}
                      style={{
                        background: "#e74c3c",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Delete Feedback
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
