import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { SubscriptionsProvider } from './context/SubscriptionsContext.jsx'
import HomePage from './pages/HomePage.jsx'
import SubscriptionsPage from './pages/SubscriptionsPage.jsx'
import TotalPage from './pages/TotalPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <SubscriptionsProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="subscription" element={<SubscriptionsPage />} />
            <Route path="total" element={<TotalPage />} />
          </Route>
        </Routes>
      </SubscriptionsProvider>
    </BrowserRouter>
  )
}
