# TradeZone

Aplicação em desenvolvimento para anunciar e trocar cartas colecionáveis de Magic: The Gathering. O projeto reúne catálogo, anúncios e perfis de usuários.

- `tradeZoneFrontEnd/` — interface em Next.js, React e TypeScript.
- `tradeZoneBackEnd/` — API em NestJS e Prisma, com PostgreSQL.

## Executar localmente

Requisitos: Node.js 22, npm e Docker Compose.

1. Na raiz, execute `docker compose up -d postgres_db`.
2. Em `tradeZoneBackEnd/`, copie `.env.example` para `.env` e preencha `JWT_SECRET` com um valor aleatório próprio.
3. Ainda em `tradeZoneBackEnd/`, execute:

   ```sh
   npm ci
   node --env-file=.env node_modules/prisma/build/index.js generate
   npm run build
   node --env-file=.env dist/src/main.js
   ```

4. Em outro terminal, execute `npm ci` e `npm run dev -- --port 3001` dentro de `tradeZoneFrontEnd/`.

A interface fica em `http://localhost:3001` e a API em `http://localhost:3000`. As variáveis de Google e AWS no exemplo servem para configurar login com Google e upload de imagens, respectivamente.
