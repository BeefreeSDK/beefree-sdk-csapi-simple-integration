const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware to handle CORS and JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Replace with your Beefree API token
const apiToken = 'Bearer YOUR_API_TOKEN_HERE';  // Replace 'YOUR_API_TOKEN_HERE' with your actual API token

// Route to export content as plain text
app.post('/v1/message/plain-text', async (req, res) => {
  try {
    const pageJson = req.body.page;  // Extract the "page" field from the request body

    if (!pageJson) {
      return res.status(400).json({ message: "Page JSON is required." });  // Send error if no JSON is provided
    }

    // Prepare request payload for the API
    const payload = { page: pageJson };

    // Call Beefree API to export plain text
    const response = await axios.post(
      'https://api.getbee.io/v1/message/plain-text',  // Beefree API URL
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiToken,  // Use the provided token for authentication
        },
      }
    );

    // Send plain text result back to the client
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'Error exporting plain text',
      details: error.response ? error.response.data : error.message
    });
  }
});

// Route to export content as PDF
app.post('/v1/message/pdf', async (req, res) => {
  try {
    const { html } = req.body;  // Extract the HTML content from the request body

    if (!html) {
      return res.status(400).json({ message: "HTML content is required." });
    }

    const pdfPayload = {
      page_size: "Full",
      page_orientation: "landscape",
      html
    };

    // Call Beefree API to export PDF
    const response = await axios.post(
      'https://api.getbee.io/v1/message/pdf',
      pdfPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiToken,
        },
        responseType: 'json'
      }
    );

    // Send the PDF URL back to the client
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'Error exporting PDF',
      details: error.response ? error.response.data : error.message
    });
  }
});

// Route to export content as HTML
app.post('/v1/message/html', async (req, res) => {
  try {
    const pageJson = req.body.page;  // Extract the "page" field from the request body

    if (!pageJson) {
      return res.status(400).json({ message: "Page JSON is required." });
    }

    const payload = { page: pageJson };

    // Call Beefree API to export HTML
    const response = await axios.post(
      'https://api.getbee.io/v1/message/html',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiToken,
        },
      }
    );

    // Send the HTML result back to the client
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'Error exporting HTML',
      details: error.response ? error.response.data : error.message
    });
  }
});

// Root route to verify that the server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start the server on the specified port (or default to port 3000)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
