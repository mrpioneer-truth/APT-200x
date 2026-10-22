#!/bin/zsh
cd "${0:A:h}"
if ! command -v node >/dev/null 2>&1; then
  export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
fi
if ! command -v node >/dev/null 2>&1; then
  print 'Node.js 22 이상을 설치한 뒤 다시 실행해 주세요.'
  read -k 1
  exit 1
fi
(/bin/sleep 1; open 'http://127.0.0.1:8787') &
node server.mjs
