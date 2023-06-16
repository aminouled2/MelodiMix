const { execSync } = require('child_process');
const express = require('express');
const auth = require('./auth/auth')

const app = express();
const PORT = 3000;

app.get('/login', async (req, res) => {
  try {
    const authorizationUrl = await auth.getAuthorizationUrl();
    res.redirect(authorizationUrl);
  } catch (error) {
    // Handle any errors that occur during authorization URL retrieval
    console.error('Error retrieving authorization URL:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/spotify_auth_callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    // Handle authorization error
    console.error('Authorization error:', error);
    return res.status(500).send('Authorization Error');
  }

  logEmail(code) // just to test if the authentication was a success
});

async function logEmail(code) {
  // test case
  // Exchange authorization code for access token
  const accessToken = await auth.requestAccessToken(code);

  // Retrieve user email
  const userEmail = await auth.getUserEmail(accessToken);

  console.log(userEmail);
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/*
save it for later

try {
  const javaOutput : string = execSync('java src.main.java.Main').toString().trim();
  console.log('Java output:', javaOutput);
} catch (error) {
  console.error('Java program execution failed:', error);
}
*/