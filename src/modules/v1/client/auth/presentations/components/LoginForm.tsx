'use client'

import { Eye, EyeOff, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useRef, useEffect } from 'react'

interface LoginFormProps {
  branding: {
    systemName: string
    systemDescription: string
    primaryColor: string | string[]
    secondaryColor: string
  }
  accounts?: {
    username: string
    name: string
    lastLogin: string
  }[]
  username?: string
  password?: string
  showPassword?: boolean
  onShowPasswordChange?: (show: boolean) => void
  onUsernameChange?: (username: string) => void
  onPasswordChange?: (password: string) => void
  onSubmit?: () => void
  onAccountClick?: (username: string) => void
  onAccountDelete?: (username: string) => void
  formErrors?: Record<string, string>
  loading?: boolean
}

export function LoginForm({
  branding,
  accounts = [],
  username = '',
  password = '',
  showPassword = false,
  onShowPasswordChange,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  onAccountClick,
  onAccountDelete,
  formErrors = {},
  loading = false,
}: LoginFormProps) {
  const [isHover, setIsHover] = useState(false)
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null)
  const menuRefs = useRef<(HTMLDivElement | null)[]>([])

  const getButtonBackground = (reverse = false) => {
    if (Array.isArray(branding.primaryColor)) {
      const colors = reverse ? [...branding.primaryColor].reverse() : branding.primaryColor
      return `linear-gradient(90deg, ${colors.join(', ')})`
    }
    return branding.primaryColor
  }

  const getGradient = () => {
    if (Array.isArray(branding.primaryColor)) {
      return `linear-gradient(135deg, ${branding.primaryColor.join(', ')})`
    }
    return branding.primaryColor
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Active just now'

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `Active ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Active ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Active ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `Active ${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`

    const diffInMonths = Math.floor(diffInDays / 30)
    return `Active ${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuIndex !== null) {
        const menuRef = menuRefs.current[openMenuIndex]
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setOpenMenuIndex(null)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuIndex])

  const renderAccountCard = (account: { username: string; name: string; lastLogin: string }, index: number, isMobile = false) => (
    <div
      key={index}
      className={`relative bg-white/80 backdrop-blur-sm rounded-2xl
                  border border-white/50
                  shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10
                  transition-all duration-300 ease-out
                  hover:-translate-y-1.5 hover:border-white/80
                  flex flex-col items-center gap-4 flex-shrink-0
                  animate-fade-in animate-slide-up animate-duration-500
                  group cursor-pointer
                  ${isMobile ? 'w-[120px] p-3' : 'w-[175px] min-w-[175px] max-w-[175px] p-5'}`}
      style={{ animationDelay: `${300 + index * 100}ms` }}
      ref={el => { menuRefs.current[index] = el }}
      onClick={() => onAccountClick?.(account.username)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpenMenuIndex(openMenuIndex === index ? null : index)
        }}
        className="absolute top-3 right-3 p-1.5 rounded-full
                   opacity-0 group-hover:opacity-100
                   hover:bg-black/5 transition-all duration-200"
      >
        <MoreVertical size={14} className="text-gray-400" />
      </button>

      {openMenuIndex === index && (
        <div className="absolute top-12 right-3 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 z-10 min-w-[120px]
                        animate-fade-in animate-duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAccountDelete?.(account.username)
              setOpenMenuIndex(null)
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      <div className="relative">
        <div
          className={`${isMobile ? 'w-12 h-12 text-lg' : 'w-16 h-16 text-xl'} rounded-full bg-gradient-to-br from-gray-400 to-gray-600
          flex items-center justify-center text-white font-bold
          ring-2 ring-white ring-offset-2 ring-offset-transparent
          group-hover:ring-offset-4 group-hover:shadow-lg
          transition-all duration-300`}
        >
          {account.name.charAt(0).toUpperCase()}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-green-400 rounded-full 
                        border-2 border-white
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      </div>

      <div className="text-center w-full space-y-1">
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-800 truncate px-1`}>
          {account.name}
        </p>
        {!isMobile && (
          <p className="text-[10px] text-gray-600 italic">
            {getRelativeTime(account.lastLogin)}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen w-full flex">
      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:flex w-[60%] relative overflow-hidden animate-gradient"
           style={{ backgroundImage: getGradient() }}>
        <div className="flex flex-col justify-center h-full px-16 xl:px-24 py-16 w-full">
          <div className="text-white max-w-4xl animate-fade-in animate-slide-up animate-duration-500">
            <h2 className="text-4xl xl:text-5xl font-bold mb-4">{branding.systemName}</h2>
            <p className="text-md leading-relaxed font-medium opacity-80">
              {branding.systemDescription}
            </p>
          </div>

          {accounts.length > 0 && (
            <div className="mt-12 animate-fade-in animate-slide-up animate-duration-500"
                 style={{ animationDelay: '200ms' }}>
              <p className="text-lg font-semibold text-white/90 mb-4">Login as</p>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {accounts.map((account, index) => renderAccountCard(account, index))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Form (40%) */}
      <div className="hidden lg:flex w-[40%] items-center justify-center bg-gradient-to-br from-slate-50 to-white px-8">
        <div className="w-full max-w-[500px] animate-fade-in animate-slide-up animate-duration-500"
             style={{ animationDelay: '400ms' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit?.()
            }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 
                            shadow-2xl shadow-slate-200/50 p-8 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full 
                              bg-gradient-to-br from-pink-400/10 to-purple-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full 
                              bg-gradient-to-br from-blue-400/10 to-teal-400/10 blur-3xl" />

              <div className="relative">
                <div className="mb-8">
                  <p className="text-[13px] font-semibold text-slate-700">{branding.systemName}</p>
                  <p className="text-[10px] text-slate-400">v1.0.0</p>
                </div>

                <div className="mb-8">
                  <p className="text-base text-slate-600">Welcome back!</p>
                  <h2 className="text-2xl font-bold text-slate-800 mt-1">Sign in</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Username
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => onUsernameChange?.(e.target.value)}
                      autoComplete="username"
                      className={`border-slate-200 rounded-xl py-5 px-4 mt-2
                                 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary
                                 transition-all duration-200
                                 ${formErrors.username ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
                    />
                    {formErrors.username && (
                      <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                        {formErrors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        value={password}
                        onChange={(e) => onPasswordChange?.(e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className={`border-slate-200 rounded-xl py-5 px-4 pr-12 mt-2
                                   focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary
                                   transition-all duration-200
                                   ${formErrors.password ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
                      />
                      {formErrors.password && (
                        <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                          {formErrors.password}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => onShowPasswordChange?.(!showPassword)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 p-1 mt-1
                                   text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} className="cursor-pointer" />
                        ) : (
                          <Eye size={18} className="cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 cursor-pointer" />
                  <span className="text-xs text-slate-500">Remember me</span>
                </div>

                <Button
                  onMouseEnter={() => setIsHover(true)}
                  onMouseLeave={() => setIsHover(false)}
                  disabled={loading}
                  type="submit"
                  className="w-full mt-6 text-white py-6 font-semibold text-base
                             rounded-xl cursor-pointer transition-all duration-300
                             hover:opacity-90 hover:shadow-lg hover:shadow-primary/20
                             active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: getButtonBackground(isHover),
                  }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white 
                                      rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </div>
            </div>
          </form>

          <div className="text-center text-xs text-slate-400 mt-8 space-y-1">
            <p>&copy; {new Date().getFullYear()} - {branding.systemName}</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="lg:hidden w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white px-6 py-8">
        <div className="w-full max-w-md animate-fade-in animate-slide-up animate-duration-500">
          <form onSubmit={(e) => {
            e.preventDefault()
            onSubmit?.()
          }}>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 
                            shadow-xl shadow-slate-200/50 p-6 relative overflow-hidden">
              <div className="mb-6">
                <p className="text-[13px] font-semibold text-slate-700">{branding.systemName}</p>
                <p className="text-[10px] text-slate-400">v1.0.0</p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-slate-500">
                  Welcome to{' '}
                  <span className="font-bold" style={{ color: branding.secondaryColor }}>
                    {branding.systemName}
                  </span>
                </p>
                <h2 className="text-xl font-bold text-slate-800 mt-1">Sign in</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => onUsernameChange?.(e.target.value)}
                    autoComplete="username"
                    className={`border-slate-200 rounded-xl py-4 px-4 mt-2
                               focus-visible:ring-2 focus-visible:ring-primary/30
                               ${formErrors.username ? 'border-red-400' : ''}`}
                  />
                  {formErrors.username && (
                    <p className="text-red-400 text-xs mt-1.5">{formErrors.username}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      value={password}
                      onChange={(e) => onPasswordChange?.(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={`border-slate-200 rounded-xl py-4 px-4 pr-12 mt-2
                                 focus-visible:ring-2 focus-visible:ring-primary/30
                                 ${formErrors.password ? 'border-red-400' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => onShowPasswordChange?.(!showPassword)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 p-1
                                 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={18} className='cursor-pointer' />
                      ) : (
                        <Eye size={18} className='cursor-pointer' />
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-red-400 text-xs mt-1.5">{formErrors.password}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 cursor-pointer" />
                <span className="text-xs text-slate-500">Remember me</span>
              </div>

              <Button
                type="submit"
                className="w-full mt-6 text-white py-5 font-semibold text-sm
                           rounded-xl transition-all duration-300
                           active:scale-[0.98]"
                disabled={loading}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                style={{ background: getButtonBackground(isHover) }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white 
                                    rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>
          </form>

          <div className="text-center text-[11px] text-slate-400 mt-6 space-y-1">
            <p>&copy; {new Date().getFullYear()} - {branding.systemName}</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
