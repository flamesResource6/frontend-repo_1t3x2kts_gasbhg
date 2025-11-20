import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Stats() {
  const [batting, setBatting] = useState([])
  const [bowling, setBowling] = useState([])

  const firestoreEnabled = Boolean(db)

  useEffect(() => {
    if (!firestoreEnabled) return
    const load = async () => {
      const snap = await getDocs(collection(db, 'players'))
      const players = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const bat = [...players].sort((a,b)=> (b.totalStats?.runs||0) - (a.totalStats?.runs||0)).slice(0,10)
      const bowl = [...players].sort((a,b)=> (b.totalStats?.wickets||0) - (a.totalStats?.wickets||0)).slice(0,10)
      setBatting(bat)
      setBowling(bowl)
    }
    load()
  }, [firestoreEnabled])

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto grid gap-8">
        {!firestoreEnabled && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-300/30 text-amber-200 p-3">Connect Firebase to view live leaderboards.</div>
        )}
        <section>
          <h2 className="text-2xl font-extrabold">Batting Leaders</h2>
          <div className="mt-4 grid gap-2">
            {batting.map((p,i)=> (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-white/10 p-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-slate-400">{i+1}</span>
                  <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover"/>
                  <span className="font-semibold">{p.name}</span>
                </div>
                <div className="text-right text-slate-300">
                  <div className="font-bold">{p.totalStats?.runs ?? 0} runs</div>
                  <div className="text-xs">Avg {p.totalStats?.average ?? '-'} • SR {p.totalStats?.strikeRate ?? '-'}</div>
                </div>
              </div>
            ))}
            {!batting.length && <p className="text-slate-400">{firestoreEnabled ? 'Loading…' : 'No data'}</p>}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold">Bowling Leaders</h2>
          <div className="mt-4 grid gap-2">
            {bowling.map((p,i)=> (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-900/60 border border-white/10 p-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-slate-400">{i+1}</span>
                  <img src={p.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover"/>
                  <span className="font-semibold">{p.name}</span>
                </div>
                <div className="text-right text-slate-300">
                  <div className="font-bold">{p.totalStats?.wickets ?? 0} wkts</div>
                  <div className="text-xs">Eco {p.totalStats?.economy ?? '-'}</div>
                </div>
              </div>
            ))}
            {!bowling.length && <p className="text-slate-400">{firestoreEnabled ? 'Loading…' : 'No data'}</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
