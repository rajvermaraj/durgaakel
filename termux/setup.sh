#!/data/data/com.termux/files/usr/bin/bash
# एक बार चलाएँ:  bash termux/setup.sh
set -e
cd "$(dirname "$0")/.."
pkg update -y && pkg upgrade -y
pkg install -y nodejs-lts tmux cloudflared termux-api openssl
[ -f .env.local ] || cp .env.local.example .env.local
# random secret अपने-आप भरो
if ! grep -q '^ADMIN_SESSION_SECRET=.\+' .env.local; then
  sed -i "s|^ADMIN_SESSION_SECRET=.*|ADMIN_SESSION_SECRET=$(openssl rand -hex 24)|" .env.local
fi
if [ -d .next ]; then
  npm install --omit=dev          # PC पर बना .next मौजूद है -> सिर्फ़ runtime चाहिए
else
  npm install && npm run build    # फ़ोन पर build (धीमा, 5-15 मिनट)
fi
# फ़ोन चालू होते ही अपने-आप शुरू (Termux:Boot app चाहिए)
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/puja.sh <<EOF
#!/data/data/com.termux/files/usr/bin/bash
bash "$PWD/termux/start.sh"
EOF
chmod +x ~/.termux/boot/puja.sh termux/start.sh
echo; echo "✅ तैयार। अब:  nano .env.local  (ADMIN_PASSWORD भरें)  फिर  bash termux/start.sh"
