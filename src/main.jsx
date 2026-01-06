import { createRoot } from 'react-dom/client'
import './index.css'
import Navbar from './components/Navbar/Navbar'
import Home from './components/Home/Home'

createRoot(document.getElementById('root')).render(
  <>
    <Navbar />
    <Home />
  </>
)
