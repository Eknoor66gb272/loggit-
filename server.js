import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Standard static file serving
app.use(express.static(__dirname));

// Health check endpoint required by Cloud Run
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// SPA routing support
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[SERVICE] Operational on port ${port} (Binding 0.0.0.0)`);
});