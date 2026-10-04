import fs from "fs";
import { randomBytes } from "crypto";
import path from "path";
import { DEFAULT_TIERS, type DB, type Donation, type Expenditure, type GalleryItem, type Notice, type PublicData, type ScheduleItem, type Section, type Settings } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export function makeId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** सजावटी SVG placeholder (internet के बिना भी gallery खाली न दिखे) */
function placeholder(hue: number, label: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450">` +
    `<defs><radialGradient id="g" cx="50%" cy="45%"><stop offset="0%" stop-color="hsl(${hue},95%,72%)"/>` +
    `<stop offset="60%" stop-color="hsl(${hue - 20},80%,45%)"/><stop offset="100%" stop-color="%230d0207"/></radialGradient></defs>` +
    `<rect width="600" height="450" fill="url(%23g)"/>` +
    `<g fill="none" stroke="%23ffe9a3" stroke-width="3" opacity="0.75">` +
    `<circle cx="300" cy="200" r="70"/><circle cx="300" cy="200" r="110" opacity="0.5"/>` +
    `<circle cx="300" cy="200" r="150" opacity="0.25"/></g>` +
    `<text x="300" y="300" font-size="30" text-anchor="middle" fill="%23fff3e0" font-family="sans-serif">` +
    `${label}</text></svg>`;
  return "data:image/svg+xml;utf8," + svg;
}

function seedSettings(): Settings {
  return {
    committeeName: "अकेलवा पूर्व दुर्गा पूजा समिति",
    village: "अकेलवा पूर्व",
    district: "बस्ती, उत्तर प्रदेश",
    about:
      "हम अकेलवा पूर्व गाँव की दुर्गा पूजा समिति हैं। हर साल शरद नवरात्रि में माँ दुर्गा की भव्य स्थापना, नौ दिन का अखंड ज्योति जागरण, रोज़ भोग-प्रसाद और सांस्कृतिक कार्यक्रम होते हैं। समिति के सदस्य हैं - गाँव के किसान, दुकानदार, युवा भाई और बुज़ुर्ग। आसपास के गाँव केसरई, गौर और आस-पास के इलाकों से भी श्रद्धालु पंडाल में आते हैं। माँ का आशीर्वाद सब पर बना रहे।",
    notice: "🙏 माँ दुर्गा की कृपा से इस बार का पंडाल और भव्य होगा - ५१००० से ज़्यादा का दान करने वाले भक्त मुख्य दानदाता में शामिल होंगे। जय माता दी!",
    goal: 500000,
    upiId: "akelwapurva@upi",
    upiName: "अकेलवा पूर्व दुर्गा पूजा समिति",
    qrImage: "",
    pujaDates: "शरद नवरात्रि - दुर्गा पूजा एवं विजयादशमी",
    aartiTime: "सुबह आरती 6:00 बजे · संध्या आरती 7:30 बजे",
    contacts: [
      { name: "श्री राम प्रकाश तिवारी (अध्यक्ष)", phone: "9876543210", role: "अध्यक्ष" },
      { name: "श्री अमित कुमार वर्मा (कोषाध्यक्ष)", phone: "9876543211", role: "कोषाध्यक्ष" },
    ],
    whatsapp: "919876543210",
    tiers: DEFAULT_TIERS,
    noticeTitle: "सूचना पट्टी",
    liveOn: false,
    liveUrl: "",
    liveTitle: "आरती का सीधा प्रसारण",
  };
}

function seedDonations(): Donation[] {
  const day = 86400000;
  const now = Date.now();
  const rows: Array<[string, number, boolean, string | undefined, number]> = [
    ["राम प्रकाश तिवारी", 51000, false, "जय माता दी!", 9],
    ["सुनीता देवी", 41000, false, "माँ की चौकी के लिए", 8],
    ["अज्ञात भक्त", 25000, true, undefined, 7],
    ["अमित कुमार वर्मा", 21000, false, "हमारे पंडाल का गर्व", 6],
    ["रमेश यादव एवं परिवार", 15001, false, undefined, 5],
    ["श्रीमती फूलमती देवी", 11000, false, "सद्बुद्धि के लिए", 4],
    ["दीपक सिंह (केसरई)", 7100, false, undefined, 3],
    ["अज्ञात भक्त", 5100, true, undefined, 2],
    ["पूजा किराना स्टोर", 3100, false, undefined, 1],
    ["अनिल मिश्रा", 2100, false, "समिति को आशीर्वाद", 0],
    ["युवा समिति अकेलवा पूर्व", 1101, false, undefined, 0],
  ];
  return rows.map(([name, amount, anonymous, message, ago], i) => ({
    id: `seed_${i}`,
    name,
    amount,
    anonymous,
    message,
    timestamp: now - ago * day - i * 3600000,
    source: "cash" as const,
  }));
}

function seedExpenditures(): Expenditure[] {
  return [
    { id: "exp_1", category: "मूर्ति एवं विसर्जन", amount: 120000, note: "मिट्टी की मूर्ति, रंग-रोगन और विसर्जन यात्रा" },
    { id: "exp_2", category: "पंडाल सजावट", amount: 95000, note: "थीम, कपड़ा और फूलों की सजावट" },
    { id: "exp_3", category: "रोशनी एवं साउंड", amount: 70000, note: "बिजली, LED लाइट और DJ साउंड" },
    { id: "exp_4", category: "भोग एवं प्रसाद", amount: 55000, note: "रोज़ का भोग और प्रसाद वितरण" },
    { id: "exp_5", category: "सांस्कृतिक कार्यक्रम", amount: 40000, note: "आरती, कीर्तन और बच्चों की प्रतियोगिता" },
    { id: "exp_6", category: "सुरक्षा एवं सफ़ाई", amount: 20000, note: "स्वयंसेवक किट और सफ़ाई व्यवस्था" },
  ];
}

function seedGallery(): GalleryItem[] {
  const now = Date.now();
  const items: Array<[string, string, number]> = [
    ["पंडाल का मुख्य द्वार", placeholder(35, "जय माता दी"), 12],
    ["माँ दुर्गा की प्रतिमा", placeholder(15, "माँ दुर्गा"), 10],
    ["संध्या आरती", placeholder(45, "आरती"), 8],
  ];
  return items.map(([caption, url, days], i) => ({
    id: `gal_${i}`,
    url,
    caption,
    category: i === 0 ? "पंडाल" : i === 1 ? "मूर्ति" : "आरती",
    addedAt: now - days * 86400000,
  }));
}

function seedNotices(): Notice[] {
  return [
    { id: "not_1", title: "सभी सदस्यों के लिए सूचना", body: "पूजा की तैयारी के लिए सभी समिति सदस्य पंडाल स्थल पर समय से पहुँचें। (यह नमूना सूचना है — एडमिन पैनल से बदलें)", important: true, createdAt: Date.now() },
  ];
}

function seedSchedule(): ScheduleItem[] {
  const r = "(नमूना समय — एडमिन से बदलें)";
  return [
    { id: "sch_1", order: 1, day: "प्रथम दिन", date: "११ अक्टूबर", when: "2026-10-11T07:00", time: "सुबह 7:00 बजे", title: "कलश स्थापना", place: "पंडाल, अकेलवा पूर्व", reportTime: "सुबह 6:30 बजे तक पहुँचें", details: r },
    { id: "sch_2", order: 2, day: "अष्टमी", date: "", when: "2026-10-19T09:00", time: "सुबह 9:00 बजे", title: "महाअष्टमी पूजा एवं कन्या पूजन", place: "पंडाल", reportTime: "सुबह 8:30 बजे", details: "तिथि पंडित जी से पक्की करके यहाँ भरें" },
    { id: "sch_3", order: 3, day: "विजयादशमी", date: "२० अक्टूबर", when: "2026-10-20T16:00", time: "शाम 4:00 बजे", title: "विसर्जन यात्रा", place: "पंडाल से नदी घाट तक", reportTime: "दोपहर 3:00 बजे पंडाल पर", details: r },
  ];
}

function defaults(): DB {
  return {
    donations: seedDonations(),
    expenditures: seedExpenditures(),
    gallery: seedGallery(),
    notices: seedNotices(),
    schedule: seedSchedule(),
    sections: [],
    settings: seedSettings(),
    updatedAt: Date.now(),
  };
}

/** file से पूरा database पढ़ें (पहली बार चलने पर seed data बना देता है) */
export function readDB(): DB {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
      const d = defaults();
      fs.writeFileSync(DB_FILE, JSON.stringify(d, null, 2), "utf8");
      return d;
    }
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Partial<DB>;
    const base = defaults();
    return {
      donations: parsed.donations ?? base.donations,
      expenditures: parsed.expenditures ?? base.expenditures,
      gallery: parsed.gallery ?? base.gallery,
      notices: parsed.notices ?? base.notices,
      schedule: parsed.schedule ?? base.schedule,
      sections: parsed.sections ?? base.sections,
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return defaults();
  }
}

export function writeDB(db: DB) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify({ ...db, updatedAt: Date.now() }, null, 2), "utf8");
}

/** एक ही चरण में बदलाव करके सेव करें */
export function update(fn: (db: DB) => void): DB {
  const db = readDB();
  fn(db);
  writeDB(db);
  return db;
}

export const newReceiptKey = () => randomBytes(9).toString("base64url");

export const isConfirmed = (d: Donation) => d.status !== "pending";

export function publicData(): PublicData {
  const db = readDB();
  const donations = db.donations.filter(isConfirmed);
  // phone / रसीद-चाबी / नोट (UPI Ref) सार्वजनिक API में कभी नहीं जाते
  const safe = donations.map((x) => ({ ...x, phone: undefined, rk: undefined, note: undefined }));
  return {
    donations: safe,
    expenditures: db.expenditures,
    gallery: db.gallery,
    notices: db.notices,
    schedule: db.schedule,
    sections: db.sections,
    settings: db.settings,
    total: donations.reduce((s, d) => s + d.amount, 0),
    donorCount: donations.length,
    spent: db.expenditures.reduce((s, e) => s + e.amount, 0),
    updatedAt: db.updatedAt,
  };
}

export function addDonation(input: {
  name?: string;
  amount: number;
  village?: string;
  message?: string;
  anonymous?: boolean;
  source?: Donation["source"];
  status?: Donation["status"];
  note?: string;
  photo?: string;
  phone?: string;
}): Donation {
  const donation: Donation = {
    id: makeId("don"),
    name: input.anonymous ? "अज्ञात भक्त" : (input.name || "").trim() || "भक्त",
    amount: Math.round(input.amount),
    village: input.village?.trim() || undefined,
    message: input.message?.trim() || undefined,
    anonymous: Boolean(input.anonymous),
    timestamp: Date.now(),
    source: input.source ?? "online",
    status: input.status ?? "confirmed",
    note: input.note?.trim().slice(0, 60) || undefined,
    photo: input.photo,
    phone: input.phone,
    rk: newReceiptKey(),
  };
  update((db) => {
    db.donations.unshift(donation);
  });
  return donation;
}
