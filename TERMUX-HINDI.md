# 📱 फ़ोन (Termux) में वेबसाइट चलाना — गाँव के सब लोग अपने फ़ोन से खोलें

**सबसे ज़रूरी बात:** मोबाइल नेटवर्क पर फ़ोन का अपना public IP नहीं होता, इसलिए गाँव वाले सीधे आपके फ़ोन तक नहीं पहुँच सकते। इसका हल **Cloudflare Tunnel** है (मुफ़्त) — फ़ोन ख़ुद Cloudflare से जुड़ता है और वही आपको एक https पता देता है।

## A. फ़ोन तैयार करें (एक बार)
1. **Termux** और **Termux:Boot** (और Termux:API) F-Droid से इंस्टॉल करें (Play Store वाला पुराना है)।
2. फ़ोन Settings → Apps → Termux → Battery → **Unrestricted / Don't optimize**। (Xiaomi/Realme/Oppo/Vivo में "Autostart" भी चालू करें, और Recent apps में Termux को 🔒 lock करें।)
3. Termux:Boot ऐप एक बार खोल लें।
4. फ़ोन **चार्जर पर** रखें। पूरे दिन चलाना है तो बैटरी फूल सकती है — 80% चार्ज-लिमिट वाला फ़ोन/चार्जर हो तो बेहतर।

## B. प्रोजेक्ट डालें
Termux में:
```bash
termux-setup-storage          # permission दें
cd ~ && cp ~/storage/downloads/akelwa-durga-puja-v12.zip . && pkg install -y unzip && unzip akelwa-durga-puja-v12.zip && cd durga
bash termux/setup.sh
nano .env.local               # ADMIN_PASSWORD ज़रूर भरें (डिफ़ॉल्ट akelwa123 कभी न रखें)
```
**टिप:** फ़ोन पर `npm run build` भारी है। कंप्यूटर पर `npm install && npm run build` करके `.next` फ़ोल्डर भी zip में डाल दें तो फ़ोन पर सिर्फ़ `npm install --omit=dev` चलेगा (setup.sh ख़ुद पहचान लेता है)।

## C. चालू करें
```bash
bash termux/start.sh
```
- यह `termux-wake-lock` लगाता है (नोटिफ़िकेशन में "Wake lock held" दिखेगा), साइट चलाता है, और crash होने पर ख़ुद दोबारा चालू करता है।
- बंद करने के लिए: `bash termux/stop.sh`

## D. पता (URL) कैसे बने
**1. टेस्ट (मुफ़्त, तुरंत):** बिना कुछ किए `start.sh` एक `https://कुछ-random.trycloudflare.com` पता दिखाएगा। ⚠️ यह **हर बार चालू करने पर बदल जाता है** — गाँव में बाँटने लायक नहीं।

**2. पक्का पता (असली इस्तेमाल के लिए):**
1. एक सस्ता डोमेन लें (`.in` लगभग ₹100–700/साल, जैसे `akelwadurga.in`) और उसे https://dash.cloudflare.com पर जोड़ें (free plan)।
2. Cloudflare → **Zero Trust → Networks → Tunnels → Create tunnel → Cloudflared** → नाम दें → आपको एक लंबा **token** मिलेगा।
3. Tunnel के **Public hostname** में: Hostname `akelwadurga.in` (या `puja.akelwadurga.in`), Service **HTTP**, URL `localhost:3000`।
4. Token को फ़ोन में सेव करें: `echo "यहाँ-token-पेस्ट" > termux/tunnel-token.txt`
5. `.env.local` में `SITE_URL=https://akelwadurga.in` डालें (WhatsApp पर माँ की फ़ोटो दिखे), फिर `bash termux/start.sh`।
अब वही पता हमेशा रहेगा; WhatsApp ग्रुप में बाँट दें।

## E. ज़रूरी सावधानियाँ
- **Admin छिपा है**, पता: `https://आपका-पता/admin` — URL याद रखें और मज़बूत password रखें।
- **Telegram बैकअप चालू रखें** (`.env.local` में `TELEGRAM_BOT_TOKEN` और `TELEGRAM_CHAT_ID`) — फ़ोन बिगड़ा/खोया तो दान का हिसाब सुरक्षित रहेगा।
- फ़ोन का data/WiFi चालू रहे। बहुत ज़्यादा लोग एक साथ आएँगे तो फ़ोन गरम होगा; 100 लोगों के लिए आराम से चलेगा।
- फ़ोन restart हो तो Termux:Boot अपने-आप `start.sh` चला देगा (फ़ोन अनलॉक करने से पहले कुछ फ़ोन में नहीं चलता — एक बार Termux खोल लें)।
- कुछ अटके तो: `tmux attach -t puja` से लॉग देखें।
- अगर `npm install` में Next.js का SWC error आए: `npm install --omit=dev` चलाएँ (runtime को SWC नहीं चाहिए), और build कंप्यूटर पर करें।

---
# 🆓 मुफ़्त तरीक़े — पक्का URL / अपने नेटवर्क पर

## 1. पक्का URL, बिल्कुल मुफ़्त
| तरीक़ा | पक्का पता? | सीमा | आसानी |
|---|---|---|---|
| **Tailscale Funnel** | हाँ (`नाम.tailxxxx.ts.net`) | कोई घोषित मासिक कोटा नहीं, पर Funnel पर अघोषित bandwidth-सीमा है | कठिन (Termux में अनौपचारिक build) |
| **ngrok free** | हाँ (`xxx.ngrok-free.dev`) | **1 GB/माह, 20k request/माह** | आसान |
| Cloudflare + सस्ता डोमेन | हाँ (अपना नाम) | कोई सीमा नहीं | आसान, पर डोमेन ~₹100-700/साल |

**ngrok:** ngrok.com पर मुफ़्त account → Dashboard में आपका **dev domain** अपने-आप मिलता है (नाम चुन नहीं सकते) → authtoken लें। इस साइट में intro/टेक्सचर/फ़ोटो भारी हैं, इसलिए 1 GB में शायद 200-300 विज़िट ही निकलें; मुफ़्त पर पहले "Visit site" वाली चेतावनी-स्क्रीन भी आ सकती है।
**Tailscale Funnel:** account बनाकर Termux में community build (`github.com/bropines/tailscale-termux-cli`) लगाएँ, `tailscale up`, फिर `tailscale funnel 3000`। पता हमेशा वही रहेगा; पर यह औपचारिक रूप से समर्थित नहीं है, इसलिए अटक सकता है।
**मेरी सलाह:** असली इस्तेमाल के लिए Cloudflare + ₹100-700 का डोमेन ही सबसे भरोसेमंद है। पूरी तरह मुफ़्त चाहिए तो पहले ngrok आज़माएँ (आसान), इस्तेमाल बढ़े तो Tailscale/Cloudflare।

## 2. अपने नेटवर्क (WiFi/हॉटस्पॉट) पर — बिना इंटरनेट, बिना ख़र्च
```bash
bash termux/local.sh
```
यह साइट चालू करके पता और **QR** दिखाता है। लोग उसी WiFi/हॉटस्पॉट से जुड़कर `http://IP:3000` खोलें।
- **फ़ोन का हॉटस्पॉट:** अक्सर पता `http://192.168.43.1:3000` रहता है (हर फ़ोन में अलग हो सकता है; स्क्रिप्ट जो दिखाए वही लें)। आम तौर पर 8-10 फ़ोन ही जुड़ पाते हैं और दायरा ~10-20 मीटर।
- **ज़्यादा लोग:** एक सस्ता WiFi राउटर (₹700-1000) पंडाल में लगाएँ, उसका password खुला रखें, और फ़ोन को उसी राउटर से जोड़कर `local.sh` चलाएँ। राउटर की DHCP सेटिंग में फ़ोन का IP "reserve" कर दें तो पता कभी नहीं बदलेगा। QR छापकर लगा दें।
- ध्यान: इस मोड में site `http` पर है, इसलिए एडमिन login के लिए `ALLOW_INSECURE_COOKIE=1` चाहिए (स्क्रिप्ट अपने-आप डाल देती है)। गाँव के बाहर से लोग इसे नहीं खोल पाएँगे।
- UPI दान-QR के लिए लोगों के फ़ोन में मोबाइल डेटा/इंटरनेट चाहिए ही (भुगतान के लिए), भले साइट लोकल हो।

---
# ✅ 10 दिन, ~100 लोग, मुफ़्त + पक्का URL + 24/7  →  **ngrok (मुफ़्त dev domain)**
**क्यों:** पक्का पता मुफ़्त मिलता है, चालू रहने की समय-सीमा नहीं (free endpoint का timeout नहीं), और 1 GB/माह व 20k request की सीमा 100 लोगों के लिए काफ़ी है (पहली बार ~3 MB, फिर cache से कम)। गैलरी में बड़ी फ़ोटो न डालें।

1. https://ngrok.com पर मुफ़्त account बनाएँ → Dashboard → **Domains** में आपका पक्का पता दिखेगा (जैसे `abc-xyz.ngrok-free.dev`) → **Your Authtoken** कॉपी करें।
2. Termux (**F-Droid वाला**) में:
```bash
pkg install -y wget
cd ~ && wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz
tar -xzf ngrok-v3-stable-linux-arm64.tgz -C $PREFIX/bin
ngrok config add-authtoken आपका-TOKEN
cd ~/durga
echo "abc-xyz.ngrok-free.dev" > termux/ngrok-domain.txt     # अपना डोमेन लिखें
nano .env.local        # SITE_URL=https://abc-xyz.ngrok-free.dev  और ADMIN_PASSWORD
bash termux/start.sh
```
(32-bit फ़ोन हो तो `linux-arm` वाली फ़ाइल लें। `uname -m` से जाँचें।)
3. वही लिंक WhatsApp ग्रुप में डाल दें।

**जानने लायक बातें**
- पहली बार खोलने पर ngrok की एक चेतावनी-स्क्रीन आती है; "Visit Site" दबाना है, फिर 7 दिन नहीं आती। लोगों को पहले बता दें।
- WhatsApp में लिंक-preview (माँ की फ़ोटो) शायद न दिखे, इसी चेतावनी की वजह से।
- 24/7 के लिए: फ़ोन चार्जर पर, Termux की battery "Unrestricted", wake-lock नोटिफ़िकेशन बना रहे, WiFi/डेटा चालू। Termux को Recent apps से swipe-close न करें।
- Telegram बैकअप चालू रखें। 10 दिन बाद `bash termux/stop.sh`।

---
# 🚫 ngrok की चेतावनी-स्क्रीन नहीं चाहिए तो → Cloudflare Quick Tunnel (मुफ़्त)
- **कोई चेतावनी-स्क्रीन नहीं**, कोई account नहीं, कोई bandwidth-सीमा घोषित नहीं।
- कमी: पता `https://कुछ-random.trycloudflare.com` होता है और **tunnel दोबारा शुरू होने पर बदल जाता है** (फ़ोन restart / net टूटना / script दोबारा चलाना)। फ़ोन चालू और नेट ठीक रहे तो 10 दिन एक ही पता चल सकता है, पर गारंटी नहीं।
- हल: `.env.local` में `TELEGRAM_BOT_TOKEN` और `TELEGRAM_CHAT_ID` भरें। **हर नया पता Telegram पर अपने-आप आ जाएगा** — उसे WhatsApp ग्रुप में फ़ॉरवर्ड कर दें।
- चलाएँ: `termux/ngrok-domain.txt` और `termux/tunnel-token.txt` **न** रखें, फिर `bash termux/start.sh`। इस मोड का `SITE_URL` खाली छोड़ दें।
- पक्का पता (बिना बदले, मुफ़्त) चाहिए तो ऊपर की ngrok विधि या Cloudflare+डोमेन ही रास्ता है; मुफ़्त पक्के पते के साथ चेतावनी-स्क्रीन से बचने का कोई आसान तरीक़ा मुझे पक्का नहीं पता।
