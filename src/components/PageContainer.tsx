import { cn } from '@/lib/utils'
import type { PropsWithChildren } from 'react'

export function PageWidth({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('mx-auto w-full max-w-3xl', className)}>{children}</div>
}

export default function PageContainer({
  children,
  className,
  innerClassName,
}: PropsWithChildren<{ className?: string; innerClassName?: string }>) {
  return (
    <div className={cn('flex w-full flex-row px-4', className)}>
      <PageWidth className={innerClassName}>{children}</PageWidth>
    </div>
  )
}
