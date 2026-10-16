// Local Quartz filter: a note is left out of the site when its frontmatter has
// `publish: false` or `draft: true`. Everything else is published.
const isTrue = (v) => v === true || v === "true"
const isFalse = (v) => v === false || v === "false"

export const manifest = {
  name: "publish-filter",
  displayName: "Publish Filter",
  description: "Excludes notes marked publish: false or draft: true",
  version: "1.0.0",
  category: "filter",
}

export default function PublishFilter() {
  return {
    name: "PublishFilter",
    shouldPublish(_ctx, [_tree, vfile]) {
      const fm = vfile.data?.frontmatter ?? {}
      return !isFalse(fm.publish) && !isTrue(fm.draft)
    },
  }
}
