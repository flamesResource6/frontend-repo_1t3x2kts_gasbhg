import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './Home'
import Matches from './pages/Matches'
import Stats from './pages/Stats'
import News from './pages/News'
import Media from './pages/Media'
import Community from './pages/Community'
import Live from './pages/Live'
import Player from './pages/Player'
import Teams from './pages/Teams'
import TeamHub from './pages/TeamHub'

export default function AppRouter(){
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/news" element={<News />} />
        <Route path="/media" element={<Media />} />
        <Route path="/community" element={<Community />} />
        <Route path="/live" element={<Live />} />
        <Route path="/players/:name" element={<Player />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:teamId" element={<TeamHub />} />
      </Routes>
    </div>
  )
}
