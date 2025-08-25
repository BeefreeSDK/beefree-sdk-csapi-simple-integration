## Beefree SDK React Demo with Content Services API Exports

This project embeds Beefree SDK’s no‑code email builder in a React (Vite + TypeScript) app and adds four export actions powered by the Content Services API: HTML, Plain Text, PDF, and Thumbnail Image. The builder uses LoginV2 server‑side authentication and tracks live changes via onChange. The export result panel appears on the left with copy/download controls; the editor is on the right.

Reference: React demo style and auth flow are aligned with the official example repo and docs: [beefree-react-demo](https://github.com/BeefreeSDK/beefree-react-demo), and the Content Services API export docs are here: [Export API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/export).

### Features

- Beefree SDK editor embedded with client‑side initialization and LoginV2 token from a Node proxy
- onChange tracking enabled to keep current JSON in sync
- Four export actions:
  - Get design HTML
  - Get design Plain Text
  - Get design Thumbnail Image
  - Get design PDF
- Results pane with copy/download and image/PDF handling

### Prerequisites

- Node 20+
- Beefree SDK credentials: Client ID and Client Secret
- Content Services API token

### Environment

Create a `.env` in the project root:

```
BEE_CLIENT_ID=your-client-id
BEE_CLIENT_SECRET=your-client-secret
CS_API_TOKEN=your-csapi-token-or-"Bearer ..."
PORT=3001
```

### Install and Run Locally

1) Install deps
```
npm install
```

2) Start the proxy (LoginV2 + CS API forwarder)
```
npm run dev:proxy
```

3) Start the React app
```
npm run dev
```

4) Open the app: `http://localhost:3000`

### How It Works

- Frontend initializes Beefree SDK after fetching a LoginV2 token from `/proxy/bee-auth`.
- `onChange` is enabled; the app stores the latest JSON, which powers the HTML/Text exports.
- HTML is cached client‑side; PDF/Image require HTML to be computed first, otherwise the UI prompts “Convert template to HTML first”.
- The proxy forwards export requests to the Content Services API with your `CS_API_TOKEN`.

### Beefree SDK Initialization (client)

Minimalized example from `src/BeefreeEditor.tsx`:

```ts
const response = await fetch('/proxy/bee-auth', { method: 'POST' });
const token = await response.json();
const sdk = new BeefreeSDK({ ...token, v2: true });
await sdk.start({
  container: 'beefree-react-demo',
  trackChanges: true,
  onChange(json) { setCurrentJson(json); },
}, initialJson, '', { shared: false });
```

### LoginV2 (server)

`proxy-server.js` exposes a LoginV2 endpoint that returns the SDK token:

```js
app.post('/proxy/bee-auth', async (req, res) => {
  const { uid } = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const response = await axios.post('https://auth.getbee.io/loginV2', {
    client_id: process.env.BEE_CLIENT_ID,
    client_secret: process.env.BEE_CLIENT_SECRET,
    uid: uid || 'demo-user'
  }, { headers: { 'Content-Type': 'application/json' } });
  res.json(response.data);
});
```

### Endpoints (server)

All Content Services API endpoints are implemented in `proxy-server.js`. Refer to the docs to learn more about the technical specifications for each endpoint: [Export API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/export).

1) POST `/v1/message/plain-text`

- Description: Convert Beefree JSON to Plain Text
- Request body: JSON template object
- Response: `text/plain` string

Example request:
```json
{ "page": { "title": "My Template", "rows": [] } }
```

Example response (text):
```
Hello world…
```

2) POST `/v1/message/html`

- Description: Convert Beefree JSON to HTML
- Request body: JSON template object
- Response: Either raw HTML text or `{ body: { html: "..." } }` depending on service

Example request:
```json
{ "page": { "title": "My Template", "rows": [] } }
```

Example response (text):
```html
<!doctype html><html>…</html>
```

3) POST `/v1/message/pdf`

- Description: Generate a PDF from HTML
- Request body: JSON with HTML and options
```json
{ "page_size": "Full", "page_orientation": "landscape", "html": "<!doctype html>…" }
```
- Response: JSON with a URL to the rendered PDF
```json
{ "body": { "url": "https://…/file.pdf" } }
```

4) POST `/v1/message/image`

- Description: Generate an image (thumbnail) from HTML
- Request body: JSON with HTML and options
```json
{ "file_type": "png", "size": "1000", "html": "<!doctype html>…" }
```
- Response: `image/png` binary; the UI converts to an object URL and shows it inline with a download link

### UI and Layout

- Buttons row: Get HTML, Get Plain Text, Get Thumbnail Image, Get PDF, plus “Read the Docs”.
- Left pane: export results with copy/download controls
- Right pane: Beefree editor in a fixed container ID `beefree-react-demo`

### Notes

- Vite dev server proxies `/v1/*` and `/proxy/*` to the proxy on port 3001.
- Ensure your `.env` is configured before starting.
- See Content Services API Export documentation for full parameter support and behaviors: [Export API](https://docs.beefree.io/beefree-sdk/apis/content-services-api/export).
