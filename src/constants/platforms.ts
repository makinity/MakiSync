export const PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
} as const;

export type Platform = (typeof PLATFORMS)[keyof typeof PLATFORMS];

export const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  twitter: 'Twitter',
  youtube: 'YouTube',
};

export const PLATFORM_COLORS: Record<string, string> = {
  facebook: 'bg-blue-600',
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  tiktok: 'bg-black',
  linkedin: 'bg-blue-700',
  twitter: 'bg-sky-500',
  youtube: 'bg-red-600',
};
