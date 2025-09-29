import { HederaId } from '@domain/context/shared/HederaId';
import { createFixture } from '../config';
import { HederaIdPropsFixture } from '../shared/DataFixture';
import { IsProceedRecipientQuery } from '@query/security/proceedRecipient/isProceedRecipient/IsProceedRecipientQuery';
import { AddProceedRecipientCommand } from '@command/security/proceedRecipients/addProceedRecipient/AddProceedRecipientCommand';
import { RemoveProceedRecipientCommand } from '@command/security/proceedRecipients/removeProceedRecipient/RemoveProceedRecipientCommand';
import { UpdateProceedRecipientDataCommand } from '@command/security/proceedRecipients/updateProceedRecipientData/UpdateProceedRecipientDataCommand';
import { GetProceedRecipientDataQuery } from '@query/security/proceedRecipient/getProceedRecipientData/GetProceedRecipientDataQuery';
import { GetProceedRecipientsCountQuery } from '@query/security/proceedRecipient/getProceedRecipientsCount/GetProceedRecipientsCountQuery';
import { GetProceedRecipientsQuery } from '@query/security/proceedRecipient/getProceedRecipients/GetProceedRecipientsQuery';

export const IsProceedRecipientQueryFixture =
  createFixture<IsProceedRecipientQuery>((query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
    query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  });

export const GetProceedRecipientDataQueryFixture =
  createFixture<GetProceedRecipientDataQuery>((query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
    query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  });
export const GetProceedRecipientsCountQueryFixture =
  createFixture<GetProceedRecipientsCountQuery>((query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
  });

export const GetProceedRecipientsQueryFixture =
  createFixture<GetProceedRecipientsQuery>((query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
    query.pageIndex.faker((f) => f.number.int({ min: 1, max: 20 }));
    query.pageSize.faker((f) => f.number.int({ min: 1, max: 100 }));
  });

export const AddProceedRecipientCommandFixture =
  createFixture<AddProceedRecipientCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.proceedRecipient.as(() => HederaIdPropsFixture.create().value);
    command.data?.as(() => '0x');
  });

export const RemoveProceedRecipientCommandFixture =
  createFixture<RemoveProceedRecipientCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.proceedRecipient.as(() => HederaIdPropsFixture.create().value);
  });

export const UpdateProceedRecipientDataCommandFixture =
  createFixture<UpdateProceedRecipientDataCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.proceedRecipient.as(() => HederaIdPropsFixture.create().value);
    command.data.as(() => '0x');
  });
