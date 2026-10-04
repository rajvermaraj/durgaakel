# 🚀 GitHub + Railway पर वेबसाइट डालना (शुरुआती के लिए)

इस zip में `node_modules`, `.next`, `data`, `.env.local` नहीं हैं — GitHub पर यही चाहिए। **`.env.local` और पासवर्ड कभी GitHub पर न डालें** (`.gitignore` इन्हें अपने-आप रोकता है)।

## भाग 1 — GitHub account और repo
1. https://github.com → **Sign up** → ईमेल से account बनाएँ।
2. ऊपर दाएँ **+ → New repository**। नाम: `durga-puja`। **Private** चुनें। **Create repository**।

## भाग 2 — फ़ाइलें अपलोड करना
### तरीका A: कंप्यूटर/लैपटॉप से (आसान)
1. zip को **Extract** करें → अंदर `durga` फ़ोल्डर खोलें।
2. GitHub repo में **uploading an existing file** लिंक दबाएँ।
3. `durga` फ़ोल्डर के **अंदर की सारी चीज़ें** (app, components, lib, public, package.json … सब) चुनकर ब्राउज़र में drag-drop करें। (फ़ोल्डर `durga` ख़ुद नहीं, उसके अंदर का सामान।) `package.json` repo की सबसे ऊपरी सतह पर दिखना चाहिए।
4. नीचे **Commit changes** दबाएँ।
> ब्राउज़र अपलोड में एक बार में 100 फ़ाइलें तक चलती हैं। ज़्यादा हों तो दो बार में करें।

### तरीका B: सिर्फ़ फ़ोन (Termux) से
```bash
pkg install -y git unzip
cd ~ && unzip akelwa-durga-puja-v12.zip && cd durga
git init && git add . && git commit -m "first"
git branch -M main
git remote add origin https://github.com/आपका-यूज़रनेम/durga-puja.git
git push -u origin main
```
Password की जगह **Personal Access Token** माँगेगा: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate → `repo` टिक करें → टोकन कॉपी करके पासवर्ड की जगह पेस्ट करें।

## भाग 3 — Railway पर चालू करना
1. https://railway.com → **Login with GitHub**।
2. **New Project → Deploy from GitHub repo** → `durga-puja` चुनें (पहली बार "Configure GitHub App" में repo को अनुमति दें)।
3. Railway ख़ुद Next.js पहचानकर build करेगा (3-6 मिनट)।
4. सर्विस खोलें → **Variables** टैब → ये जोड़ें:
   - `ADMIN_PASSWORD` = आपका मज़बूत पासवर्ड
   - `ADMIN_SESSION_SECRET` = कोई भी 30-40 अक्षर का random टेक्स्ट
   - `TELEGRAM_BOT_TOKEN` और `TELEGRAM_CHAT_ID` (बैकअप के लिए)
5. **Settings → Networking → Generate Domain** → आपको पक्का पता मिलेगा, जैसे `durga-puja-production.up.railway.app`।
6. वही पता **Variables** में `SITE_URL=https://वह-पता` डालें। (Redeploy अपने-आप होगा।)
7. **Volume (ज़रूरी, वरना दान का data हर deploy पर मिट सकता है):** प्रोजेक्ट canvas पर **Ctrl+K / right-click → Add Volume** (या service → Settings → Volumes) → Mount path: `/app/data` → Create। इसके बाद फिर Redeploy।
   (यह data और अपलोड की गई फ़ोटो दोनों सँभालता है।)
8. पता खोलकर जाँचें। एडमिन: `https://पता/admin`।

## ज़रूरी बातें
- Railway का free credit सीमित है (नया account: एक बार का ~$5)। **Usage** पेज पर बचा credit देखते रहें।
- 10 दिन बाद सर्विस **Settings → Delete service** करके बंद कर दें, वरना credit खत्म होने पर अपने-आप रुकेगी।
- कोड बदलकर GitHub पर push करेंगे तो Railway दोबारा deploy करेगा; volume का data बचा रहता है।
- Telegram बैकअप ज़रूर चालू रखें।
