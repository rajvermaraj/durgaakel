# 🚀 Oracle Cloud (Always Free) पर वेबसाइट चलाने की गाइड

100 से कम लोगों के लिए एक छोटा सर्वर काफ़ी है। नीचे के सारे कमांड सर्वर में (SSH से) चलाने हैं।

## ⚠️ पहले ये दो बातें जान लें
1. **Oracle idle सर्वर बंद/हटा सकता है।** उनके नियम के मुताबिक अगर 7 दिन तक CPU (95th percentile), network और (A1 पर) memory तीनों 20% से कम रहें तो Always Free सर्वर reclaim हो सकता है। आपकी साइट पर कम लोग आएँगे, इसलिए यह ख़तरा असली है। लोगों के अनुभव में **"Pay As You Go" में upgrade** करने से यह लागू नहीं होता (card लगता है, पर Always Free की सीमा में बिल ₹0 रहता है) — upgrade से पहले Oracle की मौजूदा शर्तें ख़ुद पढ़ लें।
2. इसलिए **Telegram बैकअप ज़रूर चालू रखें** (नीचे चरण 6)। सर्वर चला भी जाए तो data आपके Telegram में सुरक्षित रहेगा।

अगर Oracle में "Out of capacity" आए तो दूसरा region/availability domain आज़माएँ, या कोई भी सस्ता VPS (₹300-500/महीना) लें — बाकी सारे चरण वही रहेंगे (Ubuntu 22.04)।

## 1. सर्वर बनाएँ
- Oracle Cloud → Compute → Create instance → Image: **Ubuntu 22.04**, Shape: **Ampere A1 (2 OCPU, 12 GB)** (नहीं मिले तो AMD Micro 1 GB)।
- SSH key डाउनलोड करके सँभालकर रखें। फिर: `ssh -i key.pem ubuntu@सर्वर-का-IP`

## 2. पोर्ट 80 और 443 खोलें (दो जगह!)
**(क)** Oracle कंसोल → Instance → Subnet → Security List → Ingress Rules जोड़ें: Source `0.0.0.0/0`, TCP, Port `80` और फिर `443`।
**(ख)** सर्वर के अंदर (Oracle की Ubuntu इमेज में firewall अलग से बंद होता है):
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo apt update && sudo apt install -y iptables-persistent && sudo netfilter-persistent save
```

## 3. Node.js और pm2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs unzip
sudo npm i -g pm2
```
अगर सर्वर 1 GB वाला है तो build के लिए swap बना लें:
`sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

## 4. प्रोजेक्ट डालें और चलाएँ
अपने कंप्यूटर से zip भेजें: `scp -i key.pem akelwa-durga-puja-v11.zip ubuntu@IP:~/`
```bash
unzip akelwa-durga-puja-v11.zip && cd durga
cp .env.local.example .env.local
nano .env.local          # नीचे चरण 5-6 के हिसाब से भरें
npm install
npm run build
pm2 start npm --name puja -- start
pm2 save && pm2 startup  # जो कमांड यह दिखाए उसे कॉपी करके चला दें
```

## 5. मुफ़्त नाम + HTTPS (DuckDNS + Caddy)
1. https://www.duckdns.org पर login करके कोई नाम लें (जैसे `akelwadurga` → `akelwadurga.duckdns.org`) और current IP में अपने सर्वर का public IP डालें।
2. Caddy लगाएँ:
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
echo 'akelwadurga.duckdns.org {
    reverse_proxy localhost:3000
}' | sudo tee /etc/caddy/Caddyfile
sudo systemctl restart caddy
```
3. `.env.local` में `SITE_URL=https://akelwadurga.duckdns.org` डालें (WhatsApp पर फ़ोटो/नाम इसी से दिखेंगे) और `pm2 restart puja`।

(HTTPS नहीं चाहिए तो `.env.local` में `ALLOW_INSECURE_COOKIE=1` रखें, वरना admin login नहीं चलेगा।)

## 6. Telegram बैकअप + नए दान की सूचना
1. Telegram में **@BotFather** खोलें → `/newbot` → नाम दें → जो **token** मिले वह `TELEGRAM_BOT_TOKEN=` में डालें।
2. अपने नए bot को खोलकर **Start** दबाएँ और कोई भी संदेश भेजें।
3. ब्राउज़र में खोलें: `https://api.telegram.org/bot<TOKEN>/getUpdates` → उसमें `"chat":{"id":123456789` वाला नंबर `TELEGRAM_CHAT_ID=` में डालें। (कोषाध्यक्ष और अध्यक्ष चाहें तो एक Telegram group बनाकर bot को जोड़ें; group का chat id `-` से शुरू होता है।)
4. `pm2 restart puja`। अब: **हर नए दान पर आपको Telegram संदेश आएगा** और **रोज़ एक बार `db.json` बैकअप फ़ाइल** अपने-आप आएगी। एडमिन → सेटिंग → "📤 Telegram पर बैकअप भेजें" से अभी भी भेज सकते हैं।
5. **बैकअप से वापस लाना:** फ़ाइल को सर्वर में `durga/data/db.json` नाम से रखें और `pm2 restart puja`।

> बैकअप में दान/खर्च/सेटिंग का data है; अपलोड की गई फ़ोटो (`public/uploads/`) नहीं। उनकी कॉपी महीने में एक बार `scp -r` से अपने कंप्यूटर पर ले लें।

## 7. नया वर्ज़न डालते समय (data मत मिटाइए!)
`data/` और `public/uploads/` और `.env.local` को **कभी overwrite न करें**:
```bash
rsync -a --exclude data --exclude public/uploads --exclude .env.local --exclude node_modules --exclude .next नया-durga/ ~/durga/
cd ~/durga && npm install && npm run build && pm2 restart puja
```

## ज़रूरी सुरक्षा जाँच-सूची
- [ ] `ADMIN_PASSWORD` लंबा और अलग रखा (डिफ़ॉल्ट `akelwa123` नहीं)
- [ ] `ADMIN_SESSION_SECRET` में लंबा random text
- [ ] UPI ID एडमिन → सेटिंग में असली डाली, एक बार ₹11 से परीक्षण किया
- [ ] Telegram पर बैकअप आ रहा है
