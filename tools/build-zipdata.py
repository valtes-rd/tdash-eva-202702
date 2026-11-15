"""
郵便番号 → 住所 の内部データを作る（外部APIは使わない）
  python tools/build-zipdata.py <utf_ken_all.zip のパス> <データ年月日 yyyy-mm-dd>

入力: 日本郵便「住所の郵便番号（1レコード1行、UTF-8形式）」utf_ken_all.zip
      https://www.post.japanpost.jp/zipcode/dl/utf-zip.html
      ※ 郵便番号データは日本郵便株式会社が著作権を主張しておらず、自由に配布できます
出力: data/zip/{上3桁}.json … {"p":[都道府県...],"c":[市区町村...],"a":{"1000001":[[都道府県idx,市区町村idx,"町域"],...]}}
      data/zip/meta.json      … データ年月日・件数
町域名は住所入力用に整形する（「以下に掲載がない場合」「〇〇の次に番地がくる場合」「〇〇一円」は空、（…）の注記は除去、分割行は結合）
"""
import csv, io, json, os, re, sys, zipfile

src, date = sys.argv[1], sys.argv[2]
root = os.path.join(os.path.dirname(__file__), "..", "data", "zip")
os.makedirs(root, exist_ok=True)
for f in os.listdir(root):
    if f.endswith(".json"):
        os.remove(os.path.join(root, f))

text = zipfile.ZipFile(src).read("utf_ken_all.csv").decode("utf-8")
rows = list(csv.reader(io.StringIO(text)))

# 町域名が複数行に分割されているレコードを結合（「（」が閉じていない行に続く行を連結）
merged, buf = [], None
for r in rows:
    zipc, pref, city, town = r[2], r[6], r[7], r[8]
    if buf:
        buf[3] += town
        if "）" in town:
            merged.append(buf); buf = None
        continue
    if "（" in town and "）" not in town:
        buf = [zipc, pref, city, town]
        continue
    merged.append([zipc, pref, city, town])
if buf:
    merged.append(buf)

def clean(town):
    if town == "以下に掲載がない場合" or town.endswith("の次に番地がくる場合") or (town.endswith("一円") and len(town) > 2):
        return ""
    return re.sub(r"（.*?）", "", town).strip()

shards = {}
for zipc, pref, city, town in merged:
    s = shards.setdefault(zipc[:3], {"p": [], "c": [], "a": {}})
    if pref not in s["p"]: s["p"].append(pref)
    if city not in s["c"]: s["c"].append(city)
    rec = [s["p"].index(pref), s["c"].index(city), clean(town)]
    lst = s["a"].setdefault(zipc, [])
    if rec not in lst: lst.append(rec)

total = 0
for k, s in shards.items():
    total += len(s["a"])
    with open(os.path.join(root, k + ".json"), "w", encoding="utf-8") as f:
        json.dump(s, f, ensure_ascii=False, separators=(",", ":"))
with open(os.path.join(root, "meta.json"), "w", encoding="utf-8") as f:
    json.dump({"source": "日本郵便 住所の郵便番号（utf_ken_all.zip）", "date": date, "zipCount": total, "shards": len(shards)}, f, ensure_ascii=False)
print(f"{total} zip codes / {len(shards)} shards / data date {date}")
