# Configuração do Google OAuth para Sprintly

Este guia explica como configurar a autenticação Google OAuth no Supabase para a plataforma Sprintly.

## 📋 Pré-requisitos

- Conta no Google Cloud Console
- Projeto Supabase configurado
- Domínio ou URL de desenvolvimento definido

## 🔧 Passo 1: Configurar Google Cloud Console

### 1.1 Criar um Projeto (se necessário)

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em **"Select a project"** no topo da página
3. Clique em **"New Project"**
4. Digite o nome do projeto (ex: "Sprintly OAuth")
5. Clique em **"Create"**

### 1.2 Habilitar Google+ API

1. No menu lateral, vá para **"APIs & Services" > "Library"**
2. Procure por **"Google+ API"**
3. Clique em **"Enable"**

### 1.3 Configurar OAuth Consent Screen

1. Vá para **"APIs & Services" > "OAuth consent screen"**
2. Escolha **"External"** (para desenvolvimento) ou **"Internal"** (para uso corporativo)
3. Preencha as informações obrigatórias:
   - **App name**: Sprintly
   - **User support email**: seu-email@exemplo.com
   - **Developer contact information**: seu-email@exemplo.com
4. Clique em **"Save and Continue"**
5. Em **"Scopes"**, adicione os escopos necessários:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
6. Clique em **"Save and Continue"**
7. Em **"Test users"** (se External), adicione emails de teste
8. Clique em **"Save and Continue"**

### 1.4 Criar Credenciais OAuth

1. Vá para **"APIs & Services" > "Credentials"**
2. Clique em **"+ Create Credentials" > "OAuth client ID"**
3. Escolha **"Web application"**
4. Configure:
   - **Name**: Sprintly Web Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (desenvolvimento)
     - `https://seudominio.com` (produção)
   - **Authorized redirect URIs**:
     - `https://[SEU-PROJETO-SUPABASE].supabase.co/auth/v1/callback`
5. Clique em **"Create"**
6. **Copie e salve** o `Client ID` e `Client Secret`

## 🔧 Passo 2: Configurar Supabase

### 2.1 Acessar Configurações de Autenticação

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para **"Authentication" > "Providers"**
3. Encontre **"Google"** na lista de provedores

### 2.2 Configurar Google Provider

1. Clique no toggle para **habilitar** o Google
2. Preencha os campos:
   - **Client ID**: Cole o Client ID do Google Cloud Console
   - **Client Secret**: Cole o Client Secret do Google Cloud Console
3. Clique em **"Save"**

### 2.3 Configurar Site URL e Redirect URLs

1. Vá para **"Authentication" > "URL Configuration"**
2. Configure:
   - **Site URL**: `http://localhost:3000` (desenvolvimento) ou `https://seudominio.com` (produção)
   - **Redirect URLs**: Adicione as URLs permitidas:
     - `http://localhost:3000/dashboard`
     - `https://seudominio.com/dashboard`

## 🔧 Passo 3: Configurar Variáveis de Ambiente

Crie ou atualize seu arquivo `.env.local`:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJETO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# OpenAI (para geração de roadmaps)
OPENAI_API_KEY=sua-openai-key-aqui
\`\`\`

## 🔧 Passo 4: Executar Scripts do Banco

Execute os scripts SQL no Supabase SQL Editor:

1. Execute `scripts/schema.sql` primeiro
2. Execute `scripts/seed.sql` para dados de exemplo (opcional)

## 🧪 Passo 5: Testar a Integração

### 5.1 Desenvolvimento Local

1. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Acesse `http://localhost:3000/login`
3. Clique em **"Continuar com Google"**
4. Complete o fluxo de autenticação
5. Verifique se você foi redirecionado para `/dashboard`

### 5.2 Verificar Dados do Usuário

1. No Supabase Dashboard, vá para **"Authentication" > "Users"**
2. Verifique se o usuário foi criado com dados do Google
3. Vá para **"Table Editor" > "profiles"**
4. Confirme se o perfil foi criado automaticamente

## 🔒 Considerações de Segurança

### Produção

1. **Domínios Autorizados**: Certifique-se de que apenas seus domínios estão nas listas de redirect
2. **HTTPS**: Use sempre HTTPS em produção
3. **Secrets**: Nunca exponha Client Secret no frontend
4. **Scopes**: Use apenas os scopes necessários

### Desenvolvimento

1. **Test Users**: Adicione emails de teste no Google Console
2. **Localhost**: Configure corretamente as URLs de desenvolvimento
3. **Environment**: Use arquivos `.env.local` para variáveis sensíveis

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"

- Verifique se a URL de redirect no Google Console está correta
- Formato: `https://[projeto].supabase.co/auth/v1/callback`

### Erro: "invalid_client"

- Verifique se Client ID e Client Secret estão corretos no Supabase
- Confirme se o projeto Google está ativo

### Usuário não redirecionado após login

- Verifique a configuração de Site URL no Supabase
- Confirme se as Redirect URLs incluem `/dashboard`

### Perfil não criado automaticamente

- Execute o script SQL com a função `handle_new_user()`
- Verifique se o trigger `on_auth_user_created` está ativo

## 📚 Recursos Adicionais

- [Documentação Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 🎯 Próximos Passos

Após configurar o OAuth:

1. ✅ Teste o fluxo completo de autenticação
2. ✅ Verifique a criação automática de perfis
3. ✅ Configure as variáveis de ambiente de produção
4. ✅ Implemente logout e gerenciamento de sessão
5. ✅ Configure domínios de produção no Google Console

---

**Nota**: Mantenha suas credenciais seguras e nunca as compartilhe publicamente. Use variáveis de ambiente para todas as informações sensíveis.
