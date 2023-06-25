const { execSync } = require('child_process');
const express = require('express');
const path = require('path');
const auth = require('./auth/auth')
const app = express();

// importing custom modules
import { storeToken } from './functions/storeToken';

let user_tokens : Object;

import * as fs from 'fs'

// first read file, then watch that file for changes

fs.readFile(path.join(__dirname, '..', 'db', 'userTokens.json'), 'utf-8', (_, data : Object) => {
  user_tokens = data;
})

fs.watchFile(path.join(__dirname, '..', 'db', 'userTokens.json'), () => {
  fs.readFile(path.join(__dirname, '..', 'db', 'userTokens.json'), 'utf-8', (_, data : Object) => {
    user_tokens = data;
  })
})

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

    storeToken(userEmail, accessToken).then(msg => {
      console.log(msg)
    }).catch(err => {
      console.log("it failed!! reason was", err)
    })

    // Redirect to a success page or perform further actions
    res.status(200).send('Authorization Successful');
  } catch (error) {
    // Handle any errors that occur during authorization
    console.error('Authorization error:', error);
    res.status(500).send('Authorization Error');
  }
});
//authentication endpoints end

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const arg = "hello"
try {
  const javaOutput : string = execSync(`java src.main.java.Main ${arg}`).toString().trim();
  console.log('Java output:', javaOutput);
} catch (error) {
  console.error('Java program execution failed:', error);
}