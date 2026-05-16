const axios = require('axios');

const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJqZXN2YW50aC5zMjAyMkB2aXRzdHVkZW50LmFjLmluIiwiZXhwIjoxNzc4OTI4Mjg0LCJpYXQiOjE3Nzg5MjczODQsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI0NmIyODRlMS03MTc4LTQ1NjAtOTUwMS00Mjg0NmUxNmU3OWYiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJqZXN2YW50aCBzIiwic3ViIjoiZmU3ODVkZDUtYmRlNS00NzQyLWE3MWEtZTAwN2VjNWUxNjI3In0sImVtYWlsIjoiamVzdmFudGguczIwMjJAdml0c3R1ZGVudC5hYy5pbiIsIm5hbWUiOiJqZXN2YW50aCBzIiwicm9sbE5vIjoiMjJtaWExMDU3IiwiYWNjZXNzQ29kZSI6IlNmRnVXZyIsImNsaWVudElEIjoiZmU3ODVkZDUtYmRlNS00NzQyLWE3MWEtZTAwN2VjNWUxNjI3IiwiY2xpZW50U2VjcmV0IjoiYmtGc2FtY0NLRHdHSllOUCJ9.Wt9OOuvTkwlc7oOqE-Ir2jQr_Nw1KwX4jWVs69WayVg";

async function Log(stack, level, package_name, message) {
  try {
    const response = await axios.post(
      'http://4.224.186.213/evaluation-service/logs',
      {
        stack: stack,
        level: level,
        package: package_name,
        message: message
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Log sent:', response.data);
    return response.data;
  } catch (err) {
    console.error('Log failed:', err.message);
  }
}

module.exports = { Log };