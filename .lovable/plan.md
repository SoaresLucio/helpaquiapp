# Auditoria & Plano de Produção — helpaquiapp

Esta é uma demanda muito ampla (≈ 15 frentes, dezenas de arquivos, mudanças em backend, RLS, edge functions, UI e UX). Vou entregar em **fases priorizadas**, cada uma como uma entrega revisável. Assim você pode aprovar/ajustar fase a fase em vez de receber tudo num único PR gigante (que seria impossível de revisar e arriscado para produção).

## Fase 1 — Correções críticas de fluxo (prioridade máxima)
Os 3 itens que você destacou explicitamente:

1. **Contratar serviço pelo Chat (solicitante/empresa → freelancer)**
   - Adicionar ação "Contratar este serviço" dentro de `ChatWindow` (header + botão de ação rápida).
   - Cria automaticamente um `service_request` vinculado à conversa + `service_proposal` aceita, ou abre um diálogo de confirmação de valor/escopo antes de gerar o pagamento.
   - Mensagem de sistema no chat registrando a contratação.

2. **Perfil público com informações limitadas**
   - Nova rota `/u/:userId` (ou refatorar `UserProfilePage` existente).
   - Mostra apenas: avatar, nome, tipo de usuário, nº de serviços prestados, média de avaliações, lista de reviews. Esconde: telefone, e-mail, endereço, CPF/CNPJ, dados bancários.
   - Criar/usar uma `view` `public_profiles` no Supabase com RLS apropriada (sem PII).

3. **PIX QR Code com valor correto**
   - Auditar `generate-pix-payment` edge function + `pix_payments`/`pix_transactions`.
   - Garantir que o `value` enviado ao Asaas == valor do plano/serviço (em centavos vs reais — provável fonte do bug).
   - Validar o QR retornado no frontend e exibir o valor formatado ao lado do QR.

## Fase 2 — UX core (jornada do usuário)
- **Onboarding Wizard** diferenciado por tipo (freelancer / solicitante / empresa) — 3-4 steps, salva flag `onboarding_completed` em `profiles`.
- **Empty states** padronizados (componente `<EmptyState icon cta />`) aplicado em: chat sem conversas, lista de serviços vazia, busca sem resultados, ofertas vazias.
- **Skeletons** consistentes nas listas principais (jobs, offers, freelancers, chat).
- **Toasts** (sonner) em todas as mutações (já parcialmente feito — passar e padronizar).

## Fase 3 — Infra & performance
- **Realtime**: confirmar replicação habilitada para `chat_messages`, `notifications`, `conversations`; garantir cleanup de canais (já existe parcialmente em `useRealTimeChat`).
- **ErrorBoundary global** com botão "Tentar novamente" + reset do query cache da rota.
- **TanStack Query**: definir `staleTime` por domínio (categorias 1h, perfis públicos 5min, listas dinâmicas 30s, chat 0).
- **Notification center** (sino no Header) com badge de não lidas, dropdown e marcar como lido (hooks já existem).

## Fase 4 — UI & componentes
- **Dark mode**: validar tokens HSL em `index.css` para `.dark`, adicionar toggle no Header (já existe `useTheme`).
- **Responsividade**: revisar tabelas admin, mapas e chat em 320–375px e ≥1440px.
- **react-hook-form + Zod** com máscaras (CPF, CNPJ, telefone, CEP) — adicionar `react-imask` (leve, ~15kb) ou regex no Zod.
- **Micro-interações** Framer Motion: fade-in em cards de listagem (já usado em algumas páginas — padronizar via wrapper `<MotionList>`).

## Fase 5 — Busca avançada
- Filtros de freelancers/serviços por: raio (km, usando lat/lng do usuário), avaliação mínima, faixa de preço, categoria, disponibilidade.
- Pré-cálculo no banco via função `nearby_freelancers(lat,lng,radius)` (PostGIS já presente? validar; senão fórmula Haversine em SQL).

## Fora de escopo desta proposta
- Reescrita arquitetural, mudança de stack, ou mover arquivos (você pediu para preservar a estrutura).
- Otimizações que dependam de novas dependências pesadas.

## Como prosseguir
Recomendo aprovarmos fase a fase. Sugestão: **começar pela Fase 1** (3 itens críticos que você nomeou explicitamente) e seguir.

Responda com:
- "começar fase 1" → executo os 3 fixes críticos agora.
- "começar fase X" → pulo direto.
- "fazer tudo" → executo sequencialmente, mas será um conjunto grande de commits e levará várias rodadas.
- Ou ajuste o escopo antes de eu começar.
