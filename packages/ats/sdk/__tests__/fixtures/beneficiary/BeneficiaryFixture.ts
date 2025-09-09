import { HederaId } from '@domain/context/shared/HederaId';
import { createFixture } from '../config';
import { HederaIdPropsFixture } from '../shared/DataFixture';
import { IsBeneficiaryQuery } from '@query/security/beneficiary/isBeneficiary/IsBeneficiaryQuery';
import { AddBeneficiaryCommand } from '@command/security/beneficiaries/addBeneficiary/AddBeneficiaryCommand';
import { RemoveBeneficiaryCommand } from '@command/security/beneficiaries/removeBeneficiary/RemoveBeneficiaryCommand';
import { UpdateBeneficiaryDataCommand } from '@command/security/beneficiaries/updateBeneficiaryData/UpdateBeneficiaryDataCommand';

export const IsBeneficiaryQueryFixture = createFixture<IsBeneficiaryQuery>(
  (query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
    query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  },
);

export const AddBeneficiaryCommandFixture =
  createFixture<AddBeneficiaryCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.beneficiary.as(() => HederaIdPropsFixture.create().value);
    command.data.as(() => '0x');
  });

export const RemoveBeneficiaryCommandFixture =
  createFixture<RemoveBeneficiaryCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.beneficiary.as(() => HederaIdPropsFixture.create().value);
  });

export const UpdateBeneficiaryDataCommandFixture =
  createFixture<UpdateBeneficiaryDataCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.beneficiary.as(() => HederaIdPropsFixture.create().value);
    command.data.as(() => '0x');
  });
