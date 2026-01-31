import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenFromUrl, setAccessToken } from '../../services/spotifyService';

const SpotifyCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = getTokenFromUrl();
        if (hash.access_token) {
            setAccessToken(hash.access_token);
            // Navigate back to home or dashboard, clearing the hash
            navigate('/', { replace: true });
        } else {
            // Handle error or cancellation
            navigate('/');
        }
    }, [navigate]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            background: '#121212'
        }}>
            <h2>Connecting to Spotify...</h2>
        </div>
    );
};

export default SpotifyCallback;
