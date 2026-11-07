import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthModal, type AuthMode } from '../components/auth/AuthModal'
import { SeoHead } from '../components/seo/SeoHead'
import { useApp } from '../app/useApp'

export function AuthPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useApp()

  const requestedMode = params.get('mode') as AuthMode | null
  const initialMode: AuthMode = requestedMode && ['login', 'signup', 'forgot-password'].includes(requestedMode)
    ? requestedMode
    : 'login'

  function handleClose() {
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <SeoHead title={t('auth.signIn')} />
      <AuthModal
        initialMode={initialMode}
        onClose={handleClose}
        onSuccess={handleClose}
      />
    </div>
  )
}
