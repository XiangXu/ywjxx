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

## How Xiang likes to work

- **Check locally before pushing.** When asked, start `npx quartz build --serve` and give
  the URL. Xiang often says "let me check locally" before approving.
- **"Push" means push to `master`** (that's what deploys). Commit and push only when
  asked, but when asked, push to `master` without making a PR. `obsidian-quartz` is the
  working branch; keep it in sync with `master`.
- **Test fixes for real.** Reproduce the bug, fix it, then verify every page and link,
  not only the one that was reported (see "Verifying changes").
- **Have Fable review.** After writing or substantially editing a note, Xiang usually
  asks for a review by the Fable model (spawn an agent with `model: fable`) to check
  accuracy before pushing. Offer it for new notes.
- **Emoji everywhere it fits:** README, note headings, homepage copy. Keep it playful
  but tidy.
- Personal laptop: installing or upgrading tools (Node via `n`, npm packages) is fine.

## Design: Apple-style, quiet, readable

The site was redesigned "the way Apple would design it" (Apple developer docs feel).
Every UI change must keep that look:

- **Fonts:** system fonts only (`-apple-system`/SF Pro, PingFang SC for Chinese).
  No web fonts. That's also why the og-image plugin stays disabled: it fetches Google
  Fonts and crashes.
- **Color:** neutral grays plus a single accent, Apple blue (`#0071e3` light,
  `#2997ff` dark). The palette is in `quartz.config.yaml` → `theme.colors`. Grays must
  meet WCAG AA contrast.
- **Surfaces:** flat, with 1px hairlines. Shadows only on floating UI (the search modal).
  Rounded corners (`--radius` 10px / `--radius-lg` 14px). Tags are plain text, not pills.
- **Layout:** centered reading column (`--reading-width: 44rem`), roomy line-height
  (1.75) for mixed Chinese and English, and a quiet right rail with "On this page" first.
- **Dark mode** must work and look right for every change. It follows the system and
  has a ☀️/🌙 toggle.
- **Homepage** (`content/index.md`): the `> [!hero]` title (`软件开发学习笔记`) plus a
  one-sentence emoji intro, then a `> [!topics]` list. Keep the hero modest: Xiang found
  an earlier larger title and a narrow, squeezed intro too big.
- **Footer:** only round GitHub (https://github.com/XiangXu) and LinkedIn
  (https://www.linkedin.com/in/xiangxu619) icon buttons and `© 2026 Xiang Xu`. No name or
  job title, no "Built with Quartz".
- **Mobile:** must work at phone width. Check it alongside desktop.
- All styling goes in `quartz/styles/custom.scss`, using its CSS variables. Don't
  hard-code new colors.
- For a redesign or a big visual change, load the design skills, then look at the result
  locally in light and dark mode before calling it done.

## Writing notes

Xiang usually pastes lesson text (from a course or a chat) and asks for a note. Don't
paste it in verbatim. Rewrite it into a structured study note:

- **File:** `content/<topic>/<Title>.md`, named in English or Chinese to match the
  folder. Add it to that folder's `📌 … 总览` overview note (one line: emoji, link,
  short summary). Link the previous note's "Related" section to it.
- **Frontmatter:** `title`, `aliases` (Chinese and English names, plus key concepts),
  `tags`, `created: YYYY-MM-DD`. Each alias becomes a redirect page at the site root.
- **Body:** starts with `# <emoji> Title` (Obsidian needs it; the site hides it). Then use
  numbered `##` sections with emoji: TL;DR / `> [!abstract]` one-liner → concepts →
  examples → "Clarifications to the lesson text" (correct anything inaccurate in the
  source) → review questions with folded `> [!success]- Answer` callouts → `🔗 Related`.
- **Style:** bilingual (中文 + English), headings like `## 1. 核心概念 Overview`. Use
  Obsidian callouts (`tip`, `note`, `important`, `warning`, `example`), tables for
  comparisons, and Java analogies where helpful (the lessons already use them).
- **Accuracy matters more than copying.** Fix wrong or misleading claims in the source
  material and say so in the clarifications section.
- When adding to an existing note, merge into its structure rather than appending a blob.
- Escape dollar signs in prices (`\$20`), or they render as LaTeX.
- No underscores inside `\text{}` in math (e.g. `\text{input\_tokens}`). GitHub turns
  `\_` into `_` and fails with "'_' allowed only in math mode". Use spaces instead:
  `\text{input tokens}`.
- Private notes go in a `_private/` folder (git-ignored). `publish: false` or
  `draft: true` hides a note from the site, but its text is still pushed to GitHub.

### 🧩 LeetCode notes

Xiang usually pastes **their own Java solution** ("complete <Problem> with below
implementation"). Build the note around it:

- **Keep Xiang's code as written.** Only fix formatting and add short bilingual inline
  comments. Put better approaches (e.g. `ArrayDeque` instead of `Stack`, `int[]` +
  pointer) under `> [!note] 其他写法 Alternatives`, and call out real bugs or bad habits
  in Pitfalls. Don't silently rewrite the solution.
- **File and frontmatter:** `content/LeetCode 题库/<English Title>.md`, from
  `模板/LeetCode 题解模板.md`. `title: "<number>. <Title>"`, aliases (Chinese name,
  `LeetCode <number>`), tags (`LeetCode`, `Interview-Prep`, plus pattern tags),
  `difficulty`, `pattern`, `link`, `status: 🟡 review` (solved but new), `created` and
  `last-reviewed` set to today, `publish: true`.
- **Sections** (the template is a skeleton; follow the existing notes, e.g.
  `Concatenation of Array.md`): `> [!abstract] TL;DR` with ⏱️/🗄️ complexity, then
  numbered `##` sections: 📋 Problem (statement, examples table, constraints) →
  💡 Intuition (key insight, pattern) → 🐢 Brute Force → 🚀 Optimal ("我的解法 My
  solution", complexity, `> [!example]` trace table, alternatives) → ⚠️ Edge Cases &
  Pitfalls (`- [x]` checklist) → 🔁 Follow-ups (similar-problems table) → ❓ Review
  Questions → 🔗 Related → 🔁 Review Log (today's row: ✅ plus a one-line takeaway).
- **Linking:** add a line under the matching pattern in `📌 LeetCode 总览.md`
  (`- 🟡 [[File|<number>. Title]]: 中文 summary · Easy`; add a pattern heading if
  needed). LeetCode notes form a **Previous/Next chain** in "Related": link back to the
  last-added note and add a "下一题 Next" line to it.
- **Always update 数据结构 / 算法 too.** Xiang noticed when this was skipped. Every
  LeetCode note must link the concept notes for its data structure (`数据结构/`) and
  pattern (`算法/`) in its "🔗 Related" Concepts line, and each of those concept notes
  must be updated in the same change:
  - In its "🧩 Practice Problems" table, mark the problem solved as
    `✅ [[File\|<number>. Title]]` (escape `|` inside tables), adding a row if needed.
  - Where it fits, cite the problem in the concept note's signals, pitfalls or examples.
  - **No concept note yet** (e.g. the first stack problem → `数据结构/栈 Stack.md`)?
    Create one from the concept-note format below in the same change, add it to that
    folder's `📌 … 总览` topic line, and link it from related concept notes.
  - Mention the 数据结构 / 算法 changes in the summary to Xiang.

### 🧱 Concept notes (`算法/`, `数据结构/`)

From `模板/算法 & 数据结构模板.md`, numbered `##` sections: 🎯 Overview → 🧠 When to
Use → ⚙️ How It Works → 💻 Code Template (Java) → ⏱️ Complexity → ⚠️ Common Pitfalls →
❓ Review Questions → 🧩 Practice Problems → 🔗 Related. Add each to its
`📌 算法总览` / `📌 数据结构总览` topic line, and use the LeetCode notes as examples.

### ✅ What Fable reviews tend to catch

Hedge absolutes ("always", "almost always" → "usually"), state Java version details
(`.toList()` is Java 16+ and unmodifiable), keep code snippets complete (a missing
`return -1`), check off-by-one and 0- vs 1-indexing, and make sure the prose matches
the code next to it.

## Commits

Gitmoji prefix plus a short summary: `📝` notes/docs (e.g.
`📝 Add LeetCode note: 682. Baseball Game`), `💄` styling, `🐛` bug fix, `✨` feature. Apply review fixes in a
separate `📝 Apply review fixes to …` commit.

## Deploying

Netlify builds `master` automatically (`netlify.toml`: `npx quartz build` → `public/`).
Other branches only get Deploy Previews. After pushing, wait about 30 seconds and verify
the live site (see the checks below).

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
