// scripts/seed-portal.mjs
// Seeds the Client Portal with sample data for local development and testing.
//
// What this creates:
//   1 client user        → username: styleph | password: password123
//   1 client record      → StylePH Fashion (Fashion industry)
//   7 content items      → one per status (draft, proposed, approved, scheduled, published, archived) + extra proposed
//   3 content comments   → on the proposed items
//   1 analytics snapshot → on the published item
//   2 portal messages    → one from admin, one from client
//   3 notifications      → content_proposed, content_approved, message_received
//
// Run:  node scripts/seed-portal.mjs
// Re-running is safe — existing client user is reused via ON CONFLICT.

import pg from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new pg.Pool(
  process.env.DB_HOST
    ? {
        host:     process.env.DB_HOST,
        port:     parseInt(process.env.DB_PORT ?? '6543'),
        database: process.env.DB_NAME,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
      }
    : {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
);

// ─── helpers ──────────────────────────────────────────────────────────────────

function log(emoji, label) {
  console.log(`${emoji}  ${label}`);
}

// ─── main ─────────────────────────────────────────────────────────────────────

const client = await pool.connect();

try {
  await client.query('BEGIN');

  // ── 1. Get admin user id ────────────────────────────────────────────────────
  const { rows: adminRows } = await client.query(
    `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
  );
  if (!adminRows.length) {
    throw new Error(
      'No admin user found. Run the main seed first (npm run seed) before seeding the portal.'
    );
  }
  const adminId = adminRows[0].id;
  log('👤', `Admin user id: ${adminId}`);

  // ── 2. Create client user ───────────────────────────────────────────────────
  log('🔑', 'Creating client user: styleph / password123');
  const passwordHash = await bcrypt.hash('password123', 12);

  const { rows: userRows } = await client.query(
    `INSERT INTO users (username, email, password_hash, role)
     VALUES ('styleph', 'styleph@example.com', $1, 'client')
     ON CONFLICT (username) DO UPDATE
       SET email        = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           role          = EXCLUDED.role
     RETURNING id`,
    [passwordHash]
  );
  const clientUserId = userRows[0].id;
  log('✅', `Client user id: ${clientUserId}`);

  // ── 3. Create client record ─────────────────────────────────────────────────
  log('🏢', 'Creating client record: StylePH Fashion');

  // Remove existing client for this user so we can re-seed cleanly
  await client.query(`DELETE FROM clients WHERE user_id = $1`, [clientUserId]);

  const { rows: clientRows } = await client.query(
    `INSERT INTO clients
       (user_id, business_name, industry, brand_color_primary, brand_color_secondary, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      clientUserId,
      'StylePH Fashion',
      'Fashion & Retail',
      '#FF6B6B',
      '#FFE66D',
      'SMM client since July 2026. Focus on Instagram and TikTok growth.',
    ]
  );
  const clientId = clientRows[0].id;
  log('✅', `Client record id: ${clientId}`);

  // ── 4. Clear existing content for this client ───────────────────────────────
  await client.query(
    `DELETE FROM content_items WHERE client_id = $1`,
    [clientId]
  );
  log('🗑 ', 'Cleared existing content items for this client');

  // ── 5. Content items — one per status + an extra proposed ──────────────────
  log('📝', 'Creating content items…');

  const now = new Date();
  const daysFromNow = (n) => new Date(now.getTime() + n * 86400000).toISOString();

  const contentItems = [
    // [title, caption, status, platform, scheduled_at, published_at, rejected_at, rejection_reason, notes]
    [
      'Summer Collection Reveal — Draft',
      'Introducing our hottest summer collection yet! 🔥☀️\n\nExplore vibrant prints, breathable fabrics, and styles made for the heat.\n\n#StylePH #SummerFashion #OOTD',
      'draft',
      'instagram',
      null, null, null, null,
      'First version — client approval pending. Needs final product photos from client.',
    ],
    [
      'Flash Sale Announcement',
      '⚡ 48-HOUR FLASH SALE ⚡\n\nUp to 50% off selected items. This weekend only!\n\nShop now at styleph.com 🛍️\n\n#StylePH #FlashSale #FashionSale',
      'proposed',
      'facebook',
      null, null, null, null,
      'Aligned with weekend campaign. Needs client approval ASAP.',
    ],
    [
      'Behind the Scenes — Photoshoot Day',
      'Ever wondered how we create our content? 👀✨\n\nHere\'s a peek behind the curtain of our latest photoshoot!\n\n#BTS #StylePH #ContentCreation',
      'proposed',
      'tiktok',
      null, null, null, null,
      'Vertical video format. BTS footage from last week\'s shoot.',
    ],
    [
      'New Arrivals — Mid-Season Drop',
      '🆕 NEW ARRIVALS ARE HERE!\n\nFresh styles just dropped. Limited stocks available.\n\nSwipe to see our top 5 picks for this season 👉\n\n#NewArrivals #StylePH #FashionPH',
      'approved',
      'instagram',
      null, null, null, null,
      'Approved by client on first review. Ready to schedule.',
    ],
    [
      'Weekend Style Inspo',
      'How are you styling your weekend? 💅\n\nHere are 3 looks from our collection to keep you looking fresh from brunch to sundown.\n\n#WeekendVibes #StylePH #OOTD #FashionInspo',
      'scheduled',
      'instagram',
      daysFromNow(3),
      null, null, null,
      'Scheduled for Saturday morning for maximum reach.',
    ],
    [
      'Customer Spotlight — @mariareyes',
      'We love seeing how you style your StylePH pieces! 💖\n\nThis week\'s spotlight: @mariareyes rocking our Summer Breeze dress. You look amazing!\n\nTag us for a chance to be featured 📸\n\n#StylePHFamily #CustomerSpotlight',
      'published',
      'instagram',
      daysFromNow(-5),
      daysFromNow(-5),
      null, null,
      'UGC repost. High engagement expected.',
    ],
    [
      'Old Product Launch — Cancelled',
      'Introducing our Winter Warmers collection…',
      'archived',
      'facebook',
      null, null,
      daysFromNow(-10),
      'Client decided to focus on summer only. Winter campaign postponed to Q4.',
      'Campaign cancelled per client request.',
    ],
  ];

  const insertedItems = [];
  for (const [title, caption, status, platform, scheduled_at, published_at, rejected_at, rejection_reason, notes] of contentItems) {
    const { rows } = await client.query(
      `INSERT INTO content_items
         (client_id, created_by, title, caption, status, platform,
          scheduled_at, published_at, rejected_at, rejection_reason, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, title, status`,
      [clientId, adminId, title, caption, status, platform, scheduled_at, published_at, rejected_at, rejection_reason, notes]
    );
    insertedItems.push(rows[0]);
    log('  📄', `${rows[0].status.padEnd(10)} — ${rows[0].title}`);
  }

  // ── 6. Comments on proposed items ──────────────────────────────────────────
  log('💬', 'Creating comments…');

  const proposedItems = insertedItems.filter(i => i.status === 'proposed');

  if (proposedItems.length > 0) {
    // Admin comment on first proposed
    await client.query(
      `INSERT INTO content_comments (content_item_id, author_id, body, is_change_request)
       VALUES ($1, $2, $3, false)`,
      [
        proposedItems[0].id,
        adminId,
        'Hi! This post is ready for your review. Let me know if you want to adjust the CTA or the hashtags.',
      ]
    );

    // Client change request on first proposed
    await client.query(
      `INSERT INTO content_comments (content_item_id, author_id, body, is_change_request)
       VALUES ($1, $2, $3, true)`,
      [
        proposedItems[0].id,
        clientUserId,
        'Can we change "This weekend only" to "This Saturday and Sunday only"? Also please add our website link in the first comment.',
      ]
    );

    // Admin reply
    await client.query(
      `INSERT INTO content_comments (content_item_id, author_id, body, is_change_request)
       VALUES ($1, $2, $3, false)`,
      [
        proposedItems[0].id,
        adminId,
        'Got it! Updated the caption. Website link will go in the first comment as requested. Please take another look.',
      ]
    );

    log('  💬', `3 comments added to "${proposedItems[0].title}"`);
  }

  // ── 7. Analytics snapshot on published item ─────────────────────────────────
  log('📊', 'Creating analytics snapshot…');

  const publishedItem = insertedItems.find(i => i.status === 'published');
  if (publishedItem) {
    await client.query(
      `INSERT INTO analytics_snapshots
         (content_item_id, platform, impressions, reach, likes, comments, shares, saves, source)
       VALUES ($1, 'instagram', $2, $3, $4, $5, $6, $7, 'manual')`,
      [publishedItem.id, 4820, 3610, 312, 28, 87, 145]
    );
    log('  📊', `Snapshot added: 4,820 impressions, 3,610 reach, 312 likes`);
  }

  // ── 8. Portal messages ──────────────────────────────────────────────────────
  log('✉️ ', 'Creating portal messages…');

  await client.query(
    `INSERT INTO portal_messages (client_id, sender_id, body, is_read)
     VALUES ($1, $2, $3, true)`,
    [
      clientId,
      adminId,
      'Hi! Welcome to your MakiSync Client Portal. This is where you can review and approve content, manage assets, and message me directly. Let me know if you have any questions! 😊',
    ]
  );

  await client.query(
    `INSERT INTO portal_messages (client_id, sender_id, body, is_read)
     VALUES ($1, $2, $3, false)`,
    [
      clientId,
      clientUserId,
      'Thanks! This looks great. I reviewed the Flash Sale post — left a comment with a small change. Everything else looks perfect!',
    ]
  );

  log('  ✉️ ', '2 messages created (1 from admin, 1 from client)');

  // ── 9. Notifications ────────────────────────────────────────────────────────
  log('🔔', 'Creating notifications…');

  // Notify client: content proposed
  if (proposedItems.length > 0) {
    await client.query(
      `INSERT INTO notifications
         (recipient_id, type, title, body, reference_id, reference_type, is_read)
       VALUES ($1, 'content_proposed', $2, $3, $4, 'content_item', false)`,
      [
        clientUserId,
        'New content ready for your review',
        `"${proposedItems[0].title}" has been submitted for your approval.`,
        proposedItems[0].id,
      ]
    );
    if (proposedItems.length > 1) {
      await client.query(
        `INSERT INTO notifications
           (recipient_id, type, title, body, reference_id, reference_type, is_read)
         VALUES ($1, 'content_proposed', $2, $3, $4, 'content_item', false)`,
        [
          clientUserId,
          'New content ready for your review',
          `"${proposedItems[1].title}" has been submitted for your approval.`,
          proposedItems[1].id,
        ]
      );
    }
    log('  🔔', `${Math.min(proposedItems.length, 2)} content_proposed notification(s) → client`);
  }

  // Notify admin: approved item
  const approvedItem = insertedItems.find(i => i.status === 'approved');
  if (approvedItem) {
    await client.query(
      `INSERT INTO notifications
         (recipient_id, type, title, body, reference_id, reference_type, is_read)
       VALUES ($1, 'content_approved', $2, $3, $4, 'content_item', false)`,
      [
        adminId,
        'Content approved',
        `"${approvedItem.title}" has been approved by the client.`,
        approvedItem.id,
      ]
    );
    log('  🔔', `1 content_approved notification → admin`);
  }

  // Notify admin: new message from client
  await client.query(
    `INSERT INTO notifications
       (recipient_id, type, title, body, reference_id, reference_type, is_read)
     VALUES ($1, 'message_received', $2, $3, $4, 'portal_message', false)`,
    [
      adminId,
      'New message from StylePH',
      'Thanks! This looks great. I reviewed the Flash Sale post…',
      clientId,
    ]
  );
  log('  🔔', '1 message_received notification → admin');

  await client.query('COMMIT');

  console.log('\n✅ Portal seed complete!\n');
  console.log('─────────────────────────────────────────────');
  console.log('  Client login credentials:');
  console.log('    Username : styleph');
  console.log('    Password : password123');
  console.log('    URL      : http://localhost:3000/login');
  console.log('─────────────────────────────────────────────');
  console.log('  What was seeded:');
  console.log('    1 client user    (role: client)');
  console.log('    1 client record  (StylePH Fashion)');
  console.log('    7 content items  (draft, proposed×2, approved, scheduled, published, archived)');
  console.log('    3 comments       (on Flash Sale Announcement)');
  console.log('    1 analytics snap (on Customer Spotlight post)');
  console.log('    2 messages       (admin intro + client reply)');
  console.log('    4 notifications  (proposed×2, approved, message)');
  console.log('─────────────────────────────────────────────\n');

} catch (err) {
  await client.query('ROLLBACK');
  console.error('\n❌ Portal seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
