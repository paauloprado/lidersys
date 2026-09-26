# SQL para executar no Supabase Dashboard > SQL Editor

```sql
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
```
