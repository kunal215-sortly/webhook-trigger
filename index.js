import express from 'express';
import fetch from 'node-fetch';


const app = express();
app.use(express.json());

// CORS middleware to allow browser requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// POST /invoke-webhook
app.post('/invoke-webhook', async (req, res) => {
  const { webhookUrl, text } = req.body;
  if (!webhookUrl || !text) {
    return res.status(400).json({ error: 'webhookUrl and text are required in the payload.' });
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "text": text
      })
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
