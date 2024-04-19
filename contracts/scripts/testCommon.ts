import { type Pause, type AccessControl } from '../typechain-types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers.js'

export async function grantRoleAndPauseToken(
    accessControlFacet: AccessControl,
    pauseFacet: Pause,
    _ROLE: string,
    signer_AccessControl: SignerWithAddress,
    signer_Pause: SignerWithAddress,
    account_to_Assign_Role: string
) {
    // Granting Role to account C
    accessControlFacet = accessControlFacet.connect(signer_AccessControl)
    await accessControlFacet.grantRole(_ROLE, account_to_Assign_Role)
    // Pausing the token
    pauseFacet = pauseFacet.connect(signer_Pause)
    await pauseFacet.pause()
}
