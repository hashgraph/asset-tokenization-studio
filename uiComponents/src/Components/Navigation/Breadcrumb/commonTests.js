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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React from "react";
export var defaultProps = {
    items: [
        {
            label: "Level 0",
            link: "/"
        },
        {
            label: "Level 1",
            link: "/level1"
        },
        {
            label: "Level 2",
            link: "/level1/level2"
        },
        {
            label: "Level 3",
            link: "/level1/level2/level3"
        },
        {
            label: "Level 4",
            link: "/level1/level2/level3/level4"
        },
        {
            label: "Level 5",
            link: "/level1/level2/level3/level4/level5"
        },
        {
            label: "Level 6",
            link: "http://www.google.com"
        },
        {
            label: "Level 7",
            link: "/level1/level2/level3/level4/level5/level6/level7"
        },
        {
            label: "Level 8",
            link: null
        },
    ],
    showMaxItems: false
};
export var CustomLink = function (_a) {
    var children = _a.children, props = __rest(_a, ["children"]);
    return (React.createElement("a", __assign({}, props, { style: { color: "blue", fontSize: "24px" } }), children));
};
export var customProps = {
    items: [
        {
            label: "Level 0",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-0",
                href: "/level0"
            }
        },
        {
            label: "Level 1",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-1",
                href: "/level1"
            }
        },
        {
            label: "Level 2",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-2",
                href: "/level2"
            }
        },
        {
            label: "Level 3",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-3",
                href: "/level3"
            }
        },
        {
            label: "Level 4",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-4",
                href: "/level4"
            }
        },
        {
            label: "Level 5",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-5",
                href: "/level5"
            }
        },
        {
            label: "Level 6",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-6",
                href: "/level6"
            }
        },
        {
            label: "Level 7",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-7",
                href: "http://www.google.com"
            }
        },
        {
            label: "Level 8",
            link: {
                as: CustomLink,
                "data-testid": "custom-link-8"
            }
        },
    ],
    showMaxItems: true
};
