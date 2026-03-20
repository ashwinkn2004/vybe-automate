// Vercel Serverless Function: /api/tracks
// Proxies track fetching from Spotify embed pages to bypass 403 errors

const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS for the frontend domain
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'https://vybe.ashwinkn.tech');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const playlistId = req.query.id;
    if (!playlistId) return res.status(400).json({ error: 'Missing id parameter' });

    try {
        // Scrape the public Spotify Embed page for the playlist (bypasses 403 entirely)
        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
        const embedRes = await axios.get(embedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Cache-Control': 'no-cache',
            },
        });

        // Extract the JSON data from the embed HTML
        const html = embedRes.data;
        const match =
            html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/) ||
            html.match(/<script id="initial-state" type="text\/plain">(.+?)<\/script>/);

        if (!match) {
            console.error('Scraper failed to find data script in HTML');
            throw new Error('Could not find embed data in Spotify page. Spotify might have changed their layout.');
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
        const entity =
            nextData.props?.pageProps?.state?.data?.entity ||
            nextData.entities?.items?.[playlistId] ||
            {};
        const trackList = entity.trackList || (entity.tracks && entity.tracks.items) || [];
        const playlistCover = entity.coverArt?.sources?.[0]?.url || entity.images?.[0]?.url || null;

        // Map Embed data format back to expected Spotify API format
        const items = trackList.map((item) => {
            const raw = item.track || item;
            const coverArtUrl =
                raw.coverArt?.sources?.[0]?.url ||
                raw.album?.images?.[0]?.url ||
                raw.coverArt?.custom?.url ||
                raw.images?.[0]?.url ||
                raw.albumCoverArt?.sources?.[0]?.url ||
                playlistCover;

            return {
                track: {
                    id: raw.id || raw.uri?.split(':').pop(),
                    name: raw.title || raw.name,
                    artists: raw.subtitle
                        ? raw.subtitle.split(', ').map((name) => ({ name }))
                        : raw.artists || [],
                    duration_ms: raw.duration || raw.duration_ms,
                    preview_url: raw.audioPreview?.url || raw.preview_url || null,
                    uri: raw.uri,
                    album: {
                        images: coverArtUrl ? [{ url: coverArtUrl }] : [],
                    },
                },
            };
        });

        console.log(`Successfully scraped ${items.length} tracks for playlist ${playlistId}`);
        res.json({ items });
    } catch (error) {
        console.error('Proxy fetch error:', error.message);
        res.status(500).json({ error: error.message });
    }
};
