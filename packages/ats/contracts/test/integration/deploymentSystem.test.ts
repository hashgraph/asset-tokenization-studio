// SPDX-License-Identifier: Apache-2.0

/**
 * Integration tests for Phase 1 deployment system.
 *
 * Tests the core deployment operations and utilities to ensure they work
 * correctly together in realistic scenarios.
 *
 * These tests verify:
 * - Atomic operations (deployContract, deployProxy, etc.)
 * - Utilities (validation, naming, registry)
 * - Basic deployment workflows
 */

import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
    HardhatProvider,
    deployContract,
    deployProxy,
    registerFacets,
    getTimeTravelVariant,
    hasTimeTravelVariant,
    resolveContractName,
    getBaseContractName,
    isTimeTravelVariant,
    validateAddress,
    validateBytes32,
    FACET_REGISTRY,
    getFacetDefinition,
    getAllFacets,
    EQUITY_CONFIG_ID,
    BOND_CONFIG_ID,
} from '../../scripts/core'

describe('Phase 1 Deployment System - Integration Tests', () => {
    let provider: HardhatProvider
    let deployer: SignerWithAddress
    let user: SignerWithAddress

    beforeEach(async () => {
        ;[deployer, user] = await ethers.getSigners()
        provider = new HardhatProvider()
    })

    describe('Utilities - Naming', () => {
        it('should generate TimeTravel variant names correctly', () => {
            expect(getTimeTravelVariant('AccessControlFacet')).to.equal(
                'AccessControlFacetTimeTravel'
            )
            expect(getTimeTravelVariant('KycFacet')).to.equal(
                'KycFacetTimeTravel'
            )
            expect(getTimeTravelVariant('ERC20Facet')).to.equal(
                'ERC20FacetTimeTravel'
            )
        })

        it('should detect TimeTravel variant availability from registry', () => {
            expect(hasTimeTravelVariant('AccessControlFacet')).to.be.true
            expect(hasTimeTravelVariant('KycFacet')).to.be.true
            expect(hasTimeTravelVariant('PauseFacet')).to.be.true
        })

        it('should resolve contract names based on useTimeTravel flag', () => {
            // Standard mode
            expect(resolveContractName('AccessControlFacet', false)).to.equal(
                'AccessControlFacet'
            )

            // TimeTravel mode with variant available
            expect(resolveContractName('AccessControlFacet', true)).to.equal(
                'AccessControlFacetTimeTravel'
            )

            // TimeTravel mode but no variant (should return base name)
            expect(resolveContractName('ProxyAdmin', true)).to.equal(
                'ProxyAdmin'
            )
        })

        it('should extract base contract name from TimeTravel variant', () => {
            expect(
                getBaseContractName('AccessControlFacetTimeTravel')
            ).to.equal('AccessControlFacet')
            expect(getBaseContractName('KycFacetTimeTravel')).to.equal(
                'KycFacet'
            )
            expect(getBaseContractName('AccessControlFacet')).to.equal(
                'AccessControlFacet'
            )
        })

        it('should detect if contract name is TimeTravel variant', () => {
            expect(isTimeTravelVariant('AccessControlFacetTimeTravel')).to.be
                .true
            expect(isTimeTravelVariant('KycFacetTimeTravel')).to.be.true
            expect(isTimeTravelVariant('AccessControlFacet')).to.be.false
            expect(isTimeTravelVariant('ProxyAdmin')).to.be.false
        })
    })

    describe('Utilities - Validation', () => {
        it('should validate correct Ethereum addresses', () => {
            expect(() =>
                validateAddress(deployer.address, 'deployer')
            ).to.not.throw()
            expect(() => validateAddress(user.address, 'user')).to.not.throw()
            expect(() =>
                validateAddress(ethers.constants.AddressZero, 'zero address')
            ).to.not.throw()
        })

        it('should reject invalid addresses', () => {
            expect(() => validateAddress('0xinvalid', 'test')).to.throw()
            expect(() => validateAddress('not-an-address', 'test')).to.throw()
            expect(() => validateAddress('0x123', 'test')).to.throw()
            expect(() => validateAddress('', 'test')).to.throw()
        })

        it('should validate bytes32 values', () => {
            expect(() =>
                validateBytes32(EQUITY_CONFIG_ID, 'config ID')
            ).to.not.throw()
            expect(() =>
                validateBytes32(BOND_CONFIG_ID, 'config ID')
            ).to.not.throw()
        })

        it('should reject invalid bytes32 values', () => {
            expect(() => validateBytes32('0xinvalid', 'config ID')).to.throw()
            expect(() => validateBytes32('not-bytes32', 'config ID')).to.throw()
        })
    })

    describe('Registry', () => {
        it('should contain expected Phase 1 facets', () => {
            expect(FACET_REGISTRY).to.have.property('AccessControlFacet')
            expect(FACET_REGISTRY).to.have.property('KycFacet')
            expect(FACET_REGISTRY).to.have.property('PauseFacet')
            expect(FACET_REGISTRY).to.have.property('ERC20Facet')
            expect(FACET_REGISTRY).to.have.property('ControlListFacet')
        })

        it('should have correct facet metadata', () => {
            const accessControl = getFacetDefinition('AccessControlFacet')!
            expect(accessControl).to.exist
            expect(accessControl.name).to.equal('AccessControlFacet')
            expect(accessControl.description).to.exist

            const kyc = getFacetDefinition('KycFacet')!
            expect(kyc).to.exist
            expect(kyc.name).to.equal('KycFacet')
            expect(kyc.description).to.exist
        })

        it('should return all facets', () => {
            const allFacets = getAllFacets()
            expect(allFacets.length).to.equal(46) // Registry contains 46 facets

            // Verify each facet has required fields
            allFacets.forEach((facet) => {
                expect(facet.name).to.exist
                expect(facet.description).to.exist
            })
        })

        it('should get specific facet by name', () => {
            const accessControl = getFacetDefinition('AccessControlFacet')
            expect(accessControl).to.exist
            expect(accessControl!.name).to.equal('AccessControlFacet')

            const nonExistent = getFacetDefinition('NonExistentFacet')
            expect(nonExistent).to.be.undefined
        })
    })

    describe('Atomic Operations - deployContract', () => {
        it('should deploy a simple contract successfully', async () => {
            const result = await deployContract(provider, {
                contractName: 'ProxyAdmin',
            })

            expect(result.success).to.be.true
            expect(result.contract).to.exist
            expect(result.address).to.match(/^0x[a-fA-F0-9]{40}$/)
            expect(result.transactionHash).to.exist
            expect(result.blockNumber).to.be.greaterThan(0)
            expect(result.gasUsed).to.be.greaterThan(0)
            expect(result.error).to.not.exist
        })

        it('should deploy TimeTravel variant when specified', async () => {
            const result = await deployContract(provider, {
                contractName: 'AccessControlFacetTimeTravel',
            })

            expect(result.success).to.be.true
            expect(result.contract).to.exist
            expect(result.address).to.match(/^0x[a-fA-F0-9]{40}$/)
        })

        it('should deploy regular facet successfully', async () => {
            const result = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })

            expect(result.success).to.be.true
            expect(result.contract).to.exist
        })

        it('should handle non-existent contract gracefully', async () => {
            const result = await deployContract(provider, {
                contractName: 'NonExistentContract',
            })

            expect(result.success).to.be.false
            expect(result.error).to.exist
            expect(result.error).to.include('NonExistentContract')
            expect(result.contract).to.not.exist
            expect(result.address).to.not.exist
        })
    })

    describe('Atomic Operations - deployProxy', () => {
        it('should deploy complete proxy setup (implementation, proxy, proxyAdmin)', async () => {
            const result = await deployProxy(provider, {
                implementationContract: 'BusinessLogicResolver',
            })

            // Check implementation
            expect(result.implementation).to.exist
            expect(result.implementationAddress).to.match(/^0x[a-fA-F0-9]{40}$/)

            // Check proxy
            expect(result.proxy).to.exist
            expect(result.proxyAddress).to.match(/^0x[a-fA-F0-9]{40}$/)

            // Check ProxyAdmin
            expect(result.proxyAdmin).to.exist
            expect(result.proxyAdminAddress).to.match(/^0x[a-fA-F0-9]{40}$/)

            // Check receipts
            expect(result.receipts.implementation).to.exist
            expect(result.receipts.proxy).to.exist
            expect(result.receipts.proxyAdmin).to.exist

            // Verify addresses are different
            expect(result.implementationAddress).to.not.equal(
                result.proxyAddress
            )
            expect(result.proxyAddress).to.not.equal(result.proxyAdminAddress)
        })

        it('should reuse existing ProxyAdmin when provided', async () => {
            // Deploy first proxy (creates ProxyAdmin)
            const result1 = await deployProxy(provider, {
                implementationContract: 'BusinessLogicResolver',
            })

            // Deploy second proxy reusing ProxyAdmin
            const result2 = await deployProxy(provider, {
                implementationContract: 'Factory',
                proxyAdminAddress: result1.proxyAdminAddress,
            })

            expect(result2.proxyAdminAddress).to.equal(
                result1.proxyAdminAddress
            )
            expect(result2.receipts.proxyAdmin).to.not.exist
        })
    })

    describe('Atomic Operations - registerFacets', () => {
        it('should register multiple facets in BLR', async () => {
            // Deploy BLR
            const blrResult = await deployProxy(provider, {
                implementationContract: 'BusinessLogicResolver',
            })

            // Initialize BLR
            const blrFactory = await provider.getFactory(
                'BusinessLogicResolver'
            )
            const blr = blrFactory.attach(blrResult.proxyAddress)
            await blr.initialize_BusinessLogicResolver()

            // Deploy facets
            const facet1 = await deployContract(provider, {
                contractName: 'AccessControlFacet',
            })
            const facet2 = await deployContract(provider, {
                contractName: 'KycFacet',
            })

            // Register facets
            const registerResult = await registerFacets(provider, {
                blrAddress: blrResult.proxyAddress,
                facets: {
                    AccessControlFacet: facet1.address!,
                    KycFacet: facet2.address!,
                },
            })

            expect(registerResult.success).to.be.true
            expect(registerResult.blrAddress).to.equal(blrResult.proxyAddress)
            expect(registerResult.registered.length).to.equal(2)
            expect(registerResult.transactionHash).to.exist
        })

        it('should register single facet', async () => {
            const blrResult = await deployProxy(provider, {
                implementationContract: 'BusinessLogicResolver',
            })

            // Initialize BLR
            const blrFactory = await provider.getFactory(
                'BusinessLogicResolver'
            )
            const blr = blrFactory.attach(blrResult.proxyAddress)
            await blr.initialize_BusinessLogicResolver()

            const facetResult = await deployContract(provider, {
                contractName: 'PauseFacet',
            })

            const registerResult = await registerFacets(provider, {
                blrAddress: blrResult.proxyAddress,
                facets: {
                    PauseFacet: facetResult.address!,
                },
            })

            expect(registerResult.success).to.be.true
            expect(registerResult.registered.length).to.equal(1)
            expect(registerResult.registered[0]).to.equal('PauseFacet')
        })
    })

    describe('Complete Workflow', () => {
        it('should execute basic deployment pipeline', async () => {
            // Step 1: Deploy ProxyAdmin
            const proxyAdminResult = await deployContract(provider, {
                contractName: 'ProxyAdmin',
            })
            expect(proxyAdminResult.success).to.be.true

            // Step 2: Deploy facets
            const facets = ['AccessControlFacet', 'KycFacet', 'PauseFacet']
            const facetResults: Record<string, string> = {}

            for (const facetName of facets) {
                const result = await deployContract(provider, {
                    contractName: facetName,
                })
                expect(result.success).to.be.true
                facetResults[facetName] = result.address!
            }

            // Step 3: Deploy BLR with proxy
            const blrResult = await deployProxy(provider, {
                implementationContract: 'BusinessLogicResolver',
                proxyAdminAddress: proxyAdminResult.address,
            })
            expect(blrResult.proxyAddress).to.match(/^0x[a-fA-F0-9]{40}$/)
            expect(blrResult.proxyAdminAddress).to.equal(
                proxyAdminResult.address
            )

            // Initialize BLR
            const blrFactory = await provider.getFactory(
                'BusinessLogicResolver'
            )
            const blr = blrFactory.attach(blrResult.proxyAddress)
            await blr.initialize_BusinessLogicResolver()

            // Step 4: Register facets in BLR
            const registerResult = await registerFacets(provider, {
                blrAddress: blrResult.proxyAddress,
                facets: facetResults,
            })
            expect(registerResult.success).to.be.true
            expect(registerResult.registered.length).to.equal(3)

            // Step 5: Deploy Factory
            const factoryResult = await deployProxy(provider, {
                implementationContract: 'Factory',
                proxyAdminAddress: proxyAdminResult.address,
            })
            expect(factoryResult.proxyAddress).to.match(/^0x[a-fA-F0-9]{40}$/)
        })

        it('should handle TimeTravel deployment workflow', async () => {
            // Deploy all facets in TimeTravel mode
            const facets = ['AccessControlFacet', 'KycFacet']
            const facetResults: Record<string, string> = {}

            for (const baseName of facets) {
                const contractName = getTimeTravelVariant(baseName)
                const result = await deployContract(provider, {
                    contractName,
                })
                expect(result.success).to.be.true
                facetResults[baseName] = result.address!
            }

            // Deploy BLR
            const blrResult = await deployProxy(provider, {
                implementationContract: 'BusinessLogicResolver',
            })

            // Initialize BLR
            const blrFactory = await provider.getFactory(
                'BusinessLogicResolver'
            )
            const blr = blrFactory.attach(blrResult.proxyAddress)
            await blr.initialize_BusinessLogicResolver()

            // Register TimeTravel facets (using base names as keys)
            const registerResult = await registerFacets(provider, {
                blrAddress: blrResult.proxyAddress,
                facets: facetResults,
            })

            expect(registerResult.success).to.be.true
            expect(registerResult.registered.length).to.equal(2)
        })
    })

    describe('Error Handling', () => {
        it('should provide clear error messages for deployment failures', async () => {
            const result = await deployContract(provider, {
                contractName: 'ContractThatDoesNotExist',
            })

            expect(result.success).to.be.false
            expect(result.error).to.exist
            expect(result.error!.toLowerCase()).to.include('factory')
        })

        it('should validate addresses before operations', () => {
            expect(() => validateAddress('invalid', 'test')).to.throw()
            expect(() => validateAddress('0x123', 'test')).to.throw()
            expect(() => validateAddress('', 'test')).to.throw()
        })

        it('should handle empty facet registration', async () => {
            const blrResult = await deployProxy(provider, {
                implementationContract: 'BusinessLogicResolver',
            })

            // Initialize BLR
            const blrFactory = await provider.getFactory(
                'BusinessLogicResolver'
            )
            const blr = blrFactory.attach(blrResult.proxyAddress)
            await blr.initialize_BusinessLogicResolver()

            const registerResult = await registerFacets(provider, {
                blrAddress: blrResult.proxyAddress,
                facets: {},
            })

            expect(registerResult.success).to.be.true
            expect(registerResult.registered.length).to.equal(0)
        })
    })
})
