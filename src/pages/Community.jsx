export default function Community(){
  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-5xl mx-auto grid gap-10">
        <section>
          <h2 className="text-3xl font-extrabold">League Values</h2>
          <p className="mt-3 text-slate-300">Fair play, respect, and community-first. We champion talent, inclusivity, and the spirit of the game.</p>
        </section>
        <section>
          <h2 className="text-3xl font-extrabold">Vision</h2>
          <p className="mt-3 text-slate-300">To build India’s most vibrant amateur cricket platform that inspires participation and celebrates excellence.</p>
        </section>
        <section>
          <h2 className="text-3xl font-extrabold">Sponsors & Partners</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="aspect-video rounded-lg bg-slate-900/60 border border-white/10 flex items-center justify-center">Logo {i}</div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
