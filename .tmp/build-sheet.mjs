import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("C:/INGLES/.tmp/candidatos.json", "utf8"));

const GROUPS = [
  ["hello", "hello / hola"],
  ["hi", "hi / hola (informal)"],
  ["goodbye", "goodbye / adios"],
  ["thank-you", "thank you / gracias"],
  ["sorry", "sorry / lo siento"],
  ["please", "please / por favor"],
];

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const cards = GROUPS.map(([key, label]) => {
  const items = data[key] ?? [];
  const body = items
    .map(
      (item, index) => `
      <figure class="card">
        <div class="thumb"><img loading="lazy" src="${esc(item.thumb)}" alt=""></div>
        <figcaption>
          <strong>${key}-${index + 1}</strong>
          <span class="lic">${esc(item.license)}</span>
          <p>${esc(item.title)}</p>
          <p class="desc">${esc(item.description)}</p>
          <a href="${esc(item.pageUrl)}" target="_blank" rel="noreferrer">ficha original</a>
        </figcaption>
      </figure>`,
    )
    .join("");
  return `<section><h2>${esc(label)} <small>(${items.length})</small></h2><div class="grid">${body || "<p>Sin candidatas.</p>"}</div></section>`;
}).join("\n");

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Candidatas de fotos - English Quest</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.4 system-ui, sans-serif; margin: 24px; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  h2 { font-size: 16px; margin: 32px 0 8px; text-transform: uppercase; letter-spacing: .04em; }
  h2 small { font-weight: 400; opacity: .6; text-transform: none; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
  .card { margin: 0; border: 1px solid #8884; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
  .thumb { aspect-ratio: 4 / 3; background: #8881; display: flex; align-items: center; justify-content: center; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  figcaption { padding: 8px 10px 10px; display: grid; gap: 2px; }
  figcaption p { margin: 0; font-size: 12px; }
  .desc { opacity: .7; }
  .lic { font-size: 11px; opacity: .7; }
  strong { font-variant-numeric: tabular-nums; }
  a { font-size: 11px; }
</style>
</head>
<body>
<h1>Fotos candidatas (Wikimedia Commons)</h1>
<p>Elegi los numeros que te sirvan para cada palabra. Ejemplo: <code>hello-2, hi-4, goodbye-1, thank-you-7, sorry-?, please-?</code></p>
${cards}
</body>
</html>`;

fs.writeFileSync("C:/INGLES/.tmp/candidatas.html", html, "utf8");
console.log("ok");
