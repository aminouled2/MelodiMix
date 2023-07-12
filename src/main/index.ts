const { execSync } = require('child_process');
const express = require('express');
const path = require('path');
const auth = require('./auth/auth')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());


// importing custom modules
import { storeToken, fetchToken, fetchUserId } from './functions/storeToken';
import { processPlaylists, createPlaylist, fetchPlaylists } from './functions/spotifyUtils';
import axios from 'axios';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'pages'));
app.use(express.static(path.join(__dirname, '..', 'public')));

const PORT = 3000;



// routing

app.get('/melodimix', async (req, res) => {
  const email = req.cookies.email;
  if (!email) {
    try {
      const authorizationUrl = await auth.getAuthorizationUrl();
      res.redirect(authorizationUrl);
    } catch (error) {
      console.error('Error retrieving authorization URL:', error);
      res.status(500).send('Internal Server Error');
    }
  }
  res.render('home', { email });
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
      res.cookie('email', userEmail, {
        maxAge: 3600000, // spotify tokens run out after an hour
        httpOnly: true
      });

      res.redirect('/melodimix')
    }).catch(err => {
      console.log("It failed!! Reason was", err);
    });

    // Redirect to a success page or perform further actions

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
  const { query, email } = req.body;

  fetchToken(email).then(async token => {
    try {
      fetchPlaylists(query, token).then(playlistResponse => {
        console.log(playlistResponse)
        processPlaylists(playlistResponse, token).then(playlistSongs => {
          res.status(200).send(playlistSongs)
        })
      })
    } catch (error) {
      console.error('Java program execution failed:', error);
    }
  }).catch(e => {
    console.log("failed to fetch token, error is ", e);
  })
})

app.post('/save_playlist', async (req, res) => {
  const { playlistSongs, email, title } = req.body;
  console.log(playlistSongs);

  const trackUris = Object.values(playlistSongs)
    .filter((song: any) => song?.uri !== null)
    .map((song: any) => song?.uri);

  fetchToken(email).then((token) => {
    fetchUserId(email).then(async (userId) => {
      const playlistId = await createPlaylist(title, token, userId, trackUris);
      console.log("Playlist created with ID:", playlistId);
    });
  });
});



