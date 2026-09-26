// Script para verificar/criar a tabela campaign_settings no Supabase
// Execute: node scripts/create-campaign-settings.cjs
//
// Requer as variáveis de ambiente:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//
// Ou passe diretamente: SUPABASE_URL=... SUPABASE_KEY=... node scripts/create-campaign-settings.cjs

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.')
  console.error('Exemplo: NEXT_PUBLIC_SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=sb_secret_... node scripts/create-campaign-settings.cjs')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

async function main() {
  // Testa se a tabela já existe tentando selecionar dela
  const { error: checkError } = await supabase
    .from('campaign_settings')
    .select('key')
    .limit(1)

  if (!checkError) {
    console.log('Tabela campaign_settings já existe. Verificando meta padrão...')
  } else {
    console.log('Tabela não existe ainda. Será necessário criá-la via Supabase Dashboard.')
    console.log('Erro:', checkError.message)
  }

  // Tenta upsert da meta padrão (funciona se a tabela existir)
  const { data, error } = await supabase
    .from('campaign_settings')
    .upsert({ key: 'meta_eleitores', value: '5000' }, { onConflict: 'key', ignoreDuplicates: true })
    .select()

  if (error) {
    console.log('Não foi possível inserir via upsert:', error.message)
    console.log('\n=== AÇÃO NECESSÁRIA ===')
    console.log('Execute o SQL abaixo no Supabase Dashboard > SQL Editor:')
    console.log(`
CREATE TABLE IF NOT EXISTS public.campaign_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

INSERT INTO public.campaign_settings (key, value)
VALUES ('meta_eleitores', '5000')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.campaign_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados podem ler configurações" ON public.campaign_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins podem modificar configurações" ON public.campaign_settings
  FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
    `)
  } else {
    console.log('Meta padrão inserida com sucesso:', data)
  }
}

main().catch(console.error)
