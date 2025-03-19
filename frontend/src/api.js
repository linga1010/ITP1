const API_URL = "http://localhost:5000/api/feedback";

// Add feedback
export const addFeedback = async (feedback) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    });
    return await response.json();
  } catch (error) {
    console.error("Error adding feedback:", error);
  }
};

// Update feedback
export const updateFeedback = async (id, feedback) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating feedback:", error);
  }
};

// Get all feedbacks
export const getFeedbacks = async () => {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return [];
  }
};

// Delete feedback
export const deleteFeedback = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete feedback");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting feedback:", error);
  }
};
