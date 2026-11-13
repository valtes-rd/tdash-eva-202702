// ============================================================
//  TicketMarket Demo – App Core (state, auth, stock, orders, utils)
// ============================================================

const App = (() => {

  // ── State ─────────────────────────────────────────────────
  const _state = {
    currentUser: null,
    users: [],
    orders: [],
    favorites: [],
    notices: [],
    searchParams: {},
  };

  // ── ローカルストレージキー ──
  const LS = {
    USER:      "tm_user",       // ログインセッション
    USERS:     "tm_users",      // 会員（テストユーザー＋新規登録・プロフィール編集反映）
    ORDERS:    "tm_orders",     // 購入履歴
    FAVORITES: "tm_favorites",  // お気に入り
    SEARCH:    "tm_search",     // 検索条件
    CART:      "tm_cart",       // 購入手続き中のチケット
    HISTORY:   "tm_history",    // 最近チェックしたイベント
    NOTICES:   "tm_notices",    // お知らせ（ユーザーごとの受信・既読状態）
  };

  const _t = (ja, en) => (typeof I18n !== "undefined" ? I18n.t(ja, en) : ja);
  const _read = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } };
  const _write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // ── 初期化 ─────────────────────────────────────────────────
  function init() {
    _state.users = _read(LS.USERS, null);
    if (!Array.isArray(_state.users)) { _state.users = USERS.map(u => ({ ...u })); _write(LS.USERS, _state.users); }

    const u = _read(LS.USER, null);
    if (u) _state.currentUser = _state.users.find(x => x.id === u.id) || null;

    _state.orders = _read(LS.ORDERS, null);
    if (!Array.isArray(_state.orders)) { _state.orders = _buildSampleOrders(); _write(LS.ORDERS, _state.orders); }

    _state.favorites = _read(LS.FAVORITES, null);
    if (!Array.isArray(_state.favorites)) {
      _state.favorites = SAMPLE_FAVORITES.map(f => ({ ...f, addedAt: new Date().toISOString() }));
      _write(LS.FAVORITES, _state.favorites);
    }

    _state.notices = _read(LS.NOTICES, null);
    if (!Array.isArray(_state.notices)) { _state.notices = _buildSampleNotices(); _write(LS.NOTICES, _state.notices); }

    renderHeader();
  }

  function _buildSampleNotices() {
    const list = [];
    const at = (offset, time) => {
      const d = new Date(BASE_DATE); d.setDate(d.getDate() + offset);
      const [h, m] = time.split(":"); d.setHours(+h, +m, 0, 0);
      return d.toISOString();
    };
    SAMPLE_NOTICES_DEF.forEach(d => d.to.forEach(uid => list.push({
      id: `${d.id}-${uid}`, userId: uid, category: d.category,
      title: d.title, titleEn: d.titleEn, body: d.body, bodyEn: d.bodyEn,
      eventId: d.eventId || null, tab: d.tab || null,
      createdAt: at(d.offset, d.time), read: d.readBy.includes(uid),
    })));
    // サンプル購入履歴に対応する 購入完了／抽選申込受付／キャンセル のお知らせ
    SAMPLE_ORDERS_DEF.forEach((d, i) => {
      const o = _state.orders.find(x => x.userId === d.userId && x.eventId === d.eventId && x.orderNo.endsWith("-" + String(i + 1).padStart(5, "0")));
      if (!o) return;
      list.push({ ..._orderNotice(o, "order"), read: !d.noticeUnread });
      if (o.status === ORDER_STATUS.CANCELLED) {
        const c = new Date(o.createdAt); c.setDate(c.getDate() + 1);
        list.push({ ..._orderNotice(o, "cancel"), createdAt: c.toISOString(), read: true });
      }
    });
    return list;
  }

  function _buildSampleOrders() {
    const list = [];
    SAMPLE_ORDERS_DEF.forEach((d, i) => {
      const e = getEvent(d.eventId); if (!e) return;
      const perf = e.perfs[d.perfIdx]; if (!perf) return;
      const seat = getSeat(e, d.seatKey); if (!seat) return;
      const items = Object.entries(d.items).map(([k, qty]) => ({ typeKey: k, typeName: TICKET_TYPES[k].name, price: seat.prices[k], qty }));
      const fees = calcFees(items, d.receive, d.payment);
      const created = new Date(BASE_DATE); created.setDate(created.getDate() + d.createdOffset); created.setHours(10, 15, 0, 0);
      const user = USERS.find(u => u.id === d.userId);
      list.push(_orderRecord({
        seq: i + 1, created, user, event: e, perf, seat, items, fees,
        receive: d.receive, payment: d.payment, status: d.status,
        buyer: { name: user.name, kana: user.kana, phone: user.phone, email: user.email, postal: user.postal, address: user.address },
      }));
    });
    return list;
  }

  // ── 認証 ──────────────────────────────────────────────────
  function login(email, password) {
    const user = _state.users.find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, msg: _t("メールアドレスまたはパスワードが正しくありません。", "Incorrect email or password.") };
    _state.currentUser = user;
    _write(LS.USER, { id: user.id });
    renderHeader();
    return { ok: true, user };
  }

  function logout() {
    if (!confirm(_t("ログアウトしますか？", "Are you sure you want to log out?"))) return;
    _state.currentUser = null;
    localStorage.removeItem(LS.USER);
    renderHeader();
    if (typeof I18n !== "undefined") I18n.go("index.html"); else window.location.href = "index.html";
  }

  function isLoggedIn() { return !!_state.currentUser; }
  function currentUser() { return _state.currentUser; }

  // ログイン必須ガード
  function requireLogin(redirectBack) {
    if (!isLoggedIn()) {
      sessionStorage.setItem("tm_redirect_after_login", redirectBack || window.location.href);
      showLoginModal();
      return false;
    }
    return true;
  }

  // 新規会員登録（登録後そのままログイン）
  function register(data) {
    if (_state.users.some(u => u.email === data.email)) {
      return { ok: false, msg: _t("このメールアドレスは既に登録されています。", "This email address is already registered.") };
    }
    const user = {
      id: "u" + Date.now(), name: data.name, kana: data.kana, email: data.email, password: data.password,
      phone: data.phone, birthdate: data.birthdate, postal: data.postal || "", address: data.address || "",
      pref: data.pref || "", occupation: data.occupation || "", interests: data.interests || [], newsletter: !!data.newsletter,
      card: "", memberSince: fmtDate(new Date()), note: _t("新規登録ユーザー", "Newly registered user"),
    };
    _state.users.push(user);
    _write(LS.USERS, _state.users);
    _state.currentUser = user;
    _write(LS.USER, { id: user.id });
    _addNotice({
      id: `n-welcome-${user.id}`, userId: user.id, category: "info",
      title: "【ようこそ】会員登録が完了しました", titleEn: "[Welcome] Your registration is complete",
      body: `${user.name} 様\n\nTicketMarket への会員登録ありがとうございます。\nスポーツ・コンサート・イベント・即売会・演劇などのチケットをお楽しみください。\n\nクレジットカードを登録すると、手数料無料のクレジットカード払いをご利用いただけます（マイページ → ユーザー情報）。`,
      bodyEn: `Dear ${user.name},\n\nThank you for registering with TicketMarket.\nEnjoy tickets for sports, concerts, events, markets and theater.\n\nRegister a credit card on My Page → Profile to pay by card with no fee.`,
    });
    renderHeader();
    return { ok: true, user };
  }

  // プロフィール更新
  function updateProfile(data) {
    const u = _state.currentUser; if (!u) return { ok: false, msg: _t("ログインしてください。", "Please log in.") };
    if (data.email !== u.email && _state.users.some(x => x.email === data.email)) {
      return { ok: false, msg: _t("このメールアドレスは既に使用されています。", "This email address is already in use.") };
    }
    Object.assign(u, data);
    _write(LS.USERS, _state.users);
    renderHeader();
    return { ok: true, user: u };
  }

  // ── マスタ参照 ────────────────────────────────────────────
  function getEvent(id)  { return EVENTS.find(e => e.id === id); }
  function getVenue(id)  { return VENUES.find(v => v.id === id); }
  function getGenre(id)  { return GENRES.find(g => g.id === id); }
  function getArea(id)   { return AREAS.find(a => a.id === id); }
  function getPerf(e, perfId) { return e.perfs.find(p => p.id === perfId); }
  function getSeats(e)   { return SEAT_TEMPLATES[e.tpl].seats; }
  function getSeat(e, key) { return getSeats(e).find(s => s.key === key); }
  function getTypes(e)   { return SEAT_TEMPLATES[e.tpl].types; }

  function genreName(id) { const g = getGenre(id); return g ? _t(g.name, g.en) : id; }
  function subName(s)    { return _t(s, SUB_EN[s] || s); }
  function areaName(id)  { const a = getArea(id); return a ? _t(a.name, a.en) : id; }
  function typeName(k)   { const t = TICKET_TYPES[k]; return t ? _t(t.name, t.en) : k; }
  function venueName(id) { const v = getVenue(id); return v ? v.name : id; }
  function eventAreas(e) { return [...new Set(e.perfs.map(p => getVenue(p.venue)?.area))]; }

  // ── 日付ユーティリティ ────────────────────────────────────
  function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function todayStr() { return fmtDate(today()); }
  function daysUntil(dateStr) { return Math.round((new Date(dateStr + "T00:00:00") - today()) / 86400000); }
  function offsetDate(offset) { return _offsetDate(offset); }

  // 購入受付中の公演か（公演日の前日まで購入可）
  function isPerfOnSale(perf) { return daysUntil(perf.date) >= 1; }
  function futurePerfs(e) { return e.perfs.filter(isPerfOnSale); }

  // ── 在庫（決定論的ハッシュ＋ローカル購入数） ──────────────
  // 文字列 → 0〜1 の決定論的な値（FNV-1a ＋ 末尾の撹拌で末尾1文字違いでも値がばらける）
  function _hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function _soldLocal(perfId, seatKey) {
    return _state.orders
      .filter(o => o.perfId === perfId && o.seatKey === seatKey && o.status === ORDER_STATUS.PURCHASED)
      .reduce((s, o) => s + o.qty, 0);
  }

  // 席種ごとの残席: { remaining, cap, mark("◎"|"△"|"×"), key("ok"|"few"|"soldout") }
  function seatAvailability(e, perf, seat) {
    const dow = new Date(perf.date + "T00:00:00").getDay();
    const r = _hash(e.id + perf.id + seat.key);
    let base;
    if (e.soldOutAll || e.soldOutSeats.includes(seat.name) || e.soldOutDow.includes(dow)) base = 0;
    else if (e.fewLeft) base = 2 + Math.floor(r * 6);
    else if (r > 0.95) base = 0;
    else if (r > 0.82) base = Math.max(3, Math.round(seat.cap * (r - 0.8) * 0.5));
    else base = Math.round(seat.cap * (0.18 + (0.82 - r) * 0.9));
    const remaining = Math.max(0, base - _soldLocal(perf.id, seat.key));
    const ratio = remaining / seat.cap;
    const key = remaining === 0 ? "soldout" : (ratio < 0.1 || remaining <= 10) ? "few" : "ok";
    return { remaining, cap: seat.cap, key, mark: { ok: "◎", few: "△", soldout: "×" }[key] };
  }

  // 公演全体の状況
  function perfAvailability(e, perf) {
    if (!isPerfOnSale(perf)) return { key: "closed", mark: "-" };
    const list = getSeats(e).map(s => seatAvailability(e, perf, s));
    if (list.every(a => a.key === "soldout")) return { key: "soldout", mark: "×" };
    if (list.every(a => a.key !== "ok")) return { key: "few", mark: "△" };
    return { key: "ok", mark: "◎" };
  }

  // イベントの販売状況
  function salesStatus(e) {
    const label = {
      before:  _t("発売前", "Coming Soon"),
      lottery: _t("抽選受付中", "Lottery Open"),
      onsale:  _t("発売中", "On Sale"),
      few:     _t("残りわずか", "Few Left"),
      soldout: _t("予定枚数終了", "Sold Out"),
      closed:  _t("受付終了", "Closed"),
    };
    const cls = { before: "badge-gray", lottery: "badge-purple", onsale: "badge-success", few: "badge-warn", soldout: "badge-danger", closed: "badge-gray" };
    const mk = key => ({ key, label: label[key], cls: cls[key] });

    if (e.salesStartOffset !== null && daysUntil(_offsetDate(e.salesStartOffset)) > 0) return mk("before");
    const fp = futurePerfs(e);
    if (fp.length === 0) return mk("closed");
    if (e.saleType === "lottery") return daysUntil(_offsetDate(e.lotteryEndOffset)) >= 0 ? mk("lottery") : mk("closed");
    const av = fp.map(pf => perfAvailability(e, pf));
    if (av.every(a => a.key === "soldout")) return mk("soldout");
    if (e.fewLeft || av.every(a => a.key !== "ok")) return mk("few");
    return mk("onsale");
  }

  function salesStartDate(e) { return e.salesStartOffset === null ? null : _offsetDate(e.salesStartOffset); }
  function lotteryEndDate(e) { return e.lotteryEndOffset === null ? null : _offsetDate(e.lotteryEndOffset); }
  function lotteryResultDate(e) { return e.lotteryResultOffset === null ? null : _offsetDate(e.lotteryResultOffset); }

  function minPrice(e) {
    const prices = getSeats(e).flatMap(s => Object.values(s.prices)).filter(v => v > 0);
    return Math.min(...prices);
  }
  function maxPrice(e) { return Math.max(...getSeats(e).flatMap(s => Object.values(s.prices))); }
  function firstDate(e) { return e.perfs[0].date; }
  function lastDate(e)  { return e.perfs[e.perfs.length - 1].date; }
  function nextDate(e)  { const f = futurePerfs(e)[0]; return f ? f.date : lastDate(e); }

  // ── 検索 ──────────────────────────────────────────────────
  // genre / sub / area / from / to / keyword / status
  function searchEvents({ genre = "all", sub = "", area = "all", from = "", to = "", keyword = "" } = {}) {
    let res = [...EVENTS];
    if (genre && genre !== "all") res = res.filter(e => e.genre === genre);
    if (sub) res = res.filter(e => e.sub === sub);
    if (area && area !== "all") res = res.filter(e => eventAreas(e).includes(area));
    if (from || to) {
      res = res.filter(e => e.perfs.some(pf => (!from || pf.date >= from) && (!to || pf.date <= to)));
    }
    if (keyword) {
      const words = keyword.toLowerCase().split(/[\s　]+/).filter(Boolean);
      res = res.filter(e => {
        const hay = [e.title, e.performer, e.desc, e.sub, genreName(e.genre), ...e.perfs.map(pf => venueName(pf.venue))].join(" ").toLowerCase();
        return words.every(w => hay.includes(w));
      });
    }
    return res;
  }

  // ── 料金計算 ──────────────────────────────────────────────
  // items: [{typeKey, price, qty}]
  function calcFees(items, receiveKey, paymentKey) {
    const qty     = items.reduce((s, i) => s + i.qty, 0);
    const paidQty = items.filter(i => i.price > 0).reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const rc = RECEIVE_METHODS.find(r => r.key === receiveKey);
    const pm = PAYMENT_METHODS.find(m => m.key === paymentKey);
    const system   = SYSTEM_FEE * paidQty;
    const issue    = rc ? rc.feePerTicket * paidQty : 0;
    const delivery = rc ? rc.feePerOrder : 0;
    const payment  = pm ? pm.fee : 0;
    return { qty, paidQty, subtotal, system, issue, delivery, payment, total: subtotal + system + issue + delivery + payment };
  }

  // ── 購入・申込 ────────────────────────────────────────────
  const ADULT_TYPES = ["adult", "adultm", "general", "student", "u25"];

  // 枚数選択時の検証（ticket-select / purchase 共通）
  function validateSelection(e, perf, seat, items, userId) {
    const qty = items.reduce((s, i) => s + i.qty, 0);
    const st = salesStatus(e);
    if (st.key === "before") return _t("このイベントはまだ発売されていません。", "Tickets for this event are not on sale yet.");
    if (st.key === "closed") return _t("このイベントの受付は終了しました。", "Sales for this event have closed.");
    if (!isPerfOnSale(perf)) return _t("この公演の受付は終了しました（購入は公演日の前日まで）。", "Sales for this performance have closed (available until the day before).");
    if (qty < 1) return _t("枚数を1枚以上選択してください。", "Please select at least 1 ticket.");
    if (qty > e.maxPerOrder) return _t(`1回のお申込みは${e.maxPerOrder}枚までです。`, `You can order up to ${e.maxPerOrder} tickets at a time.`);
    if (items.filter(i => i.qty > 0).every(i => i.price === 0)) return _t("無料券のみのお申込みはできません。", "Free tickets cannot be ordered on their own.");
    if (e.requireAdult && !items.some(i => i.qty > 0 && ADULT_TYPES.includes(i.typeKey))) {
      return _t("このイベントは子供券のみの購入はできません（大人券が1枚以上必要です）。", "Child tickets cannot be purchased without at least one adult ticket.");
    }
    if (e.saleType !== "lottery") {
      const av = seatAvailability(e, perf, seat);
      if (av.remaining === 0) return _t("選択した席種は予定枚数終了です。", "The selected seat type is sold out.");
      if (av.remaining < qty) return _t(`残席が不足しています（残り${av.remaining}枚）。`, `Not enough seats left (${av.remaining} remaining).`);
    }
    if (userId) {
      const already = _state.orders
        .filter(o => o.userId === userId && o.perfId === perf.id && o.status !== ORDER_STATUS.CANCELLED)
        .reduce((s, o) => s + o.qty, 0);
      if (e.saleType === "lottery" && already > 0) return _t("この公演には既に抽選申込済みです。", "You have already entered the lottery for this performance.");
      if (already + qty > e.maxPerOrder) {
        return _t(`同一公演の購入上限（${e.maxPerOrder}枚）を超えています。既に${already}枚購入済みです。`,
                  `This exceeds the per-performance limit (${e.maxPerOrder}). You already have ${already} ticket(s).`);
      }
    }
    return "";
  }

  function createOrder(data) {
    const u = _state.currentUser;
    if (!u) return { ok: false, msg: _t("ログインしてください。", "Please log in.") };
    const e = getEvent(data.eventId); const perf = e && getPerf(e, data.perfId); const seat = e && getSeat(e, data.seatKey);
    if (!e || !perf || !seat) return { ok: false, msg: _t("公演情報が見つかりません。", "Performance not found.") };

    const err = validateSelection(e, perf, seat, data.items, u.id);
    if (err) return { ok: false, msg: err };

    const rc = RECEIVE_METHODS.find(r => r.key === data.receive);
    if (rc && rc.minDays && daysUntil(perf.date) < rc.minDays) {
      return { ok: false, msg: _t(`配送は公演日の${rc.minDays}日前までのお申込みのみ選択できます。`, `Delivery is only available for orders ${rc.minDays}+ days before the performance.`) };
    }
    if (data.payment === "konbini" && daysUntil(perf.date) < 3) {
      return { ok: false, msg: _t("コンビニ払いは公演日の3日前までのお申込みのみ選択できます。", "Convenience store payment is only available 3+ days before the performance.") };
    }
    if (data.payment === "credit" && !u.card) {
      return { ok: false, msg: _t("登録済みのクレジットカードがありません。別の支払方法を選択してください。", "No registered credit card. Please choose another payment method.") };
    }

    const fees = calcFees(data.items, data.receive, data.payment);
    const order = _orderRecord({
      seq: _state.orders.length + 1, created: new Date(), user: u, event: e, perf, seat,
      items: data.items.filter(i => i.qty > 0), fees, receive: data.receive, payment: data.payment,
      status: e.saleType === "lottery" ? ORDER_STATUS.LOTTERY : ORDER_STATUS.PURCHASED, buyer: data.buyer,
    });
    _state.orders.push(order);
    _write(LS.ORDERS, _state.orders);
    _addNotice(_orderNotice(order, "order"));
    return { ok: true, order };
  }

  function _orderRecord({ seq, created, user, event, perf, seat, items, fees, receive, payment, status, buyer }) {
    const ymd = fmtDate(created).replace(/-/g, "");
    return {
      id: `o${created.getTime()}${seq}`,
      orderNo: `TM-${ymd}-${String(seq).padStart(5, "0")}`,
      userId: user.id, eventId: event.id, perfId: perf.id,
      eventTitle: event.title, date: perf.date, open: perf.open, start: perf.start,
      venueId: perf.venue, venueName: venueName(perf.venue),
      seatKey: seat.key, seatName: seat.name,
      items: items.map(i => ({ typeKey: i.typeKey, typeName: TICKET_TYPES[i.typeKey].name, price: i.price, qty: i.qty })),
      qty: fees.qty, subtotal: fees.subtotal, fees, total: fees.total,
      receive, payment, status, buyer,
      saleType: event.saleType, lotteryResultDate: lotteryResultDate(event),
      createdAt: created.toISOString(),
    };
  }

  function getOrders(userId) { return _state.orders.filter(o => o.userId === userId); }
  function getOrder(id) { return _state.orders.find(o => o.id === id); }

  // 表示用ステータス: purchased / attended / lottery / won / lost / cancelled
  function orderStatus(o) {
    if (o.status === ORDER_STATUS.CANCELLED) return "cancelled";
    const past = daysUntil(o.date) < 0;
    if (o.status === ORDER_STATUS.LOTTERY) {
      if (!o.lotteryResultDate || daysUntil(o.lotteryResultDate) > 0) return "lottery";
      const won = _hash(o.id) < 0.6;
      if (!won) return "lost";
      return past ? "attended" : "won";
    }
    return past ? "attended" : "purchased";
  }

  function orderStatusLabel(key) {
    return {
      purchased: _t("購入済み", "Purchased"),
      attended:  _t("観覧済み", "Attended"),
      lottery:   _t("抽選申込中", "Lottery Pending"),
      won:       _t("当選", "Won"),
      lost:      _t("落選", "Not Selected"),
      cancelled: _t("キャンセル", "Cancelled"),
    }[key] || key;
  }

  // キャンセル可否: 購入済みは公演3日前まで（キャンセル不可イベントを除く）／抽選申込は受付期間内のみ
  function canCancel(o) {
    const st = orderStatus(o);
    const e = getEvent(o.eventId);
    if (st === "purchased") return !!e && e.cancellable && daysUntil(o.date) >= 3;
    if (st === "lottery") return !!e && daysUntil(lotteryEndDate(e)) >= 0;
    return false;
  }

  function cancelOrder(orderId) {
    const o = getOrder(orderId);
    if (!o) return { ok: false, msg: _t("購入履歴が見つかりません。", "Order not found.") };
    if (!canCancel(o)) {
      const e = getEvent(o.eventId);
      if (e && !e.cancellable) return { ok: false, msg: _t("このイベントはキャンセルできません。", "This event cannot be cancelled.") };
      return { ok: false, msg: _t("キャンセル期限（公演日の3日前 23:59）を過ぎています。", "The cancellation deadline (3 days before the performance, 23:59) has passed.") };
    }
    const wasLottery = orderStatus(o) === "lottery";
    o.status = ORDER_STATUS.CANCELLED;
    o.cancelledAt = new Date().toISOString();
    _write(LS.ORDERS, _state.orders);
    _addNotice({ ..._orderNotice(o, wasLottery ? "withdraw" : "cancel"), createdAt: o.cancelledAt });
    return { ok: true };
  }

  // 電子チケットの座席表示（決定論的）
  function ticketSeats(o) {
    const list = [];
    const isFree = /自由|スタンディング|入場券|1日|券$/.test(o.seatName) && !/指定/.test(o.seatName);
    let n = 0;
    o.items.forEach(it => {
      for (let i = 0; i < it.qty; i++) {
        const r = _hash(o.id + "-" + n);
        let label;
        if (isFree) label = _t(`整理番号 ${String.fromCharCode(65 + Math.floor(r * 3))}-${String(Math.floor(r * 900) + 1 + n).padStart(3, "0")}`,
                               `Entry No. ${String.fromCharCode(65 + Math.floor(r * 3))}-${String(Math.floor(r * 900) + 1 + n).padStart(3, "0")}`);
        else {
          const floor = 1 + Math.floor(_hash(o.id) * 2), row = 1 + Math.floor(_hash(o.id + "row") * 30), col = 1 + Math.floor(_hash(o.id + "col") * 40) + n;
          label = _t(`${floor}階 ${row}列 ${col}番`, `Floor ${floor} / Row ${row} / Seat ${col}`);
        }
        list.push({ no: n + 1, typeKey: it.typeKey, typeName: it.typeName, label });
        n++;
      }
    });
    return list;
  }

  // ── お気に入り ──────────────────────────────────────────────
  function isFavorite(eventId) {
    if (!isLoggedIn()) return false;
    return _state.favorites.some(f => f.userId === _state.currentUser.id && f.eventId === eventId);
  }

  function toggleFavorite(eventId) {
    if (!requireLogin()) return false;
    const uid = _state.currentUser.id;
    const idx = _state.favorites.findIndex(f => f.userId === uid && f.eventId === eventId);
    if (idx >= 0) _state.favorites.splice(idx, 1);
    else _state.favorites.push({ userId: uid, eventId, addedAt: new Date().toISOString() });
    _write(LS.FAVORITES, _state.favorites);
    return isFavorite(eventId);
  }

  function getFavoriteEvents() {
    if (!isLoggedIn()) return [];
    const uid = _state.currentUser.id;
    const ids = _state.favorites.filter(f => f.userId === uid).map(f => f.eventId);
    return ids.map(getEvent).filter(Boolean);
  }

  // ── 閲覧履歴（最近チェックしたイベント） ───────────────────
  function addHistory(eventId) {
    const h = _read(LS.HISTORY, []).filter(id => id !== eventId);
    h.unshift(eventId);
    _write(LS.HISTORY, h.slice(0, 8));
  }
  function getHistory() { return _read(LS.HISTORY, []).map(getEvent).filter(Boolean); }
  function clearHistory() { localStorage.removeItem(LS.HISTORY); }

  // ── お知らせ ──────────────────────────────────────────────
  // 日付を [日本語, 英語] で返す（お知らせ本文は受信時に両言語で保存する）
  function _dateBoth(str) {
    const d = new Date(str + "T00:00:00");
    return [`${fmtDateSlash(str)}（${"日月火水木金土"[d.getDay()]}）`,
            `${fmtDateSlash(str)} (${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()]})`];
  }

  // 注文に関するお知らせ kind: "order"（購入完了 or 抽選申込受付）/ "cancel"（キャンセル）/ "withdraw"（抽選申込取消）
  function _orderNotice(o, kind) {
    const [dJa, dEn] = _dateBoth(o.date);
    const rc = RECEIVE_METHODS.find(r => r.key === o.receive) || { name: "-", en: "-" };
    const name = o.buyer?.name || "";
    const detailJa = `注文番号：${o.orderNo}\nイベント：${o.eventTitle}\n公演日時：${dJa} ${o.start}開演\n会場：${o.venueName}\n席種・枚数：${o.seatName} × ${o.qty}枚\n合計金額：${fmtPrice(o.total)}`;
    const detailEn = `Order No.: ${o.orderNo}\nEvent: ${o.eventTitle}\nDate: ${dEn} ${o.start}\nVenue: ${o.venueName}\nSeat / Qty: ${o.seatName} × ${o.qty}\nTotal: ${fmtPrice(o.total)}`;
    let n;
    if (kind === "withdraw") {
      n = { category: "lottery", title: `【抽選申込取消】${o.eventTitle}`, titleEn: `[Lottery Entry Withdrawn] ${o.eventTitle}`,
            body: `${name} 様\n\n以下の抽選申込の取消を受け付けました。\n\n${detailJa}`,
            bodyEn: `Dear ${name},\n\nYour lottery entry below has been withdrawn.\n\n${detailEn}` };
    } else if (kind === "cancel") {
      n = { category: "ticket", title: `【キャンセル完了】${o.eventTitle}`, titleEn: `[Order Cancelled] ${o.eventTitle}`,
            body: `${name} 様\n\n以下のご注文のキャンセルが完了しました。ご返金は支払方法に応じて順次行われます。\n\n${detailJa}`,
            bodyEn: `Dear ${name},\n\nYour order below has been cancelled. Refunds will be processed according to your payment method.\n\n${detailEn}` };
    } else if (o.saleType === "lottery") {
      const [rJa, rEn] = o.lotteryResultDate ? _dateBoth(o.lotteryResultDate) : ["-", "-"];
      n = { category: "lottery", title: `【抽選申込受付】${o.eventTitle}`, titleEn: `[Lottery Entry Received] ${o.eventTitle}`,
            body: `${name} 様\n\n抽選のお申込みを受け付けました。\n\n${detailJa}\n当落発表：${rJa}\n\n当落結果は発表日以降にマイページの「購入チケット」でご確認ください。`,
            bodyEn: `Dear ${name},\n\nWe have received your lottery entry.\n\n${detailEn}\nResults: ${rEn}\n\nCheck the result under "My Tickets" on My Page after the announcement date.` };
    } else {
      n = { category: "ticket", title: `【購入完了】${o.eventTitle}`, titleEn: `[Purchase Complete] ${o.eventTitle}`,
            body: `${name} 様\n\nチケットのご購入ありがとうございます。以下の内容で購入が完了しました。\n\n${detailJa}\n受取方法：${rc.name}\n\nチケットはマイページの「購入チケット」からご確認いただけます。`,
            bodyEn: `Dear ${name},\n\nThank you for your purchase. Your order is complete.\n\n${detailEn}\nPickup: ${rc.en}\n\nYou can view your tickets under "My Tickets" on My Page.` };
    }
    return { id: `n-${o.orderNo}-${kind}`, userId: o.userId, eventId: o.eventId, tab: "orders", createdAt: o.createdAt, read: false, ...n };
  }

  function _addNotice(n) {
    _state.notices.push({ eventId: null, tab: null, createdAt: new Date().toISOString(), read: false, ...n });
    _write(LS.NOTICES, _state.notices);
    renderHeader();
  }

  // ログイン中ユーザーのお知らせ（新しい順）
  function getNotices() {
    if (!isLoggedIn()) return [];
    return _state.notices.filter(n => n.userId === _state.currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  function getNotice(id) { return getNotices().find(n => n.id === id); }
  function unreadNoticeCount() { return getNotices().filter(n => !n.read).length; }

  function markNoticeRead(id) {
    const n = getNotice(id);
    if (!n || n.read) return;
    n.read = true;
    n.readAt = new Date().toISOString();
    _write(LS.NOTICES, _state.notices);
    renderHeader();
  }
  function markAllNoticesRead() {
    const now = new Date().toISOString();
    getNotices().filter(n => !n.read).forEach(n => { n.read = true; n.readAt = now; });
    _write(LS.NOTICES, _state.notices);
    renderHeader();
  }

  function noticeCategory(key) { return NOTICE_CATEGORIES.find(c => c.key === key) || { key, name: key, en: key, emoji: "📢", cls: "badge-gray" }; }
  function noticeTitle(n) { return _t(n.title, n.titleEn || n.title); }
  function noticeBody(n)  { return _t(n.body, n.bodyEn || n.body); }

  // ── ヘッダー描画 ──────────────────────────────────────────
  function renderHeader() {
    const navEl = document.getElementById("header-nav-dynamic");
    if (!navEl) return;
    const _u = typeof I18n !== "undefined" ? I18n.urlWith.bind(I18n) : (u => u);
    if (isLoggedIn()) {
      const u = _state.currentUser;
      const unread = unreadNoticeCount();
      navEl.innerHTML = `
        <a href="${_u("mypage.html?tab=notices")}" id="header-notices" class="header-nav btn-notices" data-unread="${unread}" title="${_t("お知らせ", "Notices")}">🔔<span class="notices-label">${_t("お知らせ", "Notices")}</span>${unread ? `<span id="header-notice-badge" class="notice-badge">${unread > 99 ? "99+" : unread}</span>` : ""}</a>
        <a href="${_u("mypage.html")}" id="header-mypage" class="header-nav btn-mypage">${_t("マイページ", "My Page")}</a>
        <button id="header-logout" onclick="App.logout()" class="header-nav">${_t("ログアウト", "Log Out")}</button>
        <div id="header-avatar" class="avatar-circle" title="${u.name}">${u.name.charAt(0)}</div>`;
    } else {
      navEl.innerHTML = `
        <a href="${_u("login.html")}" id="header-login" class="header-nav">${_t("ログイン", "Log In")}</a>
        <a href="${_u("register.html")}" id="header-register" class="header-nav btn-register">${_t("会員登録", "Register")}</a>`;
    }
  }

  // ── ログインモーダル ──────────────────────────────────────
  function showLoginModal(onSuccess) {
    const _u = typeof I18n !== "undefined" ? I18n.urlWith.bind(I18n) : (u => u);
    document.getElementById("login-modal")?.remove();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "login-modal";
    overlay.innerHTML = `
      <div class="modal-box">
        <button class="modal-close" id="login-modal-close" onclick="document.getElementById('login-modal').remove()">✕</button>
        <div class="modal-title">🔐 ${_t("ログインが必要です", "Login Required")}</div>
        <p style="font-size:13px;color:var(--gray);margin-bottom:18px;">${_t("この操作にはログインが必要です。", "You need to be logged in to do this.")}</p>
        <div class="form-group mb-16">
          <label for="modal-email">${_t("メールアドレス", "Email")}</label>
          <input type="email" id="modal-email" placeholder="user@example.com" />
        </div>
        <div class="form-group mb-16">
          <label for="modal-pw">${_t("パスワード", "Password")}</label>
          <input type="password" id="modal-pw" placeholder="${_t("パスワード", "Password")}" onkeydown="if(event.key==='Enter')App.loginFromModal()" />
        </div>
        <div id="modal-err" class="alert alert-danger hidden" style="margin-bottom:12px;"></div>
        <button class="btn btn-primary" id="btn-modal-login" style="width:100%;justify-content:center" onclick="App.loginFromModal()">${_t("ログイン", "Log In")}</button>
        <p style="text-align:center;margin-top:12px;font-size:13px;">
          ${_t("アカウントをお持ちでない方は", "New here?")} <a id="modal-register-link" href="${_u("register.html")}">${_t("会員登録", "Sign Up")}</a>
        </p>
      </div>`;
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    document.getElementById("modal-email").focus();
    window._loginModalCallback = onSuccess;
  }

  function loginFromModal() {
    const email = document.getElementById("modal-email").value.trim();
    const pw    = document.getElementById("modal-pw").value;
    const errEl = document.getElementById("modal-err");
    const res = login(email, pw);
    if (!res.ok) { errEl.textContent = res.msg; errEl.classList.remove("hidden"); return; }
    document.getElementById("login-modal")?.remove();
    showToast(_t("ログインしました。", "Logged in successfully."), "success");
    if (typeof window._loginModalCallback === "function") {
      window._loginModalCallback(res.user);
    } else {
      const redir = sessionStorage.getItem("tm_redirect_after_login");
      sessionStorage.removeItem("tm_redirect_after_login");
      if (redir) window.location.href = redir; else window.location.reload();
    }
  }

  // ── ユーティリティ ────────────────────────────────────────
  function fmtDate(d) {
    const dt = d instanceof Date ? d : new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  }
  function fmtDateSlash(str) { return str ? str.replace(/-/g, "/") : ""; }

  // yyyy/mm/dd（曜）
  function fmtDateDow(str) {
    if (!str) return "";
    const d = new Date(str + "T00:00:00");
    return `${fmtDateSlash(str)}（${dowName(d.getDay())}）`;
  }

  function fmtDateJP(str) {
    if (!str) return "";
    const d = new Date(str + "T00:00:00");
    if (typeof I18n !== "undefined" && I18n.isEN()) {
      const M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return `${M[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} (${dowName(d.getDay())})`;
    }
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${dowName(d.getDay())}）`;
  }

  // 期間表示（同日なら1日のみ）
  function fmtPeriod(e) {
    const a = firstDate(e), b = lastDate(e);
    return a === b ? fmtDateDow(a) : `${fmtDateDow(a)} 〜 ${fmtDateDow(b)}`;
  }

  // テキスト入力 yyyy/mm/dd or yyyy-mm-dd → yyyy-mm-dd
  function parseDateStr(str) {
    if (!str) return "";
    const clean = str.replace(/[\/\-]/g, "");
    if (!/^\d{8}$/.test(clean)) return "";
    const y = clean.slice(0, 4), m = clean.slice(4, 6), d = clean.slice(6, 8);
    const dt = new Date(`${y}-${m}-${d}T00:00:00`);
    if (isNaN(dt.getTime()) || dt.getMonth() + 1 !== +m) return "";
    return `${y}-${m}-${d}`;
  }

  function dowName(n) {
    if (typeof I18n !== "undefined" && I18n.isEN()) return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][n];
    return ["日","月","火","水","木","金","土"][n];
  }

  function fmtPrice(n) { return "¥" + Number(n).toLocaleString(); }

  // ID用に名前を変換（空白→_）
  function idSafe(name) { return String(name).replace(/[\s　]/g, "_"); }

  function genreColor(id) { return getGenre(id)?.color || "#475569"; }
  function genreEmoji(id) { return getGenre(id)?.emoji || "🎫"; }

  function showLoading(msg) {
    if (document.getElementById("loading-overlay")) return;
    const el = document.createElement("div");
    el.id = "loading-overlay";
    el.innerHTML = `
      <div class="spinner" style="width:48px;height:48px;border-width:4px"></div>
      <div id="loading-message" style="font-size:15px;font-weight:600;color:var(--primary)">${msg || _t("読み込み中...", "Loading...")}</div>`;
    document.body.appendChild(el);
  }
  function hideLoading() { document.getElementById("loading-overlay")?.remove(); }
  // ローディング演出の待ち時間（ms）。既定は3〜5秒
  function loadingDelay(min = 3000, max = 5000) { return min + Math.random() * (max - min); }

  function showToast(msg, type = "info") {
    let c = document.getElementById("toast-container");
    if (!c) { c = document.createElement("div"); c.id = "toast-container"; document.body.appendChild(c); }
    const t = document.createElement("div");
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transition = ".4s"; setTimeout(() => t.remove(), 400); }, 3000);
  }

  // 検索条件・カート保存（localStorageでウィンドウ間共有）
  function saveSearchParams(p) { _state.searchParams = p; _write(LS.SEARCH, p); }
  function loadSearchParams() { _state.searchParams = _read(LS.SEARCH, {}) || {}; return _state.searchParams; }
  function saveCart(c) { _write(LS.CART, c); }
  function loadCart() { return _read(LS.CART, null); }
  function clearCart() { localStorage.removeItem(LS.CART); }

  // ── 公開API ──────────────────────────────────────────────
  return {
    init, login, logout, loginFromModal, isLoggedIn, currentUser, requireLogin, showLoginModal,
    register, updateProfile,
    getEvent, getVenue, getGenre, getArea, getPerf, getSeats, getSeat, getTypes,
    genreName, subName, areaName, typeName, venueName, eventAreas,
    today, todayStr, daysUntil, offsetDate, isPerfOnSale, futurePerfs,
    seatAvailability, perfAvailability, salesStatus, salesStartDate, lotteryEndDate, lotteryResultDate,
    minPrice, maxPrice, firstDate, lastDate, nextDate,
    searchEvents, calcFees, validateSelection, createOrder,
    getOrders, getOrder, orderStatus, orderStatusLabel, canCancel, cancelOrder, ticketSeats,
    isFavorite, toggleFavorite, getFavoriteEvents,
    getNotices, getNotice, unreadNoticeCount, markNoticeRead, markAllNoticesRead,
    noticeCategory, noticeTitle, noticeBody,
    addHistory, getHistory, clearHistory,
    fmtDate, fmtDateSlash, fmtDateDow, fmtDateJP, fmtPeriod, parseDateStr, dowName, fmtPrice, idSafe,
    genreColor, genreEmoji,
    showLoading, hideLoading, loadingDelay, showToast,
    saveSearchParams, loadSearchParams, saveCart, loadCart, clearCart,
    renderHeader,
  };
})();

// DOM準備後に初期化
document.addEventListener("DOMContentLoaded", () => App.init());
