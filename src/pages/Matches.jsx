import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Matches() {
  const [filter, setFilter] = useState('upcoming')
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const load = async () => {
      let q
      const now = new Date().toISOString()
      if (filter === 'upcoming') q = query(collection(db, 'matches'), where('date', '>=', now), orderBy('date', 'asc'))
      else if (filter === 'results') q = query(collection(db, 'matches'), where('status', '==', 'completed'), orderBy('date', 'desc'))
      else q = query(collection(db, 'matches'), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [filter])

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-2 mb-4">
          {['upcoming','results','all'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full border ${filter===f?'bg-white text-slate-900':'bg-slate-900/60 text-white border-white/10'}`}>{f}</button>
          ))}
        </div>
        <div className="grid gap-3">
          {matches.map(m => (
            <div key={m.id} className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
              <div className="text-slate-300 text-sm">{new Date(m.date).toLocaleString()} • {m.venue}</div>
              <div className="mt-1 text-lg font-semibold">{m.teams?.a} vs {m.teams?.b}</div>
              <div className="text-xs text-slate-400 mt-1">{m.status}</div>
            </div>
          ))}
          {!matches.length && <p className="text-slate-400">Loading…</p>}
        </div>
      </div>
    </div>
  )
}
