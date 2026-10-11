import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import HomePage from './pages/HomePage.tsx'
import SubscriptionsPage from './pages/SubscriptionsPage.tsx'
import TotalPage from './pages/TotalPage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="subscription" element={<SubscriptionsPage />} />
          <Route path="total" element={<TotalPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
