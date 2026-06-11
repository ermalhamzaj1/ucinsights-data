// Fetches r/UlcerativeColitis discussions for every item and writes
// data/discussions.json. Run by the scheduled GitHub Action.
//
// Reddit now blocks bare HTTP clients (curl / fetch / URLSession / OkHttp) with
// an anti-bot filter — only a real browser engine passes. So we drive headless
// Chromium (Playwright), load a real reddit.com page, and run the search
// requests *from inside that page's context* so they carry the browser's
// fingerprint and session cookies. No Reddit app / API key required.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const items = require("./items");

const LIMIT = 5; // posts per item
const OUT = path.join(__dirname, "..", "data", "discussions.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const normalize = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchInPage(page, query) {
  const data = await page.evaluate(async ({ q, limit }) => {
    const url =
      "/r/UlcerativeColitis/search.json?" +
      new URLSearchParams({
        q,
        restrict_sr: "1",
        sort: "top",
        t: "all",
        limit: String(limit),
        raw_json: "1",
      });
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return { error: res.status };
      return await res.json();
    } catch (e) {
      return { error: String(e) };
    }
  }, { q: query, limit: LIMIT });

  if (data.error) {
    console.error(`  search failed for "${query}": ${data.error}`);
    return [];
  }
  const children = data?.data?.children || [];
  return children.map((c) => {
    const d = c.data;
    return {
      title: d.title,
      author: d.author,
      score: d.score,
      commentCount: d.num_comments,
      url: `https://www.reddit.com${d.permalink}`,
      preview: (d.selftext || "").slice(0, 200),
    };
  });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA, locale: "en-US" });
  const page = await context.newPage();

  // Load a real subreddit page first so subsequent fetches share its
  // origin, cookies and browser fingerprint.
  await page.goto("https://www.reddit.com/r/UlcerativeColitis/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await sleep(3000);

  const out = { generatedAt: new Date().toISOString(), items: {} };
  let ok = 0;

  for (const item of items) {
    const posts = await searchInPage(page, item.query);
    if (posts.length) ok++;
    const keys = [item.query, ...(item.aliases || [])].map(normalize);
    for (const k of keys) out.items[k] = posts;
    console.log(`  ${item.query} -> ${posts.length} posts`);
    await sleep(1200);
  }

  await browser.close();

  if (ok === 0) {
    throw new Error("All searches returned 0 posts — refusing to write empty data.");
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${OUT} — ${ok}/${items.length} items had results.`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
