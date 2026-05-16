const axios = require('axios');

const CONFIG = {
  email: "jesvanth.s2022@vitstudent.ac.in",
  name: "jesvanth s",
  rollNo: "22mia1057",
  accessCode: "SfFuWg",
  clientID: "fe785dd5-bde5-4742-a71a-e007ec5e1627",
  clientSecret: "bkFsamcCKDwGJYNP"
};

let AUTH_TOKEN = "";

async function refreshToken() {
  try {
    const res = await axios.post(
      'http://4.224.186.213/evaluation-service/auth',
      CONFIG
    );
    AUTH_TOKEN = res.data.access_token;
    console.log('Token refreshed!');
  } catch (err) {
    console.error('Token refresh failed:', err.message);
  }
}

async function Log(stack, level, package_name, message) {
  if (!AUTH_TOKEN) await refreshToken();
  try {
    const response = await axios.post(
      'http://4.224.186.213/evaluation-service/logs',
      { stack, level, package: package_name, message },
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}`, 'Content-Type': 'application/json' } }
    );
    console.log('Log sent:', response.data);
    return response.data;
  } catch (err) {
    if (err.response?.status === 401) {
      await refreshToken();
      return Log(stack, level, package_name, message);
    }
    console.error('Log failed:', err.message);
  }
}

module.exports = { Log, getToken: () => AUTH_TOKEN, refreshToken };