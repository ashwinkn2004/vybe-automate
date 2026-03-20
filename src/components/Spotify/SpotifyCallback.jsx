import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenFromUrl, setAccessToken } from '../../services/spotifyService';

const SpotifyCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleCallback = () => {
            const { access_token } = getTokenFromUrl();

            if (access_token) {
                // Store the token and clear it from the URL
                setAccessToken(access_token);
                window.history.replaceState({}, document.title, '/');
                navigate('/', { replace: true });
            } else {
                // No token — something went wrong
                console.error('No access_token in callback URL');
                navigate('/');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '1rem',
            color: 'white',
            background: '#121212'
        }}>
            <h2>Connecting to Spotify...</h2>
            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Please wait while we authenticate you.</p>
        </div>
    );
};

export default SpotifyCallback;
