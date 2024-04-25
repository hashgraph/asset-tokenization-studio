import { FormControl as ChakraFormControl, FormErrorMessage as ChakraFormErrorMessage, } from "@chakra-ui/react";
import React from "react";
export var FieldController = function (_a) {
    var _b;
    var children = _a.children, fieldState = _a.fieldState, errorMessageVariant = _a.errorMessageVariant, _c = _a.showErrors, showErrors = _c === void 0 ? true : _c;
    var isInvalid = !!(fieldState === null || fieldState === void 0 ? void 0 : fieldState.error);
    var message = (_b = fieldState === null || fieldState === void 0 ? void 0 : fieldState.error) === null || _b === void 0 ? void 0 : _b.message;
    return (React.createElement(ChakraFormControl, { isInvalid: isInvalid },
        children,
        showErrors && !!message && (React.createElement(ChakraFormErrorMessage, { "data-testid": "form-error-message", variant: errorMessageVariant }, message))));
};
