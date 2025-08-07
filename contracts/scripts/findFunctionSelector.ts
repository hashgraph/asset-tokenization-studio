import fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'

interface FunctionMatch {
    contractPath: string
    contractName: string
    functionName: string
    functionSignature: string
    selector: string
    lineNumber?: number
}

/**
 * Recursively finds all .sol files in a directory
 */
function findSolidityFiles(dir: string): string[] {
    const files: string[] = []

    function traverse(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true })

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name)

            if (entry.isDirectory()) {
                traverse(fullPath)
            } else if (entry.isFile() && entry.name.endsWith('.sol')) {
                files.push(fullPath)
            }
        }
    }

    traverse(dir)
    return files
}

/**
 * Parses a Solidity contract file and extracts function information
 */
function parseContractFile(filePath: string): FunctionMatch[] {
    const content = fs.readFileSync(filePath, 'utf8')
    const matches: FunctionMatch[] = []
    const contractName = path.basename(filePath, '.sol')

    // Regular expressions to match function declarations
    const functionRegex = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)/g
    const lines = content.split('\n')

    let match
    while ((match = functionRegex.exec(content)) !== null) {
        const functionName = match[1]
        const fullMatch = match[0]

        // Skip constructors and receive/fallback functions
        if (
            functionName === 'constructor' ||
            functionName === 'receive' ||
            functionName === 'fallback'
        ) {
            continue
        }

        // Find line number
        const beforeMatch = content.substring(0, match.index)
        const lineNumber = beforeMatch.split('\n').length

        // Extract the complete function signature including parameters
        const lineContent = lines[lineNumber - 1]
        let functionSignature = fullMatch

        // Try to get a more complete signature by looking at the actual line
        const functionMatch = lineContent.match(
            /function\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)/
        )
        if (functionMatch) {
            functionSignature = functionMatch[0]
        }

        // Generate selector using ethers
        try {
            // Clean up the signature for ethers
            const cleanSignature = functionSignature
                .replace(/function\s+/, '')
                .replace(/\s+/g, ' ')
                .trim()

            const selector = ethers.utils.id(cleanSignature).slice(0, 10)

            matches.push({
                contractPath: filePath,
                contractName,
                functionName,
                functionSignature: cleanSignature,
                selector,
                lineNumber,
            })
        } catch (error) {
            console.error(
                `Error generating selector for function "${functionName}" in ${filePath}:`,
                error
            )
            // If we can't generate a selector, still include the match
            matches.push({
                contractPath: filePath,
                contractName,
                functionName,
                functionSignature,
                selector: 'ERROR_GENERATING_SELECTOR',
                lineNumber,
            })
        }
    }

    return matches
}

/**
 * Searches for a function selector in all contracts
 */
function findFunctionSelector(targetSelector: string): FunctionMatch[] {
    const contractsDir = path.join(__dirname, '../contracts')

    console.log(`Searching for selector ${targetSelector} in ${contractsDir}`)

    try {
        const files = findSolidityFiles(contractsDir)
        console.log(`Found ${files.length} Solidity files`)

        const allMatches: FunctionMatch[] = []

        for (const file of files) {
            try {
                const matches = parseContractFile(file)
                allMatches.push(...matches)
            } catch (error) {
                console.warn(`Error parsing file ${file}:`, error)
            }
        }

        // Filter matches by selector
        const selectorMatches = allMatches.filter(
            (match) =>
                match.selector.toLowerCase() === targetSelector.toLowerCase()
        )

        return selectorMatches
    } catch (error) {
        console.error('Error searching for selector:', error)
        return []
    }
}

/**
 * Lists all function selectors in all contracts
 */
function listAllSelectors(): FunctionMatch[] {
    const contractsDir = path.join(__dirname, '../contracts')

    console.log(`Listing all function selectors in ${contractsDir}`)

    try {
        const files = findSolidityFiles(contractsDir)
        console.log(`Found ${files.length} Solidity files`)

        const allMatches: FunctionMatch[] = []

        for (const file of files) {
            try {
                const matches = parseContractFile(file)
                allMatches.push(...matches)
            } catch (error) {
                console.warn(`Error parsing file ${file}:`, error)
            }
        }

        return allMatches
    } catch (error) {
        console.error('Error listing selectors:', error)
        return []
    }
}

/**
 * Main function to demonstrate usage
 */
function main() {
    const args = process.argv.slice(2)

    if (args.length === 0) {
        console.log('Usage:')
        console.log(
            '  npm run find-selector <selector>  - Find specific selector'
        )
        console.log('  npm run find-selector --list      - List all selectors')
        console.log('')
        console.log('Examples:')
        console.log('  npm run find-selector 0xa9059cbb')
        console.log('  npm run find-selector --list')
        return
    }

    if (args[0] === '--list') {
        console.log('Listing all function selectors...\n')
        const matches = listAllSelectors()

        // Group by selector
        const groupedMatches = matches.reduce(
            (acc, match) => {
                if (!acc[match.selector]) {
                    acc[match.selector] = []
                }
                acc[match.selector].push(match)
                return acc
            },
            {} as Record<string, FunctionMatch[]>
        )

        // Sort by selector
        const sortedSelectors = Object.keys(groupedMatches).sort()

        console.log(
            `Found ${matches.length} functions with ${sortedSelectors.length} unique selectors:\n`
        )

        for (const selector of sortedSelectors) {
            if (selector === 'ERROR_GENERATING_SELECTOR') continue

            const selectorMatches = groupedMatches[selector]
            console.log(`Selector: ${selector}`)

            for (const match of selectorMatches) {
                const relativePath = path.relative(
                    process.cwd(),
                    match.contractPath
                )
                console.log(`  - ${match.functionSignature}`)
                console.log(`    Contract: ${match.contractName}`)
                console.log(`    File: ${relativePath}:${match.lineNumber}`)
            }
            console.log('')
        }

        // Show errors if any
        if (groupedMatches['ERROR_GENERATING_SELECTOR']) {
            console.log('Functions with selector generation errors:')
            for (const match of groupedMatches['ERROR_GENERATING_SELECTOR']) {
                const relativePath = path.relative(
                    process.cwd(),
                    match.contractPath
                )
                console.log(
                    `  - ${match.functionSignature} in ${match.contractName} (${relativePath}:${match.lineNumber})`
                )
            }
        }
    } else {
        const targetSelector = args[0]
        console.log(`Searching for selector: ${targetSelector}\n`)

        const matches = findFunctionSelector(targetSelector)

        if (matches.length === 0) {
            console.log('No matches found.')
        } else {
            console.log(`Found ${matches.length} match(es):\n`)

            for (const match of matches) {
                const relativePath = path.relative(
                    process.cwd(),
                    match.contractPath
                )
                console.log(`Function: ${match.functionSignature}`)
                console.log(`Contract: ${match.contractName}`)
                console.log(`File: ${relativePath}:${match.lineNumber}`)
                console.log(`Selector: ${match.selector}`)
                console.log('')
            }
        }
    }
}

// Export functions for use in other scripts
export {
    findFunctionSelector,
    listAllSelectors,
    parseContractFile,
    FunctionMatch,
}

// Run main if this script is executed directly
if (require.main === module) {
    main()
}
