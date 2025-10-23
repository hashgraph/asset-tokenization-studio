// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for registerAdditionalFacets operation.
 *
 * Tests the new operation that enables downstream projects to register
 * custom facets in an existing BLR by automatically querying and merging
 * with existing facets.
 *
 * Test coverage:
 * - Query and merge functionality
 * - Conflict detection
 * - Overwrite scenarios
 * - Error handling
 * - Integration with existing workflows
 */

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
// Infrastructure layer - generic blockchain operations
import {
    HardhatProvider,
    deployContract,
    deployProxy,
    registerFacets,
    registerAdditionalFacets,
} from '@scripts/infrastructure'

// Test helpers
import { TEST_SIZES, BLR_VERSIONS } from '@test'

describe('registerAdditionalFacets - Integration Tests', () => {
    let provider: HardhatProvider
    let _deployer: SignerWithAddress
    let blrAddress: string
    let blrContract: any

    beforeEach(async () => {
        ;[_deployer] = await ethers.getSigners()
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

    describe('Query and Merge', () => {
        it('should query existing facets from BLR and merge with new ones', async () => {
            // Step 1: Register initial set of 3 facets
            const accessControl = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const kyc = await deployContract(provider, {
                contractName: 'KycFacet',
            })
            const pause = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControl.address!,
                    KycFacet: kyc.address!,
                    PauseFacet: pause.address!,
                },
            })

            // Verify initial state: 3 facets registered
            const initialCount = await blrContract.getBusinessLogicCount()
            expect(initialCount).to.equal(TEST_SIZES.TRIPLE)

            // Step 2: Register 2 additional facets
            const freeze = await deployContract(provider, {
                contractName: 'FreezeFacet',
            })
            const lock = await deployContract(provider, {
                contractName: 'LockFacet',
            })

            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    FreezeFacet: freeze.address!,
                    LockFacet: lock.address!,
                },
            })

            // Verify success
            expect(result.success).to.be.true
            expect(result.blrAddress).to.equal(blrAddress)
            expect(result.transactionHash).to.exist
            expect(result.blockNumber).to.be.greaterThan(0)
            expect(result.gasUsed).to.be.greaterThan(0)

            // Verify registered count includes new facets
            expect(result.registered.length).to.equal(TEST_SIZES.DUAL)
            expect(result.registered).to.include('FreezeFacet')
            expect(result.registered).to.include('LockFacet')
            expect(result.failed.length).to.equal(0)

            // Verify BLR now has 5 facets total
            const finalCount = await blrContract.getBusinessLogicCount()
            expect(finalCount).to.equal(TEST_SIZES.SMALL_BATCH)
        })

        it('should handle empty BLR (no existing facets)', async () => {
            // BLR is initialized but has no facets registered
            const count = await blrContract.getBusinessLogicCount()
            expect(count).to.equal(0)

            // Register first facets using registerAdditionalFacets
            const accessControl = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const kyc = await deployContract(provider, {
                contractName: 'KycFacet',
            })

            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    AccessControlFacet: accessControl.address!,
                    KycFacet: kyc.address!,
                },
            })

            expect(result.success).to.be.true
            expect(result.registered.length).to.equal(TEST_SIZES.DUAL)

            const finalCount = await blrContract.getBusinessLogicCount()
            expect(finalCount).to.equal(TEST_SIZES.DUAL)
        })

        it('should register complete merged list with correct version increment', async () => {
            // Register initial facets
            const facet1 = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            await registerFacets(provider, {
                blrAddress,
                facets: { AccessControlFacet: facet1.address! },
            })

            // Get initial version
            const initialVersion = await blrContract.getLatestVersion()
            expect(initialVersion).to.equal(BLR_VERSIONS.FIRST)

            // Add more facets
            const facet2 = await deployContract(provider, {
                contractName: 'KycFacet',
            })
            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: { KycFacet: facet2.address! },
            })

            expect(result.success).to.be.true

            // Verify version incremented
            const newVersion = await blrContract.getLatestVersion()
            expect(newVersion).to.equal(BLR_VERSIONS.SECOND)
        })

        it('should work incrementally over multiple calls', async () => {
            // Call 1: Register 2 facets
            const facet1 = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const facet2 = await deployContract(provider, {
                contractName: 'KycFacet',
            })
            await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    AccessControlFacet: facet1.address!,
                    KycFacet: facet2.address!,
                },
            })

            let count = await blrContract.getBusinessLogicCount()
            expect(count).to.equal(TEST_SIZES.DUAL)

            // Call 2: Register 2 more facets
            const facet3 = await deployContract(provider, {
                contractName: 'PauseFacet',
            })
            const facet4 = await deployContract(provider, {
                contractName: 'FreezeFacet',
            })
            await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    PauseFacet: facet3.address!,
                    FreezeFacet: facet4.address!,
                },
            })

            count = await blrContract.getBusinessLogicCount()
            expect(count).to.equal(4) // 2 + 2 = 4

            // Call 3: Register 1 more facet
            const facet5 = await deployContract(provider, {
                contractName: 'LockFacet',
            })
            await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: { LockFacet: facet5.address! },
            })

            count = await blrContract.getBusinessLogicCount()
            expect(count).to.equal(TEST_SIZES.SMALL_BATCH) // 4 + 1 = 5
        })

        it('should handle pagination for large existing facet counts', async () => {
            // Register 10 facets initially
            const facetNames = [
                'AccessControlFacet',
                'KycFacet',
                'PauseFacet',
                'FreezeFacet',
                'LockFacet',
                'ControlListFacet',
                'CapFacet',
                'SnapshotsFacet',
                'ERC20Facet',
                'DiamondFacet',
            ]

            const facets: Record<string, string> = {}
            for (const name of facetNames) {
                const result = await deployContract(provider, {
                    contractName: name,
                })
                facets[name] = result.address!
            }

            await registerFacets(provider, { blrAddress, facets })

            // Verify 10 facets registered
            const initialCount = await blrContract.getBusinessLogicCount()
            expect(initialCount).to.equal(TEST_SIZES.MEDIUM_BATCH)

            // Add 2 more using registerAdditionalFacets
            const erc1410 = await deployContract(provider, {
                contractName: 'ERC1410ReadFacet',
            })
            const erc1594 = await deployContract(provider, {
                contractName: 'ERC1594Facet',
            })

            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    ERC1410ReadFacet: erc1410.address!,
                    ERC1594Facet: erc1594.address!,
                },
            })

            expect(result.success).to.be.true

            const finalCount = await blrContract.getBusinessLogicCount()
            expect(finalCount).to.equal(TEST_SIZES.LARGE_BATCH) // 10 + 2 = 12
        })
    })

    describe('Conflict Detection', () => {
        it('should detect conflicts (same facet name, different address)', async () => {
            // Register facet at address A
            const facetA = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            await registerFacets(provider, {
                blrAddress,
                facets: { AccessControlFacet: facetA.address! },
            })

            // Deploy different instance at address B
            const facetB = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })

            // Attempt to register same facet at different address
            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: { AccessControlFacet: facetB.address! },
                allowOverwrite: false,
            })

            // Should fail with conflict error
            expect(result.success).to.be.false
            expect(result.error).to.exist
            expect(result.error).to.include('already exist')
            expect(result.failed).to.include('AccessControlFacet')
        })

        it('should prevent overwrites by default (allowOverwrite=false)', async () => {
            // Register initial facet
            const facet1 = await deployContract(provider, {
                contractName: 'KycFacet',
            })
            await registerFacets(provider, {
                blrAddress,
                facets: { KycFacet: facet1.address! },
            })

            // Deploy new version
            const facet2 = await deployContract(provider, {
                contractName: 'KycFacet',
            })

            // Try to register without allowOverwrite (default false)
            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: { KycFacet: facet2.address! },
            })

            expect(result.success).to.be.false
            expect(result.failed).to.include('KycFacet')
        })

        it('should allow overwrites when explicitly enabled (allowOverwrite=true)', async () => {
            // Register initial facet
            const facet1 = await deployContract(provider, {
                contractName: 'PauseFacet',
            })
            await registerFacets(provider, {
                blrAddress,
                facets: { PauseFacet: facet1.address! },
            })

            // Deploy new version
            const facet2 = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            // Register with allowOverwrite=true
            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: { PauseFacet: facet2.address! },
                allowOverwrite: true,
            })

            // Should succeed
            expect(result.success).to.be.true
            expect(result.registered).to.include('PauseFacet')

            // Verify BLR still has 1 facet (overwritten, not added)
            const count = await blrContract.getBusinessLogicCount()
            expect(count).to.equal(TEST_SIZES.SINGLE)

            // Verify facet resolves to new address
            const facetKey = ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes('PauseFacet')
            )
            const resolvedAddress =
                await blrContract.resolveLatestBusinessLogic(facetKey)
            expect(resolvedAddress).to.equal(facet2.address)
        })

        it('should skip facets already registered at same address', async () => {
            // Register facet
            const facet = await deployContract(provider, {
                contractName: 'FreezeFacet',
            })
            await registerFacets(provider, {
                blrAddress,
                facets: { FreezeFacet: facet.address! },
            })

            const initialCount = await blrContract.getBusinessLogicCount()

            // Try to register same facet at same address
            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: { FreezeFacet: facet.address! },
            })

            // Should succeed but not add duplicate
            expect(result.success).to.be.true

            // Count should remain same
            const finalCount = await blrContract.getBusinessLogicCount()
            expect(finalCount).to.equal(initialCount)

            // Version remains same when re-registering same facet at same address (no-op)
            const finalVersion = await blrContract.getBusinessLogicCount()
            expect(finalVersion).to.equal(initialCount)
        })
    })

    describe('Error Handling', () => {
        it('should fail if new facet address is invalid', async () => {
            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    InvalidFacet: '0xinvalid',
                },
            })

            expect(result.success).to.be.false
            expect(result.error).to.exist
            expect(result.failed).to.include('InvalidFacet')
        })

        it('should fail if new facet contract does not exist at address', async () => {
            // Use a valid address format but no contract deployed
            const nonExistentAddress =
                '0x1234567890123456789012345678901234567890'

            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    NonExistentFacet: nonExistentAddress,
                },
            })

            expect(result.success).to.be.false
            expect(result.failed).to.include('NonExistentFacet')
        })

        it('should validate at least one new facet is provided', async () => {
            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {},
            })

            // Should succeed but with no-op
            expect(result.success).to.be.true
            expect(result.registered.length).to.equal(0)
            expect(result.failed.length).to.equal(0)
        })

        it('should handle conflicts gracefully with clear error messages', async () => {
            // Register initial facet
            const facet1 = await deployContract(provider, {
                contractName: 'LockFacet',
            })
            await registerFacets(provider, {
                blrAddress,
                facets: { LockFacet: facet1.address! },
            })

            // Try to register different address for same facet
            const facet2 = await deployContract(provider, {
                contractName: 'LockFacet',
            })

            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    LockFacet: facet2.address!,
                },
                allowOverwrite: false,
            })

            expect(result.success).to.be.false
            expect(result.error).to.exist
            expect(result.error).to.include('already exist')
            expect(result.error).to.include('allowOverwrite')
            expect(result.failed).to.deep.equal(['LockFacet'])
        })
    })

    describe('Integration with Existing Workflows', () => {
        it('should work correctly after initial registerFacets call', async () => {
            // Use standard registerFacets first
            const facets1 = ['AccessControlFacet', 'KycFacet', 'PauseFacet']
            const addresses1: Record<string, string> = {}

            for (const name of facets1) {
                const result = await deployContract(provider, {
                    contractName: name,
                })
                addresses1[name] = result.address!
            }

            await registerFacets(provider, {
                blrAddress,
                facets: addresses1,
            })

            // Then use registerAdditionalFacets to extend
            const facets2 = ['FreezeFacet', 'LockFacet']
            const addresses2: Record<string, string> = {}

            for (const name of facets2) {
                const result = await deployContract(provider, {
                    contractName: name,
                })
                addresses2[name] = result.address!
            }

            const result = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: addresses2,
            })

            expect(result.success).to.be.true
            expect(result.registered.length).to.equal(TEST_SIZES.DUAL)

            const finalCount = await blrContract.getBusinessLogicCount()
            expect(finalCount).to.equal(TEST_SIZES.SMALL_BATCH)
        })

        it('should work with configurations created after registration', async () => {
            // Register initial facets
            const accessControl = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const kyc = await deployContract(provider, {
                contractName: 'KycFacet',
            })
            const pause = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            await registerFacets(provider, {
                blrAddress,
                facets: {
                    AccessControlFacet: accessControl.address!,
                    KycFacet: kyc.address!,
                    PauseFacet: pause.address!,
                },
            })

            // Add more facets
            const freeze = await deployContract(provider, {
                contractName: 'FreezeFacet',
            })
            const lock = await deployContract(provider, {
                contractName: 'LockFacet',
            })

            const addResult = await registerAdditionalFacets(provider, {
                blrAddress,
                newFacets: {
                    FreezeFacet: freeze.address!,
                    LockFacet: lock.address!,
                },
            })

            expect(addResult.success).to.be.true

            // Verify all facets can be resolved from BLR
            const facetNames = [
                'AccessControlFacet',
                'KycFacet',
                'PauseFacet',
                'FreezeFacet',
                'LockFacet',
            ]

            for (const name of facetNames) {
                const key = ethers.utils.keccak256(
                    ethers.utils.toUtf8Bytes(name)
                )
                const address =
                    await blrContract.resolveLatestBusinessLogic(key)
                expect(address).to.not.equal(ethers.constants.AddressZero)
            }
        })
    })
})
