# LiderSys

Aplicação de gestão de lideranças e registros eleitorais, construída com Next.js 15, React e Supabase.

## Desenvolvimento local

1. Instale as dependências com `npm ci`.
2. Copie `.env.example` para `.env.local` e preencha as variáveis no Supabase.
3. Aplique as migrations em `supabase/migrations` no projeto Supabase.
4. Execute `npm run dev` e abra `http://localhost:3000`.

## Variáveis de ambiente

Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente local e na Vercel. A service role key deve ficar somente no ambiente de servidor; nunca use prefixo `NEXT_PUBLIC_` nela. `SUPABASE_DB_URL` é opcional e serve apenas para scripts locais de manutenção do banco.

## Publicação

Importe o repositório GitHub na Vercel, selecione o preset Next.js e cadastre as variáveis de ambiente de produção. A migration de segurança precisa ser aplicada no Supabase antes de publicar. Depois, faça deploy e valide login, criação/edição/exclusão de registros e acesso com perfis de permissões diferentes.

O projeto usa `npm run build` para a compilação de produção e `npm run lint` para o ESLint.
