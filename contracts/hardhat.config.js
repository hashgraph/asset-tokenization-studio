'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
require('@nomicfoundation/hardhat-toolbox')
//import "tsconfig-paths/register";
const config = {
    solidity: {
        version: '0.8.18',
        settings: {
            optimizer: {
                enabled: true,
                runs: 1000,
            },
        },
    },
    typechain: {
        outDir: './typechain-types',
    },
}
exports.default = config
