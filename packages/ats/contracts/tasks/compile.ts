// SPDX-License-Identifier: Apache-2.0

import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import fs from "fs";
import { sync as globSync } from "glob";
import { Artifact } from "hardhat/types";
import path from "path";
import { exec } from "child_process";

task(
  TASK_COMPILE,
  "Replace 'interface' with 'interfaces' in TypeChain generated files to avoid compilation errors",
  async function (taskArguments, hre, runSuper) {
    // Step 1: Generate ERC3643 interfaces FIRST (required by TREXFactory.sol)
    await hre.run("erc3643-clone-interfaces");

    // Step 2: Run main compilation
    await runSuper(taskArguments);

    // Step 3: Patch TypeChain files
    const PATTERN = `${hre.config.typechain.outDir}/**/*.ts`;
    patchTypeChainFiles(PATTERN);

    // Step 4: Generate registry
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

task("erc3643-clone-interfaces", async (_, hre) => {
  interface DataSustitution {
    original: string;
    removeImports?: boolean;
    changePragma?: boolean;
    removeHierarchy?: boolean;
  }

  const targetDir = hre.config.paths.sources + "/factory/ERC3643/interfaces";

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const interfacesToClone: DataSustitution[] = [
    // Base interfaces first (dependencies for others)
    { original: "IAccessControl" },
    { original: "IResolverProxy" },
    { original: "IStaticFunctionSelectors" },
    // Now dependent interfaces
    { original: "IBondRead" },
    {
      original: "IBusinessLogicResolver",
      removeHierarchy: false,
    },
    {
      original: "IDiamondCutManager",
      removeImports: false,
    },
    {
      original: "IDiamondLoupe",
      removeHierarchy: false,
    },
    { original: "IEquity" },
    { original: "IFactory", removeImports: false },
    {
      original: "contracts/facets/features/interfaces/ERC1400/IERC20.sol:IERC20",
      removeImports: false,
    },
    // Coupon Interest Rates interfaces
    { original: "IFixedRate" },
    { original: "IKpiLinkedRate" },
    {
      original: "ISustainabilityPerformanceTargetRate",
      removeImports: false,
    },
    {
      original: "IScheduledCouponListing",
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
    { src: "facets/regulation/constants/regulation", dst: "regulation" },
    { src: "lib/domain/LibRegulation", dst: "LibRegulation" },
    { src: "constants/roles", dst: "roles" },
    {
      src: "facets/assetCapabilities/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon",
      dst: "IScheduledTasksCommon",
    },
  ];

  function rewriteImports(source: string): string {
    // 1. Remove any imports to *StorageWrapper.sol files
    source = source.replace(/^\s*import\s+[^;]*StorageWrapper\.sol['"];\s*$/gm, "");

    // 2. Rewrite remaining imports
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

  // Generate interfaces sequentially to handle dependencies
  for (const i of normalized) {
    let originalArtifact: Artifact;
    try {
      originalArtifact = await hre.artifacts.readArtifact(i.original);
    } catch {
      console.log(`Source artifact for ${i.original} not found, skipping`);
      continue;
    }

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
      continue;
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

    // Rename interface/contract and remove inheritance
    source = source.replace(
      new RegExp(`(contract|interface)\\s+${originalArtifact.contractName}\\b(\\s+is[^\\{]+)?`, "m"),
      `$1 TRex${originalArtifact.contractName}`,
    );

    const targetPath = `${targetDir}/${originalArtifact.contractName}.sol`;
    fs.writeFileSync(targetPath, source, "utf8");
    console.log(`Generated: ${targetPath}`);
  }

  // Copy constant files
  for (const c of constants) {
    const src = path.join(hre.config.paths.sources, `${c.src}.sol`);
    const dst = path.join(targetDir, `${c.dst}.sol`);

    if (fs.existsSync(src)) {
      let content = fs.readFileSync(src, "utf8");

      content = content.replace(/^pragma solidity\s+[^;]+;/m, "pragma solidity ^0.8.17;");

      // Rewrite deep relative imports to local references
      content = content.replace(/from\s+['"]\.\.\/.*\/([^/]+)\.sol['"]/gm, 'from "./$1.sol"');

      fs.writeFileSync(dst, content, "utf8");
      console.log(`Copied constant with updated pragma: ${dst}`);
    } else {
      console.warn(`Not found: ${src}`);
    }
  }

  // Try to format with prettier (non-blocking)
  try {
    await new Promise<void>((resolve, _reject) => {
      exec("npx prettier --write ./contracts/factory/ERC3643/interfaces", (error) => {
        if (error) {
          console.warn("⚠️  Prettier formatting skipped (not available)");
        } else {
          console.log("✅ Formatted ERC3643 interfaces with prettier");
        }
        resolve();
      });
    });
  } catch {
    console.warn("⚠️  Prettier formatting skipped");
  }

  console.log("✅ ERC3643 interface generation completed");
});
