import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaXmark, FaChevronUp, FaChevronDown } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import type { EditorCampaignChapter, EditorCampaignNode } from '../types/project'

const NODE_TYPES = ['duel', 'story', 'reward', 'shop', 'branch'] as const

export default function CampaignEditor() {
  const navigate = useNavigate()
  const { data, dirHandle, setData } = useProjectStore()
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    data.campaign[0]?.id ?? null
  )
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null)
  // Local draft state for JSON fields keyed by `nodeId:field`
  const [jsonDrafts, setJsonDrafts] = useState<Record<string, string>>({})
  const [jsonErrors, setJsonErrors] = useState<Record<string, boolean>>({})

  const chapters = data.campaign
  const selectedChapter = chapters.find((c) => c.id === selectedChapterId) ?? null

  function save(next: EditorCampaignChapter[]) {
    setData('campaign', next)
    if (dirHandle) writeJsonFile(dirHandle, 'campaign.json', next).catch(console.error)
  }

  function addChapter() {
    const id = `chapter-${Date.now()}`
    const next = [...chapters, { id, title: 'New Chapter', nodes: [] }]
    save(next)
    setSelectedChapterId(id)
  }

  function updateChapter(id: string, patch: Partial<EditorCampaignChapter>) {
    save(chapters.map((c) => c.id === id ? { ...c, ...patch } : c))
  }

  function deleteChapter(id: string) {
    if (!confirm('Delete this chapter?')) return
    save(chapters.filter((c) => c.id !== id))
    if (selectedChapterId === id) setSelectedChapterId(chapters[0]?.id ?? null)
  }

  function addNode() {
    if (!selectedChapter) return
    const node: EditorCampaignNode = {
      id: `node-${Date.now()}`,
      type: 'duel',
      duels: [],
      unlockConditions: [],
      rewards: [],
    }
    updateChapter(selectedChapter.id, { nodes: [...selectedChapter.nodes, node] })
  }

  function updateNode(chapterId: string, nodeId: string, patch: Partial<EditorCampaignNode>) {
    save(chapters.map((c) => c.id === chapterId
      ? { ...c, nodes: c.nodes.map((n) => n.id === nodeId ? { ...n, ...patch } : n) }
      : c
    ))
  }

  function deleteNode(chapterId: string, nodeId: string) {
    if (!confirm('Delete this node?')) return
    save(chapters.map((c) => c.id === chapterId
      ? { ...c, nodes: c.nodes.filter((n) => n.id !== nodeId) }
      : c
    ))
  }

  function handleJsonChange(nodeId: string, field: string, text: string) {
    const key = `${nodeId}:${field}`
    setJsonDrafts((d) => ({ ...d, [key]: text }))
    try {
      JSON.parse(text)
      setJsonErrors((e) => ({ ...e, [key]: false }))
    } catch {
      setJsonErrors((e) => ({ ...e, [key]: true }))
    }
  }

  function commitJson(chapterId: string, nodeId: string, field: 'rewards' | 'unlockConditions') {
    const key = `${nodeId}:${field}`
    const text = jsonDrafts[key]
    if (text === undefined || jsonErrors[key]) return
    try {
      updateNode(chapterId, nodeId, { [field]: JSON.parse(text) } as any)
    } catch {}
  }

  function getJsonValue(nodeId: string, field: string, stored: unknown) {
    const key = `${nodeId}:${field}`
    return jsonDrafts[key] ?? JSON.stringify(stored ?? [], null, 2)
  }

  const inputCls = 'bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white'

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/project')} className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5">
          <FaArrowLeft size={12} /> Dashboard
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">Campaign</span>
      </div>

      <div className="flex gap-6">
        {/* Chapter list */}
        <div className="w-56 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Chapters</span>
            <button onClick={addChapter} className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 transition-colors">+ Add</button>
          </div>
          <div className="flex flex-col gap-1">
            {chapters.map((ch) => (
              <div key={ch.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer ${selectedChapterId === ch.id ? 'bg-indigo-900/50 border border-indigo-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                onClick={() => setSelectedChapterId(ch.id)}>
                <span className="flex-1 text-sm truncate">{ch.title}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteChapter(ch.id) }}
                  className="cursor-pointer text-red-400 text-xs opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"><FaXmark size={10} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Chapter detail */}
        {selectedChapter && (
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <input
                value={selectedChapter.title}
                onChange={(e) => updateChapter(selectedChapter.id, { title: e.target.value })}
                className={`${inputCls} text-lg font-semibold flex-1`}
                placeholder="Chapter title"
              />
              <button onClick={addNode} className="cursor-pointer bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm transition-colors">
                + Add Node
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {selectedChapter.nodes.map((node) => (
                <div key={node.id} className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800"
                    onClick={() => setExpandedNodeId(expandedNodeId === node.id ? null : node.id)}>
                    <span className="text-xs bg-gray-700 px-2 py-0.5 rounded font-mono">{node.type}</span>
                    <span className="text-sm flex-1">{node.id}</span>
                    <span className="text-gray-500">{expandedNodeId === node.id ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteNode(selectedChapter.id, node.id) }}
                      className="cursor-pointer text-red-400 transition-colors hover:text-red-300"><FaXmark size={10} /></button>
                  </div>

                  {expandedNodeId === node.id && (
                    <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-700 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Node ID</label>
                          <input value={node.id}
                            onChange={(e) => {
                              updateNode(selectedChapter.id, node.id, { id: e.target.value })
                              setExpandedNodeId(e.target.value)
                            }}
                            className={`${inputCls} w-full`} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Type</label>
                          <select value={node.type}
                            onChange={(e) => updateNode(selectedChapter.id, node.id, { type: e.target.value as any })}
                            className={`${inputCls} w-full`}>
                            {NODE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      {(node.type === 'duel' || node.type === 'branch') && (
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Story ID</label>
                          <input value={node.storyId ?? ''}
                            onChange={(e) => updateNode(selectedChapter.id, node.id, { storyId: e.target.value })}
                            className={`${inputCls} w-full`} placeholder="story_id_key" />
                        </div>
                      )}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Rewards (JSON){jsonErrors[`${node.id}:rewards`] && <span className="text-red-400 ml-2">invalid JSON</span>}
                        </label>
                        <textarea
                          value={getJsonValue(node.id, 'rewards', node.rewards)}
                          onChange={(e) => handleJsonChange(node.id, 'rewards', e.target.value)}
                          onBlur={() => commitJson(selectedChapter.id, node.id, 'rewards')}
                          className={`${inputCls} w-full font-mono text-xs ${jsonErrors[`${node.id}:rewards`] ? 'border-red-500' : ''}`}
                          rows={3} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">
                          Unlock Conditions (JSON){jsonErrors[`${node.id}:unlockConditions`] && <span className="text-red-400 ml-2">invalid JSON</span>}
                        </label>
                        <textarea
                          value={getJsonValue(node.id, 'unlockConditions', node.unlockConditions)}
                          onChange={(e) => handleJsonChange(node.id, 'unlockConditions', e.target.value)}
                          onBlur={() => commitJson(selectedChapter.id, node.id, 'unlockConditions')}
                          className={`${inputCls} w-full font-mono text-xs ${jsonErrors[`${node.id}:unlockConditions`] ? 'border-red-500' : ''}`}
                          rows={3} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {selectedChapter.nodes.length === 0 && (
                <div className="text-gray-500 text-sm text-center py-8">No nodes yet. Click "+ Add Node" to start.</div>
              )}
            </div>
          </div>
        )}

        {!selectedChapter && chapters.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            No chapters yet. Click "+ Add" to create the first chapter.
          </div>
        )}
      </div>
    </div>
  )
}
