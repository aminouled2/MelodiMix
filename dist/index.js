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
const app = express();
// importing custom modules
const storeToken_1 = require("./functions/storeToken");
let user_tokens;
const fs = require("fs");
// first read file, then watch that file for changes
fs.readFile(path.join(__dirname, '..', 'db', 'userTokens.json'), 'utf-8', (_, data) => {
    user_tokens = data;
});
fs.watchFile(path.join(__dirname, '..', 'db', 'userTokens.json'), () => {
    fs.readFile(path.join(__dirname, '..', 'db', 'userTokens.json'), 'utf-8', (_, data) => {
        user_tokens = data;
    });
});
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
        (0, storeToken_1.storeToken)(userEmail, accessToken).then(msg => {
            console.log(msg);
        }).catch(err => {
            console.log("it failed!! reason was", err);
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
//authentication endpoints end
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const arg = "hello";
try {
    const javaOutput = execSync(`java src.main.java.Main ${arg}`).toString().trim();
    console.log('Java output:', javaOutput);
}
catch (error) {
    console.error('Java program execution failed:', error);
}
