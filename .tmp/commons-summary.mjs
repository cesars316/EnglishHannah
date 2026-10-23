import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("C:/INGLES/.tmp/commons.json", "utf8"));
for (const [word, hits] of Object.entries(data)) {
  if (!Array.isArray(hits)) {
    console.log("ERR", word, hits);
    continue;
  }
  console.log(`\n=== ${word} (${hits.length}) ===`);
  for (const h of hits.slice(0, 14)) {
    console.log(`- ${h.title} [${h.license}] ${h.width}x${h.height}`);
    console.log(`  desc: ${h.description || "(sin descripcion)"}`);
    console.log(`  cats: ${h.categories.join(", ")}`);
  }
}
