import { ethers } from 'hardhat'
import { ProxyAdmin } from '../typechain-types'
import { TransparentUpgradeableProxy } from '../typechain-types'

export let transparentUpgradableProxy: TransparentUpgradeableProxy
export let proxyAdmin: ProxyAdmin

export async function deployProxyAdmin() {
    proxyAdmin = await (await ethers.getContractFactory('ProxyAdmin')).deploy()
}
export async function deployTransparentUpgradeableProxy(
    businessLogicAddress: string
) {
    transparentUpgradableProxy = await (
        await ethers.getContractFactory('TransparentUpgradeableProxy')
    ).deploy(businessLogicAddress, proxyAdmin.address, '0x')
}
