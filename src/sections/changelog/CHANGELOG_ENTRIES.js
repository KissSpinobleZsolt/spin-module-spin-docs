// Changelog entries — newest first. Each entry maps to one platform release.
export const CHANGELOG_ENTRIES = [
  {
    version: '0.11',
    date: '2026-07-22',
    label: 'Plugin bot-config API + MF loader fix',
    changes: [
      { type: 'feat', text: 'Added GET/PUT /bots/{bot_uuid}/config endpoints to anomascan-backend and cloud-insight-ai-backend — implements the standard plugin backend bot-config contract expected by BotConfigPage. Configs persist in /app/data/bot_configs.json on a named Docker volume.' },
      { type: 'feat', text: 'Added named Docker volumes (anomascan_bot_configs, cloud_insight_ai_bot_configs) so bot configs survive container restarts.' },
      { type: 'fix',  text: 'Fixed Module Federation loader race condition under React StrictMode: replaced the Set<scope> + per-call new Promise() approach with a Map<url, Promise> that shares the in-flight promise across concurrent callers, preventing the second StrictMode double-invocation from resolving against a script tag that had not yet executed.' },
    ],
  },
  {
    version: '0.10',
    date: '2026-07-21',
    label: 'Module K8s deploy + submodule extraction',
    changes: [
      { type: 'feat', text: 'Added Kubernetes manifests and deploy scripts for cloud-insight-ai and anomascan modules (scripts/k8s-push-modules.sh, k8s/modules/).' },
      { type: 'feat', text: 'Converted spin-docs, cloud-insight-ai, and AnomaScan to independent git submodules under modules/ — each has its own repo and CI.' },
      { type: 'fix',  text: 'Non-null assertion fixes in BotDetail closures for TanStack Query NoInfer type compatibility.' },
      { type: 'fix',  text: 'Re-pinned spin-docs submodule to source-only commit (no build artifacts in git history).' },
    ],
  },
  {
    version: '0.9',
    date: '2026-07-21',
    label: 'Zustand + TanStack Query state architecture',
    changes: [
      { type: 'refactor', text: 'Migrated all frontend server state to TanStack Query (bots, modules, users, logs, translations) — eliminates manual loading/error state boilerplate.' },
      { type: 'feat', text: 'Added audit fields (created_at, updated_at) to modules and bots tables.' },
      { type: 'feat', text: 'Added Module detail page and Bot detail page with full metadata panels.' },
      { type: 'feat', text: 'Added manifest config panel in Admin → Modules — shows raw configuration_raw JSON snapshot stored at registration.' },
    ],
  },
  {
    version: '0.8',
    date: '2026-07-20',
    label: 'Cloud-insight-ai module + backend diagrams',
    changes: [
      { type: 'feat', text: 'Added Cloud-insight-ai MF module — data source upload, processing, and management (port 3002 / 8002).' },
      { type: 'feat', text: 'Added full backend architecture diagram suite to spin-docs (16 Mermaid diagrams: system arch, startup sequence, DB schema, auth flow, chat/LLM flow, plugin proxy, background tasks, etc.).' },
      { type: 'chore', text: 'Upgraded spin-docs to React 19 and fixed federation chunk loading for cross-origin injection.' },
    ],
  },
  {
    version: '0.7',
    date: '2026-07-20',
    label: 'AppLogger + spin-docs MF module',
    changes: [
      { type: 'feat', text: 'Added AppLogger — structured ClickHouse-backed logger injected into all FastAPI routers.' },
      { type: 'feat', text: 'Introduced spin-docs as a Module Federation remote (system role) — architecture diagrams now embedded in the platform itself.' },
      { type: 'feat', text: 'Introduced system role — bots and modules restricted to system role are hidden from non-system users.' },
      { type: 'refactor', text: 'Removed dead pages, fixed admin toggle behaviour, expanded admin layouts.' },
    ],
  },
  {
    version: '0.6',
    date: '2026-07-18',
    label: 'Backend + frontend atomization',
    changes: [
      { type: 'refactor', text: 'Atomized backend/app/ — 33 modules into single-declaration packages with inline comments on every file.' },
      { type: 'refactor', text: 'Atomized frontend/src/services/ — split types and constants into atomic files following {name}.{suffix}.{ext} convention.' },
      { type: 'refactor', text: 'Flattened pages/admin subfolders to pages/ — simpler import paths.' },
      { type: 'refactor', text: 'Dropped ui_components table; replaced with static JS catalogue served from spin-docs.' },
    ],
  },
  {
    version: '0.5',
    date: '2026-07-17',
    label: 'Zustand stores + splash screen + modules tab',
    changes: [
      { type: 'feat', text: 'Added Zustand stores for theme and auth — theme applied before first paint, no flash of unstyled content.' },
      { type: 'feat', text: 'Auth-gated i18n and theme initialisation — translations loaded after login, not on app boot.' },
      { type: 'feat', text: 'Added modules tab view in Admin → Modules with grouped list + inline log drawer.' },
      { type: 'feat', text: 'Added splash screen shown before JavaScript loads (HTML + CSS, no React dependency).' },
    ],
  },
  {
    version: '0.4',
    date: '2026-07-17',
    label: 'Frontend component atomization + PWA fix',
    changes: [
      { type: 'refactor', text: 'Atomized all frontend components — barrel exports from each domain folder, import sites updated.' },
      { type: 'fix', text: 'Fixed missing PWA dependency (vite-plugin-pwa) causing production build failures.' },
      { type: 'docs', text: 'Updated frontend README with atomized folder paths and component inventory.' },
    ],
  },
];
