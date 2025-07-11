const express = require('express');
const app = express();

// Important: Add raw body handling for Slack verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

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

// Add a root endpoint for testing
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Handle Slack events
app.post('/slack/events', (req, res) => {
  console.log('Received Slack event:', JSON.stringify(req.body, null, 2));

  // URL Verification
  if (req.body && req.body.type === 'url_verification') {
    console.log('Handling URL verification');
    console.log('Challenge received:', req.body.challenge);
    
    // Return challenge with proper headers
    return res.status(200)
      .header('Content-Type', 'application/json')
      .json({
        challenge: req.body.challenge
      });
  }

  // Acknowledge other events
  res.status(200).send('ok');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Ready to handle Slack events at /slack/events');
});
