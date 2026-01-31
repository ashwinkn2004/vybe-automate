const CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID_HERE";
const REDIRECT_URI = "http://localhost:5173/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private"
];

// SAMPLE AUDIO URLS (Copyright Free / Creative Commons)
const SAMPLE_TRACKS = [
    { name: "Electronic Vibe", artist: "Demo Artist 1", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration: "6:12" },
    { name: "Coding Flow", artist: "Demo Artist 2", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", duration: "7:05" },
    { name: "Deep Focus", artist: "Demo Artist 3", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", duration: "5:44" },
    { name: "Energy Boost", artist: "Demo Artist 4", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", duration: "8:22" },
    { name: "Review Time", artist: "Demo Artist 5", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", duration: "4:32" }
];

// DEFAULT MOCK DATA
const DEFAULT_MOCK_PLAYLISTS = [
    {
        id: "mock1",
        name: "Chill Vibes 2026",
        description: "The best tracks to relax to while coding.",
        images: [{ url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=600&fit=crop" }],
        tracks: { total: 12 },
        items: [SAMPLE_TRACKS[0], SAMPLE_TRACKS[1], SAMPLE_TRACKS[2]]
    },
    {
        id: "mock2",
        name: "Gym Pump",
        description: "High energy tracks for the workout.",
        images: [{ url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop" }],
        tracks: { total: 45 },
        items: [SAMPLE_TRACKS[3], SAMPLE_TRACKS[1], SAMPLE_TRACKS[4]]
    },
    {
        id: "mock3",
        name: "Late Night Coding",
        description: "Lo-fi beats for deep focus work sessions.",
        images: [{ url: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=600&h=600&fit=crop" }],
        tracks: { total: 8 },
        items: [SAMPLE_TRACKS[2], SAMPLE_TRACKS[0]]
    },
    {
        id: "mock4",
        name: "Road Trip Classics",
        description: "Sing along to these timeless hits.",
        images: [{ url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=600&fit=crop" }],
        tracks: { total: 156 },
        items: [SAMPLE_TRACKS[4], SAMPLE_TRACKS[3]]
    },
    {
        id: "mock5",
        name: "Discovery Weekly",
        description: "Your weekly mixtape of fresh music. (Simulated)",
        images: [{ url: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=600&h=600&fit=crop" }],
        tracks: { total: 30 },
        items: [SAMPLE_TRACKS[0], SAMPLE_TRACKS[1], SAMPLE_TRACKS[2], SAMPLE_TRACKS[3]]
    }
];

// Helper to get mock data
const getMockPlaylists = () => {
    const stored = localStorage.getItem("mock_playlists");
    if (stored) {
        return JSON.parse(stored);
    }
    return DEFAULT_MOCK_PLAYLISTS;
};

// Helper to save mock data
const saveMockPlaylists = (playlists) => {
    localStorage.setItem("mock_playlists", JSON.stringify(playlists));
};

export const isDemoMode = () => {
    return localStorage.getItem("spotify_demo_mode") === "true";
};

export const setDemoMode = (enabled) => {
    if (enabled) {
        localStorage.setItem("spotify_demo_mode", "true");
        localStorage.setItem("spotify_token", "DEMO_TOKEN");
        localStorage.setItem("spotify_token_timestamp", Date.now());
        // Initialize mock data if not present
        if (!localStorage.getItem("mock_playlists")) {
            saveMockPlaylists(DEFAULT_MOCK_PLAYLISTS);
        }
    } else {
        localStorage.removeItem("spotify_demo_mode");
        logoutSpotify();
    }
};

export const getLoginUrl = () => {
    return `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}&show_dialog=true`;
};

export const getTokenFromUrl = () => {
    return window.location.hash
        .substring(1)
        .split("&")
        .reduce((initial, item) => {
            let parts = item.split("=");
            initial[parts[0]] = decodeURIComponent(parts[1]);
            return initial;
        }, {});
};

export const setAccessToken = (token) => {
    localStorage.setItem("spotify_token", token);
    localStorage.setItem("spotify_token_timestamp", Date.now());
};

export const getAccessToken = () => {
    const token = localStorage.getItem("spotify_token");
    const timestamp = localStorage.getItem("spotify_token_timestamp");
    if (token) {
        if (isDemoMode()) return token;
        if (timestamp && Date.now() - timestamp < 3600 * 1000) return token;
    }
    return null;
};

export const logoutSpotify = () => {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("spotify_token_timestamp");
    localStorage.removeItem("spotify_demo_mode");
};

// API Calls
export const fetchProfile = async (token) => {
    if (isDemoMode()) {
        return {
            display_name: "Demo User",
            email: "demo@example.com",
            images: [{ url: "https://ui-avatars.com/api/?name=Demo+User&background=1DB954&color=fff" }]
        };
    }
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.json();
};

export const fetchPlaylists = async (token) => {
    if (isDemoMode()) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ items: getMockPlaylists() });
            }, 600);
        });
    }

    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.json();
};

export const fetchPlaylistTracks = async (token, playlistId) => {
    if (isDemoMode()) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const playlists = getMockPlaylists();
                const playlist = playlists.find(p => p.id === playlistId);
                // Return items in Spotify's structure: { items: [ { track: ... } ] }
                if (playlist && playlist.items) {
                    const tracks = playlist.items.map(track => ({ track }));
                    resolve({ items: tracks });
                } else {
                    resolve({ items: [] });
                }
            }, 400);
        });
    }
    // Real API call would go here
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.json();
};

export const updatePlaylistDetails = async (token, playlistId, data) => {
    if (isDemoMode()) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const currentPlaylists = getMockPlaylists();
                const index = currentPlaylists.findIndex(p => p.id === playlistId);
                if (index !== -1) {
                    currentPlaylists[index] = { ...currentPlaylists[index], ...data };
                    saveMockPlaylists(currentPlaylists);
                    resolve(true);
                } else {
                    resolve(false);
                }
            }, 500);
        });
    }

    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.status === 200;
};
