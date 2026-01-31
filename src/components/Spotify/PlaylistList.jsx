import React, { useEffect, useState } from 'react';
import { getAccessToken, fetchPlaylists, fetchProfile, updatePlaylistDetails, logoutSpotify, isDemoMode } from '../../services/spotifyService';
import './Spotify.css';

const PlaylistList = () => {
    const [playlists, setPlaylists] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [viewingPlaylist, setViewingPlaylist] = useState(null); // Playlist being viewed
    const [tracks, setTracks] = useState([]); // Tracks for the viewing playlist
    const [currentTrack, setCurrentTrack] = useState(null); // Track currently playing
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio] = useState(new Audio());

    // Edit state
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '' });

    useEffect(() => {
        const initData = async () => {
            const token = getAccessToken();
            if (token) {
                try {
                    const [playlistData, profileData] = await Promise.all([
                        fetchPlaylists(token),
                        fetchProfile(token)
                    ]);

                    if (playlistData.error && playlistData.error.status === 401) {
                        handleLogout();
                        return;
                    }
                    if (playlistData.items) {
                        setPlaylists(playlistData.items);
                    }
                    setProfile(profileData);
                } catch (error) {
                    console.error("Error fetching data:", error);
                }
            }
            setLoading(false);
        };
        initData();

        // Clean up audio on unmount
        return () => {
            audio.pause();
            audio.src = "";
        };
    }, []);

    // Audio handlers
    useEffect(() => {
        if (currentTrack) {
            audio.src = currentTrack.url || "";
            if (isPlaying) audio.play().catch(e => console.error(e));
        }
    }, [currentTrack, audio, isPlaying]);

    useEffect(() => {
        if (isPlaying) {
            audio.play().catch(e => console.error(e));
        } else {
            audio.pause();
        }
    }, [isPlaying, audio]);

    const playTrack = (track) => {
        if (currentTrack && currentTrack.name === track.name) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentTrack(track);
            setIsPlaying(true);
        }
    };

    const handlePlaylistClick = async (playlist) => {
        setViewingPlaylist(playlist);
        setLoading(true);
        const token = getAccessToken();
        if (token) {
            // Lazy load tracks if real API, mock handles it nicely
            import('../../services/spotifyService').then(async mod => {
                const trackData = await mod.fetchPlaylistTracks(token, playlist.id);
                if (trackData.items) {
                    setTracks(trackData.items);
                }
                setLoading(false);
            });
        }
    };

    const handleBackToPlaylists = () => {
        setViewingPlaylist(null);
        setTracks([]);
        setCurrentTrack(null); // Stop playing when going back
        setIsPlaying(false);
    };

    const handleEditClick = (e, playlist) => {
        e.stopPropagation(); // Prevent opening the playlist
        setEditingPlaylist(playlist);
        setEditForm({
            name: playlist.name,
            description: playlist.description || ''
        });
    };

    const handleSave = async () => {
        const token = getAccessToken();
        if (token && editingPlaylist) {
            try {
                const success = await updatePlaylistDetails(token, editingPlaylist.id, {
                    name: editForm.name,
                    description: editForm.description
                });

                if (success) {
                    // Update local state
                    setPlaylists(playlists.map(p =>
                        p.id === editingPlaylist.id
                            ? { ...p, name: editForm.name, description: editForm.description }
                            : p
                    ));
                    if (viewingPlaylist && viewingPlaylist.id === editingPlaylist.id) {
                        setViewingPlaylist({ ...viewingPlaylist, name: editForm.name, description: editForm.description });
                    }
                    setEditingPlaylist(null);
                } else {
                    alert("Failed to update playlist. You might not have permission.");
                }
            } catch (error) {
                console.error("Error updating playlist:", error);
                alert("Error updating playlist.");
            }
        }
    };

    const handleLogout = () => {
        audio.pause();
        logoutSpotify();
        window.location.reload();
    };

    if (loading && !viewingPlaylist) return <div className="spotify-container">Loading...</div>;

    return (
        <div className="spotify-container">
            <div className="spotify-header">
                <div>
                    {viewingPlaylist ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={handleBackToPlaylists} className="back-btn">← Back</button>
                            <h2>{viewingPlaylist.name}</h2>
                        </div>
                    ) : (
                        <>
                            <h2>Your Playlists {isDemoMode() && <span className="demo-badge">DEMO</span>}</h2>
                            {profile && <p style={{ color: '#b3b3b3', marginTop: '0.5rem' }}>Logged in as {profile.display_name}</p>}
                        </>
                    )}
                </div>
                <button onClick={handleLogout} className="logout-btn">Disconnect Spotify</button>
            </div>

            {viewingPlaylist ? (
                <div className="tracks-list">
                    <div className="playlist-info-header">
                        {viewingPlaylist.images && viewingPlaylist.images.length > 0 && <img src={viewingPlaylist.images[0].url} alt="" className="playlist-cover-large" />}
                        <div className="playlist-meta">
                            <h3>{viewingPlaylist.name}</h3>
                            <p dangerouslySetInnerHTML={{ __html: viewingPlaylist.description }}></p>
                            <p>{tracks.length} Tracks</p>
                            <button className="edit-btn-inline" onClick={(e) => handleEditClick(e, viewingPlaylist)}>Edit Details</button>
                        </div>
                    </div>

                    <div className="track-rows">
                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Loading tracks...</div>
                        ) : (
                            tracks.map((item, index) => {
                                const track = item.track;
                                const isActive = currentTrack && currentTrack.name === track.name;
                                return (
                                    <div key={index} className={`track-row ${isActive ? 'active-track' : ''}`} onClick={() => playTrack(track)}>
                                        <div className="track-index">
                                            {isActive && isPlaying ? "⏸" : isActive ? "▶" : index + 1}
                                        </div>
                                        <div className="track-info">
                                            <div className="track-name" style={isActive ? { color: '#1DB954' } : {}}>{track.name}</div>
                                            <div className="track-artist">{track.artist}</div>
                                        </div>
                                        <div className="track-duration">{track.duration}</div>
                                    </div>
                                );
                            })
                        )}
                        {!loading && tracks.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No tracks available in this demo playlist.</div>}
                    </div>
                </div>
            ) : (
                <div className="playlist-grid">
                    {playlists.map(playlist => (
                        <div key={playlist.id} className="playlist-card" onClick={() => handlePlaylistClick(playlist)}>
                            <div className="card-image-wrapper">
                                {playlist.images && playlist.images.length > 0 ? (
                                    <img src={playlist.images[0].url} alt={playlist.name} className="playlist-image" />
                                ) : (
                                    <div className="playlist-image-placeholder">No Image</div>
                                )}
                                <div className="play-icon-overlay">▶</div>
                            </div>
                            <h3 className="playlist-name">{playlist.name}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <p className="playlist-desc" dangerouslySetInnerHTML={{ __html: playlist.description }}></p>
                                <button className="edit-btn-icon" onClick={(e) => handleEditClick(e, playlist)}>✎</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Player Bar if a track is selected */}
            {currentTrack && (
                <div className="player-bar">
                    <div className="player-track-info">
                        <div className="player-track-name">{currentTrack.name}</div>
                        <div className="player-track-artist">{currentTrack.artist}</div>
                    </div>
                    <div className="player-controls">
                        <button onClick={() => setIsPlaying(!isPlaying)} className="play-pause-btn">
                            {isPlaying ? "⏸" : "▶"}
                        </button>
                    </div>
                </div>
            )}

            {editingPlaylist && (
                <div className="modal-overlay" onClick={() => setEditingPlaylist(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3>Edit Playlist</h3>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                rows="3"
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setEditingPlaylist(null)}>Cancel</button>
                            <button className="btn-save" onClick={handleSave}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistList;
