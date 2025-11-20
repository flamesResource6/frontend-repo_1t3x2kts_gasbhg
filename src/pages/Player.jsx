import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Player() {
  const { name } = useParams()
  const [player, setPlayer] = useState(null)
  const [team, setTeam] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const load = async () => {
      // Find player by exact name match
      const q = query(collection(db, 'players'), where('name', '==', decodeURIComponent(name)))
      const snap = await getDocs(q)
      const p = snap.docs[0] ? { id: snap.docs[0].id, ...snap.docs[0].data() } : null
      setPlayer(p)

      if (p?.teamId) {
        try {
          const teamSnap = await getDoc(doc(db, 'teams', p.teamId))
          if (teamSnap.exists()) setTeam({ id: teamSnap.id, ...teamSnap.data() })
        } catch {}
      }

      // Pull recent matches and extract player's performance
      try {
        const mSnap = await getDocs(query(collection(db, 'matches'), orderBy('date', 'desc'), limit(20)))
        const all = mSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        const parsed = []
        for (const m of all) {
          const sc = m.scorecard || m.fullScorecard || {}
          let perf = null
          // Common shapes: scorecard.players[playerId] or scorecard.innings[].batting/bowling arrays
          if (p && sc.players && sc.players[p.id]) {
            perf = sc.players[p.id]
          } else if (p && Array.isArray(sc.innings)) {
            for (const inn of sc.innings) {
              if (!perf && Array.isArray(inn.batting)) {
                const found = inn.batting.find(x => x.playerId === p.id || x.name === p.name)
                if (found) perf = { batting: found }
              }
              if (!perf && Array.isArray(inn.bowling)) {
                const foundB = inn.bowling.find(x => x.playerId === p.id || x.name === p.name)
                if (foundB) perf = { ...(perf||{}), bowling: foundB }
              }
            }
          }
          if (perf) parsed.push({ match: m, perf })
          if (parsed.length >= 5) break
        }
        setLogs(parsed)
      } catch {}
    }
    load()
  }, [name])

  const jersey = useMemo(()=> player?.jerseyNumber || player?.jersey || '-', [player])

  if (!player) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
        <div className="max-w-4xl mx-auto"><p className="text-slate-400">Loading player…</p></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <img src={player.photoUrl} alt={player.name} className="w-40 h-40 object-cover rounded-2xl border border-white/10" />
          <div>
            <h1 className="text-3xl font-extrabold">{player.name}</h1>
            <p className="text-slate-300 mt-1">{team?.name || '—'} • Jersey #{jersey}</p>
            <p className="text-slate-400 text-sm mt-2">{player.role} • {player.battingStyle} • {player.bowlingStyle}</p>
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-bold">Match Log (last 5)</h2>
          <div className="mt-3 grid gap-3">
            {logs.map((l, i) => (
              <div key={i} className="rounded-xl bg-slate-900/60 border border-white/10 p-4">
                <div className="text-xs text-slate-400">{new Date(l.match.date).toLocaleDateString()} • {l.match.venue} • {l.match.teams?.a} vs {l.match.teams?.b}</div>
                <div className="mt-1 flex flex-wrap gap-4 text-slate-200">
                  {l.perf?.batting && (
                    <span>Bat: {l.perf.batting.runs ?? l.perf.batting.R ?? '-'} ({l.perf.batting.balls ?? l.perf.batting.B ?? '-'})</span>
                  )}
                  {l.perf?.bowling && (
                    <span>Bowl: {l.perf.bowling.wickets ?? l.perf.bowling.W ?? 0}/{l.perf.bowling.runs ?? l.perf.bowling.R ?? '-'} in {l.perf.bowling.overs ?? l.perf.bowling.O ?? '-'}</span>
                  )}
                </div>
              </div>
            ))}
            {!logs.length && <p className="text-slate-400">No recent performances found.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
