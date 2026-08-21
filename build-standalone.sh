#!/usr/bin/env bash
# Робить самостійний .html (з doctype, head і body) з артефактного файла,
# який публікується в Claude і тому не має обгортки.
#
#   ./build-standalone.sh pasmo-salon/index.html pasmo-salon/standalone.html "✂️"
#
# Перезапускай після кожної правки index.html — інакше копії розійдуться.
set -eu

src="${1:?вкажіть вхідний файл}"
out="${2:?вкажіть вихідний файл}"
icon="${3:-✂️}"

cut=$(grep -n '^</style>' "$src" | head -1 | cut -d: -f1)
[ -n "$cut" ] || { echo "не знайдено </style> у $src" >&2; exit 1; }

svg="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${icon}</text></svg>"
href="data:image/svg+xml,${svg// /%20}"

{
  printf '<!doctype html>\n<html lang="uk">\n<head>\n'
  printf '<meta charset="utf-8">\n'
  printf '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
  printf '<link rel="icon" href="%s">\n' "$href"
  sed -n "1,${cut}p" "$src"
  printf '</head>\n<body>\n'
  sed -n "$((cut + 1)),\$p" "$src"
  printf '</body>\n</html>\n'
} > "$out"

echo "готово: $out ($(wc -c < "$out") байт)"
