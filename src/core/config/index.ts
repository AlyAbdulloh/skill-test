export const config = {
  app: {
    name: 'skeleton',
    url: process.env.AUTH_URL || 'http://localhost:3011',
  },
  auth: {
    mode: (process.env.AUTH_MODE || 'local') as 'local' | 'sso',
  },
  sso: {
    portalUrl: process.env.SSO_PORTAL_URL || 'http://localhost:3010',
    publicKey: process.env.SSO_PORTAL_PUBLIC_KEY || '',
  },
}
