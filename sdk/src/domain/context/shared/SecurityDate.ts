import BaseError from '../../../core/error/BaseError.js';
import InvalidTimestampRange from './error/InvalidTimestampRange.js';

export const ONE_THOUSAND = 1000;

export class SecurityDate {
  public static checkDateTimestamp(
    value: number,
    minTimeStamp?: number,
    maxTimeStamp?: number,
  ): BaseError[] {
    const errorList: BaseError[] = [];

    const minDate = minTimeStamp ? minTimeStamp : 0;
    const maxDate = maxTimeStamp ? maxTimeStamp : 0;

    if (value < minDate || (maxTimeStamp && value > maxDate)) {
      errorList.push(
        new InvalidTimestampRange(
          new Date(value),
          new Date(minDate),
          new Date(maxDate),
        ),
      );
    }

    return errorList;
  }
}
