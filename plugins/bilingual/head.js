// Runs in <head> before the page is drawn, so the wrong language never flashes.
let lang = null
try {
  lang = localStorage.getItem("lang")
} catch {}
if (lang !== "zh" && lang !== "en") lang = BILINGUAL.defaultLanguage
document.documentElement.dataset.lang = lang
document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"
