#!/data/data/com.termux/files/usr/bin/bash
# चालू करें:  bash termux/start.sh     बंद करें:  bash termux/stop.sh
cd "$(dirname "$0")/.."
termux-wake-lock                         # फ़ोन सोने पर भी CPU जागता रहे
tmux kill-session -t puja 2>/dev/null
# वेबसाइट: बंद हो जाए तो 3 सेकंड में अपने-आप दोबारा चालू
tmux new-session -d -s puja -n web \
  "while true; do npm start -- -H 0.0.0.0 -p 3000; echo 'restart...'; sleep 3; done"
# इंटरनेट पता (tunnel)
if [ -s termux/tunnel-token.txt ]; then
  # पक्का (fixed) पता — Cloudflare dashboard वाला token
  tmux new-window -t puja -n tunnel \
    "while true; do cloudflared tunnel --no-autoupdate run --token \$(cat termux/tunnel-token.txt); sleep 5; done"
  echo "✅ चालू — आपका पक्का पता Cloudflare में जो hostname रखा था वही है"
elif [ -s termux/ngrok-domain.txt ] && command -v ngrok >/dev/null; then
  # मुफ़्त पक्का पता (ngrok dev domain) — termux/ngrok-domain.txt में  xxxx.ngrok-free.dev  लिखा हो
  D=$(tr -d ' \r\n' < termux/ngrok-domain.txt)
  tmux new-window -t puja -n tunnel \
    "while true; do ngrok http --url=https://$D 3000; sleep 5; done"
  echo "✅ चालू — आपका पक्का पता:  https://$D"
else
  # मुफ़्त, बिना चेतावनी-स्क्रीन; पता बदले तो Telegram पर आ जाता है
  tmux new-window -t puja -n tunnel "bash termux/quick.sh"
  echo "⏳ 20 सेकंड रुकिए…"; sleep 20
  echo "🌐 पता:"; cat termux/current-url.txt 2>/dev/null || echo "(अभी नहीं बना — tmux attach -t puja से देखें)"
fi
echo "देखने के लिए: tmux attach -t puja   (बाहर निकलने के लिए Ctrl+B फिर D)"
