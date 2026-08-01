export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
