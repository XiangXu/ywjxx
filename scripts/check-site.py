# Checks a built site the way Netlify serves it (pretty URLs + case-insensitive
# path matching): every page, every internal link/asset, every content-index slug.
# Flags 404s, redirect loops, and paths that differ only by case.
# Usage: python3 scripts/check-site.py <build-output-dir>
import os, re, sys, json, posixpath, urllib.parse, collections
root = sys.argv[1]
files = [os.path.relpath(os.path.join(d, f), root).replace(os.sep, "/") for d, _, fs in os.walk(root) for f in fs]
low = collections.defaultdict(list)
for f in files: low[f.lower()].append(f)
def read(f): return open(os.path.join(root, f), encoding="utf-8", errors="replace").read()
def lookup(path):
    path = path.strip("/")
    for c in ([path] if re.search(r"\.\w+$", path) else []) + [path + ".html", posixpath.join(path, "index.html"), "index.html" if not path else None]:
        if c and c.lower() in low: return low[c.lower()]
    return None
def resolve(path, hops=0, seen=()):
    m = lookup(path)
    if not m: return None, "404"
    if len(m) > 1: return m, "CASE-COLLISION (Netlify may serve the wrong one)"
    f = m[0]
    if f.endswith(".html"):
        r = re.search(r'http-equiv="refresh" content="0; url=([^"]+)"', read(f))
        if r:
            nxt = posixpath.normpath(posixpath.join(posixpath.dirname("/" + path.strip("/")), r.group(1)))
            if nxt.strip("/").lower() in seen or hops > 5: return f, "REDIRECT LOOP"
            return resolve(nxt, hops + 1, seen + (path.strip("/").lower(),))
    return f, "ok"
pages = sorted(f for f in files if f.endswith(".html"))
real = [p for p in pages if 'http-equiv="refresh"' not in read(p)]
problems, checked, links = [], set(), 0
# 1) every page URL itself
for p in pages:
    url = re.sub(r"(index)?\.html$", "", p)
    f, st = resolve(url)
    if st != "ok": problems.append(("PAGE", "/" + url, st))
# 2) every internal link/asset on every real page
for p in real:
    for attr, href in re.findall(r'\b(href|src)="([^"]+)"', read(p)):
        if re.match(r"^(https?:|mailto:|data:|#|javascript:)", href): continue
        h = urllib.parse.unquote(href.split("#")[0].split("?")[0])
        if not h: continue
        target = posixpath.normpath(posixpath.join(posixpath.dirname("/" + p), h))
        links += 1
        key = (p, target)
        if key in checked: continue
        checked.add(key)
        f, st = resolve(target)
        if st != "ok": problems.append(("LINK on /" + p, href, st))
# 3) every slug in the content index (explorer, search, graph)
ci = json.loads(read("static/contentIndex.json"))
for slug in ci:
    f, st = resolve(slug)
    if st != "ok": problems.append(("contentIndex", slug, st))
print(f"{len(pages)} html files ({len(real)} real pages, {len(pages)-len(real)} redirect stubs), {links} internal links/assets, {len(ci)} index slugs")
for pr in problems: print("PROBLEM", *pr)
print("problems:", len(problems))
sys.exit(1 if problems else 0)
