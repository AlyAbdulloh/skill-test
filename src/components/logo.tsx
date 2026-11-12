import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <Image
      src="/assets/cbc954a6519ff310baa5cbff4ac5fc4ac8ac03d0.png"
      alt="SOP-Hub"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      priority
    />
  )
}
