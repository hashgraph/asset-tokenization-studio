import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import {
    type ResolverProxy,
    type Pause,
    ERC20Permit,
    ERC20,
    AccessControl,
    ControlList,
} from '@typechain'
import { ADDRESS_ZERO, ATS_ROLES } from '@scripts'
import { deployEquityTokenFixture } from '@test/fixtures'

import { executeRbac } from '@test/fixtures/tokens/common.fixture'

describe('ERC20Permit Tests', () => {
    let diamond: ResolverProxy
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let erc20PermitFacet: ERC20Permit
    let erc20Facet: ERC20
    let pauseFacet: Pause
    let accessControlFacet: AccessControl
    let controlList: ControlList

    const CONTRACT_NAME_ERC20PERMIT = 'ERC20Permit'
    const CONTRACT_VERSION_ERC20PERMIT = '1.0.0'

    beforeEach(async () => {
        const base = await deployEquityTokenFixture()
        diamond = base.diamond
        signer_A = base.deployer
        signer_B = base.user1
        signer_C = base.user2

        await executeRbac(base.accessControlFacet, [
            {
                role: ATS_ROLES.PAUSER,
                members: [signer_A.address],
            },
        ])

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )
        controlList = await ethers.getContractAt('ControlList', diamond.address)

        erc20PermitFacet = await ethers.getContractAt(
            'ERC20Permit',
            diamond.address
        )
        pauseFacet = await ethers.getContractAt(
            'Pause',
            diamond.address,
            signer_A
        )
        erc20Facet = await ethers.getContractAt(
            'ERC20',
            diamond.address,
            signer_A
        )
    })

    describe('Single Partition', () => {
        describe('Nonces', () => {
            it('GIVEN any account WHEN nonces is called THEN the current nonce for that account is returned', async () => {
                const nonces = await erc20PermitFacet.nonces(signer_A.address)
                expect(nonces).to.equal(0)
            })
        })

        describe('Domain Separator', () => {
            it('GIVEN a deployed contract WHEN DOMAIN_SEPARATOR is called THEN the correct domain separator is returned', async () => {
                const domainSeparator =
                    await erc20PermitFacet.DOMAIN_SEPARATOR()
                const domain = {
                    name: CONTRACT_NAME_ERC20PERMIT,
                    version: CONTRACT_VERSION_ERC20PERMIT,
                    chainId: await ethers.provider
                        .getNetwork()
                        .then((n) => n.chainId),
                    verifyingContract: diamond.address,
                }
                const domainHash =
                    ethers.utils._TypedDataEncoder.hashDomain(domain)
                expect(domainSeparator).to.equal(domainHash)
            })
        })

        describe('permit', () => {
            it('GIVEN a paused token WHEN permit is called THEN the transaction fails with TokenIsPaused', async () => {
                await pauseFacet.pause()

                await expect(
                    erc20PermitFacet.permit(
                        signer_B.address,
                        signer_A.address,
                        1,
                        Math.floor(Date.now() / 1000) + 3600,
                        27,
                        '0x0000000000000000000000000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000000'
                    )
                ).to.be.revertedWithCustomError(pauseFacet, 'TokenIsPaused')
            })

            it('GIVEN an owner address of zero WHEN permit is called THEN the transaction fails with ZeroAddressNotAllowed', async () => {
                await expect(
                    erc20PermitFacet.permit(
                        ADDRESS_ZERO,
                        signer_A.address,
                        1,
                        Math.floor(Date.now() / 1000) + 3600,
                        27,
                        '0x0000000000000000000000000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000000'
                    )
                ).to.be.revertedWithCustomError(
                    erc20PermitFacet,
                    'ZeroAddressNotAllowed'
                )
            })

            it('GIVEN a spender address of zero WHEN permit is called THEN the transaction fails with ZeroAddressNotAllowed', async () => {
                await expect(
                    erc20PermitFacet.permit(
                        signer_A.address,
                        ADDRESS_ZERO,
                        1,
                        Math.floor(Date.now() / 1000) + 3600,
                        27,
                        '0x0000000000000000000000000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000000'
                    )
                ).to.be.revertedWithCustomError(
                    erc20PermitFacet,
                    'ZeroAddressNotAllowed'
                )
            })

            it('GIVEN a blocked owner account WHEN permit is called THEN the transaction fails with AccountIsBlocked', async () => {
                // Blacklisting accounts
                await accessControlFacet
                    .connect(signer_A)
                    .grantRole(ATS_ROLES.CONTROL_LIST, signer_A.address)
                await controlList
                    .connect(signer_A)
                    .addToControlList(signer_C.address)

                await expect(
                    erc20PermitFacet.permit(
                        signer_C.address,
                        signer_B.address,
                        1,
                        Math.floor(Date.now() / 1000) + 3600,
                        27,
                        '0x0000000000000000000000000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000000'
                    )
                ).to.be.revertedWithCustomError(
                    erc20PermitFacet,
                    'AccountIsBlocked'
                )
            })

            it('GIVEN a blocked spender account WHEN permit is called THEN the transaction fails with AccountIsBlocked', async () => {
                await accessControlFacet
                    .connect(signer_A)
                    .grantRole(ATS_ROLES.CONTROL_LIST, signer_A.address)
                await controlList
                    .connect(signer_A)
                    .addToControlList(signer_C.address)

                await expect(
                    erc20PermitFacet.permit(
                        signer_B.address,
                        signer_C.address,
                        1,
                        Math.floor(Date.now() / 1000) + 3600,
                        27,
                        '0x0000000000000000000000000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000000'
                    )
                ).to.be.revertedWithCustomError(
                    erc20PermitFacet,
                    'AccountIsBlocked'
                )
            })

            it('GIVEN an expired signature WHEN permit is called THEN the transaction reverts with ERC2612ExpiredSignature', async () => {
                const expiry = Math.floor(Date.now() / 1000) - 3600 // 1 hour ago

                await expect(
                    erc20PermitFacet.permit(
                        signer_B.address,
                        signer_C.address,
                        1,
                        expiry,
                        27,
                        '0x0000000000000000000000000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000000'
                    )
                )
                    .to.be.revertedWithCustomError(
                        erc20PermitFacet,
                        'ERC2612ExpiredSignature'
                    )
                    .withArgs(expiry)
            })

            it('GIVEN a signature from a different owner WHEN permit is called THEN the transaction reverts with ERC2612InvalidSigner', async () => {
                const nonce = await erc20PermitFacet.nonces(signer_A.address)
                const expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hour in the future

                const domain = {
                    name: CONTRACT_NAME_ERC20PERMIT,
                    version: CONTRACT_VERSION_ERC20PERMIT,
                    chainId: await ethers.provider
                        .getNetwork()
                        .then((n) => n.chainId),
                    verifyingContract: diamond.address,
                }

                const types = {
                    Permit: [
                        { name: 'owner', type: 'address' },
                        { name: 'spender', type: 'address' },
                        { name: 'value', type: 'uint256' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'deadline', type: 'uint256' },
                    ],
                }

                const value = {
                    owner: signer_A.address,
                    spender: signer_B.address,
                    value: 1,
                    nonce: nonce,
                    deadline: expiry,
                }

                const signature = await signer_A._signTypedData(
                    domain,
                    types,
                    value
                )
                const sig = ethers.utils.splitSignature(signature)

                await expect(
                    erc20PermitFacet.permit(
                        signer_B.address,
                        signer_A.address,
                        1,
                        expiry,
                        sig.v,
                        sig.r,
                        sig.s
                    )
                ).to.be.revertedWithCustomError(
                    erc20PermitFacet,
                    'ERC2612InvalidSigner'
                )
            })

            it('GIVEN a valid signature WHEN permit is called THEN the approval succeeds and emits Approval event', async () => {
                const nonce = await erc20PermitFacet.nonces(signer_A.address)
                const expiry = Math.floor(Date.now() / 1000) + 3600 // 1 hour in the future

                const domain = {
                    name: CONTRACT_NAME_ERC20PERMIT,
                    version: CONTRACT_VERSION_ERC20PERMIT,
                    chainId: await ethers.provider
                        .getNetwork()
                        .then((n) => n.chainId),
                    verifyingContract: diamond.address,
                }

                const types = {
                    Permit: [
                        { name: 'owner', type: 'address' },
                        { name: 'spender', type: 'address' },
                        { name: 'value', type: 'uint256' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'deadline', type: 'uint256' },
                    ],
                }

                const value = {
                    owner: signer_A.address,
                    spender: signer_B.address,
                    value: 1,
                    nonce: nonce,
                    deadline: expiry,
                }

                const signature = await signer_A._signTypedData(
                    domain,
                    types,
                    value
                )
                const sig = ethers.utils.splitSignature(signature)

                await expect(
                    erc20PermitFacet.permit(
                        signer_A.address,
                        signer_B.address,
                        1,
                        expiry,
                        sig.v,
                        sig.r,
                        sig.s
                    )
                )
                    .to.emit(erc20Facet, 'Approval')
                    .withArgs(signer_A.address, signer_B.address, 1)
            })
        })
    })
    describe('Multi Partition', () => {
        it('GIVEN a new diamond contract with multi-partition enabled WHEN permit is called THEN the transaction fails with NotAllowedInMultiPartitionMode', async () => {
            const base = await deployEquityTokenFixture({
                securityData: { isMultiPartition: true },
            })

            await expect(
                erc20PermitFacet
                    .attach(base.diamond.address)
                    .permit(
                        signer_B.address,
                        signer_C.address,
                        1,
                        Math.floor(Date.now() / 1000) + 3600,
                        27,
                        '0x0000000000000000000000000000000000000000000000000000000000000000',
                        '0x0000000000000000000000000000000000000000000000000000000000000000'
                    )
            ).to.be.revertedWithCustomError(
                erc20PermitFacet,
                'NotAllowedInMultiPartitionMode'
            )
        })
    })
})
