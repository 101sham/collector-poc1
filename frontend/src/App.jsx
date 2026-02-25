import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import LoginPage from './pages/LoginPage'
import CallbackPage from './pages/CallbackPage'
import DashboardPage from './pages/DashboardPage'
import NewListingPage from './pages/NewListingPage'
import MyListingsPage from './pages/MyListingsPage'
import MyPurchasesPage from './pages/MyPurchasesPage'
import ListingDetailPage from './pages/ListingDetailPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-gray-500">Chargement...</div></div>
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function Auth0ProviderWithNavigate({ children }) {
  const navigate = useNavigate()
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/callback`,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      }}
      onRedirectCallback={(appState) => {
        navigate(appState?.returnTo || '/dashboard', { replace: true })
      }}
    >
      {children}
    </Auth0Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
          <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
          <Route path="/my-purchases" element={<ProtectedRoute><MyPurchasesPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  )
}