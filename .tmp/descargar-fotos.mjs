import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = "C:/INGLES/public/images/vocabulary";
const RAW_DIR = "C:/INGLES/.tmp/originales";

const ITEMS = [
  {
    id: "hello",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Sudan_Envoy_-_Shaking_Hands.jpg/960px-Sudan_Envoy_-_Shaking_Hands.jpg",
  },
  {
    id: "hi",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Child_waving-Rwanda.jpg/960px-Child_waving-Rwanda.jpg",
  },
  {
    id: "goodbye",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Munich_-_ICE_train_Hauptbahnhof_Munich%2C_Germany_-_5553.jpg/960px-Munich_-_ICE_train_Hauptbahnhof_Munich%2C_Germany_-_5553.jpg",
  },
  {
    id: "thank-you",
    url: "https://upload.wikimedia.org/wikipedia/commons/6/61/A_student_receiving_gift_from_her_mentor.jpg",
  },
  {
    id: "sorry",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/01_Tristeza.jpg/960px-01_Tristeza.jpg",
  },
  {
    id: "please",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Albrecht_D%C3%BCrer_-_Praying_Hands%2C_1508_-_Google_Art_Project.jpg/960px-Albrecht_D%C3%BCrer_-_Praying_Hands%2C_1508_-_Google_Art_Project.jpg",
  },
];

await fs.mkdir(RAW_DIR, { recursive: true });

for (const item of ITEMS) {
  const rawPath = path.join(RAW_DIR, `${item.id}.jpg`);
  const output = path.join(OUT_DIR, `${item.id}.webp`);
  let buffer;
  try {
    buffer = await fs.readFile(rawPath);
  } catch {
    buffer = null;
  }

  if (!buffer) {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const res = await fetch(item.url, {
        headers: {
          "User-Agent": "EnglishQuest/0.1 (local family learning app; contact: local-user)",
          "Accept-Language": "en",
        },
      });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 8000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`${item.id}: ${res.status} ${res.statusText}`);
      buffer = Buffer.from(await res.arrayBuffer());
      break;
    }
    if (!buffer) throw new Error(`${item.id}: no se pudo descargar (429)`);
    await fs.writeFile(rawPath, buffer);
    await new Promise((r) => setTimeout(r, 3000));
  }

  const info = await sharp(buffer)
    .resize(640, 640, { fit: "cover", position: sharp.strategy.attention })
    .webp({ quality: 82 })
    .toFile(output);

  console.log(`${item.id}: ${buffer.length} bytes -> ${info.size} bytes (${info.width}x${info.height})`);
}
