import { useEffect, useState } from 'react'
import { getDownloadURL, listAll, ref } from 'firebase/storage'
import { storage } from '../lib/firebase'

export default function Media() {
  const [photos, setPhotos] = useState([])
  const [videos, setVideos] = useState([
    // Example YouTube IDs – replace with Firestore-driven if needed
    'dQw4w9WgXcQ'
  ])

  useEffect(() => {
    const load = async () => {
      try {
        const albumRef = ref(storage, 'media/photos')
        const res = await listAll(albumRef)
        const urls = await Promise.all(res.items.map(i => getDownloadURL(i)))
        setPhotos(urls)
      } catch (e) {
        // ignore if bucket path missing
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-6xl mx-auto grid gap-10">
        <section>
          <h2 className="text-2xl font-extrabold mb-4">Photo Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((p, i) => (
              <img key={i} src={p} className="w-full h-40 object-cover rounded-lg border border-white/10" />
            ))}
            {!photos.length && <p className="text-slate-400">No photos yet</p>}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-extrabold mb-4">Highlight Videos</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map(id => (
              <div key={id} className="aspect-video w-full rounded-lg overflow-hidden border border-white/10">
                <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${id}`} title="YouTube video" allowFullScreen></iframe>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
