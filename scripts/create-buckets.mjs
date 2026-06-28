// scripts/create-buckets.mjs
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKETS = [
  { name: 'profiles',       public: true,  mimeTypes: ['image/jpeg','image/png','image/webp','application/pdf'], size: 10 },
  { name: 'projects',       public: true,  mimeTypes: ['image/jpeg','image/png','image/webp'], size: 10 },
  { name: 'gallery',        public: true,  mimeTypes: ['image/jpeg','image/png','image/webp'], size: 20 },
  { name: 'certifications', public: true,  mimeTypes: ['image/jpeg','image/png','image/webp'], size: 5  },
  { name: 'testimonials',   public: true,  mimeTypes: ['image/jpeg','image/png','image/webp'], size: 5  },
  { name: 'general',        public: true,  mimeTypes: ['image/jpeg','image/png','image/webp','image/svg+xml','image/x-icon'], size: 5 },
];

for (const b of BUCKETS) {
  const { error } = await supabase.storage.createBucket(b.name, {
    public: b.public,
    allowedMimeTypes: b.mimeTypes,
    fileSizeLimit: b.size * 1024 * 1024,
  });
  if (error && error.message !== 'The resource already exists') {
    console.error(`  ✗ ${b.name}: ${error.message}`);
  } else {
    console.log(`  ✓ ${b.name}`);
  }
}
