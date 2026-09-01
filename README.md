# taxpayer-web

A React + TypeScript single-page app that helps Jamaican taxpayers track income and
expenses, estimate their tax liability, and prepare filings (including the S04 annual
return). It talks to a separate backend API and supports WhatsApp-based transaction
logging and Paddle-powered subscriptions.

## Tech stack

- **React 19** + **TypeScript**, bundled with **Vite 8**
- **React Router v7** for routing
- **TanStack React Query v5** for server state
- **Tailwind CSS v4** (via the Vite plugin) with **shadcn/ui** + Radix primitives
- **React Hook Form** + **Zod** for forms and validation
- **Recharts** for charts, **lucide-react** for icons, **sonner** for toasts
- **Paddle.js** for checkout/billing
- **React Compiler** (`babel-plugin-react-compiler`) is enabled

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then set VITE_API_URL
pnpm dev
```

### Environment

| Variable       | Description                                  |
| -------------- | -------------------------------------------- |
| `VITE_API_URL` | Base URL of the backend API (read at build/dev time) |

## Scripts

```bash
pnpm dev          # start the dev server with HMR
pnpm build        # type-check then bundle for production (tsc -b && vite build)
pnpm lint         # run ESLint
pnpm preview      # serve the production build locally
```

No test suite is configured yet.

## Project structure

```
src/
  services/         API client (Axios, withCredentials, redirects to /login on 401) + per-domain services
  components/       Feature components and shadcn/ui primitives (components/ui)
  context/          AuthContext, SubscriptionContext
  guards/           AuthGuard, OnboardingGuard route wrappers
  hooks/            React Query hooks (transactions, dashboard, tax, profile, Paddle, ...)
  lib/              Helpers — currency (JMD, cents-based), dates, phone, nav, constants
  pages/            Route-level screens (auth, onboarding, dashboard, transactions, tax, profile, payments)
  types/            Shared API/domain types
```

## Conventions

- All API calls go through the shared Axios client; it sends session cookies and
  redirects to `/login` on any 401.
- Monetary values are stored as integer **cents**; format for display with
  `formatJMD(cents)` from `src/lib/currency.ts`.
- Colors are theme tokens defined in `src/index.css` — no arbitrary hex classes.
- Every screen is built mobile-first.
- Don't hand-memoize with `useMemo`/`useCallback`; the React Compiler handles it.

## Routing

Routes are defined in `src/App.tsx`. Public auth routes are open; everything else is
wrapped in `AuthGuard`, and the main app shell additionally requires completed
onboarding via `OnboardingGuard`.
