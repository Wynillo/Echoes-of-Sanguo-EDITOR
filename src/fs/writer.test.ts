import { it, expect, vi } from 'vitest'
import { writeJsonFile } from './writer'

it('writes JSON to a file handle', async () => {
  const written: string[] = []
  const mockWritable = {
    write: vi.fn((s: string) => { written.push(s) }),
    close: vi.fn(),
  }
  const mockFH = { createWritable: vi.fn(async () => mockWritable) }
  const mockDir = {
    getFileHandle: vi.fn(async () => mockFH),
  } as unknown as FileSystemDirectoryHandle

  await writeJsonFile(mockDir, 'cards.json', [{ id: 1 }])
  expect(mockDir.getFileHandle).toHaveBeenCalledWith('cards.json', { create: true })
  expect(written[0]).toBe(JSON.stringify([{ id: 1 }], null, 2))
  expect(mockWritable.close).toHaveBeenCalled()
})
