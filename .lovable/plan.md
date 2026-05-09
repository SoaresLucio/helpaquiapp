# Refator de Performance + Auditoria End-to-End

## Objetivo
Tornar o app mais leve e fluido, eliminar bugs de carregamento, e entregar uma lista clara do que ainda falta para produção sem riscos.

---

## Parte 1 — Refator de Performance (vou aplicar agora)

### 1.1 `main.tsx` — ordem dos providers
Hoje: `AuthProvider` está FORA do `BrowserRouter`, mas usa `useLocation` internamente (`RequireAuth`). Isso só não quebra porque `RequireAuth` não é montado, mas é frágil. Mover `BrowserRouter` para envolver `AuthProvider`.

### 1.2 `App.tsx` — reduzir re-render por rota
- O `motion.div` de `PageWrapper` é recriado a cada render (objeto `pageTransition` ok, mas `style={{width:'100%'}}` inline cria novo objeto). Extrair para constante.
- `AnimatePresence mode="wait"` + `Suspense` global causa "flash" de LoadingScreen a cada navegação. Mover `Suspense` para dentro de cada `PageWrapper` com fallback `null`, ou usar um fallback mínimo (skeleton) — evita reflow grande.
- Pré-carregar (`prefetch`) rotas críticas (`/dashboard`, `/login`, `/chat`) em `idle callback`.

### 1.3 `ProtectedRoute.tsx` — duplo loading
Hoje espera `loading` (auth) **E** `adminLoading`. `useAdminAccess` re-busca a cada mount. Resultado: telas piscam "Carregando..." duas vezes.
- Renderizar filhos assim que `auth.loading=false` e tratar `isAdmin` como "default false até carregar" — não bloquear render.
- Remover `useUserLocation()` do ProtectedRoute (executa em TODA rota protegida, dispara geolocation+IP toda navegação). Mover para um único `<UserLocationTracker />` montado uma vez no `AuthProvider`.

### 1.4 `useAuth.tsx` — fetch de profile redundante
- Memoizar `securityScore` em `useMemo` em vez de `useState`+`useEffect` separado.
- Cachear profile via React Query (`useQuery(['profile', userId])`) em vez de state local — evita refetch a cada mudança de `authState.userType`.

### 1.5 QueryClient
Aumentar `staleTime` para listas estáticas (categorias, planos) e habilitar `refetchOnReconnect: false` para evitar tempestade de requests.

### 1.6 Bundle
- Remover imports não usados em `Index.tsx` (já enxuto, ok).
- `framer-motion` é pesado: trocar `AnimatePresence` global por animações CSS em rotas onde não há valor visual.

### 1.7 Bugs identificados
- **`AuthProvider` fora do Router**: `RequireAuth` quebraria se usado.
- **`localStorage.removeItem('userType')` no logout** mas `userType` é lido apenas de `user_metadata` (correto após fix anterior). Restos de localStorage são lixo — limpar todas as chaves de auth/cache no logout.
- **`SecurityProvider` dentro de `AuthProvider`**: ok, mas `Toaster` está fora do `BrowserRouter` — toasts com `<Link>` quebrariam. Mover para dentro.
- **`useJobNotifications` em `Index.tsx`** abre canal realtime mesmo para `solicitante`/`empresa` (só faz sentido para freelancer). Condicionar.

---

## Parte 2 — Lista de Pendências para Produção (entrego no final, não implemento sem aprovação)

### 🔴 Crítico (bloqueia produção)
1. **Configurações manuais Supabase** (não migrationáveis):
   - Reduzir OTP expiry para ≤ 1h (Auth → Providers → Email)
   - Habilitar Leaked Password Protection (Auth → Policies)
   - Aplicar upgrade do Postgres (Settings → Infrastructure)
2. **Service Role Key**: confirmar que NÃO está em nenhuma edge function exposta sem auth check (auditar 11 funções).
3. **CSP / Security Headers**: `securityHeaders.ts` existe mas não vi sendo aplicado no `index.html` — verificar.
4. **Rate limiting real**: `useRateLimit` é client-side (burlável). Mover para edge function com Redis/KV ou tabela `rate_limits` com TTL.

### 🟠 Alto
5. **Tokens em localStorage**: SDK Supabase usa por padrão. Para HttpOnly real, precisa proxy via edge function (~2 dias de trabalho).
6. **Validação de CPF/CNPJ server-side** (hoje só client).
7. **Sanitização de uploads**: validar magic bytes além de mimetype no Storage.
8. **Auditoria PII**: `UserProfile`/`ProfessionalCard` ainda mostram dados antes de "match" — implementar `SecureDataDisplay` com re-auth.
9. **Webhook ASAAS**: validar assinatura HMAC (verificar `asaas-webhook/index.ts`).

### 🟡 Médio
10. **Testes**: 0 testes automatizados. Adicionar Vitest + RTL para fluxos críticos (login, payment, RLS).
11. **Error tracking**: integrar Sentry ou similar.
12. **Painel Admin de Audit Log** (tabela já existe, falta UI).
13. **i18n**: textos hardcoded em PT-BR.
14. **Acessibilidade**: faltam aria-labels em botões com ícone.

### 🟢 Baixo
15. **Lighthouse**: rodar e otimizar imagens (WebP, lazy).
16. **PWA**: manifest + service worker.
17. **SEO**: meta tags por rota.

---

## Arquivos que vou tocar nesta passada
- `src/main.tsx` — reordenar providers
- `src/App.tsx` — extrair constantes, prefetch rotas
- `src/components/auth/ProtectedRoute.tsx` — remover double-loading e mover useUserLocation
- `src/hooks/useAuth.tsx` — memoização do securityScore
- `src/pages/Index.tsx` — condicionar useJobNotifications

Sem mudanças de banco, sem mudanças de UI visual, sem mudanças de lógica de negócio.
