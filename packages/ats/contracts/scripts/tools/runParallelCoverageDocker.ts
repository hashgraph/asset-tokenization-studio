import fs from "fs";
import path from "path";
import { execSync, spawn } from "child_process";
import { glob } from "glob";
// Configuration
const REPO_ROOT = process.cwd();
const TEMP_DIR = path.join(REPO_ROOT, ".coverage_parallel_temp");
const COVERAGE_DIR = path.join(REPO_ROOT, "coverage");
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "2", 10);
const DOCKER_IMAGE = "ats-contracts-coverage"; // Add missing DOCKER_IMAGE constant
/**
 * Builds the Docker image based on Dockerfile.coverage
 */
function buildDockerImage(): number {
  const start = Date.now();
  console.log("🐳 Building Docker image from Dockerfile.coverage...");
  try {
    execSync("npm run docker:build", {
      cwd: REPO_ROOT,
      stdio: "inherit",
    });
    const duration = Date.now() - start;
    console.log(`✅ Docker image built successfully in ${(duration / 1000).toFixed(2)}s.`);
    return duration;
  } catch (error) {
    console.error("❌ Error building Docker image:", error);
    process.exit(1);
  }
}
/**
 * Finds all test files in the project
 */
async function findTestFiles(): Promise<string[]> {
  // Adjust the glob pattern according to your project structure
  const files = await glob("test/contracts/**/*.ts", { cwd: REPO_ROOT });
  return files.map((f) => path.join(REPO_ROOT, f));
}
/**
 * Runs a single coverage test
 */
function runCoverageForTestFile(testFile: string, workerId: number): Promise<{ reportPath: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const relativeTestFile = path.relative(REPO_ROOT, testFile);
    const workerDir = path.join(TEMP_DIR, `worker_${workerId}`);
    const workerCoverageDir = path.join(workerDir, "coverage");
    console.log(`[Worker ${workerId}] 🚀 Starting coverage for ${relativeTestFile}...`);
    // Docker paths
    const dockerTestFile = `/usr/src/app/packages/ats/contracts/${relativeTestFile}`;
    // Ensure local directories exist
    if (!fs.existsSync(workerCoverageDir)) {
      fs.mkdirSync(workerCoverageDir, { recursive: true });
    }
    // Docker run command - fixed volume paths
    const dockerCmd = [
      "docker",
      "run",
      "--rm",
      "-v",
      `${workerCoverageDir}:/usr/src/temp/coverage-workers/worker_${workerId}/coverage`,
      DOCKER_IMAGE,
      "npx",
      "hardhat",
      "coverage",
      "--testfiles",
      dockerTestFile,
    ];
    console.log(`[Worker ${workerId}] Running: ${dockerCmd.join(" ")}`);
    const child = spawn(dockerCmd[0], dockerCmd.slice(1), {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        NODE_ENV: "test",
        TS_NODE_TRANSPILE_ONLY: "true",
      },
      stdio: "pipe",
    });
    child.stdout.on("data", (data) => {
      const line = data.toString();
      if (line.trim()) console.log(`[Worker ${workerId}] ${line.trim()}`);
    });
    child.stderr.on("data", (data) => {
      const line = data.toString();
      if (line.trim()) console.log(`[Worker ${workerId}] ${line.trim()}`);
    });
    child.on("close", (code) => {
      const duration = Date.now() - start;
      if (code !== 0) {
        reject(new Error(`Docker command failed with exit code ${code}`));
        return;
      }
      // Copy the coverage report from Docker to local
      const defaultReport = path.join(REPO_ROOT, "coverage", "coverage-final.json");
      if (fs.existsSync(defaultReport)) {
        const destReport = path.join(workerCoverageDir, "coverage-final.json");
        fs.copyFileSync(defaultReport, destReport);
        resolve({ reportPath: destReport, duration });
      } else {
        resolve({ reportPath: "", duration });
      }
    });
    child.on("error", (error) => {
      reject(error);
    });
  });
}
/**
 * Merges the coverage reports from all workers
 */
function mergeReports(reportPaths: string[]): void {
  if (reportPaths.length === 0) {
    console.log("⚠️ No reports found to merge.");
    return;
  }
  console.log("📊 Merging coverage reports...");
  // Logic based on context [2]
  const mergedReportPath = path.join(COVERAGE_DIR, "coverage-final.json");
  // nyc merge expects a directory
  const mergeTempDir = path.join(TEMP_DIR, "merge_input");
  if (!fs.existsSync(mergeTempDir)) fs.mkdirSync(mergeTempDir, { recursive: true });
  reportPaths.forEach((reportPath, idx) => {
    if (fs.existsSync(reportPath)) {
      fs.copyFileSync(reportPath, path.join(mergeTempDir, `report-${idx}.json`));
    }
  });
  try {
    // Execute merge
    const mergeCommand = `npx nyc merge ${mergeTempDir} ${mergedReportPath}`;
    console.log(`Executing: ${mergeCommand}`);
    execSync(mergeCommand, { cwd: REPO_ROOT });
    // Generate final HTML and text report
    const reportCommand = `npx nyc report --reporter=html --reporter=text --temp-dir ${COVERAGE_DIR}`;
    console.log(`Generating final report: ${reportCommand}`);
    execSync(reportCommand, { cwd: REPO_ROOT });
    console.log(`✅ Merged report generated at ${mergedReportPath}`);
  } catch (error) {
    console.error("❌ Error during coverage merging:", error);
  }
}
/**
 * Main orchestration function - Enhanced version with optimized test ordering
 */
async function runParallelCoverageDocker() {
  const totalStart = Date.now();
  console.log(`🏁 Starting parallel coverage with concurrency: ${CONCURRENCY}`);
  // 1. Generate Docker image (user requirement)
  const dockerBuildDuration = buildDockerImage();
  // 2. Cleanup and preparation
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEMP_DIR, { recursive: true });
  // Create cache and artifacts directories if needed
  const cacheDirs = [
    "packages/ats/contracts/cache",
    "packages/ats/contracts/artifacts",
    "packages/ats/contracts/typechain-types",
  ];
  cacheDirs.forEach((dir) => {
    const fullPath = path.join(REPO_ROOT, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
  // 3. Get tests
  const testFiles = await findTestFiles();
  console.log(`📝 Found ${testFiles.length} test files.`);
  // 3.1. Optimization: Sort by historical duration (longest to shortest)
  // Based on the duration data you provided
  console.log("🚀 Sorting tests by historical duration (longest first) to optimize execution...");
  // Define the historical durations for each test file
  const historicalDurations: Record<string, number> = {
    "test/contracts/unit/layer_1/protectedPartitions/protectedPartitions.test.ts": 1734.36,
    "test/contracts/unit/resolver/diamondCutManager.test.ts": 975.8,
    "test/contracts/unit/layer_1/ERC3643/erc3643.test.ts": 736.79,
    "test/contracts/unit/layer_1/bond/bond.test.ts": 505.81,
    "test/contracts/unit/layer_1/ERC1400/ERC20Permit/erc20Permit.test.ts": 499.2,
    "test/contracts/unit/layer_1/clearing/clearing.test.ts": 484.06,
    "test/contracts/unit/factory/trex/factory.test.ts": 416.47,
    "test/contracts/unit/layer_1/securityUSA/securityUSA.test.ts": 401.69,
    "test/contracts/unit/layer_1/ERC1400/ERC1410/erc1410.test.ts": 346.26,
    "test/contracts/unit/layer_1/hold/hold.test.ts": 339.45,
    "test/contracts/unit/layer_1/lock/lock.test.ts": 334.54,
    "test/contracts/unit/layer_1/cap/cap.test.ts": 330.2,
    "test/contracts/unit/factory/factory.test.ts": 327.69,
    "test/contracts/unit/resolver/diamondLoupeFacet.test.ts": 316.36,
    "test/contracts/unit/layer_1/scheduledTasks/scheduledSnapshots/scheduledSnapshots.test.ts": 316.2,
    "test/contracts/unit/layer_1/ERC1400/ERC20/erc20.test.ts": 317.74,
    "test/contracts/unit/layer_1/ERC1400/ERC1594/erc1594.test.ts": 310.12,
    "test/contracts/unit/layer_1/scheduledTasks/scheduledTasks/scheduledTasks.test.ts": 304.57,
    "test/contracts/unit/layer_1/adjustBalances/adjustBalances.test.ts": 306.66,
    "test/contracts/unit/layer_1/ERC1400/ERC1644/erc1644.test.ts": 306.07,
    "test/contracts/unit/layer_1/accessControl/accessControl.test.ts": 300.91,
    "test/contracts/unit/layer_1/controlList/controlList.test.ts": 291.66,
    "test/contracts/unit/layer_1/transferAndLock/transferAndLock.test.ts": 291.68,
    "test/contracts/unit/layer_1/equity/equity.test.ts": 289.11,
    "test/contracts/unit/layer_1/kyc/kyc.test.ts": 290.21,
    "test/contracts/unit/layer_1/externalControlLists/externalControlList.test.ts": 287.93,
    "test/contracts/unit/layer_1/pause/pause.test.ts": 287.93,
    "test/contracts/unit/layer_1/corporateActions/corporateActions.test.ts": 285.9,
    "test/contracts/unit/layer_1/externalKycLists/externalKycList.test.ts": 285.81,
    "test/contracts/unit/layer_1/proceedRecipients/proceedRecipients.test.ts": 285.32,
    "test/contracts/unit/layer_1/externalPauses/externalPause.test.ts": 282.86,
    "test/contracts/unit/layer_1/snapshots/snapshots.test.ts": 279.96,
    "test/contracts/unit/layer_1/ERC1400/ERC1643/erc1643.test.ts": 270.74,
    "test/contracts/unit/layer_1/ssi/ssi.test.ts": 270.26,
    "test/contracts/unit/layer_1/security/security.test.ts": 263.7,
    "test/contracts/unit/timeTravel/timeTravel.test.ts": 258.68,
    "test/contracts/unit/factory/trex/fixtures/deploy-full-suite.fixture.ts": 235.55,
    "test/contracts/unit/resolverProxy/resolverProxy.test.ts": 232.17,
    "test/contracts/unit/resolver/BusinessLogicResolver.test.ts": 231.53,
    "test/contracts/unit/factory/regulation.test.ts": 228.54,
    "test/contracts/unit/layer_1/ERC1400/ERC20Votes/erc20Votes.test.ts": 302.54,
    "test/contracts/unit/layer_1/scheduledTasks/scheduledBalanceAdjustments/scheduledBalanceAdjustments.test.ts": 303.5,
  };

  // Sort test files by historical duration (longest first)
  testFiles.sort((a, b) => {
    const relativeA = path.relative(REPO_ROOT, a);
    const relativeB = path.relative(REPO_ROOT, b);
    const durationA = historicalDurations[relativeA] || 0;
    const durationB = historicalDurations[relativeB] || 0;
    return durationB - durationA;
  });

  // 4. Ejecución en paralelo con mejor manejo de async
  const workerPromises: Promise<{ reportPath: string; duration: number }>[] = [];
  const workerResults: { testName: string; duration: string }[] = [];

  for (let i = 0; i < testFiles.length; i++) {
    const testFile = testFiles[i];
    const workerId = i + 1;
    const testName = path.relative(REPO_ROOT, testFile);

    // Control de concurrencia
    if (workerPromises.length >= CONCURRENCY) {
      await Promise.race(workerPromises);
    }

    const promise = runCoverageForTestFile(testFile, workerId)
      .then((result) => {
        if (result.reportPath) {
          console.log(`[Worker ${workerId}] ✅ Completed coverage for ${testName}`);
        }
        workerResults.push({
          testName,
          duration: `${(result.duration / 1000).toFixed(2)}s`,
        });
        return result;
      })
      .catch((error) => {
        console.error(`[Worker ${workerId}] ❌ Failed:`, error);
        workerResults.push({
          testName,
          duration: "FAILED",
        });
        return { reportPath: "", duration: 0 };
      })
      .finally(() => {
        // Remove completed promise from tracking
        const index = workerPromises.indexOf(promise);
        if (index > -1) {
          workerPromises.splice(index, 1);
        }
      });

    workerPromises.push(promise);
  }

  // Wait for all remaining workers to complete
  const finalResults = await Promise.all(workerPromises);

  // 5. Fusión de resultados
  const allReports = finalResults.map((r) => r.reportPath).filter(Boolean);
  mergeReports(allReports as string[]);

  // 6. Limpieza final
  console.log("🧹 Cleaning up temporary workspace...");
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch (error) {
    console.error("Error cleaning up:", error);
  }

  const totalDuration = Date.now() - totalStart;

  // 7. Mostrar tabla de resultados
  console.log("\n📊 Execution Summary:");
  const summaryTable = [
    { Item: "Docker Image Build", Duration: `${(dockerBuildDuration / 1000).toFixed(2)}s` },
    ...workerResults.map((r) => ({ Item: `Test: ${r.testName}`, Duration: r.duration })),
    { Item: "Total Execution Time", Duration: `${(totalDuration / 1000).toFixed(2)}s` },
  ];
  console.table(summaryTable);

  console.log("🏁 Process finished.");
}

runParallelCoverageDocker().catch(console.error);
