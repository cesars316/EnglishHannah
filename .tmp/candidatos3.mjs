import fs from "node:fs";

const API = "https://commons.wikimedia.org/w/api.php";
const ALLOWED = /^(CC0|Public domain|PD|CC BY 4\.0|CC BY 3\.0|CC BY 2\.0|CC BY-SA 4\.0|CC BY-SA 3\.0|CC BY-SA 2\.0)$/i;

const PLAN = {
  sorry: [
    "broken cup floor",
    "broken plate floor",
    "sad child crying",
    "hands over face person",
    "boy apologizing",
    "sorry sign hand",
  ],
  please: [
    "open palm hand up",
    "outstretched hand asking",
    "child raising hand classroom",
    "hand asking money gesture",
    "cupped hands begging",
  ],
};

function clean(v) {
  return (v ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

async function api(params) {
  const url = new URL(API);
  url.search = new URLSearchParams({ action: "query", format: "json", ...params }).toString();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetch(url, {
      headers: { "User-Agent": "EnglishQuest/0.1 (local family learning app)" },
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
  throw new Error("429");
}

const data = JSON.parse(fs.readFileSync("C:/INGLES/.tmp/candidatos.json", "utf8"));

for (const [word, queries] of Object.entries(PLAN)) {
  const seen = new Map();
  for (const query of queries) {
    try {
      const json = await api({
        generator: "search",
        gsrnamespace: "6",
        gsrsearch: `filetype:bitmap ${query}`,
        gsrlimit: "14",
        prop: "imageinfo",
        iiprop: "url|size|extmetadata",
        iiurlwidth: "560",
      });
      for (const page of Object.values(json?.query?.pages ?? {})) {
        const info = page.imageinfo?.[0];
        if (!info) continue;
        const license = info.extmetadata?.LicenseShortName?.value ?? "";
        if (!ALLOWED.test(license)) continue;
        if (info.width < 500 || info.height < 400) continue;
        const title = page.title.replace(/^File:/, "");
        if (/\.(svg|tif|png)$/i.test(title)) continue;
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
          query,
        });
      }
    } catch (error) {
      console.log(`ERR ${word}/${query}: ${error}`);
    }
  }
  data[word] = [...seen.values()].slice(0, 14);
  console.log(`\n=== ${word} (${data[word].length}) ===`);
  data[word].forEach((h, i) => console.log(`${i + 1}. ${h.title} | ${h.license} | ${h.description.slice(0, 85)}`));
}

fs.writeFileSync("C:/INGLES/.tmp/candidatos.json", JSON.stringify(data, null, 2), "utf8");
