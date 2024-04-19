//import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { ethers } from 'hardhat'
import { IBusinessLogicResolver } from '../typechain-types'
import { IStaticFunctionSelectors } from '../typechain-types'
import {
    transparentUpgradableProxy,
    deployProxyAdmin,
    deployTransparentUpgradeableProxy,
} from './transparentUpgradableProxy'
import { expect } from 'chai'

export interface BusinessLogicRegistryData {
    businessLogicKey: string
    businessLogicAddress: string
}

export interface DeployedBusinessLogics {
    businessLogicResolver: IStaticFunctionSelectors
    factory: IStaticFunctionSelectors
    diamondFacet: IStaticFunctionSelectors
    accessControl: IStaticFunctionSelectors
    controlList: IStaticFunctionSelectors
    corporateActionsSecurity: IStaticFunctionSelectors
    pause: IStaticFunctionSelectors
    eRC20: IStaticFunctionSelectors
    eRC1644: IStaticFunctionSelectors
    eRC1410ScheduledSnapshot: IStaticFunctionSelectors
    eRC1594: IStaticFunctionSelectors
    eRC1643: IStaticFunctionSelectors
    equityUSA: IStaticFunctionSelectors
    bondUSA: IStaticFunctionSelectors
    snapshots: IStaticFunctionSelectors
    scheduledSnapshots: IStaticFunctionSelectors
    cap: IStaticFunctionSelectors
    lock: IStaticFunctionSelectors
    transferAndLock: IStaticFunctionSelectors
}

export let businessLogicResolver: IBusinessLogicResolver

export async function deployProxyToBusinessLogicResolver(
    businessLogicResolverLogicAddress: string
) {
    //await loadFixture(deployProxyAdmin)
    await deployProxyAdmin()
    await deployTransparentUpgradeableProxy(businessLogicResolverLogicAddress)
    businessLogicResolver = await ethers.getContractAt(
        'BusinessLogicResolver',
        transparentUpgradableProxy.address
    )

    await businessLogicResolver.initialize_BusinessLogicResolver()
}

async function toStaticFunctionSelectors(
    address: string
): Promise<IStaticFunctionSelectors> {
    return await ethers.getContractAt('IStaticFunctionSelectors', address)
}

function capitalizeFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

function uncapitalizeFirst(str: string) {
    return str.charAt(0).toLowerCase() + str.slice(1)
}

export async function deployBusinessLogics(
    deployedAndRegisteredBusinessLogics: DeployedBusinessLogics
) {
    async function deployContractAndAssignIt(
        deployedAndRegisteredBusinessLogics: DeployedBusinessLogics,
        contractToDeploy: string
    ) {
        async function deployContract() {
            return await (
                await ethers.getContractFactory(contractToDeploy)
            ).deploy()
        }
        //await loadFixture(deployContract)
        const deployedContract = await deployContract()
        const deployedAndRegisteredBusinessLogics_Property =
            uncapitalizeFirst(contractToDeploy)
        deployedAndRegisteredBusinessLogics[
            deployedAndRegisteredBusinessLogics_Property as keyof DeployedBusinessLogics
        ] = await toStaticFunctionSelectors(deployedContract.address)
    }
    let key: keyof typeof deployedAndRegisteredBusinessLogics
    for (key in deployedAndRegisteredBusinessLogics) {
        await deployContractAndAssignIt(
            deployedAndRegisteredBusinessLogics,
            capitalizeFirst(key)
        )
    }
}

export async function registerBusinessLogics(
    deployedAndRegisteredBusinessLogics: DeployedBusinessLogics
) {
    const businessLogicsData: BusinessLogicRegistryData[] = []
    let key: keyof typeof deployedAndRegisteredBusinessLogics
    for (key in deployedAndRegisteredBusinessLogics) {
        if (key === 'businessLogicResolver' || key === 'factory') {
            continue
        }
        const businessLogic = deployedAndRegisteredBusinessLogics[key]
        businessLogicsData.push({
            businessLogicKey: await businessLogic.getStaticResolverKey(),
            businessLogicAddress: businessLogic.address,
        })
    }
    await expect(
        businessLogicResolver.registerBusinessLogics(businessLogicsData)
    ).to.emit(businessLogicResolver, 'BusinessLogicsRegistered')
}
