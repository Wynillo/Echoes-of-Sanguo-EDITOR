import { loadTcgFile } from '@wynillo/tcg-format'
import type { TcgLoadResult } from '@wynillo/tcg-format'
import JSZip from 'jszip'
import type { ProjectData } from '../types/project'

export type { TcgLoadResult }

export async function openTcgFile(file: File): Promise<TcgLoadResult> {
  const buf = await file.arrayBuffer()
  return loadTcgFile(buf)
}

export async function exportTcgToBlob(
  data: ProjectData,
): Promise<Blob> {
  const zip = new JSZip()

  zip.file('cards.json', JSON.stringify(data.cards, null, 2))
  zip.file('locales/en.json', JSON.stringify(data.cardLocales, null, 2))
  zip.file('opponents.json', JSON.stringify(data.opponents, null, 2))
  zip.file('campaign.json', JSON.stringify(data.campaign, null, 2))
  zip.file('shop.json', JSON.stringify(data.shop, null, 2))
  zip.file('fusion_formulas.json', JSON.stringify(data.fusion, null, 2))
  zip.file('rules.json', JSON.stringify(data.rules, null, 2))
  zip.file('attributes.json', JSON.stringify(data.attributes, null, 2))
  zip.file('races.json', JSON.stringify(data.races, null, 2))
  zip.file('mod.json', JSON.stringify({
    id: data.modInfo.id,
    name: data.modInfo.name,
    version: data.modInfo.version,
    author: data.modInfo.author,
    type: data.modInfo.type,
    description: data.modInfo.description,
    minEngineVersion: data.modInfo.minEngineVersion,
  }, null, 2))
  zip.file('manifest.json', JSON.stringify({
    formatVersion: data.modInfo.formatVersion,
    name: data.modInfo.name,
    author: data.modInfo.author,
  }, null, 2))

  // Add images from store
  for (const [id, blob] of Object.entries(data.images)) {
    const buf = await blob.arrayBuffer()
    zip.file(`img/${id}.png`, buf)
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
