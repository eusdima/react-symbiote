declare module "index" {
    /**
     * Should component update focussed library
     */
    export enum PRIORITY {
        IGNORE = -1,
        LOW = 0,
        MEDIUM = 1,
        HIGH = 2
    }
    export interface IPrioritySpec {
        [key: string]: PRIORITY;
    }
    /**
     * Config medium and low debounce timeout
     */
    export interface IConfig {
        medium?: number;
        low?: number;
    }
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
    export const generateUpdateBlueprint: (priorities: IPrioritySpec, config: IConfig, attachedComponent?: any) => Function;
}
