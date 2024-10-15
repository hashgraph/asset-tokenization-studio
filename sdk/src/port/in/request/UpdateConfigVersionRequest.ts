import ValidatedRequest from "./validation/ValidatedRequest";
import Validation from "./validation/Validation";

export default class UpdateConfigVersionRequest extends ValidatedRequest<UpdateConfigVersionRequest>{
    configVersion: string;
    securityId: string;

    constructor({
        configVersion,
        securityId
        }: {
        configVersion: string;
        securityId: string;
        }) {
        super({
            configVersion: Validation.checkHederaIdFormatOrEvmAddress(),
            securityId: Validation.checkString({max: 10, min: 1}),
        });

        this.configVersion = configVersion;
        this.securityId = securityId;
    }
}