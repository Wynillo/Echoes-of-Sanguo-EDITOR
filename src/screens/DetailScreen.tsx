import { useParams } from 'react-router-dom'
import CardEditor from '@/editors/CardEditor'
import OpponentEditor from '@/editors/OpponentEditor'
import CampaignEditor from '@/editors/CampaignEditor'
import ShopEditor from '@/editors/ShopEditor'
import FusionEditor from '@/editors/FusionEditor'
import RulesEditor from '@/editors/RulesEditor'
import LocalizationEditor from '@/editors/LocalizationEditor'
import ModInfoEditor from '@/editors/ModInfoEditor'

const EDITORS: Record<string, React.ComponentType> = {
  cards: CardEditor,
  opponents: OpponentEditor,
  campaign: CampaignEditor,
  shop: ShopEditor,
  fusion: FusionEditor,
  rules: RulesEditor,
  localization: LocalizationEditor,
  modinfo: ModInfoEditor,
}

export default function DetailScreen() {
  const { section } = useParams<{ section: string }>()
  const Editor = EDITORS[section ?? '']
  if (!Editor) return <div className="p-8 text-white">Unknown section: {section}</div>
  return <Editor />
}
