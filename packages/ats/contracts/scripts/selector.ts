import { Interface, id } from 'ethers/lib/utils'

export function getSelector(
    contractFactory: { interface: Interface },
    selector: string,
    asBytes4: boolean = false
): string {
    const iface = contractFactory.interface
    const fragment = iface.fragments.find((f) => f.name === selector)
    if (!fragment) {
        throw new Error(`Selector "${selector}" is not implemented`)
    }

    const sigHash = id(fragment.format('sighash')).slice(0, 10)

    if (asBytes4) return sigHash

    return sigHash.padEnd(66, '0')
}
