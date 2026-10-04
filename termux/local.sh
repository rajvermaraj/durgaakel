#!/data/data/com.termux/files/usr/bin/bash
# बिना इंटरनेट: सब लोग एक ही WiFi/हॉटस्पॉट से जुड़कर साइट खोलें.   चलाएँ: bash termux/local.sh
cd "$(dirname "$0")/.."
pkg list-installed 2>/dev/null | grep -q '^qrencode' || pkg install -y qrencode >/dev/null
termux-wake-lock
# घर/पंडाल के WiFi पर इंटरनेट-रहित चलाना हो तो cookie के लिए यह ज़रूरी है (http है, https नहीं)
grep -q '^ALLOW_INSECURE_COOKIE=1' .env.local 2>/dev/null || { sed -i 's|^ALLOW_INSECURE_COOKIE=.*|ALLOW_INSECURE_COOKIE=1|' .env.local; grep -q '^ALLOW_INSECURE_COOKIE=1' .env.local || echo 'ALLOW_INSECURE_COOKIE=1' >> .env.local; }
tmux kill-session -t puja 2>/dev/null
tmux new-session -d -s puja -n web "while true; do npm start -- -H 0.0.0.0 -p 3000; sleep 3; done"
sleep 6
IPS=$( (ip -4 -o addr 2>/dev/null; ifconfig 2>/dev/null) | grep -oE '(192\.168|10\.|172\.(1[6-9]|2[0-9]|3[01]))[0-9.]*' | grep -v -E '\.(255|0)$' | sort -u)
W=$(termux-wifi-connectioninfo 2>/dev/null | grep -oE '"ip": *"[0-9.]+"' | grep -oE '[0-9.]+')
echo; echo "📱 गाँव वाले WiFi/हॉटस्पॉट से जुड़कर इनमें से जो चले वह खोलें:"
for i in $W $IPS; do echo "   http://$i:3000"; done | sort -u
echo "   (हॉटस्पॉट चालू हो तो अक्सर  http://192.168.43.1:3000  )"
F=$(echo $IPS $W | tr ' ' '\n' | grep -E '^192\.168\.43\.1$' | head -1); F=${F:-$(echo $W $IPS | awk '{print $1}')}
[ -n "$F" ] && { echo; echo "QR (इसे प्रिंट करके पंडाल में लगा दें):"; qrencode -t ANSIUTF8 "http://$F:3000"; }
