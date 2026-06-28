// scripts/seed.mjs
// Populates all tables (except users) with SMM VA + Web Developer sample data.
// Images in seed-images/ are uploaded to Supabase Storage first; their public
// URLs are stored in the DB. Missing image files are skipped gracefully (null).

import { readFile, access } from 'fs/promises';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, '../seed-images');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── Upload helper ────────────────────────────────────────
async function upload(bucket, localPath, storagePath) {
  const abs = join(IMAGES_DIR, localPath);
  try { await access(abs); } catch { return null; }
  const buf = await readFile(abs);
  const mime = { '.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp' }[extname(abs).toLowerCase()] ?? 'image/jpeg';
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buf, { upsert: true, contentType: mime });
  if (error) { console.warn(`  ⚠ ${bucket}/${storagePath}: ${error.message}`); return null; }
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  console.log(`  ↑ ${bucket}/${storagePath}`);
  return data.publicUrl;
}

// ── Main ─────────────────────────────────────────────────
console.log('\n📁 Uploading images…');
const avatarUrl   = await upload('profiles',       'profiles/avatar.jpg',            'seed/avatar.jpg');
const project1    = await upload('projects',       'projects/project-1.jpg',          'seed/project-1.jpg');
const project2    = await upload('projects',       'projects/project-2.jpg',          'seed/project-2.jpg');
const project3    = await upload('projects',       'projects/project-3.jpg',          'seed/project-3.jpg');
const project4    = await upload('projects',       'projects/project-4.jpg',          'seed/project-4.jpg');
const project5    = await upload('projects',       'projects/project-5.jpg',          'seed/project-5.jpg');
const sm1         = await upload('gallery',        'gallery/social-media/sm-1.jpg',   'seed/sm-1.jpg');
const sm2         = await upload('gallery',        'gallery/social-media/sm-2.jpg',   'seed/sm-2.jpg');
const sm3         = await upload('gallery',        'gallery/social-media/sm-3.jpg',   'seed/sm-3.jpg');
const web1        = await upload('gallery',        'gallery/web-design/web-1.jpg',    'seed/web-1.jpg');
const web2        = await upload('gallery',        'gallery/web-design/web-2.jpg',    'seed/web-2.jpg');
const cnt1        = await upload('gallery',        'gallery/content/content-1.jpg',   'seed/content-1.jpg');
const cnt2        = await upload('gallery',        'gallery/content/content-2.jpg',   'seed/content-2.jpg');
const certMeta    = await upload('certifications', 'certifications/cert-meta.jpg',    'seed/cert-meta.jpg');
const certGoogle  = await upload('certifications', 'certifications/cert-google.jpg',  'seed/cert-google.jpg');
const certHubspot = await upload('certifications', 'certifications/cert-hubspot.jpg', 'seed/cert-hubspot.jpg');
const certCanva   = await upload('certifications', 'certifications/cert-canva.jpg',   'seed/cert-canva.jpg');
const client1Av   = await upload('testimonials',   'testimonials/client-1.jpg',       'seed/client-1.jpg');
const client2Av   = await upload('testimonials',   'testimonials/client-2.jpg',       'seed/client-2.jpg');
const client3Av   = await upload('testimonials',   'testimonials/client-3.jpg',       'seed/client-3.jpg');
const logoPng     = await upload('general',        'general/logo.png',                'seed/logo.png');
const heroBg      = await upload('general',        'general/hero-bg.jpg',             'seed/hero-bg.jpg');

const client = await pool.connect();
try {
  await client.query('BEGIN');

  // hero
  console.log('\n🌟 hero');
  await client.query(`UPDATE hero SET headline=$1,subheadline=$2,cta_text=$3,cta_url=$4,bg_image_url=$5,updated_at=NOW() WHERE id=1`, [
    "Hi, I'm Maki — SMM VA & Web Developer",
    "I help brands grow their social presence and build stunning digital experiences that convert.",
    'Work With Me', '#contact', heroBg,
  ]);

  // profile
  console.log('👤 profile');
  await client.query(`UPDATE profile SET full_name=$1,tagline=$2,bio=$3,avatar_url=$4,location=$5,years_experience=$6,updated_at=NOW() WHERE id=1`, [
    'Maki Reyes',
    'Social Media Manager · Virtual Assistant · Web Developer',
    "I'm a results-driven Social Media Manager and Virtual Assistant with 3+ years of experience helping businesses grow online. I specialise in content creation, community management, paid social, and building fast, beautiful websites. From strategy to execution — I handle it all.",
    avatarUrl, 'Philippines 🇵🇭', 3,
  ]);

  // resume
  console.log('📄 resume');
  await client.query(`UPDATE resume SET title=$1,description=$2,file_url=$3,updated_at=NOW() WHERE id=1`, [
    'Maki Reyes — Resume',
    'Full CV covering SMM, VA, and Web Development experience.',
    null,
  ]);

  // contacts
  console.log('📬 contacts');
  const contacts = [
    ['email',     'Email',     'maki@makisync.dev'],
    ['phone',     'Phone',     '+63 912 345 6789'],
    ['instagram', 'Instagram', 'https://instagram.com/makisync'],
    ['facebook',  'Facebook',  'https://facebook.com/makisync'],
    ['linkedin',  'LinkedIn',  'https://linkedin.com/in/makireyes'],
    ['website',   'Website',   'https://makisync.dev'],
  ];
  for (const [key, label, value] of contacts) {
    await client.query(`INSERT INTO contacts (key,label,value) VALUES ($1,$2,$3) ON CONFLICT (key) DO UPDATE SET label=$2,value=$3`, [key, label, value]);
  }

  // services
  console.log('💼 services');
  await client.query(`DELETE FROM services`);
  const services = [
    ['Social Media Management',  'bi-calendar2-week-fill', 'Full-cycle management of Instagram, Facebook, TikTok, and LinkedIn — strategy, content calendars, scheduling, engagement, and monthly reports.'],
    ['Content Creation',         'bi-brush-fill',          'Eye-catching graphics, Reels scripts, captions, and branded templates tailored to your audience and platform.'],
    ['Paid Social Advertising',  'bi-megaphone-fill',      'Meta Ads and TikTok Ads campaign setup, A/B testing, audience targeting, and ROI-focused optimisation.'],
    ['Virtual Assistant',        'bi-headset',             'Email management, calendar coordination, data entry, research, CRM updates, and day-to-day admin tasks.'],
    ['Web Development',          'bi-code-slash',          'Custom websites built with Next.js, React, and Tailwind CSS — fast, accessible, and SEO-optimised.'],
    ['Analytics & Reporting',    'bi-bar-chart-line-fill', 'Weekly and monthly dashboards using Meta Insights, Google Analytics, and custom spreadsheet reports.'],
  ];
  for (let i = 0; i < services.length; i++) {
    await client.query(`INSERT INTO services (title,icon,description,"order") VALUES ($1,$2,$3,$4)`, [...services[i], i]);
  }

  // skills
  console.log('🧠 skills');
  await client.query(`DELETE FROM skills`);
  const skills = [
    ['HTML / CSS','Web Dev'],['JavaScript','Web Dev'],['TypeScript','Web Dev'],
    ['React','Web Dev'],['Next.js','Web Dev'],['Tailwind CSS','Web Dev'],
    ['PostgreSQL','Web Dev'],['MySQL','Web Dev'],['PHP','Web Dev'],
    ['Laravel','Web Dev'],['Java','Web Dev'],
    ['Email Management','Virtual Assistant'],['Calendar Management','Virtual Assistant'],
    ['Data Entry','Virtual Assistant'],['Research','Virtual Assistant'],
    ['Customer Support','Virtual Assistant'],['File Management','Virtual Assistant'],
    ['Content Scheduling','Virtual Assistant'],['Content Creation','Virtual Assistant'],
  ];
  for (let i = 0; i < skills.length; i++) {
    await client.query(`INSERT INTO skills (name,category,"order") VALUES ($1,$2,$3)`, [skills[i][0], skills[i][1], i]);
  }

  // tools
  console.log('🔧 tools');
  await client.query(`DELETE FROM tools`);
  const tools = [
    ['Canva','Design'],['Adobe Photoshop','Design'],['CapCut','Video'],
    ['Later','Scheduling'],['Buffer','Scheduling'],
    ['Meta Business Suite','Advertising'],['Meta Ads Manager','Advertising'],['TikTok Ads Manager','Advertising'],
    ['Google Analytics','Analytics'],
    ['Notion','Productivity'],['Trello','Productivity'],['Slack','Productivity'],['Google Workspace','Productivity'],
    ['VS Code','Development'],['GitHub','Development'],['Vercel','Development'],['Supabase','Development'],
    ['ChatGPT / AI Tools','AI'],
  ];
  for (let i = 0; i < tools.length; i++) {
    await client.query(`INSERT INTO tools (name,category,"order") VALUES ($1,$2,$3)`, [tools[i][0], tools[i][1], i]);
  }

  // projects
  console.log('🗂 projects');
  await client.query(`DELETE FROM projects`);
  const projects = [
    ['Instagram Growth Campaign',  "Grew a local fashion brand's Instagram from 800 to 12,000 followers in 6 months through organic content strategy, Reels, and influencer collaborations.", project1, 'StylePH',        null,                    'published', 0],
    ['Facebook Ads Management',    'Managed a ₱50,000/month Meta Ads budget for an e-commerce brand, achieving 4.2× ROAS through iterative creative testing and audience segmentation.',      project2, 'ShopLocal PH',  null,                    'published', 1],
    ['Portfolio Website',          'Designed and built a fully responsive personal portfolio using Next.js and Tailwind CSS, deployed on Vercel with a custom admin CMS.',                      project3, 'Personal',      'https://makisync.dev',  'published', 2],
    ['E-Commerce Store',           'Built a Next.js e-commerce store with Supabase backend, including product catalog, cart, and Stripe checkout.',                                             project4, 'MarketNest',    null,                    'published', 3],
    ['Content Calendar System',    'Created a 90-day evergreen content calendar and Canva template library for a wellness brand, cutting daily content time by 60%.',                           project5, 'WellnessHub PH',null,                    'published', 4],
  ];
  for (const p of projects) {
    await client.query(`INSERT INTO projects (title,description,cover_url,client,url,status,"order") VALUES ($1,$2,$3,$4,$5,$6,$7)`, p);
  }

  // gallery categories + items
  console.log('🖼 gallery');
  await client.query(`DELETE FROM gallery`);
  await client.query(`DELETE FROM gallery_categories`);
  const cats = [['Social Media','social-media',0],['Web Design','web-design',1],['Content Creation','content',2]];
  const catIds = {};
  for (const [name, slug, ord] of cats) {
    const { rows } = await client.query(`INSERT INTO gallery_categories (name,slug,"order") VALUES ($1,$2,$3) RETURNING id`, [name, slug, ord]);
    catIds[slug] = rows[0].id;
  }
  const galleryItems = [
    ['social-media', sm1,  'Instagram Feed Design',    'Cohesive grid layout for a lifestyle brand', 0],
    ['social-media', sm2,  'Facebook Ad Creative',     'High-CTR ad visual for a product launch',    1],
    ['social-media', sm3,  'TikTok Thumbnail',         'Branded thumbnail for viral-format Reels',   2],
    ['web-design',   web1, 'Portfolio Website',        'Next.js personal portfolio',                  3],
    ['web-design',   web2, 'E-Commerce Landing Page',  'Conversion-focused product page',             4],
    ['content',      cnt1, 'Brand Identity Graphic',   'Canva-designed branded post',                 5],
    ['content',      cnt2, 'Infographic Design',        'Educational carousel for Instagram',          6],
  ];
  for (const [slug, img, title, desc, ord] of galleryItems) {
    if (!img) continue;
    await client.query(`INSERT INTO gallery (category_id,image_url,title,description,"order") VALUES ($1,$2,$3,$4,$5)`, [catIds[slug], img, title, desc, ord]);
  }

  // testimonials
  console.log('💬 testimonials');
  await client.query(`DELETE FROM testimonials`);
  const testimonials = [
    ['Sarah Lim',      'Founder, StylePH',              client1Av, "Maki transformed our Instagram from a dead account into our #1 sales channel. Her content strategy and consistency is unmatched — we hit 10k in 5 months!",                                           5, true,  0],
    ['Jomar Santos',   'CEO, ShopLocal PH',             client2Av, 'Best investment we made this year. Our Meta Ads ROAS jumped from 1.8× to 4.2× in just 3 months. Maki knows her numbers and communicates everything clearly.',                                       5, true,  1],
    ['Carla Mendoza',  'Wellness Coach, WellnessHub PH',client3Av, "She built my entire content system from scratch — templates, captions, a 90-day calendar. I used to spend 3 hours a day on content. Now it's 30 minutes.",                                           5, true,  2],
    ['Marco Dela Cruz','E-Commerce Entrepreneur',       null,      'Maki built our store in 2 weeks. Clean code, fast load times, and she explained every decision clearly. Will hire again for our next project.',                                                       5, true,  3],
  ];
  for (const t of testimonials) {
    await client.query(`INSERT INTO testimonials (client_name,client_title,client_avatar_url,message,rating,is_published,"order") VALUES ($1,$2,$3,$4,$5,$6,$7)`, t);
  }

  // certifications
  console.log('🏅 certifications');
  await client.query(`DELETE FROM certifications`);
  const certs = [
    ['Meta Social Media Marketing Certificate', 'Meta / Coursera',   '2023-09-01', null,         'https://coursera.org/verify/meta-smm',             certMeta,    0],
    ['Google Digital Marketing & E-Commerce',   'Google / Coursera', '2023-06-15', null,         'https://coursera.org/verify/google-dme',            certGoogle,  1],
    ['HubSpot Content Marketing Certification', 'HubSpot Academy',   '2024-01-20', '2026-01-20', 'https://app.hubspot.com/academy/certificates/verify',certHubspot, 2],
    ['Canva Design Certificate',                'Canva',             '2023-03-10', null,         'https://www.canva.com/certifications/',              certCanva,   3],
  ];
  for (const c of certs) {
    await client.query(`INSERT INTO certifications (title,issuer,issue_date,expiry_date,credential_url,image_url,"order") VALUES ($1,$2,$3,$4,$5,$6,$7)`, c);
  }

  // FAQs
  console.log('❓ faqs');
  await client.query(`DELETE FROM faqs`);
  const faqs = [
    ['What services do you offer?',                       'I offer Social Media Management, Content Creation, Meta & TikTok Ads, Virtual Assistance, and Web Development (Next.js / React).'],
    ['What are your rates?',                               'Rates depend on scope. SMM packages start at $300/month. Web projects are quoted per project. Reach out for a custom quote!'],
    ['How do we get started?',                             "Send me a message through the contact form or email. We'll schedule a free discovery call to see if we're a good fit."],
    ['Do you work with international clients?',            "Yes! I work with clients from the Philippines, US, AU, and UK. I'm flexible with time zones and communicate via Slack, email, or Zoom."],
    ['Can you manage multiple social platforms?',          'Absolutely. I manage Instagram, Facebook, TikTok, LinkedIn, and Pinterest using scheduling tools to keep everything consistent.'],
    ['How long does a website take?',                      'A portfolio or landing page takes 1–2 weeks. A full e-commerce site is typically 3–4 weeks depending on complexity.'],
  ];
  for (let i = 0; i < faqs.length; i++) {
    await client.query(`INSERT INTO faqs (question,answer,is_published,"order") VALUES ($1,$2,$3,$4)`, [...faqs[i], true, i]);
  }

  // SEO
  console.log('🔍 seo');
  const seoRows = [
    ['home',  "Maki Reyes — SMM VA & Web Developer | MakiSync", "Results-driven Social Media Manager, Virtual Assistant, and Web Developer based in the Philippines. Let's grow your brand online."],
    ['admin', 'Admin — MakiSync', 'MakiSync admin portal.'],
  ];
  for (const [page, title, desc] of seoRows) {
    await client.query(`INSERT INTO seo (page_key,meta_title,meta_description) VALUES ($1,$2,$3) ON CONFLICT (page_key) DO UPDATE SET meta_title=$2,meta_description=$3`, [page, title, desc]);
  }

  // website_settings
  console.log('⚙️  website_settings');
  await client.query(`UPDATE website_settings SET site_name=$1,logo_url=$2,maintenance_mode=false WHERE id=1`, ['MakiSync', logoPng]);

  await client.query('COMMIT');
  console.log('\n✅ Seed complete!\n');

} catch (err) {
  await client.query('ROLLBACK');
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
