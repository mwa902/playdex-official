# Deploy the frontend to Vercel

## Before deploying

- Push this repository to GitHub, GitLab, or Bitbucket.
- Deploy the NestJS API separately and make sure its HTTPS URL is reachable from the internet. The frontend's `/api/*` requests are proxied to that API.
- Keep database credentials on the API host. Do not add `DATABASE_URL`, a Supabase password, or a Supabase service-role key to the frontend's Vercel project.

## Vercel setup

1. In Vercel, choose **Add New... → Project** and import this repository.
2. Set **Root Directory** to `frontend`. This is important: the Next.js app and its `package-lock.json` are in that directory.
3. Use the Next.js framework preset. The settings in `frontend/vercel.json` select `npm ci` for installation and `npm run build` for building. Leave the output directory at its default.
4. In **Project Settings → Environment Variables**, add:

   | Name | Value |
   | --- | --- |
   | `BACKEND_INTERNAL_URL` | The deployed API's base HTTPS URL, for example `https://api.example.com` |

   Do not add a trailing slash or an `/api` suffix. Select Production and also Preview if preview deployments should use the API. `next.config.ts` requires this variable while building a production deployment.

5. Click **Deploy**. After deployment, open the Vercel deployment URL and check the home page, sign-in page, and a page that loads API data.
6. To deploy later changes, push them to the connected Git repository. Vercel will build and deploy automatically.

## Local production-build check

From the `frontend` directory, set the API's actual public URL and build:

```bash
BACKEND_INTERNAL_URL=https://api.example.com npm ci
BACKEND_INTERNAL_URL=https://api.example.com npm run build
```

Replace the example URL with the deployed API URL. A successful build only checks compilation; confirm the API is reachable separately by opening the frontend and testing a data-backed page.

## Troubleshooting

- **`Set BACKEND_INTERNAL_URL for production deployments`**: add the variable in Vercel and redeploy.
- **Vercel cannot find the app or lockfile**: set **Root Directory** to `frontend` and redeploy.
- **API requests return 404 or 502**: check that `BACKEND_INTERNAL_URL` is the API origin, that the API is running, and that its `/api/...` routes are reachable over HTTPS.
- **Browser CORS errors**: leave `NEXT_PUBLIC_API_BASE_URL` unset in Vercel so browser requests use the same-origin `/api` proxy.