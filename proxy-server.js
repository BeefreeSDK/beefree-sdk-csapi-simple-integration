import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: ['text/*', 'application/xhtml+xml', 'application/xml'], limit: '10mb' }));

const BEE_CLIENT_ID = process.env.BEE_CLIENT_ID || '';
const BEE_CLIENT_SECRET = process.env.BEE_CLIENT_SECRET || '';
const RAW_CS_TOKEN = process.env.CS_API_TOKEN || '';
const CS_AUTH = RAW_CS_TOKEN.startsWith('Bearer ') ? RAW_CS_TOKEN : (RAW_CS_TOKEN ? `Bearer ${RAW_CS_TOKEN}` : '');

// Login V2 Auth Endpoint (for SDK)
app.post('/proxy/bee-auth', async (req, res) => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const uid = body.uid || 'demo-user';
    const response = await axios.post(
      'https://auth.getbee.io/loginV2',
      {
        client_id: BEE_CLIENT_ID,
        client_secret: BEE_CLIENT_SECRET,
        uid
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (error) {
    const message = (error && error.response && error.response.data) || error.message || 'Unknown error';
    console.error('Auth error:', message);
    res.status(500).json({ error: 'Failed to authenticate', details: message });
  }
});

// Helper to forward POST requests to Content Services API (v1)
const forwardPost = async (targetUrl, req, res, responseType = 'json') => {
  if (!CS_AUTH) {
    res.status(500).json({ error: 'CS_API_TOKEN is not configured' });
    return;
  }
  try {
    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const response = await axios.post(targetUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': CS_AUTH
      },
      responseType
    });

    if (responseType === 'arraybuffer') {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline');
      res.status(200).send(response.data);
      return;
    }
    res.status(200).send(response.data);
  } catch (error) {
    const details = (error && error.response && error.response.data) || error.message || 'Unknown error';
    console.error('CS API forward error:', details);
    res.status(500).json({ message: `Error exporting from ${targetUrl}`, details });
  }
};

// Plain Text
app.post('/v1/message/plain-text', async (req, res) => {
  await forwardPost('https://api.getbee.io/v1/message/plain-text', req, res);
});

// HTML
app.post('/v1/message/html', async (req, res) => {
  await forwardPost('https://api.getbee.io/v1/message/html', req, res);
});

// PDF
app.post('/v1/message/pdf', async (req, res) => {
  await forwardPost('https://api.getbee.io/v1/message/pdf', req, res);
});

// Image (returns binary)
app.post('/v1/message/image', async (req, res) => {
  await forwardPost('https://api.getbee.io/v1/message/image', req, res, 'arraybuffer');
});

app.get('/', (_req, res) => {
  res.send('Beefree proxy + CS API is running');
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});


