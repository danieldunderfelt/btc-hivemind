import { env } from '../env'

export const mergePaths = (path: string) => {
  const apiPath = env.API_PATH.endsWith('/') ? env.API_PATH.slice(0, -1) : env.API_PATH
  const withSlash = path.startsWith('/') ? path : `/${path}`

  return `${apiPath}${withSlash}`
}
