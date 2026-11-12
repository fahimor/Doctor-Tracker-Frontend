# Deployment guide

Production layout:

```
Browser ──HTTPS──▶ Vercel (Next.js frontend) ──rewrite /api/*──▶ Cloud Run (Express API) ──▶ MongoDB Atlas
```

Repositories: **[backend](https://github.com/fahimor/Doctor-Tracker-Backend)** (→ Cloud Run) and **[frontend](https://github.com/fahimor/Doctor-Tracker-Frontend)** (→ Vercel).

Deploy in this order: **1. MongoDB Atlas → 2. Cloud Run (backend) → 3. Vercel (frontend) → 4. tighten CORS.**

---

## 1. MongoDB Atlas

1. Create a free **M0** cluster at <https://cloud.mongodb.com> (choose a region close to your Cloud Run region, e.g. Mumbai `ap-south-1` or Singapore).
2. **Database Access** → add a database user with a strong password (role: *Read and write to any database*).
3. **Network Access** → add `0.0.0.0/0`.
   Cloud Run has no fixed outbound IP by default. For a locked-down setup, use a Serverless VPC connector + Cloud NAT with a static IP and allow only that IP.
4. **Connect → Drivers** → copy the connection string and add a database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/doctor-tracker?retryWrites=true&w=majority`

### Seed demo data (optional, from your machine)

From the **backend** repository:

```bash
cp .env.example .env        # put the Atlas URI and a JWT_SECRET in .env
npm install
npm run seed                # creates admin/viewer users, 48 doctors, 1,600 patients
```

The seed **wipes the doctors and patients collections**. It refuses to run when `NODE_ENV=production` unless you pass `--force`.

---

## 2. Backend → Google Cloud Run

Prerequisites: a Google Cloud project with billing enabled and the [gcloud CLI](https://cloud.google.com/sdk/docs/install).

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com
```

### 2a. Store secrets in Secret Manager

```bash
# MongoDB connection string
printf "%s" "mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/doctor-tracker" | \
  gcloud secrets create mongodb-uri --data-file=-

# JWT secret (48 random bytes)
node -e "process.stdout.write(require('crypto').randomBytes(48).toString('base64url'))" | \
  gcloud secrets create jwt-secret --data-file=-

# Let Cloud Run's runtime service account read them
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
for s in mongodb-uri jwt-secret; do
  gcloud secrets add-iam-policy-binding $s \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 2b. Deploy

From the root of the **backend** repository (Cloud Build builds the `Dockerfile` for you):

```bash
gcloud run deploy doctor-tracker-api \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 1 --memory 512Mi \
  --min-instances 0 --max-instances 5 \
  --concurrency 80 \
  --set-env-vars "NODE_ENV=production,TRUST_PROXY=2,CORS_ORIGINS=http://localhost:3000" \
  --set-secrets "MONGODB_URI=mongodb-uri:latest,JWT_SECRET=jwt-secret:latest"
```

The command prints the service URL, e.g. `https://doctor-tracker-api-abc123-el.a.run.app`.

Check it:

```bash
curl https://doctor-tracker-api-abc123-el.a.run.app/health
# {"status":"ok","db":"up"}
```

| Variable | Value on Cloud Run | Why |
| --- | --- | --- |
| `NODE_ENV` | `production` | Turns on `Secure` cookies and production logging. |
| `MONGODB_URI` | secret `mongodb-uri` | Atlas connection string. |
| `JWT_SECRET` | secret `jwt-secret` | Signs session tokens. |
| `TRUST_PROXY` | `2` | Requests pass Vercel then Google's front end, so 2 hops are trusted to find the real client IP (used by the login rate limiter). Use `1` if browsers call Cloud Run directly. |
| `CORS_ORIGINS` | your Vercel URL | Only needed for direct browser calls; the default proxied setup is same-origin. |
| `BOOTSTRAP_ADMIN_EMAIL` / `BOOTSTRAP_ADMIN_PASSWORD` | optional | Creates the first admin on startup if you did not run the seed. |

**Notes**

- `min-instances 0` = free when idle, with a cold start of about 1–2 s. Use `--min-instances 1` before a live demo to avoid it.
- The app listens on `$PORT` (8080), shuts down cleanly on `SIGTERM` (closes the HTTP server and the Mongo pool) and logs JSON with a `severity` field, so Cloud Logging shows the correct log levels.
- Use `/health`, not `/healthz`: Cloud Run reserves some paths that end in `z`.
- To redeploy after code changes, run the same `gcloud run deploy` command again.

---

## 3. Frontend → Vercel

1. On <https://vercel.com/new>, import **[Doctor-Tracker-Frontend](https://github.com/fahimor/Doctor-Tracker-Frontend)**.
2. Keep the default **Root Directory** (`./`, the repository root). The framework preset (Next.js) is detected automatically.
3. Leave the build settings at their defaults (`npm run build`).
4. **Environment Variables**:

| Name | Value |
| --- | --- |
| `API_PROXY_TARGET` | the Cloud Run URL, e.g. `https://doctor-tracker-api-abc123-el.a.run.app` (no trailing slash, no `/api`) |
| `JWT_SECRET` | *(recommended)* the **same** value as the backend secret, so `proxy.ts` can verify session signatures |
| `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS` | `true` to show the demo-login buttons (handy for reviewers), `false` to hide them |

5. Deploy. Redeploy whenever you change `API_PROXY_TARGET`, because rewrites are compiled at build time.

### Why there are no cookie or CORS problems

The browser only ever talks to `https://your-app.vercel.app`. Calls to `/api/*` are **rewritten by Vercel** to Cloud Run (see `next.config.ts` in the [frontend repo](https://github.com/fahimor/Doctor-Tracker-Frontend/blob/main/next.config.ts)), and the `Set-Cookie` response header passes back through. So the session cookie is a normal first-party, `httpOnly`, `Secure`, `SameSite=Lax` cookie on the Vercel domain:

- no third-party-cookie blocking (Safari and Chrome both block those),
- no CORS preflights,
- and `src/proxy.ts` on Vercel can read the cookie to protect pages before they render.

---

## 4. After both are live

- Update the backend's `CORS_ORIGINS` to your Vercel URL:
  ```bash
  gcloud run services update doctor-tracker-api --region asia-south1 \
    --update-env-vars "CORS_ORIGINS=https://your-app.vercel.app"
  ```
- Sign in with the demo accounts (if you seeded):
  - Admin: `admin@doctortracker.dev` / `Admin@12345`
  - Viewer (read-only): `viewer@doctortracker.dev` / `Viewer@12345`
- **Change these passwords** (or reseed with your own) before sharing the link widely.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Login works, but every page redirects back to `/login` | `API_PROXY_TARGET` is wrong, or you set `JWT_SECRET` on Vercel to a different value than the backend. |
| `/health` returns `503 {"db":"down"}` | Atlas Network Access does not allow Cloud Run, or `MONGODB_URI` is wrong. Check the logs: `gcloud run services logs read doctor-tracker-api --region asia-south1`. |
| Container fails to start with "Invalid environment configuration" | A required variable is missing; the log lists which one. `JWT_SECRET` must be at least 32 characters. |
| API returns 429 for everyone | `TRUST_PROXY` is too low, so all users share Vercel's IP. Use `2`. |
