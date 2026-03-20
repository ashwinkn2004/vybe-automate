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

app.listen(8888, () => {
    console.log('Server running on port 8888 (HTTP)');
});
