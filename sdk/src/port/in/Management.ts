import UpdateConfigVersionRequest from "./request/UpdateConfigVersionRequest";
import {LogError} from "../../core/decorator/LogErrorDecorator";
import {handleValidation} from "./Common";
import {
    UpdateConfigVersionCommand
} from "../../app/usecase/command/management/updateConfigVersion/updateConfigVersionCommand";
import {QueryBus} from "../../core/query/QueryBus";
import Injectable from "../../core/Injectable";
import {CommandBus} from "../../core/command/CommandBus";

interface IManagementInPort {
    updateConfigVersion(UpdateConfigVersionRequest): Promise<{ payload: boolean; transactionId: string }>;
}

class ManagementInPort implements IManagementInPort {

    constructor(
        private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
        private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    ) {
    }

    @LogError
    async updateConfigVersion(request: UpdateConfigVersionRequest): Promise<{payload: boolean; transactionId: string }> {
        const {configVersion, securityId} = request;
        handleValidation('UpdateConfigVersionRequest', request);

        return await this.commandBus.execute(
            new UpdateConfigVersionCommand(configVersion, securityId)
        );
    }
}

const Management = new ManagementInPort();
export default Management;