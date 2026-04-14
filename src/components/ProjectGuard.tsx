import { type ReactNode, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/projectStore'
import { getLastProjectId } from '@/autosave'

export function ProjectGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const isLoaded = useProjectStore((s) => s.isLoaded)
  const loadFromIndexedDB = useProjectStore((s) => s.loadFromIndexedDB)
  const [restoring, setRestoring] = useState(!isLoaded)

  useEffect(() => {
    if (isLoaded) {
      setRestoring(false)
      return
    }

    const lastId = getLastProjectId()
    if (!lastId) {
      navigate('/', { replace: true })
      return
    }

    loadFromIndexedDB(lastId).then(() => {
      if (!useProjectStore.getState().isLoaded) {
        navigate('/', { replace: true })
      }
      setRestoring(false)
    })
  }, [isLoaded, loadFromIndexedDB, navigate])

  if (restoring) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Restoring project…</p>
      </div>
    )
  }

  return <>{children}</>
}
