// 中 / EN switch. head.js sets <html data-lang> before the first paint and
// custom.scss hides the other language. This script adds the switch next to
// the dark-mode button and splits the text the build can't reach: page
// titles in the sidebar, breadcrumbs and table of contents, and Quartz's own
// Chinese UI labels.
const root = document.documentElement
const currentLang = () => (root.dataset.lang === "zh" ? "zh" : "en")

// Quartz's zh-CN interface strings.
const UI = {
  搜索: "Search",
  "搜索内容...": "Search for something",
  "没有结果。": "No results.",
  "请尝试其他搜索词。": "Try another search term.",
  按标签筛选: "Filter by tag",
  没有匹配的标签: "No matching tags",
  暗色模式: "Dark mode",
  亮色模式: "Light mode",
  阅读模式: "Reader mode",
  探索: "Explorer",
  目录: "On this page",
  反向链接: "Backlinks",
  无法找到反向链接: "No backlinks found",
  关系图谱: "Graph view",
  最近的笔记: "Recent notes",
  文件夹: "Folder",
  标签: "Tag",
  标签索引: "Tag index",
  无法找到: "Not found",
  "私有笔记或笔记不存在。": "This page is private or doesn't exist.",
  返回首页: "Back to the homepage",
}
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")
const UI_PATTERNS = [
  [/^(\d+)分钟阅读$/, (m) => `${m[1]} min read`],
  [/^(\d{4})年(\d{1,2})月(\d{1,2})日$/, (m) => `${MONTHS[m[2] - 1]} ${m[3]}, ${m[1]}`],
  [/^查看更多(\d+)篇笔记 →$/, (m) => `See ${m[1]} more →`],
  [/^此文件夹下有(\d+)条笔记。$/, (m) => `${m[1]} notes in this folder.`],
  [/^此标签下有(\d+)条笔记。$/, (m) => `${m[1]} notes with this tag.`],
  [/^显示前(\d+)个标签。$/, (m) => `Showing the first ${m[1]} tags.`],
  [/^总共有(\d+)个标签。$/, (m) => `${m[1]} tags in total.`],
]

// Elements whose text is a note or folder title.
const TITLES = [
  ".article-title",
  ".recent-notes > h3",
  ".breadcrumb-element a",
  ".explorer .nav-file-title",
  ".explorer .folder-title",
  ".toc-content a",
  ".backlinks a",
  ".recent-notes a",
  ".page-listing a",
  ".search-layout .result-card h3",
].join(", ")

// Translation of a UI label, or null.
function uiText(text) {
  if (Object.hasOwn(UI, text)) return UI[text]
  for (const [re, fn] of UI_PATTERNS) {
    const m = text.match(re)
    if (m) return fn(m)
  }
  return null
}

// [{ text, lang? }] segments for a title, or null. `titles` in the plugin
// options (quartz.config.yaml) names titles the automatic split can't handle.
function titleSegments(text) {
  const ui = uiText(text)
  if (ui)
    return [
      { text, lang: "zh" },
      { text: ui, lang: "en" },
    ]
  const key = text.replace(/^\p{Extended_Pictographic}️?\s*/u, "")
  if (Object.hasOwn(BILINGUAL.titles, key)) {
    return [
      { text, lang: "zh" },
      { text: BILINGUAL.titles[key], lang: "en" },
    ]
  }
  return splitTitle(text)
}

function replaceText(node, segments) {
  const frag = document.createDocumentFragment()
  for (const { text, lang } of segments) {
    if (!lang) {
      frag.append(text)
      continue
    }
    const span = document.createElement("span")
    if (lang === "none") span.className = "lang-none"
    else span.lang = lang
    span.dataset.bilingual = ""
    span.textContent = text
    frag.append(span)
  }
  node.replaceWith(frag)
}

// Splits the text nodes under `el` that `segmentsOf` knows how to split.
function splitTextIn(el, segmentsOf, skip) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    const parent = node.parentElement
    if (!parent || parent.closest("[data-bilingual]") || (skip && parent.closest(skip))) continue
    const text = node.data.trim()
    if (!text) continue
    const segments = segmentsOf(text)
    if (!segments) continue
    const lead = node.data.match(/^\s*/)[0]
    const trail = node.data.match(/\s*$/)[0]
    replaceText(
      node,
      [{ text: lead }, ...segments, { text: trail }].filter((s) => s.text),
    )
  }
}

const ATTRS = ["aria-label", "placeholder"]

function translateAttributes(lang) {
  for (const attr of ATTRS) {
    for (const el of document.querySelectorAll(`[${attr}]:not(.lang-toggle)`)) {
      const key = `bilingual${attr.replace(/-./g, (m) => m[1].toUpperCase())}`
      el.dataset[key] ??= el.getAttribute(attr)
      const zh = el.dataset[key]
      const value = lang === "en" ? (uiText(zh) ?? zh) : zh
      if (el.getAttribute(attr) !== value) el.setAttribute(attr, value)
    }
  }
}

// The page's own <title>, and the last one this script set.
let pageTitle = document.title
let shownTitle = null

function translateTitle(lang) {
  if (document.title !== shownTitle) pageTitle = document.title
  const [name, ...site] = pageTitle.split(" · ")
  const other = lang === "en" ? "zh" : "en"
  const segments = titleSegments(name)
  const local = segments
    ? segments
        .filter((s) => s.lang !== other && s.lang !== "none")
        .map((s) => s.text)
        .join("")
        .trim()
    : name
  shownTitle = [local, ...site].join(" · ")
  if (document.title !== shownTitle) document.title = shownTitle
}

function update() {
  const lang = currentLang()
  const body = document.getElementById("quartz-body")
  if (body) {
    // A single-language note keeps its headings as written, so its table of
    // contents does too.
    const monolingual = body.querySelector("article .lang-notice")
    for (const el of body.querySelectorAll(TITLES)) {
      if (monolingual && el.closest(".toc")) continue
      splitTextIn(el, titleSegments)
    }
    splitTextIn(
      body,
      (text) => {
        const ui = uiText(text)
        return ui
          ? [
              { text, lang: "zh" },
              { text: ui, lang: "en" },
            ]
          : null
      },
      "article, pre, code, .popover",
    )
  }
  translateAttributes(lang)
  translateTitle(lang)
  for (const toggle of document.querySelectorAll(".lang-toggle")) {
    toggle.dataset.current = lang
    toggle.setAttribute("aria-label", lang === "en" ? "切换到中文" : "Switch to English")
    toggle.title = toggle.getAttribute("aria-label")
  }
}

function setLang(lang) {
  root.dataset.lang = lang
  root.lang = lang === "zh" ? "zh-CN" : "en"
  try {
    localStorage.setItem("lang", lang)
  } catch {}
  update()
}

// Puts the switch next to each dark-mode button (desktop and mobile layouts).
function addToggles() {
  for (const darkmode of document.querySelectorAll(".darkmode")) {
    const item = darkmode.parentElement
    if (!item || item.previousElementSibling?.querySelector(".lang-toggle")) continue
    const wrapper = item.cloneNode(false)
    const toggle = document.createElement("button")
    toggle.type = "button"
    toggle.className = "lang-toggle"
    toggle.innerHTML = '<span data-opt="zh">中</span><span data-opt="en">EN</span>'
    toggle.addEventListener("click", () => setLang(currentLang() === "en" ? "zh" : "en"))
    wrapper.append(toggle)
    item.before(wrapper)
  }
}

let scheduled = false
const observer = new MutationObserver(() => {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(() => {
    scheduled = false
    update()
  })
})

document.addEventListener("nav", () => {
  addToggles()
  update()
  observer.disconnect()
  observer.observe(document.body, { childList: true, subtree: true })
})
