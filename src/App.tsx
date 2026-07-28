import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SubscriptionProvider } from './context/SubscriptionContext'
import AuthGuard from './guards/AuthGuard'
import OnboardingGuard from './guards/OnboardingGuard'
import AppShell from './components/layout/AppShell'
import { Toaster } from './components/ui/sonner'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import CallbackPage from './pages/auth/CallbackPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import TransactionsPage from './pages/transactions/TransactionsPage'
import TransactionDetailPage from './pages/transactions/TransactionDetailPage'
import TaxSummaryPage from './pages/tax/TaxSummaryPage'
import TaxAssessmentPage from './pages/tax/TaxAssessmentPage'
import S04Page from './pages/tax/S04Page'
import ProfilePage from './pages/profile/ProfilePage'
import UpgradePage from './pages/payments/UpgradePage'
import MockCheckoutPage from './pages/payments/MockCheckoutPage'

const queryClient = new QueryClient()

function AppRoutes() {
  const { isInitialising } = useAuth()

  if (isInitialising) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAEEDA]">
        <i className="ti ti-loader-2 animate-spin text-[#C04828] text-2xl" aria-label="Loading" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      {import.meta.env.DEV && <Route path="/mock-checkout" element={<MockCheckoutPage />} />}

      {/* Authenticated */}
      <Route element={<AuthGuard />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/upgrade" element={<UpgradePage />} />

        {/* Onboarding complete */}
        <Route element={<OnboardingGuard />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/:id" element={<TransactionDetailPage />} />
            <Route path="/tax" element={<TaxSummaryPage />} />
            <Route path="/tax/assessment" element={<TaxAssessmentPage />} />
            <Route path="/tax/s04" element={<S04Page />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
          <Toaster />
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
