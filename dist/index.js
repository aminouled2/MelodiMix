var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { execSync } = require('child_process');
const express = require('express');
const path = require('path');
const auth = require('./auth/auth');
const app = express();
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
app.get('/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const authorizationUrl = yield auth.getAuthorizationUrl();
        res.redirect(authorizationUrl);
    }
    catch (error) {
        // Handle any errors that occur during authorization URL retrieval
        console.error('Error retrieving authorization URL:', error);
        res.status(500).send('Internal Server Error');
    }
}));
app.get('/spotify_auth_callback', (req, res) => __awaiter(this, void 0, void 0, function* () {
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
        console.log(userEmail);
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
/*
save it for later

try {
  const javaOutput : string = execSync('java src.main.java.Main').toString().trim();
  console.log('Java output:', javaOutput);
} catch (error) {
  console.error('Java program execution failed:', error);
}
*/ 
