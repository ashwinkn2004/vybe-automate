import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../firebase'
import { loginWithSpotify, getAccessToken } from '../../services/spotifyService'
import PlaylistList from '../Spotify/PlaylistList'
import './Home.css'
import spotifyLogo from '../../assets/spotify.svg'
import secureLogo from '../../assets/secure.svg'

function Home() {
    const [user, setUser] = useState(null);
    const [spotifyToken, setSpotifyToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check for Spotify Token
                const token = getAccessToken();
                setSpotifyToken(token);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleConnectClick = async () => {
        if (!user) {
            navigate('/login');
        } else {
            await loginWithSpotify(); // Starts PKCE OAuth flow
        }
    };

    if (loading) return <div className="home"><div className="home-content">Loading...</div></div>;

    // If user is logged in and has spotify token, show the dashboard
    if (user && spotifyToken) {
        return (
            <div className="home dashboard-mode">
                <div className="version-update">
                    <span className="dot"></span> v1 is live now
                </div>
                <PlaylistList />
                <div className="footer">&copy; 2026 VybeAutomate. All rights reserved.</div>
            </div>
        );
    }

    // Otherwise show the landing page
    return (
        <div className="home">
            <div className="version-update">
                <span className="dot"></span> v1 is live now
            </div>
            <div className="home-content">
                <h1>Automate Your Vibe.</h1>
                <p>Seamlessly curate, archive, and sync your Spotify library with intelligent automation tools. Connect your account to get started instantly.</p>
                <div className="button-group">
                    <button onClick={handleConnectClick}>
                        <img src={spotifyLogo} alt="Spotify Logo" />
                        {user ? "Connect with Spotify" : "Login to Connect"}
                    </button>
                    {user && (
                        <button
                            onClick={() => {
                                import('../../services/spotifyService').then(module => {
                                    module.setDemoMode(true);
                                    window.location.reload();
                                });
                            }}
                            style={{ background: 'transparent', border: '1px solid #fff', color: '#fff' }}
                        >
                            Try Demo Mode
                        </button>
                    )}
                </div>
                <div className="secure">
                    <img src={secureLogo} alt="Secure Logo" />
                    <p>100% Secure Spotify Integration.</p>
                </div>

            </div>
            <div className="footer">&copy; 2026 VybeAutomate. All rights reserved.</div>
        </div>
    )
}

export default Home