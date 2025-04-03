import { useState, useEffect } from "react";
import { getFeedbacks, deleteFeedback } from "../api";
import FeedbackItem from "../components/FeedbackItem";
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
    const result = await deleteFeedback(id);
    if (result) {
      setFeedbacks(feedbacks.filter((feedback) => feedback._id !== id));
    }
  };

  return (
    <div className="admin-feedback-page">
      <div className="admin-dashboard-container">
        <Adminnaviagtion />
        <div className="main-content">
          <h2>Admin Feedbacks</h2>
          {feedbacks.length === 0 ? (
            <p>No feedback available.</p>
          ) : (
            feedbacks.map((feedback) => (
              <div 
                key={feedback._id} 
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-start", 
                  gap: "10px", 
                  padding: "10px", 
                  borderBottom: "1px solid #ccc" 
                }}
              >
                <FeedbackItem feedback={feedback} isAdmin={true} />
                <button 
                  onClick={() => handleDelete(feedback._id)} 
                  style={{ 
                    background: "red", 
                    color: "white", 
                    border: "none", 
                    padding: "5px 10px", 
                    cursor: "pointer", 
                    alignSelf: "flex-start" 
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}  

export default AdminFeedbackPage;
