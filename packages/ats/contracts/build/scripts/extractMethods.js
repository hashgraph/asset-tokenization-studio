"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const fs_1 = require("fs");
const path_1 = require("path");
const _scripts_1 = require("@scripts");
function getSolidityFiles(dir) {
    const entries = (0, fs_1.readdirSync)(dir);
    let files = [];
    for (const entry of entries) {
        const fullPath = (0, path_1.join)(dir, entry);
        const stats = (0, fs_1.statSync)(fullPath);
        if (stats.isDirectory()) {
            files = files.concat(getSolidityFiles(fullPath));
        }
        else if ((0, path_1.extname)(entry) === '.sol') {
            files.push(fullPath);
        }
    }
    return files;
}
function extractFunctions(content) {
    const regex = /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s+(public|external)((?:\s+\w+)*)\s*(returns\s*\(.*?\))?/g;
    const normalFns = new Set();
    const viewFns = new Set();
    const pureFns = new Set();
    const normalFnsSelector = new Set();
    const viewFnsSelector = new Set();
    const pureFnsSelector = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
        const [fullMatch, name, args, visibility, modifiers = '', returns = '',] = match;
        const normalized = `function ${name}(${args.trim()}) ${visibility}${modifiers}${returns ? ' ' + returns.trim() : ''}`
            .replace(/\s+/g, ' ')
            .trim();
        const lower = modifiers.toLowerCase();
        const selector = _scripts_1.REGEX_SELECTOR.exec(fullMatch);
        if (selector === null)
            continue;
        const [fullMatchSelector] = selector;
        if (lower.includes('pure')) {
            if (pureFnsSelector.has(fullMatchSelector))
                continue;
            pureFnsSelector.add(fullMatchSelector);
            pureFns.add(normalized);
        }
        else if (lower.includes('view')) {
            if (viewFnsSelector.has(fullMatchSelector))
                continue;
            viewFnsSelector.add(fullMatchSelector);
            viewFns.add(normalized);
        }
        else {
            if (normalFnsSelector.has(fullMatchSelector))
                continue;
            normalFnsSelector.add(fullMatchSelector);
            normalFns.add(normalized);
        }
    }
    return { normalFns, viewFns, pureFns };
}
function main() {
    const files = getSolidityFiles(_scripts_1.CONTRACTS_DIR);
    const normalSet = new Set();
    const viewSet = new Set();
    const pureSet = new Set();
    const normalSetSelectors = new Set();
    const viewSetSelectors = new Set();
    const pureSetSelectors = new Set();
    for (const file of files) {
        const content = (0, fs_1.readFileSync)(file, 'utf8');
        const { normalFns, viewFns, pureFns } = extractFunctions(content);
        normalFns.forEach((fn) => {
            const selector = _scripts_1.REGEX_SELECTOR.exec(fn);
            if (selector === null)
                return;
            const [fullMatchSelector] = selector;
            if (normalSetSelectors.has(fullMatchSelector))
                return;
            normalSetSelectors.add(fullMatchSelector);
            normalSet.add(fn);
        });
        viewFns.forEach((fn) => {
            const selector = _scripts_1.REGEX_SELECTOR.exec(fn);
            if (selector === null)
                return;
            const [fullMatchSelector] = selector;
            if (viewSetSelectors.has(fullMatchSelector))
                return;
            viewSetSelectors.add(fullMatchSelector);
            viewSet.add(fn);
        });
        pureFns.forEach((fn) => {
            const selector = _scripts_1.REGEX_SELECTOR.exec(fn);
            if (selector === null)
                return;
            const [fullMatchSelector] = selector;
            if (pureSetSelectors.has(fullMatchSelector))
                return;
            pureSetSelectors.add(fullMatchSelector);
            pureSet.add(fn);
        });
    }
    const output = [
        '====== ✅ Non-view/pure external/public methods ======\n',
        ...Array.from(normalSet).sort(),
        '\n====== 👁️ View functions ======\n',
        ...Array.from(viewSet).sort(),
        '\n====== 🧪 Pure functions ======\n',
        ...Array.from(pureSet).sort(),
    ];
    (0, fs_1.writeFileSync)(_scripts_1.OUTPUT_FILE, output.join('\n'), 'utf8');
    console.log(`✅ Methods extracted to ${_scripts_1.OUTPUT_FILE}`);
}
main();
