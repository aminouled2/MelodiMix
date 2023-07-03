import * as dotenv from 'dotenv';
dotenv.config();
const axios = require('axios');
const querystring = require('querystring');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3000/spotify_auth_callback'; // Replace with your actual redirect URI

export async function getAuthorizationUrl(): Promise<string> {
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private'
  });

  return `https://accounts.spotify.com/authorize?${queryParams}`;
}

export async function requestAccessToken(authorizationCode: string): Promise<string> {
  const queryParams = querystring.stringify({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const response = await axios.post('https://accounts.spotify.com/api/token', queryParams, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response.data.access_token;
}

export async function getUserEmail(accessToken: string): Promise<string> {
  const response = await axios.get('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data.email;
}