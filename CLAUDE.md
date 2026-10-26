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
- `plugins/bilingual/`: local plugin for the 中 / EN language switch (see "Bilingual notes").
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
- **Frontmatter:** `title` (bilingual, `中文 English`, e.g. `提示缓存 Prompt Caching`), `aliases` (Chinese and English names, plus key concepts),
  `tags`, `created: YYYY-MM-DD`. Each alias becomes a redirect page at the site root.
- **Body:** starts with `# <emoji> Title` (Obsidian needs it; the site hides it). Then use
  numbered `##` sections with emoji: TL;DR / `> [!abstract]` one-liner → concepts →
  examples → "Clarifications to the lesson text" (correct anything inaccurate in the
  source) → review questions with folded `> [!success]- 答案 Answer` callouts → `🔗 Related`.
- **Style:** bilingual (中文 + English) in the shapes listed under "🌐 Bilingual notes" below,
  so the site's 中 / EN switch works. Headings like `## 1. 核心概念 Overview`. Use
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

### 🌐 Bilingual notes (中 / EN switch)

The site has a 中 / EN button in the toolbar (English by default, remembered per browser).
`plugins/bilingual` splits each note at build time: it finds a Chinese half and its English
half and wraps them in `<span lang="zh">` / `<span lang="en">`; `custom.scss` hides the
other language. Obsidian still shows both. **Every new note must be fully bilingual:** every
heading, sentence, label, table cell, callout title and link label needs both halves, written
in one of these shapes:

| Shape                                                | Example                                                                    |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Heading / short phrase: `中文 English`               | `## 2. 💡 思路 Intuition`, a table cell `题目 Problem`                     |
| Chinese line(s), then English line(s)                | `给定数组 nums…`⏎`Given nums…` (also several 中 lines, then the English)   |
| Chinese paragraph(s)/list, then an English paragraph | the 中 block, a blank line, then the EN block                              |
| Bold label before the text                           | `**关键观察 Key insight:** 中文…`⏎`  English…`                             |
| Label, then `中文 → English`                         | `- [x] 空数组 Empty array: 返回 0 → returns 0`                             |
| One line `中文 English`                              | `**Q1.** 为什么…？ Why…?`, `计数器遇 0 清零 Reset the counter on 0 · Easy` |
| Aside in parentheses                                 | `（栈当状态 stack as state）`, `(本题 this one)`                           |
| Link label                                           | `[[栈 Stack\|栈 Stack]]`, never a Chinese-only `[[栈 Stack\|栈]]`          |

Rules that keep the automatic split right:

- **End the Chinese half with Chinese** (a character or `，。）`), not with code or `O(n)`.
  Between the halves, code or notation goes to the Chinese half when the English half starts
  with a capital letter, and to the English half when it starts lowercase. `均摊 O(1) Amortized
O(1)` and ``位置 `n` iterations`` are both fine; `是 O(n) for the output` is not.
- **Start the Chinese half with Chinese.** Leading numbers, emoji, links and `Q1.` are shared;
  leading code belongs to the Chinese half, so repeat it in English
  (`` `get()` 不检查 `get()` doesn't check ``). Because leading numbers are shared, write
  `元素 17 右边…` or `一小时缓存 1-hour TTL`, not `17 右边…` or `1 小时 TTL 1-hour TTL`.
- Don't bold a whole line in a line pair (`**中文句子。**`⏎`**English sentence.**` doesn't
  split); bold a phrase inside each line instead.
- Keep a label's Chinese part short (≤ 10 characters, no `，。；`), and put its colon at the end.
- Don't mix two translations in one line (`迭代 iterative O(1) / 递归 recursive O(n)`); write
  `迭代 O(1) / 递归 O(n) Iterative O(1) / recursive O(n)`.
- The English half must not contain Chinese characters (except inside links or code).
- **Titles too:** the frontmatter `title` drives the page title, sidebar, breadcrumbs,
  search and browser tab, so it needs both halves. Link labels that repeat a title use the
  same bilingual form (`[[Baseball Game|682. 棒球比赛 Baseball Game]]`); number-only labels
  like `[[Baseball Game|682]]` are fine.
- Code and code comments stay as they are (comments can stay bilingual).
- **Escape hatch:** wrap text by hand in `<span lang="zh">…</span><span lang="en">…</span>`
  (or `<div lang="…">` with blank lines around the Markdown) when no shape fits.
- Notes written in one language (the older AI and system design notes) get a "only in
  Chinese / English for now" notice instead. `bilingual: true` / `false` in frontmatter
  overrides the detection.
- New folder or `📌` overview title? Add its English name to `titles` under
  `./plugins/bilingual` in `quartz.config.yaml`.
- **Check both languages before pushing:** open the note on the local site and switch
  中 / EN (look for leftover Chinese in EN, missing labels, duplicated code).

### 🧩 LeetCode notes

Xiang usually pastes **their own Java solution** ("complete <Problem> with below
implementation"). Build the note around it:

- **Keep Xiang's code as written.** Only fix formatting and add short bilingual inline
  comments. Put better approaches (e.g. `ArrayDeque` instead of `Stack`, `int[]` +
  pointer) under `> [!note] 其他写法 Alternatives`, and call out real bugs or bad habits
  in Pitfalls. Don't silently rewrite the solution.
- **File and frontmatter:** `content/LeetCode 题库/<English Title>.md`, from
  `模板/LeetCode 题解模板.md`. `title: "<number>. <力扣中文名> <Title>"` (e.g. `682. 棒球比赛 Baseball Game`), aliases (Chinese name,
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
  (`- 🟡 [[File|<number>. 中文名 Title]]: 中文 summary English summary · Easy`; add a pattern heading if
  needed). LeetCode notes form a **Previous/Next chain** in "Related": link back to the
  last-added note and add a "下一题 Next" line to it.
- **Always update 数据结构 and 算法 too.** Xiang noticed each time one was skipped. For
  every LeetCode note, check **both** folders:
  - **数据结构 (what it stores):** the data structure the solution uses, e.g. array →
    `数组 Array`, stack → `栈 Stack`.
  - **算法 (how it solves):** the technique or pattern, e.g. read/write pointers →
    `双指针 Two Pointers`, running state → `一次遍历 One Pass`, amortized or
    space/time trade-off reasoning → `复杂度分析 Big-O`. Future ones: sliding window,
    binary search, monotonic stack, recursion, DP, etc. Skip only when the problem is
    pure simulation with no named technique, and say so in the summary.
  - Link every matching concept note from the LeetCode note's "🔗 Related" Concepts
    line, and update each one in the same change: mark the problem solved in its
    "🧩 Practice Problems" table as `✅ [[File\|<number>. 中文名 Title]]` (escape `|` inside
    tables), adding a row if needed, and cite the problem in its signals, pitfalls or
    examples where it fits.
  - **No concept note yet** (e.g. the first stack problem → `数据结构/栈 Stack.md`)?
    Create one from the concept-note format below in the same change, add it to that
    folder's `📌 … 总览` topic line, and link it from related concept notes.
  - In the summary to Xiang, list what changed in 数据结构 and in 算法 separately (or
    why one wasn't applicable).

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
