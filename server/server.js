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
        // Bypass 403 entirely by scraping the public Spotify Embed page for the playlist
        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
        const embedRes = await axios.get(embedUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'no-cache'
            }
        });
        
        // Extract the JSON data from the embed HTML
        const html = embedRes.data;
        const match = html.match(/<script id=\"__NEXT_DATA__\" type=\"application\/json\">(.+?)<\/script>/) 
                    || html.match(/<script id=\"initial-state\" type=\"text\/plain\">(.+?)<\/script>/); // fallback ID
        
        if (!match) {
            console.error("Scraper failed to find data script in HTML");
            throw new Error("Could not find embed data in Spotify page. Spotify might have changed their layout.");
        }
        
        let nextData;
        try {
            nextData = JSON.parse(match[1]);
        } catch (e) {
            // Some versions are base64 encoded strings in initial-state
            const decoded = Buffer.from(match[1], 'base64').toString('utf8');
            nextData = JSON.parse(decoded);
        }

        // Navigate the complex Next.js data structure for tracks
        const entity = nextData.props?.pageProps?.state?.data?.entity || nextData.entities?.items?.[playlistId] || {};
        const trackList = entity.trackList || (entity.tracks && entity.tracks.items) || [];
        const playlistCover = entity.coverArt?.sources?.[0]?.url || entity.images?.[0]?.url || null;
        
        // Map Embed data format back to expected Spotify API format
        const items = trackList.map(item => {
            const raw = item.track || item;
            // Try every possible image location in the Spotify embed/internal data format
            const coverArtUrl = raw.coverArt?.sources?.[0]?.url 
                             || raw.album?.images?.[0]?.url 
                             || raw.coverArt?.custom?.url 
                             || raw.images?.[0]?.url
                             || raw.albumCoverArt?.sources?.[0]?.url
                             || playlistCover; // Fallback to playlist cover if individual track cover is missing

            return {
                track: {
                    id: raw.id || raw.uri?.split(':').pop(),
                    name: raw.title || raw.name,
                    artists: raw.subtitle ? raw.subtitle.split(', ').map(name => ({ name })) : (raw.artists || []),
                    duration_ms: raw.duration || raw.duration_ms, 
                    preview_url: raw.audioPreview?.url || raw.preview_url || null,
                    uri: raw.uri,
                    album: {
                        images: coverArtUrl ? [{ url: coverArtUrl }] : []
                    }
                }
            };
        });

        console.log(`Successfully scraped ${items.length} tracks for playlist ${playlistId}`);
        res.json({ items });
    } catch (error) {
        console.error("Proxy fetch error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(8888, () => {
    console.log('Server running on port 8888 (HTTP)');
});
