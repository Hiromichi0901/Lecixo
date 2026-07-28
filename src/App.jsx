// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Reader from './pages/Reader'
import Vocabulary from './pages/Vocabulary'
import Dictionary from './pages/Dictionary'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isReaderPage = location.pathname === '/reader';

  if (loading) return <div>Loading...</div>;

  return <div>
    {!isReaderPage && <Navbar />}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reader" element={<Reader />} />
      <Route path="/vocabulary" element={<Vocabulary />} />
      <Route path="/dictionary" element={<Dictionary />} />
    </Routes>
    
  </div>
}

export default App
