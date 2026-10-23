import fs from "node:fs";

const API = "https://api.openverse.org/v1/images/";
const LICENSES = "cc0,pdm,by";

const WORDS = {
  hello: ["waving hello", "person waving hello", "greeting wave hand", "two people greeting"],
  hi: ["child waving hand", "girl waving", "boy waving hand", "friends greeting"],
  goodbye: ["waving goodbye", "farewell wave", "leaving waving hand"],
  "thank-you": ["thank you gesture", "receiving gift hands", "giving gift hands"],
  sorry: ["apologizing gesture", "sorry hands", "apology person"],
  please: ["please gesture", "hands pleading", "requesting hands"],
};

const REQUIRED = {
  hello: /wav|greet|hello/i,
  hi: /wav|greet|hi\b|hello/i,
  goodbye: /(wav|farewell|goodbye|bye)/i,
  "thank-you": /(thank|gift|grateful|gratitude)/i,
  sorry: /(sorry|apolog|regret)/i,
  please: /(please|plead|beg|pray|request)/i,
};

async function search(word, query) {
  const url = new URL(API);
  url.search = new URLSearchParams({
    q: query,
    license: LICENSES,
    size: "large",
    mature: "false",
    page_size: "20",
  }).toString();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const res = await fetch(url, { headers: { "User-Agent": "EnglishQuest/0.1" } });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    return (data.results ?? []).filter(
      (item) =>
        item.url &&
        (item.width ?? 0) >= 700 &&
        (item.height ?? 0) >= 500 &&
        item.category !== "illustration" &&
        REQUIRED[word].test(item.title ?? ""),
    );
  }
  return [];
}

const out = {};
const ids = new Set();

for (const [word, queries] of Object.entries(WORDS)) {
  const hits = [];
  for (const query of queries) {
    try {
      const found = await search(word, query);
      for (const item of found) {
        if (ids.has(item.id)) continue;
        ids.add(item.id);
        hits.push({
          word,
          id: item.id,
          title: item.title ?? "",
          license: item.license,
          creator: item.creator ?? "",
          source: item.source ?? item.provider ?? "",
          page: item.foreign_landing_url ?? "",
          url: item.url,
          width: item.width,
          height: item.height,
        });
      }
    } catch (error) {
      hits.push({ word, error: `${query}: ${error}` });
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  out[word] = hits.filter((h) => !h.error).slice(0, 12);
  const errors = hits.filter((h) => h.error);
  if (errors.length) out[`errors:${word}`] = errors.map((e) => e.error);
}

fs.writeFileSync("C:/INGLES/.tmp/openverse.json", JSON.stringify(out, null, 2), "utf8");
for (const [word, hits] of Object.entries(out)) {
  if (!Array.isArray(hits)) continue;
  console.log(`\n=== ${word} (${hits.length}) ===`);
  hits.forEach((h, i) => console.log(`${i + 1}. [${h.license}] ${h.title} — ${h.width}x${h.height} (${h.source})`));
}
