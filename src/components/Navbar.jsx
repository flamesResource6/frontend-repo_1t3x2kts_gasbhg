import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const linkCls = ({ isActive }) => `px-3 py-2 rounded-full text-sm font-semibold ${isActive ? 'bg-white text-slate-900' : 'text-white/90 hover:bg-white/10'}`

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-slate-950/70 border-b border-white/10">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white font-extrabold tracking-tight">
          <img src="/flame-icon.svg" alt="JPL" className="w-7 h-7" />
          <span>JPL</span>
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/matches" className={linkCls}>Matches</NavLink>
          <NavLink to="/teams" className={linkCls}>Teams</NavLink>
          <NavLink to="/stats" className={linkCls}>Stats</NavLink>
          <NavLink to="/news" className={linkCls}>News</NavLink>
          <NavLink to="/media" className={linkCls}>Media</NavLink>
          <NavLink to="/community" className={linkCls}>Community</NavLink>
          <NavLink to="/live" className={linkCls}>Live</NavLink>
        </div>
        <button className="md:hidden p-2 text-white" onClick={()=>setOpen(!open)} aria-label="Menu"><Menu /></button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95">
          <div className="max-w-6xl mx-auto px-4 py-3 grid gap-2">
            <NavLink to="/matches" onClick={()=>setOpen(false)} className={linkCls}>Matches</NavLink>
            <NavLink to="/teams" onClick={()=>setOpen(false)} className={linkCls}>Teams</NavLink>
            <NavLink to="/stats" onClick={()=>setOpen(false)} className={linkCls}>Stats</NavLink>
            <NavLink to="/news" onClick={()=>setOpen(false)} className={linkCls}>News</NavLink>
            <NavLink to="/media" onClick={()=>setOpen(false)} className={linkCls}>Media</NavLink>
            <NavLink to="/community" onClick={()=>setOpen(false)} className={linkCls}>Community</NavLink>
            <NavLink to="/live" onClick={()=>setOpen(false)} className={linkCls}>Live</NavLink>
          </div>
        </div>
      )}
    </header>
  )
}
