// Local Quartz transformer: lets readers switch the site between 中文 and English.
//
// Notes stay bilingual in Obsidian. At build time this plugin finds the paired
// text (a Chinese line followed by its English line, "题目 Problem" headings,
// "关键观察 Key insight:" labels…) and wraps each half in
// <span lang="zh"> / <span lang="en">. The browser script (client.js) adds the
// 中 / EN switch; quartz/styles/custom.scss hides the other language. Hand-written
// <span lang="…"> / <div lang="…"> markup is left as is.
//
// Only notes that mix both languages are split. A note written in one language
// gets a short notice in the other language instead. Frontmatter
// `bilingual: true` / `false` overrides the detection for one note.
import { readFileSync } from "node:fs"
import { classifyLine, splitLine, splitLines, pairLines } from "./split.js"

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8")

// Inline elements whose text is split along with the surrounding line.
const INLINE = new Set(["a", "strong", "em", "b", "i", "mark", "del", "s", "u", "span", "small"])
// Inline elements kept whole (neutral) when splitting.
const ATOMIC = new Set([
  "code",
  "kbd",
  "img",
  "svg",
  "input",
  "br",
  "sup",
  "sub",
  "math",
  "wbr",
  "abbr",
  "time",
])
// Elements whose inline children are split.
const CONTAINERS = new Set([
  "p",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "td",
  "th",
  "dt",
  "dd",
  "summary",
  "figcaption",
])

const HAN = /\p{Script=Han}/gu
const WORD = /[A-Za-z]+/g

const classes = (node) => [node.properties?.className ?? []].flat().map(String)
const isMath = (node) => classes(node).some((c) => c.startsWith("katex") || c === "math")
const isInline = (node) =>
  node.type === "text" ||
  (node.type === "element" && (INLINE.has(node.tagName) || ATOMIC.has(node.tagName)))
const isSplittable = (node) => node.type === "element" && INLINE.has(node.tagName) && !isMath(node)

function some(nodes, test) {
  return nodes.some((n) => test(n) || (n.children ? some(n.children, test) : false))
}
const hasLang = (nodes, lang) =>
  some(nodes, (n) => n.type === "element" && n.properties?.lang === lang)
const hasManualMarkup = (nodes) =>
  some(nodes, (n) => n.type === "raw" || (n.type === "element" && n.properties?.lang != null))

function toPieces(nodes) {
  const pieces = []
  for (const node of nodes) {
    if (node.type === "text") pieces.push(...Array.from(node.value))
    else {
      const en = node.children ? hasLang(node.children, "en") : false
      const code = node.tagName === "code" || node.tagName === "kbd" || isMath(node)
      const prose = EMPHASIS.has(node.tagName) ? proseOf(node) : ""
      const zh = /\p{Script=Han}/u.test(prose) && !/[A-Za-z]/.test(prose)
      pieces.push({ node, en, code, zh })
    }
  }
  return pieces
}

function wrap(lang, children) {
  const properties = lang === "none" ? { className: ["lang-none"] } : { lang }
  return { type: "element", tagName: "span", properties, children }
}

// langs[i] is the span covering piece i (undefined when shared).
function rebuild(pieces, langs) {
  const out = []
  for (let i = 0; i < pieces.length;) {
    const span = langs[i]
    const kids = []
    let text = ""
    for (; i < pieces.length && langs[i] === span; i++) {
      const p = pieces[i]
      if (typeof p === "string") {
        text += p
        continue
      }
      if (text) kids.push({ type: "text", value: text })
      text = ""
      kids.push(p.node)
    }
    if (text) kids.push({ type: "text", value: text })
    if (!span) out.push(...kids)
    else out.push(wrap(span.lang, kids))
    if (span?.alt) out.push(wrap("en", [{ type: "text", value: span.alt }]))
  }
  return out
}

const textOf = (node) =>
  node.type === "text" ? node.value : (node.children ?? []).map(textOf).join("")
// Text outside code and math.
const proseOf = (node) =>
  node.type === "text"
    ? node.value
    : node.tagName === "code" || isMath(node)
      ? ""
      : (node.children ?? []).map(proseOf).join("")
const EMPHASIS = new Set(["strong", "em", "b", "i"])
const EMOJI = /^\p{Extended_Pictographic}\uFE0F?\s*/u

// Splits one run of inline nodes. `single` runs (inside a label or link) are
// one line; container runs may hold several lines and translation pairs.
// `titles` maps Chinese titles to English ones ("LeetCode 总览").
function splitRun(nodes, single, titles) {
  // Hand-written <span lang="…"> markup: the author already split this run.
  const manual = hasManualMarkup(nodes)
  for (const node of nodes) {
    if (!isSplittable(node)) continue
    const text = textOf(node).trim()
    const emoji = text.match(EMOJI)?.[0] ?? ""
    const title = text.slice(emoji.length)
    if (node.tagName === "a" && Object.hasOwn(titles, title)) {
      const en = { type: "text", value: emoji + titles[title] }
      node.children = [wrap("zh", node.children), wrap("en", [en])]
    } else {
      node.children = splitRun(node.children, true, titles)
    }
  }
  if (manual) return nodes
  const pieces = toPieces(nodes)
  const lines = single ? [[0, pieces.length]] : splitLines(pieces)
  const modes = single ? ["single"] : pairLines(pieces, lines)
  const langs = new Array(pieces.length)
  lines.forEach(([from, to], i) => {
    for (const span of splitLine(pieces, from, to, modes[i])) langs.fill(span, span.from, span.to)
  })
  return langs.some(Boolean) ? rebuild(pieces, langs) : nodes
}

// Calls fn(run) for each run of inline children of each container, and
// replaces the run with fn's result. Skips code and elements that already
// have a language.
function forEachRun(tree, fn) {
  const visit = (node) => {
    if (!node.children || node.properties?.lang != null) return
    if (node.type === "element" && CONTAINERS.has(node.tagName)) {
      const out = []
      let run = []
      const flush = () => {
        if (run.length) out.push(...(fn(run) ?? run))
        run = []
      }
      for (const child of node.children) {
        if (isInline(child)) {
          run.push(child)
        } else {
          flush()
          out.push(child)
          visit(child)
        }
      }
      flush()
      node.children = out
    } else {
      if (node.type === "element" && (node.tagName === "pre" || node.tagName === "code")) return
      node.children.forEach(visit)
    }
  }
  visit(tree)
}

const BLOCKS = new Set(["p", "ul", "ol"])

// "zh" for a block that is only Chinese (no translation inside it), "en" for
// one with no Chinese at all, null otherwise.
function blockLanguage(block) {
  let han = 0
  let english = false
  let bilingual = false
  forEachRun(block, (run) => {
    const pieces = toPieces(run)
    for (const [from, to] of splitLines(pieces)) {
      const kind = classifyLine(pieces, from, to)
      if (kind === "en") english = true
      if (kind === "zh" && splitLine(pieces, from, to, "single").some((s) => s.lang === "en")) {
        bilingual = true
      }
    }
  })
  const visit = (node) => {
    if (node.type === "text") han += node.value.match(HAN)?.length ?? 0
    if (node.type === "element" && (node.tagName === "code" || isMath(node))) return
    node.children?.forEach(visit)
  }
  visit(block)
  if (han > 0 && !english && !bilingual) return "zh"
  if (han === 0 && english) return "en"
  return null
}

// Chinese paragraphs and lists directly followed by English ones are a
// translation, like lines are (see pairLines):
//   必须先存 temp，再覆盖 arr[i]，最后更新 rightMax。
//   - 如果先更新 rightMax 再赋值，…
//
//   Save temp, overwrite arr[i], then update rightMax. …
function pairBlocks(node) {
  if (!node.children || node.properties?.lang != null) return
  const blocks = node.children.filter((c) => c.type === "element")
  const kinds = blocks.map((b) => (BLOCKS.has(b.tagName) ? blockLanguage(b) : null))
  for (let i = 0; i < blocks.length;) {
    let j = i
    while (j < blocks.length && kinds[j] === "zh") j++
    let k = j
    while (k < blocks.length && kinds[k] === "en") k++
    if (j > i && k > j) {
      blocks.slice(i, k).forEach((b, n) => (b.properties.lang = n < j - i ? "zh" : "en"))
      i = k
    } else {
      i = Math.max(i + 1, j)
    }
  }
  node.children.forEach(pairBlocks)
}

// "zh" or "en" when the note is written (almost) only in that language, null
// when it mixes both. Bilingual notes have about 1–1.6 Chinese characters per
// English word; Chinese notes with English terms have 4+, English notes ~0.
function mainLanguage(tree) {
  let han = 0
  let words = 0
  const visit = (node) => {
    if (node.type === "text") {
      han += node.value.match(HAN)?.length ?? 0
      words += node.value.match(WORD)?.length ?? 0
    }
    if (node.type === "element" && (node.tagName === "pre" || node.tagName === "code")) return
    if (isMath(node)) return
    node.children?.forEach(visit)
  }
  visit(tree)
  if (han + words < 100) return null
  if (han > words * 3) return "zh"
  if (han * 5 < words) return "en"
  return null
}

const NOTICE = {
  zh: { lang: "en", text: "🇨🇳 This note is only in Chinese for now." },
  en: { lang: "zh", text: "🇬🇧 这篇笔记目前只有英文版。" },
}

function notice(language) {
  const { lang, text } = NOTICE[language]
  return {
    type: "element",
    tagName: "p",
    properties: { lang, className: ["lang-notice"] },
    children: [{ type: "text", value: text }],
  }
}

const isTrue = (v) => v === true || v === "true"
const isFalse = (v) => v === false || v === "false"

export const manifest = {
  name: "bilingual",
  displayName: "Bilingual",
  description: "Lets readers switch between 中文 and English",
  version: "1.0.0",
  category: "transformer",
}

export default function Bilingual(opts = {}) {
  const defaultLanguage = opts.defaultLanguage === "zh" ? "zh" : "en"
  const titles = opts.titles ?? {}
  const shared = read("./split.js").replace(/^export /gm, "")
  const config = JSON.stringify({ defaultLanguage, titles })
  return {
    name: "Bilingual",
    htmlPlugins() {
      return [
        () => (tree, file) => {
          const fm = file.data?.frontmatter ?? {}
          if (isFalse(fm.bilingual)) return
          const language = isTrue(fm.bilingual) ? null : mainLanguage(tree)
          if (language) tree.children.unshift(notice(language))
          else {
            pairBlocks(tree)
            forEachRun(tree, (run) => splitRun(run, false, titles))
          }
        },
      ]
    },
    externalResources() {
      return {
        js: [
          {
            loadTime: "beforeDOMReady",
            contentType: "inline",
            spaPreserve: true,
            script: `(() => {\nconst BILINGUAL = ${config};\n${read("./head.js")}\n})()`,
          },
          {
            loadTime: "afterDOMReady",
            contentType: "inline",
            spaPreserve: true,
            script: `(() => {\nconst BILINGUAL = ${config};\n${shared}\n${read("./client.js")}\n})()`,
          },
        ],
      }
    },
  }
}
