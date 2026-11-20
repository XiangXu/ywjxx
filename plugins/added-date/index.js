// Local Quartz plugin: sorts the left Explorer by the date each note was added,
// oldest first, so notes read in the order they were written.
//
// The Explorer builds its tree in the browser from contentIndex.json, which has
// no dates. This plugin reads each note's frontmatter `created` date at build
// time and inlines a { filePath: "YYYY-MM-DD" } map plus the sort function
// (window.sortByAdded). quartz.config.yaml points the Explorer's `sortFn` at it.
//
// Order inside a folder: subfolders (A–Z), the 📌 overview note, then notes by
// `created`, oldest first (newest at the bottom). Notes added on the same day are
// sorted by title.
import { readdirSync, readFileSync } from "node:fs"
import { join, relative, sep } from "node:path"

const CREATED = /^created:\s*["']?(\d{4}-\d{2}-\d{2})/m

function addedDates(dir) {
  const dates = {}
  const visit = (folder) => {
    for (const entry of readdirSync(folder, { withFileTypes: true })) {
      const path = join(folder, entry.name)
      if (entry.isDirectory()) visit(path)
      else if (entry.name.endsWith(".md")) {
        const frontmatter = readFileSync(path, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1]
        const created = frontmatter?.match(CREATED)?.[1]
        if (created) dates[relative(dir, path).split(sep).join("/").normalize("NFC")] = created
      }
    }
  }
  visit(dir)
  return dates
}

// Runs in the browser. `a` and `b` are Explorer tree nodes.
function sortByAdded(a, b) {
  const byName = () =>
    (a.displayName || "").localeCompare(b.displayName || "", undefined, {
      numeric: true,
      sensitivity: "base",
    })
  if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
  if (a.isFolder) return byName()
  const pinned = (node) => (node.data?.filePath || "").split("/").pop().startsWith("📌")
  if (pinned(a) !== pinned(b)) return pinned(a) ? -1 : 1
  const date = (node) => ADDED[(node.data?.filePath || "").normalize("NFC")] || ""
  return date(a).localeCompare(date(b)) || byName()
}

export const manifest = {
  name: "added-date",
  displayName: "Added Date",
  description: "Sorts the Explorer by the date each note was added",
  version: "1.0.0",
  category: "transformer",
}

export default function AddedDate() {
  return {
    name: "AddedDate",
    // Nothing to transform; Quartz only loads transformers that have one of these.
    htmlPlugins: () => [],
    externalResources(ctx) {
      const dates = JSON.stringify(addedDates(ctx.argv.directory))
      return {
        js: [
          {
            loadTime: "beforeDOMReady",
            contentType: "inline",
            spaPreserve: true,
            script: `(() => {\nconst ADDED = ${dates};\nwindow.sortByAdded = ${sortByAdded.toString()}\n})()`,
          },
        ],
      }
    },
  }
}
