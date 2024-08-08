const { execSync } = require("node:child_process");

const dir = __dirname;
const webDir = `${dir}/web`;
const uiComponentsDir = `${dir}/uiComponents`;
const sdkDir = `${dir}/sdk`;
const conDir = `${dir}/contracts`;

const handleError = (error, stdout, stderr) => {
  if (error) {
    console.error(error);
  }
};

const npmInstall = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  execSync(`cd ${dir} && npm ci`, handleError);
  console.log("\tDone");
};

const yarnInstall = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  execSync(`cd ${dir} && yarn install --frozen-lockfile`, handleError);
  console.log("\tDone");
};

const yarnInstallPeer = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  execSync(`cd ${dir} && yarn install --frozen-lockfile && yarn install-peers`, handleError);
  console.log("\tDone");
};

const npmBuild = (dir,name='module') =>{
  process.stdout.write(`Build for ${name}...`);
  execSync(`cd ${dir} && npm run build`, handleError);
  console.log("\tDone");
}

const npmCompile = (dir,name='module') =>{
  process.stdout.write(`Compile for ${name}...`);
  execSync(`cd ${dir} && npm run compile:force`, handleError);
  console.log("\tDone");
}

const npmRollup = (dir,name='module') =>{
  process.stdout.write(`Rollup for ${name}...`);
  execSync(`cd ${dir} && npm run rollup`, handleError);
  console.log("\tDone");
}

let option = process.argv.slice(2)[0];

if (option) {
  npmInstall(`${dir}/${option}`, option.toUpperCase());
} else {
  npmInstall(conDir, "CONTRACTS");
  npmCompile(conDir, "CONTRACTS");
  npmInstall(sdkDir, "SDK");
  npmBuild(sdkDir, "SDK");
  // yarnInstallPeer(uiComponentsDir, "UICOMPONENTS");
  // npmRollup(uiComponentsDir, "UICOMPONENTS");
  yarnInstall(webDir, "WEB");
}

// npmLinkProject(cliDir);
