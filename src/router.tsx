import { createHashRouter } from 'react-router-dom'
import StartScreen from './screens/StartScreen'
import DashboardScreen from './screens/DashboardScreen'
import SectionListScreen from './screens/SectionListScreen'
import DetailScreen from './screens/DetailScreen'

export const router = createHashRouter([
  { path: '/', element: <StartScreen /> },
  { path: '/project', element: <DashboardScreen /> },
  { path: '/project/:section', element: <SectionListScreen /> },
  { path: '/project/:section/:id', element: <DetailScreen /> },
])
