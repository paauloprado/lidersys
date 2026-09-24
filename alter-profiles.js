const { Client } = require('pg');

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: true }
  });
  
  try {
    await client.connect();
    console.log("Connected to the database via pooler!");
    
    await client.query(`
      ALTER TABLE public.profiles 
      ADD COLUMN IF NOT EXISTS access_modules jsonb DEFAULT '[]'::jsonb;
    `);
    
    console.log("Column access_modules added successfully!");
  } catch (error) {
    console.error("Failed to alter table:", error);
  } finally {
    await client.end();
  }
}

main();
