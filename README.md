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

**公演日は「今週の日曜日」を基準に自動生成**します（`data/master.js` の `BASE_DATE`）。曜日は常に固定で、日付は週ごとに進みます。

### 📦 一般イベント（自動生成・200件）

ページャー確認用に、各ジャンル約40件の架空イベントを `data/master.js` の `_GEN_SPECS` から固定シードの LCG で生成しています（毎回同じ内容）。
ID は `e{ジャンル番号}{50〜89}`（例: スポーツ `e150`〜`e189`、演劇・舞台 `e550`〜`e589`）。すべて一般発売で、約1割は受付終了・約5%は完売・約8%は残りわずか。
人気度は低め（3〜20）に設定しているため、トップのランキング・抽選/発売予定は既存イベントのままです。
「すべてのジャンル」検索は **250件 = 13ページ**、ジャンル別は約50件 = 3ページ。
在庫（残席）はイベントID＋公演ID＋席種を種にした決定論的ハッシュで生成し、購入分を差し引いて表示します。

---

## 📁 ファイル構成

```
ticket-market/
├── index.html          # トップ（ジャンル×エリア×日付検索・ジャンル・今週末・ランキング・抽選/発売予定・閲覧履歴）
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
└── data/master.js      # マスタ（ユーザー5・ジャンル5・会場19・イベント250（うち200件は自動生成）・席種テンプレート・サンプル購入履歴・サンプルお知らせ）
```

---

## ✨ 主要機能

| 機能 | 説明 |
|------|------|
| 🔍 イベント検索 | ①ジャンル・エリア・開催日（今日/明日/今週末/来週末/30日以内のクイック指定あり） ②ジャンル＋サブジャンル ③キーワード（スペース区切りAND） |
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
| 🧩 会員登録の入力部品 | お住まいの地域（地方→都道府県のカスタムドリルダウン・必須）、職業（カスタムドロップダウン・必須）、興味のあるジャンル（カスタムチェックボックス・複数）、メルマガ（トグルスイッチ）、規約同意（カスタムチェックボックス）。自動化の難易度を上げるため標準の select / checkbox をそのまま操作できない作り |
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

---

## 🤖 テスト自動化向けセレクタ方針

Demo-Travel と同様、XPath/CSS で安定して要素を特定できるよう ID と `data-*` 属性を付与しています。

| 対象 | セレクタ例 |
|------|-----------|
| 一覧カードのボタン（イベント名ベース、空白は `_`） | `#btn-detail-バルテス・ドリームライブ_2026` / `#btn-buy-湾岸シーガルズ_ホームゲーム` |
| 同一ページ内で重複する場合の接頭辞 | トップ: `weekend-` / `history-`、お気に入り: `fav-`（例 `#fav-btn-fav-remove-…`） |
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
| 表示範囲 | `#result-range`（例「250件中 21〜40件を表示」）/ `#result-count` / `#event-results[data-page]` |
| 会員登録：カスタムチェックボックス | `<input type="checkbox">` は **opacity:0・pointer-events:none** で隠しているため直接クリック不可（Playwright の `check('#r-agree')` はタイムアウト、Selenium は not interactable）。ラベル `#r-agree-label` / `#r-interest-{ジャンルID}-label` / `#r-newsletter-label` をクリックする。状態は `input.checked` またはラベルの `data-checked="true|false"` |
| 会員登録：カスタムドロップダウン | `<select>` ではない。トリガー `#dd-region-trigger` / `#dd-occupation-trigger`（`aria-expanded`）をクリック → 約0.3秒「読み込み中…」の後に選択肢を描画。お住まいの地域は **地方 → 都道府県のドリルダウン**：`#dd-region-group-kanto` → `#dd-region-opt-東京都`（戻る `#dd-region-back`）。職業は `#dd-occupation-opt-student` 等。選択値は hidden の `#r-pref` / `#r-occupation` とトリガーの `data-value` |
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
