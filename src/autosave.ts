import { useProjectStore } from './stores/projectStore'
import { saveProject } from './db/indexedDb'
import { scheduleSave } from './fs/writer'

let lastSaveId: string | null = null

export function startAutoSave(): () => void {
  return useProjectStore.subscribe((state) => {
    const { isLoaded, data } = state
    if (!isLoaded || !data.modInfo.id) return

    const projectId = data.modInfo.id

    scheduleSave(async () => {
      if (lastSaveId === projectId) return
      lastSaveId = projectId
      await saveProject(projectId, data)
    })
  })
}