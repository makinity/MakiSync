export const ROUTES = {
  // Auth
  LOGIN: '/login',

  // Client portal
  PORTAL_DASHBOARD: '/dashboard',
  CONTENT_PROPOSED: '/content/proposed',
  CONTENT_SCHEDULED: '/content/scheduled',
  CONTENT_PUBLISHED: '/content/published',
  CONTENT_ARCHIVED: '/content/archived',
  CALENDAR: '/calendar',
  ANALYTICS_OVERVIEW: '/analytics/overview',
  ANALYTICS_PLATFORMS: '/analytics/platforms',
  ASSETS_IMAGES: '/assets/images',
  ASSETS_VIDEOS: '/assets/videos',
  ASSETS_BRAND_KIT: '/assets/brand-kit',
  ASSETS_DOCUMENTS: '/assets/documents',
  MESSAGES: '/messages',

  // Admin portal
  ADMIN_PORTAL_DASHBOARD: '/portal-dashboard',
  ADMIN_CLIENTS: '/clients',
  ADMIN_DRAFTS: '/drafts',
  ADMIN_CREATE_CONTENT: '/create-content',
  ADMIN_APPROVALS: '/approvals',
  ADMIN_SCHEDULE: '/schedule',
  ADMIN_PORTAL_SETTINGS: '/portal-settings',

  // API
  API_PORTAL_CONTENT: '/api/portal/content',
  API_PORTAL_CLIENTS: '/api/portal/clients',
  API_PORTAL_ASSETS: '/api/portal/assets',
  API_PORTAL_MESSAGES: '/api/portal/messages',
  API_PORTAL_NOTIFICATIONS: '/api/portal/notifications',
  API_PORTAL_ANALYTICS: '/api/portal/analytics',
} as const;
