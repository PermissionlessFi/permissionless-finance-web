# Deployment Guide

How to run and deploy the **Permissionless Finance** reader — a Next.js 16 / React 19 app that
serves the full bilingual book.

The repository is **self-contained**: the chapter Markdown (`content/`) and all figures
(`public/images/`) are real files committed to the repo, so a plain `git clone` is enough to build.

---

## Requirements

- **Node.js** >= 22.x (LTS recommended)
- **npm** >= 10.x

Everything else — chapters, figures, PDFs, EPUBs — is already in the repository.

---

## Environment variables

Copy the example file and fill in what you need:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `KIMI_API_KEY` | for AI | Moonshot (Kimi) API key |
| `KIMI_BASE_URL` | for AI | API endpoint (`https://<host>/v1`). Must match the endpoint your key is provisioned for — there is no default. |
| `KIMI_MODEL` | no | Model id. Defaults to `kimi-k3`. |
| `NEXT_PUBLIC_SITE_URL` | production | Canonical origin used for canonical URLs, sitemap, and OG tags. |
| `ALLOWED_ORIGINS` | production | Comma-separated origins allowed to call the AI routes. |
| `AI_DAILY_TOKEN_CAP` | no | Daily token ceiling across AI routes. Counted **per process**, so it is not a hard cap on serverless — set a spend limit in your provider console too. |
| `AI_ACCESS_TOKEN` | no | Optional shared secret; when set, AI requests must send a matching `x-ai-token` header. |
| `NEXT_PUBLIC_MEILI_*` | no | Meilisearch host/key/index for full-text search. |

**Without the AI variables the site still builds and reads perfectly** — only the AI panel errors.
Without Meilisearch, search degrades gracefully and everything else works.

Never commit `.env.local`; it is gitignored.

---

## Local development

```bash
npm install
npm run build
npm start          # http://localhost:3000
```

> **Note:** `npm run dev` currently fails in this project. Next 16's dev server defaults to
> Turbopack, while `next.config.ts` still carries a webpack configuration, and the two conflict.
> Use the production build (`npm run build && npm start`) for local preview — there is no hot
> reload, so rebuild after each change.

---

## Deploying to Vercel (recommended)

This is how [permissionless.fi](https://permissionless.fi) runs. The repository root **is** the
Next.js app, so no root-directory override is needed.

1. Import the Git repository in the Vercel dashboard (framework auto-detects as Next.js), **or**
   deploy from the CLI:
   ```bash
   npm i -g vercel
   vercel            # first run links/creates the project
   vercel --prod
   ```
2. Add the environment variables above under **Settings → Environment Variables → Production**.
   Mark keys as *Secret*.
3. Deploy. Environment changes only take effect on the **next** deployment — redeploy after editing
   them.
4. Add your domain under **Settings → Domains** and follow the DNS instructions.

**If CLI deploys are rejected** with a message about the commit author not having access to the
team, the Git author on your commits must belong to the Vercel team that owns the project. Either
add that address to the team, or set the repo-local identity to a team member:

```bash
git config user.email "you@example.com"
```

---

## Self-hosting (VPS + Nginx)

Example on Ubuntu 22.04+.

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Clone and build

```bash
git clone <repository-url> book && cd book
cp .env.example .env.local     # then edit in your keys
npm ci
npm run build
```

### 3. Run under PM2

```bash
sudo npm install -g pm2
pm2 start npm --name "book" -- start
pm2 save
pm2 startup                    # start on boot
```

### 4. Nginx reverse proxy

Create `/etc/nginx/sites-available/book`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable it:

```bash
sudo ln -sf /etc/nginx/sites-available/book /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
```

### 5. TLS with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Certbot configures HTTPS and renews the certificate automatically.

---

## Operations

**Port** — 3000 by default:

```bash
PORT=8080 npm start
```

**Logs and monitoring** (PM2):

```bash
pm2 status
pm2 logs book
pm2 logs book --lines 100
pm2 monit
```

Next.js writes to stdout/stderr; PM2 stores those under `~/.pm2/logs/`. Nginx logs live in
`/var/log/nginx/`.

**Updating content** — edit the Markdown under `content/`, then:

```bash
npm run build
pm2 restart book        # self-hosted; on Vercel, just push or redeploy
```

---

## Maintenance scripts

| Script | When to run |
|---|---|
| `npm run search:index` | Rebuild the Meilisearch index after content changes. Needs `MEILI_HOST` and `MEILI_ADMIN_KEY`. |
| `node scripts/gen-content-dates.mjs` | Regenerate `content-dates.json` (sitemap `lastmod`) after content changes. |
| `node scripts/gen-image-dims.mjs` | Regenerate `image-dims.json` (image width/height, prevents layout shift) after adding figures. |
| `bash scripts/sync-content.sh` | Re-sync `content/` and `public/images/` from an external manuscript source (maintainers only). |

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `npm run dev` fails with a Turbopack/webpack config error | Expected — use `npm run build && npm start`. |
| Build fails with missing modules | `npm ci` |
| AI panel returns an error | Check `KIMI_API_KEY` and `KIMI_BASE_URL`; the base URL must match the endpoint your key belongs to. |
| AI works locally but not in production | Environment variables apply from the *next* deployment — redeploy. |
| Search box does nothing | Meilisearch isn't configured; this is a graceful degradation, not a failure. |
| Port 3000 already in use | `PORT=3001 npm start`, or stop the process holding the port. |

---

## Project structure

```
.
├── content/
│   ├── en/            # English chapters (01.md … 33.md + front matter)
│   └── zh/            # Chinese chapters
├── public/
│   ├── images/        # Figures (PNG)
│   └── downloads/     # PDF and EPUB editions
├── src/
│   ├── app/           # Routes (App Router), API routes, sitemap, robots
│   ├── components/    # React components, including the Labs simulators
│   └── lib/           # Content loading, theme, SEO, simulation engines
├── scripts/           # Index/date/dimension generators
├── search/            # Meilisearch notes
├── .env.example       # Environment variable template
└── DEPLOY.md          # This document
```
