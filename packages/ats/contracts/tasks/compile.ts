// SPDX-License-Identifier: Apache-2.0

import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import fs from "fs";
import { sync as globSync } from "glob";
import { Artifact } from "hardhat/types";
import path from "path";

task(
  TASK_COMPILE,
  "🛠  Compile, clone neutral interfaces into the ERC3643 subtree, patch the TypeChain " +
    "'interface' keyword collision, and regenerate the contract registry.",
  async function (taskArguments, hre, runSuper) {
    // Hash codegen MUST run before solc so the rewritten hex is folded as a
    // compile-time constant. Running it after compile would emit the new hex
    // but leave the bytecode pointing at the previous values.
    await hre.run("generate-hashes", { silent: true });

    await runSuper(taskArguments);

    await hre.run("erc3643-clone-interfaces");
    const PATTERN = `${hre.config.typechain.outDir}/**/*.ts`;
    patchTypeChainFiles(PATTERN);

    // Generate registry after successful compilation
    // This ensures the registry always reflects the latest contract state
    // Use --silent flag to minimize output during compilation
    await hre.run("generate-registry", { silent: true });
  },
);

function patchTypeChainFiles(pattern: string) {
  const files = globSync(pattern, { nodir: true });
  files.forEach((file) => {
    let text = fs.readFileSync(file, "utf8");
    const orig = text;
    text = text.replace(/\b(import\s+type\s+\*\s+as\s+)interface(\s+from\s+['"]\.\/interface['"])/g, "$1interfaces$2");
    text = text.replace(/\b(export\s+type\s+\{\s*)interface(\s*\})/g, "$1interfaces$2");
    text = text.replace(/\b(export\s+\*\s+as\s+)interface(\s+from\s+['"]\.\/interface['"])/g, "$1interfaces$2");
    if (text !== orig) {
      fs.writeFileSync(file, text, "utf8");
      console.log(`Patched ${file}`);
    }
  });
}

function autoGenHeader(sourcePath: string): string {
  return [
    "// AUTO-GENERATED — DO NOT EDIT.",
    `// Source: ${sourcePath}`,
    "// Regenerated on every `npx hardhat compile` by the",
    "// `erc3643-clone-interfaces` task in `tasks/compile.ts`.",
    "// Edits to this file will be silently overwritten.",
  ].join("\n");
}

function injectHeader(source: string, header: string): string {
  // Insert the header immediately after the SPDX line if present, otherwise at the top.
  const spdxMatch = source.match(/^(\/\/\s*SPDX-License-Identifier:[^\n]*\n)/);
  if (spdxMatch) {
    return source.replace(spdxMatch[0], `${spdxMatch[0]}${header}\n`);
  }
  return `${header}\n${source}`;
}

task("erc3643-clone-interfaces", async (_, hre) => {
  interface DataSubstitution {
    original: string;
    removeImports?: boolean;
    changePragma?: boolean;
    removeHierarchy?: boolean;
  }
  const targetDir = hre.config.paths.sources + "/factory/ERC3643/interfaces";
  const interfacesToClone: DataSubstitution[] = [
    { original: "IAccessControl" },
    { original: "IBondTypes" },
    { original: "IBondRead", removeImports: false, removeHierarchy: false },
    {
      original: "IBusinessLogicResolver",
      removeImports: false,
      removeHierarchy: false,
    },
    {
      original: "IDiamondCutManager",
      removeImports: false,
    },
    {
      original: "IDiamondLoupe",
      removeImports: false,
      removeHierarchy: false,
    },
    { original: "IEquity" },
    { original: "IFactory", removeImports: false },
    { original: "IResolverProxy" },
    { original: "IStaticFunctionSelectors" },
    { original: "ICore", removeImports: false },
    // Coupon Interest Rates interfaces
    { original: "IFixedRate" },
    { original: "IKpiLinkedRateErrors" },
    { original: "IKpiLinkedRate", removeImports: false, removeHierarchy: false },
    {
      original: "ICouponListing",
      removeImports: false,
    },
  ];

  const normalized = interfacesToClone.map((i) => ({
    original: i.original,
    removeImports: i.removeImports ?? true,
    changePragma: i.changePragma ?? true,
    removeHierarchy: i.removeHierarchy ?? true,
  }));

  const constants = [
    { src: "constants/regulation", dst: "regulation" },
    { src: "constants/roles", dst: "roles" },
    {
      src: "facets/layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon",
      dst: "IScheduledTasksCommon",
    },
  ];

  function rewriteImports(source: string): string {
    // 1. Remove any imports to *StorageWrapper.sol files
    source = source.replace(/^\s*import\s+[^;]*StorageWrapper\.sol['"];\s*$/gm, "");

    // 2. Rewrite the rest of the imports
    return source.replace(
      /import\s*\{([^}]+)\}\s*from\s*['"](.+\/)?([^/]+)\.sol['"];/gm,
      (_match, names, _path, filePath) => {
        const fileNoExt = filePath.replace(/\.sol$/, "");

        const rewritten = names
          .split(",")
          .map((n: string) => n.trim())
          .filter((n: string) => n.length > 0)
          .map((n: string) => {
            const isConstant = constants.some((c) => filePath.includes(c.src.split("/").pop() || c));
            return isConstant ? n : `TRex${n} as ${n}`;
          })
          .join(", ");

        return `import {${rewritten}} from "./${fileNoExt}.sol";`;
      },
    );
  }

  const interfaceResults = await Promise.all(
    normalized.map(async (i): Promise<boolean> => {
      const originalArtifact = await hre.artifacts.readArtifact(i.original);
      let erc3643Artifact: Artifact | undefined;
      try {
        const parts = i.original.split(":");
        erc3643Artifact = await hre.artifacts.readArtifact("TRex" + parts[parts.length - 1]);
      } catch {
        console.log(`Contract ${i.original} in ERC3643/interfaces not found, will be generated`);
      }

      const shouldGenerate =
        !erc3643Artifact || JSON.stringify(originalArtifact.abi) !== JSON.stringify(erc3643Artifact.abi);

      if (!shouldGenerate) {
        console.log(`Did not generate ${i.original} because an up-to-date version already exists`);
        return false;
      }

      let source = fs.readFileSync(originalArtifact.sourceName, "utf8");

      if (i.removeImports) {
        source = source.replace(/^\s*import\s+[^;]+;\s*$/gm, "");
      } else {
        source = rewriteImports(source);
      }

      if (i.changePragma) {
        source = source.replace(/^pragma solidity\s+[^;]+;/m, "pragma solidity ^0.8.17;");
      }

      // Rename interface/contract; optionally preserve inheritance clause
      source = source.replace(
        new RegExp(`(contract|interface)\\s+${originalArtifact.contractName}\\b(\\s+is[^\\{]+)?`, "m"),
        i.removeHierarchy ? `$1 TRex${originalArtifact.contractName}` : `$1 TRex${originalArtifact.contractName}$2`,
      );

      const targetPath = `${targetDir}/${originalArtifact.contractName}.sol`;
      const header = autoGenHeader(originalArtifact.sourceName);
      fs.writeFileSync(targetPath, injectHeader(source, header), "utf8");
      console.log(`Generated: ${targetPath}`);
      return true;
    }),
  );
  let anyRegenerated = interfaceResults.some(Boolean);

  for (const c of constants) {
    const src = path.join(hre.config.paths.sources, `${c.src}.sol`);
    const dst = path.join(targetDir, `${c.dst}.sol`);

    if (!fs.existsSync(src)) {
      throw new Error(
        `❌ erc3643-clone-interfaces: declared constant source not found: ${src}. ` +
          "Remove the entry from `constants` or restore the file.",
      );
    }

    let content = fs.readFileSync(src, "utf8");
    content = content.replace(/^pragma solidity\s+[^;]+;/m, "pragma solidity ^0.8.17;");
    const header = autoGenHeader(`contracts/${c.src}.sol`);
    const next = injectHeader(content, header);

    // Skip write when the on-disk copy already matches — avoids touching mtimes
    // and forces Prettier to revisit a file with no semantic delta.
    if (fs.existsSync(dst) && fs.readFileSync(dst, "utf8") === next) {
      console.log(`Constant up-to-date, skipped: ${dst}`);
      continue;
    }

    fs.writeFileSync(dst, next, "utf8");
    console.log(`Copied constant with updated pragma: ${dst}`);
    anyRegenerated = true;
  }

  if (!anyRegenerated) {
    console.log("⏭  No ERC3643 interface or constant regenerated — skipping Prettier pass");
    return;
  }

  const { execWithErrorHandling } = await import("./utils/errorHandling");

  try {
    await execWithErrorHandling(
      "npx prettier --write ./contracts/factory/ERC3643/interfaces",
      "Prettier code formatting",
    );
    console.log("✅ Successfully formatted ERC3643 interface files");
  } catch (error) {
    console.error("Failed to format ERC3643 interface files");
    throw error;
  }
});
