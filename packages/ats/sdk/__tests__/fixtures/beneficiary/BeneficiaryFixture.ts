import { HederaId } from '@domain/context/shared/HederaId';
import { createFixture } from '../config';
import { HederaIdPropsFixture } from '../shared/DataFixture';
import { IsBeneficiaryQuery } from '@query/security/beneficiary/isBeneficiary/IsBeneficiaryQuery';
import { AddBeneficiaryCommand } from '@command/security/beneficiaries/addBeneficiary/AddBeneficiaryCommand';
import { RemoveBeneficiaryCommand } from '@command/security/beneficiaries/removeBeneficiary/RemoveBeneficiaryCommand';
import { UpdateBeneficiaryDataCommand } from '@command/security/beneficiaries/updateBeneficiaryData/UpdateBeneficiaryDataCommand';
import { GetBeneficiaryDataQuery } from '@query/security/beneficiary/getBeneficiaryData/GetBeneficiaryDataQuery';
import { GetBeneficiariesCountQuery } from '@query/security/beneficiary/getBeneficiariesCount/GetBeneficiariesCountQuery';
import { GetBeneficiariesQuery } from '@query/security/beneficiary/getBeneficiaries/GetBeneficiariesQuery';

export const IsBeneficiaryQueryFixture = createFixture<IsBeneficiaryQuery>(
  (query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
    query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  },
);

export const GetBeneficiaryDataQueryFixture =
  createFixture<GetBeneficiaryDataQuery>((query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
    query.targetId.as(() => new HederaId(HederaIdPropsFixture.create().value));
  });
export const GetBeneficiariesCountQueryFixture =
  createFixture<GetBeneficiariesCountQuery>((query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
  });

export const GetBeneficiariesQueryFixture =
  createFixture<GetBeneficiariesQuery>((query) => {
    query.securityId.as(
      () => new HederaId(HederaIdPropsFixture.create().value),
    );
    query.pageIndex.faker((f) => f.number.int({ min: 1, max: 20 }));
    query.pageSize.faker((f) => f.number.int({ min: 1, max: 100 }));
  });

export const AddBeneficiaryCommandFixture =
  createFixture<AddBeneficiaryCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.beneficiary.as(() => HederaIdPropsFixture.create().value);
    command.data?.as(() => '0x');
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
