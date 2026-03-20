const axios = require('axios');
const fs = require('fs');

async function test() {
    const url = 'https://open.spotify.com/playlist/1K2fFljGxS6QTmz8o58Ese';
    const res = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const html = res.data;
    const startMarker = '<script id="__NEXT_DATA__" type="application/json">';
    const start = html.indexOf(startMarker) + startMarker.length;
    const end = html.indexOf('</script>', start);
    const jsonStr = html.substring(start, html.indexOf('</script>', start));
    const images = jsonStr.match(/https:\/\/[^\"]+\.jpg/g);
    console.log('Main Page - Total unique images found:', new Set(images).size);
    if (images) console.log('Sample images:', Array.from(new Set(images)).slice(0, 5));
    
    const data = JSON.parse(jsonStr);
    console.log('Top level keys:', Object.keys(data));
    if (data.props?.pageProps?.state) console.log('State exists!');
}

test().catch(console.error);
