/* eslint-disable no-undef */

// Replace 'interface' with 'interfaces' in TypeChain generated files to avoid compilation errors
import fs from 'fs'
import { sync as globSync } from 'glob'
const PATTERN = 'typechain-types/**/*.ts'
const files = globSync(PATTERN, { nodir: true })
files.forEach((file) => {
    let text = fs.readFileSync(file, 'utf8')
    const orig = text
    text = text.replace(
        /\b(import\s+type\s+\*\s+as\s+)interface(\s+from\s+['"]\.\/interface['"])/g,
        '$1interfaces$2'
    )
    text = text.replace(
        /\b(export\s+type\s+\{\s*)interface(\s*\})/g,
        '$1interfaces$2'
    )
    text = text.replace(
        /\b(export\s+\*\s+as\s+)interface(\s+from\s+['"]\.\/interface['"])/g,
        '$1interfaces$2'
    )
    if (text !== orig) {
        fs.writeFileSync(file, text, 'utf8')
        console.log(`Patched ${file}`)
    }
})
