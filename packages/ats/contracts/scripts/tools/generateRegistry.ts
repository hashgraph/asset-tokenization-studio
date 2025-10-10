#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * Registry Generation Tool - Main Entry Point
 *
 * Scans the contracts/ directory and automatically generates a complete
 * facet and contract registry with metadata.
 *
 * Usage:
 *   npm run generate:registry
 *   npm run generate:registry -- --dry-run
 *   npm run generate:registry -- --output path/to/output.ts
 *
 * @module tools/generateRegistry
 */

import * as path from 'path'
import { writeFile } from './utils/fileUtils'
import {
    findAllContracts,
    categorizeContracts,
    pairTimeTravelVariants,
} from './scanner/contractFinder'
import { extractMetadata } from './scanner/metadataExtractor'
import {
    generateRegistry,
    generateSummary,
} from './generators/registryGenerator'

/**
 * CLI options.
 */
interface CliOptions {
    /** Dry run - don't write file */
    dryRun: boolean

    /** Output file path */
    output: string

    /** Verbose logging */
    verbose: boolean

    /** Only generate facets (skip infrastructure) */
    facetsOnly: boolean
}

/**
 * Parse command line arguments.
 *
 * @returns Parsed options
 */
function parseArgs(): CliOptions {
    const args = process.argv.slice(2)

    const outputIndex = args.indexOf('--output')
    const hasOutput = outputIndex !== -1 && outputIndex + 1 < args.length

    return {
        dryRun: args.includes('--dry-run'),
        output: hasOutput
            ? args[outputIndex + 1]
            : 'scripts/infrastructure/registry.generated.ts',
        verbose: args.includes('--verbose') || args.includes('-v'),
        facetsOnly: args.includes('--facets-only'),
    }
}

/**
 * Main execution.
 */
async function main(): Promise<void> {
    const options = parseArgs()

    console.log('🔍 ATS Registry Generation Tool')
    console.log('================================\n')

    // Determine contracts directory
    const contractsDir = path.join(__dirname, '../../contracts')
    console.log(`📂 Scanning: ${contractsDir}\n`)

    // Step 1: Find all contracts
    console.log('Step 1: Discovering contracts...')
    const allContracts = findAllContracts(contractsDir)
    console.log(`   Found ${allContracts.length} contract files\n`)

    // Step 2: Categorize contracts
    console.log('Step 2: Categorizing contracts...')
    const categorized = categorizeContracts(allContracts)
    console.log(`   Facets: ${categorized.facets.length}`)
    console.log(
        `   TimeTravel variants: ${categorized.timeTravelFacets.length}`
    )
    console.log(`   Infrastructure: ${categorized.infrastructure.length}`)
    console.log(`   Test/Mock: ${categorized.test.length}`)
    console.log(`   Interfaces: ${categorized.interfaces.length}`)
    console.log(`   Libraries: ${categorized.libraries.length}`)
    console.log(`   Other: ${categorized.other.length}\n`)

    // Step 3: Pair TimeTravel variants
    console.log('Step 3: Pairing TimeTravel variants...')
    const timeTravelPairs = pairTimeTravelVariants(
        categorized.facets,
        categorized.timeTravelFacets
    )
    const withTimeTravel = Array.from(timeTravelPairs.values()).filter(
        (v) => v !== null
    ).length
    console.log(`   ${withTimeTravel} facets have TimeTravel variants\n`)

    // Step 4: Extract metadata
    console.log('Step 4: Extracting metadata...')
    const facetMetadata = categorized.facets.map((contract) => {
        const hasTimeTravel =
            timeTravelPairs.get(contract.primaryContract) !== null
        return extractMetadata(contract, hasTimeTravel)
    })

    const infrastructureMetadata = options.facetsOnly
        ? []
        : categorized.infrastructure.map((contract) =>
              extractMetadata(contract, false)
          )

    console.log(`   Extracted metadata for ${facetMetadata.length} facets`)
    if (!options.facetsOnly) {
        console.log(
            `   Extracted metadata for ${infrastructureMetadata.length} infrastructure contracts`
        )
    }
    console.log()

    // Step 5: Generate registry code
    console.log('Step 5: Generating registry code...')
    const registryCode = generateRegistry(facetMetadata, infrastructureMetadata)
    console.log(
        `   Generated ${registryCode.split('\n').length} lines of code\n`
    )

    // Step 6: Generate summary
    const summary = generateSummary(facetMetadata, infrastructureMetadata)
    console.log('📊 Summary')
    console.log('==========')
    console.log(`Total facets: ${summary.totalFacets}`)
    console.log(`Total infrastructure: ${summary.totalInfrastructure}`)
    console.log(`\nBy category:`)
    for (const [category, count] of Object.entries(summary.byCategory)) {
        console.log(`  ${category}: ${count}`)
    }
    console.log(`\nBy layer:`)
    for (const [layer, count] of Object.entries(summary.byLayer)) {
        console.log(`  Layer ${layer}: ${count}`)
    }
    console.log(`\nWith TimeTravel: ${summary.withTimeTravel}`)
    console.log(`With roles: ${summary.withRoles}\n`)

    // Step 7: Write output
    if (options.dryRun) {
        console.log('🔍 DRY RUN - Not writing file')
        console.log(`Would write to: ${options.output}\n`)

        if (options.verbose) {
            console.log('Generated code preview:')
            console.log('─'.repeat(80))
            console.log(registryCode.split('\n').slice(0, 50).join('\n'))
            console.log('...')
            console.log('─'.repeat(80))
        }
    } else {
        const outputPath = path.isAbsolute(options.output)
            ? options.output
            : path.join(process.cwd(), options.output)

        writeFile(outputPath, registryCode)
        console.log(`✅ Registry generated successfully!`)
        console.log(`📝 Written to: ${outputPath}\n`)

        console.log('Next steps:')
        console.log('  1. Review the generated registry')
        console.log(
            '  2. Create registry.overrides.ts for manual customizations (optional)'
        )
        console.log('  3. Update imports to use generated registry')
        console.log('  4. Run tests to verify')
    }

    // Warnings
    const warnings: string[] = []

    // Check for facets without TimeTravel
    const withoutTimeTravel = facetMetadata.filter((f) => !f.hasTimeTravel)
    if (withoutTimeTravel.length > 0 && withoutTimeTravel.length < 10) {
        warnings.push(
            `⚠️  ${withoutTimeTravel.length} facets don't have TimeTravel variants: ${withoutTimeTravel.map((f) => f.name).join(', ')}`
        )
    }

    // Check for uncategorized
    const uncategorized = facetMetadata.filter(
        (f) => f.category === 'core' && !f.name.includes('ERC')
    )
    if (uncategorized.length > 5) {
        warnings.push(
            `⚠️  Many facets categorized as 'core' - review categorization logic`
        )
    }

    if (warnings.length > 0) {
        console.log('\n⚠️  Warnings')
        console.log('============')
        warnings.forEach((w) => console.log(w))
    }

    console.log('\n✨ Done!')
}

// Execute
main().catch((error) => {
    console.error('❌ Error:', error.message)
    if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
        console.error(error.stack)
    }
    process.exit(1)
})
