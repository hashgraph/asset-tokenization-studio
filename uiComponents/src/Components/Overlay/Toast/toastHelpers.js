export var alertStatusTypeList = [
    "success",
    "warning",
    "error",
    "info",
    "loading",
];
export var isAlertStatus = function (obj) {
    return typeof obj === "string" && alertStatusTypeList.includes(obj);
};
export var DEFAULT_DURATION = 8000;
