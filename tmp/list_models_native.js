const https = require('https');

const key = process.env.GEMINI_API_KEY;

function listModels() {
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models?key=${key}`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      try {
        const json = JSON.parse(data);
        if (json.models) {
          console.log('Available Models:');
          json.models.forEach(m => console.log(' - ' + m.name));
        } else {
          console.log('No models key found in response:', json);
        }
      } catch (e) {
        console.log('Error parsing JSON:', data);
      }
    });
  });

  req.on('error', (e) => { console.error('Error:', e); });
  req.end();
}

listModels();
