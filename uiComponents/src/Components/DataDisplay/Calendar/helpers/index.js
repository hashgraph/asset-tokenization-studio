import { parse } from "date-fns";
import { countBy as _countBy } from "lodash";
export var getZone = function () {
    var now = new Date();
    var options = {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timeZoneName: "short",
        hour12: false
    };
    return now.toLocaleString("en-US", options).split(" ")[2];
};
export var parseTimeInputValue = function (value, selectedDate) {
    var date;
    if (!value || !selectedDate)
        return date;
    if (_countBy(value, function (c) { return c === ":"; })["true"] === 1) {
        date = parse(value, "HH:mm", selectedDate);
    }
    if (_countBy(value, function (c) { return c === ":"; })["true"] === 2) {
        date = parse(value, "HH:mm:ss", selectedDate);
    }
    return date;
};
