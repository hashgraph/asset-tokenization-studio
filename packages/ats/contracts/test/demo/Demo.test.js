'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const hardhat_network_helpers_1 = require('@nomicfoundation/hardhat-network-helpers')
const chai_1 = require('chai')
const hardhat_1 = require('hardhat')
var VersionStatus
;(function (VersionStatus) {
    VersionStatus[(VersionStatus['NONE'] = 0)] = 'NONE'
    VersionStatus[(VersionStatus['ACTIVATED'] = 1)] = 'ACTIVATED'
    VersionStatus[(VersionStatus['DEACTIVATED'] = 2)] = 'DEACTIVATED'
})(VersionStatus || (VersionStatus = {}))
describe('Demo RedSwam', () => {
    let businessLogicResolver,
        diamond,
        diamondLoupe,
        diamondCut,
        testFacet1,
        testFacet2
    async function deployBusinessLogicResolver() {
        businessLogicResolver = await hardhat_1.ethers
            .getContractFactory('BusinessLogicResolver')
            .then(async (contract) => await contract.deploy())
    }
    async function deployDiamond() {
        const rbacs = []
        const initialization = {
            contractAddress: '0x0000000000000000000000000000000000000000',
            calldataInitialization: '0x',
        }
        const diamondArgs = {
            rbacs,
            initialization,
        }
        const businessLogicKeys = [
            await diamondCut.getStaticResolverKey(),
            await diamondLoupe.getStaticResolverKey(),
            await testFacet1.getStaticResolverKey(),
            await testFacet2.getStaticResolverKey(),
        ]
        const resolver = await businessLogicResolver.address
        diamond = await hardhat_1.ethers
            .getContractFactory('Diamond')
            .then(
                async (contract) =>
                    await contract.deploy(
                        resolver,
                        businessLogicKeys,
                        diamondArgs
                    )
            )
    }
    async function deployDiamondCut() {
        diamondCut = await hardhat_1.ethers
            .getContractFactory('DiamondCutFacet')
            .then(async (contract) => await contract.deploy())
    }
    async function deployDiamondLoupe() {
        diamondLoupe = await hardhat_1.ethers
            .getContractFactory('DiamondLoupeFacet')
            .then(async (contract) => await contract.deploy())
    }
    async function deployTestFacet1() {
        testFacet1 = await hardhat_1.ethers
            .getContractFactory('TestFacet1')
            .then(async (contract) => await contract.deploy())
    }
    async function deployTestFacet2() {
        testFacet2 = await hardhat_1.ethers
            .getContractFactory('TestFacet2')
            .then(async (contract) => await contract.deploy())
    }
    it('Demo RedSwam', async () => {
        await (0, hardhat_network_helpers_1.loadFixture)(
            deployBusinessLogicResolver
        )
        await (0, hardhat_network_helpers_1.loadFixture)(deployDiamondCut)
        await (0, hardhat_network_helpers_1.loadFixture)(deployDiamondLoupe)
        await (0, hardhat_network_helpers_1.loadFixture)(deployTestFacet1)
        await (0, hardhat_network_helpers_1.loadFixture)(deployTestFacet2)
        console.log(`
Deployed contracts:
    BusinessLogicResolver: ${await businessLogicResolver.address},
    DiamondCutFacet: 
        address: ${await diamondCut.address},
        key: ${await diamondCut.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await diamondCut.getStaticFunctionSelectors()
        )},
    DiamondLoupeFacet: 
        address: ${await diamondLoupe.address},
        key: ${await diamondLoupe.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await diamondLoupe.getStaticFunctionSelectors()
        )},
    TestFacet1: 
        address: ${await testFacet1.address},
        key: ${await testFacet1.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await testFacet1.getStaticFunctionSelectors()
        )},
    TestFacet2: 
        address: ${await testFacet2.address},
        key: ${await testFacet2.getStaticResolverKey()},
        selectors: ${JSON.stringify(
            await testFacet2.getStaticFunctionSelectors()
        )}`)
        const businessLogicRegistries = [
            {
                businessLogicKey: await diamondCut.getStaticResolverKey(),
                businessLogicAddress: await diamondCut.address,
            },
            {
                businessLogicKey: await diamondLoupe.getStaticResolverKey(),
                businessLogicAddress: await diamondLoupe.address,
            },
            {
                businessLogicKey: await testFacet1.getStaticResolverKey(),
                businessLogicAddress: await testFacet1.address,
            },
            {
                businessLogicKey: await testFacet2.getStaticResolverKey(),
                businessLogicAddress: await testFacet2.address,
            },
        ]
        await (0, chai_1.expect)(
            businessLogicResolver.registerBusinessLogics(
                businessLogicRegistries
            )
        ).to.emit(businessLogicResolver, 'BusinessLogicsRegistered')
        ;(0, chai_1.expect)(
            await businessLogicResolver.getVersionStatus(1)
        ).to.be.equal(VersionStatus.ACTIVATED)
        ;(0, chai_1.expect)(
            await businessLogicResolver.getLatestVersion()
        ).to.be.equal(1)
        ;(0, chai_1.expect)(
            await businessLogicResolver.resolveLatestBusinessLogic(
                await diamondCut.getStaticResolverKey()
            )
        ).to.be.equal(await diamondCut.address)
        ;(0, chai_1.expect)(
            await businessLogicResolver.resolveLatestBusinessLogic(
                await diamondLoupe.getStaticResolverKey()
            )
        ).to.be.equal(await diamondLoupe.address)
        ;(0, chai_1.expect)(
            await businessLogicResolver.resolveLatestBusinessLogic(
                await testFacet1.getStaticResolverKey()
            )
        ).to.be.equal(await testFacet1.address)
        ;(0, chai_1.expect)(
            await businessLogicResolver.resolveLatestBusinessLogic(
                await testFacet2.getStaticResolverKey()
            )
        ).to.be.equal(await testFacet2.address)
        ;(0, chai_1.expect)(
            await businessLogicResolver.resolveBusinessLogicByVersion(
                await diamondCut.getStaticResolverKey(),
                1
            )
        ).to.be.equal(await diamondCut.address)
        ;(0, chai_1.expect)(
            await businessLogicResolver.getBusinessLogicCount()
        ).to.be.equal(4)
        ;(0, chai_1.expect)(
            await businessLogicResolver.getBusinessLogicKeys(0, 10)
        ).to.be.deep.equal([
            await diamondCut.getStaticResolverKey(),
            await diamondLoupe.getStaticResolverKey(),
            await testFacet1.getStaticResolverKey(),
            await testFacet2.getStaticResolverKey(),
        ])
        await (0, hardhat_network_helpers_1.loadFixture)(deployDiamond)
        /*console.log(`    Diamond: ${await diamond.address}`)

        const loupeFacet: DiamondLoupeFacet = await ethers.getContractAt(
            'DiamondLoupeFacet',
            await diamond.address
        )

        console.log(`
DiamondResume:
    DiamondLoupe.facets: ${JSON.stringify(await loupeFacet.facets())}
    DiamondLoupe.facetFunctionSelectors[diamondCut]: ${JSON.stringify(
        await loupeFacet.facetFunctionSelectors(
            await diamondCut.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[diamondLoupe]: ${JSON.stringify(
        await loupeFacet.facetFunctionSelectors(
            await diamondLoupe.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[testFacet1]: ${JSON.stringify(
        await loupeFacet.facetFunctionSelectors(
            await testFacet1.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetFunctionSelectors[testFacet2]: ${JSON.stringify(
        await loupeFacet.facetFunctionSelectors(
            await testFacet2.getStaticResolverKey()
        )
    )}
    DiamondLoupe.facetKeys: ${JSON.stringify(await loupeFacet.facetKeys())}
    DiamondLoupe.facetAddresses: ${JSON.stringify(
        await loupeFacet.facetAddresses()
    )}
    DiamondLoupe.facetAddress(0xb8fb063e): ${await loupeFacet.facetAddress(
        '0xb8fb063e'
    )}
    DiamondLoupe.facetKey(0xb8fb063e): ${await loupeFacet.facetKey(
        '0xb8fb063e'
    )}
    DiamondLoupe.supportsInterface(0xb8fb063e): ${JSON.stringify(
        await loupeFacet.supportsInterface('0xb8fb063e')
    )}`)

        const facet1: TestFacet1 = await ethers.getContractAt(
            'TestFacet1',
            await diamond.address
        )
        await expect(facet1.testFunction1()).to.be.revertedWith(
            'TestFacet1.testFunction1'
        )
        await expect(facet1.testFunction2()).to.be.revertedWith(
            'TestFacet1.testFunction2'
        )
        await expect(facet1.testFunction3()).to.be.revertedWith(
            'TestFacet1.testFunction3'
        )
        await expect(facet1.testFunction4()).to.be.revertedWith(
            'TestFacet1.testFunction4'
        )

        const facet2: TestFacet2 = await ethers.getContractAt(
            'TestFacet2',
            await diamond.address
        )
        await expect(facet2.testFunction5()).to.be.revertedWith(
            'TestFacet2.testFunction5'
        )
        await expect(facet2.testFunction6()).to.be.revertedWith(
            'TestFacet2.testFunction6'
        )
        await expect(facet2.testFunction7()).to.be.revertedWith(
            'TestFacet2.testFunction7'
        )
        await expect(facet2.testFunction8()).to.be.revertedWith(
            'TestFacet2.testFunction8'
        )*/
    })
})
