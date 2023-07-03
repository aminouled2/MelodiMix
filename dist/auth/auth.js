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
exports.getUserEmail = exports.requestAccessToken = exports.getAuthorizationUrl = void 0;
const dotenv = require("dotenv");
dotenv.config();
const axios = require('axios');
const querystring = require('querystring');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/spotify_auth_callback'; // Replace with your actual redirect URI
function getAuthorizationUrl() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryParams = querystring.stringify({
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: REDIRECT_URI,
            scope: 'user-read-private user-read-email playlist-modify-public playlist-modify-private playlist-read-private'
        });
        return `https://accounts.spotify.com/authorize?${queryParams}`;
    });
}
exports.getAuthorizationUrl = getAuthorizationUrl;
function requestAccessToken(authorizationCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryParams = querystring.stringify({
            grant_type: 'authorization_code',
            code: authorizationCode,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        });
        const response = yield axios.post('https://accounts.spotify.com/api/token', queryParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data.access_token;
    });
}
exports.requestAccessToken = requestAccessToken;
function getUserEmail(accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data.email;
    });
}
exports.getUserEmail = getUserEmail;
