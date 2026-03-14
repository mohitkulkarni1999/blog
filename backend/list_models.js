const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function listModels() {
    try {
        const key = process.env.GEMINI_API_KEY;
        console.log('Using Key:', key ? (key.substring(0, 5) + '...') : 'MISSING');
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const res = await axios.get(url);
        res.data.models.forEach(m => {
            console.log(`- ${m.name} (${m.displayName})`);
        });
    } catch (e) {
        console.error(e.response?.data || e.message);
    }
}
listModels();
