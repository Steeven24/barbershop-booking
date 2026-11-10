import { BrowserRouter, Route, Routes } from 'react-router'
import AuthProvider from './auth/AuthProvider'
import RequireAuth from './auth/RequireAuth'
import AdminLayout from './components/admin/AdminLayout'
import Layout from './components/Layout'
import AgendaPage from './pages/admin/AgendaPage'
import BarbersPage from './pages/admin/BarbersPage'
import LoginPage from './pages/admin/LoginPage'
import ServicesPage from './pages/admin/ServicesPage'
import BookingPage from './pages/BookingPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="reservar" element={<BookingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="admin/login" element={<LoginPage />} />
          <Route
            path="admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AgendaPage />} />
            <Route path="barberos" element={<BarbersPage />} />
            <Route path="servicios" element={<ServicesPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
