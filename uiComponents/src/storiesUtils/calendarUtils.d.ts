export declare const daysOfWeek: number[];
export declare const commonCalendarArgsTypes: {
    isDisabled: {
        control: {
            type: string;
            defaultValue: boolean;
        };
        describe: string;
    };
    fromDate: {
        control: {
            type: string;
        };
        describe: string;
    };
    toDate: {
        control: {
            type: string;
        };
        describe: string;
    };
    todayTooltip: {
        control: {
            type: string;
            defaultValue: string;
        };
        describe: string;
    };
    disabledWeekends: {
        control: {
            type: string;
            defaultValue: boolean;
        };
        describe: string;
    };
    disabledWeekdays: {
        options: number[];
        control: {
            type: string;
            defaultValue: undefined;
        };
        describe: string;
    };
    disabledDates: {
        control: {
            type: string;
        };
        describe: string;
    };
};
