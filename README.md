# 🎫 TicketMarket Demo

> **⚠️ デモサイト**：このリポジトリは株式会社バルテスのシステムテスト・デモンストレーション目的で作成された架空のチケット販売サービスです。掲載されているイベント・出演者・団体・会場・料金はすべてフィクションであり、実際の購入・決済・個人情報の登録は行われません。

🌐 **デモサイト**: https://valtes-rd.github.io/tdash-eva-202702/

📦 **リポジトリ**: https://github.com/valtes-rd/tdash-eva-202702（旧: SadaakiEmuraValtes/ticket-market）

スポーツ／コンサート／イベント／即売会／演劇・舞台のチケットを検索・購入できるデモサイトです。
[Demo-Travel](https://github.com/SadaakiEmuraValtes/Demo-Travel) と同じ実装方針（Vanilla JS・ビルド不要・テスト自動化しやすいID設計・`?lang=en` 英語対応）で作られています。

---

## 🚀 起動方法

```bash
python -m http.server 8080   # または npx serve .
```

ブラウザで `http://localhost:8080` を開いてください（`file://` では localStorage が制限される場合があります）。

---

## 🧪 テストアカウント

| 名前 | メールアドレス | パスワード | カード | 特徴 | 新着お知らせ |
|------|--------------|-----------|--------|------|------|
| 山田 太郎 | yamada.taro@demo.ticket | `Tk#Yamada2026!` | 4980 | 標準（購入履歴・お気に入りあり） | **3件** |
| 鈴木 花子 | suzuki.hanako@demo.ticket | `H@nako$Live77` | 1234 | 抽選申込中の履歴あり | **2件** |
| 田中 健一 | tanaka.kenichi@demo.ticket | `K3n!Stadium88` | 5678 | 観覧済み・キャンセル履歴あり | なし（全9件既読・モーダル非表示） |
| 佐藤 美咲 | sato.misaki@demo.ticket | `M!saki#Comic25` | 未登録 | クレジットカード払い不可の検証用 | **1件** |
| 中村 龍也 | nakamura.ryuya@demo.ticket | `Ryu@Stage2026$` | 9012 | 購入履歴なし（新規購入テスト用） | なし（お知らせ0件・空状態） |

---

## 🎫 バルテスシリーズ（テスト用イベント）

| ID | イベント | テスト条件 |
|----|---------|-----------|
| e001 | バルテス・スターズ 秋季交流戦 | 土日開催は全席完売（平日のみ購入可） |
| e002 | バルテス・ドリームライブ 2026 | VIP席が全公演完売 |
| e003 | バルテス・テックエキスポ 2026 | 発売前（購入ボタン無効） |
| e004 | バルテス・コミックフェスタ 12 | 抽選販売・1申込2枚まで・子供券のみ不可 |
| e005 | バルテス・ミュージカル「テストの国のアリス」 | 1申込2枚まで・キャンセル不可 |
| e006 | バルテス・ファミリーフェス | 子供券のみ購入不可・最大8枚 |
| e007 | バルテス・ラストステージ「千秋楽」 | 全公演完売 |
| e008 | バルテス・ロックナイト vol.8 | 全席種残りわずか（2〜7枚） |

**公演日は固定の基準日 2027/03/28（日）から生成**します（`data/master.js` の `BASE_DATE`）。テストデータの期限を **2027年3月末以降** にするため、日付は週ごとに進みません。

- 通常のイベントは最終公演日がすべて **2027/03/31 以降**、1日だけの公演も **2027/03/31 以降**（最も早い公演は e501 の 2027/03/23）
- 受付終了（`closed`）のテスト用イベント10件だけは過去（2026年9〜10月）に固定。状態は変わりません
- 発売前 `e003`（一般発売 2027/04/07）・抽選受付中 `e004`（〜2027/04/11）`e205`（〜2027/04/06）も3月末まで状態が変わりません
- サンプル購入履歴の購入日・お知らせの受信日は「今日」基準です

### 🎏 GW特集（2027/04/29〜05/05）

トップの特集は **GW 2027**（`GW_FROM` / `GW_TO`）。GW期間に公演があるイベント41件のうち、GW限定（`tags: "GW"`、カードに「GW限定」バッジ）6件を先頭に人気順で12件表示します。検索画面の「🎏 GW 2027」（`#quick-gw`）でも絞り込めます。

| ID | イベント | 公演日 |
|----|---------|-------|
| e910 | GWこどもまつり 2027 | 4/29・5/3・5/4・5/5（子供券のみ不可） |
| e911 | GOLDEN WEEK SPECIAL LIVE 2027 | 5/3・5/4 |
| e912 | 湾岸シーガルズ GW3連戦 | 5/3・5/4・5/5 |
| e913 | ゴールデンウィーク 恐竜博 2027 | 4/29〜5/5 毎日 |
| e914 | GWハンドメイドマルシェ | 5/1・5/2 |
| e915 | GW親子ミュージカル「こいのぼりの空」 | 5/3〜5/5（11:00／15:00） |

### ♾ 常設イベント（期限なし）

終了日のない定期公演です。TOPの GW特集の下（`#section-permanent`）に人気順で全件表示します。公演は **「今日」の8週前〜120日後** を毎回生成するため、いつ開いても購入できます（カードに「常設」バッジ、期間は「常設：毎週土・日 13:00／17:00」のように表示）。公演IDは日付ベース（例 `e901-20261121-1300`）。

| ID | イベント | 開催 |
|----|---------|------|
| e901 | 週末お笑いライブ「バルテス寄席」 | 毎週土・日 13:00／17:00 |
| e902 | 漫才ナイト 金曜定期公演 | 毎週金曜 19:30 |
| e903 | 常設展「テスト自動化ミュージアム」 | 毎日 10:00（月曜休館） |
| e904 | デジタルアートミュージアム「ひかりの森」 | 毎日 10:00 |
| e905 | 毎月第1日曜 古本・レコード市 | 毎月第1日曜 11:00 |

検索の「今日」「今週末」などで常設イベントがヒットします。u003（田中）には常設 e901 の**観覧済み**の購入履歴（直近の過去公演）があります。

### 📦 一般イベント（自動生成・200件）

ページャー確認用に、各ジャンル約40件の架空イベントを `data/master.js` の `_GEN_SPECS` から固定シードの LCG で生成しています（毎回同じ内容）。
ID は `e{ジャンル番号}{50〜89}`（例: スポーツ `e150`〜`e189`、演劇・舞台 `e550`〜`e589`）。すべて一般発売で、約8%は受付終了（2026年9〜10月）・約5%は完売・約8%は残りわずか。
人気度は低め（3〜20）に設定しているため、トップのランキング・抽選/発売予定は既存イベントのままです。
「すべてのジャンル」検索は **261件 = 14ページ**（自動生成200＋手書き50＋常設5＋GW6）、ジャンル別は約50件 = 3ページ。
在庫（残席）はイベントID＋公演ID＋席種を種にした決定論的ハッシュで生成し、購入分を差し引いて表示します。

---

## 📁 ファイル構成

```
ticket-market/
├── index.html          # トップ（ジャンル×エリア×日付検索・ジャンル・GW特集・常設イベント・ランキング・抽選/発売予定・閲覧履歴）
├── search.html         # イベント検索（3モード: ジャンル・日付 / ジャンル / キーワード、20件ずつのページャー）
├── event.html          # イベント詳細（別ウィンドウ・公演一覧・席種料金表・注意事項・お気に入り）
├── schedule-frame.html # 公演カレンダー（event.html 内 iframe・日付クリックで公演選択へ）
├── ticket-select.html  # チケット選択（公演 → 空席確認 → 席種 → 券種ごとの枚数）
├── purchase.html       # 購入手続き（購入者情報・受取方法・支払方法・同意 → 確認 → 完了）
├── login.html / register.html
├── mypage.html         # マイページ（ユーザー情報・購入チケット・お気に入り・お知らせ）
├── help.html           # ヘルプ（テストアカウント・テストイベント・ルール・手数料・FAQ・データ初期化）
├── css/style.css
├── js/app.js           # アプリコア（認証・在庫/販売状況・料金計算・購入・キャンセル・お気に入り）
├── js/layout.js        # ヘッダー・フッター・免責・カレンダー・イベントカード・お知らせモーダル（NoticeUI）
├── js/i18n.js          # 多言語（?lang=en）
└── data/master.js      # マスタ（ユーザー5・ジャンル5・会場19・イベント261（うち200件は自動生成・常設5・GW限定6）・席種テンプレート・サンプル購入履歴・サンプルお知らせ）
```

---

## ✨ 主要機能

| 機能 | 説明 |
|------|------|
| 🔍 イベント検索 | ①ジャンル・エリア・開催日（今日/明日/今週末/来週末/30日以内/GW 2027 のクイック指定あり） ②ジャンル＋サブジャンル ③キーワード（スペース区切りAND） |
| 🧮 絞り込み・並び替え | 販売状況（発売中/抽選/発売前/完売）、開催日・料金・人気順、グリッド/リスト切替 |
| 📄 ページャー | 検索結果は20件ずつ表示。« ‹前へ 1 … 4 5 6 … 13 次へ› » 形式（スマホ幅は前後1ページ・«»非表示）。URL `?page=N` で指定ページを直接表示 |
| 🎫 イベント詳細 | 公演カレンダー（iframe）・公演ごとの空席（◎/△/×）・席種×券種の料金表・注意事項 |
| 🪑 チケット選択 | 公演選択 → 空席確認 → 席種（残席表示）→ 券種（大人/子供/学生/U-25 等、イベントにより異なる）ごとの枚数 |
| 💳 購入手続き | 受取方法（電子チケット/コンビニ発券/配送）・支払方法（クレジット/コンビニ払い/QR）・手数料自動計算・同意チェック |
| 🎲 抽選販売 | 抽選申込 → 当落発表日以降にマイページで当選/落選表示 |
| 👤 マイページ | ユーザー情報の表示・編集（カード登録含む）、購入チケット（ステータス絞込・詳細・電子チケットQR表示・キャンセル）、お気に入り |
| 🔔 お知らせ | ヘッダー「🔔 お知らせ」（未読数バッジ）／マイページ「お知らせ」タブ。カテゴリ（キャンペーン/チケット/抽選/サービス）・未読で絞り込み、すべて既読。お知らせ画面を開いたときに未読があれば新着モーダルを表示し、「見る」で開封（既読化） |
| ❤️ お気に入り / 👀 閲覧履歴 | お気に入り登録（ログイン必須）、最近チェックしたイベント（トップに表示） |
| ⏳ Loading演出 | ログインで0.5〜1.5秒、検索・空席確認・購入確定・会員登録で3〜5秒のオーバーレイ（操作ロック） |
| 🕒 ヘッダー日時 | ヘッダー右端に現在の年月日・時分（1分ごと更新）と天気マーク（ランダム・デモ用）。スマホ幅は時刻と天気のみ |
| 🧩 会員登録の入力部品 | お住まいの地域（地方→都道府県のカスタムドリルダウン・必須）、職業・役職（12職業×役職のカスタムアコーディオン・必須）、興味のあるジャンル（カスタムチェックボックス・複数）、メルマガ（トグルスイッチ）、規約同意（カスタムチェックボックス）。自動化の難易度を上げるため標準の select / checkbox をそのまま操作できない作り |
| 📮 郵便番号サジェスト | 会員登録で郵便番号を3桁以上入力すると「住所を検索中…」→ **1〜2秒後**に前方一致の候補（最大10件）を表示。選ぶと郵便番号（ハイフン付き）・住所・お住まいの地域を自動入力。データは日本郵便の郵便番号データ（2026/10/23版・12万721件）を `data/zip/` に内部保持（外部APIは使わない） |
| 🏆 人気ランキング | TOPの人気ランキングは上位3位が表示のたびにランダムに入れ替わる（4〜10位は人気順で固定） |
| 🌐 英語表示 | `?lang=en` または ヘッダーの EN ボタン |

---

## ⚙️ ビジネスルール

1. 検索・詳細閲覧はゲストでも利用可能。購入・抽選申込・お気に入りはログイン必須（未ログイン時はログインモーダル）
2. 購入は**公演日の前日まで**（当日・過去の公演は受付終了）
3. 1申込あたりの枚数上限（イベントごと、既定4枚）。**同一公演の累計**も同じ上限
4. 無料券のみの申込不可。`requireAdult` のイベントは大人券が1枚以上必要
5. 抽選は同一公演への重複申込不可
6. 配送は公演10日前まで、コンビニ払いは公演3日前まで選択可。クレジットはカード登録済み会員のみ
7. キャンセルは**公演日の3日前 23:59 まで**（キャンセル不可イベントを除く）。抽選申込は受付期間中のみ取消可
8. 手数料：システム利用料 ¥330/枚（有料券）、コンビニ発券 ¥110/枚、配送 ¥880/件、コンビニ払い ¥220
9. お知らせはユーザーごとに受信・既読状態を保持。購入完了・抽選申込受付・キャンセル・抽選申込取消・会員登録時に自動で届く（未読）
10. 新着モーダルは**お知らせ画面（ヘッダー「🔔 お知らせ」／マイページ「お知らせ」タブ）を開いたとき**、未読があれば表示。他の画面ではヘッダーのバッジで未読数を通知
11. 会員登録の必須項目は 氏名・メールアドレス・パスワード（確認）・お住まいの地域・職業・規約同意。**フリガナ・電話番号・生年月日・郵便番号・住所は任意**（入力した場合のみ形式チェック。生年月日は13歳以上）

---

## 🤖 テスト自動化向けセレクタ方針

Demo-Travel と同様、XPath/CSS で安定して要素を特定できるよう ID と `data-*` 属性を付与しています。

| 対象 | セレクタ例 |
|------|-----------|
| 一覧カードのボタン（イベント名ベース、空白は `_`） | `#btn-detail-バルテス・ドリームライブ_2026` / `#btn-buy-湾岸シーガルズ_ホームゲーム` |
| 同一ページ内で重複する場合の接頭辞 | トップ: `gw-`（GW特集）/ `perm-`（常設イベント）/ `history-`、お気に入り: `fav-`（例 `#fav-btn-fav-remove-…`） |
| カード | `.event-card[data-event-id="e001"][data-sales-status="soldout"]` |
| お気に入り（状態別ID） | `#btn-fav-off`（未登録）/ `#btn-fav-on`（登録済み） |
| 公演行・選択ボタン | `#perf-list tr[data-date="…"][data-availability="ok"]` / `#btn-perf-e101-p01` |
| 公演カレンダー（iframe） | `#schedule-iframe` 内 `#sf-day-YYYY-MM-DD`, `#sf-prev`, `#sf-next` |
| 席種ラジオ（席種名ベース） | `#seat-S指定席` / `#seat-list tr[data-seat-name="S指定席"][data-remaining]` |
| 券種ごとの枚数 | `#qty-adult` / `#qty-child` / `#qty-general` …（キーは `TICKET_TYPES`） |
| 受取・支払方法 | `#receive-eticket` / `#receive-konbini` / `#receive-delivery`、`#payment-credit` / `#payment-konbini` / `#payment-qr` |
| 料金サマリー | `#fee-subtotal` `#fee-system` `#fee-issue` `#fee-delivery` `#fee-payment` `#fee-total` |
| 確認画面の各値 | `#confirm-event` `#confirm-date` `#confirm-seat` `#confirm-tickets` … `#confirm-total` |
| 完了画面の各値 | `#complete-no` `#complete-event` `#complete-total` `#complete-status` … |
| 購入履歴（注文番号ベース） | `tr[data-order-no="TM-…"][data-order-status="purchased"]`、`#btn-ticket-TM-…` / `#btn-cancel-TM-…` / `#btn-order-detail-TM-…` |
| ユーザー情報 | `#profile-name` `#profile-email` … / 編集 `#pf-name` … `#btn-save-profile` |
| ヘッダーの日時・天気 | `#header-datetime[data-value="yyyy-mm-ddTHH:MM"]`（表示は「2026年11月13日 / 14:05」、1分ごとに更新）/ `#header-weather[data-weather]`（sunny / partly / cloudy / rainy / thunder / snowy。ページ表示ごとにランダム） |
| お知らせ（ヘッダー） | `#header-notices[data-unread="3"]` / 未読バッジ `#header-notice-badge`（未読0件のときは要素なし） |
| 新着モーダル | `#notice-popup[data-count]` / `#notice-popup-count` / 各行 `.notice-popup-item[data-notice-id]` / 見る `#btn-notice-view-{お知らせID}`（`.btn-notice-view`） / `#btn-notice-popup-later` |
| お知らせ詳細モーダル | `#notice-detail[data-notice-id]` / `#notice-detail-title` `#notice-detail-body` `#notice-detail-date` / `#btn-notice-back`（新着一覧へ） / `#btn-notice-detail-close` / `#btn-notice-event` / `#btn-notice-tab` |
| お知らせ一覧（マイページ） | `#tab-notices` / `#tab-notice-badge` / `#count-notices` / `#notice-filter-all\|unread\|campaign\|ticket\|lottery\|info` / `.notice-item[data-notice-id][data-read="false"][data-category]` / `#btn-notice-read-all` / 空 `#no-notices` |
| ページャー（下部 / 上部） | `#pager[data-current][data-total]` / `#pager-prev` `#pager-next` `#pager-first` `#pager-last` / `#pager-page-3`（`.pager-page[data-page="3"]`、現在ページは `.active`）。上部は `#pager-top` 内で接頭辞 `pager-top-`（例 `#pager-top-next`） |
| 表示範囲 | `#result-range`（例「261件中 21〜40件を表示」）/ `#result-count` / `#event-results[data-page]` |
| 会員登録：カスタムチェックボックス | [Qiita記事](https://qiita.com/emurin/items/bfc985c35f215f4a48d2) と同じ難易度。`<input type="checkbox">` は DOM 上にあるが **opacity:0** で透明、見た目の四角（`.cc-box`）がクリックを受ける。`Element Should Be Visible` / `is_displayed()` は false（表示待ちするツールは「Not visible」）、通常クリックは `element click intercepted`、Playwright の `check()` はタイムアウト。**ActionChains**（Robot Framework: `Click Element  id:r-agree  action_chain=True`）なら操作でき、検証は `Checkbox Should Be Selected  id:r-agree`。対象: `#r-agree` / `#r-interest-{ジャンルID}` / `#r-newsletter`（ラベル `#…-label` の `data-checked` でも確認可）。サンプル: `samples/register_checkbox.robot` |
| 会員登録：カスタムドロップダウン | `<select>` ではない。トリガー `#dd-region-trigger` / `#dd-occupation-trigger`（`aria-expanded`）をクリック → 約0.3秒「読み込み中…」の後に選択肢を描画。お住まいの地域は **地方 → 都道府県のドリルダウン**：`#dd-region-group-kanto` → `#dd-region-opt-東京都`（戻る `#dd-region-back`）。職業・役職は**アコーディオン**：職業の見出し `#dd-occupation-group-engineer`（`aria-expanded`）を押すとその下に役職 `#dd-occupation-sub-engineer` が開き（閉じている役職は非表示でクリック不可、開くのは1つずつ）、役職 `#dd-occupation-opt-engineer-qa` を選ぶ。値は `職業key/役職key`（例 `engineer/qa`）。**スクロール追加読み込み**：職業は最初6件、パネル `#dd-occupation-panel` を下までスクロールすると「読み込み中…」（`#dd-occupation-loading-more`、約0.6秒）のあと3件ずつ追加。役職は最初4件、開いた役職一覧 `#dd-occupation-sub-{職業key}` を下までスクロールすると2件ずつ追加（`#dd-occupation-sub-{職業key}-loading`）。読み込み済み件数は `data-loaded` / 全件数は `data-total`（`#dd-occupation-list` と各役職一覧）。選択済みで開き直すと、その職業・役職まで読み込まれた状態で開く。職業パネルの上端・下端にはスクロール補助ボタン **▲ `#dd-occupation-scroll-up` ／ ▼ `#dd-occupation-scroll-down`**（1回で約3件分スクロール）。一番上では▲、一番下では▼が非表示（`visibility:hidden`、`data-visible="false"`）。▼で下端まで送ると続きが読み込まれ、候補が増えると▼が再表示される。職業と役職の一覧は `data/master.js` の `OCCUPATIONS`。選択値は hidden の `#r-pref` / `#r-occupation` とトリガーの `data-value` |
| 会員登録：郵便番号サジェスト | 入力 `#r-postal`（4桁目以降は自動でハイフン）→ `#postal-suggest[data-state="loading"]`（`#postal-suggest-loading`）→ 1〜2秒後 `data-state="ready"`・`data-count`（候補総数）。候補 `#postal-suggest-item-{n}`（`data-zip` / `data-address` / `data-pref`）、ほかの件数 `#postal-suggest-more`、該当なし `data-state="empty"`（`#postal-suggest-empty`）。選択後 `#r-address` と `#r-pref`（お住まいの地域）に自動入力 |
| ローディング | `#loading-overlay`（消えるまで待機） |

`<option>` / 行要素の `data-availability` は `ok`（◎）/ `few`（△）/ `soldout`（×）/ `closed`（受付終了）。

---

## 💾 データ保存（localStorage）

`tm_user`（セッション）/ `tm_users`（会員）/ `tm_orders`（購入履歴）/ `tm_favorites` / `tm_search` / `tm_cart` / `tm_history` / `tm_notices`（お知らせ・既読状態）
ヘルプ画面下部の「データを初期化する」で初期状態に戻せます。

---

## 📝 免責事項

本デモサイトは株式会社バルテスの内部デモ・テスト目的のみに使用されます。
掲載されているすべてのイベント名・出演者・団体名・会場名・料金・座席情報は架空のフィクションであり、実在の人物・団体・施設とは一切関係ありません。


---

## 📮 郵便番号データ

`data/zip/{郵便番号の上3桁}.json`（948ファイル・約6MB）に、日本郵便「住所の郵便番号（1レコード1行、UTF-8形式）」（2026/10/23版）から作った郵便番号→住所の対応を持っています（`data/zip/meta.json` に版と件数）。必要な上3桁のファイルだけを読み込みます（HTTP配信が必要）。
町域名は住所入力用に整形しています（「以下に掲載がない場合」等は空、（…）の注記は除去）。郵便番号データは日本郵便株式会社が著作権を主張しておらず自由に配布できます。

更新する場合は、日本郵便のサイトから `utf_ken_all.zip` をダウンロードして次を実行します。

```bash
python tools/build-zipdata.py utf_ken_all.zip 2026-10-23   # 2番目の引数はデータの年月日
```
