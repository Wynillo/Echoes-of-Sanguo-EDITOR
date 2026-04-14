import { createHashRouter } from 'react-router-dom'
import StartScreen from './screens/StartScreen'
import DashboardScreen from './screens/DashboardScreen'
import SectionListScreen from './screens/SectionListScreen'
import DetailScreen from './screens/DetailScreen'
import { ProjectGuard } from './components/ProjectGuard'
import ProjectLayout from './components/ProjectLayout'

export const router = createHashRouter([
  { path: '/', element: <StartScreen /> },
  {
    path: '/project',
    element: <ProjectGuard><ProjectLayout /></ProjectGuard>,
    children: [
      { index: true, element: <DashboardScreen /> },
      { path: ':section', element: <SectionListScreen /> },
      { path: ':section/:id', element: <DetailScreen /> },
    ],
  },
])
