// Complete list of API endpoint groups.
// Each group belongs to a sidebar category via the `category` field.
// Categories (in render order): 'Core' | 'Bots & Chat' | 'Modules' | 'LLM'
export const GROUPS = [
  // ── Core ──────────────────────────────────────────────────────────────────
  {
    id: 'health',
    category: 'Core',
    title: 'Health',
    note: 'No authentication required. The api field is always true when the endpoint responds.',
    endpoints: [
      { method: 'GET', path: '/api/health', auth: 'Public',
        description: 'Returns liveness of the API, PostgreSQL, and ClickHouse. Response: { api, postgres, clickhouse, translations }.' },
    ],
  },
  {
    id: 'auth',
    category: 'Core',
    title: 'Auth',
    endpoints: [
      { method: 'POST', path: '/api/auth/login', auth: 'Public',
        description: 'Returns JWT + user object. Body: { email, password }. Login event is appended to ClickHouse.' },
    ],
  },
  {
    id: 'dashboard',
    category: 'Core',
    title: 'Dashboard & User',
    endpoints: [
      { method: 'GET',   path: '/api/dashboard',  auth: 'Bearer', description: 'Returns dashboard page content from PostgreSQL.' },
      { method: 'PATCH', path: '/api/user/theme', auth: 'Bearer', description: "Update the current user's preferred theme. Body: { theme }." },
    ],
  },
  {
    id: 'pages',
    category: 'Core',
    title: 'Pages',
    note: 'Federation pages (route starts with "modules/") are resolved from the modules table, not page_registry — every registered module is automatically addressable.',
    endpoints: [
      { method: 'GET',   path: '/api/pages',       auth: 'Admin',  description: 'List all page_registry entries ordered by route.' },
      { method: 'GET',   path: '/api/pages/config', auth: 'Bearer', description: 'Return page config for a given ?route=. Federation routes (modules/{id}) synthesise a PageConfig from the modules table.' },
      { method: 'PATCH', path: '/api/pages/config', auth: 'Admin',  description: 'Update mutable page fields (title, roles, skeleton, enabled) for a native page. Body: partial PageConfigPatch.' },
    ],
  },
  {
    id: 'i18n',
    category: 'Core',
    title: 'Translations (i18n)',
    note: 'GET /api/i18n/{lang} is intentionally public so the frontend can load translations before the user logs in.',
    endpoints: [
      { method: 'GET', path: '/api/i18n/{lang}', auth: 'Public', description: 'Return full translation object for lang (e.g. en, ro).' },
      { method: 'PUT', path: '/api/i18n/{lang}', auth: 'Admin',  description: 'Replace translation object for lang.' },
    ],
  },
  {
    id: 'logs',
    category: 'Core',
    title: 'App Logs',
    note: 'All log endpoints accept from and to as ISO datetime query params. Default range: start of current month → now.',
    endpoints: [
      { method: 'GET',  path: '/api/logs',         auth: 'Admin', description: 'Raw app_logs rows. Params: limit, offset, event_type, user_email, from, to. Returns { items, total }.' },
      { method: 'GET',  path: '/api/logs/summary', auth: 'Admin', description: 'Hourly aggregates from app_logs. Params: from, to, event_type, path, limit, offset. Returns { items, total }.' },
      { method: 'POST', path: '/api/logs/purge',   auth: 'Admin', description: 'Force-OPTIMIZE all ClickHouse log tables to enforce TTL expiry immediately. Returns { purged, errors }.' },
    ],
  },
  {
    id: 'notifications',
    category: 'Core',
    title: 'Notifications',
    note: 'Authentication is via ?token=<jwt> query parameter (not Authorization header) because the WebSocket upgrade step happens before headers can be read.',
    endpoints: [
      { method: 'WS', path: '/api/notifications/ws?token={jwt}', auth: 'Bearer', description: 'Stream new notifications to the client. Polls ClickHouse every 5 s and pushes rows newer than the connection timestamp as a JSON array.' },
    ],
  },

  // ── Bots & Chat ───────────────────────────────────────────────────────────
  {
    id: 'bots',
    category: 'Bots & Chat',
    title: 'Bots',
    note: 'Bots are stored in PostgreSQL. A bot with no modules is always inactive regardless of the active field. Bots declared in a module manifest are not seeded automatically — use POST /api/settings/modules/{id}/reseed-bots.',
    endpoints: [
      { method: 'GET',    path: '/api/bots/types', auth: 'Bearer', description: 'List all bot type definitions from the bot_types table.' },
      { method: 'GET',    path: '/api/bots',       auth: 'Bearer', description: 'List bots. Admins see all; others see active bots matching their roles. Optional ?module_id={uuid} filter.' },
      { method: 'POST',   path: '/api/bots',       auth: 'Admin',  description: 'Create a bot.' },
      { method: 'GET',    path: '/api/bots/{id}',  auth: 'Bearer', description: 'Get one bot (active + role-checked for non-admins).' },
      { method: 'PUT',    path: '/api/bots/{id}',  auth: 'Admin',  description: 'Replace a bot.' },
      { method: 'DELETE', path: '/api/bots/{id}',  auth: 'Admin',  description: 'Delete a bot.' },
    ],
  },
  {
    id: 'chat',
    category: 'Bots & Chat',
    title: 'Chat',
    note: 'POST /api/chat streams NDJSON. Each line: { "message": { "role": "assistant", "content": "…" }, "done": false }. Final: { "done": true }. On error: { "error": "…" }.',
    endpoints: [
      { method: 'POST', path: '/api/chat',              auth: 'Bearer', description: 'Stream a chat response. Body: { messages, model?, bot_id?, module_id? }.' },
      { method: 'POST', path: '/api/chat/abort',        auth: 'Bearer', description: 'Log a user-initiated stream abort. Body: { bot_id }.' },
      { method: 'GET',  path: '/api/chat/logs',         auth: 'Admin',  description: 'Paginated chat history. Params: from, to, user_email, limit, offset. Returns { items, total }.' },
      { method: 'GET',  path: '/api/chat/logs/summary', auth: 'Admin',  description: 'Hourly aggregates from bot_logs. Params: from, to. Returns { items, total }.' },
    ],
  },
  {
    id: 'bot-logs',
    category: 'Bots & Chat',
    title: 'Bot Logs',
    note: 'Events are stored in the shared bot_logs ClickHouse table, keyed by bot name. Admin endpoints expose the full log; the /custom/ endpoints are open to any authenticated user and are intended for module backends to record custom interactions.',
    endpoints: [
      { method: 'GET',  path: '/api/bot-logs/{bot_id}',                auth: 'Admin',  description: 'Raw event log entries for a bot. Params: limit, offset, event_type, from, to. Returns { items, total }.' },
      { method: 'GET',  path: '/api/bot-logs/{bot_id}/summary',        auth: 'Admin',  description: 'Hourly aggregated event summaries for a bot. Params: from, to, event_type, limit, offset. Returns { items, total }.' },
      { method: 'GET',  path: '/api/bot-logs/custom/{bot_id}',         auth: 'Bearer', description: 'List custom log entries written by module backends for a bot. Params: limit, offset, event_type, from, to. Returns { items, total }.' },
      { method: 'POST', path: '/api/bot-logs/custom/{bot_id}',         auth: 'Bearer', description: 'Write a custom log entry for a bot. Body: { event_type, message?, name?, level?, details? }. Returns { ok: true } with 201.' },
    ],
  },

  // ── Modules ───────────────────────────────────────────────────────────────
  {
    id: 'settings',
    category: 'Modules',
    title: 'Module Registry',
    note: 'Modules are stored in PostgreSQL. settings.json holds only the theme key. Bots declared in a manifest are not auto-seeded on registration — call reseed-bots explicitly.',
    endpoints: [
      { method: 'PATCH',  path: '/api/settings/theme',                     auth: 'Admin', description: 'Update default theme.' },
      { method: 'GET',    path: '/api/settings/modules',                   auth: 'Admin', description: 'List registered modules from PostgreSQL.' },
      { method: 'POST',   path: '/api/settings/modules',                   auth: 'Admin', description: 'Create a module. Provisions ClickHouse log tables; fetches manifest to load i18n and set backend_url. Does not seed bots — use reseed-bots for that.' },
      { method: 'POST',   path: '/api/settings/modules/{id}/reset-i18n',   auth: 'Admin', description: 'Re-merge the i18n snapshot from module.presets.i18n into the translations table.' },
      { method: 'POST',   path: '/api/settings/modules/{id}/reseed-bots',  auth: 'Admin', description: 'Provision bots declared in the module manifest that are not yet in the DB. Body (optional): { bots: [...] } to forward a browser-fetched manifest and avoid Docker localhost issues. Returns { bots_seeded, message }.' },
      { method: 'PUT',    path: '/api/settings/modules/{id}',              auth: 'Admin', description: 'Update a module.' },
      { method: 'DELETE', path: '/api/settings/modules/{id}',              auth: 'Admin', description: 'Delete a module.' },
      { method: 'GET',    path: '/api/settings/modules/discover',          auth: 'Admin', description: 'Scan MODULE_REGISTRY_URLS for manifest.json. Returns discovered modules with already_registered flag. Seed modules are always included (source_url: "seed").' },
    ],
  },
  {
    id: 'module-logs',
    category: 'Modules',
    title: 'Module Logs',
    note: '{moduleId} accepts either a UUID primary key or a Webpack federation scope string (e.g. "anomaScan") — module backends can use their own scope without a DB lookup.',
    endpoints: [
      { method: 'POST', path: '/api/module-logs/{moduleId}',         auth: 'Bearer', description: 'Write a log entry. Body: { event_type, details }.' },
      { method: 'GET',  path: '/api/module-logs/{moduleId}',         auth: 'Bearer', description: 'Raw module log rows. Params: limit, offset, event_type, from, to. Returns { items, total }.' },
      { method: 'GET',  path: '/api/module-logs/{moduleId}/summary', auth: 'Admin',  description: 'Hourly aggregates for a module. Params: from, to, event_type, limit, offset. Returns { items, total }.' },
    ],
  },
  {
    id: 'module-data',
    category: 'Modules',
    title: 'Module Data',
    note: 'Namespaced document store in PostgreSQL (module_documents table), scoped by module_id + collection.',
    endpoints: [
      { method: 'GET',    path: '/api/module-data/{moduleId}/{collection}',         auth: 'Bearer', description: 'List documents. Params: limit, skip.' },
      { method: 'POST',   path: '/api/module-data/{moduleId}/{collection}',         auth: 'Bearer', description: 'Insert a document.' },
      { method: 'PUT',    path: '/api/module-data/{moduleId}/{collection}/{docId}', auth: 'Bearer', description: 'Update a document.' },
      { method: 'DELETE', path: '/api/module-data/{moduleId}/{collection}/{docId}', auth: 'Bearer', description: 'Delete a document.' },
    ],
  },
  {
    id: 'plugin',
    category: 'Modules',
    title: 'Plugin Proxy',
    note: 'The Authorization header is forwarded verbatim to the module backend. Module backends validate the same JWT_SECRET_KEY. Returns 404 if the module has no backend_url.',
    endpoints: [
      { method: '*', path: '/api/plugin/{scope}/{path}', auth: 'Bearer', description: 'Proxy any HTTP method to {backend_url}/{path} of the named module.' },
    ],
  },
  {
    id: 'plugin-bot-config',
    category: 'Modules',
    title: 'Plugin — Bot Config',
    note: 'Standard routes that module backends (e.g. anomascan-backend, cloud-insight-ai-backend) are expected to implement. All calls reach the module via the core proxy: /api/plugin/{scope}/… → {backend_url}/…. Config is stored per bot UUID in a flat JSON file (/app/data/bot_configs.json).',
    endpoints: [
      { method: 'GET',    path: '/api/plugin/{scope}/bots/{bot_uuid}/config',    auth: 'Bearer', description: 'Return stored config for a bot. Response: { config: Record<string,any>, teams: [] }. Returns empty config when none saved.' },
      { method: 'PUT',    path: '/api/plugin/{scope}/bots/{bot_uuid}/config',    auth: 'Bearer', description: 'Persist the full config for a bot (full replacement). Body: { config: Record<string,any> }. Response: { config }.' },
      { method: 'GET',    path: '/api/plugin/{scope}/bots/{bot_uuid}/entities',  auth: 'Bearer', description: 'List entities (watchlist items) associated with the bot. Required when config_schema declares principals: "watchlist".' },
      { method: 'POST',   path: '/api/plugin/{scope}/bots/{bot_uuid}/entities',  auth: 'Bearer', description: 'Add an entity to the bot watchlist. Body: EntityAddPayload. Response: BotEntity.' },
      { method: 'PATCH',  path: '/api/plugin/{scope}/entities/{entity_id}',      auth: 'Bearer', description: 'Patch a single entity (e.g. toggle active). Body: EntityPatchPayload. Response: BotEntity.' },
      { method: 'DELETE', path: '/api/plugin/{scope}/entities/{entity_id}',      auth: 'Bearer', description: 'Delete an entity. Response: 204.' },
      { method: 'GET',    path: '/api/plugin/{scope}/bots/{bot_uuid}/processes',  auth: 'Bearer', description: 'Return running process metrics for the bot. Used by the Processes section of BotConfigPage.' },
    ],
  },

  // ── LLM ───────────────────────────────────────────────────────────────────
  {
    id: 'model-status',
    category: 'LLM',
    title: 'Model Status & LLM',
    endpoints: [
      { method: 'GET',    path: '/api/model-status',              auth: 'Public', description: 'Check whether required Ollama models (OLLAMA_MODEL, OLLAMA_EMBED_MODEL) are pulled and ready.' },
      { method: 'GET',    path: '/api/model-status/installed',    auth: 'Public', description: 'List all models installed in Ollama (name, family, params, quantization, size).' },
      { method: 'GET',    path: '/api/model-status/stream',       auth: 'Public', description: 'SSE stream — pushes pull progress every second until all required models are ready.' },
      { method: 'POST',   path: '/api/model-status/pull',         auth: 'Admin',  description: 'Trigger background pull of an Ollama model. Body: { name: "llama3.2:3b" }. Returns immediately.' },
      { method: 'DELETE', path: '/api/model-status/{model_name}', auth: 'Admin',  description: 'Delete a model from Ollama.' },
    ],
  },
]
