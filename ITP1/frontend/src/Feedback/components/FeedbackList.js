import { useState, useEffect } from "react";
import { getFeedbacks, deleteFeedback } from "../api"; // Your API functions
import FeedbackItem from "./FeedbackItem"; // Import FeedbackItem component

const FeedbackList = ({ setEditing }) => {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            const data = await getFeedbacks();
            setFeedbacks(data); // Set feedback data in the state
        };

        fetchFeedbacks(); // Fetch data when the component mounts
    }, []);

    const handleDelete = async (id) => {
        const result = await deleteFeedback(id); // Delete feedback from API
        if (result) {
            setFeedbacks((prevFeedbacks) => prevFeedbacks.filter((feedback) => feedback._id !== id)); // Update state
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
                        onDelete={handleDelete} // Pass delete handler
                    />
                ))
            )}
        </div>
    );
};

export default FeedbackList;
