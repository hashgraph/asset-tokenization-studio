const { execSync } = require("child_process");
const path = require("path");

const dir = __dirname;
const webDir = path.join(dir, "web");
const sdkDir = path.join(dir, "sdk");
const conDir = path.join(dir, "contracts");

const handleError = (error) => {
  if (error) {
    console.error(error);
  }
};

const npmInstall = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  try {
    execSync(`cd ${dir} && npm ci`, handleError);
    console.log("\tDone");
  } catch (error) {
    console.error(`Failed to install dependencies for ${name}`);
  }
};

const yarnInstall = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  try {
    execSync(`cd ${dir} && yarn install --frozen-lockfile`, handleError);
    console.log("\tDone");
  } catch (error) {
    console.error(`Failed to install dependencies for ${name}`);
  }
};

const npmBuild = (dir, name = "module") => {
  process.stdout.write(`Building ${name}...`);
  try {
    execSync(`cd ${dir} && npm run build`, handleError);
    console.log("\tDone");
  } catch (error) {
    console.error(`Failed to build ${name}`);
  }
};

const npmCompile = (dir, name = "module") => {
  process.stdout.write(`Compiling ${name}...`);
  try {
    execSync(`cd ${dir} && npm run compile:force`, handleError);
    console.log("\tDone");
  } catch (error) {
    console.error(`Failed to compile ${name}`);
  }
};

let option = process.argv.slice(2)[0];

if (option) {
  npmInstall(path.join(dir, option), option.toUpperCase());
} else {
  npmInstall(dir, "ROOT");
  npmInstall(conDir, "CONTRACTS");
  npmCompile(conDir, "CONTRACTS");
  npmInstall(sdkDir, "SDK");
  npmBuild(sdkDir, "SDK");
  yarnInstall(webDir, "WEB");
}
