import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { type ResolverProxy, type AccessControl, PauseFacet } from '@typechain'
import { ATS_ROLES } from '@scripts'
import { deployEquityTokenFixture } from '@test'
import { executeRbac } from '@test'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

describe('Access Control Tests', () => {
    let diamond: ResolverProxy
    let pauseFacet: PauseFacet
    let accessControlFacet: AccessControl
    let deployer: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress
    let unknownSigner: SignerWithAddress

    async function deployFixture() {
        const base = await deployEquityTokenFixture()
        diamond = base.diamond
        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES._PAUSER_ROLE,
                members: [base.user1.address],
            },
        ])

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )
        deployer = base.deployer
        pauseFacet = base.pauseFacet
        signer_B = base.user1
        signer_C = base.user2
        unknownSigner = base.unknownSigner
    }

    beforeEach(async () => {
        await loadFixture(deployFixture)
    })

    it('GIVEN an account without administrative role WHEN grantRole THEN transaction fails with AccountHasNoRole', async () => {
        await expect(
            accessControlFacet
                .connect(signer_C)
                .grantRole(ATS_ROLES._PAUSER_ROLE, unknownSigner.address)
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without administrative role WHEN revokeRole THEN transaction fails with AccountHasNoRole', async () => {
        await expect(
            accessControlFacet
                .connect(signer_C)
                .revokeRole(
                    ATS_ROLES._DEFAULT_ADMIN_ROLE,
                    unknownSigner.address
                )
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN an account without administrative role WHEN applyRoles THEN transaction fails with AccountHasNoRole', async () => {
        await expect(
            accessControlFacet
                .connect(signer_C)
                .applyRoles(
                    [ATS_ROLES._DEFAULT_ADMIN_ROLE],
                    [true],
                    unknownSigner.address
                )
        ).to.be.rejectedWith('AccountHasNoRole')
    })

    it('GIVEN a list of roles and actives that is not equally long WHEN applyRoles THEN transaction fails with RolesAndActivesLengthMismatch', async () => {
        await expect(
            accessControlFacet
                .connect(signer_C)
                .applyRoles(
                    [ATS_ROLES._DEFAULT_ADMIN_ROLE],
                    [],
                    unknownSigner.address
                )
        ).to.be.rejectedWith('RolesAndActivesLengthMismatch')
    })

    it('GIVEN a list of contradictory roles (enable and disbale) role WHEN applyRoles THEN transaction fails with ApplyRoleContradiction', async () => {
        const Roles_1 = [
            ATS_ROLES._DEFAULT_ADMIN_ROLE,
            ATS_ROLES._PAUSER_ROLE,
            ATS_ROLES._CAP_ROLE,
            ATS_ROLES._CONTROLLER_ROLE,
            ATS_ROLES._CORPORATE_ACTION_ROLE,
            ATS_ROLES._DOCUMENTER_ROLE,
            ATS_ROLES._CONTROLLER_ROLE,
            ATS_ROLES._LOCKER_ROLE,
        ]

        const actives_1 = [true, true, true, true, true, true, false, true]
        const actives_2 = [true, true, true, false, true, true, true, true]

        // revoke role fails
        await expect(
            accessControlFacet
                .connect(deployer)
                .applyRoles(Roles_1, actives_1, unknownSigner.address)
        )
            .to.be.revertedWithCustomError(
                accessControlFacet,
                'ContradictoryValuesInArray'
            )
            .withArgs(3, 6)

        await expect(
            accessControlFacet
                .connect(deployer)
                .applyRoles(Roles_1, actives_2, unknownSigner.address)
        )
            .to.be.revertedWithCustomError(
                accessControlFacet,
                'ContradictoryValuesInArray'
            )
            .withArgs(3, 6)
    })

    it('GIVEN a paused Token WHEN grantRole THEN transaction fails with TokenIsPaused', async () => {
        await pauseFacet.connect(signer_B).pause()

        await expect(
            accessControlFacet
                .connect(deployer)
                .grantRole(ATS_ROLES._PAUSER_ROLE, unknownSigner.address)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN a paused Token WHEN revokeRole THEN transaction fails with TokenIsPaused', async () => {
        await pauseFacet.connect(signer_B).pause()

        await expect(
            accessControlFacet
                .connect(deployer)
                .revokeRole(ATS_ROLES._PAUSER_ROLE, unknownSigner.address)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN a paused Token WHEN renounce THEN transaction fails with TokenIsPaused', async () => {
        // Pausing the token
        await pauseFacet.connect(signer_B).pause()

        // revoke role fails
        await expect(
            accessControlFacet
                .connect(deployer)
                .renounceRole(ATS_ROLES._PAUSER_ROLE)
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN an paused Token WHEN applyRoles THEN transaction fails with TokenIsPaused', async () => {
        // Pausing the token
        await pauseFacet.connect(signer_B).pause()

        // revoke role fails
        await expect(
            accessControlFacet
                .connect(signer_B)
                .applyRoles(
                    [ATS_ROLES._DEFAULT_ADMIN_ROLE],
                    [true],
                    unknownSigner.address
                )
        ).to.be.rejectedWith('TokenIsPaused')
    })

    it('GIVEN an account with administrative role WHEN grantRole THEN transaction succeeds', async () => {
        // check that C does not have the role
        let check_C = await accessControlFacet.hasRole(
            ATS_ROLES._PAUSER_ROLE,
            unknownSigner.address
        )
        expect(check_C).to.equal(false)

        // grant Role
        await expect(
            accessControlFacet
                .connect(deployer)
                .grantRole(ATS_ROLES._PAUSER_ROLE, unknownSigner.address)
        )
            .to.emit(accessControlFacet, 'RoleGranted')
            .withArgs(
                deployer.address,
                unknownSigner.address,
                ATS_ROLES._PAUSER_ROLE
            )

        // check that C has the role
        check_C = await accessControlFacet.hasRole(
            ATS_ROLES._PAUSER_ROLE,
            unknownSigner.address
        )
        expect(check_C).to.equal(true)
        // check roles and members count and lists
        const roleCountFor_C = await accessControlFacet.getRoleCountFor(
            unknownSigner.address
        )
        const rolesFor_C = await accessControlFacet.getRolesFor(
            unknownSigner.address,
            0,
            roleCountFor_C
        )
        const memberCountFor_Pause =
            await accessControlFacet.getRoleMemberCount(ATS_ROLES._PAUSER_ROLE)
        const membersFor_Pause = await accessControlFacet.getRoleMembers(
            ATS_ROLES._PAUSER_ROLE,
            0,
            memberCountFor_Pause
        )
        expect(roleCountFor_C).to.equal(1)
        expect(rolesFor_C.length).to.equal(roleCountFor_C)
        expect(rolesFor_C[0].toUpperCase()).to.equal(
            ATS_ROLES._PAUSER_ROLE.toUpperCase()
        )
        expect(memberCountFor_Pause).to.equal(2)
        expect(membersFor_Pause.length).to.equal(memberCountFor_Pause)
        expect(membersFor_Pause[0].toUpperCase()).to.equal(
            signer_B.address.toUpperCase()
        )
        expect(membersFor_Pause[1].toUpperCase()).to.equal(
            unknownSigner.address.toUpperCase()
        )
    })

    it('GIVEN an account with administrative role WHEN revokeRole THEN transaction succeeds', async () => {
        // check that B has the role
        let check_B = await accessControlFacet.hasRole(
            ATS_ROLES._PAUSER_ROLE,
            signer_B.address
        )
        expect(check_B).to.equal(true)

        // revoke Role
        await expect(
            accessControlFacet
                .connect(deployer)
                .revokeRole(ATS_ROLES._PAUSER_ROLE, signer_B.address)
        )
            .to.emit(accessControlFacet, 'RoleRevoked')
            .withArgs(
                deployer.address,
                signer_B.address,
                ATS_ROLES._PAUSER_ROLE
            )

        // check that B does not have the role
        check_B = await accessControlFacet.hasRole(
            ATS_ROLES._PAUSER_ROLE,
            signer_B.address
        )
        expect(check_B).to.equal(false)
        // check roles and members count and lists
        const roleCountFor_B = await accessControlFacet.getRoleCountFor(
            signer_B.address
        )
        const rolesFor_B = await accessControlFacet.getRolesFor(
            signer_B.address,
            0,
            roleCountFor_B
        )
        const memberCountFor_Pause =
            await accessControlFacet.getRoleMemberCount(ATS_ROLES._PAUSER_ROLE)
        const membersFor_Pause = await accessControlFacet.getRoleMembers(
            ATS_ROLES._PAUSER_ROLE,
            0,
            memberCountFor_Pause
        )
        expect(roleCountFor_B).to.equal(0)
        expect(rolesFor_B.length).to.equal(roleCountFor_B)
        expect(memberCountFor_Pause).to.equal(0)
        expect(membersFor_Pause.length).to.equal(memberCountFor_Pause)
    })

    it('GIVEN an account with pauser role WHEN renouncing the pauser role THEN transaction succeeds', async () => {
        // check that B has the role
        let check_B = await accessControlFacet.hasRole(
            ATS_ROLES._PAUSER_ROLE,
            signer_B.address
        )
        expect(check_B).to.equal(true)

        // revoke Role
        await expect(
            accessControlFacet
                .connect(signer_B)
                .renounceRole(ATS_ROLES._PAUSER_ROLE)
        )
            .to.emit(accessControlFacet, 'RoleRenounced')
            .withArgs(signer_B.address, ATS_ROLES._PAUSER_ROLE)

        // check that B does not have the role
        check_B = await accessControlFacet.hasRole(
            ATS_ROLES._PAUSER_ROLE,
            signer_B.address
        )
        expect(check_B).to.equal(false)
        // check roles and members count and lists
        const roleCountFor_B = await accessControlFacet.getRoleCountFor(
            signer_B.address
        )
        const rolesFor_B = await accessControlFacet.getRolesFor(
            signer_B.address,
            0,
            roleCountFor_B
        )
        const memberCountFor_Pause =
            await accessControlFacet.getRoleMemberCount(ATS_ROLES._PAUSER_ROLE)
        const membersFor_Pause = await accessControlFacet.getRoleMembers(
            ATS_ROLES._PAUSER_ROLE,
            0,
            memberCountFor_Pause
        )
        expect(roleCountFor_B).to.equal(0)
        expect(rolesFor_B.length).to.equal(roleCountFor_B)
        expect(memberCountFor_Pause).to.equal(0)
        expect(membersFor_Pause.length).to.equal(memberCountFor_Pause)
    })

    it('GIVEN an account with administrative role WHEN applyRoles THEN transaction succeeds', async () => {
        // check that C does not have the role
        await accessControlFacet
            .connect(deployer)
            .grantRole(ATS_ROLES._PAUSER_ROLE, signer_C.address)

        // grant Role
        await expect(
            accessControlFacet
                .connect(deployer)
                .applyRoles(
                    [ATS_ROLES._PAUSER_ROLE, ATS_ROLES._DEFAULT_ADMIN_ROLE],
                    [false, true],
                    signer_C.address
                )
        )
            .to.emit(accessControlFacet, 'RolesApplied')
            .withArgs(
                [ATS_ROLES._PAUSER_ROLE, ATS_ROLES._DEFAULT_ADMIN_ROLE],
                [false, true],
                signer_C.address
            )

        // check that C has the role
        expect(
            await accessControlFacet.hasRole(
                ATS_ROLES._PAUSER_ROLE,
                signer_C.address
            )
        ).to.equal(false)
        expect(
            await accessControlFacet.hasRole(
                ATS_ROLES._DEFAULT_ADMIN_ROLE,
                signer_C.address
            )
        ).to.equal(true)
        // check roles and members count and lists
        const roleCountFor_C = await accessControlFacet.getRoleCountFor(
            signer_C.address
        )
        const rolesFor_C = await accessControlFacet.getRolesFor(
            signer_C.address,
            0,
            roleCountFor_C
        )
        const memberCountFor_Pause =
            await accessControlFacet.getRoleMemberCount(ATS_ROLES._PAUSER_ROLE)
        const membersFor_Pause = await accessControlFacet.getRoleMembers(
            ATS_ROLES._PAUSER_ROLE,
            0,
            memberCountFor_Pause
        )
        const memberCountFor_Default =
            await accessControlFacet.getRoleMemberCount(
                ATS_ROLES._DEFAULT_ADMIN_ROLE
            )
        const membersFor_Default = await accessControlFacet.getRoleMembers(
            ATS_ROLES._DEFAULT_ADMIN_ROLE,
            0,
            memberCountFor_Default
        )
        expect(roleCountFor_C).to.equal(1)
        expect(rolesFor_C.length).to.equal(roleCountFor_C)
        expect(rolesFor_C[0].toUpperCase()).to.equal(
            ATS_ROLES._DEFAULT_ADMIN_ROLE.toUpperCase()
        )
        expect(memberCountFor_Pause).to.equal(1)
        expect(membersFor_Pause.length).to.equal(memberCountFor_Pause)
        expect(memberCountFor_Default).to.equal(2)
        expect(membersFor_Default.length).to.equal(memberCountFor_Default)
        expect(membersFor_Pause[0].toUpperCase()).to.equal(
            signer_B.address.toUpperCase()
        )
        expect(membersFor_Default[1].toUpperCase()).to.equal(
            signer_C.address.toUpperCase()
        )
    })

    it('GIVEN an account with administrative role, if roles are duplicated but not contradictory WHEN applyRoles THEN transaction succeeds', async () => {
        // check that C does not have the role
        await accessControlFacet
            .connect(deployer)
            .grantRole(ATS_ROLES._PAUSER_ROLE, signer_C.address)

        // grant Role
        await expect(
            accessControlFacet
                .connect(deployer)
                .applyRoles(
                    [
                        ATS_ROLES._PAUSER_ROLE,
                        ATS_ROLES._DEFAULT_ADMIN_ROLE,
                        ATS_ROLES._DEFAULT_ADMIN_ROLE,
                    ],
                    [true, false, false],
                    signer_C.address
                )
        )
            .to.emit(accessControlFacet, 'RolesApplied')
            .withArgs(
                [
                    ATS_ROLES._PAUSER_ROLE,
                    ATS_ROLES._DEFAULT_ADMIN_ROLE,
                    ATS_ROLES._DEFAULT_ADMIN_ROLE,
                ],
                [true, false, false],
                signer_C.address
            )

        // check that C has the role
        expect(
            await accessControlFacet.hasRole(
                ATS_ROLES._PAUSER_ROLE,
                signer_C.address
            )
        ).to.equal(true)
        expect(
            await accessControlFacet.hasRole(
                ATS_ROLES._DEFAULT_ADMIN_ROLE,
                signer_C.address
            )
        ).to.equal(false)
        // check roles and members count and lists
        const roleCountFor_C = await accessControlFacet.getRoleCountFor(
            signer_C.address
        )
        const rolesFor_C = await accessControlFacet.getRolesFor(
            signer_C.address,
            0,
            roleCountFor_C
        )

        expect(roleCountFor_C).to.equal(1)
        expect(rolesFor_C.length).to.equal(roleCountFor_C)
        expect(rolesFor_C[0].toUpperCase()).to.equal(
            ATS_ROLES._PAUSER_ROLE.toUpperCase()
        )
    })
})
