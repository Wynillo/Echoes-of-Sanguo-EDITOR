/**
 * Global auto-save subscriber.
 * Debounces all project data to disk on every store change (500 ms).
 * Individual editors also write immediately on field change — this is the safety net.
 */
import { useProjectStore } from './stores/projectStore'
import { writeJsonFile, scheduleSave } from './fs/writer'

export function startAutoSave(): () => void {
  return useProjectStore.subscribe((state) => {
    const { isLoaded, dirHandle, data } = state
    if (!isLoaded || !dirHandle) return
    const dir = dirHandle
    scheduleSave(async () => {
      await Promise.all([
        writeJsonFile(dir, 'cards.json', data.cards),
        writeJsonFile(dir, 'locales/en.json', data.cardLocales),
        writeJsonFile(dir, 'opponents.json', data.opponents),
        writeJsonFile(dir, 'campaign.json', data.campaign),
        writeJsonFile(dir, 'shop.json', data.shop),
        writeJsonFile(dir, 'fusion_formulas.json', data.fusion),
        writeJsonFile(dir, 'rules.json', data.rules),
        writeJsonFile(dir, 'mod.json', {
          id: data.modInfo.id, name: data.modInfo.name, version: data.modInfo.version,
          author: data.modInfo.author, type: data.modInfo.type,
          description: data.modInfo.description, minEngineVersion: data.modInfo.minEngineVersion,
        }),
        writeJsonFile(dir, 'manifest.json', {
          formatVersion: data.modInfo.formatVersion,
          name: data.modInfo.name,
          author: data.modInfo.author,
        }),
      ])
    })
  })
}
