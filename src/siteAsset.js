const baseUrl = import.meta.env.BASE_URL || '/'

export function siteAsset(path) {
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${normalizedBase}${String(path).replace(/^\/+/, '')}`
}
