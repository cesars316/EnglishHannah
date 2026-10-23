import fs from "node:fs";

const API = "https://commons.wikimedia.org/w/api.php";

const TITLES = [
  "File:Sudan Envoy - Shaking Hands.jpg",
  "File:Two Friends Shaking Hands.jpg",
  "File:Child waving-Rwanda.jpg",
  "File:Munich - ICE train Hauptbahnhof Munich, Germany - 5553.jpg",
  "File:A student receiving gift from her mentor.jpg",
  "File:01 Tristeza.jpg",
  "File:Crying-girl.jpg",
  "File:Albrecht Dürer - Praying Hands, 1508 - Google Art Project.jpg",
  "File:Two men shaking hands on meeting, outdoor scene. Watercolour Wellcome V0018784.jpg",
  "File:Goeschenen Vorstand 101216 IR2441.jpg",
];

const url = new URL(API);
url.search = new URLSearchParams({
  action: "query",
  format: "json",
  titles: TITLES.join("|"),
  prop: "imageinfo",
  iiprop: "url|size|mime|extmetadata",
  iiurlwidth: "800",
}).toString();

const res = await fetch(url, { headers: { "User-Agent": "EnglishQuest/0.1 (local family app)" } });
const data = await res.json();
const clean = (v) => (v ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

for (const page of Object.values(data.query.pages)) {
  const info = page.imageinfo?.[0];
  console.log("\n" + page.title);
  if (!info) {
    console.log("  (no existe)");
    continue;
  }
  console.log("  mime:", info.mime, `${info.width}x${info.height}`);
  console.log("  lic:", info.extmetadata?.LicenseShortName?.value);
  console.log("  autor:", clean(info.extmetadata?.Artist?.value).slice(0, 120));
  console.log("  desc:", clean(info.extmetadata?.ImageDescription?.value).slice(0, 160));
  console.log("  pagina:", info.descriptionurl);
  console.log("  thumb800:", info.thumburl);
}

fs.writeFileSync("C:/INGLES/.tmp/elegidas.json", JSON.stringify(data.query.pages, null, 2), "utf8");
