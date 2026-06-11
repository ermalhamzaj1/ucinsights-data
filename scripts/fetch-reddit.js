// Fetches r/UlcerativeColitis discussions for every item and writes
// data/discussions.json. Run by the scheduled GitHub Action.
//
// Uses Reddit's OAuth "application-only" flow (client_credentials). This is
// the only access method Reddit reliably allows from datacenter IPs — the
// unauthenticated .json endpoints return 403 from CI / server IPs.
//
// Required env: REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET
// Optional env: REDDIT_USER_AGENT (defaults to a descriptive UA)

const fs = require("fs");
const path = require("path");
const items = require("./items");

const CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const USER_AGENT =
  process.env.REDDIT_USER_AGENT ||
  "UCInsights/1.0 (data refresh; +https://ucinsights.org)";
const LIMIT = 5; // posts per item
const OUT = path.join(__dirname, "..", "data", "discussions.json");

const normalize = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Missing REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET environment variables."
    );
  }
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  if (!json.access_token) throw new Error("No access_token in response");
  return json.access_token;
}

async function searchOnce(token, query) {
  const url =
    "https://oauth.reddit.com/r/UlcerativeColitis/search?" +
    new URLSearchParams({
      q: query,
      restrict_sr: "1",
      sort: "top",
      t: "all",
      limit: String(LIMIT),
      raw_json: "1",
    });
  const res = await fetch(url, {
    headers: {
      Authorization: `bearer ${token}`,
      "User-Agent": USER_AGENT,
    },
  });
  if (!res.ok) {
    console.error(`  search failed for "${query}": ${res.status}`);
    return [];
  }
  const json = await res.json();
  const children = json?.data?.children || [];
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
  const token = await getToken();
  const out = { generatedAt: new Date().toISOString(), items: {} };
  let ok = 0;

  for (const item of items) {
    const posts = await searchOnce(token, item.query);
    if (posts.length) ok++;
    const keys = [item.query, ...(item.aliases || [])].map(normalize);
    for (const k of keys) out.items[k] = posts;
    console.log(`  ${item.query} -> ${posts.length} posts`);
    await sleep(1100); // stay well under Reddit's 100 req/min OAuth limit
  }

  // Don't overwrite good data with an all-empty result (e.g. transient auth issue)
  if (ok === 0) {
    throw new Error("All searches returned 0 posts — refusing to write empty data.");
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${OUT} — ${ok}/${items.length} items had results.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
