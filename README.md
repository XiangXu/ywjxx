# 🧠 Xiang's Notes

> 📚 My software development learning notes, written in [Obsidian](https://obsidian.md) 🪨💜 and published as a website with [Quartz](https://quartz.jzhao.xyz) 🌱
>
> 🌐 **Live site:** https://ywjxx.netlify.app

One folder, two views 🪄

- ✍️ **Write** in Obsidian with wikilinks, backlinks, graph view, tags, callouts and templates
- 🌍 **Read & review** on the website with full-text search, tag and folder browsing, backlinks, graph, and dark mode 🌙

The Obsidian vault (`content/`) is the **single source of truth** ✅. The website is generated from it, so you never copy notes around.

---

## 🗂️ Project Structure

```
ywjxx/
├── 📝 content/                ← 🪨 the Obsidian vault (open THIS folder in Obsidian)
│   ├── .obsidian/             ⚙️ shared Obsidian settings (workspace files are git-ignored)
│   ├── index.md               🏠 homepage of the website
│   ├── AI 学习库/              🤖 AI & LLM notes
│   ├── LeetCode 题库/          🧩 LeetCode walkthroughs
│   ├── 算法/                   🧮 algorithms
│   ├── 数据结构/               🧱 data structures
│   ├── 模板/                   🧰 note templates (never published)
│   └── attachments/           🖼️ pasted images (created by Obsidian on first paste)
├── 🔌 plugins/publish-filter/  🔒 hides `publish: false` / `draft: true` notes from the site
├── 🌐 plugins/bilingual/       中 / EN language switch
├── ⚙️ quartz.config.yaml       🎛️ site settings, theme colors, fonts, plugins
├── 🎨 quartz/styles/custom.scss 💅 the custom "study notebook" design
├── 🏗️ quartz/                  Quartz engine (avoid editing; updated via `npx quartz upgrade`)
├── 🚀 netlify.toml             Netlify build config
└── 🟢 .node-version            Node.js version (26)
```

---

## 🚀 Getting Started

### 1️⃣ Install Node.js 26 🟢

This project uses **Node.js 26** (pinned in `.node-version`). Check yours:

```bash
node -v   # should print v26.x
```

Need to upgrade? Pick whichever tool you already use 👇

```bash
# 🅽 with n (already installed on this Mac)
sudo n 26

# 🐢 or with nvm
nvm install 26 && nvm use 26

# 🍺 or with Homebrew
brew install node@26
```

### 2️⃣ Install dependencies 📦

```bash
npm ci
```

### 3️⃣ Run the site locally 💻

```bash
npx quartz build --serve
```

Then open 👉 **http://localhost:8080** 🎉

The page reloads automatically ♻️ when you save a note in Obsidian.

### 4️⃣ Build only (no server) 🏗️

```bash
npx quartz build
```

The static site lands in `public/` 📁 (git-ignored).

---

## ✍️ Writing Notes in Obsidian

1. 🪨 In Obsidian: **Open folder as vault**, then choose `ywjxx/content`
2. 🆕 New note: ⌘P, then **Templates: Insert template**, then pick one from `模板/`
3. 🔗 Link notes with `[[wikilinks]]`. They work in Obsidian **and** on the site
4. 🖼️ Paste images straight in. They're saved to `attachments/` and embedded with `![[image.png]]`
5. 🏷️ Add `tags:` in the frontmatter so notes show up on tag pages

Supported on the website ✅: wikilinks & aliases · backlinks · tags · callouts (`> [!tip]`) · embedded images & notes · LaTeX math (`$x^2$`, `$$…$$`) · code highlighting · tables · graph view · hover previews

### 🌐 Two languages: 中 / EN

The site has a **中 / EN** button next to the 🌙 button. Readers see English by default, and their choice is remembered. Notes stay bilingual in Obsidian; at build time `plugins/bilingual` finds each Chinese half and its English half and the site shows one of them:

```markdown
## 2. 💡 思路 Intuition ← heading: 中文 English

输出的每个位置都能直接算出来源。 ← a Chinese line…
Every output slot maps back to an input. ← …then its English line

- **关键观察 Key insight:** 中文… → English… ← label, then 中文 → English
```

✍️ Write every sentence, heading, label and table cell in both languages using these shapes (the full list of shapes and rules is in `CLAUDE.md` → "Bilingual notes"). When nothing fits, wrap text by hand: `<span lang="zh">…</span><span lang="en">…</span>`. Notes written in only one language show a small "only in Chinese for now" notice in the other language. Add `bilingual: false` to a note's frontmatter to turn the split off.

> 💲 **Tip:** to write a price, escape the dollar sign (`\$20`). Otherwise two prices on one line get rendered as a math formula. It still looks normal in Obsidian.

---

## 🔒 Keeping Notes Private

Nothing gets published by accident 🙅. There are three ways to keep a note off the site:

| Method                             | Published on site? | Pushed to GitHub?   |
| ---------------------------------- | ------------------ | ------------------- |
| `publish: false` in frontmatter 📝 | ❌ No              | ⚠️ Yes              |
| `draft: true` in frontmatter 🚧    | ❌ No              | ⚠️ Yes              |
| Put it in a `_private/` folder 🗄️  | ❌ No              | ❌ No (git-ignored) |

```yaml
---
title: My secret note
publish: false # 🔒 not on the website
---
```

Also never published: `模板/` templates, `.obsidian/`, `.trash/`.

> ⚠️ **Heads-up:** `publish: false` only keeps a note off the **website**. If the GitHub repo is public, the note's text is still visible there. For truly private notes, use a `_private/` folder or make the repo private 🔐.
>
> 🖼️ Images and other attachments are always published, even when only a private note uses them. Keep private images inside `_private/`.

---

## 🌐 Deploying to Netlify

Deploys are automatic 🤖. **Push to `master`** and Netlify builds and publishes https://ywjxx.netlify.app within a minute or two ⏱️

Netlify reads everything from `netlify.toml`:

| Setting              | Value              |
| -------------------- | ------------------ |
| 🏗️ Build command     | `npx quartz build` |
| 📁 Publish directory | `public`           |
| 🟢 Node version      | `26`               |

🔍 Want a preview first? Push a branch and open a pull request. Netlify builds a **Deploy Preview** with its own URL 🔗 (enable _Deploy Previews_ in Netlify → Site configuration → Build & deploy if it's off).

---

## 🎨 Customizing the Look

| What                        | Where                                                           |
| --------------------------- | --------------------------------------------------------------- |
| 🎨 Colors (light & dark 🌙) | `quartz.config.yaml` → `theme.colors`                           |
| 🔤 Fonts                    | `quartz.config.yaml` → `@quartz-community/quartz-fonts` options |
| 💅 Layout & components      | `quartz/styles/custom.scss`                                     |
| 🏠 Homepage                 | `content/index.md` (`> [!hero]` banner + `> [!topics]` cards)   |
| 🧩 Sidebar widgets          | `quartz.config.yaml` → each plugin's `layout:` block            |
| 🌐 English names for titles | `quartz.config.yaml` → `./plugins/bilingual` → `titles`         |

🌙 Dark mode follows your system setting by default. Use the ☀️/🌙 button next to the search box to switch.

---

## 🔄 Updating

```bash
npx quartz upgrade   # ⬆️ pull the latest Quartz engine + plugins
npm update           # 📦 minor/patch dependency updates
```

---

## 🛟 Troubleshooting

- 🔴 **Build errors after pulling**: check `node -v` prints v26 and re-run `npm ci`.
- 🟡 **"isn't yet tracked by git, dates will be inaccurate"**: harmless. Commit the note and the date comes from git history.
- 🧮 **A sentence turns into a weird formula**: a stray `$`. Escape it as `\$`.
- 🗃️ **Old Jekyll blog**: retired 🪦. It's preserved in git under the tag `jekyll-blog-final` (`git checkout jekyll-blog-final`).

---

🌱 _"The best way to learn is to explain it."_ Happy learning! 🎉
