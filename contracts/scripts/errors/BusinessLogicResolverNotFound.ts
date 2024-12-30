import { MESSAGES } from '../'

export default class BusinessLogicResolverNotFound extends Error {
    constructor() {
        super(MESSAGES.bussinessLogicResolver.notFound)
    }
}
