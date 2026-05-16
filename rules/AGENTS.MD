# Open-Design: Agent Directives & Repository Constitution

This file is the single source of truth for any AI agent or developer operating in this repository. Read this before touching any code. Deviating from these rules is a critical failure.

## 1. Repository Architecture (pnpm Monorepo)
- **apps/daemon**: Express/SQLite backend. Owns agent spawning, system control, and internal API.
- **apps/web**: Next.js 16 (App Router) + React 18 frontend. Primary UI runtime.
- **apps/desktop**: Electron shell. Discovers web URL through sidecar IPC.
- **packages/contracts**: The ONLY place for shared DTOs, API payloads, and SSE types. 
- **tools/dev**: The lifecycle control plane. Use `pnpm tools-dev` for all local execution.

## 2. Hard Boundary Constraints (Non-Negotiable)
- **No Cross-Pollination**: `apps/web` MUST NOT import directly from `apps/daemon/src` or any other app's private source. All communication happens via HTTP APIs and types defined in `packages/contracts`.
- **Pure Contracts**: `packages/contracts` must remain PURE TypeScript. Do not add Node.js, Browser APIs, Next.js, Express, or SQLite dependencies here. 
- **Source/Test Isolation**: 
    - `src/` directories are for production code ONLY.
    - All tests must live in a `tests/` directory sibling to `src/`. 
    - Never create `*.test.ts` or `*.test.tsx` files inside a `src/` folder.
- **Tombstoned Directories**: Never recreate `apps/nextjs` or `packages/shared`. They are deprecated and permanently removed.

- Product and onboarding: `README.md`, `README.zh-CN.md`, `QUICKSTART.md`.
- Contribution and environment: `CONTRIBUTING.md`, `CONTRIBUTING.zh-CN.md`.
- Architecture and protocols: `docs/spec.md`, `docs/architecture.md`, `docs/skills-protocol.md`, `docs/agent-adapters.md`, `docs/modes.md`.
- Roadmap and references: `docs/roadmap.md`, `docs/references.md`, `docs/code-review-guidelines.md`, `specs/current/maintainability-roadmap.md`.
- Directory-level agent guidance: `apps/AGENTS.md`, `packages/AGENTS.md`, `tools/AGENTS.md`, `e2e/AGENTS.md`.

## 3. Technical Standards
- **Runtime**: Node ~24 and pnpm 10.33.2 (Corepack required).
- **Language**: TypeScript 5.6+ is mandatory. `.js`, `.cjs`, or `.mjs` is only permitted for generated output, vendored dependencies, or explicitly documented compatibility layers.
- **Git Hygiene**: No `Co-authored-by` trailers in commits.

## 4. Workflow & Commands
Do not use standard npm/pnpm aliases like `pnpm dev`, `pnpm build`, `pnpm test`, or `pnpm start` at the root level. They do not exist here.
- **Local Dev**: `pnpm tools-dev` (starts the full stack).
- **Validation**: `pnpm guard` (enforces file rules) and `pnpm typecheck`.
- **Scoped Action**: Use `--filter` for package-specific tasks (e.g., `pnpm --filter @open-design/web test`).

## 5. Data Handling
- Do not track or reference files in `.od/`, `.tmp/`, Playwright report directories, or agent scratch directories. These are gitignored local runtimes.
- **Storage Overrides**: Use `OD_DATA_DIR` to relocate the daemon root and `OD_MEDIA_CONFIG_DIR` for credentials.

## 6. Security & Hardening 
- **Zero-Trust Between Layers**: Treat all inputs from `apps/web` to `apps/daemon` as malicious. Every API endpoint in the daemon MUST perform strict input validation using the schemas defined in `packages/contracts`.
- **SQL Injection Prevention**: We use `better-sqlite3`. Never use string interpolation for queries. Use parameterized queries exclusively.
- **Secret Management**: Never hardcode API keys or credentials. If a feature requires a secret, you must reference `OD_MEDIA_CONFIG_DIR` or the appropriate `.env` variable. Leaking a secret in suggested code is a failure.

## 7. Clean Architecture Principles
- **Contract-First Development**: You are forbidden from writing a frontend-backend feature without first defining the DTO (Data Transfer Object) in `packages/contracts`. The contract is the source of truth.
- **Separation of Concerns**:
    - **Logic vs. Transport**: Keep business logic out of the Express route handlers in `apps/daemon`. Routes should only handle requests/responses and delegate logic to dedicated services.
    - **UI vs. State**: Keep `apps/web` components thin. Move complex state logic into dedicated providers, hooks, or server actions.
- **Dependency Rule**: Dependencies must only point inwards. `apps/` can depend on `packages/`, but `packages/` must NEVER depend on `apps/`.

## 8. Dependency & Supply Chain Guardrails
- **No Hallucinated Packages**: You are strictly forbidden from adding or recommending new `npm` or `pnpm` dependencies unless explicitly instructed. 
- **Use Existing Tools**: You must exhaust all existing packages in `package.json` before suggesting a new one.
- **Dependency Proof**: If instructed to add a package, you must verify its exact, current version and confirm it is a verified, mainstream repository. Do not guess package names.

## 9. Performance & I/O Constraints
- **No N+1 Queries**: You must NEVER place a database query, file system read, or external API call inside a loop. 
- **Batching Required**: All data fetching in `apps/daemon` must be batched or use proper SQL `JOIN`s.
- **Memory Profiling**: Before writing an async function, explicitly state if it has the potential to block the event loop or consume excessive memory.

## 10. Strict Anti-XSS & Output Sanitization
- **Banned React Patterns**: You are permanently forbidden from using `dangerouslySetInnerHTML` in `apps/web`. No exceptions.
- **No Raw DOM Manipulation**: Do not use `document.getElementById` or raw DOM injection in the Next.js app. Rely entirely on React state and refs.

## 11. Concurrency & Logic Correctness
- **Explicit Error Boundaries**: Every `try/catch` block you write must explicitly handle the error. You may not write empty `catch (e) {}` blocks or generic console logs.
- **Await Discipline**: Do not use floating promises. Every asynchronous operation must be `await`ed or explicitly handled.
- **State Machine Logic**: For multi-step logic flows in the daemon, break the logic down into pure functions. Do not write monolithic, overly long route handlers.

