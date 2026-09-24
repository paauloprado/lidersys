const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: true }
  });
  
  try {
    await client.connect();
    
    await client.query(`
      ALTER TABLE public.voters_ledger 
      ADD COLUMN IF NOT EXISTS type text DEFAULT 'individual',
      ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
      ADD COLUMN IF NOT EXISTS neighborhood text,
      ADD COLUMN IF NOT EXISTS voting_location text;
    `);

    console.log("Colunas adicionadas com sucesso Ã  tabela voters_ledger!");
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

main();
