#!/data/data/com.termux/files/usr/bin/bash
# मुफ़्त Cloudflare Quick Tunnel — कोई चेतावनी-स्क्रीन नहीं।
# पता तभी बदलता है जब tunnel दोबारा शुरू हो; हर नया पता Telegram पर अपने-आप आ जाता है।
cd "$(dirname "$0")/.."
env_get() { grep -E "^$1=" .env.local 2>/dev/null | head -1 | cut -d= -f2- | tr -d '"\r '; }
TOKEN=$(env_get TELEGRAM_BOT_TOKEN); CHAT=$(env_get TELEGRAM_CHAT_ID)
while true; do
  : > termux/tunnel.log
  cloudflared tunnel --no-autoupdate --url http://localhost:3000 > termux/tunnel.log 2>&1 &
  CF=$!
  URL=""
  for i in $(seq 1 40); do
    URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' termux/tunnel.log | head -1)
    [ -n "$URL" ] && break; sleep 1
  done
  if [ -n "$URL" ]; then
    echo "$URL" > termux/current-url.txt
    echo "🌐 आज का पता: $URL"
    if [ -n "$TOKEN" ] && [ -n "$CHAT" ]; then
      curl -s "https://api.telegram.org/bot$TOKEN/sendMessage" \
        --data-urlencode "chat_id=$CHAT" \
        --data-urlencode "text=🪔 वेबसाइट का नया पता: $URL  (WhatsApp ग्रुप में फ़ॉरवर्ड करें)" >/dev/null
    fi
  fi
  wait $CF
  sleep 5
done
