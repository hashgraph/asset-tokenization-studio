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
import { writeFile, findSolidityFiles, readFile } from './utils/fileUtils'
import {
    findAllContracts,
    categorizeContracts,
    pairTimeTravelVariants,
    type ContractFile,
} from './scanner/contractFinder'
import { extractMetadata } from './scanner/metadataExtractor'
import {
    generateRegistry,
    generateSummary,
} from './generators/registryGenerator'
import { extractRoles, extractResolverKeys } from './utils/solidityUtils'
import {
    section,
    info,
    success,
    warn,
    table,
    configureLogger,
    LogLevel,
} from '../infrastructure/utils/logging'

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

    // Configure logger based on environment variable or CLI flags
    const logLevelStr =
        process.env.LOG_LEVEL || (options.verbose ? 'DEBUG' : 'INFO')
    const logLevelMap: Record<string, LogLevel> = {
        DEBUG: LogLevel.DEBUG,
        INFO: LogLevel.INFO,
        WARN: LogLevel.WARN,
        ERROR: LogLevel.ERROR,
        SILENT: LogLevel.SILENT,
    }
    const logLevel = logLevelMap[logLevelStr.toUpperCase()] || LogLevel.INFO
    configureLogger({ level: logLevel })

    section('ATS Registry Generation Tool')
    info(`Scanning: ${path.join(__dirname, '../../contracts')}`)

    // Determine contracts directory
    const contractsDir = path.join(__dirname, '../../contracts')

    // Step 1: Find all contracts
    info('Step 1: Discovering contracts...')
    const allContracts = findAllContracts(contractsDir)
    info(`  Found ${allContracts.length} contract files`)

    // Step 2: Categorize contracts
    info('Step 2: Categorizing contracts...')
    const categorized = categorizeContracts(allContracts)
    const categorizationTable: string[][] = [
        ['Facets', categorized.facets.length.toString()],
        ['TimeTravel variants', categorized.timeTravelFacets.length.toString()],
        ['Infrastructure', categorized.infrastructure.length.toString()],
        ['Test/Mock', categorized.test.length.toString()],
        ['Interfaces', categorized.interfaces.length.toString()],
        ['Libraries', categorized.libraries.length.toString()],
        ['Other', categorized.other.length.toString()],
    ]
    table(['Type', 'Count'], categorizationTable)

    // Step 3: Pair TimeTravel variants
    info('Step 3: Pairing TimeTravel variants...')
    const timeTravelPairs = pairTimeTravelVariants(
        categorized.facets,
        categorized.timeTravelFacets
    )
    const withTimeTravel = Array.from(timeTravelPairs.values()).filter(
        (v) => v !== null
    ).length
    info(`  ${withTimeTravel} facets have TimeTravel variants`)

    // Step 4: Extract resolver keys from constants files
    info('Step 4: Scanning resolver key constants...')
    const allResolverKeys = new Map<string, string>()

    // Get all Solidity files for scanning constants
    const allSolidityFiles = findSolidityFiles(contractsDir)

    // Find standalone resolverKeys.sol files
    const resolverKeyFiles = allSolidityFiles.filter(
        (filePath) =>
            filePath.includes('/constants/resolverKeys.sol') ||
            filePath.includes('/layer_1/constants/resolverKeys.sol') ||
            filePath.includes('/layer_2/constants/resolverKeys.sol') ||
            filePath.includes('/layer_3/constants/resolverKeys.sol')
    )

    for (const keyFile of resolverKeyFiles) {
        const source = readFile(keyFile)
        const extractedKeys = extractResolverKeys(source)
        for (const key of extractedKeys) {
            if (!allResolverKeys.has(key.name)) {
                allResolverKeys.set(key.name, key.value)
            }
        }
    }

    info(`  Found ${resolverKeyFiles.length} resolver key files`)
    info(`  Total unique resolver keys: ${allResolverKeys.size}`)

    // Step 5: Extract metadata
    info('Step 5: Extracting metadata...')

    // Create a map of all contracts for inheritance resolution
    // Maps contract name to ContractFile for method extraction with inheritance
    const contractsMap = new Map<string, ContractFile>()
    for (const contract of allContracts) {
        for (const contractName of contract.contractNames) {
            contractsMap.set(contractName, contract)
        }
    }

    const facetMetadata = categorized.facets.map((contract) => {
        const hasTimeTravel =
            timeTravelPairs.get(contract.primaryContract) !== null
        return extractMetadata(
            contract,
            hasTimeTravel,
            allResolverKeys,
            contractsMap
        )
    })

    const infrastructureMetadata = options.facetsOnly
        ? []
        : categorized.infrastructure.map((contract) =>
              extractMetadata(contract, false, allResolverKeys, contractsMap)
          )

    info(`  Extracted metadata for ${facetMetadata.length} facets`)
    if (!options.facetsOnly) {
        info(
            `  Extracted metadata for ${infrastructureMetadata.length} infrastructure contracts`
        )
    }

    // Validate resolver keys
    const facetsWithResolverKeys = facetMetadata.filter((f) => f.resolverKey)
    const facetsWithoutResolverKeys = facetMetadata.filter(
        (f) => !f.resolverKey
    )
    info(
        `  Resolver keys: ${facetsWithResolverKeys.length} facets with keys, ${facetsWithoutResolverKeys.length} without`
    )

    // Step 5.5: Extract Storage Wrapper metadata
    info('Step 5.5: Extracting Storage Wrapper metadata...')
    const storageWrapperFiles = allSolidityFiles.filter((filePath) =>
        filePath.endsWith('StorageWrapper.sol')
    )

    // Read and extract metadata for storage wrappers
    // Filter out interfaces (IAccessControlStorageWrapper, etc.)
    const storageWrapperContracts = storageWrapperFiles
        .map((filePath) => {
            const source = readFile(filePath)
            const contractNames = allContracts.find(
                (c) => c.filePath === filePath
            )?.contractNames
            if (!contractNames || contractNames.length === 0) return null

            const primaryContract =
                contractNames.find((name) => name.endsWith('StorageWrapper')) ||
                contractNames[0]

            // Filter out interface StorageWrappers (e.g., IAccessControlStorageWrapper)
            if (
                primaryContract.startsWith('I') &&
                primaryContract.endsWith('StorageWrapper')
            ) {
                return null
            }

            return {
                filePath,
                relativePath: filePath.replace(contractsDir + '/', ''),
                directory: path.dirname(filePath),
                fileName: path.basename(filePath, '.sol'),
                contractNames,
                primaryContract,
                source,
            }
        })
        .filter((c): c is NonNullable<typeof c> => c !== null)

    const storageWrapperMetadata = storageWrapperContracts.map((contract) =>
        extractMetadata(contract, false, allResolverKeys, contractsMap)
    )

    info(
        `  Extracted metadata for ${storageWrapperMetadata.length} storage wrappers`
    )

    // Step 6: Scan standalone constant files for roles
    info('Step 6: Scanning standalone role constants...')

    // ROLE DEDUPLICATION:
    // Map automatically deduplicates role definitions that appear in multiple files.
    // This is intentional - roles are duplicated across contracts for import independence,
    // but we only need one canonical definition in the registry.
    const allRoles = new Map<string, string>()

    // Collect roles from facets and infrastructure (already extracted)
    for (const metadata of [...facetMetadata, ...infrastructureMetadata]) {
        for (const role of metadata.roles) {
            if (!allRoles.has(role.name)) {
                allRoles.set(role.name, role.value)
            }
        }
    }

    // Find and scan standalone roles.sol files
    // These files may contain duplicates of roles already found above
    const rolesFiles = allSolidityFiles.filter(
        (filePath) =>
            filePath.includes('/constants/roles.sol') ||
            filePath.includes('/interfaces/roles.sol')
    )

    for (const rolesFile of rolesFiles) {
        const source = readFile(rolesFile)
        const extractedRoles = extractRoles(source)
        for (const role of extractedRoles) {
            // Map.has() ensures deduplication - only first occurrence is stored
            if (!allRoles.has(role.name)) {
                allRoles.set(role.name, role.value)
            }
        }
    }

    info(`  Found ${rolesFiles.length} standalone role files`)
    info(`  Total unique roles: ${allRoles.size}`)

    // Step 7: Generate registry code
    info('Step 7: Generating registry code...')
    const registryCode = generateRegistry(
        facetMetadata,
        infrastructureMetadata,
        allRoles,
        storageWrapperMetadata
    )
    info(`  Generated ${registryCode.split('\n').length} lines of code`)

    // Step 8: Generate summary
    section('Summary')
    const summary = generateSummary(facetMetadata, infrastructureMetadata)

    const summaryTable: string[][] = [
        ['Total facets', summary.totalFacets.toString()],
        ['Total infrastructure', summary.totalInfrastructure.toString()],
        ['With TimeTravel', summary.withTimeTravel.toString()],
        ['With roles', summary.withRoles.toString()],
    ]
    table(['Metric', 'Count'], summaryTable)

    // Category breakdown
    const categoryTable: string[][] = Object.entries(summary.byCategory).map(
        ([category, count]) => [category, count.toString()]
    )
    info('\nBy category:')
    table(['Category', 'Count'], categoryTable)

    // Layer breakdown
    const layerTable: string[][] = Object.entries(summary.byLayer).map(
        ([layer, count]) => [`Layer ${layer}`, count.toString()]
    )
    info('\nBy layer:')
    table(['Layer', 'Count'], layerTable)

    // Step 9: Write output
    if (options.dryRun) {
        info('DRY RUN - Not writing file')
        info(`Would write to: ${options.output}`)

        if (options.verbose) {
            info('Generated code preview:')
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
        success('Registry generated successfully!')
        info(`Written to: ${outputPath}`)

        info('\nNext steps:')
        info('  1. Review the generated registry')
        info(
            '  2. Create registry.overrides.ts for manual customizations (optional)'
        )
        info('  3. Update imports to use generated registry')
        info('  4. Run tests to verify')
    }

    // Warnings
    const warnings: string[] = []

    // Check for facets without resolver keys
    // Exclude TimeTravelFacet (meta-facet that doesn't need a resolver key)
    const missingResolverKeys = facetsWithoutResolverKeys.filter(
        (f) => f.name !== 'TimeTravelFacet'
    )
    if (missingResolverKeys.length > 0) {
        warnings.push(
            `${missingResolverKeys.length} facets missing resolver keys: ${missingResolverKeys.map((f) => f.name).join(', ')}`
        )
    }

    // Check for facets without TimeTravel
    // Exclude TimeTravelFacet (can't have a TimeTravel variant of itself)
    const withoutTimeTravel = facetMetadata.filter(
        (f) => !f.hasTimeTravel && f.name !== 'TimeTravelFacet'
    )
    if (withoutTimeTravel.length > 0 && withoutTimeTravel.length < 10) {
        warnings.push(
            `${withoutTimeTravel.length} facets don't have TimeTravel variants: ${withoutTimeTravel.map((f) => f.name).join(', ')}`
        )
    }

    // NOTE: We intentionally removed the "Many facets categorized as 'core'" warning
    // because "core" is a valid category for fundamental token operations
    // (ERC standards, AccessControl, Pause, Diamond, etc.). Having 28/49 facets
    // as "core" is expected and correct for a comprehensive token system.

    if (warnings.length > 0) {
        section('Warnings')
        warnings.forEach((w) => warn(w))
    }

    success('Done!')
}

// Execute
main().catch((error) => {
    console.error('❌ Error:', error.message)
    if (process.argv.includes('--verbose') || process.argv.includes('-v')) {
        console.error(error.stack)
    }
    process.exit(1)
})
