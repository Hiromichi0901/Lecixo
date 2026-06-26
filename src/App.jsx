// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Reader from './pages/Reader'
import Vocabulary from './pages/Vocabulary'
import Quiz from './pages/Quiz'
import { auth } from './services/firebase'

console.log('Firebase connected:', auth);


function App() {
  const location = useLocation();
  const isReaderPage = location.pathname === '/reader';

  return <div>
    {!isReaderPage && <Navbar />}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reader" element={<Reader />} />
      <Route path="/vocabulary" element={<Vocabulary />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
    
  </div>
}

export default App
