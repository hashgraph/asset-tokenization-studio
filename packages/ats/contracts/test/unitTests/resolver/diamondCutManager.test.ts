//import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    AccessControl,
    Pause,
    BusinessLogicResolver,
    DiamondCutManager,
    IDiamondCutManager,
    IDiamondLoupe,
} from '@typechain'
import { ATS_ROLES, BOND_CONFIG_ID, EQUITY_CONFIG_ID } from '@scripts'
import { deployAtsInfrastructureFixture } from '@test/fixtures'

describe('DiamondCutManager', () => {
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress

    let businessLogicResolver: BusinessLogicResolver
    let diamondCutManager: DiamondCutManager
    let accessControl: AccessControl
    let pause: Pause
    let equityFacetIdList: string[] = []
    let bondFacetIdList: string[] = []
    let equityFacetVersionList: number[] = []

    before(async () => {
        const infrastructure = await deployAtsInfrastructureFixture()

        businessLogicResolver = infrastructure.blr

        signer_A = infrastructure.deployer
        signer_B = infrastructure.user2

        accessControl = await ethers.getContractAt(
            'AccessControlFacet',
            businessLogicResolver.address,
            signer_A
        )
        await accessControl.grantRole(ATS_ROLES.PAUSER, signer_B.address)

        pause = await ethers.getContractAt(
            'Pause',
            businessLogicResolver.address,
            signer_A
        )

        diamondCutManager = await ethers.getContractAt(
            'DiamondCutManager',
            businessLogicResolver.address,
            signer_A
        )
        equityFacetIdList = Object.values(infrastructure.equityFacetKeys)
        bondFacetIdList = Object.values(infrastructure.bondFacetKeys)
        equityFacetVersionList = Array(equityFacetIdList.length).fill(1)
    })

    afterEach(async () => {
        const isPaused = await pause.isPaused()
        if (isPaused) {
            await pause.connect(signer_B).unpause()
        }
        // Clean up blacklisted selectors for EQUITY_CONFIG_ID
        try {
            // Try to remove the pause() selector that might have been blacklisted
            const pauseSelector = '0x8456cb59'
            await businessLogicResolver.removeSelectorsFromBlacklist(
                EQUITY_CONFIG_ID,
                [pauseSelector]
            )
        } catch (error) {
            // Ignore errors if selector wasn't blacklisted - contract may be in different state
        }
    })

    async function validateConfiguration(configId: string) {
        for (let configVersion = 1; configVersion <= 1; configVersion++) {
            await validateFacets(configId, configVersion)
        }
    }

    async function validateFacets(configId: string, configVersion: number) {
        const facetsLength = (
            await diamondCutManager.getFacetsLengthByConfigurationIdAndVersion(
                configId,
                configVersion
            )
        ).toNumber()

        const facets =
            await diamondCutManager.getFacetsByConfigurationIdAndVersion(
                configId,
                configVersion,
                0,
                facetsLength
            )

        const facetIds: string[] = []
        const facetAddresses: string[] = []

        for (const facet of facets) {
            facetIds.push(facet.id)
            facetAddresses.push(facet.addr)
            await validateFacetDetails(configId, configVersion, facet)
        }

        await validateFacetIdsAndAddresses(
            configId,
            configVersion,
            facetsLength,
            facetIds,
            facetAddresses
        )
    }

    async function validateFacetDetails(
        configId: string,
        configVersion: number,
        facet: IDiamondLoupe.FacetStructOutput
    ) {
        const selectorsLength = (
            await diamondCutManager.getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
                configId,
                configVersion,
                facet.id
            )
        ).toNumber()

        const selectors =
            await diamondCutManager.getFacetSelectorsByConfigurationIdVersionAndFacetId(
                configId,
                configVersion,
                facet.id,
                0,
                selectorsLength
            )

        const address =
            await diamondCutManager.getFacetAddressByConfigurationIdVersionAndFacetId(
                configId,
                configVersion,
                facet.id
            )

        const facet_2 =
            await diamondCutManager.getFacetByConfigurationIdVersionAndFacetId(
                configId,
                configVersion,
                facet.id
            )

        expect(facet.addr).to.exist
        expect(facet.addr).to.not.be.empty
        expect(facet.addr).to.equal(address)
        expect(facet.addr).to.not.equal(
            '0x0000000000000000000000000000000000000000'
        )
        expect(facet.selectors).to.exist
        expect(facet.selectors).to.not.be.empty
        expect(facet.selectors).to.have.members(selectors)

        expect(facet.interfaceIds).to.exist
        expect(facet.interfaceIds).to.not.be.empty
        expect(facet).to.deep.equal(facet_2)

        await validateSelectors(configId, configVersion, facet, selectorsLength)
        await validateInterfaces(configId, configVersion, facet)
    }

    async function validateSelectors(
        configId: string,
        configVersion: number,
        facet: IDiamondLoupe.FacetStructOutput,
        selectorsLength: number
    ) {
        /*
         * Problematic selectors:
         * - getStaticInterfaceIdsSelector ('0xb378cf37'):
         *     This selector is known to sometimes appear unexpectedly in facet selector arrays due to
         *     misconfiguration or incorrect facet registration. It should only be present for facets that
         *     implement the corresponding static interface method.
         * - getStaticResolverKeySelector ('0x1ef2fdc8'):
         *     Similar to the above, this selector should only be present for facets that implement the
         *     static resolver key method. Its unexpected presence may indicate a bug in facet setup.
         * - nullSelector ('0x00000000'):
         *     The null selector is used as a sentinel value and should never appear in the selectors array.
         *     Its presence typically indicates an array length mismatch or that the selectors array was
         *     not properly populated. The validation logic checks for this to catch such errors early.
         *
         * Expected behavior:
         * - Only valid selectors for the facet should be present in the selectors array.
         * - The null selector should never be present.
         * - The static selectors should only be present for facets that implement the corresponding methods.
         */
        const getStaticInterfaceIdsSelector = '0xb378cf37'
        const getStaticResolverKeySelector = '0x1ef2fdc8'
        const nullSelector = '0x00000000'

        for (
            let selectorIndex = 0;
            selectorIndex < selectorsLength;
            selectorIndex++
        ) {
            const selectorId = facet.selectors[selectorIndex]

            // Validate against null selector (indicates array length mismatch)
            expect(selectorId).to.not.equal(
                nullSelector,
                `Null selector (0x00000000) found at index ${selectorIndex} in facet ${facet.id} (${facet.addr}). ` +
                    `This indicates a length mismatch in the getStaticFunctionSelectors() method. ` +
                    `The array size is larger than the number of selectors being populated.`
            )

            // Validate against getStaticInterfaceIds selector
            expect(selectorId).to.not.equal(
                getStaticInterfaceIdsSelector,
                `getStaticInterfaceIds() selector (${getStaticInterfaceIdsSelector}) should NOT be registered in getStaticFunctionSelectors(). ` +
                    `Found in facet ${facet.id} (${facet.addr}). ` +
                    `This function is part of the IStaticFunctionSelectors interface but should not be exposed as a callable function.`
            )

            // Validate against getStaticResolverKey selector
            expect(selectorId).to.not.equal(
                getStaticResolverKeySelector,
                `getStaticResolverKey() selector (${getStaticResolverKeySelector}) should NOT be registered in getStaticFunctionSelectors(). ` +
                    `Found in facet ${facet.id} (${facet.addr}). ` +
                    `This function is part of the IStaticFunctionSelectors interface but should not be exposed as a callable function.`
            )

            const id =
                await diamondCutManager.getFacetIdByConfigurationIdVersionAndSelector(
                    configId,
                    configVersion,
                    selectorId
                )

            const facetAddressForSelector =
                await diamondCutManager.resolveResolverProxyCall(
                    configId,
                    configVersion,
                    selectorId
                )

            expect(facetAddressForSelector).to.not.equal(
                '0x0000000000000000000000000000000000000000'
            )
            expect(id).to.equal(facet.id)
            expect(facetAddressForSelector).to.equal(facet.addr)
        }
    }

    async function validateInterfaces(
        configId: string,
        configVersion: number,
        facet: IDiamondLoupe.FacetStructOutput
    ) {
        for (const interfaceId of facet.interfaceIds) {
            const interfaceExists =
                await diamondCutManager.resolveSupportsInterface(
                    configId,
                    configVersion,
                    interfaceId
                )
            expect(interfaceExists).to.be.true
        }
    }

    async function validateFacetIdsAndAddresses(
        configId: string,
        configVersion: number,
        facetsLength: number,
        facetIds: string[],
        facetAddresses: string[]
    ) {
        const facetIds_2 =
            await diamondCutManager.getFacetIdsByConfigurationIdAndVersion(
                configId,
                configVersion,
                0,
                facetsLength
            )

        const facetAddresses_2 =
            await diamondCutManager.getFacetAddressesByConfigurationIdAndVersion(
                configId,
                configVersion,
                0,
                facetsLength
            )

        expect(facetIds).to.have.members(facetIds_2)
        expect(facetAddresses).to.have.members(facetAddresses_2)

        const expectedFacetIdList =
            configId === EQUITY_CONFIG_ID
                ? equityFacetIdList
                : configId === BOND_CONFIG_ID
                  ? bondFacetIdList
                  : null

        if (!expectedFacetIdList) {
            expect.fail('Unknown configId')
        }

        expect(facetsLength).to.equal(expectedFacetIdList.length)
        expect(facetIds).to.have.members(expectedFacetIdList)
    }

    it('GIVEN a resolver WHEN reading configuration information THEN everything matches', async () => {
        const configLength = (
            await diamondCutManager.getConfigurationsLength()
        ).toNumber()
        expect(configLength).to.equal(2)

        const configIds = await diamondCutManager.getConfigurations(
            0,
            configLength
        )
        expect(configIds).to.have.members([EQUITY_CONFIG_ID, BOND_CONFIG_ID])

        for (const configId of configIds) {
            const configLatestVersion = (
                await diamondCutManager.getLatestVersionByConfiguration(
                    configId
                )
            ).toNumber()
            expect(configLatestVersion).to.equal(1)

            await validateConfiguration(configId)
        }
    })

    it('GIVEN a resolver WHEN resolving calls THEN success', async () => {
        const facets =
            await diamondCutManager.getFacetsByConfigurationIdAndVersion(
                EQUITY_CONFIG_ID,
                1,
                0,
                equityFacetIdList.length
            )

        expect(facets.length).to.be.greaterThan(0)

        const configVersionDoesNotExist =
            await diamondCutManager.isResolverProxyConfigurationRegistered(
                EQUITY_CONFIG_ID,
                2
            )
        expect(configVersionDoesNotExist).to.be.false
        await expect(
            diamondCutManager.checkResolverProxyConfigurationRegistered(
                EQUITY_CONFIG_ID,
                2
            )
        ).to.be.rejectedWith('ResolverProxyConfigurationNoRegistered')

        const configDoesNotExist =
            await diamondCutManager.isResolverProxyConfigurationRegistered(
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                1
            )
        expect(configDoesNotExist).to.equal(false)
        await expect(
            diamondCutManager.checkResolverProxyConfigurationRegistered(
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                1
            )
        ).to.be.rejectedWith('ResolverProxyConfigurationNoRegistered')

        const noFacetAddress = await diamondCutManager.resolveResolverProxyCall(
            EQUITY_CONFIG_ID,
            1,
            '0x00000001'
        )
        expect(noFacetAddress).to.equal(
            '0x0000000000000000000000000000000000000000'
        )

        const interfaceDoesnotExist =
            await diamondCutManager.resolveSupportsInterface(
                EQUITY_CONFIG_ID,
                1,
                '0x00000001'
            )
        expect(interfaceDoesnotExist).to.equal(false)
    })

    it('GIVEN a resolver WHEN adding a new configuration with configId at 0 THEN fails with DefaultValueForConfigurationIdNotPermitted', async () => {
        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        equityFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: equityFacetVersionList[index],
            })
        )

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createConfiguration(
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    facetConfigurations
                )
        ).to.be.rejectedWith('DefaultValueForConfigurationIdNotPermitted')
    })

    it('GIVEN a resolver and a non admin user WHEN adding a new configuration THEN fails with AccountHasNoRole', async () => {
        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        equityFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: equityFacetVersionList[index],
            })
        )

        await expect(
            diamondCutManager
                .connect(signer_B)
                .createConfiguration(EQUITY_CONFIG_ID, facetConfigurations)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a paused resolver WHEN adding a new configuration THEN fails with TokenIsPaused', async () => {
        await pause.connect(signer_B).pause()

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        equityFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: equityFacetVersionList[index],
            })
        )

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createConfiguration(EQUITY_CONFIG_ID, facetConfigurations)
        ).to.be.rejectedWith('TokenIsPaused')

        await pause.connect(signer_B).unpause()
    })

    it('GIVEN a resolver WHEN adding a new configuration with a non registered facet THEN fails with FacetIdNotRegistered', async () => {
        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            [
                {
                    id: '0x0000000000000000000000000000000000000000000000000000000000000000',
                    version: 1,
                },
            ]

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createConfiguration(EQUITY_CONFIG_ID, facetConfigurations)
        ).to.be.rejectedWith('FacetIdNotRegistered')
    })

    it('GIVEN a resolver WHEN adding a new configuration with a duplicated facet THEN fails with DuplicatedFacetInConfiguration', async () => {
        // Add a duplicated facet
        const facetsIds = [...equityFacetIdList, equityFacetIdList[0]]
        // Add a duplicated version
        const facetVersions = [
            ...equityFacetVersionList,
            equityFacetVersionList[0],
        ]

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        facetsIds.forEach((id, index) => {
            facetConfigurations.push({
                id,
                version: facetVersions[index],
            })
        })

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createConfiguration(EQUITY_CONFIG_ID, facetConfigurations)
        ).to.be.rejectedWith('DuplicatedFacetInConfiguration')
    })

    it('GIVEN a batch deploying WHEN run cancelBatchConfiguration THEN all the related information is removed', async () => {
        const batchInfrastructure = await deployAtsInfrastructureFixture(
            true,
            true
        )

        const batchBusinessLogicResolver = batchInfrastructure.blr

        const batchAccessControl = await ethers.getContractAt(
            'AccessControlFacet',
            batchBusinessLogicResolver.address,
            signer_A
        )
        await batchAccessControl.grantRole(ATS_ROLES.PAUSER, signer_B.address)

        const batchDiamondCutManager = await ethers.getContractAt(
            'DiamondCutManager',
            batchBusinessLogicResolver.address,
            signer_A
        )

        const configLength = (
            await batchDiamondCutManager.getConfigurationsLength()
        ).toNumber()
        expect(configLength).to.equal(0)

        const configIds = await batchDiamondCutManager.getConfigurations(
            0,
            configLength
        )
        expect(configIds).to.have.members([])

        // Temporarily replace the global diamondCutManager to reuse validation functions
        const originalDiamondCutManager = diamondCutManager
        diamondCutManager = batchDiamondCutManager

        for (const configId of [EQUITY_CONFIG_ID, BOND_CONFIG_ID]) {
            const configLatestVersion = (
                await batchDiamondCutManager.getLatestVersionByConfiguration(
                    configId
                )
            ).toNumber()
            expect(configLatestVersion).to.equal(0)

            // Reuse the existing validation functions
            await validateConfiguration(configId)

            // Run cancelBatchConfiguration
            await batchDiamondCutManager.cancelBatchConfiguration(configId)

            expect(
                await batchDiamondCutManager.getFacetsLengthByConfigurationIdAndVersion(
                    configId,
                    1
                )
            ).to.equal(0)
        }
        expect(await batchDiamondCutManager.getConfigurationsLength()).to.equal(
            0
        )

        // Restore the original diamondCutManager
        diamondCutManager = originalDiamondCutManager
    })

    it('GIVEN a resolver WHEN adding a new configuration with configId at 0 with createBatchConfiguration THEN fails with DefaultValueForConfigurationIdNotPermitted', async () => {
        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        equityFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: equityFacetVersionList[index],
            })
        )

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createBatchConfiguration(
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    facetConfigurations,
                    false
                )
        ).to.be.rejectedWith('DefaultValueForConfigurationIdNotPermitted')
    })

    it('GIVEN a resolver and a non admin user WHEN adding a new configuration with createBatchConfiguration THEN fails with AccountHasNoRole', async () => {
        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        equityFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: equityFacetVersionList[index],
            })
        )

        await expect(
            diamondCutManager
                .connect(signer_B)
                .createBatchConfiguration(
                    EQUITY_CONFIG_ID,
                    facetConfigurations,
                    false
                )
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a paused resolver WHEN adding a new configuration with createBatchConfiguration THEN fails with TokenIsPaused', async () => {
        await pause.connect(signer_B).pause()

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        equityFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: equityFacetVersionList[index],
            })
        )

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createBatchConfiguration(
                    EQUITY_CONFIG_ID,
                    facetConfigurations,
                    false
                )
        ).to.be.rejectedWith('TokenIsPaused')

        await pause.connect(signer_B).unpause()
    })

    it('GIVEN a resolver WHEN adding a new configuration with a non registered facet using createBatchConfiguration THEN fails with FacetIdNotRegistered', async () => {
        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            [
                {
                    id: '0x0000000000000000000000000000000000000000000000000000000000000000',
                    version: 1,
                },
            ]

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createBatchConfiguration(
                    EQUITY_CONFIG_ID,
                    facetConfigurations,
                    false
                )
        ).to.be.rejectedWith('FacetIdNotRegistered')
    })

    it('GIVEN a resolver WHEN adding a new configuration with a duplicated facet using createBatchConfiguration THEN fails with DuplicatedFacetInConfiguration', async () => {
        // Add a duplicated facet
        const facetsIds = [...equityFacetIdList, equityFacetIdList[0]]
        // Add a duplicated version
        const facetVersions = [
            ...equityFacetVersionList,
            equityFacetVersionList[0],
        ]

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        facetsIds.forEach((id, index) => {
            facetConfigurations.push({
                id,
                version: facetVersions[index],
            })
        })

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createBatchConfiguration(
                    EQUITY_CONFIG_ID,
                    facetConfigurations,
                    false
                )
        ).to.be.rejectedWith('DuplicatedFacetInConfiguration')
    })

    it('GIVEN a resolver WHEN a selector is blacklisted THEN transaction fails with SelectorBlacklisted', async () => {
        const blackListedSelectors = ['0x8456cb59'] // pause() selector

        await businessLogicResolver.addSelectorsToBlacklist(
            EQUITY_CONFIG_ID,
            blackListedSelectors
        )

        const facetConfigurations: IDiamondCutManager.FacetConfigurationStruct[] =
            []
        equityFacetIdList.forEach((id, index) =>
            facetConfigurations.push({
                id,
                version: equityFacetVersionList[index],
            })
        )

        await expect(
            diamondCutManager
                .connect(signer_A)
                .createConfiguration(EQUITY_CONFIG_ID, facetConfigurations)
        )
            .to.be.revertedWithCustomError(
                diamondCutManager,
                'SelectorBlacklisted'
            )
            .withArgs(blackListedSelectors[0])
    })
})
