import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { CONTRACTS_DIR, OUTPUT_FILE, REGEX_SELECTOR } from '@scripts';

function getSolidityFiles(dir: string): string[] {
  const entries = readdirSync(dir);
  let files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files = files.concat(getSolidityFiles(fullPath));
    } else if (extname(entry) === '.sol') {
      files.push(fullPath);
    }
  }

  return files;
}

function extractFunctions(content: string) {
  const regex =
    /function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)\s+(public|external)((?:\s+\w+)*)\s*(returns\s*\(.*?\))?/g;

  const normalFns = new Set<string>();
  const viewFns = new Set<string>();
  const pureFns = new Set<string>();

  const normalFnsSelector = new Set<string>();
  const viewFnsSelector = new Set<string>();
  const pureFnsSelector = new Set<string>();

  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, name, args, visibility, modifiers = '', returns = ''] =
      match;

    const normalized =
      `function ${name}(${args.trim()}) ${visibility}${modifiers}${returns ? ' ' + returns.trim() : ''}`
        .replace(/\s+/g, ' ')
        .trim();

    const lower = modifiers.toLowerCase();
    const selector = REGEX_SELECTOR.exec(fullMatch);

    if (selector === null) continue;

    const [fullMatchSelector] = selector;

    if (lower.includes('pure')) {
      if (pureFnsSelector.has(fullMatchSelector)) continue;
      pureFnsSelector.add(fullMatchSelector);
      pureFns.add(normalized);
    } else if (lower.includes('view')) {
      if (viewFnsSelector.has(fullMatchSelector)) continue;
      viewFnsSelector.add(fullMatchSelector);
      viewFns.add(normalized);
    } else {
      if (normalFnsSelector.has(fullMatchSelector)) continue;
      normalFnsSelector.add(fullMatchSelector);
      normalFns.add(normalized);
    }
  }

  return { normalFns, viewFns, pureFns };
}

export function main() {
  const files = getSolidityFiles(CONTRACTS_DIR);

  const normalSet = new Set<string>();
  const viewSet = new Set<string>();
  const pureSet = new Set<string>();

  const normalSetSelectors = new Set<string>();
  const viewSetSelectors = new Set<string>();
  const pureSetSelectors = new Set<string>();

  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    const { normalFns, viewFns, pureFns } = extractFunctions(content);

    normalFns.forEach((fn) => {
      const selector = REGEX_SELECTOR.exec(fn);

      if (selector === null) return;

      const [fullMatchSelector] = selector;

      if (normalSetSelectors.has(fullMatchSelector)) return;
      normalSetSelectors.add(fullMatchSelector);
      normalSet.add(fn);
    });

    viewFns.forEach((fn) => {
      const selector = REGEX_SELECTOR.exec(fn);

      if (selector === null) return;

      const [fullMatchSelector] = selector;

      if (viewSetSelectors.has(fullMatchSelector)) return;
      viewSetSelectors.add(fullMatchSelector);
      viewSet.add(fn);
    });

    pureFns.forEach((fn) => {
      const selector = REGEX_SELECTOR.exec(fn);

      if (selector === null) return;

      const [fullMatchSelector] = selector;

      if (pureSetSelectors.has(fullMatchSelector)) return;
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

  writeFileSync(OUTPUT_FILE, output.join('\n'), 'utf8');
  console.log(`✅ Methods extracted to ${OUTPUT_FILE}`);
}

main();
