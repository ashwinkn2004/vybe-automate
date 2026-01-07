import React from 'react'
import './Home.css'
import spotifyLogo from '../../assets/spotify.svg'
import secureLogo from '../../assets/secure.svg'

function Home() {
    return (
        <>
            <div className="home">
                <div className="version-update">
                    <span className="dot"></span> v1 is live now
                </div>
                <div className="home-content">
                    <h1>Automate Your Vibe.</h1>
                    <p>Seamlessly curate, archive, and sync your Spotify library with intelligent automation tools. Connect your account to get started instantly.</p>
                    <button>
                        <img src={spotifyLogo} alt="Spotify Logo" />
                        Connect with Spotify
                    </button>
                    <div className="secure">
                        <img src={secureLogo} alt="Secure Logo" />
                        <p>100% Secure Spotify Integration.</p>
                    </div>
                    
                </div>
                <div className="footer">&copy; 2026 VybeAutomate. All rights reserved.</div>
            </div>
        </>
    )
}

export default Home