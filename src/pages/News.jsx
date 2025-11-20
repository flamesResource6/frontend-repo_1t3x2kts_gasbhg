import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function News() {
  const [tab, setTab] = useState('Match Reports')
  const [articles, setArticles] = useState([])

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, 'news'), where('category', '==', tab), orderBy('date', 'desc'))
      const snap = await getDocs(q)
      setArticles(snap.docs.map(d=> ({ id: d.id, ...d.data() })))
    }
    load()
  }, [tab])

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-2 mb-6">
          {['Match Reports','Player Features'].map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-full border ${tab===t?'bg-white text-slate-900':'bg-slate-900/60 text-white border-white/10'}`}>{t}</button>
          ))}
        </div>
        <div className="grid gap-4">
          {articles.map(a => (
            <article key={a.id} className="rounded-xl bg-slate-900/60 border border-white/10 p-5">
              <div className="text-xs text-slate-400">{new Date(a.date).toLocaleDateString()} • {a.author}</div>
              <h3 className="mt-1 text-xl font-bold">{a.title}</h3>
              <div className="prose prose-invert max-w-none mt-3" dangerouslySetInnerHTML={{ __html: a.contentHtml }} />
            </article>
          ))}
          {!articles.length && <p className="text-slate-400">Loading…</p>}
        </div>
      </div>
    </div>
  )
}
