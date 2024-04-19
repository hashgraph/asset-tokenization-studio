import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type AccessControl,
    type Pause,
} from '../../../../typechain-types'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import {
    _DEFAULT_ADMIN_ROLE,
    _PAUSER_ROLE,
} from '../../../../scripts/constants'
import {
    deployEquityFromFactory,
    Rbac,
    RegulationSubType,
    RegulationType,
} from '../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'

describe('Access Control Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let signer_D: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string
    let account_D: string

    let accessControlFacet: AccessControl
    let pauseFacet: Pause

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B, signer_C, signer_D] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address
        account_C = signer_C.address
        account_D = signer_D.address

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
            RegulationType.REG_S,
            RegulationSubType.NONE,
            true,
            'ES,FR,CH',
            'nothing',
            init_rbacs
        )

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    it('GIVEN an account without administrative role WHEN grantRole THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non admin)
        accessControlFacet = accessControlFacet.connect(signer_C)

        // grant role fails
        await expect(
            accessControlFacet.grantRole(_PAUSER_ROLE, account_D)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without administrative role WHEN revokeRole THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non admin)
        accessControlFacet = accessControlFacet.connect(signer_C)

        // revoke role fails
        await expect(
            accessControlFacet.revokeRole(_DEFAULT_ADMIN_ROLE, account_B)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without administrative role WHEN applyRoles THEN transaction fails with AccountHasNoRole', async () => {
        // Using account C (non admin)
        accessControlFacet = accessControlFacet.connect(signer_C)

        // revoke role fails
        await expect(
            accessControlFacet.applyRoles(
                [_DEFAULT_ADMIN_ROLE],
                [true],
                account_B
            )
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without administrative role WHEN applyRoles THEN transaction fails with RolesAndActivesLengthMismatch', async () => {
        // Using account C (non admin)
        accessControlFacet = accessControlFacet.connect(signer_C)

        // revoke role fails
        await expect(
            accessControlFacet.applyRoles([_DEFAULT_ADMIN_ROLE], [], account_B)
        ).to.be.rejectedWith('RolesAndActivesLengthMismatch')
    })

    it('GIVEN a paused Token WHEN grantRole THEN transaction fails with TokenIsPaused', async () => {
        // Pausing the token
        pauseFacet = pauseFacet.connect(signer_B)
        await pauseFacet.pause()
        // Using account A (admin)
        accessControlFacet = accessControlFacet.connect(signer_A)

        // grant role fails
        await expect(
            accessControlFacet.grantRole(_PAUSER_ROLE, account_D)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN a paused Token WHEN revokeRole THEN transaction fails with TokenIsPaused', async () => {
        // Pausing the token
        pauseFacet = pauseFacet.connect(signer_B)
        await pauseFacet.pause()
        // Using account A (admin)
        accessControlFacet = accessControlFacet.connect(signer_A)

        // revoke role fails
        await expect(
            accessControlFacet.revokeRole(_PAUSER_ROLE, account_B)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN a paused Token WHEN renounce THEN transaction fails with TokenIsPaused', async () => {
        // Pausing the token
        pauseFacet = pauseFacet.connect(signer_B)
        await pauseFacet.pause()
        // Using account B (has the role)
        accessControlFacet = accessControlFacet.connect(signer_B)

        // revoke role fails
        await expect(
            accessControlFacet.renounceRole(_PAUSER_ROLE)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN an paused Token WHEN applyRoles THEN transaction fails with TokenIsPaused', async () => {
        // Pausing the token
        pauseFacet = pauseFacet.connect(signer_B)
        await pauseFacet.pause()
        // Using account B (has the role)
        accessControlFacet = accessControlFacet.connect(signer_B)

        // revoke role fails
        await expect(
            accessControlFacet.applyRoles(
                [_DEFAULT_ADMIN_ROLE],
                [true],
                account_B
            )
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN an account with administrative role WHEN grantRole THEN transaction succeeds', async () => {
        // Using account A (admin)
        accessControlFacet = accessControlFacet.connect(signer_A)
        // check that C does not have the role
        let check_C = await accessControlFacet.hasRole(_PAUSER_ROLE, account_C)
        expect(check_C).to.equal(false)

        // grant Role
        await expect(accessControlFacet.grantRole(_PAUSER_ROLE, account_C))
            .to.emit(accessControlFacet, 'RoleGranted')
            .withArgs(account_A, account_C, _PAUSER_ROLE)

        // check that C has the role
        check_C = await accessControlFacet.hasRole(_PAUSER_ROLE, account_C)
        expect(check_C).to.equal(true)
        // check roles and members count and lists
        const roleCountFor_C = await accessControlFacet.getRoleCountFor(
            account_C
        )
        const rolesFor_C = await accessControlFacet.getRolesFor(
            account_C,
            0,
            roleCountFor_C
        )
        const memberCountFor_Pause =
            await accessControlFacet.getRoleMemberCount(_PAUSER_ROLE)
        const membersFor_Pause = await accessControlFacet.getRoleMembers(
            _PAUSER_ROLE,
            0,
            memberCountFor_Pause
        )
        expect(roleCountFor_C).to.equal(1)
        expect(rolesFor_C.length).to.equal(roleCountFor_C)
        expect(rolesFor_C[0].toUpperCase()).to.equal(_PAUSER_ROLE.toUpperCase())
        expect(memberCountFor_Pause).to.equal(2)
        expect(membersFor_Pause.length).to.equal(memberCountFor_Pause)
        expect(membersFor_Pause[0].toUpperCase()).to.equal(
            account_B.toUpperCase()
        )
        expect(membersFor_Pause[1].toUpperCase()).to.equal(
            account_C.toUpperCase()
        )
    })

    it('GIVEN an account with administrative role WHEN revokeRole THEN transaction succeeds', async () => {
        // Using account A (admin)
        accessControlFacet = accessControlFacet.connect(signer_A)
        // check that B has the role
        let check_B = await accessControlFacet.hasRole(_PAUSER_ROLE, account_B)
        expect(check_B).to.equal(true)

        // revoke Role
        await expect(accessControlFacet.revokeRole(_PAUSER_ROLE, account_B))
            .to.emit(accessControlFacet, 'RoleRevoked')
            .withArgs(account_A, account_B, _PAUSER_ROLE)

        // check that B does not have the role
        check_B = await accessControlFacet.hasRole(_PAUSER_ROLE, account_B)
        expect(check_B).to.equal(false)
        // check roles and members count and lists
        const roleCountFor_B = await accessControlFacet.getRoleCountFor(
            account_B
        )
        const rolesFor_B = await accessControlFacet.getRolesFor(
            account_B,
            0,
            roleCountFor_B
        )
        const memberCountFor_Pause =
            await accessControlFacet.getRoleMemberCount(_PAUSER_ROLE)
        const membersFor_Pause = await accessControlFacet.getRoleMembers(
            _PAUSER_ROLE,
            0,
            memberCountFor_Pause
        )
        expect(roleCountFor_B).to.equal(0)
        expect(rolesFor_B.length).to.equal(roleCountFor_B)
        expect(memberCountFor_Pause).to.equal(0)
        expect(membersFor_Pause.length).to.equal(memberCountFor_Pause)
    })

    it('GIVEN an account with pauser role WHEN renouncing the pauser role THEN transaction succeeds', async () => {
        // Using account A (admin)
        accessControlFacet = accessControlFacet.connect(signer_B)
        // check that B has the role
        let check_B = await accessControlFacet.hasRole(_PAUSER_ROLE, account_B)
        expect(check_B).to.equal(true)

        // revoke Role
        await expect(accessControlFacet.renounceRole(_PAUSER_ROLE))
            .to.emit(accessControlFacet, 'RoleRenounced')
            .withArgs(account_B, _PAUSER_ROLE)

        // check that B does not have the role
        check_B = await accessControlFacet.hasRole(_PAUSER_ROLE, account_B)
        expect(check_B).to.equal(false)
        // check roles and members count and lists
        const roleCountFor_B = await accessControlFacet.getRoleCountFor(
            account_B
        )
        const rolesFor_B = await accessControlFacet.getRolesFor(
            account_B,
            0,
            roleCountFor_B
        )
        const memberCountFor_Pause =
            await accessControlFacet.getRoleMemberCount(_PAUSER_ROLE)
        const membersFor_Pause = await accessControlFacet.getRoleMembers(
            _PAUSER_ROLE,
            0,
            memberCountFor_Pause
        )
        expect(roleCountFor_B).to.equal(0)
        expect(rolesFor_B.length).to.equal(roleCountFor_B)
        expect(memberCountFor_Pause).to.equal(0)
        expect(membersFor_Pause.length).to.equal(memberCountFor_Pause)
    })

    it('GIVEN an account with administrative role WHEN applyRoles THEN transaction succeeds', async () => {
        // Using account A (admin)
        accessControlFacet = accessControlFacet.connect(signer_A)
        // check that C does not have the role
        await accessControlFacet.grantRole(_PAUSER_ROLE, account_C)

        // grant Role
        await expect(
            accessControlFacet.applyRoles(
                [_PAUSER_ROLE, _DEFAULT_ADMIN_ROLE],
                [false, true],
                account_C
            )
        )
            .to.emit(accessControlFacet, 'RolesApplied')
            .withArgs(
                [_PAUSER_ROLE, _DEFAULT_ADMIN_ROLE],
                [false, true],
                account_C
            )

        // check that C has the role
        expect(
            await accessControlFacet.hasRole(_PAUSER_ROLE, account_C)
        ).to.equal(false)
        expect(
            await accessControlFacet.hasRole(_DEFAULT_ADMIN_ROLE, account_C)
        ).to.equal(true)
        // check roles and members count and lists
        const roleCountFor_C = await accessControlFacet.getRoleCountFor(
            account_C
        )
        const rolesFor_C = await accessControlFacet.getRolesFor(
            account_C,
            0,
            roleCountFor_C
        )
        const memberCountFor_Pause =
            await accessControlFacet.getRoleMemberCount(_PAUSER_ROLE)
        const membersFor_Pause = await accessControlFacet.getRoleMembers(
            _PAUSER_ROLE,
            0,
            memberCountFor_Pause
        )
        const memberCountFor_Default =
            await accessControlFacet.getRoleMemberCount(_DEFAULT_ADMIN_ROLE)
        const membersFor_Default = await accessControlFacet.getRoleMembers(
            _DEFAULT_ADMIN_ROLE,
            0,
            memberCountFor_Default
        )
        expect(roleCountFor_C).to.equal(1)
        expect(rolesFor_C.length).to.equal(roleCountFor_C)
        expect(rolesFor_C[0].toUpperCase()).to.equal(
            _DEFAULT_ADMIN_ROLE.toUpperCase()
        )
        expect(memberCountFor_Pause).to.equal(1)
        expect(membersFor_Pause.length).to.equal(memberCountFor_Pause)
        expect(memberCountFor_Default).to.equal(2)
        expect(membersFor_Default.length).to.equal(memberCountFor_Default)
        expect(membersFor_Pause[0].toUpperCase()).to.equal(
            account_B.toUpperCase()
        )
        expect(membersFor_Default[1].toUpperCase()).to.equal(
            account_C.toUpperCase()
        )
    })
})
