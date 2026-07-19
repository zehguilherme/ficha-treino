# Integração TanStack Query + Context API

## Decisão

Substituir `useState`/`useEffect` por **TanStack Query** para todo estado do servidor (data fetching, cache, mutations). **Context API** para estado global do cliente. `useState` mantido apenas para estado local de UI (inputs, modais).

## Mapeamento API → Hooks

| Endpoint                                      | Hook TanStack Query                                                                | Estratégia                          |
| --------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| `GET /workouts`                               | `useQuery({ queryKey: ['workouts'] })`                                             | stale 5min                          |
| `GET /workouts/:weekDay`                      | `useQuery({ queryKey: ['workouts', weekDay] })`                                    | stale 5min                          |
| `GET /workouts/:weekDay/exercises`            | `useQuery({ queryKey: ['workouts', weekDay, 'exercises'] })`                       | stale 5min                          |
| `POST /workouts/:weekDay/exercises/:id`       | `useMutation({ onSuccess: invalidate ['workouts', weekDay] })`                     | invalida após sucesso               |
| `DELETE /workouts/:weekDay/exercises/:id`     | `useMutation({ onSuccess: invalidate ['workouts', weekDay] })`                     | invalida após sucesso               |
| `PATCH /workouts/:weekDay/exercises/:id/done` | `useMutation` com optimistic update                                                | instantâneo na UI                   |
| `POST /workouts/:weekDay/clear`               | `useMutation({ onSuccess: invalidate ['workouts', weekDay] })`                     | invalida                            |
| `GET /exercises?search=...`                   | `useQuery({ queryKey: ['exercises', 'search', debounced], enabled: !!debounced })` | stale Infinity (seed data)          |
| `GET /auth/me`                                | `useQuery({ queryKey: ['auth', 'user'] })`                                         | stale Infinity (só no login/logout) |

## Provider Chain

```
<QueryClientProvider>
  <AuthProvider>
    <Component />
  </AuthProvider>
</QueryClientProvider>
```

## AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (googleToken: string) => Promise<void>;
  logout: () => void;
}
```

Populado via `useQuery(['auth', 'user'])`. Login/logout invalidam e redirecionam.

## Optimistic Updates (toggle done)

```typescript
useMutation({
  mutationFn: ({ weekDay, exerciseId }) => api.patch(...),
  onMutate: async ({ weekDay, exerciseId }) => {
    await queryClient.cancelQueries(['workouts', weekDay, 'exercises'])
    const previous = queryClient.getQueryData(['workouts', weekDay, 'exercises'])
    queryClient.setQueryData(['workouts', weekDay, 'exercises'], (old) =>
      old.map(ex => ex.id === exerciseId ? { ...ex, done: !ex.done } : ex)
    )
    return { previous }
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['workouts', vars.weekDay, 'exercises'], context.previous)
  },
})
```

## Debounce na busca de exercícios

Input controlado via `useState` → debounce (300ms) → `useQuery` com `enabled: !!debouncedSearch`.

## Dependências

- `@tanstack/react-query`
- `@tanstack/react-query-devtools` (dev)
