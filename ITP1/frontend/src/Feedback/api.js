const API_URL = "http://localhost:5000/api/feedback";

export const getFeedbacks = async () => {
  try {
    const res = await fetch(API_URL);
    return await res.json();
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return [];
  }
};

export const addFeedback = async (formData) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: formData
    });
    return await res.json();
  } catch (error) {
    console.error("Error adding feedback:", error);
    return null;
  }
};

export const updateFeedback = async (id, formData) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      body: formData
    });
    return await res.json();
  } catch (error) {
    console.error("Error updating feedback:", error);
    return null;
  }
};

export const deleteFeedback = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });
    return res.ok;
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return false;
  }
};
