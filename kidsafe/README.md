# KidSafe

Sistema web + extensão de navegador para ajudar responsáveis a proteger
a navegação de crianças e adolescentes: bloqueio de sites e palavras-
chave, horário de uso, bloqueio de tela, mensagens de aviso e relatórios
de navegação.

## Estrutura do projeto

```
kidsafe/
├── src/           → painel web (React + Vite)
├── server/        → API (Express + Prisma)
└── extension/     → extensão para navegadores Chromium
```

## Ordem para rodar tudo localmente

### 1. Servidor (API)

```bash
cd server
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Sobe em `http://localhost:3333`.

### 2. Painel web

Em outro terminal, na raiz do projeto:

```bash
cp .env.example .env
npm install
npm run dev
```

Sobe em `http://localhost:5173`. Crie uma conta de responsável pela
tela de cadastro.

### 3. Extensão

1. Abra `chrome://extensions`, ative o **Modo do desenvolvedor**.
2. Clique em **Carregar sem compactação** e selecione a pasta
   `extension/`.
3. Clique no ícone da extensão para ver o código de acesso gerado.
4. No painel web, faça login → aba **Ferramentas** → **Ligar
   extensão** → digite o código.

A partir daí, o dispositivo aparece vinculado à conta, e as abas
**Uso**, **Horários** e **Ferramentas** passam a refletir e controlar
esse dispositivo de verdade.

## Observações

- O banco de dados é SQLite local (`server/prisma/dev.db`), criado
  pela migração acima. Para produção, troque `provider` e
  `DATABASE_URL` em `server/prisma/schema.prisma` para Postgres/MySQL.
- A extensão conversa com a API em `http://localhost:3333` por padrão
  — ajuste `API_URL` em `extension/background.js` se o servidor
  estiver em outro endereço.
- Só existe uma conta por dispositivo vinculado nesta versão (um
  responsável, um dispositivo). Vincular várias extensões à mesma
  conta ainda não tem suporte na interface.
