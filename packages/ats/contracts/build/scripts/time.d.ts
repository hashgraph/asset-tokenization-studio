export declare function delay({ time, unit, }: {
    time: number;
    unit?: 'seconds' | 'milliseconds' | 'sec' | 'ms';
}): Promise<boolean>;
export declare function dateToUnixTimestamp(dateString: string): number;
