/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeClient, toHashgraphKey, deployFactory as dp } from './deploy'

import { getClient } from './utils'

export const deployFactory = async () => {
    const [
        client,
        operatorAccount,
        operatorPriKey,
        //client1publickey,
        operatorIsE25519,
    ] = initializeClient()

    // Deploy Token using Client
    const clientSdk = getClient()
    clientSdk.setOperator(
        operatorAccount,
        toHashgraphKey(operatorPriKey, operatorIsE25519)
    )

    const result = await dp(clientSdk, operatorPriKey, operatorIsE25519)

    const proxyAddress = result[0]
    const proxyAdminAddress = result[1]
    const factoryAddress = result[2]

    console.log(
        '\nProxy Address: \t',
        proxyAddress.toString(),
        '\nProxy Admin Address: \t',
        proxyAdminAddress.toString(),
        '\nFactory Address: \t',
        factoryAddress.toString()
    )
}
