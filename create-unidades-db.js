const { Client } = require('pg');
const fs = require('fs');

const connectionString = process.env.SUPABASE_DB_URL;

async function migrate() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: true }
  });
  await client.connect();
  
  try {
    console.log('Creating voting_locations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.voting_locations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        neighborhood TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      ALTER TABLE public.voting_locations ENABLE ROW LEVEL SECURITY;
      
      -- Policies
      DROP POLICY IF EXISTS "voting_locations_read" ON public.voting_locations;
      CREATE POLICY "voting_locations_read" ON public.voting_locations FOR SELECT USING (true);
      
      DROP POLICY IF EXISTS "voting_locations_all" ON public.voting_locations;
      CREATE POLICY "voting_locations_admin_manage" ON public.voting_locations FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
    `);

    console.log('Populating data from bairro_escolas_map.json...');
    const mapData = JSON.parse(fs.readFileSync('bairro_escolas_map.json', 'utf8'));
    
    let count = 0;
    for (const [bairro, escolas] of Object.entries(mapData)) {
      for (const escola of escolas) {
        await client.query(
          'INSERT INTO public.voting_locations (name, neighborhood) SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM public.voting_locations WHERE name = $1 AND neighborhood = $2)',
          [escola, bairro]
        );
        count++;
      }
    }
    
    console.log(`Inserted ${count} voting locations.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

migrate();
