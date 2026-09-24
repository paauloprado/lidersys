const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCandidatesTable() {
  const sql = `
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
  `;

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.error("Error creating candidates table via RPC:", error);
  } else {
    console.log("Table 'candidates' created successfully.");
  }
}

createCandidatesTable();
