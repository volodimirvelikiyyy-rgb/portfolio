// Збирає index.html з index.src.html: вшиває картинки як data URI.
// Посилання Stitch (lh3.googleusercontent.com) тимчасові, та й CSP артефакта
// зовнішні картинки блокує — тому вони мають лежати всередині файла.
//
//   node build.mjs
//
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const src = path.join(dir, "index.src.html");
const out = path.join(dir, "index.html");

const IMAGES = {
  __IMG_HERO__:  "img/hero.jpg",
  __IMG_HANDS__: "img/hands.jpg",
  __IMG_CUT__:   "img/cut.jpg",
  __IMG_COLOR__: "img/color.jpg",
};

let html = fs.readFileSync(src, "utf8");

for (const [token, rel] of Object.entries(IMAGES)) {
  const file = path.join(dir, rel);
  if (!fs.existsSync(file)) throw new Error(`немає файла ${rel}`);
  const b64 = fs.readFileSync(file).toString("base64");
  if (!html.includes(token)) throw new Error(`у шаблоні немає ${token}`);
  html = html.split(token).join(`data:image/jpeg;base64,${b64}`);
  console.log(`${rel.padEnd(16)} → ${token.padEnd(14)} ${(b64.length / 1024).toFixed(0)} KB base64`);
}

const left = html.match(/__IMG_[A-Z]+__/g);
if (left) throw new Error(`лишилися незамінені плейсхолдери: ${[...new Set(left)].join(", ")}`);

fs.writeFileSync(out, html, "utf8");
console.log(`\nготово: index.html — ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
