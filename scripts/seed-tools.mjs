import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

console.log('🔧 tools');
await client.query(`DELETE FROM tools`);
const tools = [
  // Web Dev
  ['VS Code','Web Dev'],['GitHub','Web Dev'],['Vercel','Web Dev'],
  ['Supabase','Web Dev'],['Figma','Web Dev'],
  // Virtual Assistant
  ['Notion','Virtual Assistant'],['Trello','Virtual Assistant'],['Slack','Virtual Assistant'],
  ['Google Workspace','Virtual Assistant'],['ChatGPT','Virtual Assistant'],
  ['Canva','Virtual Assistant'],['Zoom','Virtual Assistant'],
];
for (let i = 0; i < tools.length; i++) {
  await client.query(`INSERT INTO tools (name,category,"order") VALUES ($1,$2,$3)`, [tools[i][0], tools[i][1], i]);
}

console.log('✅ Tools updated!');
await client.end();
