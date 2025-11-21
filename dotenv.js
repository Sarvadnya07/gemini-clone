require('dotenv').config();

const geminiApiKey = process.env.GEMINI_API_KEY;

// Example of using the API key in a request
const headers = {
  'X-Gemini-APIKey': geminiApiKey,
  'Content-Type': 'application/json'
};

fetch('https://api.gemini.com/v1/some-endpoint', {
  method: 'GET',
  headers: headers
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
