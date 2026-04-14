import { Outlet } from 'react-router-dom'
import TopBar from '@/components/TopBar'
import ValidationBanner from '@/components/ValidationBanner'

export default function ProjectLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <TopBar />
      <ValidationBanner />
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  )
}
