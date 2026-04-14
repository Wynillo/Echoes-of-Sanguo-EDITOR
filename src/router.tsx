import { createHashRouter } from 'react-router-dom'
import StartScreen from './screens/StartScreen'
import DashboardScreen from './screens/DashboardScreen'
import SectionListScreen from './screens/SectionListScreen'
import DetailScreen from './screens/DetailScreen'
import { ProjectGuard } from './components/ProjectGuard'

export const router = createHashRouter([
  { path: '/', element: <StartScreen /> },
  {
    path: '/project',
    element: <ProjectGuard><DashboardScreen /></ProjectGuard>,
  },
  {
    path: '/project/:section',
    element: <ProjectGuard><SectionListScreen /></ProjectGuard>,
  },
  {
    path: '/project/:section/:id',
    element: <ProjectGuard><DetailScreen /></ProjectGuard>,
  },
])
