# CLAUDE.md

Xiang's learning notes: an Obsidian vault (`content/`) published as a static site with
[Quartz](https://quartz.jzhao.xyz) on Netlify → https://ywjxx.netlify.app.
`README.md` is the user-facing guide (setup, writing, privacy, deploys); this file is the
short version plus the things that have bitten us.

## Commands

```bash
npm ci                               # install (Node 26, pinned in .node-version)
npx quartz build --serve             # local dev at http://localhost:8080
npx quartz build                     # build into public/ (git-ignored)
python3 scripts/check-site.py public # check every page/link/redirect in a build
npm run check                        # tsc + prettier --check
npm run format                       # prettier --write
```

## Layout

- `content/`: the vault and **single source of truth**. One folder per topic
  (`AI 学习库/`, `LeetCode 题库/`, `系统设计/`, `算法/`, `数据结构/`), each with a
  `📌 … 总览.md` overview note. `content/index.md` is the homepage.
- `content/模板/`: note templates, never published (`ignorePatterns`).
- `quartz.config.yaml`: site settings, theme, and plugin list/options.
- `quartz/styles/custom.scss`: all custom styling.
- `plugins/publish-filter/`: local plugin that drops notes with `publish: false` or `draft: true`.
- `quartz/`: the Quartz engine. Don't edit it; it's updated with `npx quartz upgrade`.

## Writing notes

- Frontmatter: `title`, `tags`, `created`, optional `aliases` (each alias becomes a
  redirect page at the site root, e.g. `AI Learning Library` → `/ai-learning-library`).
- Link with `[[wikilinks]]`. When adding a note, also add it to its folder's `📌 … 总览` note.
- Notes are bilingual (中文 + English) and use emoji in headings, so match that style.
- Escape dollar signs in prices (`\$20`), or they render as LaTeX.
- Private notes go in a `_private/` folder (git-ignored). `publish: false` hides a note
  from the site, but its text is still pushed to GitHub.

## Deploying

Netlify builds `master` automatically (`netlify.toml`: `npx quartz build` → `public/`).
Other branches only get Deploy Previews. Ask before pushing.

## Gotcha: Netlify case-insensitive URLs (refresh-loop bug)

**Keep `enableCaseRedirects: false` on `@quartz-community/alias-redirects`.**

Quartz lowercases slugs (`AI 学习库/Prompt Caching.md` → `ai-学习库/prompt-caching.html`).
With case redirects on, the plugin also writes a redirect stub at the original-case path
(`AI-学习库/Prompt-Caching.html`). It only does this when the build filesystem is
case-sensitive, so it happens on Netlify (Linux) but **never on macOS**. Netlify then
matches URLs case-insensitively and served the stub at the real lowercase URL. The stub
redirects to itself, so the page reloaded forever. That broke every note with an
uppercase letter in its path (all of `AI 学习库/`, `LeetCode 总览`, `Computer Architecture`)
and every alias that pointed to them.

Rules that follow from this:

- Two output files must never differ only by case. Watch for this when adding plugins,
  aliases, or files in `quartz/static/`.
- **A local build on macOS cannot reproduce this kind of bug.** To test the way Netlify
  builds, build onto a case-sensitive volume and run the checker:

  ```bash
  hdiutil create -size 500m -fs "Case-sensitive APFS" -volname qcs -type SPARSE /tmp/cs
  hdiutil attach /tmp/cs.sparseimage -mountpoint /tmp/csmnt -nobrowse
  npx quartz build -o /tmp/csmnt/site
  python3 scripts/check-site.py /tmp/csmnt/site   # expect "problems: 0"
  hdiutil detach /tmp/csmnt && rm /tmp/cs.sparseimage
  ```

- After a deploy, verify the **live** site: `curl` each page URL and make sure none of
  the real notes come back as a `<meta http-equiv="refresh">` stub. Only alias pages
  should be stubs.

## Verifying changes

For anything that affects routing, slugs, aliases, plugins, or redirects, run the
case-sensitive build + `scripts/check-site.py` above (it checks every page, every internal
link/asset, and every `contentIndex.json` slug) before calling the change done.
