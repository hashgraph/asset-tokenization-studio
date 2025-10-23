import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'
import { ResolverProxy, TimeTravelFacet } from '@typechain'
import { deployEquityTokenFixture } from '@test'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { dateToUnixTimestamp } from '@scripts'

describe('Time Travel Tests', () => {
    let diamond: ResolverProxy, timeTravelFacet: TimeTravelFacet
    let signer_A: SignerWithAddress

    const setupEnvironment = async () => {
        const base = await deployEquityTokenFixture()

        diamond = base.diamond
        signer_A = base.deployer

        timeTravelFacet = await ethers.getContractAt(
            'TimeTravelFacet',
            diamond.address,
            signer_A
        )
    }

    beforeEach(async () => {
        await loadFixture(setupEnvironment)
    })

    it('GIVEN succesful deployment THEN chainId is hardhat network id', async () => {
        const chainId = 1337
        await expect(timeTravelFacet.checkBlockChainid(chainId)).to.not.be
            .reverted
    })

    it('GIVEN new system timestamp THEN change succeeds', async () => {
        const newTimestamp = dateToUnixTimestamp('2030-01-01T00:00:00Z')
        const oldSystemTime = 0
        await expect(timeTravelFacet.changeSystemTimestamp(newTimestamp))
            .to.emit(timeTravelFacet, 'SystemTimestampChanged')
            .withArgs(oldSystemTime, newTimestamp)
        expect(await timeTravelFacet.blockTimestamp()).to.be.equal(newTimestamp)
    })

    it('GIVEN incorrect system timestamp change THEN revert with InvalidTimestamp', async () => {
        const newTimestamp = 0
        await expect(
            timeTravelFacet.changeSystemTimestamp(newTimestamp)
        ).to.revertedWithCustomError(timeTravelFacet, 'InvalidTimestamp')
    })

    it('GIVEN system timestamp reset THEN use network timestamp', async () => {
        const newTimestamp = dateToUnixTimestamp('2030-01-01T00:00:00Z')
        await timeTravelFacet.changeSystemTimestamp(newTimestamp)
        await expect(timeTravelFacet.resetSystemTimestamp()).to.emit(
            timeTravelFacet,
            'SystemTimestampReset'
        )
        const latestBlock = await ethers.provider.getBlock('latest')
        const latestTimestamp = latestBlock.timestamp
        expect(await timeTravelFacet.blockTimestamp()).to.be.equal(
            latestTimestamp
        )
    })
})
