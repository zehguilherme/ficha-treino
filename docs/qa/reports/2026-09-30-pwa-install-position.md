# QA Run Report — 2026-09-30 — pwa-install-position

- **Scope:** Verificar colisões da pílula “Instalar app” em todas as rotas do frontend.
- **Cadence tier:** targeted.
- **Build:** workspace local · **Environment:** `http://localhost:3000`, frontend local com conta autenticada e backend acessível; sem throttling de rede.
- **Started:** 2026-09-30 23:12 UTC · **Status:** closed

## Personas

| Persona | Base | Device / Network / Locale | Sessions |
|---|---|---|---|
| Usuário mobile | Mobile User | phone-small (390×844) e viewport desktop (1280×900) / 4g não emulado / pt-BR | CH-pwa-install-position |

## Flows in Scope

- `J-pwa-install-position` — interagir com as rotas do app com a pílula visível (`../journeys/J-pwa-install-position.md`)

## Session Matrix & Results

| # | Charter | Journey / Scenario | Persona | Tour | Status | Issue | Fix commit |
|---|---|---|---|---|---|---|---|
| 1 | CH-pwa-install-position | J-pwa-install-position / UI-pwa-install-position | Usuário mobile | Feature Tour | Pass | | |

Status legend: `Pending | Pass | Fixed | Skipped | Blocked (needs human verify) | Blocked (human decision)`

## Session Debriefs

### CH-pwa-install-position — Usuário mobile

- **Ran:** 2026-09-30 → 2026-09-30 (box respeitado: sim)
- **Findings:** Nenhum controle importante ficou totalmente coberto em 18 rotas únicas nos viewports 390×844 e 1280×900, no topo e após rolagem ao fim da página. `/login` redirecionou para `/treinos` na sessão autenticada.
- **Bugs filed/updated:** nenhum.
- **Scenarios settled:** UI-pwa-install-position → pass.
- **Paper cuts:** A pílula cruza parcialmente a borda inferior direita de um cartão do dashboard e áreas laterais de alguns botões/cartões em mobile; o centro dos controles permaneceu fora da pílula e nenhum elemento interativo foi coberto por inteiro (dull, observando).
- **Surprises:** Em algumas navegações mobile, a pílula demorou mais que 1,1s para aparecer; repetição com espera de 3s confirmou sua presença nos casos. Na busca mobile, filtros inferiores saem da área do viewport, mas ficam acessíveis ao rolar; “Mecânica” e “Músculo secundário” abriram por clique com a pílula visível. A barra “Limpar busca e filtros” / “Pesquisar exercícios” permaneceu separada da pílula. Diálogos de limpar treino, excluir conta e exercício personalizado mantiveram z-index 50 sobre a pílula em z-index 40.
- **Suggested next charter:** Nenhum necessário para esta verificação de posicionamento.

## What Was Fixed

Nenhum fix durante esta sessão; a alteração de posicionamento foi implementada e registrada antes desta rodada de QA.

## Paper Cuts

| Persona | Where (journey/step) | Felt | Sharpness | Outcome |
|---|---|---|---|---|
| Usuário mobile | J-pwa-install-position / rolagem inicial | “A pílula aparece por cima de uma parte do cartão e de alguns botões, mas ainda consigo tocar no centro deles.” | dull | watching |

## Runtime Errors Observed

- A rota de callback do Google aberta sem parâmetros apresentou a mensagem de autenticação inválida esperada; o diálogo permaneceu acima da pílula. Fluxo OAuth real não foi exercitado.

## Human Verifications Needed

- Nenhuma para a colisão visual; fluxo real de OAuth fora do escopo.

## Decisions for a Human

Nenhuma.

## Learnings

- A pílula ficou no canto inferior direito em todas as rotas alcançadas após aguardar sua renderização. No mobile há interseções parciais com conteúdo rolável, sem cobertura total nem centro de controle interceptado; confirmar com design se essas interseções devem ser eliminadas em uma rodada visual própria.
- Evidência da sessão foi registrada por medidas DOM e interação no navegador. Capturas de tela não foram gravadas no diretório versionado de evidências.

## Final Status

- **QA outcome:** rodada focada completa; nenhum elemento interativo importante ficou totalmente coberto. Há interseções parciais em mobile registradas como observação de UX.
- **Checks:** varredura de 18 rotas únicas em 390×844 e 1280×900, início e fim de rolagem; abertura por clique de filtros em mobile; busca executada; diálogos de treino, conta e exercício abertos e cancelados sem confirmar mutações.
- **Issues by user impact:** Blocks-Completion 0 · Data-Loss 0 · Trust-Damage 0 · Friction 0 · Cosmetic 0.
- **Coverage:** todas as rotas principais, 7 páginas de treino e 7 páginas de busca exercitadas; `/login` redireciona para `/treinos`. OAuth externo não executado e capturas não persistidas como arquivos.
