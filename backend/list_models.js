const axios = require('axios');
require('dotenv').config({ path: '../.env' });

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
        const res = await axios.get(url);
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.response?.data || e.message);
    }
}
listModels();
