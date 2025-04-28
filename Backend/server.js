const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const app = express();

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // For handling CORS issues

// Routes
app.use('/api/auth', authRoutes); // Auth routes for login and register

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
