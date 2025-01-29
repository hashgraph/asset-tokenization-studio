#!/usr/bin/env node
const fs = require("fs-extra");
const glob = require("glob");

// Function to prepend content to each TypeScript file
async function prependContentToFiles(rootDirectory, contentFile, fileExtension) {
  try {
    // Read the content to be prepended
    const content = await fs.readFile(contentFile, "utf8");
    const comment = `/*\n${content}\n*/\n\n`;

    // Find all TypeScript files in the specified root directory, excluding node_modules
    const files = glob.sync(`${rootDirectory}/**/*.${fileExtension}`, {
      ignore: "**/node_modules/**", // Exclude node_modules
    });

    // Prepend the comment to each file
    for (const file of files) {
      const existingContent = await fs.readFile(file, "utf8");

      // Check if the license header is already present at the beginning of the file
      if (!existingContent.startsWith(comment)) {
        // If not, prepend the comment
        await fs.writeFile(file, comment + existingContent);
        console.log(`Prepended content to ${file}`);
      } else {
        console.log(`License header already exists in ${file}, skipping.`);
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Usage example: Applies to all `.ts` files in the current directory and its subdirectories, excluding node_modules
prependContentToFiles("./", "./LICENSE", "ts");
