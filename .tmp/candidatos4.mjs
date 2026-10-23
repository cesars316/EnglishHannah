import fs from "node:fs";

const API = "https://commons.wikimedia.org/w/api.php";
const ALLOWED = /^(CC0|Public domain|PD|CC BY 4\.0|CC BY 3\.0|CC BY 2\.0|CC BY-SA 4\.0|CC BY-SA 3\.0|CC BY-SA 2\.0)$/i;

const QUERIES = ["sad child face", "crying child", "praying hands", "cupped hands", "child raising hand class", "hands together request"];

function clean(v) {
  return (v ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
}

async function api(params) {
  const url = new URL(API);
  url.search = new URLSearchParams({ action: "query", format: "json", ...params }).toString();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const res = await fetch(url, { headers: { "User-Agent": "EnglishQuest/0.1 (local family app)" } });
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    await new Promise((r) => setTimeout(r, 1200));
    return data;
  }
  throw new Error("429");
}

const rows = [];
for (const query of QUERIES) {
  try {
    const json = await api({
      generator: "search",
      gsrnamespace: "6",
      gsrsearch: `filetype:bitmap ${query}`,
      gsrlimit: "10",
      prop: "imageinfo",
      iiprop: "url|size|mime|extmetadata",
      iiurlwidth: "560",
    });
    for (const page of Object.values(json?.query?.pages ?? {})) {
      const info = page.imageinfo?.[0];
      if (!info) continue;
      const license = info.extmetadata?.LicenseShortName?.value ?? "";
      if (!ALLOWED.test(license)) continue;
      if (info.width < 500 || info.height < 400) continue;
      rows.push({
        query,
        title: page.title.replace(/^File:/, ""),
        mime: info.mime,
        license,
        desc: clean(info.extmetadata?.ImageDescription?.value),
        thumb: info.thumburl,
        page: info.descriptionurl,
        artist: clean(info.extmetadata?.Artist?.value),
        w: info.width,
        h: info.height,
      });
    }
  } catch (error) {
    console.log(`ERR ${query}: ${error}`);
  }
}

for (const query of QUERIES) {
  console.log(`\n=== ${query} ===`);
  rows
    .filter((r) => r.query === query)
    .slice(0, 8)
    .forEach((r, i) => console.log(`${i + 1}. ${r.title} | ${r.mime} | ${r.desc.slice(0, 70)}`));
}

fs.writeFileSync("C:/INGLES/.tmp/extra.json", JSON.stringify(rows, null, 2), "utf8");
