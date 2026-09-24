const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: true }
  });
  
  try {
    await client.connect();
    
    const { rows: users } = await client.query('SELECT id, email FROM auth.users');
    console.log("Users in auth.users:", users);
    
    const { rows: profiles } = await client.query('SELECT * FROM public.profiles');
    console.log("Profiles in public.profiles:", profiles);
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

main();
