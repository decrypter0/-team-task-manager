// Serves the Vite build output as static files.
// Railway runs `npm run build` then `npm start`, this just hosts the dist/ folder.
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

// SPA fallback: any unmatched route serves index.html so React Router can handle it
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 4173;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
