"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { execSync } = require('child_process');
const express = require('express');
const path = require('path');
const auth = require('./auth/auth');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
// importing custom modules
const storeToken_1 = require("./functions/storeToken");
const spotifyUtils_1 = require("./functions/spotifyUtils");
const axios_1 = require("axios");
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
app.get('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authorizationUrl = yield auth.getAuthorizationUrl();
        res.redirect(authorizationUrl);
    }
    catch (error) {
        console.error('Error retrieving authorization URL:', error);
        res.status(500).send('Internal Server Error');
    }
}));
app.get('/spotify_auth_callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, error } = req.query;
    if (error) {
        // Handle authorization error
        console.error('Authorization error:', error);
        return res.status(500).send('Authorization Error');
    }
    try {
        // Exchange authorization code for access token
        const accessToken = yield auth.requestAccessToken(code);
        // Retrieve user email
        const userEmail = yield auth.getUserEmail(accessToken);
        // Retrieve user ID
        const userId = yield getUserId(accessToken);
        (0, storeToken_1.storeToken)(userEmail, accessToken, userId).then(msg => {
            console.log(msg);
        }).catch(err => {
            console.log("It failed!! Reason was", err);
        });
        // Redirect to a success page or perform further actions
        res.status(200).send('Authorization Successful');
    }
    catch (error) {
        // Handle any errors that occur during authorization
        console.error('Authorization error:', error);
        res.status(500).send('Authorization Error');
    }
}));
function getUserId(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        };
        const response = yield axios_1.default.get('https://api.spotify.com/v1/me', config);
        const userId = response.data.id;
        return userId;
    });
}
//authentication endpoints end
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.post('/recommend_songs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("oh hi");
    const { query, email } = req.body;
    (0, storeToken_1.fetchToken)(email).then((token) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("found token ", token);
        try {
            const javaOutput = execSync(`java -cp src main.java.Main ${token} ${query}`).toString().trim();
            const playlistSongs = yield (0, spotifyUtils_1.processPlaylists)(JSON.parse(javaOutput), token);
            const trackUris = playlistSongs.map((song) => song.uri);
            (0, storeToken_1.fetchUserId)(email).then((userId) => __awaiter(void 0, void 0, void 0, function* () {
                const playlistId = yield (0, spotifyUtils_1.createPlaylist)("Sad", token, userId, trackUris);
                console.log("Playlist created with ID:", playlistId);
            }));
        }
        catch (error) {
            console.error('Java program execution failed:', error);
        }
    })).catch(e => {
        console.log("failed to fetch token, error is ", e);
    });
}));
