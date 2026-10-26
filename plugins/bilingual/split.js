// Language splitting rules, shared by the build plugin (note bodies) and the
// browser script (titles in the sidebar, breadcrumbs, table of contents…).
//
// Text is handled as an array of "pieces": one character (a string) or an
// atom (an object standing for an inline element such as code, a link or
// math). Atoms count as neutral; `atom.en` is true when the atom already
// contains English-only text (e.g. a split `**关键观察 Key insight:**` label),
// `atom.zh` is true for bold or italic Chinese-only text (`**先扩容再写**`),
// which splitTail treats like Chinese characters, and `atom.code` is true for
// code and math.
//
// The functions return spans `{ from, to, lang }` over the pieces, with lang
// "zh", "en", or "none" (hidden in both languages). Pieces outside every span
// are shared and stay visible in both languages. A "zh" span with `alt` shows
// the alt text in English instead (full-width "（" becomes "(").

const HAN = /\p{Script=Han}/u
const CJK_PUNCT = /[　-〿！-／：-＠［-｀｛-･]/u
const LETTER = /[A-Za-z]/
const SPACE = /\s/

const ch = (p) => (typeof p === "string" ? p : "")
const isAtom = (p) => p !== undefined && typeof p !== "string"
const isHan = (p) => HAN.test(ch(p))
const isHanish = (p) => isHan(p) || p?.zh === true
const isCjk = (p) => isHan(p) || CJK_PUNCT.test(ch(p))
const isLetter = (p) => LETTER.test(ch(p))
const isSpace = (p) => SPACE.test(ch(p))

function count(pieces, from, to, test) {
  let n = 0
  for (let i = from; i < to; i++) if (test(pieces[i])) n++
  return n
}

// Notation such as O(n) or f(x): a single letter followed by parentheses.
const isNotation = (pieces, k) =>
  isLetter(pieces[k]) && ch(pieces[k + 1]) === "(" && !isLetter(pieces[k - 1])

// Letters that belong to words, not to notation like O(n log n).
function wordLetters(pieces, from, to) {
  let n = 0
  for (let k = from; k < to; k++) {
    if (isNotation(pieces, k)) {
      while (k < to && ch(pieces[k]) !== ")") k++
    } else if (isLetter(pieces[k])) {
      n++
    }
  }
  return n
}

// "中文 English": Chinese text followed by its English translation.
//   "1. 📋 题目 Problem"             → 题目 | Problem (the "1. 📋 " prefix is shared)
//   "为什么…？ Why…?"                → 为什么…？ | Why…?
//   "单个元素 Single element (`[5]`)" → 单个元素 | Single element (the "(`[5]`)" suffix is shared)
// The English part must start a new word after a space and contain no Chinese.
export function splitTail(pieces, from = 0, to = pieces.length) {
  let firstHan = -1
  let lastCjk = -1
  for (let i = from; i < to; i++) {
    if (isHanish(pieces[i])) {
      if (firstHan < 0) firstHan = i
      lastCjk = i
    } else if (isCjk(pieces[i]) || (ch(pieces[i]) === "”" && isHan(pieces[i - 1]))) {
      lastCjk = i
    }
  }
  if (firstHan < 0) return null

  let enStart = -1
  for (let k = lastCjk + 1; k < to; k++) {
    const p = pieces[k]
    if (isNotation(pieces, k)) {
      while (k < to && ch(pieces[k]) !== ")") k++
      continue
    }
    const opensWord = /["'(“‘]/.test(ch(p)) && isLetter(pieces[k + 1])
    if (isLetter(p) || opensWord) {
      // After a space, or right after a closing bracket: "（前缀最小值）track…"
      if (k > from && (isSpace(pieces[k - 1]) || /[）」』”]/.test(ch(pieces[k - 1])))) enStart = k
      break
    }
  }
  if (enStart < 0 || count(pieces, enStart, to, isLetter) < 2) return null

  // Shared suffix: a trailing " · Easy" tag, a trailing colon, and a trailing
  // "(…)" with no words in it.
  let enEnd = to
  while (enEnd > enStart && isSpace(pieces[enEnd - 1])) enEnd--
  for (let i = enEnd - 1; i > enStart && enEnd - i <= 20; i--) {
    if (ch(pieces[i]) === "·" && isSpace(pieces[i - 1])) {
      enEnd = i - 1
      break
    }
  }
  if (/[:：]/.test(ch(pieces[enEnd - 1]))) enEnd--
  if (ch(pieces[enEnd - 1]) === ")") {
    let j = enEnd - 2
    while (j > enStart && ch(pieces[j]) !== "(" && !isLetter(pieces[j])) j--
    if (ch(pieces[j]) === "(" && isSpace(pieces[j - 1])) {
      enEnd = j
      while (enEnd > enStart && isSpace(pieces[enEnd - 1])) enEnd--
    }
  }
  if (count(pieces, enStart, enEnd, isLetter) < 2) return null

  // Shared prefix: numbering, emoji and atoms before the first word, and an
  // English-only label before the Chinese ("⏱️ Time: O(n): 循环…",
  // "⏱️ Time: O(n)，两趟 two passes"; a full-width separator reads ", " in English).
  let zhStart = from
  let sep = -1
  for (let i = from; i < firstHan; i++) {
    const c = ch(pieces[i])
    if (c === "：" || (c === ":" && isSpace(pieces[i + 1])) || (c === "，" && sep >= 0)) sep = i
  }
  const prefix = []
  if (sep >= 0) {
    zhStart = sep + 1
    const alt = { "：": ": ", "，": ", " }[ch(pieces[sep])]
    if (alt) prefix.push({ from: sep, to: sep + 1, lang: "zh", alt })
  }
  const startsText = (p) => isLetter(p) || p?.code || /["'“‘「『（(《【]/.test(ch(p))
  while (zhStart < firstHan && !startsText(pieces[zhStart])) zhStart++

  // Between the halves there may be atoms such as code. An English half that
  // starts in lowercase continues them ("位置 `n` iterations"); a capitalised
  // one starts fresh, so they end the Chinese half ("或 `n` The result…").
  // The space (or " - ") between the halves is hidden in both languages, so
  // neither ends up with a stray space ("我的解法 :", "📋  Problem").
  let split = enStart
  if (/[a-z]/.test(ch(pieces[enStart]))) split = lastCjk + 1
  while (split > lastCjk + 1 && /[\s\-–—]/.test(ch(pieces[split - 1]))) split--
  let enFrom = split
  while (enFrom < enEnd && /[\s\-–—]/.test(ch(pieces[enFrom]))) enFrom++

  const spans = [...prefix, { from: zhStart, to: split, lang: "zh" }]
  if (enFrom > split) spans.push({ from: split, to: enFrom, lang: "none" })
  spans.push({ from: enFrom, to: enEnd, lang: "en" })
  return spans
}

// "约束 Constraints: …", "🧠 套路 Pattern: …": a short bilingual label before
// the first colon. Returns the label's spans and the colon's index.
export function splitLabel(pieces, from = 0, to = pieces.length) {
  const limit = Math.min(to, from + 80)
  let colon = -1
  for (let i = from; i < limit; i++) {
    const c = ch(pieces[i])
    if (c === "：" || (c === ":" && (i + 1 === to || isSpace(pieces[i + 1])))) {
      colon = i
      break
    }
  }
  if (colon < 0) return null
  const spans = splitSegments(pieces, from, colon)
  const zh = spans.filter((s) => s.lang === "zh")
  const en = spans.filter((s) => s.lang === "en")
  if (zh.length === 0 || en.length === 0) return null
  // Labels are a short term plus a few plain words: "关键观察 Key insight",
  // "后半部分偏移 Offset for the second half", "`right` (快 fast)". Not a
  // sentence that happens to contain a colon ("比如 503. Next Greater Element II：…").
  const total = (spanList, test) =>
    spanList.reduce((n, s) => n + count(pieces, s.from, s.to, test), 0)
  if (total(zh, (p) => /[，。；！？：]/.test(ch(p))) > 0) return null
  if (total(zh, isHan) > 10) return null
  if (total(en, isSpace) > 7) return null
  if (en.some((s) => unbalanced(pieces, s.from, s.to))) return null
  return { spans, colon }
}

// "…，不是 `i + n - 1` → `i + n`, not `i + n - 1`": Chinese, an arrow, then the
// English version. The arrow is hidden in both languages.
export function splitArrow(pieces, from = 0, to = pieces.length) {
  for (let i = from; i < to; i++) {
    if (ch(pieces[i]) !== "→") continue
    // The arrow must follow Chinese text, not an English phrase ("pop → peek").
    let lastHan = i - 1
    while (lastHan >= from && !isHan(pieces[lastHan])) lastHan--
    if (lastHan < from || wordLetters(pieces, lastHan, i) > 0) continue
    if (count(pieces, i + 1, to, isCjk) > 0) continue
    if (count(pieces, i + 1, to, isLetter) < 2) continue
    // Skip a leading colon and an already split label (`**最后一段没处理 Forgetting…:**`).
    let zhFrom = from
    while (zhFrom < i && (/[\s:：]/.test(ch(pieces[zhFrom])) || pieces[zhFrom]?.en)) zhFrom++
    return [
      { from: zhFrom, to: i, lang: "zh" },
      { from: i, to: i + 1, lang: "none" },
      { from: i + 1, to, lang: "en" },
    ]
  }
  return null
}

// Splits pieces into lines at "\n". Returns [from, to) pairs.
export function splitLines(pieces) {
  const lines = []
  let start = 0
  for (let i = 0; i < pieces.length; i++) {
    if (ch(pieces[i]) === "\n") {
      lines.push([start, i])
      start = i + 1
    }
  }
  lines.push([start, pieces.length])
  return lines
}

// "zh" if the line has Chinese, "en" if it has English words and no Chinese,
// "neutral" otherwise (code, numbers, emoji). Atoms (links, code) are ignored.
export function classifyLine(pieces, from, to) {
  if (count(pieces, from, to, isHan) > 0) return "zh"
  if (count(pieces, from, to, isLetter) >= 3) return "en"
  return "neutral"
}

// Chinese lines directly followed by English lines are a translation:
//   输出的每个位置都能直接算出来源。
//   Every output slot maps straight back to an input slot.
// Several Chinese lines may be followed by several English ones.
// Returns one mode per line: "zh" / "en" (part of a translation) or "single".
export function pairLines(pieces, lines) {
  const kinds = lines.map(([f, t]) => classifyLine(pieces, f, t))
  const modes = lines.map(() => "single")
  const next = (i, kind) => {
    while (i < lines.length && kinds[i] === "neutral") i++
    return i < lines.length && kinds[i] === kind ? i : -1
  }
  for (let i = 0; i < lines.length; i++) {
    if (kinds[i] !== "zh" || modes[i] !== "single") continue
    const zh = [i]
    let j
    while ((j = next(zh[zh.length - 1] + 1, "zh")) >= 0) zh.push(j)
    const en = []
    j = next(zh[zh.length - 1] + 1, "en")
    while (j >= 0) {
      en.push(j)
      j = next(j + 1, "en")
    }
    if (en.length === 0) {
      i = zh[zh.length - 1]
      continue
    }
    for (const k of zh) modes[k] = "zh"
    for (const k of en) modes[k] = "en"
    i = en[en.length - 1]
  }
  return modes
}

// Spans for one line, given its mode from pairLines.
export function splitLine(pieces, from, to, mode) {
  if (mode === "en") return [{ from, to, lang: "en" }]
  if (mode === "zh") {
    // Keep a leading bilingual label visible in English: its English half
    // introduces the English line that follows.
    const label = splitLabel(pieces, from, to)
    if (label) return [...label.spans, { from: label.colon + 1, to, lang: "zh" }]
    let k = from
    while (k < to && isSpace(pieces[k])) k++
    if (isAtom(pieces[k]) && pieces[k].en) {
      if (/[:：]/.test(ch(pieces[k + 1]))) k++
      return [{ from: k + 1, to, lang: "zh" }]
    }
    // An English-only label before the Chinese stays too: "🗄️ Space: O(capacity)。翻倍…"
    for (let i = k; i < to && !isHan(pieces[i]); i++) {
      if (ch(pieces[i]) === ":" && isSpace(pieces[i + 1])) return [{ from: i + 1, to, lang: "zh" }]
    }
    return [{ from, to, lang: "zh" }]
  }
  let label = splitLabel(pieces, from, to)
  // Not a label when only English follows: "…“撤销 / 读前一个” Same stack idea: undo…"
  if (
    label &&
    count(pieces, label.colon, to, isHan) === 0 &&
    count(pieces, label.colon, to, isLetter) > 1
  ) {
    label = null
  }
  const rest = label ? label.colon + 1 : from
  const spans = label ? [...label.spans] : []
  spans.push(...(splitArrow(pieces, rest, to) ?? splitSegments(pieces, rest, to)))
  return spans
}

// Bilingual asides in parentheses are split on their own, and so is the text
// around them: "保持原顺序 Keeps the order (题目不要求 not required)".
function splitSegments(pieces, from, to) {
  const spans = []
  let start = from
  for (const group of [...parenGroups(pieces, from, to), { open: to, close: to - 1, spans: [] }]) {
    spans.push(...(splitTail(pieces, start, group.open) ?? []))
    spans.push(...group.spans)
    start = group.close + 1
  }
  return spans
}

const OPEN = { "（": "）", "(": ")" }

function unbalanced(pieces, from, to) {
  return (
    count(pieces, from, to, (p) => /[)）]/.test(ch(p))) >
    count(pieces, from, to, (p) => /[(（]/.test(ch(p)))
  )
}

// "（下标映射 index mapping）", "(本题 this one)": parentheses holding Chinese
// and its translation. Full-width ones are shown as "(index mapping)" in English.
function parenGroups(pieces, from, to) {
  const groups = []
  for (let i = from; i < to; i++) {
    const close = OPEN[ch(pieces[i])]
    if (!close) continue
    let j = i + 1
    while (j < to && ch(pieces[j]) !== close && ch(pieces[j]) !== ch(pieces[i])) j++
    if (ch(pieces[j]) !== close) continue
    const inner = splitTail(pieces, i + 1, j)
    if (inner) {
      const spans = [...inner]
      if (close === "）") {
        const open = i > from && !isSpace(pieces[i - 1]) ? " (" : "("
        spans.unshift({ from: i, to: i + 1, lang: "zh", alt: open })
        spans.push({ from: j, to: j + 1, lang: "zh", alt: ")" })
      }
      groups.push({ open: i, close: j, spans })
    }
    i = j
  }
  return groups
}

// Titles are plain strings. Besides "中文 English", handles "English（中文）"
// ("Prompt Caching（提示缓存）"), whose English version drops the parentheses.
// Returns [{ text, lang? }] segments, or null when there's nothing to split.
export function splitTitle(text) {
  const pieces = Array.from(text)
  let spans = splitTail(pieces)
  if (!spans) {
    const m = text.match(
      /^([^\p{Script=Han}]*[A-Za-z][^\p{Script=Han}]*?)(\s*[（(][^()（）]*\p{Script=Han}[^()（）]*[）)])$/u,
    )
    if (!m) return null
    spans = [{ from: Array.from(m[1]).length, to: pieces.length, lang: "zh" }]
  }
  const segments = []
  let i = 0
  for (const s of spans) {
    if (s.from > i) segments.push({ text: pieces.slice(i, s.from).join("") })
    segments.push({ text: pieces.slice(s.from, s.to).join(""), lang: s.lang })
    if (s.alt) segments.push({ text: s.alt, lang: "en" })
    i = s.to
  }
  if (i < pieces.length) segments.push({ text: pieces.slice(i).join("") })
  return segments
}
