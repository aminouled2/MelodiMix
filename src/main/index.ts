const { execSync } = require('child_process');
const express = require('express');
const path = require('path');
const auth = require('./auth/auth')
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// importing custom modules
import { storeToken, fetchToken, fetchUserId } from './functions/storeToken';
import { processPlaylists, createPlaylist } from './functions/spotifyUtils';
import axios from 'axios';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'pages'));
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = 3000;



// routing

app.get('/', (req, res) => {
  // Example data to pass to the template
  const user = {
    name: 'John Doe',
    age: 30
  };

  // Render the 'home' template with the provided data
  res.render('home', { user });
});


// authentication endpoints start
app.get('/login', async (req, res) => {
  try {
    const authorizationUrl = await auth.getAuthorizationUrl();
    res.redirect(authorizationUrl);
  } catch (error) {
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

  try {
    // Exchange authorization code for access token
    const accessToken = await auth.requestAccessToken(code);

    // Retrieve user email
    const userEmail = await auth.getUserEmail(accessToken);

    // Retrieve user ID
    const userId = await getUserId(accessToken);

    storeToken(userEmail, accessToken, userId).then(msg => {
      console.log(msg);
    }).catch(err => {
      console.log("It failed!! Reason was", err);
    });

    // Redirect to a success page or perform further actions
    res.status(200).send('Authorization Successful');
  } catch (error) {
    // Handle any errors that occur during authorization
    console.error('Authorization error:', error);
    res.status(500).send('Authorization Error');
  }
});

async function getUserId(accessToken) {
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  };

  const response = await axios.get('https://api.spotify.com/v1/me', config);
  const userId = response.data.id;
  return userId;
}

//authentication endpoints end

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.post('/recommend_songs', async (req, res) => {
  console.log("oh hi")
  const { query, email } = req.body;

  fetchToken(email).then(async token => {
    console.log("found token ", token)
    try {
      const javaOutput: string = execSync(`java -cp src main.java.Main ${token} ${query}`).toString().trim();
      const playlistSongs = await processPlaylists(JSON.parse(javaOutput), token);
      const trackUris = playlistSongs.map((song: any) => song.uri);
      fetchUserId(email).then(async userId => {
        const playlistId = await createPlaylist("Happy", token, userId, trackUris);
        console.log("Playlist created with ID:", playlistId);
      })
    } catch (error) {
      console.error('Java program execution failed:', error);
    }
  }).catch(e => {
    console.log("failed to fetch token, error is ", e);
  })
})
