export async function readJsonFile(
  dir: FileSystemDirectoryHandle,
  path: string
): Promise<unknown> {
  const parts = path.split('/')
  let current = dir
  for (const part of parts.slice(0, -1)) {
    current = await current.getDirectoryHandle(part)
  }
  const fh = await current.getFileHandle(parts[parts.length - 1])
  const file = await fh.getFile()
  const text = await file.text()
  return JSON.parse(text)
}

export async function writeJsonFile(
  dir: FileSystemDirectoryHandle,
  path: string,
  data: unknown
): Promise<void> {
  const parts = path.split('/')
  let current = dir
  for (const part of parts.slice(0, -1)) {
    current = await current.getDirectoryHandle(part, { create: true })
  }
  const fh = await current.getFileHandle(parts[parts.length - 1], { create: true })
  const writable = await (fh as any).createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
}

export async function writeBinaryFile(
  dir: FileSystemDirectoryHandle,
  path: string,
  data: ArrayBuffer | Blob
): Promise<void> {
  const parts = path.split('/')
  let current = dir
  for (const part of parts.slice(0, -1)) {
    current = await current.getDirectoryHandle(part, { create: true })
  }
  const fh = await current.getFileHandle(parts[parts.length - 1], { create: true })
  const writable = await (fh as any).createWritable()
  await writable.write(data)
  await writable.close()
}

// Debounced auto-save scheduler
let timer: ReturnType<typeof setTimeout> | null = null
export function scheduleSave(fn: () => Promise<void>, delay = 500): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    fn().catch((e) => {
      console.error('[autosave] Failed to save project:', e)
    })
  }, delay)
}
