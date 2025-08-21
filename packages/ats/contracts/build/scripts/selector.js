"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelector = getSelector;
const utils_1 = require("ethers/lib/utils");
function getSelector(contractFactory, selector, asBytes4 = false) {
    const iface = contractFactory.interface;
    const fragment = iface.fragments.find((f) => f.name === selector);
    if (!fragment) {
        throw new Error(`Selector "${selector}" is not implemented`);
    }
    const sigHash = (0, utils_1.id)(fragment.format('sighash')).slice(0, 10);
    if (asBytes4)
        return sigHash;
    return sigHash.padEnd(66, '0');
}
