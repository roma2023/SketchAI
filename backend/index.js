const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');  // npm install form-data

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const apiKeyPath = path.join(__dirname, '../API-KEY.txt');
const apiKey = fs.readFileSync(apiKeyPath, 'utf8').trim();

app.post('/api/convert', async (req, res) => {
  const { sketch, prompt, control_strength, output_format } = req.body; // e.g. "data:image/png;base64,iVBORw0K..."

  try {
    // 1. Match the pattern "data:image/<TYPE>;base64,<DATA>"
    const match = sketch.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const mimeType = match[1];      // e.g. "image/png"
    const base64Data = match[2];    // e.g. "iVBORw0K..."
    const fileExt = mimeType.split('/')[1];

    // 2. Convert Base64 portion to a Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // 3. Append the buffer as a file
    const formData = new FormData();
    formData.append('image', buffer, `sketch.${fileExt}`);
    formData.append('prompt', prompt || 'A cute cat sketch');
    if (control_strength) formData.append('control_strength', control_strength);
    if (output_format) formData.append('output_format', output_format);

    // 4. Call Stability AI's sketch endpoint
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/control/sketch',
      formData,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          ...formData.getHeaders(),
          'Accept': 'image/*'
        },
        responseType: 'arraybuffer'
      }
    );

    // 5. Return the generated image data
    res.set('Content-Type', response.headers['content-type']);
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to convert sketch' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));