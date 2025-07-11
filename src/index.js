const express = require('express');
const app = express();

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Slack Auto Responder is running!');
});

// Handle Slack events
app.post('/slack/events', (req, res) => {
  console.log('Received Slack event:', JSON.stringify(req.body, null, 2));

  // URL Verification
  if (req.body && req.body.type === 'url_verification') {
    console.log('Handling URL verification');
    console.log('Challenge received:', req.body.challenge);
    
    return res.status(200)
      .json({ challenge: req.body.challenge });
  }

  // Acknowledge other events
  res.status(200).send('Event received');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Root URL: http://localhost:${PORT}/`);
  console.log(`Slack events URL: http://localhost:${PORT}/slack/events`);
});
