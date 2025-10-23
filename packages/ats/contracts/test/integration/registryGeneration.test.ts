// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for registry generation pipeline.
 *
 * Tests the configurable registry generation pipeline to ensure downstream
 * projects can auto-generate their own contract registries.
 *
 * These tests verify:
 * - generateRegistryPipeline function with various configurations
 * - Exported building blocks (detectLayer, detectCategory, etc.)
 * - Generated code quality and completeness
 * - Configuration flexibility
 */

import { expect } from 'chai'
import * as path from 'path'
import * as fs from 'fs'

// Infrastructure layer - registry generation tools
import {
    generateRegistryPipeline,
    DEFAULT_REGISTRY_CONFIG,
    type RegistryGenerationConfig,
} from '@scripts/infrastructure'

// Exported building blocks
import { detectLayer, detectCategory, generateDescription } from '@scripts'

import { pairTimeTravelVariants } from '@scripts'

describe('Registry Generation Pipeline - Integration Tests', () => {
    const contractsPath = path.join(__dirname, '../../contracts')

    describe('generateRegistryPipeline', () => {
        it('should generate registry with default configuration', async () => {
            const result = await generateRegistryPipeline(
                {
                    contractsPath,
                    logLevel: 'SILENT', // Suppress output during tests
                },
                false // Don't write file
            )

            // Verify result structure
            expect(result).to.have.property('code')
            expect(result).to.have.property('stats')
            expect(result).to.have.property('warnings')
            expect(result.outputPath).to.be.undefined // File not written

            // Verify statistics
            expect(result.stats.totalFacets).to.be.greaterThan(0)
            expect(result.stats.totalInfrastructure).to.be.greaterThan(0)
            expect(result.stats.totalRoles).to.be.greaterThan(0)
            expect(result.stats.generatedLines).to.be.greaterThan(100)
            expect(result.stats.durationMs).to.be.greaterThan(0)

            // Verify generated code structure
            expect(result.code).to.include('SPDX-License-Identifier')
            expect(result.code).to.include('AUTO-GENERATED')
            expect(result.code).to.include('FACET_REGISTRY')
            expect(result.code).to.include('CONTRACT_REGISTRY')
            expect(result.code).to.include('STORAGE_WRAPPER_REGISTRY')
            expect(result.code).to.include('export const ROLES')
            expect(result.code).to.include('@scripts/infrastructure')
        }).timeout(30000)

        it('should respect configuration options', async () => {
            const config: RegistryGenerationConfig = {
                contractsPath,
                includeStorageWrappers: false,
                includeTimeTravel: false,
                facetsOnly: true,
                logLevel: 'SILENT',
            }

            const result = await generateRegistryPipeline(config, false)

            // When facetsOnly=true, infrastructure should be 0
            expect(result.stats.totalInfrastructure).to.equal(0)

            // When includeStorageWrappers=false, storage wrappers should be 0
            expect(result.stats.totalStorageWrappers).to.equal(0)

            // When includeTimeTravel=false, withTimeTravel should be 0
            expect(result.stats.withTimeTravel).to.equal(0)
        }).timeout(30000)

        it('should allow custom resolver key paths', async () => {
            const result = await generateRegistryPipeline(
                {
                    contractsPath,
                    resolverKeyPaths: ['**/constants/resolverKeys.sol'],
                    logLevel: 'SILENT',
                },
                false
            )

            expect(result.stats.totalResolverKeys).to.be.greaterThan(0)
        }).timeout(30000)

        it('should allow custom role paths', async () => {
            const result = await generateRegistryPipeline(
                {
                    contractsPath,
                    rolesPaths: ['**/constants/roles.sol'],
                    logLevel: 'SILENT',
                },
                false
            )

            expect(result.stats.totalRoles).to.be.greaterThan(0)
        }).timeout(30000)

        it('should generate valid TypeScript code', async () => {
            const result = await generateRegistryPipeline(
                {
                    contractsPath,
                    logLevel: 'SILENT',
                },
                false
            )

            // Check for TypeScript syntax elements
            expect(result.code).to.include('export const')
            expect(result.code).to.include('import {')
            expect(result.code).to.include('} from')
            expect(result.code).to.include('Record<string,')
            expect(result.code).to.include('FacetDefinition')
            expect(result.code).to.include('ContractDefinition')

            // Should not have syntax errors
            expect(result.code).to.not.include('undefined')
            expect(result.code).to.not.include('null,')
        }).timeout(30000)

        it('should include category and layer breakdown', async () => {
            const result = await generateRegistryPipeline(
                {
                    contractsPath,
                    logLevel: 'SILENT',
                },
                false
            )

            expect(result.stats.byCategory).to.be.an('object')
            expect(result.stats.byLayer).to.be.an('object')

            // ATS should have multiple categories
            expect(
                Object.keys(result.stats.byCategory).length
            ).to.be.greaterThan(1)
            expect(Object.keys(result.stats.byLayer).length).to.be.greaterThan(
                1
            )
        }).timeout(30000)

        it('should write file when requested', async () => {
            const tempOutputPath = path.join(
                __dirname,
                '../temp-registry.data.ts'
            )

            // Clean up if exists
            if (fs.existsSync(tempOutputPath)) {
                fs.unlinkSync(tempOutputPath)
            }

            try {
                const result = await generateRegistryPipeline(
                    {
                        contractsPath,
                        outputPath: tempOutputPath,
                        logLevel: 'SILENT',
                    },
                    true // Write file
                )

                expect(result.outputPath).to.equal(tempOutputPath)
                expect(fs.existsSync(tempOutputPath)).to.be.true

                // Verify file content matches generated code
                const fileContent = fs.readFileSync(tempOutputPath, 'utf-8')
                expect(fileContent).to.equal(result.code)
            } finally {
                // Clean up
                if (fs.existsSync(tempOutputPath)) {
                    fs.unlinkSync(tempOutputPath)
                }
            }
        }).timeout(30000)
    })

    describe('Exported Building Blocks', () => {
        it('should export detectLayer function', () => {
            const mockContract = {
                filePath: '/path/to/contracts/facets/layer_1/AccessControl.sol',
                relativePath: 'facets/layer_1/AccessControl.sol',
                directory: '/path/to/contracts/facets/layer_1',
                fileName: 'AccessControl',
                contractNames: ['AccessControl'],
                primaryContract: 'AccessControl',
                source: 'contract AccessControl {}',
            }

            const layer = detectLayer(mockContract)
            expect(layer).to.equal(1)
        })

        it('should export detectCategory function', () => {
            const mockContract = {
                filePath: '/path/to/contracts/facets/Kyc.sol',
                relativePath: 'facets/Kyc.sol',
                directory: '/path/to/contracts/facets',
                fileName: 'Kyc',
                contractNames: ['KycFacet'],
                primaryContract: 'KycFacet',
                source: 'contract KycFacet {}',
            }

            const category = detectCategory(mockContract, 1)
            expect(category).to.equal('compliance')
        })

        it('should export generateDescription function', () => {
            const source = `
/**
 * @title MyContract
 * @notice This is a test contract
 */
contract MyContract {}
            `

            const description = generateDescription(source, 'MyContract')
            expect(description).to.equal('This is a test contract')
        })

        it('should export pairTimeTravelVariants function', () => {
            const baseFacets = [
                {
                    filePath: '/path/AccessControl.sol',
                    relativePath: 'AccessControl.sol',
                    directory: '/path',
                    fileName: 'AccessControl',
                    contractNames: ['AccessControlFacet'],
                    primaryContract: 'AccessControlFacet',
                    source: '',
                },
            ]

            const timeTravelFacets = [
                {
                    filePath: '/path/AccessControlTimeTravel.sol',
                    relativePath: 'AccessControlTimeTravel.sol',
                    directory: '/path',
                    fileName: 'AccessControlTimeTravel',
                    contractNames: ['AccessControlFacetTimeTravel'],
                    primaryContract: 'AccessControlFacetTimeTravel',
                    source: '',
                },
            ]

            const pairs = pairTimeTravelVariants(baseFacets, timeTravelFacets)
            expect(pairs.size).to.equal(1)
            expect(pairs.get('AccessControlFacet')).to.not.be.null
        })
    })

    describe('DEFAULT_REGISTRY_CONFIG', () => {
        it('should have sensible defaults', () => {
            expect(DEFAULT_REGISTRY_CONFIG.contractsPath).to.equal(
                './contracts'
            )
            expect(DEFAULT_REGISTRY_CONFIG.includeStorageWrappers).to.be.true
            expect(DEFAULT_REGISTRY_CONFIG.includeTimeTravel).to.be.true
            expect(DEFAULT_REGISTRY_CONFIG.extractNatspec).to.be.true
            expect(DEFAULT_REGISTRY_CONFIG.logLevel).to.equal('INFO')
            expect(DEFAULT_REGISTRY_CONFIG.facetsOnly).to.be.false
        })

        it('should have appropriate exclude patterns', () => {
            const excludes = DEFAULT_REGISTRY_CONFIG.excludePaths
            expect(excludes).to.include('**/test/**')
            expect(excludes).to.include('**/tests/**')
            expect(excludes).to.include('**/mocks/**')
            expect(excludes).to.include('**/*.t.sol')
            expect(excludes).to.include('**/*.s.sol')
        })
    })

    describe('Real-world Usage Scenarios', () => {
        it('should work for downstream project with different structure', async () => {
            // Simulate downstream project configuration
            const customConfig: RegistryGenerationConfig = {
                contractsPath,
                outputPath: './custom/registry.data.ts',
                resolverKeyPaths: ['**/config/keys.sol', '**/constants/*.sol'],
                rolesPaths: ['**/config/roles.sol', '**/constants/*.sol'],
                includeStorageWrappers: false,
                moduleName: '@my-company/contracts',
                logLevel: 'SILENT',
            }

            const result = await generateRegistryPipeline(customConfig, false)

            expect(result.code).to.include('@my-company/contracts')
            expect(result.stats.totalFacets).to.be.greaterThan(0)
        }).timeout(30000)

        it('should handle missing resolver keys gracefully', async () => {
            const result = await generateRegistryPipeline(
                {
                    contractsPath,
                    resolverKeyPaths: ['**/nonexistent/*.sol'], // Won't find any
                    logLevel: 'SILENT',
                },
                false
            )

            // Should still succeed, just with fewer resolver keys
            expect(result.stats.totalResolverKeys).to.equal(0)
            expect(result.warnings.length).to.be.greaterThan(0)
        }).timeout(30000)

        it('should handle missing standalone roles files gracefully', async () => {
            const result = await generateRegistryPipeline(
                {
                    contractsPath,
                    rolesPaths: ['**/nonexistent/*.sol'], // Won't find standalone files
                    logLevel: 'SILENT',
                },
                false
            )

            // Should succeed even if standalone files don't match
            // (Roles may or may not be found depending on inline contract definitions)
            expect(result.stats.totalRoles).to.be.greaterThanOrEqual(0)
            expect(result.code).to.include('export const ROLES')
        }).timeout(30000)
    })
})
