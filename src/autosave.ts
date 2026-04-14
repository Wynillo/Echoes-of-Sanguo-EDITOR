import { useProjectStore } from './stores/projectStore'
import { saveProject } from './db/indexedDb'
import { scheduleSave } from './fs/writer'

export function startAutoSave(): () => void {
  return useProjectStore.subscribe((state) => {
    const { isLoaded, data } = state
    if (!isLoaded || !data.modInfo.id) return

    const projectId = data.modInfo.id

    scheduleSave(async () => {
      const latest = useProjectStore.getState()
      await saveProject(projectId, latest.data.modInfo.name || projectId, latest.data)
    })
  })
}