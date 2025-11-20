import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)

  const firestoreEnabled = Boolean(db)

  useEffect(() => {
    const load = async () => {
      if (!db) return
      try {
        const snap = await getDocs(query(collection(db, 'teams'), orderBy('name', 'asc')))
        setTeams(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) {
        console.warn('Failed to load teams', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold">Teams</h1>
        {!firestoreEnabled && (
          <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-300/30 text-amber-200 p-4">
            Connect Firebase to see live team data.
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {teams.map(t => (
            <Link key={t.id} to={`/teams/${t.id}`} className="group rounded-2xl bg-slate-900/60 border border-white/10 p-4 hover:border-white/20 transition">
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-800/60 border border-white/10 flex items-center justify-center">
                {t.logoUrl ? (
                  <img src={t.logoUrl} alt={t.name} className="w-20 h-20 object-contain" />
                ) : (
                  <div className="text-slate-400 text-sm">No Logo</div>
                )}
              </div>
              <div className="mt-3 font-semibold group-hover:text-white/90">{t.name || 'Unnamed Team'}</div>
            </Link>
          ))}
          {!loading && !teams.length && (
            <p className="text-slate-400 col-span-full">No teams found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
