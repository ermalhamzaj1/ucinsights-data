// Fetches r/UlcerativeColitis discussions for every item and writes
// data/discussions.json. Run by the scheduled GitHub Action (and runnable
// locally — see README).
//
// Reddit walls its JSON API endpoints (.json / oauth.reddit.com) behind an
// anti-bot 403 for anonymous clients, and registering an API app requires
// account privileges we don't have. BUT the legacy server-rendered search
// page at old.reddit.com still returns full HTML (200) with everything we
// need — title, permalink, author, score and comment count — and needs no
// credentials. So we fetch that HTML and parse the search-result markup.
//
// Note: Reddit blocks datacenter IP ranges harder than residential ones. If a
// GitHub Actions run starts returning 403, run this script locally instead
// (`npm run fetch`) and commit the refreshed data/discussions.json.

const fs = require("fs");
const path = require("path");
const items = require("./items");

const LIMIT = 5; // posts per item
const OUT = path.join(__dirname, "..", "data", "discussions.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const normalize = (s) => s.toLowerCase().trim().replace(/\s+/g, " ");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Decode the handful of HTML entities old.reddit emits in titles/usernames.
function decode(s) {
  return (s || "")
    .replace(/&#32;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .trim();
}

// Pull each <div class="search-result-link ..."> block out of the page.
function parseSearch(html) {
  const blocks = html.split("search-result-link").slice(1);
  const posts = [];

  for (const block of blocks) {
    const title = block.match(
      /class="[^"]*search-title[^"]*"[^>]*>([^<]+)</
    );
    const href = block.match(
      /<a href="(https:\/\/old\.reddit\.com\/r\/[^"]+\/comments\/[^"]+)"[^>]*class="[^"]*search-title/
    );
    if (!title || !href) continue;

    const scoreM = block.match(/class="search-score">([\d,]+)\s*points?</);
    const commentsM = block.match(/search-comments[^>]*>\s*([\d,]+)\s*comments?</);
    const authorM = block.match(
      /<a href="https:\/\/old\.reddit\.com\/user\/[^"]+"[^>]*class="author[^"]*"[^>]*>([^<]+)</
    );

    const toNum = (m) => (m ? parseInt(m[1].replace(/,/g, ""), 10) : 0);

    posts.push({
      title: decode(title[1]),
      author: authorM ? decode(authorM[1]) : "unknown",
      score: toNum(scoreM),
      commentCount: toNum(commentsM),
      // Canonicalize to www.reddit.com so the apps open the normal site.
      url: href[1].replace("old.reddit.com", "www.reddit.com"),
      preview: "", // search HTML has no body text; cards handle empty preview
    });

    if (posts.length >= LIMIT) break;
  }
  return posts;
}

async function search(query) {
  const url =
    "https://old.reddit.com/r/UlcerativeColitis/search?" +
    new URLSearchParams({
      q: query,
      restrict_sr: "on",
      sort: "top",
      t: "all",
      include_over_18: "on",
    });

  let res;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });
  } catch (e) {
    console.error(`  search failed for "${query}": ${e.message || e}`);
    return [];
  }
  if (!res.ok) {
    console.error(`  search failed for "${query}": ${res.status}`);
    return [];
  }
  return parseSearch(await res.text());
}

async function main() {
  const out = { generatedAt: new Date().toISOString(), items: {} };
  let ok = 0;

  for (const item of items) {
    const posts = await search(item.query);
    if (posts.length) ok++;
    const keys = [item.query, ...(item.aliases || [])].map(normalize);
    for (const k of keys) out.items[k] = posts;
    console.log(`  ${item.query} -> ${posts.length} posts`);
    await sleep(1500); // be gentle; avoid tripping rate limits
  }

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
