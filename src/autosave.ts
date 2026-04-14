import { useProjectStore } from './stores/projectStore'
import { saveProject } from './db/indexedDb'
import { scheduleSave } from './fs/writer'

const LAST_PROJECT_KEY = 'eos-editor-last-project'

export function setLastProjectId(id: string): void {
  localStorage.setItem(LAST_PROJECT_KEY, id)
}

export function getLastProjectId(): string | null {
  return localStorage.getItem(LAST_PROJECT_KEY)
}

export function clearLastProjectId(): void {
  localStorage.removeItem(LAST_PROJECT_KEY)
}

export function startAutoSave(): () => void {
  return useProjectStore.subscribe((state) => {
    const { isLoaded, data } = state
    if (!isLoaded || !data.modInfo.id) return

    const projectId = data.modInfo.id

    scheduleSave(async () => {
      const latest = useProjectStore.getState()
      setLastProjectId(projectId)
      await saveProject(projectId, latest.data.modInfo.name || projectId, latest.data)
    })
  })
}