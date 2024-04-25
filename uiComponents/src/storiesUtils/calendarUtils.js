export var daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
export var commonCalendarArgsTypes = {
    isDisabled: {
        control: {
            type: "boolean",
            defaultValue: false
        },
        describe: "Disable the calendar"
    },
    fromDate: {
        control: {
            type: "date"
        },
        describe: "Earliest date that can be selected"
    },
    toDate: {
        control: {
            type: "date"
        },
        describe: "Latest date that can be selected"
    },
    todayTooltip: {
        control: {
            type: "text",
            defaultValue: "Today"
        },
        describe: "Tooltip to be shown when hovering over the current day"
    },
    disabledWeekends: {
        control: {
            type: "boolean",
            defaultValue: false
        },
        describe: "Disable weekends"
    },
    disabledWeekdays: {
        options: daysOfWeek,
        control: {
            type: "multi-select",
            defaultValue: undefined
        },
        describe: "Disable weekdays (0: Sunday,1: Monday,2: Tuesday,3: Wednesday,4: Thursday,5: Friday,6: Saturday)"
    },
    disabledDates: {
        control: {
            type: "date"
        },
        describe: "Disable specific dates"
    }
};
