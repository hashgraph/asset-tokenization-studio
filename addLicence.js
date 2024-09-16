const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Function to prepend content to each TypeScript file
async function prependContentToFiles(directory, contentFile, fileExtension) {
    try {
        // Read the content to be prepended
        const content = await fs.readFile(contentFile, 'utf8');
        const comment = `/*\n${content}\n*/\n\n`;

        // Find all TypeScript files in the specified directory
        const files = glob.sync(`${directory}/**/*.${fileExtension}`);

        // Prepend the comment to each file
        for (const file of files) {
            const existingContent = await fs.readFile(file, 'utf8');

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
        console.error('Error:', error);
    }
}

// Usage example (adjust the paths as needed)
prependContentToFiles('./uiComponents/src/**', './LICENSE', 'tsx');
