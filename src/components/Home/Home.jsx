import React from 'react'
import './Home.css'
import spotifyLogo from '../../assets/spotify.svg'

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
                </div>
            </div>
        </>
    )
}

export default Home