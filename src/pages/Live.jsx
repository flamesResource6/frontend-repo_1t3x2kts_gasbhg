import { useEffect, useState } from 'react'
import { ref as dbRef, onValue } from 'firebase/database'
import { rtdb } from '../lib/firebase'

export default function Live(){
  const [matchId, setMatchId] = useState('demo')
  const [data, setData] = useState(null)

  useEffect(()=>{
    const r = dbRef(rtdb, `/live_scores/${matchId}`)
    const unsub = onValue(r, (snap)=> setData(snap.val()))
    return () => unsub()
  }, [matchId])

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-3xl mx-auto grid gap-6">
        <div className="flex gap-2 items-center">
          <input value={matchId} onChange={e=>setMatchId(e.target.value)} placeholder="matchId" className="px-3 py-2 rounded bg-slate-900 border border-white/10" />
          <span className="text-slate-400 text-sm">Listening to /live_scores/{matchId}</span>
        </div>
        <div className="rounded-xl bg-slate-900/60 border border-white/10 p-5">
          {data ? (
            <div className="grid gap-2">
              <div className="text-3xl font-extrabold">{data.current_score} <span className="text-slate-400 text-xl">({data.current_overs})</span></div>
              <div className="text-slate-300">{data.latest_ball_update}</div>
            </div>
          ) : <p className="text-slate-400">Waiting for updates…</p>}
        </div>
      </div>
    </div>
  )
}
