const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');

const app = express();

const client_id = '173495ba703a4560beb0512feaa35413';
const client_secret = '8b9d38e17d814411b300ef61646ba81b';

// SPOTIFY REQUIRES THIS TO BE EXACTLY "http://localhost..." OR "http://127.0.0.1..."
// An "https://localhost" URL will trigger the "Insecure" error!
const redirect_uri = 'http://127.0.0.1:8888/callback';

app.use(cors());

// Spotify will redirect exactly here after user logs in
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;

    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token } = response.data;

        // Redirect back to the Vite frontend UI
        res.redirect(`https://localhost:5173/callback?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        res.send(error.response ? error.response.data : error.message);
    }
});

// Add a fallback backend proxy to fetch tracks using Client Credentials
// This bypasses user-specific 403 errors for public and algorithmic playlists!
app.get('/api/tracks', async (req, res) => {
    const playlistId = req.query.id;
    if (!playlistId) return res.status(400).send('Missing id');

    try {
        // 1. Get Client Credentials Token
        const tokenResponse = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({ grant_type: 'client_credentials' }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
            }
        });
        const serverToken = tokenResponse.data.access_token;

        // 2. Fetch tracks using the server token
        const tracksResponse = await axios({
            method: 'get',
            url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
            headers: { 'Authorization': `Bearer ${serverToken}` }
        });

        res.json(tracksResponse.data);
    } catch (error) {
        console.error("Proxy fetch error:", error.response ? error.response.statusText : error.message);
        res.status(error.response ? error.response.status : 500).json(error.response ? error.response.data : { error: error.message });
    }
});

app.listen(8888, () => {
    console.log('Server running on port 8888 (HTTP)');
});
