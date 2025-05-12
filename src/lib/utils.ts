import { env } from '@/env'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const mergePaths = (path: string) => {
  const apiPath = env.VITE_API_PATH.endsWith('/')
    ? env.VITE_API_PATH.slice(0, -1)
    : env.VITE_API_PATH

  const withSlash = path.startsWith('/') ? path : `/${path}`
  return `${apiPath}${withSlash}`
}
