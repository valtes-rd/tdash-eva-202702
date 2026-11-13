// ============================================================
//  TicketMarket Demo – Master Data
//  ※ このデータはデモ用の架空データです（団体・会場・出演者はすべて架空）
// ============================================================

// ── 日付基準 ───────────────────────────────────────────────
// 公演日は「今週の日曜日」を基準日(offset=0)として生成する。
// → 曜日は常に固定（offset 6 = 土曜, 7 = 日曜）。週が変わると日付も1週間進む。
const BASE_DATE = (() => {
  const d = new Date(); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
})();

function _offsetDate(offset) {
  const d = new Date(BASE_DATE); d.setDate(d.getDate() + offset);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// ── テストユーザー（5名） ──────────────────────────────────
const USERS = [
  {
    id: "u001", name: "山田 太郎", kana: "ヤマダ タロウ", email: "yamada.taro@demo.ticket",
    password: "Tk#Yamada2026!", phone: "090-1111-2222", birthdate: "1985-04-12",
    postal: "100-0005", address: "東京都千代田区丸の内9-9-9 デモビル101",
    card: "4980", memberSince: "2019-06-01", note: "標準ユーザー（購入履歴・お気に入りあり／新着お知らせ3件）",
  },
  {
    id: "u002", name: "鈴木 花子", kana: "スズキ ハナコ", email: "suzuki.hanako@demo.ticket",
    password: "H@nako$Live77", phone: "080-3333-4444", birthdate: "1992-08-25",
    postal: "530-0001", address: "大阪府大阪市北区梅田9-9-9",
    card: "1234", memberSince: "2021-02-14", note: "コンサート好き（抽選申込中の履歴あり／新着お知らせ2件）",
  },
  {
    id: "u003", name: "田中 健一", kana: "タナカ ケンイチ", email: "tanaka.kenichi@demo.ticket",
    password: "K3n!Stadium88", phone: "070-5555-6666", birthdate: "1978-01-30",
    postal: "812-0011", address: "福岡県福岡市博多区博多駅前9-9-9",
    card: "5678", memberSince: "2018-09-10", note: "スポーツ観戦（観覧済み・キャンセル履歴あり／お知らせは全件既読）",
  },
  {
    id: "u004", name: "佐藤 美咲", kana: "サトウ ミサキ", email: "sato.misaki@demo.ticket",
    password: "M!saki#Comic25", phone: "090-7777-8888", birthdate: "2007-11-05",
    postal: "460-0008", address: "愛知県名古屋市中区栄9-9-9",
    card: "", memberSince: "2025-04-01", note: "クレジットカード未登録・即売会参加（新着お知らせ1件）",
  },
  {
    id: "u005", name: "中村 龍也", kana: "ナカムラ リュウヤ", email: "nakamura.ryuya@demo.ticket",
    password: "Ryu@Stage2026$", phone: "080-9999-0000", birthdate: "1988-06-18",
    postal: "060-0001", address: "北海道札幌市中央区北一条西9-9-9",
    card: "9012", memberSince: "2020-11-20", note: "購入履歴なし（新規購入テスト用／お知らせ0件）",
  },
];

// ── ジャンル ───────────────────────────────────────────────
const GENRES = [
  { id: "sports",  name: "スポーツ",   en: "Sports",   emoji: "🏟️", color: "#0F766E",
    subs: ["野球", "サッカー", "バスケットボール", "格闘技"] },
  { id: "concert", name: "コンサート", en: "Concerts", emoji: "🎤", color: "#BE185D",
    subs: ["J-POP", "ロック", "アイドル", "クラシック・ジャズ"] },
  { id: "event",   name: "イベント",   en: "Events",   emoji: "🎪", color: "#B45309",
    subs: ["展示会・博覧会", "フェス", "体験・ワークショップ", "トークショー"] },
  { id: "market",  name: "即売会",     en: "Markets & Fairs", emoji: "📚", color: "#6D28D9",
    subs: ["同人誌即売会", "ハンドメイド", "古書・レコード"] },
  { id: "stage",   name: "演劇・舞台", en: "Theater",  emoji: "🎭", color: "#1D4ED8",
    subs: ["ミュージカル", "演劇", "お笑い", "伝統芸能"] },
];

const SUB_EN = {
  "野球": "Baseball", "サッカー": "Soccer", "バスケットボール": "Basketball", "格闘技": "Combat Sports",
  "J-POP": "J-POP", "ロック": "Rock", "アイドル": "Idol", "クラシック・ジャズ": "Classical / Jazz",
  "展示会・博覧会": "Exhibitions", "フェス": "Festivals", "体験・ワークショップ": "Workshops", "トークショー": "Talk Shows",
  "同人誌即売会": "Doujin Market", "ハンドメイド": "Handmade", "古書・レコード": "Books & Records",
  "ミュージカル": "Musicals", "演劇": "Plays", "お笑い": "Comedy", "伝統芸能": "Traditional",
};

// ── 会員登録：お住まいの地域（地方 → 都道府県のドリルダウン）・職業 ──
const REGIONS = [
  { key: "hokkaido-tohoku", name: "北海道・東北", en: "Hokkaido / Tohoku", prefs: [["北海道", "Hokkaido"], ["青森県", "Aomori"], ["岩手県", "Iwate"], ["宮城県", "Miyagi"], ["秋田県", "Akita"], ["山形県", "Yamagata"], ["福島県", "Fukushima"]] },
  { key: "kanto",   name: "関東",   en: "Kanto",   prefs: [["茨城県", "Ibaraki"], ["栃木県", "Tochigi"], ["群馬県", "Gunma"], ["埼玉県", "Saitama"], ["千葉県", "Chiba"], ["東京都", "Tokyo"], ["神奈川県", "Kanagawa"]] },
  { key: "chubu",   name: "中部",   en: "Chubu",   prefs: [["新潟県", "Niigata"], ["富山県", "Toyama"], ["石川県", "Ishikawa"], ["福井県", "Fukui"], ["山梨県", "Yamanashi"], ["長野県", "Nagano"], ["岐阜県", "Gifu"], ["静岡県", "Shizuoka"], ["愛知県", "Aichi"]] },
  { key: "kinki",   name: "近畿",   en: "Kinki",   prefs: [["三重県", "Mie"], ["滋賀県", "Shiga"], ["京都府", "Kyoto"], ["大阪府", "Osaka"], ["兵庫県", "Hyogo"], ["奈良県", "Nara"], ["和歌山県", "Wakayama"]] },
  { key: "chugoku-shikoku", name: "中国・四国", en: "Chugoku / Shikoku", prefs: [["鳥取県", "Tottori"], ["島根県", "Shimane"], ["岡山県", "Okayama"], ["広島県", "Hiroshima"], ["山口県", "Yamaguchi"], ["徳島県", "Tokushima"], ["香川県", "Kagawa"], ["愛媛県", "Ehime"], ["高知県", "Kochi"]] },
  { key: "kyushu-okinawa", name: "九州・沖縄", en: "Kyushu / Okinawa", prefs: [["福岡県", "Fukuoka"], ["佐賀県", "Saga"], ["長崎県", "Nagasaki"], ["熊本県", "Kumamoto"], ["大分県", "Oita"], ["宮崎県", "Miyazaki"], ["鹿児島県", "Kagoshima"], ["沖縄県", "Okinawa"]] },
];
const OCCUPATIONS = [
  { key: "employee",  name: "会社員",           en: "Company employee" },
  { key: "public",    name: "公務員",           en: "Public servant" },
  { key: "self",      name: "自営業",           en: "Self-employed" },
  { key: "student",   name: "学生",             en: "Student" },
  { key: "parttime",  name: "パート・アルバイト", en: "Part-time" },
  { key: "homemaker", name: "主婦・主夫",       en: "Homemaker" },
  { key: "other",     name: "その他",           en: "Other" },
];

// ── エリア・会場 ───────────────────────────────────────────
const AREAS = [
  { id: "hokkaido", name: "北海道・東北", en: "Hokkaido / Tohoku" },
  { id: "kanto",    name: "関東",         en: "Kanto" },
  { id: "chubu",    name: "中部",         en: "Chubu" },
  { id: "kansai",   name: "関西",         en: "Kansai" },
  { id: "kyushu",   name: "九州",         en: "Kyushu" },
];

const VENUES = [
  { id: "v-tk-dome",    area: "kanto",    name: "バルテスドーム東京",       city: "東京都文京区" },
  { id: "v-tk-arena",   area: "kanto",    name: "有明ベイアリーナ",         city: "東京都江東区" },
  { id: "v-tk-bigsq",   area: "kanto",    name: "東京ビッグスクエア展示場", city: "東京都江東区" },
  { id: "v-tk-theater", area: "kanto",    name: "新宿ヴェールシアター",     city: "東京都新宿区" },
  { id: "v-tk-hall",    area: "kanto",    name: "上野クラシックホール",     city: "東京都台東区" },
  { id: "v-tk-stadium", area: "kanto",    name: "東京湾スタジアム",         city: "東京都品川区" },
  { id: "v-tk-live",    area: "kanto",    name: "渋谷ライブハウスNOVA",     city: "東京都渋谷区" },
  { id: "v-os-dome",    area: "kansai",   name: "なにわベイドーム",         city: "大阪府大阪市" },
  { id: "v-os-messe",   area: "kansai",   name: "南港メッセ大阪",           city: "大阪府大阪市" },
  { id: "v-os-theater", area: "kansai",   name: "梅田シアタープラザ",       city: "大阪府大阪市" },
  { id: "v-os-hall",    area: "kansai",   name: "中之島シンフォニーホール", city: "大阪府大阪市" },
  { id: "v-ng-arena",   area: "chubu",    name: "金鯱アリーナ名古屋",       city: "愛知県名古屋市" },
  { id: "v-ng-messe",   area: "chubu",    name: "ポートメッセ金城",         city: "愛知県名古屋市" },
  { id: "v-ng-theater", area: "chubu",    name: "栄芸術劇場",               city: "愛知県名古屋市" },
  { id: "v-fk-stadium", area: "kyushu",   name: "博多ベイスタジアム",       city: "福岡県福岡市" },
  { id: "v-fk-messe",   area: "kyushu",   name: "博多湾メッセ",             city: "福岡県福岡市" },
  { id: "v-fk-hall",    area: "kyushu",   name: "天神クリエイトホール",     city: "福岡県福岡市" },
  { id: "v-sp-dome",    area: "hokkaido", name: "札幌スノードーム",         city: "北海道札幌市" },
  { id: "v-sd-arena",   area: "hokkaido", name: "杜の都アリーナ仙台",       city: "宮城県仙台市" },
];

// ── 券種（チケットタイプ） ─────────────────────────────────
const TICKET_TYPES = {
  adult:   { name: "大人",                       en: "Adult" },
  child:   { name: "子供（小中学生）",           en: "Child (Age 6-15)" },
  general: { name: "一般",                       en: "General" },
  student: { name: "学生（要学生証）",           en: "Student (ID required)" },
  u25:     { name: "U-25（25歳以下）",           en: "Under 25" },
  junior:  { name: "中高生",                     en: "Junior/High School" },
  elem:    { name: "小学生",                     en: "Elementary" },
  infant:  { name: "未就学児（無料・要発券）",   en: "Preschool (Free)" },
  adultm:  { name: "一般（中学生以上）",         en: "General (13+)" },
  kid:     { name: "小学生以下（保護者同伴・無料）", en: "Age 12 & under (Free, with guardian)" },
};

// ── 席種テンプレート ───────────────────────────────────────
// seats: key / name / cap(1公演あたりの総数) / prices(券種キー → 価格。未定義の券種は販売なし)
function _seat(key, name, cap, prices) { return { key, name, cap, prices }; }

const SEAT_TEMPLATES = {
  baseball: { types: ["adult", "child"], seats: [
    _seat("ss", "SS指定席", 400,  { adult: 7800, child: 3900 }),
    _seat("s",  "S指定席",  1200, { adult: 5800, child: 2900 }),
    _seat("a",  "A指定席",  3000, { adult: 3800, child: 1900 }),
    _seat("of", "外野自由席", 6000, { adult: 2200, child: 1000 }),
  ]},
  soccer: { types: ["adult", "child"], seats: [
    _seat("mss", "メインSS指定席", 500,  { adult: 6800, child: 3400 }),
    _seat("ms",  "メイン指定席",   2000, { adult: 4800, child: 2400 }),
    _seat("bk",  "バック自由席",   5000, { adult: 3200, child: 1200 }),
    _seat("gl",  "ゴール裏自由席", 6000, { adult: 2500, child: 800 }),
  ]},
  arena_sports: { types: ["adult", "child"], seats: [
    _seat("cs", "コートサイド席", 80,   { adult: 18000 }),
    _seat("f1", "1階指定席",      1500, { adult: 6500, child: 3200 }),
    _seat("f2", "2階指定席",      2500, { adult: 3800, child: 1800 }),
    _seat("fr", "2階自由席",      1500, { adult: 2500, child: 1000 }),
  ]},
  fight: { types: ["adult"], seats: [
    _seat("rs", "リングサイドSRS席", 100,  { adult: 30000 }),
    _seat("s",  "S席",               800,  { adult: 12000 }),
    _seat("a",  "A席",               2000, { adult: 7000 }),
    _seat("b",  "B席",               3000, { adult: 4500 }),
  ]},
  concert: { types: ["general"], seats: [
    _seat("vip", "VIP席（グッズ付き）", 200,  { general: 22000 }),
    _seat("s",   "S席",                 8000, { general: 9800 }),
    _seat("a",   "A席",                 6000, { general: 7800 }),
    _seat("ch",  "注釈付き指定席",      500,  { general: 6800 }),
  ]},
  idol: { types: ["general", "child"], seats: [
    _seat("ar", "アリーナ指定席", 4000, { general: 8800 }),
    _seat("st", "スタンド指定席", 6000, { general: 7800 }),
    _seat("fm", "ファミリー席",   300,  { general: 7800, child: 3800 }),
  ]},
  livehouse: { types: ["general", "student"], seats: [
    _seat("sd", "オールスタンディング", 600, { general: 5500, student: 4500 }),
    _seat("f2", "2階指定席",            100, { general: 6500 }),
  ]},
  classic: { types: ["general", "u25"], seats: [
    _seat("s", "S席", 600, { general: 8000, u25: 4000 }),
    _seat("a", "A席", 600, { general: 6000, u25: 3000 }),
    _seat("b", "B席", 400, { general: 4000, u25: 2000 }),
  ]},
  expo: { types: ["adult", "junior", "elem", "infant"], seats: [
    _seat("d1", "1日入場券", 20000, { adult: 2000, junior: 1200, elem: 800, infant: 0 }),
    _seat("pr", "優先入場券（開場30分前入場）", 1000, { adult: 4500 }),
  ]},
  fes: { types: ["adult", "junior"], seats: [
    _seat("d1",  "1日券",               15000, { adult: 12000, junior: 6000 }),
    _seat("vip", "VIPエリア付き1日券", 500,   { adult: 28000 }),
  ]},
  workshop: { types: ["adult", "elem"], seats: [
    _seat("ex", "体験参加券", 40, { adult: 3500, elem: 2500 }),
    _seat("vw", "見学のみ",   60, { adult: 500,  elem: 0 }),
  ]},
  talk: { types: ["general"], seats: [
    _seat("rs", "指定席",                 300, { general: 4000 }),
    _seat("sg", "指定席（サイン会参加券付き）", 50, { general: 7000 }),
  ]},
  doujin: { types: ["adultm", "kid"], seats: [
    _seat("er", "アーリー入場券（10:00入場）", 3000,  { adultm: 5000 }),
    _seat("gn", "一般入場券（11:00〜）",      30000, { adultm: 2000, kid: 0 }),
    _seat("pm", "午後入場券（14:00〜）",      20000, { adultm: 1000, kid: 0 }),
  ]},
  handmade: { types: ["adultm", "kid"], seats: [
    _seat("gn", "前売入場券", 5000, { adultm: 800, kid: 0 }),
  ]},
  records: { types: ["adultm"], seats: [
    _seat("er", "早割入場券（9:00〜）", 300,  { adultm: 2000 }),
    _seat("gn", "入場券（11:00〜）",    3000, { adultm: 500 }),
  ]},
  musical: { types: ["general", "u25"], seats: [
    _seat("s", "S席", 800, { general: 13500, u25: 8000 }),
    _seat("a", "A席", 400, { general: 9500,  u25: 6000 }),
    _seat("b", "B席", 200, { general: 6000 }),
  ]},
  play: { types: ["general", "u25"], seats: [
    _seat("rs", "指定席",   400, { general: 6800, u25: 4000 }),
    _seat("bx", "BOX席（2名様専用）", 20, { general: 15000 }),
  ]},
  comedy: { types: ["general"], seats: [
    _seat("fr", "前方指定席", 100, { general: 6000 }),
    _seat("rs", "指定席",     600, { general: 4500 }),
  ]},
  kabuki: { types: ["general"], seats: [
    _seat("s1", "1等席", 500, { general: 15000 }),
    _seat("s2", "2等席", 300, { general: 8000 }),
    _seat("s3", "3等席", 200, { general: 4000 }),
  ]},
  family: { types: ["adult", "elem", "infant"], seats: [
    _seat("gn", "入場券", 3000, { adult: 1500, elem: 800, infant: 0 }),
  ]},
};

// ── 公演生成ヘルパー ───────────────────────────────────────
// _perf(offset, start, open?, venue?) → 公演1件
function _perf(offset, start, open, venue) { return { offset, start, open: open || _minus(start, 60), venue }; }
function _minus(hhmm, min) {
  const [h, m] = hhmm.split(":").map(Number);
  const t = h * 60 + m - min;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}
// 週末(土日)をn週分
function _weekends(fromWeek, weeks, start) {
  const list = [];
  for (let w = fromWeek; w < fromWeek + weeks; w++) { list.push(_perf(w * 7 + 6, start)); list.push(_perf(w * 7 + 7, start)); }
  return list;
}
// 連続公演（マチネ/ソワレ）
function _run(from, days, times, skipDow = [1]) {
  const list = [];
  for (let o = from; o < from + days; o++) {
    const dow = ((o % 7) + 7) % 7;
    if (skipDow.includes(dow)) continue;
    const ts = (dow === 0 || dow === 6) ? times : [times[times.length - 1]];
    ts.forEach(t => list.push(_perf(o, t, _minus(t, 30))));
  }
  return list;
}

// ── イベント定義ヘルパー ───────────────────────────────────
// opt: maxPerOrder(1申込上限) / cancellable / saleType("first"|"lottery") / salesStartOffset /
//      lotteryEndOffset / lotteryResultOffset / soldOutDow / soldOutSeats / soldOutAll /
//      fewLeft / requireAdult / popularity / notes / tags
function _ev(id, genre, sub, title, performer, venue, tpl, perfs, desc, opt = {}) {
  const e = Object.assign({
    id, genre, sub, title, performer, venue, tpl, desc,
    maxPerOrder: 4, cancellable: true, saleType: "first",
    salesStartOffset: null, lotteryEndOffset: null, lotteryResultOffset: null,
    soldOutDow: [], soldOutSeats: [], soldOutAll: false, fewLeft: false,
    requireAdult: false, popularity: 50, notes: [], tags: [],
  }, opt);
  e.perfs = perfs.slice().sort((a, b) => a.offset - b.offset || a.start.localeCompare(b.start)).map((pf, i) => ({
    id: `${id}-p${String(i + 1).padStart(2, "0")}`,
    offset: pf.offset, date: _offsetDate(pf.offset),
    open: pf.open, start: pf.start, venue: pf.venue || venue,
  }));
  return e;
}

// ── イベントマスタ ─────────────────────────────────────────
const EVENTS = [

  // ════════ ★ バルテスシリーズ（テスト用イベント） ════════
  _ev("e001", "sports", "野球", "バルテス・スターズ 秋季交流戦", "バルテス・スターズ vs 湾岸シーガルズ", "v-tk-dome", "baseball",
    _weekends(1, 3, "14:00").concat([_perf(9, "18:00"), _perf(16, "18:00")]),
    "バルテス・スターズのホーム交流戦。土日は全席完売、平日ナイターのみ購入可能です。",
    { soldOutDow: [0, 6], popularity: 95, maxPerOrder: 6, tags: ["バルテス"], notes: ["土曜・日曜開催分は全席種完売です（テストデータ）"] }),

  _ev("e002", "concert", "J-POP", "バルテス・ドリームライブ 2026", "VALTES ALL STARS", "v-tk-arena", "concert",
    [_perf(13, "18:00"), _perf(14, "17:00"), _perf(20, "18:00", null, "v-os-dome"), _perf(21, "17:00", null, "v-os-dome")],
    "人気アーティストが集結する一夜限りのドリームライブ。VIP席は全公演完売。",
    { soldOutSeats: ["VIP席（グッズ付き）"], popularity: 99, tags: ["バルテス"], notes: ["VIP席（グッズ付き）は全公演完売です（テストデータ）", "未就学児入場不可"] }),

  _ev("e003", "event", "展示会・博覧会", "バルテス・テックエキスポ 2026", "株式会社バルテス（架空）", "v-tk-bigsq", "expo",
    [_perf(27, "10:00", "09:30"), _perf(28, "10:00", "09:30")],
    "最新のテスト自動化・AI技術が集まる展示会。チケット発売前のイベントです。",
    { salesStartOffset: 10, popularity: 70, tags: ["バルテス"], notes: ["チケットは一般発売日まで購入できません（テストデータ）"] }),

  _ev("e004", "market", "同人誌即売会", "バルテス・コミックフェスタ 12", "コミックフェスタ準備会（架空）", "v-tk-bigsq", "doujin",
    [_perf(34, "10:00", "09:00"), _perf(35, "10:00", "09:00")],
    "2日間開催の大型同人誌即売会。入場券は抽選販売です。",
    { saleType: "lottery", lotteryEndOffset: 14, lotteryResultOffset: 17, requireAdult: true, maxPerOrder: 2, popularity: 97,
      tags: ["バルテス", "抽選"], notes: ["抽選販売です。当落結果は結果発表日にマイページでご確認ください", "小学生以下は保護者同伴（保護者の入場券が必要）"] }),

  _ev("e005", "stage", "ミュージカル", "バルテス・ミュージカル「テストの国のアリス」", "劇団バルテス（架空）", "v-tk-theater", "musical",
    _run(8, 14, ["13:00", "18:00"]),
    "テストの国に迷い込んだアリスの冒険を描くオリジナルミュージカル。",
    { maxPerOrder: 2, cancellable: false, popularity: 88, tags: ["バルテス"], notes: ["お一人様1申込2枚まで", "購入後のキャンセル・変更不可（テストデータ）"] }),

  _ev("e006", "event", "フェス", "バルテス・ファミリーフェス", "バルテス・ファミリーフェス実行委員会（架空）", "v-ng-messe", "family",
    [_perf(13, "10:00", "09:30"), _perf(14, "10:00", "09:30")],
    "親子で楽しめる体験型フェス。子供券のみの購入はできません。",
    { requireAdult: true, maxPerOrder: 8, popularity: 60, tags: ["バルテス"], notes: ["小学生・未就学児のみでの購入不可（大人券が1枚以上必要）"] }),

  _ev("e007", "stage", "演劇", "バルテス・ラストステージ「千秋楽」", "劇団バルテス（架空）", "v-os-theater", "play",
    [_perf(10, "19:00"), _perf(11, "19:00"), _perf(13, "14:00")],
    "大人気シリーズの最終公演。全公演完売御礼。",
    { soldOutAll: true, popularity: 90, tags: ["バルテス"], notes: ["全公演・全席種完売です（テストデータ）"] }),

  _ev("e008", "concert", "ロック", "バルテス・ロックナイト vol.8", "THE QA BREAKERS", "v-fk-hall", "livehouse",
    [_perf(12, "19:00"), _perf(19, "19:00")],
    "残りわずか！博多の夜を揺らすロックナイト。",
    { fewLeft: true, popularity: 75, tags: ["バルテス"], notes: ["全席種残りわずかです（テストデータ）", "ドリンク代別途600円"] }),

  // ════════ スポーツ ════════
  _ev("e101", "sports", "野球", "湾岸シーガルズ ホームゲーム", "湾岸シーガルズ vs 北嶺ベアーズ", "v-tk-dome", "baseball",
    [_perf(9, "18:00"), _perf(10, "18:00"), _perf(11, "18:00"), _perf(13, "14:00"), _perf(14, "13:00")],
    "ドームで楽しむナイター観戦。子供料金あり。", { popularity: 80, maxPerOrder: 6 }),
  _ev("e102", "sports", "野球", "なにわブレイブス ファン感謝デー", "なにわブレイブス", "v-os-dome", "baseball",
    [_perf(20, "13:00"), _perf(21, "13:00")],
    "選手とのふれあいイベント満載のファン感謝デー。", { popularity: 68, maxPerOrder: 6 }),
  _ev("e103", "sports", "野球", "北嶺ベアーズ 秋季キャンプ紅白戦", "北嶺ベアーズ", "v-sp-dome", "baseball",
    [_perf(6, "13:00"), _perf(7, "13:00"), _perf(13, "13:00")],
    "若手選手が躍動する紅白戦。", { popularity: 40, maxPerOrder: 6 }),
  _ev("e104", "sports", "サッカー", "ベイサイドFC vs 金鯱ユナイテッド", "ベイサイドFC", "v-tk-stadium", "soccer",
    [_perf(13, "15:00"), _perf(27, "15:00")],
    "リーグ終盤戦、優勝争いの大一番。", { popularity: 85, maxPerOrder: 6 }),
  _ev("e105", "sports", "サッカー", "博多ウェーブス ホーム最終戦", "博多ウェーブス vs 杜の都FC", "v-fk-stadium", "soccer",
    [_perf(21, "14:00")],
    "今季ホーム最終戦。セレモニーあり。", { popularity: 66, maxPerOrder: 6 }),
  _ev("e106", "sports", "サッカー", "杜の都FC 天皇杯ラウンド", "杜の都FC vs 札幌ノーザンズ", "v-sd-arena", "soccer",
    [_perf(17, "19:00")],
    "平日ナイトゲームのカップ戦。", { popularity: 38, maxPerOrder: 6 }),
  _ev("e107", "sports", "バスケットボール", "有明サンダース ホーム開幕節", "有明サンダース vs なにわファルコンズ", "v-tk-arena", "arena_sports",
    _weekends(1, 2, "18:05"),
    "迫力のコートサイド席あり。", { popularity: 78 }),
  _ev("e108", "sports", "バスケットボール", "金鯱ドルフィンズ vs 博多ホークアイズ", "金鯱ドルフィンズ", "v-ng-arena", "arena_sports",
    [_perf(20, "18:05"), _perf(21, "14:05")],
    "中部ダービー。", { popularity: 55 }),
  _ev("e109", "sports", "格闘技", "GRAND CLASH 2026", "GRAND CLASH実行委員会（架空）", "v-os-dome", "fight",
    [_perf(28, "15:00")],
    "国内外のトップファイターが集結する格闘技の祭典。", { popularity: 82, notes: ["未就学児入場不可"] }),
  _ev("e110", "sports", "格闘技", "有明ファイトナイト 33", "有明ファイトナイト（架空）", "v-tk-arena", "fight",
    [_perf(16, "18:00")],
    "平日開催のキックボクシング興行。", { popularity: 45 }),

  // ════════ コンサート ════════
  _ev("e201", "concert", "J-POP", "ミナト・ソラ LIVE TOUR 2026 \"BLUE HOUR\"", "ミナト・ソラ", "v-tk-arena", "concert",
    [_perf(13, "18:00", null, "v-sd-arena"), _perf(20, "18:00", null, "v-ng-arena"), _perf(27, "18:00"), _perf(28, "17:00"), _perf(34, "17:00", null, "v-os-dome")],
    "全国5都市をめぐるアリーナツアー。", { popularity: 96, notes: ["未就学児入場不可", "お一人様4枚まで"] }),
  _ev("e202", "concert", "J-POP", "ひだまりポップス ファンミーティング", "ひだまりポップス", "v-fk-hall", "talk",
    [_perf(14, "14:00"), _perf(14, "18:00")],
    "トークとミニライブのファンミーティング。", { popularity: 58 }),
  _ev("e203", "concert", "ロック", "SIGNAL FIRE ワンマンライブ", "SIGNAL FIRE", "v-tk-live", "livehouse",
    [_perf(11, "19:00"), _perf(12, "19:00")],
    "ライブハウスで体感する爆音ロック。", { popularity: 64, notes: ["ドリンク代別途600円"] }),
  _ev("e204", "concert", "ロック", "NORTH WIND ROCK TOUR", "ノースウインド", "v-sp-dome", "concert",
    [_perf(27, "18:00"), _perf(28, "17:00")],
    "北の大地からロックを届ける凱旋公演。", { popularity: 52 }),
  _ev("e205", "concert", "アイドル", "スターリット☆ガールズ 冬のワンマン", "スターリット☆ガールズ", "v-ng-arena", "idol",
    [_perf(20, "17:00"), _perf(21, "16:00")],
    "ファミリー席あり。親子で楽しめるアイドルライブ。", { saleType: "lottery", lotteryEndOffset: 9, lotteryResultOffset: 11, popularity: 92,
      tags: ["抽選"], notes: ["抽選販売です", "ファミリー席は子供券（小中学生）を含む場合のみ"] }),
  _ev("e206", "concert", "アイドル", "ルミナス8 ホールツアー", "ルミナス8", "v-os-hall", "idol",
    [_perf(14, "13:00"), _perf(14, "18:00")],
    "8人組アイドルのホールツアー大阪公演。", { popularity: 73 }),
  _ev("e207", "concert", "クラシック・ジャズ", "上野フィル 第300回定期演奏会", "上野フィルハーモニー管弦楽団（架空）", "v-tk-hall", "classic",
    [_perf(12, "19:00"), _perf(13, "14:00")],
    "記念すべき第300回の定期演奏会。U-25割引あり。", { popularity: 35 }),
  _ev("e208", "concert", "クラシック・ジャズ", "中之島ジャズ・ナイト", "中之島ジャズオーケストラ（架空）", "v-os-hall", "classic",
    [_perf(19, "19:00")],
    "大人のためのジャズ・ナイト。", { popularity: 30 }),
  _ev("e209", "concert", "クラシック・ジャズ", "冬のピアノ・リサイタル", "白川 ゆき（架空）", "v-fk-hall", "classic",
    [_perf(26, "19:00")],
    "ショパン・リストを中心としたリサイタル。", { popularity: 28 }),

  // ════════ イベント ════════
  _ev("e301", "event", "展示会・博覧会", "東京おもちゃショー 2026", "東京おもちゃショー実行委員会（架空）", "v-tk-bigsq", "expo",
    [_perf(20, "10:00", "09:30"), _perf(21, "10:00", "09:30")],
    "最新のおもちゃ・ゲームが体験できる展示会。", { popularity: 77, maxPerOrder: 8 }),
  _ev("e302", "event", "展示会・博覧会", "恐竜大博覧会 in なんこう", "恐竜大博覧会実行委員会（架空）", "v-os-messe", "expo",
    _run(6, 28, ["10:00"], [2]),
    "全長30mの恐竜骨格標本が登場。", { popularity: 69, maxPerOrder: 8 }),
  _ev("e303", "event", "フェス", "OCEAN BEAT FES 2026", "OCEAN BEAT実行委員会（架空）", "v-fk-messe", "fes",
    [_perf(27, "11:00", "10:00"), _perf(28, "11:00", "10:00")],
    "海辺の屋内型音楽フェス。2日間開催。", { popularity: 84, notes: ["中高生券は当日学生証提示", "小学生以下は保護者同伴で無料"] }),
  _ev("e304", "event", "フェス", "グルメフェス名古屋", "グルメフェス名古屋実行委員会（架空）", "v-ng-messe", "fes",
    [_perf(20, "11:00", "10:30")],
    "全国のご当地グルメが大集合。", { popularity: 50 }),
  _ev("e305", "event", "体験・ワークショップ", "はじめての陶芸ワークショップ", "うつわ工房つち（架空）", "v-tk-bigsq", "workshop",
    [_perf(13, "10:00", "09:45"), _perf(13, "14:00", "13:45"), _perf(20, "10:00", "09:45")],
    "少人数制の陶芸体験。作品は後日発送。", { popularity: 33, maxPerOrder: 2 }),
  _ev("e306", "event", "体験・ワークショップ", "親子プログラミング教室", "バルテス・キッズラボ（架空）", "v-fk-messe", "workshop",
    [_perf(14, "10:00", "09:45"), _perf(21, "10:00", "09:45")],
    "小学生と保護者で参加するプログラミング体験。", { popularity: 42, requireAdult: true, maxPerOrder: 4 }),
  _ev("e307", "event", "トークショー", "人気漫画家 創作トークライブ", "森野 ペン（架空）", "v-tk-theater", "talk",
    [_perf(15, "19:00")],
    "創作の裏側を語るトークライブ。サイン会付きチケットあり。", { popularity: 61 }),
  _ev("e308", "event", "トークショー", "宇宙飛行士が語る宇宙のはなし", "星野 宙（架空）", "v-sd-arena", "talk",
    [_perf(22, "18:30")],
    "宇宙での生活をわかりやすく紹介。", { popularity: 39 }),

  // ════════ 即売会 ════════
  _ev("e401", "market", "同人誌即売会", "コミックサークル 大阪 47", "コミックサークル大阪準備会（架空）", "v-os-messe", "doujin",
    [_perf(20, "10:00", "09:00")],
    "関西最大級のオールジャンル同人誌即売会。", { requireAdult: true, popularity: 74, notes: ["小学生以下は保護者同伴"] }),
  _ev("e402", "market", "同人誌即売会", "創作マーケット 名古屋", "創作マーケット準備会（架空）", "v-ng-messe", "doujin",
    [_perf(27, "10:00", "09:00")],
    "一次創作オンリーの即売会。", { requireAdult: true, popularity: 47 }),
  _ev("e403", "market", "同人誌即売会", "博多コミックパーク", "博多コミックパーク準備会（架空）", "v-fk-messe", "doujin",
    [_perf(13, "10:00", "09:00"), _perf(14, "10:00", "09:00")],
    "九州最大の同人誌即売会。2日間開催。", { requireAdult: true, popularity: 63 }),
  _ev("e404", "market", "ハンドメイド", "ハンドメイド・クラフト祭 東京", "クラフト祭実行委員会（架空）", "v-tk-bigsq", "handmade",
    [_perf(6, "10:00", "09:30"), _perf(7, "10:00", "09:30")],
    "3,000ブースのハンドメイド作品が集結。", { popularity: 57, maxPerOrder: 6 }),
  _ev("e405", "market", "ハンドメイド", "杜の都クラフトマルシェ", "クラフトマルシェ実行委員会（架空）", "v-sd-arena", "handmade",
    [_perf(21, "10:00", "09:30")],
    "東北の作家が集うクラフトマルシェ。", { popularity: 26, maxPerOrder: 6 }),
  _ev("e406", "market", "古書・レコード", "レコード＆古書フェア 有明", "レコード古書フェア実行委員会（架空）", "v-tk-bigsq", "records",
    [_perf(16, "11:00", "09:00")],
    "中古レコードと古書の掘り出し市。", { popularity: 31 }),
  _ev("e407", "market", "古書・レコード", "札幌ブックマーケット", "札幌ブックマーケット実行委員会（架空）", "v-sp-dome", "records",
    [_perf(14, "11:00", "09:00")],
    "北海道最大の古本市。", { popularity: 22 }),

  // ════════ 演劇・舞台 ════════
  _ev("e501", "stage", "ミュージカル", "ミュージカル「星降る街のレストラン」", "劇団スターダスト（架空）", "v-tk-theater", "musical",
    _run(-6, 34, ["13:00", "18:00"]),
    "ロングラン上演中の人気ミュージカル。", { popularity: 86, notes: ["未就学児入場不可"] }),
  _ev("e502", "stage", "ミュージカル", "ミュージカル「海賊王子」大阪公演", "劇団スターダスト（架空）", "v-os-theater", "musical",
    _run(15, 10, ["12:30", "17:30"]),
    "東京公演に続く大阪公演。", { popularity: 71 }),
  _ev("e503", "stage", "演劇", "朗読劇「手紙」", "朗読劇プロジェクト（架空）", "v-ng-theater", "play",
    [_perf(12, "19:00"), _perf(13, "14:00"), _perf(14, "14:00")],
    "豪華キャストが日替わりで出演する朗読劇。", { popularity: 49 }),
  _ev("e504", "stage", "演劇", "劇団こだま 新作公演「遠い灯台」", "劇団こだま（架空）", "v-fk-hall", "play",
    [_perf(19, "19:00"), _perf(20, "14:00"), _perf(20, "19:00"), _perf(21, "14:00")],
    "家族の再生を描く感動作。", { popularity: 36 }),
  _ev("e505", "stage", "お笑い", "爆笑ライブ in 梅田", "漫才コンビ各組（架空）", "v-os-theater", "comedy",
    [_perf(9, "19:00"), _perf(16, "19:00"), _perf(23, "19:00")],
    "人気芸人が多数出演するお笑いライブ。", { popularity: 67 }),
  _ev("e506", "stage", "お笑い", "新宿コント祭り", "コントユニット各組（架空）", "v-tk-theater", "comedy",
    [_perf(25, "19:00")],
    "若手コント師の祭典。", { popularity: 44 }),
  _ev("e507", "stage", "伝統芸能", "冬の歌舞伎特別公演", "松竹梅一座（架空）", "v-ng-theater", "kabuki",
    [_perf(26, "11:00"), _perf(26, "16:00"), _perf(27, "11:00"), _perf(27, "16:00")],
    "初心者向けイヤホンガイド付き。", { popularity: 41 }),
  _ev("e508", "stage", "伝統芸能", "落語独演会", "春風亭 こはる（架空）", "v-tk-hall", "comedy",
    [_perf(18, "18:30")],
    "真打昇進記念の独演会。", { popularity: 34 }),
];

// ── 一般イベント（自動生成・200件） ────────────────────────
// 検索結果のページャー確認用。固定シードの LCG で生成するため毎回同じ内容になる。
// ID: e{ジャンル番号}{50〜89}（例: e150〜e189 = スポーツ）。すべて一般発売。
// 人気度は 3〜20 に抑え、トップのランキング・今週末・抽選/発売予定の表示は既存イベントのまま
const _GEN_SPECS = {
  sports: [
    { sub: "野球", tpl: "baseball", n: 10, times: ["18:00", "14:00"], venues: ["v-tk-dome", "v-os-dome", "v-sp-dome", "v-fk-stadium"],
      a: ["湾岸シーガルズ", "なにわブレイブス", "北嶺ベアーズ", "博多オーシャンズ", "栄ファルコンズ", "杜の都フェニックス", "札幌スノーホークス", "京浜シーラカンス"],
      b: ["秋季シリーズ", "ナイター", "デーゲーム", "ファン感謝ゲーム"], vs: true,
      desc: ["家族で楽しめるプロ野球観戦。", "迫力の打撃戦をスタンドから。", "限定グッズ配布デー。"] },
    { sub: "サッカー", tpl: "soccer", n: 10, times: ["15:00", "19:00"], venues: ["v-tk-stadium", "v-fk-stadium", "v-sd-arena"],
      a: ["ベイサイドFC", "金鯱ユナイテッド", "博多ウェーブス", "杜の都FC", "札幌ノーザンズ", "なにわSC", "湘南ブリーズ", "瀬戸内ロッソ"],
      b: ["リーグ戦", "カップ戦", "ナイトマッチ", "ダービーマッチ"], vs: true,
      desc: ["スタジアムが一体となる熱戦。", "順位を左右する重要な一戦。", "ゴール裏で声援を送ろう。"] },
    { sub: "バスケットボール", tpl: "arena_sports", n: 10, times: ["18:30", "14:00"], venues: ["v-tk-arena", "v-ng-arena", "v-sd-arena"],
      a: ["有明サンダース", "金鯱ジャガーズ", "杜の都ブルース", "なにわスパークス", "博多ブレイカーズ", "札幌アイスウルブス", "栄ロケッツ", "京浜ベイホークス"],
      b: ["ホームゲーム", "ウィークエンドゲーム", "チャリティマッチ", "ナイトゲーム"], vs: true,
      desc: ["コートサイドで迫力のプレーを。", "ハーフタイムショーも必見。"] },
    { sub: "格闘技", tpl: "fight", n: 10, times: ["17:00", "18:00"], venues: ["v-os-dome", "v-tk-arena", "v-ng-arena"],
      a: ["IRON FIST", "STEEL HEART", "THUNDER DOME", "KING OF RING", "WILD FANG", "NEO STRIKE", "BLACK TIGER", "CRIMSON BOUT"],
      b: ["2026", "ファイナル", "チャンピオンシップ", "GP 開幕戦"], org: "実行委員会（架空）",
      desc: ["王座をかけたメインイベント。", "注目の若手ファイターが集結。"] },
  ],
  concert: [
    { sub: "J-POP", tpl: "concert", n: 10, times: ["18:30", "17:00"], venues: ["v-tk-arena", "v-os-dome", "v-ng-arena", "v-sp-dome", "v-sd-arena"],
      a: ["ハルカゼ", "アオイ・ミライ", "SORA NO IRO", "月見坂ユウ", "ルミエール", "星野アカリ", "NAGI", "サクラ前線"],
      b: ["LIVE TOUR 2026", "アリーナライブ", "ワンマンライブ", "アコースティックナイト"],
      desc: ["最新アルバムを引っさげた全国ツアー。", "ヒット曲満載のスペシャルライブ。"] },
    { sub: "ロック", tpl: "livehouse", n: 10, times: ["19:00", "18:30"], venues: ["v-tk-live", "v-fk-hall"],
      a: ["THE NOISE PILOTS", "鉄線花", "BLUE MONDAY CLUB", "RED LANTERN", "サウンドクラッシュ", "夜行列車", "GLASS ROCKETS", "ハイボルテージ"],
      b: ["ライブハウスツアー", "対バンナイト", "Release Party", "秋の陣"],
      desc: ["汗が飛び散る至近距離のライブ。", "新曲初披露のツアー公演。"] },
    { sub: "アイドル", tpl: "idol", n: 10, times: ["17:00", "13:00"], venues: ["v-tk-arena", "v-ng-arena", "v-os-hall"],
      a: ["ミルキィ☆ウェイ", "PASTEL BLOOM", "きらりスマイル", "ドリーム☆パレット", "CANDY SPARK", "Twinkle Ribbon", "はなまる組", "ネオン☆シュガー"],
      b: ["ワンマンライブ", "ファンミーティング", "全国ツアー", "生誕祭"],
      desc: ["ファミリー席あり。親子で楽しめます。", "ここでしか見られない特別演出。"] },
    { sub: "クラシック・ジャズ", tpl: "classic", n: 10, times: ["19:00", "14:00"], venues: ["v-tk-hall", "v-os-hall", "v-fk-hall"],
      a: ["湾岸フィルハーモニー", "なにわ室内管弦楽団", "杜の都交響楽団", "博多ジャズオーケストラ", "栄弦楽四重奏団", "札幌ブラスアンサンブル", "上野ピアノトリオ", "ムーンライト・ジャズクインテット"],
      b: ["定期演奏会", "名曲コンサート", "ジャズナイト", "室内楽の夕べ"],
      desc: ["U-25割引あり。", "名曲を極上の音響で。"] },
  ],
  event: [
    { sub: "展示会・博覧会", tpl: "expo", n: 10, times: ["10:00"], open: 30, venues: ["v-tk-bigsq", "v-os-messe", "v-ng-messe", "v-fk-messe"],
      a: ["スマートライフ", "ロボティクス", "ゲームクリエイターズ", "アウトドア", "カメラ＆フォト", "鉄道模型", "ペット＆ライフ", "フードテック"],
      b: ["EXPO 2026", "フェア", "ショー", "博覧会"], org: "実行委員会（架空）",
      desc: ["最新製品の展示と体験コーナー。", "未就学児は無料（要発券）。"] },
    { sub: "フェス", tpl: "fes", n: 10, times: ["11:00"], open: 60, venues: ["v-fk-messe", "v-os-messe", "v-ng-messe"],
      a: ["SUNSET", "GREEN WAVE", "MIDNIGHT", "SEASIDE", "AUTUMN LEAF", "STAR LIGHT", "HARVEST", "CITY BEAT"],
      b: ["FES 2026", "MUSIC FESTIVAL", "ROCK FES", "JAZZ FES"], org: "実行委員会（架空）",
      desc: ["豪華アーティストが集結する野外フェス。", "フード出店も多数。"] },
    { sub: "体験・ワークショップ", tpl: "workshop", n: 10, times: ["10:30", "14:00"], open: 15, venues: ["v-tk-bigsq", "v-ng-messe", "v-fk-messe"],
      a: ["陶芸", "手打ちそば", "レザークラフト", "フラワーアレンジ", "プログラミング", "アロマ", "木工", "和菓子づくり"],
      b: ["体験教室", "ワークショップ", "親子体験会", "1日講座"], org: "ワークショップ事務局（架空）",
      desc: ["初心者歓迎。道具はすべて貸し出し。", "作品はお持ち帰りいただけます。"] },
    { sub: "トークショー", tpl: "talk", n: 10, times: ["14:00", "18:30"], open: 30, venues: ["v-tk-hall", "v-os-theater", "v-fk-hall"],
      a: ["人気作家", "映画監督", "料理研究家", "漫画家", "登山家", "建築家", "ゲームプロデューサー", "天文学者"],
      b: ["トークショー", "講演会", "対談イベント", "スペシャルトーク"], org: "トークイベント事務局（架空）",
      desc: ["ここでしか聞けない制作秘話。", "サイン会参加券付きの席あり。"] },
  ],
  market: [
    { sub: "同人誌即売会", tpl: "doujin", n: 14, times: ["10:00"], open: 60, venues: ["v-tk-bigsq", "v-os-messe", "v-ng-messe", "v-fk-messe"],
      a: ["コミックパレード", "創作フェスタ", "まんがひろば", "同人スクエア", "イラストマルシェ", "ファンアート祭", "小説サークル交流会", "オリジナル創作展"],
      b: ["春", "夏", "秋", "冬"], org: "準備会（架空）",
      desc: ["多数のサークルが参加する即売会。", "小学生以下は保護者同伴で無料。"] },
    { sub: "ハンドメイド", tpl: "handmade", n: 13, times: ["10:00"], open: 30, venues: ["v-tk-bigsq", "v-os-messe", "v-ng-messe", "v-fk-messe"],
      a: ["ハンドメイドマルシェ", "クラフトフェア", "アクセサリー博", "手しごと市", "布もの雑貨展", "キャンドル＆ソープ市", "ガラス工芸市", "木のおもちゃ市"],
      b: ["2026秋", "2026冬", "ナイト", "スペシャル"], org: "実行委員会（架空）",
      desc: ["作家さんと直接話せるマーケット。", "ワークショップも同時開催。"] },
    { sub: "古書・レコード", tpl: "records", n: 13, times: ["11:00"], open: 120, venues: ["v-tk-hall", "v-os-messe", "v-fk-messe"],
      a: ["古本まつり", "レコード＆CDフェア", "ヴィンテージ雑貨市", "古地図・古書展", "アナログ盤マーケット", "昭和レトロ市", "絵本の古書市", "ジャズレコード市"],
      b: ["第2回", "第3回", "特別編", "冬の陣"], org: "実行委員会（架空）",
      desc: ["掘り出し物に出会える古書・レコード市。", "早割入場は9:00から。"] },
  ],
  stage: [
    { sub: "ミュージカル", tpl: "musical", n: 10, run: true, times: ["13:00", "18:00"], venues: ["v-tk-theater", "v-os-theater", "v-ng-theater"],
      a: ["星降る丘の", "月影の", "硝子の", "風の街の", "真夜中の", "虹色の", "時計塔の", "雪国の"], b: ["王女", "サーカス", "ラプソディ", "探偵"],
      fmt: (a, b) => `ミュージカル「${a}${b}」`, troupe: true,
      desc: ["歌とダンスで綴るオリジナルミュージカル。", "U-25割引あり。"] },
    { sub: "演劇", tpl: "play", n: 10, run: true, times: ["14:00", "19:00"], venues: ["v-tk-theater", "v-os-theater", "v-ng-theater"],
      a: ["灯台守と", "さよならの", "遠い夏の", "嘘つきな", "最後の", "名前のない", "ひだまりの", "雨音と"], b: ["手紙", "約束", "食卓", "旅人"],
      fmt: (a, b) => `舞台「${a}${b}」`, troupe: true,
      desc: ["心に沁みる会話劇。", "BOX席（2名様専用）あり。"] },
    { sub: "お笑い", tpl: "comedy", n: 10, times: ["18:30", "14:00"], venues: ["v-tk-theater", "v-os-theater", "v-ng-theater", "v-fk-hall"],
      a: ["爆笑ライブ", "漫才ナイト", "コント祭", "若手芸人バトル", "ものまね大会", "大喜利ライブ", "お笑い寄席", "ピン芸人ナイト"],
      b: ["vol.1", "vol.2", "vol.3", "SP"], org: "お笑いライブ事務局（架空）",
      desc: ["人気芸人が多数出演。", "笑って楽しむ2時間。"] },
    { sub: "伝統芸能", tpl: "kabuki", n: 10, times: ["11:00", "16:00"], venues: ["v-tk-hall", "v-os-hall", "v-ng-theater"],
      a: ["新春歌舞伎", "能と狂言の夕べ", "文楽公演", "日本舞踊の会", "和太鼓公演", "三味線演奏会", "雅楽の調べ", "邦楽名曲選"],
      b: ["特別公演", "昼の部", "夜の部", "記念公演"], org: "保存会（架空）",
      desc: ["初心者向けイヤホンガイド付き。", "日本の伝統芸能を間近で。"] },
  ],
};
const _GEN_TROUPES = ["劇団ミラージュ（架空）", "劇団あおぞら（架空）", "劇団ステラ（架空）", "カンパニー灯（架空）"];

EVENTS.push(...(() => {
  let s = 20261105;
  const rnd = () => (s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296;
  const pick = a => a[Math.floor(rnd() * a.length)];
  const list = [];
  GENRES.forEach((g, gi) => {
    let k = 0;
    _GEN_SPECS[g.id].forEach(sp => {
      for (let i = 0; i < sp.n; i++, k++) {
        const a = sp.a[i % sp.a.length], b = sp.b[Math.floor(i / sp.a.length) % sp.b.length];
        const title = sp.fmt ? sp.fmt(a, b) : `${a} ${b}`;
        const performer = sp.vs ? `${a} vs ${sp.a[(i + 1 + Math.floor(i / sp.a.length)) % sp.a.length]}`
          : sp.troupe ? pick(_GEN_TROUPES) : sp.org ? `${a}${sp.org}` : a;
        const venue = pick(sp.venues);
        const open = t => (sp.open ? _minus(t, sp.open) : undefined);
        // 公演: 約1割は過去のみ（受付終了）、それ以外は今後 3〜70日
        const start = rnd() < 0.08 ? -20 + Math.floor(rnd() * 15) : 3 + Math.floor(rnd() * 60);
        let perfs;
        if (sp.run) perfs = _run(start, 5 + Math.floor(rnd() * 10), sp.times);
        else {
          const cnt = 1 + Math.floor(rnd() * 3);
          perfs = [];
          for (let p = 0; p < cnt; p++) { const t = pick(sp.times); perfs.push(_perf(start + p * (1 + Math.floor(rnd() * 7)), t, open(t), p && rnd() < 0.3 ? pick(sp.venues) : undefined)); }
        }
        const r = rnd();
        list.push(_ev(`e${gi + 1}${50 + k}`, g.id, sp.sub, title, performer, venue, sp.tpl, perfs, pick(sp.desc), {
          popularity: 3 + Math.floor(rnd() * 18), fewLeft: r < 0.08, soldOutAll: r >= 0.08 && r < 0.13,
          maxPerOrder: ["baseball", "soccer"].includes(sp.tpl) ? 6 : 4, requireAdult: sp.tpl === "doujin",
        }));
      }
    });
  });
  return list;
})());

// ── 購入ステータス ─────────────────────────────────────────
const ORDER_STATUS = {
  PURCHASED: "purchased",   // 購入済み
  LOTTERY:   "lottery",     // 抽選申込中（結果発表後は 当選/落選 を表示上判定）
  CANCELLED: "cancelled",   // キャンセル
};

// ── 受取方法・支払方法・手数料 ─────────────────────────────
const SYSTEM_FEE = 330;   // システム利用料（有料チケット1枚あたり）
const RECEIVE_METHODS = [
  { key: "eticket",  name: "電子チケット（スマホ表示）", en: "E-ticket (smartphone)", feePerTicket: 0,   feePerOrder: 0 },
  { key: "konbini",  name: "コンビニ発券",               en: "Convenience store pickup", feePerTicket: 110, feePerOrder: 0 },
  { key: "delivery", name: "配送（公演10日前までの申込）", en: "Delivery (10+ days before)", feePerTicket: 0, feePerOrder: 880, minDays: 10 },
];
const PAYMENT_METHODS = [
  { key: "credit",  name: "クレジットカード（登録済みカード）", en: "Credit card (registered)", fee: 0 },
  { key: "konbini", name: "コンビニ払い",                       en: "Pay at convenience store", fee: 220 },
  { key: "qr",      name: "QRコード決済",                       en: "QR code payment", fee: 0 },
];

// ── サンプル購入履歴（初回起動時のみ投入） ─────────────────
// perfOffset: 基準日からの日数（過去公演は観覧済み表示になる）
// noticeUnread: true の注文は「購入完了／抽選申込受付」のお知らせが未読のまま届いている
const SAMPLE_ORDERS_DEF = [
  { userId: "u001", eventId: "e101", perfIdx: 0, seatKey: "s",  items: { adult: 2, child: 1 }, receive: "eticket",  payment: "credit",  status: "purchased", createdOffset: -10 },
  { userId: "u001", eventId: "e501", perfIdx: 0, seatKey: "s",  items: { general: 2 },          receive: "eticket",  payment: "credit",  status: "purchased", createdOffset: -30 },
  { userId: "u001", eventId: "e301", perfIdx: 0, seatKey: "d1", items: { adult: 2, elem: 2 },   receive: "konbini",  payment: "konbini", status: "purchased", createdOffset: -5 },
  { userId: "u001", eventId: "e207", perfIdx: 1, seatKey: "a",  items: { general: 1 },          receive: "eticket",  payment: "qr",      status: "cancelled", createdOffset: -20 },
  { userId: "u002", eventId: "e205", perfIdx: 0, seatKey: "ar", items: { general: 2 },          receive: "eticket",  payment: "credit",  status: "lottery",   createdOffset: -3, noticeUnread: true },
  { userId: "u002", eventId: "e201", perfIdx: 2, seatKey: "s",  items: { general: 2 },          receive: "delivery", payment: "credit",  status: "purchased", createdOffset: -15 },
  { userId: "u002", eventId: "e206", perfIdx: 0, seatKey: "st", items: { general: 1 },          receive: "eticket",  payment: "credit",  status: "purchased", createdOffset: -8 },
  { userId: "u003", eventId: "e103", perfIdx: 0, seatKey: "a",  items: { adult: 1 },            receive: "eticket",  payment: "credit",  status: "purchased", createdOffset: -12 },
  { userId: "u003", eventId: "e104", perfIdx: 0, seatKey: "ms", items: { adult: 2 },            receive: "konbini",  payment: "credit",  status: "purchased", createdOffset: -6 },
  { userId: "u003", eventId: "e109", perfIdx: 0, seatKey: "s",  items: { adult: 2 },            receive: "eticket",  payment: "credit",  status: "cancelled", createdOffset: -9 },
  { userId: "u003", eventId: "e501", perfIdx: 1, seatKey: "a",  items: { general: 1, u25: 1 },  receive: "eticket",  payment: "credit",  status: "purchased", createdOffset: -25 },
  { userId: "u004", eventId: "e404", perfIdx: 0, seatKey: "gn", items: { adultm: 1 },           receive: "eticket",  payment: "konbini", status: "purchased", createdOffset: -14 },
  { userId: "u004", eventId: "e004", perfIdx: 0, seatKey: "gn", items: { adultm: 1 },           receive: "eticket",  payment: "konbini", status: "lottery",   createdOffset: -1, noticeUnread: true },
];

// ── サンプルお気に入り ─────────────────────────────────────
const SAMPLE_FAVORITES = [
  { userId: "u001", eventId: "e002" }, { userId: "u001", eventId: "e104" }, { userId: "u001", eventId: "e303" },
  { userId: "u002", eventId: "e201" }, { userId: "u002", eventId: "e205" }, { userId: "u002", eventId: "e206" }, { userId: "u002", eventId: "e002" },
  { userId: "u003", eventId: "e001" }, { userId: "u003", eventId: "e109" },
  { userId: "u004", eventId: "e004" }, { userId: "u004", eventId: "e401" },
];

// ── お知らせ（メッセージ） ─────────────────────────────────
const NOTICE_CATEGORIES = [
  { key: "campaign", name: "キャンペーン", en: "Campaign", emoji: "🎁", cls: "badge-warn" },
  { key: "ticket",   name: "チケット",     en: "Tickets",  emoji: "🎫", cls: "badge-success" },
  { key: "lottery",  name: "抽選",         en: "Lottery",  emoji: "🎲", cls: "badge-purple" },
  { key: "info",     name: "サービス",     en: "Service",  emoji: "📢", cls: "badge-primary" },
];

// サンプルお知らせ（初回起動時のみ投入）
// offset: BASE_DATE からの日数（0以下） / to: 配信先ユーザー / readBy: 既読済みのユーザー
// ※ 購入完了・抽選申込受付・キャンセルのお知らせは SAMPLE_ORDERS_DEF から自動生成（app.js）
// 新着パターン: u001=3件 / u002=2件 / u004=1件 / u003=新着なし（全件既読） / u005=お知らせ0件
const SAMPLE_NOTICES_DEF = [
  { id: "n01", category: "campaign", offset: -12, time: "12:00", to: ["u001", "u002", "u003", "u004"], readBy: ["u001", "u002", "u003", "u004"],
    title: "【期間限定】秋のエンタメ応援キャンペーン開催中", titleEn: "[Limited Time] Autumn Entertainment Campaign",
    body: "いつもTicketMarketをご利用いただきありがとうございます。\n\n期間中、対象イベントのチケットをご購入いただいた方の中から抽選で100名様に、次回使えるシステム利用料無料クーポンをプレゼントします。\n\n※ 本キャンペーンはデモ用の架空のキャンペーンです。",
    bodyEn: "Thank you for using TicketMarket.\n\n100 lucky customers who purchase tickets for eligible events during the campaign period will receive a coupon waiving the system fee on their next order.\n\n* This is a fictitious campaign for demo purposes." },
  { id: "n02", category: "info", offset: -9, time: "18:00", to: ["u001", "u002", "u003"], readBy: ["u001", "u002", "u003"],
    title: "【メンテナンス】システムメンテナンス実施のお知らせ", titleEn: "[Maintenance] Scheduled System Maintenance",
    body: "下記の日程でシステムメンテナンスを実施いたします。メンテナンス中はチケットの購入・マイページのご利用ができません。\n\n実施時間：深夜 2:00〜5:00（予定）\n\nご不便をおかけしますが、ご理解のほどよろしくお願いいたします。",
    bodyEn: "We will perform scheduled system maintenance. Ticket purchases and My Page will be unavailable during the maintenance.\n\nTime: 2:00 - 5:00 AM (planned)\n\nWe apologize for any inconvenience." },
  { id: "n03", category: "campaign", offset: -2, time: "10:00", to: ["u001", "u002", "u003"], readBy: ["u003"], eventId: "e002",
    title: "バルテス・ドリームライブ 2026 チケット好評発売中！", titleEn: "Valtes Dream Live 2026 – Tickets on Sale Now!",
    body: "人気アーティストが集結する一夜限りのドリームライブ「バルテス・ドリームライブ 2026」のチケットを好評発売中です。\n\nVIP席（グッズ付き）は完売となりました。S席・A席は引き続き販売中です。お早めにお求めください。",
    bodyEn: "Tickets for \"Valtes Dream Live 2026\", a one-night-only show featuring popular artists, are now on sale.\n\nVIP seats (with merchandise) are sold out. Other seats are still available – get yours soon!" },
  { id: "n04", category: "info", offset: 0, time: "09:00", to: ["u001", "u003"], readBy: ["u003"],
    title: "【重要】利用規約改定のお知らせ", titleEn: "[Important] Revision of Terms of Use",
    body: "TicketMarket 利用規約を改定いたします。主な変更点は以下のとおりです。\n\n・電子チケットの分配に関する規定の追加\n・キャンセル受付期限の明確化（公演日の3日前 23:59 まで）\n\n改定後の規約はヘルプページの「ご利用ルール」でご確認いただけます。",
    bodyEn: "We are revising the TicketMarket Terms of Use. Main changes:\n\n- New rules on transferring e-tickets\n- Clarified cancellation deadline (23:59, 3 days before the performance)\n\nSee \"Rules\" on the Help page for the revised terms." },
  { id: "n05", category: "campaign", offset: -1, time: "19:00", to: ["u001"], readBy: [], eventId: "e303",
    title: "お気に入りのイベント「OCEAN BEAT FES 2026」の最新情報", titleEn: "Update on your favourite event \"OCEAN BEAT FES 2026\"",
    body: "お気に入りに登録されているイベント「OCEAN BEAT FES 2026」の出演アーティスト第2弾が発表されました。\n\nチケットは好評発売中です。詳細はイベントページをご確認ください。",
    bodyEn: "The second wave of artists for your favourite event \"OCEAN BEAT FES 2026\" has been announced.\n\nTickets are on sale now. See the event page for details." },
  { id: "n06", category: "info", offset: -7, time: "11:00", to: ["u004"], readBy: ["u004"],
    title: "クレジットカード登録のご案内", titleEn: "Register a Credit Card",
    body: "クレジットカードを登録すると、チケット購入時にクレジットカード払い（手数料無料）をご利用いただけます。\n\nマイページの「ユーザー情報」→「登録情報を変更する」から登録できます。",
    bodyEn: "Register a credit card to pay by card (no fee) when purchasing tickets.\n\nGo to My Page → Profile → Edit Information to register." },
];
