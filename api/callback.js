// Vercel Serverless Function: /api/callback
// Handles Spotify OAuth code exchange and redirects back to the frontend

const axios = require('axios');
const querystring = require('querystring');

const client_id = process.env.SPOTIFY_CLIENT_ID || '173495ba703a4560beb0512feaa35413';
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

module.exports = async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).json({ error: 'Missing code parameter' });
    }

    // Derive origin dynamically from the incoming request so this works on
    // vybe.ashwinkn.tech, any Vercel preview URL, or localhost — automatically.
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'vybe.ashwinkn.tech';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${protocol}://${host}`;

    // This MUST match exactly what the frontend sent to Spotify during login
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || `${origin}/api/callback`;
    // Send tokens back to the React frontend
    const frontendUrl = process.env.FRONTEND_URL || origin;

    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret,
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token } = response.data;

        // Redirect back to the React /callback route with tokens in query params
        res.redirect(`${frontendUrl}/callback?access_token=${access_token}&refresh_token=${refresh_token}`);
    } catch (error) {
        console.error('Spotify token exchange error:', error.response?.data || error.message);
        res.status(500).json({ error: error.response ? error.response.data : error.message });
    }
};
