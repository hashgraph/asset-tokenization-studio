import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Snapshots,
    type Pause,
    type ERC1410ScheduledSnapshot,
    type AccessControl,
} from '../../../../typechain-types'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import {
    _SNAPSHOT_ROLE,
    _PAUSER_ROLE,
    _ISSUER_ROLE,
} from '../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { grantRoleAndPauseToken } from '../../../../scripts/testCommon'

const amount = 1
const balanceOf_C_Original = 2 * amount
const _PARTITION_ID_1 =
    '0x0000000000000000000000000000000000000000000000000000000000000001'
const _PARTITION_ID_2 =
    '0x0000000000000000000000000000000000000000000000000000000000000002'
describe('Snapshots Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string

    let erc1410Facet: ERC1410ScheduledSnapshot
    let snapshotFacet: Snapshots
    let accessControlFacet: AccessControl
    let pauseFacet: Pause

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
            true,
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

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        erc1410Facet = await ethers.getContractAt(
            'ERC1410ScheduledSnapshot',
            diamond.address
        )

        snapshotFacet = await ethers.getContractAt('Snapshots', diamond.address)

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    it('GIVEN an account without snapshot role WHEN takeSnapshot THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non role)
        snapshotFacet = snapshotFacet.connect(signer_C)

        // snapshot fails
        await expect(snapshotFacet.takeSnapshot()).to.be.rejectedWith(
            'AccountHasNoRole'
        )
    })

    it('GIVEN a paused Token WHEN takeSnapshot THEN transaction fails with TokenIsPaused', async () => {
        // Granting Role to account C and Pause
        await grantRoleAndPauseToken(
            accessControlFacet,
            pauseFacet,
            _SNAPSHOT_ROLE,
            signer_A,
            signer_B,
            account_C
        )

        // Using account C (with role)
        snapshotFacet = snapshotFacet.connect(signer_C)

        // snapshot fails
        await expect(snapshotFacet.takeSnapshot()).to.be.rejectedWith(
            'TokenIsPaused'
        )
    })

    it('GIVEN no snapshot WHEN reading snapshot values THEN transaction fails', async () => {
        // check snapshot
        await expect(
            snapshotFacet.balanceOfAtSnapshot(1, account_A)
        ).to.be.rejectedWith('SnapshotIdDoesNotExists')
        await expect(
            snapshotFacet.balanceOfAtSnapshot(0, account_A)
        ).to.be.rejectedWith('SnapshotIdNull')
        await expect(snapshotFacet.totalSupplyAtSnapshot(1)).to.be.rejectedWith(
            'SnapshotIdDoesNotExists'
        )
        await expect(snapshotFacet.totalSupplyAtSnapshot(0)).to.be.rejectedWith(
            'SnapshotIdNull'
        )
        await expect(
            snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_1,
                1,
                account_A
            )
        ).to.be.rejectedWith('SnapshotIdDoesNotExists')
        await expect(
            snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_1,
                0,
                account_A
            )
        ).to.be.rejectedWith('SnapshotIdNull')
        await expect(
            snapshotFacet.partitionsOfAtSnapshot(1, account_A)
        ).to.be.rejectedWith('SnapshotIdDoesNotExists')
        await expect(
            snapshotFacet.partitionsOfAtSnapshot(0, account_A)
        ).to.be.rejectedWith('SnapshotIdNull')
    })

    it('GIVEN an account with snapshot role WHEN takeSnapshot THEN transaction succeeds', async () => {
        // Granting Role to account C
        accessControlFacet = accessControlFacet.connect(signer_A)
        await accessControlFacet.grantRole(_SNAPSHOT_ROLE, account_C)
        await accessControlFacet.grantRole(_ISSUER_ROLE, account_A)
        // Using account C (with role)
        snapshotFacet = snapshotFacet.connect(signer_C)
        erc1410Facet = erc1410Facet.connect(signer_A)

        await erc1410Facet.issueByPartition(
            _PARTITION_ID_1,
            account_C,
            balanceOf_C_Original,
            '0x'
        )

        // snapshot
        await expect(snapshotFacet.takeSnapshot())
            .to.emit(snapshotFacet, 'SnapshotTaken')
            .withArgs(account_C, 1)

        await erc1410Facet.issueByPartition(
            _PARTITION_ID_1,
            account_A,
            amount,
            '0x'
        )
        await erc1410Facet.issueByPartition(
            _PARTITION_ID_2,
            account_A,
            amount,
            '0x'
        )
        erc1410Facet = erc1410Facet.connect(signer_C)
        await erc1410Facet.transferByPartition(
            _PARTITION_ID_1,
            account_A,
            amount,
            '0x'
        )
        await snapshotFacet.takeSnapshot()

        // check snapshot
        const snapshot_Balance_Of_A_1 = await snapshotFacet.balanceOfAtSnapshot(
            1,
            account_A
        )
        const snapshot_Balance_Of_C_1 = await snapshotFacet.balanceOfAtSnapshot(
            1,
            account_C
        )
        const snapshot_Balance_Of_A_1_Partition_1 =
            await snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_1,
                1,
                account_A
            )
        const snapshot_Balance_Of_C_1_Partition_1 =
            await snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_1,
                1,
                account_C
            )
        const snapshot_Balance_Of_A_1_Partition_2 =
            await snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_2,
                1,
                account_A
            )
        const snapshot_Balance_Of_C_1_Partition_2 =
            await snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_2,
                1,
                account_C
            )
        const snapshot_Partitions_Of_A_1 =
            await snapshotFacet.partitionsOfAtSnapshot(1, account_A)
        const snapshot_Partitions_Of_C_1 =
            await snapshotFacet.partitionsOfAtSnapshot(1, account_C)
        const snapshot_TotalSupply_1 =
            await snapshotFacet.totalSupplyAtSnapshot(1)

        const snapshot_Balance_Of_A_2 = await snapshotFacet.balanceOfAtSnapshot(
            2,
            account_A
        )
        const snapshot_Balance_Of_C_2 = await snapshotFacet.balanceOfAtSnapshot(
            2,
            account_C
        )
        const snapshot_Balance_Of_A_2_Partition_1 =
            await snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_1,
                2,
                account_A
            )
        const snapshot_Balance_Of_C_2_Partition_1 =
            await snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_1,
                2,
                account_C
            )
        const snapshot_Balance_Of_A_2_Partition_2 =
            await snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_2,
                2,
                account_A
            )
        const snapshot_Balance_Of_C_2_Partition_2 =
            await snapshotFacet.balanceOfAtSnapshotByPartition(
                _PARTITION_ID_2,
                2,
                account_C
            )
        const snapshot_Partitions_Of_A_2 =
            await snapshotFacet.partitionsOfAtSnapshot(2, account_A)
        const snapshot_Partitions_Of_C_2 =
            await snapshotFacet.partitionsOfAtSnapshot(2, account_C)
        const snapshot_TotalSupply_2 =
            await snapshotFacet.totalSupplyAtSnapshot(2)

        const current_Balance_Of_A = await erc1410Facet.balanceOf(account_A)
        const current_Balance_Of_C = await erc1410Facet.balanceOf(account_C)
        const current_TotalSupply = await erc1410Facet.totalSupply()

        expect(snapshot_Balance_Of_A_1).to.equal(0)
        expect(snapshot_Balance_Of_A_1_Partition_1).to.equal(0)
        expect(snapshot_Balance_Of_A_1_Partition_2).to.equal(0)
        expect(snapshot_Partitions_Of_A_1.length).to.equal(0)

        expect(snapshot_Balance_Of_C_1).to.equal(balanceOf_C_Original)
        expect(snapshot_Balance_Of_C_1_Partition_1).to.equal(
            balanceOf_C_Original
        )
        expect(snapshot_Balance_Of_C_1_Partition_2).to.equal(0)
        expect(snapshot_Partitions_Of_C_1.length).to.equal(1)
        expect(snapshot_Partitions_Of_C_1[0]).to.equal(_PARTITION_ID_1)

        expect(snapshot_TotalSupply_1).to.equal(balanceOf_C_Original)

        expect(current_Balance_Of_A).to.equal(3 * amount)
        expect(snapshot_Balance_Of_A_2).to.equal(current_Balance_Of_A)
        expect(snapshot_Balance_Of_A_2_Partition_1).to.equal(2 * amount)
        expect(snapshot_Balance_Of_A_2_Partition_2).to.equal(amount)
        expect(snapshot_Partitions_Of_A_2.length).to.equal(2)
        expect(snapshot_Partitions_Of_A_2[0]).to.equal(_PARTITION_ID_1)
        expect(snapshot_Partitions_Of_A_2[1]).to.equal(_PARTITION_ID_2)

        expect(current_Balance_Of_C).to.equal(balanceOf_C_Original - amount)
        expect(snapshot_Balance_Of_C_2).to.equal(current_Balance_Of_C)
        expect(snapshot_Balance_Of_C_2_Partition_1).to.equal(
            current_Balance_Of_C
        )
        expect(snapshot_Balance_Of_C_2_Partition_2).to.equal(0)
        expect(snapshot_Partitions_Of_C_2.length).to.equal(1)
        expect(snapshot_Partitions_Of_C_2[0]).to.equal(_PARTITION_ID_1)

        expect(current_TotalSupply).to.equal(balanceOf_C_Original + 2 * amount)
        expect(snapshot_TotalSupply_2).to.equal(current_TotalSupply)
    })
})
