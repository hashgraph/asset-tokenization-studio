import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type BusinessLogicResolver,
    type DiamondFacet,
    type AccessControl,
    DiamondCutFacet,
    DiamondLoupeFacet,
} from '../../../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { assertObject } from '../../assert'
import { _DEFAULT_ADMIN_ROLE } from '../../../scripts/constants'

describe('Diamond Tests', () => {
    const UNDECLARED_FACET_KEY =
        '0x28b41992d7b956a53cbf1da765b654ceca55ce7551992ff46ee9b9178dee383a'

    let businessLogicResolver: BusinessLogicResolver
    let diamondFacet: DiamondFacet
    let diamondLoupeFacet: DiamondLoupeFacet
    let diamondCutFacet: DiamondCutFacet
    let accessControlFacet: AccessControl
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress

    let account_A: string
    let account_B: string

    async function deployContracts() {
        businessLogicResolver = await (
            await ethers.getContractFactory('BusinessLogicResolver')
        ).deploy()

        businessLogicResolver = businessLogicResolver.connect(signer_A)

        await businessLogicResolver.initialize_BusinessLogicResolver()

        diamondFacet = await (
            await ethers.getContractFactory('DiamondFacet')
        ).deploy()

        diamondLoupeFacet = await (
            await ethers.getContractFactory('DiamondLoupeFacet')
        ).deploy()

        diamondCutFacet = await (
            await ethers.getContractFactory('DiamondCutFacet')
        ).deploy()

        accessControlFacet = await (
            await ethers.getContractFactory('AccessControl')
        ).deploy()

        await businessLogicResolver.registerBusinessLogics([
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
        ])
    }

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address

        //await loadFixture(deployContracts)
        await deployContracts()
    })

    it('GIVEN deployed facets WHEN deploy a new diamond without DiamondFacet THEN DiamondFacetsNotFound', async () => {
        await expect(
            (
                await ethers.getContractFactory('Diamond')
            ).deploy(
                businessLogicResolver.address,
                [await accessControlFacet.getStaticResolverKey()],
                []
            )
        ).to.be.revertedWithCustomError(
            diamondCutFacet,
            'DiamondFacetsNotFound'
        )
    })

    it('GIVEN deployed facets WHEN deploy a new diamond without DiamondFacet THEN DiamondFacetsNotFound', async () => {
        await expect(
            (
                await ethers.getContractFactory('Diamond')
            ).deploy(
                businessLogicResolver.address,
                [await diamondCutFacet.getStaticResolverKey()],
                []
            )
        ).to.be.revertedWithCustomError(
            diamondCutFacet,
            'DiamondFacetsNotFound'
        )
    })

    it('GIVEN deployed facets WHEN deploy a new diamond with undeclared facet THEN DiamondFacetsNotFoundInRegistry', async () => {
        await expect(
            (
                await ethers.getContractFactory('Diamond')
            ).deploy(
                businessLogicResolver.address,
                [
                    await diamondFacet.getStaticResolverKey(),
                    UNDECLARED_FACET_KEY,
                ],
                []
            )
        ).to.be.revertedWithCustomError(
            diamondCutFacet,
            'DiamondFacetNotFoundInRegistry'
        )
    })

    it('GIVEN deployed facets WHEN deploy a new diamond without correct Key THEN InvalidBusinessLogicKey', async () => {
        await businessLogicResolver.registerBusinessLogics([
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: UNDECLARED_FACET_KEY,
                businessLogicAddress: diamondCutFacet.address,
            },
        ])

        await expect(
            (
                await ethers.getContractFactory('Diamond')
            ).deploy(
                businessLogicResolver.address,
                [
                    await diamondFacet.getStaticResolverKey(),
                    UNDECLARED_FACET_KEY,
                ],
                []
            )
        ).to.be.revertedWithCustomError(
            diamondCutFacet,
            'InvalidBusinessLogicKey'
        )
    })

    it('GIVEN deployed facets WHEN deploy a new diamond with correct keys THEN a new diamond proxy was deployed', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey:
                    await accessControlFacet.getStaticResolverKey(),
                businessLogicAddress: accessControlFacet.address,
            },
        ]

        await businessLogicResolver.registerBusinessLogics(
            businessLogicsRegistryDatas
        )

        const diamond = await (
            await ethers.getContractFactory('Diamond')
        ).deploy(
            businessLogicResolver.address,
            [
                businessLogicsRegistryDatas[0].businessLogicKey,
                businessLogicsRegistryDatas[1].businessLogicKey,
            ],
            []
        )
        const diamondLoupe = await ethers.getContractAt(
            'DiamondLoupeFacet',
            diamond.address
        )
        const EXPECTED_FACETS = [
            {
                facetKey: businessLogicsRegistryDatas[0].businessLogicKey,
                facetAddress:
                    businessLogicsRegistryDatas[0].businessLogicAddress,
                functionSelectors:
                    await diamondFacet.getStaticFunctionSelectors(),
                interfaceIds: await diamondFacet.getStaticInterfaceIds(),
            },
            {
                facetKey: businessLogicsRegistryDatas[1].businessLogicKey,
                facetAddress:
                    businessLogicsRegistryDatas[1].businessLogicAddress,
                functionSelectors:
                    await accessControlFacet.getStaticFunctionSelectors(),
                interfaceIds: await accessControlFacet.getStaticInterfaceIds(),
            },
        ]

        assertObject(await diamondLoupe.getFacets(), EXPECTED_FACETS)
        expect(
            await diamondLoupe.getFacetFunctionSelectors(
                EXPECTED_FACETS[1].facetKey
            )
        ).to.be.deep.equal(EXPECTED_FACETS[1].functionSelectors)
        expect(await diamondLoupe.getFacetKeys()).to.be.deep.equal([
            EXPECTED_FACETS[0].facetKey,
            EXPECTED_FACETS[1].facetKey,
        ])
        expect(await diamondLoupe.getFacetAddresses()).to.be.deep.equal([
            EXPECTED_FACETS[0].facetAddress,
            EXPECTED_FACETS[1].facetAddress,
        ])
        expect(
            await diamondLoupe.getFacetKeyBySelector(
                EXPECTED_FACETS[0].functionSelectors[0]
            )
        ).to.be.deep.equal(EXPECTED_FACETS[0].facetKey)
        expect(
            await diamondLoupe.getFacetKeyBySelector(
                EXPECTED_FACETS[1].functionSelectors[1]
            )
        ).to.be.deep.equal(EXPECTED_FACETS[1].facetKey)
        assertObject(
            await diamondLoupe.getFacet(EXPECTED_FACETS[0].facetKey),
            EXPECTED_FACETS[0]
        )
        assertObject(
            await diamondLoupe.getFacet(EXPECTED_FACETS[1].facetKey),
            EXPECTED_FACETS[1]
        )
        expect(
            await diamondLoupe.getFacetAddress(
                EXPECTED_FACETS[1].functionSelectors[2]
            )
        ).to.be.deep.equal(EXPECTED_FACETS[1].facetAddress)
    })

    it('GIVEN deployed facets and diamond deployed WHEN registerFacets with non granted role THEN AccountHasNoRole', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
        ]
        await businessLogicResolver.registerBusinessLogics(
            businessLogicsRegistryDatas
        )
        const businessLogicKeys = [
            businessLogicsRegistryDatas[0].businessLogicKey,
        ]
        const diamond = await (
            await ethers.getContractFactory('Diamond')
        ).deploy(businessLogicResolver.address, businessLogicKeys, [
            { role: _DEFAULT_ADMIN_ROLE, members: [account_A] },
        ])

        let diamondCut = await ethers.getContractAt(
            'DiamondCutFacet',
            diamond.address
        )

        diamondCut = diamondCut.connect(signer_B)

        await expect(diamondCut.registerFacets(businessLogicKeys))
            .to.be.revertedWithCustomError(
                accessControlFacet,
                'AccountHasNoRole'
            )
            .withArgs(account_B, _DEFAULT_ADMIN_ROLE)
    })

    it('GIVEN deployed facets WHEN deploy a new diamond and registerFacets THEN FacetsRegistered event was emitted', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await diamondCutFacet.getStaticResolverKey(),
                businessLogicAddress: diamondCutFacet.address,
            },
            {
                businessLogicKey:
                    await diamondLoupeFacet.getStaticResolverKey(),
                businessLogicAddress: diamondLoupeFacet.address,
            },
            {
                businessLogicKey:
                    await accessControlFacet.getStaticResolverKey(),
                businessLogicAddress: accessControlFacet.address,
            },
        ]
        await businessLogicResolver.registerBusinessLogics(
            businessLogicsRegistryDatas
        )
        const businessLogicKeys = [
            businessLogicsRegistryDatas[1].businessLogicKey,
            businessLogicsRegistryDatas[2].businessLogicKey,
        ]
        const diamond = await (
            await ethers.getContractFactory('Diamond')
        ).deploy(businessLogicResolver.address, businessLogicKeys, [
            { role: _DEFAULT_ADMIN_ROLE, members: [account_A] },
        ])

        const diamondCut = await ethers.getContractAt(
            'DiamondCutFacet',
            diamond.address
        )
        businessLogicKeys.push(businessLogicsRegistryDatas[3].businessLogicKey)
        expect(await diamondCut.registerFacets(businessLogicKeys))
            .to.emit(diamondCut, 'FacetsRegistered')
            .withArgs(businessLogicKeys)

        const diamondLoupe = await ethers.getContractAt(
            'DiamondLoupeFacet',
            diamond.address
        )
        const EXPECTED_FACETS = [
            {
                facetKey: businessLogicsRegistryDatas[1].businessLogicKey,
                facetAddress:
                    businessLogicsRegistryDatas[1].businessLogicAddress,
                functionSelectors:
                    await diamondCutFacet.getStaticFunctionSelectors(),
                interfaceIds: await diamondCutFacet.getStaticInterfaceIds(),
            },
            {
                facetKey: businessLogicsRegistryDatas[2].businessLogicKey,
                facetAddress:
                    businessLogicsRegistryDatas[2].businessLogicAddress,
                functionSelectors:
                    await diamondLoupeFacet.getStaticFunctionSelectors(),
                interfaceIds: await diamondLoupeFacet.getStaticInterfaceIds(),
            },
            {
                facetKey: businessLogicsRegistryDatas[3].businessLogicKey,
                facetAddress:
                    businessLogicsRegistryDatas[3].businessLogicAddress,
                functionSelectors:
                    await accessControlFacet.getStaticFunctionSelectors(),
                interfaceIds: await accessControlFacet.getStaticInterfaceIds(),
            },
        ]
        assertObject(await diamondLoupe.getFacets(), EXPECTED_FACETS)
        expect(
            await diamondLoupe.getFacetFunctionSelectors(
                EXPECTED_FACETS[0].facetKey
            )
        ).to.be.deep.equal(EXPECTED_FACETS[0].functionSelectors)
        expect(
            await diamondLoupe.getFacetFunctionSelectors(
                EXPECTED_FACETS[1].facetKey
            )
        ).to.be.deep.equal(EXPECTED_FACETS[1].functionSelectors)
        expect(
            await diamondLoupe.getFacetFunctionSelectors(
                EXPECTED_FACETS[2].facetKey
            )
        ).to.be.deep.equal(EXPECTED_FACETS[2].functionSelectors)
        expect(await diamondLoupe.getFacetKeys()).to.be.deep.equal([
            EXPECTED_FACETS[0].facetKey,
            EXPECTED_FACETS[1].facetKey,
            EXPECTED_FACETS[2].facetKey,
        ])
        expect(await diamondLoupe.getFacetAddresses()).to.be.deep.equal([
            EXPECTED_FACETS[0].facetAddress,
            EXPECTED_FACETS[1].facetAddress,
            EXPECTED_FACETS[2].facetAddress,
        ])
        expect(
            await diamondLoupe.getFacetKeyBySelector(
                EXPECTED_FACETS[0].functionSelectors[0]
            )
        ).to.be.deep.equal(EXPECTED_FACETS[0].facetKey)
        expect(
            await diamondLoupe.getFacetKeyBySelector(
                EXPECTED_FACETS[1].functionSelectors[1]
            )
        ).to.be.deep.equal(EXPECTED_FACETS[1].facetKey)
        expect(
            await diamondLoupe.getFacetKeyBySelector(
                EXPECTED_FACETS[2].functionSelectors[2]
            )
        ).to.be.deep.equal(EXPECTED_FACETS[2].facetKey)
        assertObject(
            await diamondLoupe.getFacet(EXPECTED_FACETS[0].facetKey),
            EXPECTED_FACETS[0]
        )
        assertObject(
            await diamondLoupe.getFacet(EXPECTED_FACETS[1].facetKey),
            EXPECTED_FACETS[1]
        )
        assertObject(
            await diamondLoupe.getFacet(EXPECTED_FACETS[2].facetKey),
            EXPECTED_FACETS[2]
        )
        expect(
            await diamondLoupe.getFacetAddress(
                EXPECTED_FACETS[1].functionSelectors[2]
            )
        ).to.be.deep.equal(EXPECTED_FACETS[1].facetAddress)
        expect(
            await diamondLoupe.getFacetAddress(
                EXPECTED_FACETS[2].functionSelectors[2]
            )
        ).to.be.deep.equal(EXPECTED_FACETS[2].facetAddress)
        expect(
            await diamondLoupe.supportsInterface(
                EXPECTED_FACETS[1].functionSelectors[2]
            )
        ).to.be.true
        expect(
            await diamondLoupe.supportsInterface(
                EXPECTED_FACETS[2].interfaceIds[0]
            )
        ).to.be.true
    })

    it('GIVEN deployed facets, deploy a diamond and registerFacet WHEN try to use a non exposed signature THEN raise FunctionNotFound and it is not recognized by supportsInterface', async () => {
        const businessLogicsRegistryDatas = [
            {
                businessLogicKey: await diamondFacet.getStaticResolverKey(),
                businessLogicAddress: diamondFacet.address,
            },
            {
                businessLogicKey: await diamondCutFacet.getStaticResolverKey(),
                businessLogicAddress: diamondCutFacet.address,
            },
            {
                businessLogicKey:
                    await diamondLoupeFacet.getStaticResolverKey(),
                businessLogicAddress: diamondLoupeFacet.address,
            },
        ]
        await businessLogicResolver.registerBusinessLogics(
            businessLogicsRegistryDatas
        )
        const businessLogicKeys = [
            businessLogicsRegistryDatas[1].businessLogicKey,
            businessLogicsRegistryDatas[2].businessLogicKey,
        ]
        const diamond = await (
            await ethers.getContractFactory('Diamond')
        ).deploy(businessLogicResolver.address, businessLogicKeys, [
            { role: _DEFAULT_ADMIN_ROLE, members: [account_A] },
        ])

        const accessControl = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )
        const diamondCut = await ethers.getContractAt(
            'DiamondCutFacet',
            diamond.address
        )
        const diamondLoupe = await ethers.getContractAt(
            'DiamondLoupeFacet',
            diamond.address
        )

        const GRANT_ROLE_SIGNATURE = '0x2f2ff15d'
        await expect(accessControl.grantRole(_DEFAULT_ADMIN_ROLE, account_A))
            .to.be.revertedWithCustomError(diamondCut, 'FunctionNotFound')
            .withArgs(GRANT_ROLE_SIGNATURE)
        expect(await diamondLoupe.supportsInterface(GRANT_ROLE_SIGNATURE)).to.be
            .false
    })
})
