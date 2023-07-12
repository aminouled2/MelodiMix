import axios, { AxiosRequestConfig } from 'axios';

export async function fetchPlaylists(mood: string, authToken: string): Promise<any> {
  const config: AxiosRequestConfig = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  };

  const response = await axios.get(`https://api.spotify.com/v1/search?q=${mood}&type=playlist`, config);

  return response.data;
}

export async function getPlaylistTracks(playlistId: string, authToken: string): Promise<string[]> {
  const config: AxiosRequestConfig = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  };

  const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, config);

  if (!response.data.items) {
    return []; // Return an empty array if there are no tracks
  }

  const tracks = response.data.items
    .filter((item: any) => item.track && item.track.type === 'track') // Filter out albums
    .map((item: any) => {
      const artists = item.track.artists.map((artist: any) => artist.name);
      const artistString = artists.length > 1 ? artists.slice(0, -1).join(', ') + ' and ' + artists.slice(-1) : artists[0];

      return {
        track_id: item.track.id,
        uri: item.track.uri,
        albumName: item.track.album.name,
        href: item.track.external_urls.spotify,
        image: item.track.album.images[0]?.url,
        popularity: item.track.album.popularity,
        preview: item.track.preview_url,
        artists: artistString
      };
    });

  return tracks;
}



export async function processPlaylists(response: any, authToken: string): Promise<string[]> {
  const playlists = response.playlists.items;
  const totalSongs = 25;

  let playlistSongs: string[] = [];
  let totalTracks = 0;

  const calculateRemainingTracks = () => totalSongs - totalTracks;

  for (const playlist of playlists) {
    const tracks = await getPlaylistTracks(playlist.id, authToken);
    let remainingTracks = calculateRemainingTracks();

    if (remainingTracks <= 0) {
      break;
    }

    if (tracks.length <= remainingTracks) {
      playlistSongs = playlistSongs.concat(tracks);
      totalTracks += tracks.length;
    } else {
      playlistSongs = playlistSongs.concat(tracks.slice(0, remainingTracks));
      totalTracks += remainingTracks;
      break;
    }
  }

  return playlistSongs;
}



export async function createPlaylist(playlistName: string, authToken: string, userId: string, trackUris: string[]): Promise<string> {
  const config: AxiosRequestConfig = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  const requestData = {
    name: playlistName,
    public: false,
    description: 'Created with MelodiMix',
  };

  const response = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, requestData, config);
  const playlistId = response.data.id;

  await addTracksToPlaylist(playlistId, authToken, trackUris);

  return playlistId;
}

async function addTracksToPlaylist(playlistId: string, authToken: string, trackUris: string[]): Promise<void> {
  const config: AxiosRequestConfig = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  };

  const requestData = {
    uris: trackUris,
  };

  await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, requestData, config);
}
