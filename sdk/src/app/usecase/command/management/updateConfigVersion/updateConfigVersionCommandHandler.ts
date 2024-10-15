import {CommandHandler} from "../../../../../core/decorator/CommandHandlerDecorator";
import {UpdateConfigVersionCommand, UpdateConfigVersionCommandResponse} from "./updateConfigVersionCommand";
import {ICommandHandler} from "../../../../../core/command/CommandHandler";
import {lazyInject} from "../../../../../core/decorator/LazyInjectDecorator";
import TransactionService from "../../../../service/TransactionService";
import {MirrorNodeAdapter} from "../../../../../port/out/mirror/MirrorNodeAdapter";
import EvmAddress from "../../../../../domain/context/contract/EvmAddress";
import {HEDERA_FORMAT_ID_REGEX} from "../../../../../domain/context/shared/HederaId";

@CommandHandler(UpdateConfigVersionCommand)
export class UpdateConfigVersionCommandHandler
    implements ICommandHandler<UpdateConfigVersionCommand>
{

    constructor(
        @lazyInject(TransactionService)
        public readonly transactionService: TransactionService,
        @lazyInject(MirrorNodeAdapter)
        private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    ) {
    }

    async execute(command: UpdateConfigVersionCommand): Promise<UpdateConfigVersionCommandResponse> {
        const {configVersion, securityId} = command;
        const handler = this.transactionService.getHandler();

        const securityEvmAddress: EvmAddress = new EvmAddress(
            HEDERA_FORMAT_ID_REGEX.exec(securityId)
                ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
                : securityId,
        );

        const res = await handler.updateConfigVersion(securityEvmAddress, configVersion, securityId);

        return Promise.resolve(
            new UpdateConfigVersionCommandResponse(res.error === undefined, res.id!),
        );
    }

}