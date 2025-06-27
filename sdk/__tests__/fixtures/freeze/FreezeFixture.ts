import { FreezePartialTokensCommand } from 'app/usecase/command/security/operations/freeze/freezePartialTokens/FreezePartialTokensCommand';
import { UnfreezePartialTokensCommand } from 'app/usecase/command/security/operations/freeze/unfreezePartialTokens/UnfreezePartialTokensCommand';
import { GetFrozenPartialTokensQuery } from 'app/usecase/query/security/freeze/getFrozenPartialTokens/GetFrozenPartialTokensQuery';
import {
  FreezePartialTokensRequest,
  UnfreezePartialTokensRequest,
} from 'index';
import { createFixture } from '../config';
import { HederaIdPropsFixture } from '../shared/DataFixture';

export const FreezePartialTokensCommandFixture =
  createFixture<FreezePartialTokensCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.amount.faker((faker) =>
      faker.number.int({ min: 1, max: 10 }).toString(),
    );
    command.targetId.as(() => HederaIdPropsFixture.create().value);
  });

export const FreezePartialTokensRequestFixture =
  createFixture<FreezePartialTokensRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) =>
      faker.number.int({ min: 1, max: 10 }).toString(),
    );
    request.targetId.as(() => HederaIdPropsFixture.create().value);
  });

export const UnfreezePartialTokensCommandFixture =
  createFixture<UnfreezePartialTokensCommand>((command) => {
    command.securityId.as(() => HederaIdPropsFixture.create().value);
    command.amount.faker((faker) =>
      faker.number.int({ min: 1, max: 10 }).toString(),
    );
    command.targetId.as(() => HederaIdPropsFixture.create().value);
  });

export const UnfreezePartialTokensRequestFixture =
  createFixture<UnfreezePartialTokensRequest>((request) => {
    request.securityId.as(() => HederaIdPropsFixture.create().value);
    request.amount.faker((faker) =>
      faker.number.int({ min: 1, max: 10 }).toString(),
    );
    request.targetId.as(() => HederaIdPropsFixture.create().value);
  });

export const GetFrozenPartialTokensQueryFixture =
  createFixture<GetFrozenPartialTokensQuery>((query) => {
    query.securityId.as(() => HederaIdPropsFixture.create().value);
    query.targetId.as(() => HederaIdPropsFixture.create().value);
  });
