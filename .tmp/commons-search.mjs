// Busca candidatos en Wikimedia Commons (biblioteca publica de medios libres).
// Salida: JSON con titulo, licencia, autor, descripcion, categorias y URL del thumb.
const API = "https://commons.wikimedia.org/w/api.php";

const ALLOWED = /^(CC0|Public domain|PD|CC BY 4\.0|CC BY 3\.0|CC BY 2\.0|CC BY-SA 4\.0|CC BY-SA 3\.0|CC BY-SA 2\.0)$/i;

const QUERIES = {
  hello: ["waving hand greeting", "two people greeting", "handshake greeting", "person waving hello"],
  hi: ["child waving hand", "friends waving", "person waving"],
  goodbye: ["waving goodbye", "farewell waving", "walking away waving"],
  "thank-you": ["thank you note", "giving gift hands", "thank you card hands"],
  sorry: ["apology", "sorry sign", "hands apology gesture"],
  please: ["pleading hands", "begging hands", "please sign hands"],
};

function stripHtml(value) {
  return (value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 220);
}

async function search(query, limit = 18) {
  const uri = new URL(API);
  uri.search = new URLSearchParams({
    action: "query",
    format: "json",
    generator: "search",
    gsrnamespace: "6",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrlimit: String(limit),
    prop: "imageinfo|categories",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "640",
    cllimit: "20",
  }).toString();

  const res = await fetch(uri, { headers: { "User-Agent": "EnglishQuest/0.1 (local family app)" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages ?? {});
  return pages
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        title: page.title.replace(/^File:/, ""),
        license: meta.LicenseShortName?.value ?? "",
        artist: stripHtml(meta.Artist?.value),
        description: stripHtml(meta.ImageDescription?.value),
        width: info.width,
        height: info.height,
        page: info.descriptionurl,
        thumb: info.thumburl,
        categories: (page.categories ?? []).map((c) => c.title.replace(/^Category:/, "")).slice(0, 6),
      };
    })
    .filter(Boolean);
}

const out = {};
for (const [word, queries] of Object.entries(QUERIES)) {
  const seen = new Map();
  for (const q of queries) {
    try {
      for (const hit of await search(q)) {
        if (!ALLOWED.test(hit.license)) continue;
        if (hit.width < 400 || hit.height < 300) continue;
        if (seen.has(hit.title)) continue;
        seen.set(hit.title, { ...hit, query: q });
      }
    } catch (error) {
      out[`error:${word}:${q}`] = String(error);
    }
  }
  out[word] = [...seen.values()];
}

const { writeFileSync } = await import("node:fs");
writeFileSync("C:/INGLES/.tmp/commons.json", JSON.stringify(out, null, 2), "utf8");
console.log("ok", Object.fromEntries(Object.entries(out).map(([k, v]) => [k, Array.isArray(v) ? v.length : v])));
