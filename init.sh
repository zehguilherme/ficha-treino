#!/usr/bin/env bash
set -euo pipefail

echo "=== Verificando harness Ficha de Treino ==="

test -f docker-compose.yml || { echo "Faltando: docker-compose.yml"; exit 1; }
test -f backend/package.json || { echo "Faltando: backend/package.json"; exit 1; }
test -f frontend/package.json || { echo "Faltando: frontend/package.json"; exit 1; }
test -f backend/src/server.ts || { echo "Faltando: backend/src/server.ts"; exit 1; }
test -f frontend/src/app/page.tsx || { echo "Faltando: frontend/src/app/page.tsx"; exit 1; }

echo "Subindo containers..."
docker compose up -d --wait

echo "Aplicando migrations..."
(cd backend && npx prisma migrate deploy)

echo "Executando seed..."
(cd backend && npx tsx src/seed.ts)

echo "Verificando health check..."
curl -sf http://localhost:3001/api/health > /dev/null || { echo "API não responde"; exit 1; }

echo "=== Harness OK ==="
