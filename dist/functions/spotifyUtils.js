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
exports.createPlaylist = exports.processPlaylists = exports.getPlaylistTracks = void 0;
const axios_1 = require("axios");
function getPlaylistTracks(playlistId, authToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
        };
        const response = yield axios_1.default.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, config);
        if (!response.data.items) {
            return []; // Return an empty array if there are no tracks
        }
        const tracks = response.data.items.map((item) => {
            const artists = item.track.artists.map((artist) => artist.name);
            const artistString = artists.length > 1 ? artists.slice(0, -1).join(', ') + ' and ' + artists.slice(-1) : artists[0];
            return {
                track_id: item.track.id,
                uri: item.track.uri,
                albumName: item.track.album.name,
                href: item.track.external_urls.spotify,
                image: item.track.album.images[0].url,
                popularity: item.track.album.popularity,
                preview: item.track.preview_url,
                artists: artistString
            };
        });
        return tracks;
    });
}
exports.getPlaylistTracks = getPlaylistTracks;
function processPlaylists(response, authToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const playlists = response.playlists.items;
        let playlistSongs = [];
        let totalTracks = 0;
        for (const playlist of playlists) {
            const tracks = yield getPlaylistTracks(playlist.id, authToken);
            if (tracks.length + totalTracks <= 50) {
                playlistSongs = playlistSongs.concat(tracks);
                totalTracks += tracks.length;
            }
            else {
                const remainingTracks = 50 - totalTracks;
                playlistSongs = playlistSongs.concat(tracks.slice(0, remainingTracks));
                break;
            }
        }
        return playlistSongs;
    });
}
exports.processPlaylists = processPlaylists;
function createPlaylist(playlistName, authToken, userId, trackUris) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        };
        const requestData = {
            name: playlistName,
            public: false,
            collaborative: false,
            description: 'Created with MelodiMix',
        };
        const response = yield axios_1.default.post(`https://api.spotify.com/v1/users/${userId}/playlists`, requestData, config);
        const playlistId = response.data.id;
        yield addTracksToPlaylist(playlistId, authToken, trackUris);
        return playlistId;
    });
}
exports.createPlaylist = createPlaylist;
function addTracksToPlaylist(playlistId, authToken, trackUris) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        };
        const requestData = {
            uris: trackUris,
        };
        yield axios_1.default.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, requestData, config);
    });
}
