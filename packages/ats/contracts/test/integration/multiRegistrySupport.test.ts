// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for multi-registry support.
 *
 * Tests the combineRegistries utility and multi-registry facet registration.
 *
 * Test coverage:
 * - Registry combination with no conflicts
 * - Registry combination with conflicts (all strategies)
 * - Conflict detection helper
 * - Multi-registry facet registration
 * - Single registry optimization
 * - Error handling
 */

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

// Infrastructure layer
import {
    HardhatProvider,
    deployContract,
    deployProxy,
    registerFacets,
    combineRegistries,
    getRegistryConflicts,
    type RegistryProvider,
    type FacetDefinition,
} from '@scripts/infrastructure'

describe('Multi-Registry Support - Integration Tests', () => {
    let provider: HardhatProvider
    let _deployer: SignerWithAddress
    let blrAddress: string

    // Mock registries for testing
    const mockAtsRegistry: RegistryProvider = {
        getFacetDefinition: (name: string): FacetDefinition | undefined => {
            const registry: Record<string, FacetDefinition> = {
                AccessControlFacet: {
                    name: 'AccessControlFacet',
                    description: 'Role-based access control',
                    resolverKey: {
                        name: '_ACCESS_CONTROL_RESOLVER_KEY',
                        value: '0x011768a4153571b743e8cf07b54dc25e1f8d330fbecb7d3b1b34acfc2842e179',
                    },
                },
                PauseFacet: {
                    name: 'PauseFacet',
                    description: 'Emergency pause functionality',
                    resolverKey: {
                        name: '_PAUSE_RESOLVER_KEY',
                        value: '0x0e3ba2c890ef9e74adac48c0f611be7ebbb3b7c74db3d8d32ea9b7d1f9e73c2d',
                    },
                },
            }
            return registry[name]
        },
        getAllFacets: (): FacetDefinition[] => [
            {
                name: 'AccessControlFacet',
                description: 'Role-based access control',
                resolverKey: {
                    name: '_ACCESS_CONTROL_RESOLVER_KEY',
                    value: '0x011768a4153571b743e8cf07b54dc25e1f8d330fbecb7d3b1b34acfc2842e179',
                },
            },
            {
                name: 'PauseFacet',
                description: 'Emergency pause functionality',
                resolverKey: {
                    name: '_PAUSE_RESOLVER_KEY',
                    value: '0x0e3ba2c890ef9e74adac48c0f611be7ebbb3b7c74db3d8d32ea9b7d1f9e73c2d',
                },
            },
        ],
    }

    const mockCustomRegistry: RegistryProvider = {
        getFacetDefinition: (name: string): FacetDefinition | undefined => {
            const registry: Record<string, FacetDefinition> = {
                CustomComplianceFacet: {
                    name: 'CustomComplianceFacet',
                    description: 'Custom compliance rules',
                    resolverKey: {
                        name: '_CUSTOM_COMPLIANCE_RESOLVER_KEY',
                        value: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                    },
                },
                CustomRewardsFacet: {
                    name: 'CustomRewardsFacet',
                    description: 'Custom rewards system',
                    resolverKey: {
                        name: '_CUSTOM_REWARDS_RESOLVER_KEY',
                        value: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                    },
                },
            }
            return registry[name]
        },
        getAllFacets: (): FacetDefinition[] => [
            {
                name: 'CustomComplianceFacet',
                description: 'Custom compliance rules',
                resolverKey: {
                    name: '_CUSTOM_COMPLIANCE_RESOLVER_KEY',
                    value: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
                },
            },
            {
                name: 'CustomRewardsFacet',
                description: 'Custom rewards system',
                resolverKey: {
                    name: '_CUSTOM_REWARDS_RESOLVER_KEY',
                    value: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
                },
            },
        ],
    }

    // Registry with conflicting facet name
    const mockConflictingRegistry: RegistryProvider = {
        getFacetDefinition: (name: string): FacetDefinition | undefined => {
            if (name === 'PauseFacet') {
                return {
                    name: 'PauseFacet',
                    description: 'Different pause implementation',
                    resolverKey: {
                        name: '_CUSTOM_PAUSE_RESOLVER_KEY',
                        value: '0xdifferent1234567890different1234567890different1234567890diff',
                    },
                }
            }
            return undefined
        },
        getAllFacets: (): FacetDefinition[] => [
            {
                name: 'PauseFacet',
                description: 'Different pause implementation',
                resolverKey: {
                    name: '_CUSTOM_PAUSE_RESOLVER_KEY',
                    value: '0xdifferent1234567890different1234567890different1234567890diff',
                },
            },
        ],
    }

    beforeEach(async () => {
        ;[_deployer] = await ethers.getSigners()
        provider = new HardhatProvider()

        // Deploy BLR for tests
        const blrResult = await deployProxy(provider, {
            implementationContract: 'BusinessLogicResolver',
        })

        blrAddress = blrResult.proxyAddress

        // Initialize BLR
        const blrFactory = await provider.getFactory('BusinessLogicResolver')
        const blrContract = blrFactory.attach(blrAddress)
        await blrContract.initialize_BusinessLogicResolver()
    })

    describe('combineRegistries - No Conflicts', () => {
        it('should combine two registries with no conflicts', () => {
            const combined = combineRegistries(
                mockAtsRegistry,
                mockCustomRegistry
            )

            // Should have all facets from both registries
            const allFacets = combined.getAllFacets()
            expect(allFacets).to.have.lengthOf(4)

            // Should be able to find facets from both registries
            expect(combined.getFacetDefinition('AccessControlFacet')).to.exist
            expect(combined.getFacetDefinition('PauseFacet')).to.exist
            expect(combined.getFacetDefinition('CustomComplianceFacet')).to
                .exist
            expect(combined.getFacetDefinition('CustomRewardsFacet')).to.exist
        })

        it('should preserve facet metadata when combining', () => {
            const combined = combineRegistries(
                mockAtsRegistry,
                mockCustomRegistry
            )

            const accessControl =
                combined.getFacetDefinition('AccessControlFacet')
            expect(accessControl?.description).to.equal(
                'Role-based access control'
            )
            expect(accessControl?.resolverKey?.value).to.equal(
                '0x011768a4153571b743e8cf07b54dc25e1f8d330fbecb7d3b1b34acfc2842e179'
            )

            const customCompliance = combined.getFacetDefinition(
                'CustomComplianceFacet'
            )
            expect(customCompliance?.description).to.equal(
                'Custom compliance rules'
            )
            expect(customCompliance?.resolverKey?.value).to.equal(
                '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
            )
        })

        it('should optimize single registry (no merging needed)', () => {
            const combined = combineRegistries(mockAtsRegistry)

            // Should return the same registry (optimization)
            expect(combined.getAllFacets()).to.have.lengthOf(2)
            expect(combined.getFacetDefinition('AccessControlFacet')).to.exist
        })
    })

    describe('combineRegistries - Conflict Handling', () => {
        it('should throw error with "error" strategy on conflict', () => {
            expect(() =>
                combineRegistries(mockAtsRegistry, mockConflictingRegistry, {
                    onConflict: 'error',
                })
            ).to.throw(/Registry conflict.*PauseFacet/)
        })

        it('should use last definition with "warn" strategy (default)', () => {
            const combined = combineRegistries(
                mockAtsRegistry,
                mockConflictingRegistry
            )

            const pauseFacet = combined.getFacetDefinition('PauseFacet')
            expect(pauseFacet?.description).to.equal(
                'Different pause implementation'
            )
            expect(pauseFacet?.resolverKey?.value).to.equal(
                '0xdifferent1234567890different1234567890different1234567890diff'
            )
        })

        it('should use last definition with explicit "last" strategy', () => {
            const combined = combineRegistries(
                mockAtsRegistry,
                mockConflictingRegistry,
                { onConflict: 'last' }
            )

            const pauseFacet = combined.getFacetDefinition('PauseFacet')
            expect(pauseFacet?.resolverKey?.value).to.equal(
                '0xdifferent1234567890different1234567890different1234567890diff'
            )
        })

        it('should use first definition with "first" strategy', () => {
            const combined = combineRegistries(
                mockAtsRegistry,
                mockConflictingRegistry,
                { onConflict: 'first' }
            )

            const pauseFacet = combined.getFacetDefinition('PauseFacet')
            expect(pauseFacet?.description).to.equal(
                'Emergency pause functionality'
            )
            expect(pauseFacet?.resolverKey?.value).to.equal(
                '0x0e3ba2c890ef9e74adac48c0f611be7ebbb3b7c74db3d8d32ea9b7d1f9e73c2d'
            )
        })
    })

    describe('getRegistryConflicts', () => {
        it('should return empty array when no conflicts', () => {
            const conflicts = getRegistryConflicts(
                mockAtsRegistry,
                mockCustomRegistry
            )

            expect(conflicts).to.be.an('array').that.is.empty
        })

        it('should detect conflicts between registries', () => {
            const conflicts = getRegistryConflicts(
                mockAtsRegistry,
                mockConflictingRegistry
            )

            expect(conflicts).to.deep.equal(['PauseFacet'])
        })

        it('should detect multiple conflicts', () => {
            const multiConflictRegistry: RegistryProvider = {
                getFacetDefinition: (name: string) => {
                    const facets = ['AccessControlFacet', 'PauseFacet']
                    if (facets.includes(name)) {
                        return {
                            name,
                            description: 'Conflicting implementation',
                            resolverKey: {
                                name: '_CONFLICT_KEY',
                                value: '0xconflict',
                            },
                        }
                    }
                    return undefined
                },
                getAllFacets: () => [
                    {
                        name: 'AccessControlFacet',
                        description: 'Conflicting implementation',
                    },
                    {
                        name: 'PauseFacet',
                        description: 'Conflicting implementation',
                    },
                ],
            }

            const conflicts = getRegistryConflicts(
                mockAtsRegistry,
                multiConflictRegistry
            )

            expect(conflicts).to.have.lengthOf(2)
            expect(conflicts).to.include.members([
                'AccessControlFacet',
                'PauseFacet',
            ])
        })
    })

    describe('Multi-Registry Facet Registration', () => {
        it('should register facets from multiple registries', async () => {
            // Deploy facets
            const accessControl = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const pause = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            // Register using multiple registries
            const result = await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControl.address!,
                    PauseFacet: pause.address!,
                },
                registries: [mockAtsRegistry, mockCustomRegistry],
            })

            expect(result.success).to.be.true
            expect(result.registered).to.have.lengthOf(2)
            expect(result.registered).to.include.members([
                'AccessControlFacet',
                'PauseFacet',
            ])
        })

        it('should work with single registry in array', async () => {
            const accessControl = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })

            const result = await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControl.address!,
                },
                registries: [mockAtsRegistry], // Single registry
            })

            expect(result.success).to.be.true
            expect(result.registered).to.deep.equal(['AccessControlFacet'])
        })

        it('should fail when facet not found in any registry', async () => {
            const accessControl = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })

            const result = await registerFacets(provider, {
                blrAddress,
                facets: {
                    NonExistentFacet: accessControl.address!, // Not in any registry
                },
                registries: [mockAtsRegistry, mockCustomRegistry],
            })

            expect(result.success).to.be.false
            expect(result.error).to.include('not found in registry')
        })

        it('should throw when no registries provided', async () => {
            const accessControl = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })

            const result = await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControl.address!,
                },
                registries: [], // Empty array
            })

            expect(result.success).to.be.false
            expect(result.error).to.include('No registries provided')
        })
    })

    describe('Edge Cases', () => {
        it('should handle empty registries', () => {
            const emptyRegistry: RegistryProvider = {
                getFacetDefinition: () => undefined,
                getAllFacets: () => [],
            }

            const combined = combineRegistries(mockAtsRegistry, emptyRegistry)

            expect(combined.getAllFacets()).to.have.lengthOf(2)
        })

        it('should handle three or more registries', () => {
            const thirdRegistry: RegistryProvider = {
                getFacetDefinition: (name: string) => {
                    if (name === 'ThirdFacet') {
                        return {
                            name: 'ThirdFacet',
                            description: 'Third registry facet',
                        }
                    }
                    return undefined
                },
                getAllFacets: () => [
                    {
                        name: 'ThirdFacet',
                        description: 'Third registry facet',
                    },
                ],
            }

            const combined = combineRegistries(
                mockAtsRegistry,
                mockCustomRegistry,
                thirdRegistry
            )

            expect(combined.getAllFacets()).to.have.lengthOf(5)
            expect(combined.getFacetDefinition('ThirdFacet')).to.exist
        })

        it('should throw on zero registries', () => {
            expect(() => combineRegistries()).to.throw('at least one registry')
        })
    })
})
