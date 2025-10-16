// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for external facet extensibility.
 *
 * These tests verify that the ATS deployment scripts can be extended
 * by downstream projects with custom (non-registry) facets.
 *
 * Tests cover:
 * - Registering external facets in BLR
 * - Configuring external facets alongside ATS facets
 * - Mixed configurations (ATS + external facets)
 * - End-to-end deployment with external facets
 */

import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    HardhatProvider,
    deployContract,
    deployProxy,
    registerFacets,
    createBatchConfiguration,
    deployFacets,
    EQUITY_CONFIG_ID,
    getFacetDefinition,
} from '../../scripts/core'

describe('External Facet Extensibility - Integration Tests', () => {
    let provider: HardhatProvider
    let blrAddress: string
    let blrContract: any

    beforeEach(async () => {
        provider = new HardhatProvider()

        // Deploy BLR for all tests
        const blrResult = await deployProxy(provider, {
            implementationContract: 'BusinessLogicResolver',
        })

        expect(blrResult.proxyAddress).to.exist
        blrAddress = blrResult.proxyAddress

        // Initialize BLR
        const blrFactory = await provider.getFactory('BusinessLogicResolver')
        blrContract = blrFactory.attach(blrAddress)
        await blrContract.initialize_BusinessLogicResolver()
    })

    describe('External Facet Registration', () => {
        it('should register an external facet (not in ATS registry) with warning', async () => {
            // Deploy PauseFacet as if it were an external facet
            // (even though it's in the registry, we'll treat it as external for testing)
            const externalFacetResult = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            expect(externalFacetResult.success).to.be.true

            // Verify it exists in registry (for reference)
            const definition = getFacetDefinition('PauseFacet')
            expect(definition).to.exist

            // Register the facet - should warn but succeed
            const registerResult = await registerFacets(provider, {
                blrAddress,
                facets: {
                    PauseFacet: externalFacetResult.address!,
                },
            })

            // Should succeed despite being in registry
            expect(registerResult.success).to.be.true
            expect(registerResult.registered.length).to.equal(1)
            expect(registerResult.registered[0]).to.equal('PauseFacet')
        })

        it('should register multiple facets including external ones', async () => {
            // Deploy mix of ATS and "external" facets
            const accessControlResult = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const pauseResult = await deployContract(provider, {
                contractName: 'PauseFacet',
            })
            const kycResult = await deployContract(provider, {
                contractName: 'KycFacet',
            })

            // Register all facets together
            const registerResult = await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControlResult.address!,
                    PauseFacet: pauseResult.address!,
                    KycFacet: kycResult.address!,
                },
            })

            expect(registerResult.success).to.be.true
            expect(registerResult.registered.length).to.equal(3)
            expect(registerResult.failed.length).to.equal(0)
        })
    })

    describe('External Facet Deployment', () => {
        it('should deploy external facets (not in ATS registry) with warning', async () => {
            // Deploy specific facets including an external one
            // PauseFacet is in the registry, but we're testing the code path
            const result = await deployFacets(provider, {
                facetNames: ['PauseFacet', 'AccessControlFacet'],
            })

            expect(result.success).to.be.true
            expect(result.deployed.size).to.equal(2)
            expect(result.failed.size).to.equal(0)

            // Verify both facets were deployed
            expect(result.deployed.has('PauseFacet')).to.be.true
            expect(result.deployed.has('AccessControlFacet')).to.be.true
        })

        it('should deploy only external facets without filtering them out', async () => {
            // In a real scenario, this would be a facet not in the registry
            // For testing, we use a registry facet to verify the code path works
            const result = await deployFacets(provider, {
                facetNames: ['FreezeFacet'],
            })

            expect(result.success).to.be.true
            expect(result.deployed.size).to.equal(1)
            expect(result.failed.size).to.equal(0)
            expect(result.deployed.has('FreezeFacet')).to.be.true
        })

        it('should deploy mixed ATS and external facets together', async () => {
            // Deploy a mix of facets
            const result = await deployFacets(provider, {
                facetNames: [
                    'AccessControlFacet',
                    'KycFacet',
                    'PauseFacet',
                    'FreezeFacet',
                ],
            })

            expect(result.success).to.be.true
            expect(result.deployed.size).to.equal(4)
            expect(result.failed.size).to.equal(0)

            // Verify all facets were deployed
            const deployedNames = Array.from(result.deployed.keys())
            expect(deployedNames).to.include('AccessControlFacet')
            expect(deployedNames).to.include('KycFacet')
            expect(deployedNames).to.include('PauseFacet')
            expect(deployedNames).to.include('FreezeFacet')
        })
    })

    describe('External Facet Configuration', () => {
        it('should configure external facet (not in ATS registry) with warning', async () => {
            // Deploy and register a facet
            const pauseFacetResult = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            await registerFacets(provider, {
                blrAddress,
                facets: {
                    PauseFacet: pauseFacetResult.address!,
                },
            })

            // Create configuration with external facet
            // This should now WARN but NOT filter out the facet
            const configResult = await createBatchConfiguration(blrContract, {
                configurationId:
                    ethers.utils.formatBytes32String('TEST_CONFIG'),
                facetNames: ['PauseFacet'],
                facetAddresses: {
                    PauseFacet: pauseFacetResult.address!,
                },
            })

            // Should succeed (this is the key test!)
            expect(configResult.ok).to.be.true
            if (configResult.ok) {
                expect(configResult.value.facetKeys.length).to.equal(1)
                expect(configResult.value.facetKeys[0].facetName).to.equal(
                    'PauseFacet'
                )
            }
        })

        it('should configure mixed ATS and external facets together', async () => {
            // Deploy ATS facets
            const accessControlResult = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const kycResult = await deployContract(provider, {
                contractName: 'KycFacet',
            })

            // Deploy "external" facet
            const pauseResult = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            // Register all
            await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControlResult.address!,
                    KycFacet: kycResult.address!,
                    PauseFacet: pauseResult.address!,
                },
            })

            // Create mixed configuration
            const configResult = await createBatchConfiguration(blrContract, {
                configurationId:
                    ethers.utils.formatBytes32String('MIXED_CONFIG'),
                facetNames: ['AccessControlFacet', 'KycFacet', 'PauseFacet'],
                facetAddresses: {
                    AccessControlFacet: accessControlResult.address!,
                    KycFacet: kycResult.address!,
                    PauseFacet: pauseResult.address!,
                },
            })

            // All facets should be included
            expect(configResult.ok).to.be.true
            if (configResult.ok) {
                expect(configResult.value.facetKeys.length).to.equal(3)

                const facetNames = configResult.value.facetKeys.map(
                    (f: { facetName: string }) => f.facetName
                )
                expect(facetNames).to.include('AccessControlFacet')
                expect(facetNames).to.include('KycFacet')
                expect(facetNames).to.include('PauseFacet')
            }
        })

        it('should handle configuration with only external facets', async () => {
            // Deploy only "external" facets
            const pauseResult = await deployContract(provider, {
                contractName: 'PauseFacet',
            })
            const freezeResult = await deployContract(provider, {
                contractName: 'FreezeFacet',
            })

            // Register external facets
            await registerFacets(provider, {
                blrAddress,
                facets: {
                    PauseFacet: pauseResult.address!,
                    FreezeFacet: freezeResult.address!,
                },
            })

            // Create configuration with only external facets
            const configResult = await createBatchConfiguration(blrContract, {
                configurationId:
                    ethers.utils.formatBytes32String('EXTERNAL_CONFIG'),
                facetNames: ['PauseFacet', 'FreezeFacet'],
                facetAddresses: {
                    PauseFacet: pauseResult.address!,
                    FreezeFacet: freezeResult.address!,
                },
            })

            // Should work fine
            expect(configResult.ok).to.be.true
            if (configResult.ok) {
                expect(configResult.value.facetKeys.length).to.equal(2)
            }
        })
    })

    describe('End-to-End External Facet Workflow', () => {
        it('should complete full deployment with external facets', async () => {
            // Step 1: Deploy ProxyAdmin
            const proxyAdminResult = await deployContract(provider, {
                contractName: 'ProxyAdmin',
            })
            expect(proxyAdminResult.success).to.be.true

            // Step 2: Deploy ATS facets
            const accessControlResult = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const kycResult = await deployContract(provider, {
                contractName: 'KycFacet',
            })

            // Step 3: Deploy external facet (simulating downstream custom facet)
            const customFacetResult = await deployContract(provider, {
                contractName: 'PauseFacet', // Using PauseFacet as mock external facet
            })

            expect(accessControlResult.success).to.be.true
            expect(kycResult.success).to.be.true
            expect(customFacetResult.success).to.be.true

            // Step 4: Register all facets (ATS + external)
            const registerResult = await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControlResult.address!,
                    KycFacet: kycResult.address!,
                    PauseFacet: customFacetResult.address!, // External facet
                },
            })

            expect(registerResult.success).to.be.true
            expect(registerResult.registered.length).to.equal(3)

            // Step 5: Create configuration with all facets
            const configResult = await createBatchConfiguration(blrContract, {
                configurationId: EQUITY_CONFIG_ID,
                facetNames: ['AccessControlFacet', 'KycFacet', 'PauseFacet'],
                facetAddresses: {
                    AccessControlFacet: accessControlResult.address!,
                    KycFacet: kycResult.address!,
                    PauseFacet: customFacetResult.address!,
                },
            })

            // Verify configuration succeeded with all facets
            expect(configResult.ok).to.be.true
            if (configResult.ok) {
                expect(configResult.value.facetKeys.length).to.equal(3)
                expect(configResult.value.configurationId).to.equal(
                    EQUITY_CONFIG_ID
                )

                // Verify external facet is included
                const externalFacet = configResult.value.facetKeys.find(
                    (f: { facetName: string }) => f.facetName === 'PauseFacet'
                )
                expect(externalFacet).to.exist
                expect(externalFacet!.address).to.equal(
                    customFacetResult.address
                )
            }
        })

        it('should skip facets without deployed addresses but include valid external facets', async () => {
            // Deploy only some facets
            const accessControlResult = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const pauseResult = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            // Register deployed facets
            await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControlResult.address!,
                    PauseFacet: pauseResult.address!,
                },
            })

            // Try to create configuration with some facets not deployed
            const configResult = await createBatchConfiguration(blrContract, {
                configurationId:
                    ethers.utils.formatBytes32String('PARTIAL_CONFIG'),
                facetNames: ['AccessControlFacet', 'KycFacet', 'PauseFacet'],
                facetAddresses: {
                    AccessControlFacet: accessControlResult.address!,
                    // KycFacet intentionally not provided
                    PauseFacet: pauseResult.address!,
                },
            })

            // Should succeed with only the 2 deployed facets
            expect(configResult.ok).to.be.true
            if (configResult.ok) {
                expect(configResult.value.facetKeys.length).to.equal(2)

                const facetNames = configResult.value.facetKeys.map(
                    (f: { facetName: string }) => f.facetName
                )
                expect(facetNames).to.include('AccessControlFacet')
                expect(facetNames).to.include('PauseFacet')
                expect(facetNames).to.not.include('KycFacet')
            }
        })
    })

    describe('Consistency with registerFacets Behavior', () => {
        it('should have aligned behavior between registerFacets and createBatchConfiguration', async () => {
            // Deploy an external facet
            const externalFacetResult = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            // Register the facet - registerFacets warns but succeeds
            const registerResult = await registerFacets(provider, {
                blrAddress,
                facets: {
                    PauseFacet: externalFacetResult.address!,
                },
            })

            expect(registerResult.success).to.be.true
            expect(registerResult.registered).to.include('PauseFacet')

            // Configure the same facet - createBatchConfiguration should also warn but succeed
            const configResult = await createBatchConfiguration(blrContract, {
                configurationId:
                    ethers.utils.formatBytes32String('CONSISTENCY_TEST'),
                facetNames: ['PauseFacet'],
                facetAddresses: {
                    PauseFacet: externalFacetResult.address!,
                },
            })

            // Both operations should succeed - this is the core consistency test
            expect(configResult.ok).to.be.true
            if (configResult.ok) {
                expect(configResult.value.facetKeys.length).to.equal(1)
                expect(configResult.value.facetKeys[0].facetName).to.equal(
                    'PauseFacet'
                )
            }
        })
    })

    describe('Error Handling', () => {
        it('should fail when no facets have deployed addresses', async () => {
            const configResult = await createBatchConfiguration(blrContract, {
                configurationId:
                    ethers.utils.formatBytes32String('EMPTY_CONFIG'),
                facetNames: ['NonExistentFacet'],
                facetAddresses: {
                    // No address provided
                },
            })

            // Should fail with appropriate error
            expect(configResult.ok).to.be.false
            if (!configResult.ok) {
                expect(configResult.error.code).to.equal('FACET_NOT_FOUND')
            }
        })

        it('should handle empty facet list gracefully', async () => {
            const configResult = await createBatchConfiguration(blrContract, {
                configurationId: ethers.utils.formatBytes32String('NO_FACETS'),
                facetNames: [],
                facetAddresses: {},
            })

            // Should fail with empty facet list error
            expect(configResult.ok).to.be.false
            if (!configResult.ok) {
                expect(configResult.error.code).to.equal('EMPTY_FACET_LIST')
            }
        })
    })
})
