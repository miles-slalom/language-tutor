import { useState } from 'react'
import {
  signUp,
  signIn,
  confirmSignUp,
} from 'aws-amplify/auth'

type AuthState = 'signIn' | 'signUp' | 'confirmSignUp'

interface AuthProps {
  onAuthSuccess: () => void
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [authState, setAuthState] = useState<AuthState>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      })
      setAuthState('confirmSignUp')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: verificationCode,
      })
      setAuthState('signIn')
      setVerificationCode('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to verify email'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn({ username: email, password })
      onAuthSuccess()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
  const buttonClass = "w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition font-medium"
  const linkClass = "text-blue-600 hover:text-blue-800 cursor-pointer"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">French Tutor</h1>
          <p className="text-gray-600 mt-2">Practice French with AI conversations</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {authState === 'signIn' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Sign In</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className={buttonClass} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <span onClick={() => { setAuthState('signUp'); setError(''); }} className={linkClass}>
                Sign Up
              </span>
            </p>
          </form>
        )}

        {authState === 'signUp' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Create Account</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Min 8 chars, number & special char"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className={buttonClass} disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <span onClick={() => { setAuthState('signIn'); setError(''); }} className={linkClass}>
                Sign In
              </span>
            </p>
          </form>
        )}

        {authState === 'confirmSignUp' && (
          <form onSubmit={handleConfirmSignUp} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Verify Email</h2>
            <p className="text-gray-600 text-sm mb-4">
              We sent a verification code to <strong>{email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className={inputClass}
                placeholder="Enter 6-digit code"
                required
              />
            </div>
            <button type="submit" className={buttonClass} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <p className="text-center text-gray-600 text-sm">
              <span onClick={() => { setAuthState('signIn'); setError(''); }} className={linkClass}>
                Back to Sign In
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
