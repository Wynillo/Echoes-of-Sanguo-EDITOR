import type { ProjectData } from '../types/project'

const DB_NAME = 'eos-editor-projects'
const DB_VERSION = 1
const STORE_NAME = 'projects'

interface StoredProject {
  id: string
  name: string
  savedAt: number
  data: ProjectData
}

export interface ProjectMeta {
  id: string
  name: string
  savedAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function saveProject(id: string, name: string, data: ProjectData): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.put({ id, name, savedAt: Date.now(), data })
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadProject(id: string): Promise<ProjectData | null> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const request = store.get(id)
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const result = request.result as StoredProject | undefined
      resolve(result?.data ?? null)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const request = store.getAll()
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const results = request.result as StoredProject[]
      const sorted = results
        .map((p) => ({ id: p.id, name: p.name, savedAt: p.savedAt }))
        .sort((a, b) => b.savedAt - a.savedAt)
      resolve(sorted)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  const store = tx.objectStore(STORE_NAME)
  store.delete(id)
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getProjectCount(): Promise<number> {
  const db = await openDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const request = store.count()
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getOldestProject(): Promise<ProjectMeta | null> {
  const projects = await listProjects()
  if (projects.length === 0) return null
  return projects[projects.length - 1]
}