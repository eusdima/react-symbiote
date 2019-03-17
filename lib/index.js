var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("index", ["require", "exports", "fast-deep-equal"], function (require, exports, fast_deep_equal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    fast_deep_equal_1 = __importDefault(fast_deep_equal_1);
    /**
     * Should component update focussed library
     */
    var PRIORITY;
    (function (PRIORITY) {
        PRIORITY[PRIORITY["IGNORE"] = -1] = "IGNORE";
        PRIORITY[PRIORITY["LOW"] = 0] = "LOW";
        PRIORITY[PRIORITY["MEDIUM"] = 1] = "MEDIUM";
        PRIORITY[PRIORITY["HIGH"] = 2] = "HIGH";
    })(PRIORITY = exports.PRIORITY || (exports.PRIORITY = {}));
    const DEFAULT_CONFIG = {
        medium: 1000,
        low: 2000
    };
    const _shouldIUpdate = (oldValue, newValue) => !fast_deep_equal_1.default(oldValue, newValue);
    /**
     * Function to create shouldComponentUpdate based on:
     * - given old/new values
     * - PrioritySpec
     *
     * Must attachComponent allow medium and low priotiy updates debouncing
     *
     * @param priorities
     * @param config
     * @param attachedComponent
     */
    exports.generateUpdateBlueprint = (priorities, config, attachedComponent) => {
        const userConfig = { ...DEFAULT_CONFIG, config };
        const lows = [], mediums = [], highs = [];
        Object.entries(priorities).forEach(([key, priority]) => {
            switch (priority) {
                case PRIORITY.LOW:
                    lows.push(key);
                    break;
                case PRIORITY.MEDIUM:
                    mediums.push(key);
                    break;
                case PRIORITY.HIGH:
                    highs.push(key);
                    break;
                default:
                    break;
            }
        });
        function schedulMediumUpdate() {
            if (attachedComponent) {
                if (attachedComponent._mediumUpdateTimer === undefined) {
                    attachedComponent._mediumUpdateTimer = setTimeout(() => {
                        attachedComponent._mediumUpdateTimer = undefined;
                        attachedComponent.forceUpdate();
                    }, userConfig.medium ? userConfig.medium : 500);
                }
                return true;
            }
            return false;
        }
        function schedulLowUpdate() {
            if (attachedComponent) {
                if (attachedComponent._lowUpdateTimer === undefined) {
                    attachedComponent._lowUpdateTimer = setTimeout(() => {
                        attachedComponent._lowUpdateTimer = undefined;
                        attachedComponent.forceUpdate();
                    }, userConfig.low ? userConfig.low : 1000);
                }
                return true;
            }
            return false;
        }
        return (oldValues, newValues) => {
            let index = 0;
            if (!(oldValues && newValues)) {
                return oldValues !== newValues;
            }
            for (index = 0; index < highs.length; index++) {
                const key = highs[index];
                if (_shouldIUpdate(oldValues[key], newValues[key])) {
                    return true;
                }
            }
            for (index = 0; index < mediums.length; index++) {
                const key = mediums[index];
                if (_shouldIUpdate(oldValues[key], newValues[key])) {
                    // Couldn't connect with the component
                    if (schedulMediumUpdate() === false) {
                        return true;
                    }
                }
            }
            for (index = 0; index < lows.length; index++) {
                const key = lows[index];
                if (_shouldIUpdate(oldValues[key], newValues[key])) {
                    if (schedulLowUpdate() === false) {
                        return true;
                    }
                }
            }
            return false;
        };
    };
});
//# sourceMappingURL=index.js.map