import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ShieldCheck, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUpWithEmail, loginWithEmail, loginWithGoogle, sendPasswordReset, user } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Redirect if already logged in
  if (user) {
    navigate('/');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        navigate('/');
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName.trim(), role);
        navigate('/');
      } else if (mode === 'forgot') {
        await sendPasswordReset(email);
        setMessage('Password reset link sent to your email address!');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let errMsg = err.message || 'An authentication error occurred.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'This email is already registered. Please sign in instead.';
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-indigo-50/50 via-white to-purple-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-all duration-300">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-6 sm:space-y-8 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl relative transition-all">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {mode === 'login' && 'Welcome Back to SkillHub'}
            {mode === 'signup' && 'Join the SkillHub Exchange'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
            {mode === 'login' && 'Connect with peer mentors, share knowledge, and level up.'}
            {mode === 'signup' && 'Create your free account to offer skills or request mentorship.'}
            {mode === 'forgot' && 'Enter your email address and we will send a password reset link.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {mode !== 'forgot' && (
          <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800/80 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {mode === 'signup' && (
            <>
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Chen"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  I want to join as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      role === 'student'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Learner & Mentor
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('mentor')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                      role === 'mentor'
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    Featured Mentor
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="student@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google Login Separator */}
        {mode !== 'forgot' && (
          <div className="space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              <span className="bg-white dark:bg-zinc-900 px-3 text-[11px] text-zinc-400 uppercase font-bold tracking-wider absolute">
                Or Continue With
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google Account
            </button>

            {/* Quick Demo Login Option */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <p className="text-[11px] font-semibold text-center text-zinc-400">⚡ Instant Demo Access</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    setLoading(true);
                    try {
                      await loginWithEmail('student.demo@skillhub.edu', 'demo1234');
                      navigate('/');
                    } catch {
                      try {
                        await signUpWithEmail('student.demo@skillhub.edu', 'demo1234', 'Jordan Smith (Student)', 'student');
                        navigate('/');
                      } catch (err: any) {
                        setError(err.message);
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                >
                  Demo Student
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setError('');
                    setLoading(true);
                    try {
                      await loginWithEmail('alex.chen@campus.edu', 'demo1234');
                      navigate('/');
                    } catch {
                      try {
                        await signUpWithEmail('alex.chen@campus.edu', 'demo1234', 'Alex Chen (Mentor)', 'mentor');
                        navigate('/');
                      } catch (err: any) {
                        setError(err.message);
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                >
                  Demo Mentor
                </button>
              </div>
            </div>

          </div>
        )}

        {mode === 'forgot' && (
          <div className="text-center pt-2">
            <button
              onClick={() => setMode('login')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
