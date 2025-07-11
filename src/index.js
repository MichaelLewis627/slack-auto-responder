const express = require('express');
const app = express();

// Important: This enables parsing of JSON bodies
app.use(express.json());

app.post('/slack/events', (req, res) => {
  // Log incoming request for debugging
  console.log('Received Slack request:', req.body);

  // Handle the URL verification challenge
  if (req.body.type === 'url_verification') {
    console.log('Handling challenge:', req.body.challenge);
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // For all other events, just return 200 OK for now
  res.status(200).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
