// SPDX-License-Identifier: Apache-2.0

import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import ScheduledCouponListingCountRequest from "@port/in/request/scheduledTasks/ScheduledCouponListingCountRequest";
import {
  ScheduledCouponListingCountQuery,
  ScheduledCouponListingCountQueryResponse,
} from "../../../../app/usecase/query/scheduledTasks/scheduledCouponListingCount/ScheduledCouponListingCountQuery";

interface IScheduledCouponListingInPort {
  scheduledCouponListingCount(request: ScheduledCouponListingCountRequest): Promise<number>;
}

class ScheduledCouponListingInPort implements IScheduledCouponListingInPort {
  constructor(private readonly queryBus: QueryBus = Injectable.resolve(QueryBus)) {}

  @LogError
  async scheduledCouponListingCount(request: ScheduledCouponListingCountRequest): Promise<number> {
    ValidatedRequest.handleValidation("ScheduledCouponListingCountRequest", request);

    const query = new ScheduledCouponListingCountQuery(request.securityId);

    const result: ScheduledCouponListingCountQueryResponse = await this.queryBus.execute(query);

    return result.count;
  }
}

const ScheduledCouponListing = new ScheduledCouponListingInPort();
export default ScheduledCouponListing;
