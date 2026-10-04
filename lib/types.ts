/** साझा data types (पूरी वेबसाइट हिंदी में, पर field नाम अंग्रेज़ी में रखे हैं) */

export interface Donation {
  id: string;
  name: string;
  amount: number;
  village?: string;
  message?: string;
  anonymous: boolean;
  timestamp: number;
  source: "online" | "cash";
  /** online दान admin की पुष्टि के बाद ही सूची में जुड़ता है (पुराने records = confirmed) */
  status?: "pending" | "confirmed";
  note?: string;
  /** दानदाता की फ़ोटो (/uploads/...) — दान जितना ज़्यादा, फ़ोटो उतनी बड़ी */
  photo?: string;
  /** रसीद के लिए (सिर्फ़ admin को दिखता है, सार्वजनिक नहीं) */
  phone?: string;
  /** रसीद की गुप्त चाबी — पुष्टि के बाद ही रसीद खुलती है */
  rk?: string;
  confirmedAt?: number;
  /** admin इसे ख़ास तौर पर ऊपर दिखाना चाहे तो */
  featured?: boolean;
}

/** सूचना पट्टी की सूचना */
export interface Notice {
  id: string;
  title: string;
  body: string;
  important: boolean;
  createdAt: number;
}

/** कार्यक्रम सारणी: कब, कहाँ, कितने बजे पहुँचना है */
export interface ScheduleItem {
  id: string;
  order: number;
  day: string;
  date: string;
  time: string;
  title: string;
  place: string;
  reportTime: string;
  details: string;
  /** तारीख़-समय (YYYY-MM-DDTHH:mm) — भरने पर क्रम अपने-आप लगता है और "अगला कार्यक्रम" चमकता है */
  when?: string;
}

/** admin अपनी मर्ज़ी से कोई भी नया सेक्शन जोड़ सके */
export interface Section {
  id: string;
  order: number;
  title: string;
  body: string;
  image: string;
  showOnHome: boolean;
}

/** दान-स्तर: कम से कम राशि, नाम, और फ़ोटो का आकार (px) */
export interface Tier {
  min: number;
  label: string;
  size: number;
  /** इस स्तर के दानदाता को रसीद/दीवार पर दिखने वाला धन्यवाद */
  thanks?: string;
}

export interface Expenditure {
  id: string;
  category: string;
  amount: number;
  note?: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: string;
  addedAt: number;
}

export interface Contact {
  name: string;
  phone: string;
  role: string;
}

export interface Settings {
  committeeName: string;
  village: string;
  district: string;
  about: string;
  notice: string;
  goal: number;
  upiId: string;
  upiName: string;
  qrImage: string; // custom QR (अगर admin ने अपलोड किया हो)
  pujaDates: string;
  aartiTime: string;
  contacts: Contact[];
  whatsapp: string;
  tiers: Tier[];
  noticeTitle: string;
  liveOn: boolean;
  liveUrl: string;
  liveTitle: string;
}

export interface DB {
  donations: Donation[];
  expenditures: Expenditure[];
  gallery: GalleryItem[];
  notices: Notice[];
  schedule: ScheduleItem[];
  sections: Section[];
  settings: Settings;
  updatedAt: number;
}

/** public API से मिलने वाला data (total/donorCount सहित) */
export interface PublicData {
  donations: Donation[];
  expenditures: Expenditure[];
  gallery: GalleryItem[];
  notices: Notice[];
  schedule: ScheduleItem[];
  sections: Section[];
  settings: Settings;
  total: number;
  donorCount: number;
  spent: number;
  updatedAt: number;
}

export const GALLERY_CATEGORIES = [
  "पंडाल",
  "मूर्ति",
  "आरती",
  "भोग-प्रसाद",
  "सांस्कृतिक कार्यक्रम",
  "विसर्जन",
  "समिति सदस्य",
] as const;

export const DEFAULT_TIERS: Tier[] = [
  { min: 51000, label: "महा दानवीर", size: 300, thanks: "आपकी उदारता से माँ का दरबार सजता है। माँ आप और परिवार पर अपनी विशेष कृपा बनाए रखें 🙏" },
  { min: 21000, label: "विशिष्ट दानदाता", size: 210, thanks: "आपके बड़े सहयोग के लिए हृदय से आभार। जय माता दी!" },
  { min: 5000, label: "प्रमुख दानदाता", size: 150, thanks: "आपके सहयोग के लिए धन्यवाद। माँ सबकी मनोकामना पूर्ण करें।" },
  { min: 1100, label: "सहयोगी भक्त", size: 100, thanks: "आपके दान के लिए धन्यवाद। माँ का आशीर्वाद सदा बना रहे।" },
  { min: 0, label: "श्रद्धालु भक्त", size: 72, thanks: "आपकी श्रद्धा माँ तक पहुँची। धन्यवाद, जय माता दी 🙏" },
];

/** राशि के हिसाब से स्तर (tiers ऊँचे से नीचे क्रम में नहीं भी हों तो चलेगा) */
export function tierOf(amount: number, tiers: Tier[]): number {
  const sorted = tiers.map((t, i) => ({ t, i })).sort((a, b) => b.t.min - a.t.min);
  return (sorted.find(({ t }) => amount >= t.min) ?? sorted[sorted.length - 1]).i;
}

export const FALLBACK_THANKS = "आपके सहयोग के लिए हृदय से धन्यवाद। जय माता दी 🙏";

/** सार्वजनिक रसीद (सिर्फ़ पुष्टि के बाद) */
export interface Receipt {
  status: "confirmed" | "pending";
  name?: string;
  amount?: number;
  village?: string;
  timestamp?: number;
  anonymous?: boolean;
  no?: string;
  tierLabel?: string;
  thanks?: string;
  committee?: string;
  photo?: string;
}
