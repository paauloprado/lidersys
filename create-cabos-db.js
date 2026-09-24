const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: true }
  });
  
  try {
    await client.connect();
    
    // Create candidates table first
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.candidates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        number TEXT NOT NULL,
        role TEXT NOT NULL,
        party TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Admins can manage candidates" ON public.candidates;
      CREATE POLICY "Admins can manage candidates"
        ON public.candidates
        FOR ALL
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
        
      DROP POLICY IF EXISTS "Everyone can view candidates" ON public.candidates;
      CREATE POLICY "Everyone can view candidates"
        ON public.candidates
        FOR SELECT
        USING (true);
    `);

    console.log("Table candidates created successfully!");

    // Create cabos_ledger table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.cabos_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES public.profiles(id) NOT NULL,
        type TEXT DEFAULT 'individual',
        quantity INTEGER DEFAULT 1,
        candidate_id UUID REFERENCES public.candidates(id),
        name TEXT,
        phone TEXT,
        neighborhood TEXT,
        voting_location TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      ALTER TABLE public.cabos_ledger ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view own cabos" ON public.cabos_ledger;
      CREATE POLICY "Users can view own cabos"
        ON public.cabos_ledger
        FOR SELECT
        USING (auth.uid() = user_id OR public.is_admin());

      DROP POLICY IF EXISTS "Users can insert own cabos" ON public.cabos_ledger;
      CREATE POLICY "Users can insert own cabos"
        ON public.cabos_ledger
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete own cabos" ON public.cabos_ledger;
      CREATE POLICY "Users can delete own cabos"
        ON public.cabos_ledger
        FOR DELETE
        USING (auth.uid() = user_id OR public.is_admin());
    `);

    console.log("Table cabos_ledger created successfully!");
    
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

main();
