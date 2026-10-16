import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { registerCondition } from "./quartz/plugins/loader/conditions"

// Lets a plugin's layout use `condition: is-index` to render only on the homepage.
registerCondition("is-index", (props) => props.fileData.slug === "index")

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
