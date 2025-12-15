import express from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

const shouldUseKunalToken = true;

const token = shouldUseKunalToken ? process.env.KUNAL_ACCESS_TOKEN : process.env.ASHWIN_ACCESS_TOKEN;
const companyId = shouldUseKunalToken ? process.env.KUNAL_COMPANY_ID : process.env.ASHWIN_COMPANY_ID;

// POST /create-job
app.post('/create-job', async (req, res) => {
  console.log('--- Incoming /create-job request ---');
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('-----------------------------------');

  if (req.body.text) {
    try {
      const apiResponse = await fetch(`https://pro-api-qa.sortly.co/v2/companies/${companyId}/nodes`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${token}`,
          'accept-language': 'en-US,en;q=0.9,hi;q=0.8',
          'cache-control': 'no-cache',
            'content-type': 'application/json',
            'Referer': 'https://app-qa.sortly.co/',
            'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
          "include_acl": true,
          "node": {
            "id": crypto.randomUUID(),
            "parent_id": null,
            "is_item": false,
            "name": req.body.text,
            "notes": null,
            "tags": [],
            "photo_ids": [],
            "label_url": null,
            "label_url_type": null,
            "label_url_extra": null,
            "label_url_extra_type": null,
            "label_attributes": null,
            "custom_attribute_values": [],
            "notification_triggers": [],
            "origin_folder_id": null
          }
        })
      });
      const apiResult = await apiResponse.json().catch(() => ({}));
      res.status(200).json({ message: 'Successfully created folder', apiResult });
    } catch (err) {
      res.status(500).json({ error: 'Failed to call Sortly API', details: err.message });
    }
  } else {
    res.status(200).send('Payload received.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
