const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware to handle CORS and raw text input
app.use(cors());
app.use(bodyParser.text({ type: '*/*' })); // Ensure raw body is parsed as text for all content types

// Your BeeFree API token
const apiToken = 'Bearer YOUR_API_TOKEN_HERE';  // Replace 'YOUR_API_TOKEN_HERE' with your actual API token

// Function to forward POST requests to BeeFree API
const forwardPostRequest = async (apiEndpoint, req, res, responseType = 'json') => {
  try {
    const response = await axios.post(apiEndpoint, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiToken,
      },
      responseType: responseType,  // Use json or arraybuffer depending on the request type
    });

    if (responseType === 'arraybuffer') {
      // Set headers for image response
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline'); // Display image inline
      res.status(200).send(response.data);  // Send binary image data
    } else {
      res.status(200).send(response.data); // Send standard JSON response
    }
  } catch (error) {
    console.error('Error in forwardPostRequest:', error.response ? error.response.data : error.message);
    res.status(500).json({
      message: `Error exporting from ${apiEndpoint}`,
      details: error.response ? error.response.data : error.message,
    });
  }
};

// Route to handle Plain Text export
app.post('/v1/message/plain-text', (req, res) => {
  const apiEndpoint = 'https://api.getbee.io/v1/message/plain-text';
  forwardPostRequest(apiEndpoint, req, res);
});

// Route to handle HTML export
app.post('/v1/message/html', (req, res) => {
  const apiEndpoint = 'https://api.getbee.io/v1/message/html';
  forwardPostRequest(apiEndpoint, req, res);
});

// Route to handle PDF export
app.post('/v1/message/pdf', (req, res) => {
  const apiEndpoint = 'https://api.getbee.io/v1/message/pdf';
  forwardPostRequest(apiEndpoint, req, res);
});

// Route to handle Image export (returns binary data as an image)
app.post('/v1/message/image', (req, res) => {
  const apiEndpoint = 'https://api.getbee.io/v1/message/image';
  forwardPostRequest(apiEndpoint, req, res, 'arraybuffer'); // Use arraybuffer for binary response
});

// Root route to verify that the server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server on the specified port (or default to port 3000)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
