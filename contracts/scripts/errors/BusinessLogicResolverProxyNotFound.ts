import { MESSAGES } from '../index'

export default class BusinessLogicResolverProxyNotFound extends Error {
    constructor() {
        super(MESSAGES.businessLogicResolver.error.proxyNotFound)
    }
}
