import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: '../backend/.env' });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

listModels();
