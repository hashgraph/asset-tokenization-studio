import UpdateConfigVersionRequest from "./request/UpdateConfigVersionRequest";
import {LogError} from "../../core/decorator/LogErrorDecorator";
import {handleValidation} from "./Common";
import {GetConfigInfoRequest} from "./request";

interface IManagementInPort {
    updateConfigVersion(UpdateConfigVersionRequest): Promise<void>;
}

class ManagementInPort implements IManagementInPort {
    @LogError
    async getConfigInfo(
        request: GetConfigInfoRequest
    ): Promise<void> { //TODO: VIEW MODEL

    }
}

const Management = new ManagementInPort();
export default Management;