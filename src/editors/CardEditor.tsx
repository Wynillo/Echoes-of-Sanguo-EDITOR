import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaArrowLeft, FaXmark } from 'react-icons/fa6'
import { useProjectStore } from '../stores/projectStore'
import { writeJsonFile } from '../fs/writer'
import CardPreview from '../components/CardPreview'
import ImagePicker from '../components/ImagePicker'
import EffectPicker from '../components/EffectPicker'
import QuickAddAttribute from '../components/QuickAddAttribute'
import QuickAddRace from '../components/QuickAddRace'
import type { EditorCard, EditorCardLocale, EditorAttribute, EditorRace } from '../types/project'

const CARD_TYPES = ['', 'Monster', 'Fusion', 'Spell', 'Trap', 'Equipment']
const RARITIES = [{ v: 1, l: 'Common' }, { v: 2, l: 'Uncommon' }, { v: 4, l: 'Rare' }, { v: 6, l: 'SuperRare' }, { v: 8, l: 'UltraRare' }]
const SPELL_TYPES = [{ v: 1, l: 'Normal' }, { v: 2, l: 'Targeted' }, { v: 3, l: 'From Grave' }, { v: 4, l: 'Field' }]

export default function CardEditor() {
  const { id } = useParams<{ section: string; id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data, dirHandle, updateCard, setData } = useProjectStore()

  const { attributes, races } = data
  const [quickAddField, setQuickAddField] = useState<string | null>(null)

  function addAttributeToStore(attr: EditorAttribute): number {
    const next = [...attributes, attr]
    setData('attributes', next)
    if (dirHandle) writeJsonFile(dirHandle, 'attributes.json', next).catch(console.error)
    return attr.id
  }

  function addRaceToStore(race: EditorRace): number {
    const next = [...races, race]
    setData('races', next)
    if (dirHandle) writeJsonFile(dirHandle, 'races.json', next).catch(console.error)
    return race.id
  }

  const cardId = parseInt(id ?? '0', 10)
  const card = data.cards.find((c) => c.id === cardId) ?? { id: cardId, type: 1, rarity: 1 } as EditorCard
  const locale = data.cardLocales.find((l) => l.id === cardId) ?? { id: cardId, name: '', description: '' }
  const image = data.images[cardId] ?? null
  const isMonster = card.type === 1 || card.type === 2
  const isEquipment = card.type === 5
  const isSpell = card.type === 3

  function patchCard(patch: Partial<EditorCard>) {
    updateCard(cardId, patch)
    if (dirHandle) writeJsonFile(dirHandle, 'cards.json', data.cards.map(c => c.id === cardId ? { ...c, ...patch } : c)).catch(console.error)
  }

  function patchLocale(patch: Partial<EditorCardLocale>) {
    const next = data.cardLocales.map(l => l.id === cardId ? { ...l, ...patch } : l)
    setData('cardLocales', next)
    if (dirHandle) writeJsonFile(dirHandle, 'locales/en.json', next).catch(console.error)
  }

  function patchImage(blob: Blob) {
    setData('images', { ...data.images, [cardId]: blob })
  }

  function handleDelete() {
    if (!confirm(t('editor.confirm_delete'))) return
    setData('cards', data.cards.filter(c => c.id !== cardId))
    setData('cardLocales', data.cardLocales.filter(l => l.id !== cardId))
    navigate('/project/cards')
  }

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50'
  const selCls = inputCls

  function field(label: string, element: React.ReactNode, fullWidth = false) {
    return (
      <div className={fullWidth ? 'col-span-2' : ''}>
        <label className="text-xs text-gray-400 mb-1 block">{label}</label>
        {element}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/project/cards')}
          className="cursor-pointer flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-2 py-1 -ml-2 rounded hover:bg-white/5"
        >
          <FaArrowLeft size={12} /> {t('section.cards')}
        </button>
        <span className="text-gray-600">/</span>
        <span className="font-semibold">{locale.name || `Card ${cardId}`}</span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={handleDelete}
            className="cursor-pointer text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg border border-red-800 transition-colors"
          >
            {t('editor.delete')}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Form */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {field(t('card.name'), (
            <input value={locale.name} onChange={(e) => patchLocale({ name: e.target.value })} className={inputCls} />
          ))}
          {field(t('card.description'), (
            <textarea value={locale.description} onChange={(e) => patchLocale({ description: e.target.value })} className={inputCls} rows={3} />
          ), true)}
          {field(t('card.type'), (
            <select value={card.type} onChange={(e) => patchCard({ type: parseInt(e.target.value) as EditorCard['type'] })} className={selCls}>
              {CARD_TYPES.map((l, v) => v > 0 && <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {field(t('card.rarity'), (
            <select value={card.rarity} onChange={(e) => patchCard({ rarity: parseInt(e.target.value) as EditorCard['rarity'] })} className={selCls}>
              {RARITIES.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {isMonster && field(t('card.level'), (
            <input type="number" min={1} max={12} value={card.level ?? 1}
              onChange={(e) => patchCard({ level: parseInt(e.target.value) })} className={inputCls} />
          ))}
          {isMonster && field(t('card.atk'), (
            <input type="number" min={0} value={card.atk ?? 0}
              onChange={(e) => patchCard({ atk: parseInt(e.target.value) })} className={inputCls} />
          ))}
          {isMonster && field(t('card.def'), (
            <input type="number" min={0} value={card.def ?? 0}
              onChange={(e) => patchCard({ def: parseInt(e.target.value) })} className={inputCls} />
          ))}
          {(isMonster || isEquipment) && field(t('card.attribute'), (
            <div>
              <div className="flex gap-2">
                <select
                  value={card.attribute ?? ''}
                  onChange={(e) => patchCard({ attribute: parseInt(e.target.value) || undefined })}
                  className={`${selCls} flex-1`}
                >
                  <option value="">— none —</option>
                  {attributes.map((a) => (
                    <option key={a.id} value={a.id}>{a.value}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setQuickAddField(quickAddField === 'attribute' ? null : 'attribute')}
                  className="bg-gray-700 hover:bg-gray-600 px-2 rounded text-sm"
                >+</button>
              </div>
              {quickAddField === 'attribute' && (
                <QuickAddAttribute
                  existingIds={attributes.map((a) => a.id)}
                  onAdd={(attr) => { patchCard({ attribute: addAttributeToStore(attr) }); setQuickAddField(null) }}
                  onCancel={() => setQuickAddField(null)}
                />
              )}
            </div>
          ))}
          {(isMonster || isEquipment) && field(t('card.race'), (
            <div>
              <div className="flex gap-2">
                <select
                  value={card.race ?? ''}
                  onChange={(e) => patchCard({ race: parseInt(e.target.value) || undefined })}
                  className={`${selCls} flex-1`}
                >
                  <option value="">— none —</option>
                  {races.map((r) => (
                    <option key={r.id} value={r.id}>{r.value}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setQuickAddField(quickAddField === 'race' ? null : 'race')}
                  className="bg-gray-700 hover:bg-gray-600 px-2 rounded text-sm"
                >+</button>
              </div>
              {quickAddField === 'race' && (
                <QuickAddRace
                  existingIds={races.map((r) => r.id)}
                  onAdd={(race) => { patchCard({ race: addRaceToStore(race) }); setQuickAddField(null) }}
                  onCancel={() => setQuickAddField(null)}
                />
              )}
            </div>
          ))}
          {isEquipment && (
            <>
              {field('ATK Bonus', (
                <input type="number" value={card.atkBonus ?? 0} onChange={(e) => patchCard({ atkBonus: parseInt(e.target.value) })} className={inputCls} />
              ))}
              {field('DEF Bonus', (
                <input type="number" value={card.defBonus ?? 0} onChange={(e) => patchCard({ defBonus: parseInt(e.target.value) })} className={inputCls} />
              ))}
              {field('Equip Req. Attribute', (
                <div>
                  <div className="flex gap-2">
                    <select
                      value={card.equipReqAttr ?? ''}
                      onChange={(e) => patchCard({ equipReqAttr: parseInt(e.target.value) || undefined })}
                      className={`${selCls} flex-1`}
                    >
                      <option value="">— any —</option>
                      {attributes.map((a) => (
                        <option key={a.id} value={a.id}>{a.value}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setQuickAddField(quickAddField === 'equipReqAttr' ? null : 'equipReqAttr')}
                      className="bg-gray-700 hover:bg-gray-600 px-2 rounded text-sm"
                    >+</button>
                  </div>
                  {quickAddField === 'equipReqAttr' && (
                    <QuickAddAttribute
                      existingIds={attributes.map((a) => a.id)}
                      onAdd={(attr) => { patchCard({ equipReqAttr: addAttributeToStore(attr) }); setQuickAddField(null) }}
                      onCancel={() => setQuickAddField(null)}
                    />
                  )}
                </div>
              ))}
              {field('Equip Req. Race', (
                <div>
                  <div className="flex gap-2">
                    <select
                      value={card.equipReqRace ?? ''}
                      onChange={(e) => patchCard({ equipReqRace: parseInt(e.target.value) || undefined })}
                      className={`${selCls} flex-1`}
                    >
                      <option value="">— any —</option>
                      {races.map((r) => (
                        <option key={r.id} value={r.id}>{r.value}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setQuickAddField(quickAddField === 'equipReqRace' ? null : 'equipReqRace')}
                      className="bg-gray-700 hover:bg-gray-600 px-2 rounded text-sm"
                    >+</button>
                  </div>
                  {quickAddField === 'equipReqRace' && (
                    <QuickAddRace
                      existingIds={races.map((r) => r.id)}
                      onAdd={(race) => { patchCard({ equipReqRace: addRaceToStore(race) }); setQuickAddField(null) }}
                      onCancel={() => setQuickAddField(null)}
                    />
                  )}
                </div>
              ))}
            </>
          )}
          {isSpell && field('Spell Type', (
            <select value={card.spellType ?? 1} onChange={(e) => patchCard({ spellType: parseInt(e.target.value) as EditorCard['spellType'] })} className={selCls}>
              {SPELL_TYPES.map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {field(t('card.effect'), (
            <EffectPicker value={card.effect ?? ''} onChange={(v) => patchCard({ effect: v || undefined })} />
          ))}
          {/* Multi-effect list */}
          <div className="col-span-2">
            <label className="text-xs text-gray-400 mb-1 block">Additional Effects</label>
            {(card.effects ?? []).map((eff, i) => (
              <div key={i} className="flex gap-2 items-center mb-1">
                <EffectPicker value={eff.trigger ?? ''} onChange={(v) => {
                  const next = [...(card.effects ?? [])]
                  next[i] = { ...next[i], trigger: v }
                  patchCard({ effects: next })
                }} />
                <button
                  onClick={() => patchCard({ effects: (card.effects ?? []).filter((_, j) => j !== i) })}
                  className="cursor-pointer text-red-400 hover:text-red-300 flex-shrink-0 transition-colors"
                >
                  <FaXmark size={10} />
                </button>
              </div>
            ))}
            <button
              onClick={() => patchCard({ effects: [...(card.effects ?? []), { trigger: '', actions: [] }] })}
              className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 mt-1 transition-colors"
            >
              + Add effect
            </button>
          </div>
        </div>

        {/* Preview + Image */}
        <div className="flex flex-col gap-4 items-center w-48 flex-shrink-0">
          <CardPreview card={card} locale={locale} image={image} />
          {field(t('card.artwork'), (
            <ImagePicker currentImage={image} onImageChange={patchImage} />
          ))}
        </div>
      </div>
    </div>
  )
}
