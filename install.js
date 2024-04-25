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
  execSync(`cd ${dir} && npm install`, handleError);
  console.log("\tDone");
};

const yarnInstall = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  execSync(`cd ${dir} && yarn install`, handleError);
  console.log("\tDone");
};

const yarnInstallPeer = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  execSync(`cd ${dir} && yarn install && yarn install-peers`, handleError);
  console.log("\tDone");
};

let option = process.argv.slice(2)[0];

if (option) {
  npmInstall(`${dir}/${option}`, option.toUpperCase());
} else {
  npmInstall(conDir, "CONTRACTS");
  npmInstall(sdkDir, "SDK");
  yarnInstallPeer(uiComponentsDir, "UICOMPONENTS");
  yarnInstall(webDir, "WEB");
}

// npmLinkProject(cliDir);
