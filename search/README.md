# Search — self-hosted Meilisearch

Fully open-source, no external account, no SaaS. Three pieces:
**(1) run a Meili server**, **(2) index the book into it**, **(3) point the frontend at it**.
Until step 3's env vars are set, the search icon shows a harmless placeholder.

## 1. Run Meilisearch

Locally (dev):

```bash
docker run -d --name meili -p 7700:7700 \
  -e MEILI_MASTER_KEY=CHANGE_ME_dev_master_key \
  -v "$(pwd)/meili_data:/meili_data" \
  getmeili/meilisearch:latest
```

For production, run the same container on a VPS/host behind HTTPS (a subdomain like
`search.yourdomain.com`). Meili handles Chinese segmentation out of the box.

Then mint a **search-only key** (safe to expose in the browser) from the admin key:

```bash
curl -s -X POST 'http://localhost:7700/keys' \
  -H "Authorization: Bearer CHANGE_ME_dev_master_key" \
  -H 'Content-Type: application/json' \
  --data '{"description":"search-only","actions":["search"],"indexes":["permissionless-finance"],"expiresAt":null}'
# -> copy the returned "key"
```

## 2. Index the book

```bash
cd web
MEILI_HOST=http://localhost:7700 \
MEILI_ADMIN_KEY=CHANGE_ME_dev_master_key \
npm run search:index
```

This reads `../chapters/{en,zh}/*.md`, builds one document per section (so results jump
to the right `#anchor`), and pushes them to Meili. Re-run after each content update
(or wire it into your deploy).

## 3. Point the frontend at it

`web/.env.local`:

```
NEXT_PUBLIC_MEILI_HOST=http://localhost:7700          # prod: https://search.yourdomain.com
NEXT_PUBLIC_MEILI_SEARCH_KEY=<the search-only key>
NEXT_PUBLIC_MEILI_INDEX=permissionless-finance
```

Rebuild → the search icon (and ⌘K) now runs real instant search, filtered to the
current UI language, with keyboard nav and match highlighting.

## Notes
- **Keys**: the browser only ever sees the *search-only* key. The admin/master key is
  used solely by the indexer and must stay server-side.
- **CORS**: Meili allows cross-origin search by default; access is gated by the API key.
- **Anchors**: the indexer mirrors the app's heading-id logic, so a hit for "20.2 …"
  navigates to `/zh/20#section-20-2`. If the app's id scheme changes, update
  `scripts/build-search-index.mjs`.
- **Relevance tuning**: adjust `searchableAttributes` / `rankingRules` in the indexer.
