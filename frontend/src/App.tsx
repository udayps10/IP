import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ScrollToTop } from '@/components/ScrollToTop'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { Dashboard } from '@/pages/Dashboard'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { NotFound } from '@/pages/NotFound'
import { Properties } from '@/pages/Properties'
import { PropertyDetail } from '@/pages/PropertyDetail'
import { Register } from '@/pages/Register'

function AppLayout() {
  const location = useLocation()
  const bare = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main className={bare ? '' : 'app__main'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!bare && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </ToastProvider>
  )
}
