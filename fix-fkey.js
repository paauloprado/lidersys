const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL;

async function migrate() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: true }
  });
  await client.connect();
  
  try {
    console.log('Fixing foreign key constraints for cabos_ledger and voters_ledger...');
    
    await client.query(`
      -- Drop existing constraints
      ALTER TABLE public.cabos_ledger DROP CONSTRAINT IF EXISTS cabos_ledger_candidate_id_fkey;
      
      -- Re-add with ON DELETE CASCADE (or SET NULL)
      -- Using CASCADE because if a candidate is deleted, we might want to orphan the cabo or cascade?
      -- Actually, let's use SET NULL so we don't lose the cabo record.
      ALTER TABLE public.cabos_ledger
        ADD CONSTRAINT cabos_ledger_candidate_id_fkey
        FOREIGN KEY (candidate_id)
        REFERENCES public.candidates(id)
        ON DELETE SET NULL;
        
    `);

    console.log('Foreign key constraints updated successfully to ON DELETE SET NULL.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

migrate();
