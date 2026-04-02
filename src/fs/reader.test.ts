import { it, expect, vi } from 'vitest'
import { readProjectFolder } from './reader'

function mockDir(files: Record<string, string>): FileSystemDirectoryHandle {
  return {
    kind: 'directory',
    getFileHandle: vi.fn(async (name: string) => ({
      getFile: async () => new File([files[name] ?? ''], name),
    })),
    getDirectoryHandle: vi.fn(async (name: string) => mockDir(
      Object.fromEntries(
        Object.entries(files)
          .filter(([k]) => k.startsWith(name + '/'))
          .map(([k, v]) => [k.replace(name + '/', ''), v])
      )
    )),
    values: vi.fn(async function* () {
      for (const name of Object.keys(files)) {
        yield { name, kind: 'file' }
      }
    }),
  } as unknown as FileSystemDirectoryHandle
}

it('reads cards and modInfo from project folder', async () => {
  const dir = mockDir({
    'cards.json': JSON.stringify([{ id: 1, type: 1, rarity: 1 }]),
    'mod.json': JSON.stringify({ id: 'test', name: 'Test MOD', version: '1.0.0',
      author: 'dev', type: 'base', description: '', minEngineVersion: '1.0.0', formatVersion: 2 }),
  })
  const data = await readProjectFolder(dir)
  expect(data.cards).toHaveLength(1)
  expect(data.modInfo?.name).toBe('Test MOD')
})
