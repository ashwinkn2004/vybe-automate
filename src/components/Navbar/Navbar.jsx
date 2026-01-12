import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../../firebase.js'
import './Navbar.css'

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const handleAuthAction = () => {
    if (user) {
      signOut(auth).then(() => {
        navigate('/')
      }).catch((error) => {
        console.error("Error signing out:", error)
      })
    } else {
      navigate('/login')
    }
  }

  const goToHome = () => {
    navigate('/')
  }

  return (
    <>
      <div className="navbar">
        <div className="logo" onClick={goToHome}>
          <span>Vybe</span>Automate
        </div>
        <div className="signin-btn">
          <button onClick={handleAuthAction}>
            {user ? 'Logout' : 'Login'}
          </button>
        </div>
      </div>
    </>
  )
}

export default Navbar