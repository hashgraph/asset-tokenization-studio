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
import {
  GetScheduledCouponListingQuery,
  GetScheduledCouponListingQueryResponse,
} from "../../../../app/usecase/query/scheduledCouponListing/getScheduledCouponListing/GetScheduledCouponListingQuery";
import GetScheduledCouponListingRequest from "@port/in/request/scheduledTasks/GetScheduledCouponListingRequest";

interface IScheduledCouponListingInPort {
  scheduledCouponListingCount(request: ScheduledCouponListingCountRequest): Promise<number>;
  getScheduledCouponListing(request: GetScheduledCouponListingRequest): Promise<any>;
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

  @LogError
  async getScheduledCouponListing(request: GetScheduledCouponListingRequest): Promise<any> {
    ValidatedRequest.handleValidation("GetScheduledCouponListingRequest", request);

    const query = new GetScheduledCouponListingQuery(request.securityId, request.pageIndex, request.pageLength);

    const result: GetScheduledCouponListingQueryResponse = await this.queryBus.execute(query);

    return result.scheduledCouponListing;
  }
}

const ScheduledCouponListing = new ScheduledCouponListingInPort();
export default ScheduledCouponListing;
