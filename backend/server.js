const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');  // Import db connection
const feedbackRoutes = require('./src/Routes/FeedbackRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
