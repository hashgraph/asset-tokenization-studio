import { expect } from 'chai'
import { ethers } from 'hardhat'
import {
    type Diamond,
    type Bond,
    AccessControl,
    Pause,
} from '../../../../typechain-types'
import { deployEnvironment } from '../../../../scripts/deployEnvironmentByRpc'
import {
    _CORPORATE_ACTION_ROLE,
    _PAUSER_ROLE,
} from '../../../../scripts/constants'
import {
    Rbac,
    deployBondFromFactory,
    RegulationSubType,
    RegulationType,
} from '../../../../scripts/factory'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { grantRoleAndPauseToken } from '../../../../scripts/testCommon'
import { time } from '@nomicfoundation/hardhat-network-helpers'

const TIME = 30
const numberOfUnits = 1000
let currentTimeInSeconds = 0
let startingDate = 0
const numberOfCoupons = 50
const frequency = 7
const rate = 1
let maturityDate = 0
let firstCouponDate = 0
const countriesControlListType = true
const listOfCountries = 'ES,FR,CH'
const info = 'info'

const TIME_2 = 10000
let couponRecordDateInSeconds = 0
let couponExecutionDateInSeconds = 0
const couponRate = 5

let couponData = {
    recordDate: couponRecordDateInSeconds.toString(),
    executionDate: couponExecutionDateInSeconds.toString(),
    rate: couponRate,
}

describe('Bond Tests', () => {
    let diamond: Diamond
    let signer_A: SignerWithAddress
    let signer_B: SignerWithAddress
    let signer_C: SignerWithAddress

    let account_A: string
    let account_B: string
    let account_C: string

    let bondFacet: Bond
    let accessControlFacet: AccessControl
    let pauseFacet: Pause

    before(async () => {
        // eslint-disable-next-line @typescript-eslint/no-extra-semi
        ;[signer_A, signer_B, signer_C] = await ethers.getSigners()
        account_A = signer_A.address
        account_B = signer_B.address
        account_C = signer_C.address
    })

    beforeEach(async () => {
        currentTimeInSeconds = await time.latest()
        startingDate = currentTimeInSeconds + TIME
        maturityDate = startingDate + numberOfCoupons * frequency
        firstCouponDate = startingDate + 1
        couponRecordDateInSeconds = currentTimeInSeconds + TIME_2
        couponExecutionDateInSeconds = currentTimeInSeconds + 10 * TIME_2
        couponData = {
            recordDate: couponRecordDateInSeconds.toString(),
            executionDate: couponExecutionDateInSeconds.toString(),
            rate: couponRate,
        }

        await deployEnvironment()

        const rbacPause: Rbac = {
            role: _PAUSER_ROLE,
            members: [account_B],
        }
        const init_rbacs: Rbac[] = [rbacPause]

        diamond = await deployBondFromFactory(
            account_A,
            false,
            true,
            false,
            'TEST_AccessControl',
            'TAC',
            6,
            'ABCDEF123456',
            '0x455552',
            numberOfUnits,
            100,
            startingDate,
            maturityDate,
            frequency,
            rate,
            firstCouponDate,
            RegulationType.REG_D,
            RegulationSubType.REG_D_506_C,
            countriesControlListType,
            listOfCountries,
            info,
            init_rbacs
        )

        bondFacet = await ethers.getContractAt('Bond', diamond.address)

        accessControlFacet = await ethers.getContractAt(
            'AccessControl',
            diamond.address
        )

        pauseFacet = await ethers.getContractAt('Pause', diamond.address)
    })

    describe('Coupons', () => {
        it('GIVEN an account without corporateActions role WHEN setCoupon THEN transaction fails with AccountHasNoRole', async () => {
            // Using account C (non role)
            bondFacet = bondFacet.connect(signer_C)

            // set coupon fails
            await expect(bondFacet.setCoupon(couponData)).to.be.rejectedWith(
                'AccountHasNoRole'
            )
        })

        it('GIVEN a paused Token WHEN setCoupon THEN transaction fails with TokenIsPaused', async () => {
            // Granting Role to account C and Pause
            await grantRoleAndPauseToken(
                accessControlFacet,
                pauseFacet,
                _CORPORATE_ACTION_ROLE,
                signer_A,
                signer_B,
                account_C
            )

            // Using account C (with role)
            bondFacet = bondFacet.connect(signer_C)

            // set coupon fails
            await expect(bondFacet.setCoupon(couponData)).to.be.rejectedWith(
                'TokenIsPaused'
            )
        })

        it('GIVEN an account with corporateActions role WHEN setCoupon with wrong dates THEN transaction fails', async () => {
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            bondFacet = bondFacet.connect(signer_C)

            // set coupon
            const wrongcouponData_1 = {
                recordDate: couponExecutionDateInSeconds.toString(),
                executionDate: couponRecordDateInSeconds.toString(),
                rate: couponRate,
            }

            await expect(
                bondFacet.setCoupon(wrongcouponData_1)
            ).to.be.rejectedWith('WrongDates')

            const wrongcouponData_2 = {
                recordDate: (
                    (await ethers.provider.getBlock('latest')).timestamp - 1
                ).toString(),
                executionDate: couponExecutionDateInSeconds.toString(),
                rate: couponRate,
            }

            await expect(
                bondFacet.setCoupon(wrongcouponData_2)
            ).to.be.rejectedWith('WrongTimestamp')
        })

        it('GIVEN an account with corporateActions role WHEN setCoupon THEN transaction succeeds', async () => {
            // Granting Role to account C
            accessControlFacet = accessControlFacet.connect(signer_A)
            await accessControlFacet.grantRole(
                _CORPORATE_ACTION_ROLE,
                account_C
            )
            // Using account C (with role)
            bondFacet = bondFacet.connect(signer_C)

            // set coupon
            await expect(bondFacet.setCoupon(couponData))
                .to.emit(bondFacet, 'CouponSet')
                .withArgs(
                    '0x0000000000000000000000000000000000000000000000000000000000000033',
                    numberOfCoupons + 1,
                    account_C,
                    couponRecordDateInSeconds,
                    couponExecutionDateInSeconds,
                    couponRate
                )

            // check list members
            await expect(bondFacet.getCoupon(1000)).to.be.rejectedWith(
                'WrongIndexForAction'
            )

            const listCount = await bondFacet.getCouponCount()
            const coupon = await bondFacet.getCoupon(numberOfCoupons + 1)
            const couponFor = await bondFacet.getCouponFor(
                numberOfCoupons + 1,
                account_A
            )

            expect(listCount).to.equal(numberOfCoupons + 1)
            expect(coupon.snapshotId).to.equal(0)
            expect(coupon.coupon.recordDate).to.equal(couponRecordDateInSeconds)
            expect(coupon.coupon.executionDate).to.equal(
                couponExecutionDateInSeconds
            )
            expect(coupon.coupon.rate).to.equal(couponRate)
            expect(couponFor.recordDate).to.equal(couponRecordDateInSeconds)
            expect(couponFor.executionDate).to.equal(
                couponExecutionDateInSeconds
            )
            expect(couponFor.rate).to.equal(couponRate)
            expect(couponFor.tokenBalance).to.equal(0)
            expect(couponFor.recordDateReached).to.equal(false)
        })

        it('Check number of created Coupon', async () => {
            bondFacet = bondFacet.connect(signer_C)

            const couponCount = await bondFacet.getCouponCount()

            expect(couponCount).to.equal(numberOfCoupons)
        })

        it('Check Coupon', async () => {
            bondFacet = bondFacet.connect(signer_C)

            for (let i = 1; i <= numberOfCoupons; i++) {
                const coupon = await bondFacet.getCoupon(i)
                const couponFor = await bondFacet.getCouponFor(i, account_A)

                expect(coupon.coupon.recordDate).to.equal(
                    firstCouponDate + (i - 1) * frequency
                )
                expect(coupon.coupon.executionDate).to.equal(
                    firstCouponDate + (i - 1) * frequency
                )
                expect(coupon.coupon.rate).to.equal(rate)
                expect(coupon.snapshotId).to.equal(0)
                expect(couponFor.recordDate).to.equal(
                    firstCouponDate + (i - 1) * frequency
                )
                expect(couponFor.executionDate).to.equal(
                    firstCouponDate + (i - 1) * frequency
                )
                expect(couponFor.tokenBalance).to.equal(0)
                expect(couponFor.rate).to.equal(rate)
                expect(couponFor.recordDateReached).to.equal(false)
            }
        })
    })
})
