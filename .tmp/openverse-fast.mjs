import fs from "node:fs";

const API = "https://api.openverse.org/v1/images/";

const WORDS = {
  hello: "waving hello",
  hi: "child waving hand",
  goodbye: "waving goodbye",
  "thank-you": "thank you hands",
  sorry: "apologizing",
  please: "hands pleading",
};

const REQUIRED = {
  hello: /wav|greet|hello/i,
  hi: /wav|greet|child|kids|girl|boy/i,
  goodbye: /(wav|farewell|goodbye|bye|leav)/i,
  "thank-you": /(thank|gift|grateful|gratitude|giving)/i,
  sorry: /(sorry|apolog|regret)/i,
  please: /(please|plead|beg|pray|request|asking)/i,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(query) {
  const url = new URL(API);
  url.search = new URLSearchParams({
    q: query,
    license: "cc0,pdm,by",
    size: "large",
    mature: "false",
    page_size: "20",
  }).toString();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(url, { headers: { "User-Agent": "EnglishQuest/0.1" } });
    if (res.status === 429) {
      await sleep(4000);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return (await res.json()).results ?? [];
  }
  throw new Error("rate limited");
}

const out = {};
for (const [word, query] of Object.entries(WORDS)) {
  try {
    const results = await search(query);
    out[word] = results
      .filter(
        (item) =>
          item.url &&
          (item.width ?? 0) >= 700 &&
          (item.height ?? 0) >= 500 &&
          item.category !== "illustration" &&
          REQUIRED[word].test(item.title ?? ""),
      )
      .map((item) => ({
        title: item.title ?? "",
        license: item.license,
        creator: item.creator ?? "",
        source: item.source ?? item.provider ?? "",
        page: item.foreign_landing_url ?? "",
        url: item.url,
        width: item.width,
        height: item.height,
      }))
      .slice(0, 10);
  } catch (error) {
    out[word] = [{ error: String(error) }];
  }
  console.log(`\n=== ${word} ===`);
  for (const [i, hit] of out[word].entries()) {
    if (hit.error) console.log("ERR", hit.error);
    else console.log(`${i + 1}. [${hit.license}] ${hit.title} — ${hit.width}x${hit.height} (${hit.source})`);
  }
  await sleep(2500);
}

fs.writeFileSync("C:/INGLES/.tmp/openverse.json", JSON.stringify(out, null, 2), "utf8");
