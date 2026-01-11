import React from 'react'
import './Navbar.css'

function Navbar() {
    const handleLogin =()=>{
        
    }
  return (
    <>
    <div className="navbar">
        <div className="logo">
            <span>Vybe</span>Automate
        </div>
        <div className="signin-btn">
            <button onClick={handleLogin}>Login</button>
        </div>
    </div>
    </>
  )
}

export default Navbar