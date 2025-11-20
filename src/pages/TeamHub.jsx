import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

function Tab({ id, active, onClick, children }) {
  return (
    <button onClick={() => onClick(id)} className={`px-4 py-2 rounded-full text-sm font-semibold border ${active ? 'bg-white text-slate-900 border-white' : 'text-white/80 border-white/20 hover:border-white/40'}`}>
      {children}
    </button>
  )
}

export default function TeamHub() {
  const { teamId } = useParams()
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('players')

  const firestoreEnabled = Boolean(db)

  useEffect(() => {
    const load = async () => {
      if (!db) return
      try {
        const teamSnap = await getDoc(doc(db, 'teams', teamId))
        if (teamSnap.exists()) setTeam({ id: teamSnap.id, ...teamSnap.data() })
      } catch (e) { console.warn('team load failed', e) }

      try {
        const pSnap = await getDocs(query(collection(db, 'players'), where('teamId', '==', teamId)))
        setPlayers(pSnap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.warn('players load failed', e) }

      try {
        // Load matches where this team participated — by matching either teams.a or teams.b to team name or id
        // Prefer filtering by ID if stored, else fallback to name match
        const mSnap = await getDocs(query(collection(db, 'matches'), orderBy('date', 'desc')))
        const all = mSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        const filtered = all.filter(m => {
          const a = m.teams?.a
          const b = m.teams?.b
          return a === teamId || b === teamId || a === team?.name || b === team?.name
        })
        setMatches(filtered)
      } catch (e) { console.warn('matches load failed', e) }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId])

  const results = useMemo(() => {
    const upcoming = []
    const completed = []
    const now = new Date()
    for (const m of matches) {
      const dt = m.date ? new Date(m.date) : null
      const st = (m.status || '').toLowerCase()
      if (dt && dt > now && st !== 'completed' && st !== 'finished') upcoming.push(m)
      else completed.push(m)
    }
    return { upcoming: upcoming.sort((a,b)=> new Date(a.date)-new Date(b.date)), completed: completed.sort((a,b)=> new Date(b.date)-new Date(a.date)) }
  }, [matches])

  const formGuide = useMemo(() => {
    // Build last 5 results W/L based on matches where result.winner is teamId or team.name
    const arr = []
    for (const m of matches.filter(m=> (m.status||'').toLowerCase() === 'completed')) {
      if (arr.length >= 5) break
      const winner = m.result?.winner || m.winner
      const tname = team?.name
      const win = (winner === teamId) || (tname && winner === tname)
      arr.push(win ? 'W' : 'L')
    }
    return arr
  }, [matches, team, teamId])

  if (!firestoreEnabled) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-slate-300">Connect Firebase to view team details.</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="text-slate-400">Loading team…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
            {team.logoUrl ? <img src={team.logoUrl} alt={team.name} className="w-20 h-20 object-contain" /> : <div className="text-slate-400 text-sm">No Logo</div>}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{team.name}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-slate-200">
              <span className="px-3 py-1 rounded-full bg-slate-900/70 border border-white/10">Pts: {team.points ?? '—'}</span>
              <span className="px-3 py-1 rounded-full bg-slate-900/70 border border-white/10">NRR: {team.nrr ?? '—'}</span>
              {typeof team.wins === 'number' || typeof team.losses === 'number' ? (
                <span className="px-3 py-1 rounded-full bg-slate-900/70 border border-white/10">W/L: {team.wins ?? 0}/{team.losses ?? 0}</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-2">
          <Tab id="players" active={tab==='players'} onClick={setTab}>Players</Tab>
          <Tab id="matches" active={tab==='matches'} onClick={setTab}>Matches</Tab>
          <Tab id="stats" active={tab==='stats'} onClick={setTab}>Stats</Tab>
        </div>

        {/* Content */}
        <div className="mt-6">
          {tab === 'players' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {players.map(p => (
                <Link key={p.id} to={`/players/${encodeURIComponent(p.name)}`} className="rounded-2xl bg-slate-900/60 border border-white/10 p-3 hover:border-white/20 transition">
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-800/60 border border-white/10">
                    {p.photoUrl ? <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No Photo</div>}
                  </div>
                  <div className="mt-2 font-semibold">{p.name}</div>
                  <div className="text-xs text-slate-400">{p.role} • #{p.jerseyNumber ?? p.jersey ?? '-'}
                  </div>
                </Link>
              ))}
              {!players.length && <p className="text-slate-400 col-span-full">No players listed.</p>}
            </div>
          )}

          {tab === 'matches' && (
            <div className="grid gap-3">
              {/* Upcoming */}
              <div className="rounded-xl bg-slate-900/60 border border-white/10">
                <div className="px-4 py-2 bg-slate-800/70 font-semibold rounded-t-xl">Upcoming Fixtures</div>
                <div className="p-4 grid gap-3">
                  {results.upcoming.map(m => (
                    <div key={m.id} className="rounded-lg bg-slate-900/60 border border-white/10 p-3">
                      <div className="text-sm text-slate-300">{new Date(m.date).toLocaleString()} • {m.venue}</div>
                      <div className="font-semibold">{m.teams?.a} vs {m.teams?.b}</div>
                      <div className="text-xs text-slate-400">Status: {m.status || 'Scheduled'}</div>
                    </div>
                  ))}
                  {!results.upcoming.length && <p className="text-slate-400">No upcoming fixtures.</p>}
                </div>
              </div>

              {/* Completed */}
              <div className="rounded-xl bg-slate-900/60 border border-white/10">
                <div className="px-4 py-2 bg-slate-800/70 font-semibold rounded-t-xl">Completed Results</div>
                <div className="p-4 grid gap-3">
                  {results.completed.map(m => (
                    <div key={m.id} className="rounded-lg bg-slate-900/60 border border-white/10 p-3">
                      <div className="text-sm text-slate-300">{new Date(m.date).toLocaleDateString()} • {m.venue}</div>
                      <div className="font-semibold">{m.teams?.a} vs {m.teams?.b}</div>
                      <div className="text-xs text-slate-400">{m.result?.summary || m.summary || m.status || ''}</div>
                    </div>
                  ))}
                  {!results.completed.length && <p className="text-slate-400">No results yet.</p>}
                </div>
              </div>
            </div>
          )}

          {tab === 'stats' && (
            <div className="grid gap-4">
              <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
                <div className="font-semibold">Points Table Position</div>
                <TeamPointsMini teamId={teamId} />
              </div>
              <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
                <div className="font-semibold">Form Guide (last 5)</div>
                <div className="mt-2 flex items-center gap-2">
                  {formGuide.length ? formGuide.map((r, i) => (
                    <span key={i} className={`w-8 h-8 grid place-items-center rounded ${r==='W' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'}`}>{r}</span>
                  )) : <p className="text-slate-400">No recent matches.</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TeamPointsMini({ teamId }) {
  const [rows, setRows] = useState([])
  useEffect(() => {
    const load = async () => {
      if (!db) return
      try {
        const snap = await getDocs(query(collection(db, 'teams'), orderBy('points', 'desc')))
        setRows(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch {}
    }
    load()
  }, [teamId])

  const idx = useMemo(() => rows.findIndex(r => r.id === teamId), [rows, teamId])

  if (!rows.length) return <p className="text-slate-400">Loading…</p>

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="min-w-[520px] w-full text-sm">
        <thead>
          <tr className="text-left text-slate-400">
            <th className="py-2 pr-3">#</th>
            <th className="py-2 pr-3">Team</th>
            <th className="py-2 pr-3">Pts</th>
            <th className="py-2 pr-3">NRR</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id} className={`border-t border-white/10 ${r.id===teamId ? 'bg-white/5 font-semibold' : ''}`}>
              <td className="py-2 pr-3">{i+1}</td>
              <td className="py-2 pr-3">{r.name}</td>
              <td className="py-2 pr-3">{r.points ?? '—'}</td>
              <td className="py-2 pr-3">{r.nrr ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {idx >= 0 && (
        <div className="text-xs text-slate-400 mt-2">Current position: {idx+1} of {rows.length}</div>
      )}
    </div>
  )
}
