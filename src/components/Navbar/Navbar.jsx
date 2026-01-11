import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  const goToHome = () =>{
    navigate('/')
  }

  return (
    <>
      <div className="navbar">
        <div className="logo" onClick={goToHome}>
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