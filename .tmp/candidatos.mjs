import fs from "node:fs";

const API = "https://commons.wikimedia.org/w/api.php";

// Consultas por palabra: se combinan busqueda libre y categorias curadas.
const PLAN = {
  hello: [
    ["search", "two people greeting handshake"],
    ["search", "man and woman shaking hands"],
    ["cat", "Category:Handshakes"],
  ],
  hi: [
    ["search", "child waving hand"],
    ["search", "girl waving hello"],
    ["search", "boy waving"],
  ],
  goodbye: [
    ["search", "waving goodbye train station"],
    ["search", "farewell waving hand"],
    ["search", "waving goodbye"],
  ],
  "thank-you": [
    ["search", "giving a present hands"],
    ["search", "handing over gift"],
    ["cat", "Category:Gifts"],
  ],
  sorry: [
    ["search", "broken cup on floor"],
    ["search", "hands apologizing gesture"],
    ["search", "child apologizing"],
  ],
  please: [
    ["search", "praying hands"],
    ["search", "hands together asking"],
    ["cat", "Category:Praying hands"],
  ],
};

const ALLOWED = /^(CC0|Public domain|PD|CC BY 4\.0|CC BY 3\.0|CC BY 2\.0|CC BY-SA 4\.0|CC BY-SA 3\.0|CC BY-SA 2\.0)$/i;

function clean(value) {
  return (value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

async function api(params) {
  const url = new URL(API);
  url.search = new URLSearchParams({ action: "query", format: "json", ...params }).toString();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EnglishQuest/0.1 (local family learning app; contact: local-user)",
        "Accept-Language": "en",
      },
    });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 6000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    await new Promise((r) => setTimeout(r, 1500));
    return data;
  }
  throw new Error("429 rate limited");
}

async function run(kind, value) {
  if (kind === "cat") {
    const data = await api({
      list: "categorymembers",
      cmtitle: value,
      cmtype: "file",
      cmlimit: "20",
    });
    const titles = (data?.query?.categorymembers ?? []).map((m) => m.title);
    if (!titles.length) return [];
    const info = await api({
      titles: titles.join("|"),
      prop: "imageinfo",
      iiprop: "url|size|extmetadata",
      iiurlwidth: "560",
    });
    return Object.values(info?.query?.pages ?? {}).map((p) => ({ page: p, info: p.imageinfo?.[0] }));
  }
  const data = await api({
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `filetype:bitmap ${value}`,
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "560",
  });
  return Object.values(data?.query?.pages ?? {}).map((p) => ({ page: p, info: p.imageinfo?.[0] }));
}

const out = {};
for (const [word, steps] of Object.entries(PLAN)) {
  const seen = new Map();
  for (const [kind, value] of steps) {
    try {
      for (const { page, info } of await run(kind, value)) {
        if (!info) continue;
        const license = info.extmetadata?.LicenseShortName?.value ?? "";
        if (!ALLOWED.test(license)) continue;
        if (info.width < 500 || info.height < 400) continue;
        if (page.title.toLowerCase().endsWith(".svg") || page.title.toLowerCase().endsWith(".tif")) continue;
        const title = page.title.replace(/^File:/, "");
        if (seen.has(title)) continue;
        seen.set(title, {
          title,
          license,
          artist: clean(info.extmetadata?.Artist?.value),
          description: clean(info.extmetadata?.ImageDescription?.value),
          width: info.width,
          height: info.height,
          thumb: info.thumburl,
          pageUrl: info.descriptionurl,
          query: value,
        });
      }
    } catch (error) {
      console.log(`ERR ${word} / ${value}: ${error}`);
    }
  }
  out[word] = [...seen.values()].slice(0, 10);
  console.log(`\n=== ${word} (${out[word].length}) ===`);
  out[word].forEach((h, i) => console.log(`${i + 1}. ${h.title} | ${h.license} | ${h.description.slice(0, 90)}`));
}

fs.writeFileSync("C:/INGLES/.tmp/candidatos.json", JSON.stringify(out, null, 2), "utf8");
