const API = "https://commons.wikimedia.org/w/api.php";

const cats = [
  "Category:Waving hands",
  "Category:People waving",
  "Category:Waving",
  "Category:Greeting gestures",
  "Category:Handshakes",
  "Category:Thank you cards",
  "Category:Apologizing",
  "Category:Begging",
  "Category:Human gestures",
];

for (const cat of cats) {
  const url = new URL(API);
  url.search = new URLSearchParams({
    action: "query",
    format: "json",
    list: "categorymembers",
    cmtitle: cat,
    cmtype: "file",
    cmlimit: "12",
  }).toString();
  try {
    const res = await fetch(url, { headers: { "User-Agent": "EnglishQuest/0.1" } });
    const data = await res.json();
    const members = data?.query?.categorymembers ?? [];
    console.log(`\n${cat} -> ${members.length}`);
    for (const m of members) console.log("   " + m.title.replace(/^File:/, ""));
  } catch (error) {
    console.log(`\n${cat} -> ERR ${error}`);
  }
}
