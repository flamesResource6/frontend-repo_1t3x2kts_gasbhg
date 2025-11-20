import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Spline from '@splinetool/react-spline'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from './lib/firebase'

function HomeHero() {
  return (
    <div className="relative h-[65vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4Tf9WOIaWs6LOezG/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 h-full w-full bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow">Jain Premier League</h1>
        <p className="mt-4 text-slate-100/90 max-w-xl">High-energy cricket. Live scores, schedules, stats and stories — all powered in real-time.</p>
        <div className="mt-6 flex items-center gap-3">
          <Link to="/matches" className="bg-white/90 hover:bg-white text-slate-900 font-semibold px-5 py-2 rounded-full transition">Matches</Link>
          <Link to="/stats" className="bg-slate-900/70 hover:bg-slate-900 text-white border border-white/20 font-semibold px-5 py-2 rounded-full transition">Stats</Link>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [news, setNews] = useState([])
  const [points, setPoints] = useState([])
  const [nextMatch, setNextMatch] = useState(null)

  const firestoreEnabled = Boolean(db)

  useEffect(() => {
    if (!firestoreEnabled) return
    const load = async () => {
      try {
        const newsSnap = await getDocs(query(collection(db, 'news'), orderBy('date', 'desc'), limit(10)))
        setNews(newsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {}
      try {
        const teamsSnap = await getDocs(query(collection(db, 'teams'), orderBy('points', 'desc'), limit(6)))
        setPoints(teamsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {}
      try {
        const matchesSnap = await getDocs(query(collection(db, 'matches'), orderBy('date', 'asc'), limit(1)))
        setNextMatch(matchesSnap.docs[0] ? { id: matchesSnap.docs[0].id, ...matchesSnap.docs[0].data() } : null)
      } catch {}
    }
    load()
  }, [firestoreEnabled])

  const countdown = useMemo(() => {
    if (!nextMatch?.date) return null
    const diff = new Date(nextMatch.date) - new Date()
    if (diff <= 0) return 'Live soon'
    const d = Math.floor(diff / (1000*60*60*24))
    const h = Math.floor((diff / (1000*60*60)) % 24)
    const m = Math.floor((diff / (1000*60)) % 60)
    return `${d}d ${h}h ${m}m`
  }, [nextMatch])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <HomeHero />

      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8">
        {!firestoreEnabled && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-300/30 text-amber-200 p-4">
            <p className="font-semibold">Firebase isn’t configured yet.</p>
            <p className="text-sm mt-1">Add your VITE_FIREBASE_* env vars to enable live data. Until then, the UI will render without data.</p>
          </div>
        )}

        <section className="rounded-2xl bg-slate-900/60 border border-white/10 p-6">
          <h2 className="text-xl font-bold">Next Match</h2>
          {nextMatch ? (
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-slate-300">{new Date(nextMatch.date).toLocaleString()} • {nextMatch.venue}</p>
                <p className="text-2xl font-semibold mt-1">{nextMatch?.teams?.a} vs {nextMatch?.teams?.b}</p>
              </div>
              <div className="text-2xl font-extrabold bg-slate-800/80 px-4 py-2 rounded-lg">{countdown || '—'}</div>
            </div>
          ) : (
            <p className="text-slate-400 mt-2">{firestoreEnabled ? 'Loading…' : 'Connect Firebase to see data'}</p>
          )}
        </section>

        <section className="rounded-2xl bg-slate-900/60 border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Points Table</h2>
            <Link to="/matches" className="text-sm text-sky-300">See full table</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {points.map((t, i) => (
              <div key={t.id} className="rounded-xl bg-slate-800/70 p-3 border border-white/10">
                <p className="text-sm text-slate-300">{i+1}. {t.name}</p>
                <p className="text-lg font-bold">{t.points} pts</p>
                <p className="text-xs text-slate-400">NRR {t.nrr ?? '—'}</p>
              </div>
            ))}
            {!points.length && <p className="text-slate-400">{firestoreEnabled ? 'Loading…' : 'No data'}</p>}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-900/60 border border-white/10 p-0 overflow-hidden">
          <div className="bg-slate-800/70 px-6 py-3 font-semibold">Latest News</div>
          <div className="p-6 overflow-x-auto whitespace-nowrap scrollbar-thin">
            {news.length ? news.map(n => (
              <Link key={n.id} to={`/news`} className="inline-block align-top mr-4 w-72 bg-slate-800/60 border border-white/10 rounded-xl p-4">
                <div className="text-sm text-slate-400">{new Date(n.date).toLocaleDateString()}</div>
                <div className="mt-1 font-bold line-clamp-2">{n.title}</div>
                <div className="text-xs text-slate-400 mt-2">{n.category}</div>
              </Link>
            )) : <p className="text-slate-400">{firestoreEnabled ? 'Loading…' : 'No news yet'}</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
