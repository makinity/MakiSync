# Seed Images

Place your images here before running `npm run seed`.
The seeder will upload them to Supabase Storage and reference the public URLs in the database.

## Folder → Supabase Bucket mapping

| Folder | Bucket | Used by |
|--------|--------|---------|
| `profiles/` | `profiles` | `profile.avatar_url`, `testimonials.client_avatar_url` |
| `projects/` | `projects` | `projects.cover_url` |
| `gallery/social-media/` | `gallery` | gallery items (Social Media category) |
| `gallery/web-design/` | `gallery` | gallery items (Web Design category) |
| `gallery/content/` | `gallery` | gallery items (Content Creation category) |
| `certifications/` | `certifications` | `certifications.image_url` |
| `testimonials/` | `testimonials` | `testimonials.client_avatar_url` |
| `general/` | `general` | `website_settings.logo_url`, `hero.bg_image_url` |

## Expected filenames

### profiles/
- `avatar.jpg` — your profile photo

### projects/
- `project-1.jpg` — Instagram Growth Campaign
- `project-2.jpg` — Facebook Ads Management
- `project-3.jpg` — Portfolio Website
- `project-4.jpg` — E-Commerce Store
- `project-5.jpg` — Content Calendar System

### gallery/social-media/
- `sm-1.jpg`
- `sm-2.jpg`
- `sm-3.jpg`

### gallery/web-design/
- `web-1.jpg`
- `web-2.jpg`

### gallery/content/
- `content-1.jpg`
- `content-2.jpg`

### certifications/
- `cert-meta.jpg` — Meta Social Media Marketing
- `cert-google.jpg` — Google Digital Marketing
- `cert-hubspot.jpg` — HubSpot Content Marketing
- `cert-canva.jpg` — Canva Design Certificate

### testimonials/
- `client-1.jpg`
- `client-2.jpg`
- `client-3.jpg`

### general/
- `logo.png` — site logo (also replaces public/logo.png)
- `hero-bg.jpg` — hero section background (optional)

> Images without a corresponding file will be seeded with `null` (no image). You can add images later via the admin panel.
