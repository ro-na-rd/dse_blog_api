// server.js
//require('dotenv').config();
require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const categoriesRoutes = require('./routes/categories');
const tagsRoutes = require('./routes/tags');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'DSE Blog API is running'
  });
});

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/tags', tagsRoutes);

// error handling
app.use((err, req, res, next) => {
  console.error(' ERROR:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
