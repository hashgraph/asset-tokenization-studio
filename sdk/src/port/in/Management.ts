import UpdateConfigVersionRequest from "./request/UpdateConfigVersionRequest";
import {LogError} from "../../core/decorator/LogErrorDecorator";
import {handleValidation} from "./Common";

interface IManagementInPort {
    updateConfigVersion(UpdateConfigVersionRequest): Promise<void>;
}

class ManagementInPort implements IManagementInPort {

    @LogError
    async updateConfigVersion(request: UpdateConfigVersionRequest): Promise<void> {
        const {configVersion, securityId} = request;
        handleValidation('UpdateConfigVersionRequest', request);

        return Promise.resolve();
    }
}