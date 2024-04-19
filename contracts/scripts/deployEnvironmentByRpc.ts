import { deployProxyToFactory, factory } from './factory'
import {
    IBusinessLogicResolver,
    IFactory,
    IStaticFunctionSelectors,
    ProxyAdmin,
} from '../typechain-types'
import {
    businessLogicResolver,
    deployProxyToBusinessLogicResolver,
    DeployedBusinessLogics,
    deployBusinessLogics,
    registerBusinessLogics,
} from './businessLogicResolverLogic'
import { proxyAdmin } from './transparentUpgradableProxy'

interface Environment {
    deployedBusinessLogics: DeployedBusinessLogics
    proxyAdmin: ProxyAdmin
    resolver: IBusinessLogicResolver
    factory: IFactory
}

export const environment: Environment = buildEmptyEnvironment()
let environmentInitialized = false

async function deployResolverInEnvironment() {
    await deployProxyToBusinessLogicResolver(
        environment.deployedBusinessLogics.businessLogicResolver.address
    )
    environment.proxyAdmin = proxyAdmin
    environment.resolver = businessLogicResolver
}

async function deployFactoryInEnvironment() {
    await deployProxyToFactory(
        environment.deployedBusinessLogics.factory.address
    )
    environment.factory = factory
}

export async function deployEnvironment() {
    if (!environmentInitialized) {
        await deployBusinessLogics(environment.deployedBusinessLogics)
        await deployResolverInEnvironment()
        await registerBusinessLogics(environment.deployedBusinessLogics)
        await deployFactoryInEnvironment()
        environmentInitialized = true
    }
}

function buildEmptyEnvironment(): Environment {
    return {
        deployedBusinessLogics: {
            businessLogicResolver: {} as IStaticFunctionSelectors,
            factory: {} as IStaticFunctionSelectors,
            diamondFacet: {} as IStaticFunctionSelectors,
            accessControl: {} as IStaticFunctionSelectors,
            controlList: {} as IStaticFunctionSelectors,
            corporateActionsSecurity: {} as IStaticFunctionSelectors,
            pause: {} as IStaticFunctionSelectors,
            eRC20: {} as IStaticFunctionSelectors,
            eRC1644: {} as IStaticFunctionSelectors,
            eRC1410ScheduledSnapshot: {} as IStaticFunctionSelectors,
            eRC1594: {} as IStaticFunctionSelectors,
            eRC1643: {} as IStaticFunctionSelectors,
            equityUSA: {} as IStaticFunctionSelectors,
            bondUSA: {} as IStaticFunctionSelectors,
            snapshots: {} as IStaticFunctionSelectors,
            scheduledSnapshots: {} as IStaticFunctionSelectors,
            cap: {} as IStaticFunctionSelectors,
            lock: {} as IStaticFunctionSelectors,
            transferAndLock: {} as IStaticFunctionSelectors,
        },
        proxyAdmin: {} as ProxyAdmin,
        resolver: {} as IBusinessLogicResolver,
        factory: {} as IFactory,
    }
}
