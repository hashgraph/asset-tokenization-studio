import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

import { FunctionFragment, EventFragment } from '@ethersproject/abi'

/**
 * Lists event names and their topic0 (keccak256 of the event signature) for Ethers v5
 */
task(
    'list-events-v5',
    'Shows the event names and topic0 (topic hash) for Ethers v5'
).setAction(async (_taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log('Fetching event signatures (Ethers v5)...')

    const allContractEvents: {
        [contractName: string]: { name: string; topic0: string }[]
    } = {}

    const contractNames = await hre.artifacts.getAllFullyQualifiedNames()
    console.log('Contract names:')
    console.log(contractNames)

    for (const qualifiedName of contractNames) {
        try {
            const artifact = await hre.artifacts.readArtifact(qualifiedName)
            const contractName = artifact.contractName

            if (!artifact.abi || artifact.abi.length === 0) {
                console.log(`Skipping ${contractName} (no ABI or empty ABI)`)
                continue
            }

            const iface = new hre.ethers.utils.Interface(artifact.abi)
            const eventsData: { name: string; topic0: string }[] = []

            for (const fragment of iface.fragments) {
                if (fragment.type === 'event') {
                    const eventFragment = fragment as EventFragment
                    const eventName = eventFragment.name
                    // topic0 = keccak256("EventName(type1,type2,...)")
                    const topic0 = iface.getEventTopic(eventFragment)
                    eventsData.push({ name: eventName, topic0 })
                }
            }

            if (eventsData.length > 0) {
                allContractEvents[contractName] = eventsData
            }
        } catch (error) {
            console.warn(
                `Could not process ${qualifiedName}: ${(error as Error).message}`
            )
        }
    }

    if (Object.keys(allContractEvents).length === 0) {
        console.log('No events were found in any contract.')
    } else {
        console.log(JSON.stringify(allContractEvents, null, 2))
    }
})

/**
 * Lists function names and their 4-byte selectors (sighash) for Ethers v5
 */
task(
    'list-functions-v5',
    'Shows the function names and 4-byte selectors (sighash) for Ethers v5'
).setAction(async (_taskArgs, hre: HardhatRuntimeEnvironment) => {
    console.log('Fetching function selectors (Ethers v5)...')

    const allContractFunctions: {
        [contractName: string]: { name: string; selector: string }[]
    } = {}

    const contractNames = await hre.artifacts.getAllFullyQualifiedNames()
    console.log('Contract names:')
    console.log(contractNames)

    for (const qualifiedName of contractNames) {
        try {
            const artifact = await hre.artifacts.readArtifact(qualifiedName)
            const contractName = artifact.contractName

            if (!artifact.abi || artifact.abi.length === 0) {
                console.log(`Skipping ${contractName} (no ABI or empty ABI)`)
                continue
            }

            const iface = new hre.ethers.utils.Interface(artifact.abi)
            const functionsData: { name: string; selector: string }[] = []

            for (const fragment of iface.fragments) {
                if (fragment.type === 'function') {
                    const functionFragment = fragment as FunctionFragment
                    const functionName = functionFragment.name
                    // 4-byte selector for the function
                    const selector = iface.getSighash(functionFragment)
                    functionsData.push({ name: functionName, selector })
                }
            }

            if (functionsData.length > 0) {
                allContractFunctions[contractName] = functionsData
            }
        } catch (error) {
            console.warn(
                `Could not process ${qualifiedName}: ${(error as Error).message}`
            )
        }
    }

    if (Object.keys(allContractFunctions).length === 0) {
        console.log('No functions were found in any contract.')
    } else {
        console.log(JSON.stringify(allContractFunctions, null, 2))
    }
})
