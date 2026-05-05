# GitHub Copilot Instructions — meat-app

## Project overview
**MeatApp** — React 18 + TypeScript + Vite (SWC) + React Router v7 app that parses and compares
grocery prices from Finnish stores (S-Market, K-Market).

This is a **learning project** — every code suggestion must be idiomatic, best-practice React.
Always explain *why* a pattern is used, not just *what* to write.
Never introduce shortcuts or patterns that would teach bad habits.

---

## Stack (canonical, do not deviate)

| Concern | Library | Notes |
|---|---|---|
| UI | React 18 (function components only) | No class components, ever |
| Language | TypeScript 5 (strict) | No `any`, no `as` casts without a justifying comment |
| Build | Vite 6 + SWC | |
| Routing | React Router v7 | Use `<Outlet>`, `loader`, `action` conventions |
| Server state | **TanStack Query v5** | All API calls via `useQuery`/`useMutation` |
| Client state | **Zustand** | Only for truly global UI state; local state first |
| HTTP | **ky** or native `fetch` | Thin API layer in `src/api/` |
| Styling | **Tailwind CSS + shadcn/ui** | No inline styles except dynamic values |
| Testing | **Vitest + React Testing Library** | Test behaviour, not implementation |

> If a library is not in this table, ask before adding it.

---

## Architecture

Modern React separates concerns through **hooks, not folder layers**.
The rule is simple: a component renders UI, a hook owns logic.

```
src/
  pages/         # one file per route — thin, composes hooks + components
  components/    # reusable UI — receive data via props, emit via callbacks
  hooks/         # all business logic and data fetching (useProducts, useCart…)
  api/           # raw fetch functions, one file per domain (products.api.ts)
  store/         # Zustand stores, one file per domain (cart.store.ts)
  types/         # shared TypeScript interfaces/types (Product, StorePrice…)
  lib/           # pure utilities, formatters, constants
```

### The core rule
- **`pages/`** — route-level component. Calls hooks, composes components. No direct API calls.
- **`hooks/`** — owns TanStack Query, Zustand, business logic. No JSX.
- **`components/`** — pure UI. Receives props, fires callbacks. No TanStack Query / Zustand.

```
// pages/products-page.tsx — thin orchestrator
export const ProductsPage = () => {
  const { products, isLoading } = useProducts()  // hook owns the logic
  return <ProductsList products={products} isLoading={isLoading} />
}

// hooks/useProducts.ts — all data logic lives here
export const useProducts = () =>
  useQuery({ queryKey: ['products'], queryFn: fetchProducts })

// components/products-list/products-list.tsx — pure UI
export const ProductsList = ({ products, isLoading }: ProductsListProps) => { … }
```

> For larger features, co-locate: `src/features/products/{components,hooks,api.ts,types.ts}`.
> Keep this structure flat until a feature genuinely needs its own sub-folder.

---

## TypeScript conventions

```ts
// ✅ Explicit prop interface above every component
interface ProductsListProps {
  products: Product[];
  isLoading: boolean;
  onSelect: (id: string) => void;
}

// ✅ Named export — never default export for components
export const ProductsList = ({ products, isLoading, onSelect }: ProductsListProps) => { … }

// ❌ Never default exports for components — breaks refactoring tools
// ❌ Never React.FC<Props> — hides return type issues
// ❌ Never `any` — use `unknown` + type guard if type is truly dynamic
```

```ts
// ✅ Model async UI state as a discriminated union — never boolean soup
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

```ts
// ✅ Optional chaining and nullish coalescing always
const price = product?.price ?? 0;
const name = store?.name ?? 'Unknown store';
```

---

## React patterns

### State priority (use in this order)
1. **Local state** — `useState` inside the component. Default choice.
2. **Server state** — TanStack Query. Do NOT mirror API data into `useState`.
3. **Derived state** — compute in the render body, never sync via `useEffect`.
4. **Global UI state** — Zustand only (e.g. cart items, toast queue, modal open/close).

```ts
// ❌ Derived state in useEffect — unnecessary, causes extra render
useEffect(() => { setFullName(`${first} ${last}`) }, [first, last])

// ✅ Derive directly in render
const fullName = `${first} ${last}`
```

### useEffect — rules (read before writing every useEffect)
`useEffect` is **only** for synchronising with external systems: DOM APIs, WebSockets, analytics.

```ts
// ❌ Never fetch data in useEffect
useEffect(() => { fetch('/api/products').then(setProducts) }, [])

// ✅ TanStack Query handles loading, caching, refetching, error state
const { data: products, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
})
```

```ts
// ✅ Always clean up subscriptions and timers
useEffect(() => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)
}, [])
```

### Custom hooks — the primary abstraction unit
Extract all non-trivial stateful logic into `src/hooks/`. One hook = one responsibility.

```ts
// src/hooks/useProducts.ts
export const useProducts = () =>
  useQuery({ queryKey: ['products'], queryFn: fetchProducts })
```

### Early returns for guard clauses
```tsx
// ✅ Early return keeps the happy-path JSX clean and readable
export const ProductsList = ({ products, isLoading }: ProductsListProps) => {
  if (isLoading) return <Spinner />
  if (!products.length) return <EmptyState />

  return (
    <ul>
      {products.map(p => <ProductItem key={p.id} product={p} />)}
    </ul>
  )
}
```

### Keys in lists
```tsx
// ❌ Index key breaks reconciliation when list order can change
items.map((item, i) => <Item key={i} … />)

// ✅ Stable unique id from data
items.map(item => <Item key={item.id} … />)
```

---

## Performance guidelines

Do **not** prematurely optimise. Add `useMemo` / `useCallback` only when there is a measurable reason.

| Hook | Use when |
|---|---|
| `useCallback` | Passing a callback to a component wrapped in `React.memo` |
| `useMemo` | Expensive computation — sorting / filtering large arrays |

```ts
// ❌ Premature — trivial concat has no benefit from memoisation
const label = useMemo(() => `${first} ${last}`, [first, last])

// ✅ Justified — filtering hundreds of items on every render
const filtered = useMemo(
  () => products.filter(p => p.price < maxPrice),
  [products, maxPrice]
)
```

**Rule of thumb:** `useCallback` without `React.memo` on the receiving child does nothing.

---

## React gotchas (strict mode & common traps)

```ts
// ⚠️ Strict Mode runs effects TWICE in development — intentional.
// If your effect breaks on double-run, it is missing a cleanup function.

// ⚠️ Stale closure — value is captured at render time
const handleClick = () => console.log(count) // logs the value from when it was created
// ✅ Functional update reads current value safely
setCount(prev => prev + 1)

// ⚠️ Object/array in deps array — new reference on every render = infinite loop
useEffect(() => { … }, [{ id: 1 }])  // ❌
// ✅ Use primitives or stable refs in deps

// ⚠️ Mutating state — React compares by reference, mutation is invisible to it
state.items.push(newItem)             // ❌ React won't re-render
setItems(prev => [...prev, newItem])  // ✅
setUser(prev => ({ ...prev, name: 'John' }))  // ✅
```

---

## File and naming conventions

| Entity | Convention | Example |
|---|---|---|
| Page file | `kebab-case.tsx` in `pages/` | `pages/products-page.tsx` |
| Component file | `kebab-case/kebab-case.tsx` | `components/products-list/products-list.tsx` |
| Component name | `PascalCase` | `ProductsList` |
| Hook file | `camelCase.ts` | `hooks/useProducts.ts` |
| Hook name | `use` prefix | `useProducts` |
| Type/Interface | `PascalCase`, no `I` prefix | `Product`, `CartItem`, `StorePrice` |
| Store file | `camelCase.store.ts` | `cart.store.ts` |
| API file | `camelCase.api.ts` | `products.api.ts` |

---

## Where types live

`src/types/` tends to grow into a dumping ground. Use two levels instead:

| Type is used by… | Where it lives |
|---|---|
| **1 feature only** | `src/features/<feature>/feature.types.ts` — co-located |
| **2+ features / global contract** | `src/types/` — shared |

### Decision tree

```
Is this type used in more than one feature?
├── YES → src/types/<domain>.ts
└── NO  → src/features/<feature>/<feature>.types.ts
           (or <store>.types.ts if it's a store-specific DTO)
```

### Current project example

```
src/
  types/
    store-adapter.ts        ✅ shared contract — all store adapters implement it

  features/
    products/
      products.types.ts     ✅ Product UI model — owned by this feature
      k-market.types.ts     ✅ K-Market DTO — used only inside this feature
      k-market.api.ts       ✅ fetch + map + kMarketAdapter
      products.hooks.ts     ✅ useKMarketProducts

  hooks/
    useStoreProducts.ts     ✅ generic hook — works with any StoreAdapter
```

### Naming rules

- **`src/types/`** — no redundant suffixes, name by domain.
  `store-adapter.ts` ✅ — `store-adapter.types.ts` ❌
- **`src/features/`** — add `.types.ts` suffix so files sort clearly next to `.api.ts` / `.hooks.ts`.
  `products.types.ts` ✅ — `products.ts` ❌ (ambiguous among sibling files)
- **`src/api/`** — a file here **must contain at least one fetch function**.
  Pure-interface files do not belong in `src/api/`.

---

## Self-check before suggesting code

- [ ] Hooks called at top level only — never inside conditions or loops
- [ ] All `useEffect` deps are complete (`exhaustive-deps` ESLint rule would pass)
- [ ] No server data duplicated into local `useState`
- [ ] Prop interface is explicit and typed — no implicit `{}` or `object`
- [ ] No `any`; `unknown` + type guard if type is truly dynamic
- [ ] List items have stable `key` props (not array index)
- [ ] Logic is in a hook, UI is in a component — no business logic in JSX
- [ ] Named export used — no default exports for components
- [ ] `useMemo`/`useCallback` added only with clear justification

---

## Developer commands

```bash
npm run dev       # start dev server
npm run build     # type-check + production build
npm run lint      # ESLint — fix all errors before committing
npm run preview   # preview production build
```

ESLint runs `typescript-eslint` strict + type-checked + `eslint-plugin-react-hooks`.
**Never suppress a lint error with `eslint-disable` without a comment explaining the exact reason.**

---

## Angular → React transition reference
*(use as a lookup, not as an architecture guide)*

| Angular | React equivalent |
|---|---|
| `@Input()` | Prop |
| `@Output()` + `EventEmitter` | Callback prop `onAction: () => void` |
| `@Injectable` Service + DI | Custom hook in `src/hooks/` |
| `HttpClient` + Observable | TanStack Query + `ky` in `src/api/` |
| `*ngFor` | `array.map(item => <Item key={item.id} />)` |
| `*ngIf` | `{condition && <Component />}` or early return |
| `async` pipe | `const { data } = useQuery(…)` |
| `shareReplay(1)` | TanStack Query cache |
| `BehaviorSubject` in Service | Zustand store |
| `ngOnDestroy` | `useEffect` cleanup return |
| `ChangeDetectionStrategy.OnPush` | `React.memo` |
| Two-way binding `[(ngModel)]` | Controlled input: `value` + `onChange` |