import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Cap,
    AccessControl,
    Pause,
    ERC1410ScheduledSnapshot,
} from '../../../../typechain-types'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import {
    _CAP_ROLE,
    _ISSUER_ROLE,
    _PAUSER_ROLE,
} from '../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'

const maxSupply = 1
const maxSupplyByPartition = 1
const _PARTITION_ID_1 =
    '0x0000000000000000000000000000000000000000000000000000000000000001'

describe('CAP Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string

    let capFacet: Cap
    let accessControlFacet: AccessControl
    let pauseFacet: Pause
    let erc1410Facet: ERC1410ScheduledSnapshot

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B, signer_C] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address
        account_C = signer_C.address

        await deployEnvironment()

        const rbacPause: Rbac = {
            role: _PAUSER_ROLE,
            members: [account_B],
        }
        const init_rbacs: Rbac[] = [rbacPause]

        diamond = await deployEquityFromFactory(
            account_A,
            false,
            true,
            false,
            'TEST_AccessControl',
            'TAC',
            6,
            'ABCDEF123456',
            false,
            false,
            false,
            true,
            true,
            true,
            false,
            1,
            '0x345678',
            0,
            100,
            RegulationType.REG_D,
            RegulationSubType.REG_D_506_B,
            true,
            'ES,FR,CH',
            'nothing',
            init_rbacs
        )

        capFacet = await ethers.getContractAt('Cap', diamond.address)
        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )
        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
        erc1410Facet = await ethers.getContractAt(
            'ERC1410ScheduledSnapshot',
            diamond.address
        )
    })

    it('GIVEN an initialized contract WHEN trying to initialize it again THEN transaction fails with AlreadyInitialized', async () => {
        await expect(capFacet.initialize_Cap(5, [])).to.be.rejectedWith(
            'AlreadyInitialized'
        )
    })

    describe('Paused', () => {
        beforeEach(async () => {
            // Pausing the token
            pauseFacet = pauseFacet.connect(signer_B)
            await pauseFacet.pause()
        })

        it('GIVEN a paused Token WHEN setMaxSupply THEN transaction fails with TokenIsPaused', async () => {
            // Using account C (with role)
            capFacet = capFacet.connect(signer_C)

            // transfer with data fails
            await expect(capFacet.setMaxSupply(maxSupply)).to.be.rejectedWith(
                'TokenIsPaused'
            )
        })

        it('GIVEN a paused Token WHEN setMaxSupplyByPartition THEN transaction fails with TokenIsPaused', async () => {
            // Using account C (with role)
            capFacet = capFacet.connect(signer_C)

            // transfer from with data fails
            await expect(
                capFacet.setMaxSupplyByPartition(
                    _PARTITION_ID_1,
                    maxSupplyByPartition
                )
            ).to.be.rejectedWith('TokenIsPaused')
        })
    })

    describe('AccessControl', () => {
        it('GIVEN an account without cap role WHEN setMaxSupply THEN transaction fails with AccountHasNoRole', async () => {
            // Using account C (non role)
            capFacet = capFacet.connect(signer_C)

            // add to list fails
            await expect(capFacet.setMaxSupply(maxSupply)).to.be.rejectedWith(
                'AccountHasNoRole'
            )
        })

        it('GIVEN an account without cap role WHEN setMaxSupplyByPartition THEN transaction fails with AccountHasNoRole', async () => {
            // Using account C (non role)
            capFacet = capFacet.connect(signer_C)

            // add to list fails
            await expect(
                capFacet.setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply)
            ).to.be.rejectedWith('AccountHasNoRole')
        })
    })

    describe('New Max Supply Too low', () => {
        it('GIVEN a token WHEN setMaxSupply a value that is less than the current total supply THEN transaction fails with NewMaxSupplyTooLow', async () => {
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_C)
            await accessControlFacet.grantRole(_CAP_ROLE, account_C)

            erc1410Facet = erc1410Facet.connect(signer_C)
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_A,
                2 * maxSupply,
                '0x'
            )

            // Using account C (non role)
            capFacet = capFacet.connect(signer_C)

            // add to list fails
            await expect(
                capFacet.setMaxSupply(maxSupply)
            ).to.eventually.be.rejectedWith(Error)
        })

        it('GIVEN a token WHEN setMaxSupplyByPartition a value that is less than the current total supply THEN transaction fails with NewMaxSupplyTooLow', async () => {
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_ISSUER_ROLE, account_C)
            await accessControlFacet.grantRole(_CAP_ROLE, account_C)

            erc1410Facet = erc1410Facet.connect(signer_C)
            await erc1410Facet.issueByPartition(
                _PARTITION_ID_1,
                account_A,
                2 * maxSupply,
                '0x'
            )

            // Using account C (non role)
            capFacet = capFacet.connect(signer_C)

            // add to list fails
            await expect(
                capFacet.setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply)
            ).to.eventually.be.rejectedWith(Error)
        })
    })

    describe('New Max Supply OK', () => {
        it('GIVEN a token WHEN setMaxSupply THEN transaction succeeds', async () => {
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_CAP_ROLE, account_C)

            capFacet = capFacet.connect(signer_C)

            await expect(capFacet.setMaxSupply(maxSupply))
                .to.emit(capFacet, 'MaxSupplySet')
                .withArgs(account_C, maxSupply, 0)

            const currentMaxSupply = await capFacet.getMaxSupply()

            expect(currentMaxSupply).to.equal(maxSupply)
        })

        it('GIVEN a token WHEN setMaxSupplyByPartition THEN transaction succeeds', async () => {
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(_CAP_ROLE, account_C)

            capFacet = capFacet.connect(signer_C)

            await expect(
                capFacet.setMaxSupplyByPartition(_PARTITION_ID_1, maxSupply)
            )
                .to.emit(capFacet, 'MaxSupplyByPartitionSet')
                .withArgs(account_C, _PARTITION_ID_1, maxSupply, 0)

            const currentMaxSupply = await capFacet.getMaxSupplyByPartition(
                _PARTITION_ID_1
            )

            expect(currentMaxSupply).to.equal(maxSupply)
        })
    })
})
