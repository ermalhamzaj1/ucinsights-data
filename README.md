# UCInsights — discussions data

Pre-fetched r/UlcerativeColitis discussions for the UCInsights iOS & Android
apps. A scheduled GitHub Action refreshes `data/discussions.json` daily; the
apps download that file directly (Reddit blocks unauthenticated requests from
mobile devices, so the apps never call Reddit themselves).

## How it works

1. `.github/workflows/refresh-discussions.yml` runs daily (and on demand).
2. `scripts/fetch-reddit.js` authenticates to Reddit with OAuth (app-only) and
   searches r/UlcerativeColitis for every item in `scripts/items.js`.
3. The result is written to `data/discussions.json` and committed.
4. The apps fetch:
   `https://raw.githubusercontent.com/<owner>/ucinsights-data/main/data/discussions.json`

## One-time setup

1. Create a Reddit app at https://www.reddit.com/prefs/apps (type: **script**).
2. In this repo: **Settings → Secrets and variables → Actions** add:
   - `REDDIT_CLIENT_ID`
   - `REDDIT_CLIENT_SECRET`
3. Run the workflow once from the **Actions** tab (Run workflow) to populate data.

## Adding items

Edit `scripts/items.js`. `query` is the Reddit search phrase; `aliases` are the
exact strings the apps pass when looking the item up. Both apps normalize keys
to lowercase, so casing doesn't matter.
