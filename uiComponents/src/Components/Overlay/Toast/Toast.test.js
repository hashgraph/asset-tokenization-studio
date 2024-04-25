var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useToast } from "./useToast";
import { DEFAULT_DURATION } from "./toastHelpers";
var toastMock = jest.fn();
jest.mock("@chakra-ui/react", function () { return (__assign(__assign({}, jest.requireActual("@chakra-ui/react")), { useToast: function () {
        return toastMock;
    } })); });
describe("UseToast", function () {
    var defaultProps = {
        variant: "solid",
        title: "TitleTest",
        description: "descriptionTest",
        status: "success",
        duration: DEFAULT_DURATION,
        position: "top-right"
    };
    test("call library hook correctly", function () {
        var toast = useToast();
        toast.show(__assign({}, defaultProps));
        expect(toastMock).toHaveBeenCalledWith(expect.objectContaining(__assign({}, defaultProps)));
    });
});
