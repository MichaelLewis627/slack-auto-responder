const express = require('express');
const app = express();
app.use(express.json());

// Add logging middleware to see incoming requests
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    body: req.body,
    headers: req.headers
  });
  next();
});

app.post('/slack/events', (req, res) => {
  console.log('Received Slack event:', req.body);

  // Handle URL verification
  if (req.body && req.body.type === 'url_verification') {
    console.log('Challenge received:', req.body.challenge);
    return res.status(200)
      .set('Content-Type', 'text/plain')
      .send(req.body.challenge);
  }

  // Handle other events
  res.status(200).send('Ok');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
