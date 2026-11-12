import React, { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string
  loading?: boolean
  loadingTitle?: string
  size?: 'sm' | 'md' | 'lg' | 'none'
  variant?: 'primary' | 'warning-outline' | 'danger' | 'danger-outline' | 'secondary' | 'success' | ''
  prependIcon?: React.ElementType
  icon?: React.ElementType
}

function setSize(size?: string) {
  switch (size) {
    case 'sm':
      return 'px-3 py-2 text-sm'
    case 'md':
      return 'px-4 py-5'
    case 'lg':
      return 'px-4 py-6 text-base'
    case 'none':
      return ''
    default:
      return 'px-3 py-2 text-sm'
  }
}

function setVariant(variant?: string) {
  switch (variant) {
    case 'primary':
      return 'bg-blue-gacoan text-white border border-transparent hover:opacity-90 hover:bg-[#009ebd]'
    case 'warning-outline':
      return 'bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-50'
    case 'danger':
      return 'bg-red-500 text-white border border-transparent hover:bg-red-600'
    case 'danger-outline':
      return 'bg-white text-red-500 border border-red-500 hover:bg-red-50'
    case 'secondary':
      return 'bg-slate-100 text-slate-700 border border-transparent hover:bg-slate-200'
    case 'success':
      return 'bg-green-500 text-white border border-transparent hover:bg-green-600'
    default:
      return 'bg-blue-gacoan text-white border border-transparent'
  }
}

export function BaseButton({
  title,
  loading = false,
  loadingTitle,
  size = 'sm',
  variant = '',
  prependIcon: PrependIcon,
  icon: Icon,
  className = '',
  type = 'button',
  disabled,
  ...props
}: BaseButtonProps) {
  const baseClasses = 'transition-all duration-200 flex items-center justify-center rounded-md'
  const sizeClasses = setSize(size)
  const variantClasses = setVariant(variant)
  const loadingClasses = loading ? 'opacity-70 cursor-not-allowed' : ''

  const combinedClasses = cn(
    baseClasses,
    sizeClasses,
    variantClasses,
    loadingClasses,
    className
  )

  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
      
      {PrependIcon && !loading && (
        <PrependIcon className="w-5 h-5 ml-0 mr-2" />
      )}
      
      {title && <span>{loading ? (loadingTitle || title) : title}</span>}
      
      {Icon && !loading && (
        <Icon className="w-5 h-5 ml-2" />
      )}
    </button>
  )
}
