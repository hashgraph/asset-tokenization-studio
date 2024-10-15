import UpdateConfigVersionRequest from "./request/UpdateConfigVersionRequest";
import {LogError} from "../../core/decorator/LogErrorDecorator";
import {handleValidation} from "./Common";

interface IManagementInPort {
    updateConfigVersion(UpdateConfigVersionRequest): Promise<void>;
}

class ManagementInPort implements IManagementInPort {
//TODO
}

const Management = new ManagementInPort();
export default Management;