// Збирає artifact.html з index.src.html: вшиває фото салону як data URI.
// Зовнішні картинки в артефакті ріже CSP, тому вони мають лежати
// всередині файла — інакше сторінка приїде без жодного фото.
//
//   node build.mjs
//   ../build-standalone.sh artifact.html index.html "💇"
//
// Тут index.html — це САМЕ повна сторінка (з doctype і viewport), бо її
// віддає GitHub Pages за адресою /portfolio/my-day/. Артефактний файл
// без обгортки лежить окремо, в artifact.html. У сусідніх теках назви
// поки навпаки — там index.html артефактний, а повна сторінка зветься
// standalone.html.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, а не .pathname: шлях містить кирилицю («сайти»),
// і в URL вона приїжджає percent-encoded — fs такий шлях не відкриє.
const dir = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(dir, "index.src.html");
const out = path.join(dir, "artifact.html");

const IMAGES = {
  __IMG_HERO__:  "img/hero.jpg",  // дзеркало з лампами, дубова стільниця
  __IMG_HALL__:  "img/hall.jpg",  // зал зі стелажем косметики
  __IMG_COLOR__: "img/color.jpg", // шафа з фарбами, окисники, палітри
  __IMG_TOOLS__: "img/tools.jpg", // інструменти на килимку, зона очікування
};

let html = fs.readFileSync(src, "utf8");

for (const [token, rel] of Object.entries(IMAGES)) {
  const file = path.join(dir, rel);
  if (!fs.existsSync(file)) throw new Error(`немає файла ${rel}`);
  const b64 = fs.readFileSync(file).toString("base64");
  if (!html.includes(token)) throw new Error(`у шаблоні немає ${token}`);
  html = html.split(token).join(`data:image/jpeg;base64,${b64}`);
  console.log(`${rel.padEnd(16)} → ${token.padEnd(15)} ${(b64.length / 1024).toFixed(0)} KB base64`);
}

const left = html.match(/__IMG_[A-Z]+__/g);
if (left) throw new Error(`лишилися незамінені плейсхолдери: ${[...new Set(left)].join(", ")}`);

fs.writeFileSync(out, html, "utf8");
console.log(`\nготово: artifact.html — ${(fs.statSync(out).size / 1024).toFixed(0)} KB`);
