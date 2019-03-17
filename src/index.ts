import equal from 'fast-deep-equal';

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

const DEFAULT_CONFIG: IConfig = {
  medium: 1000,
  low: 2000
};

const _shouldIUpdate = (oldValue: any, newValue: any): boolean =>
  !equal(oldValue, newValue);

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
export const generateUpdateBlueprint = (
  priorities: IPrioritySpec,
  config: IConfig,
  attachedComponent?: any
): Function => {
  const userConfig = { ...DEFAULT_CONFIG, config };
  const lows: Array<string> = [],
    mediums: Array<string> = [],
    highs: Array<string> = [];

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

  function schedulMediumUpdate(): boolean {
    if (attachedComponent) {
      if (attachedComponent._mediumUpdateTimer === undefined) {
        attachedComponent._mediumUpdateTimer = setTimeout(
          () => {
            attachedComponent._mediumUpdateTimer = undefined;

            attachedComponent.forceUpdate();
          },
          userConfig.medium ? userConfig.medium : 500
        );
      }

      return true;
    }

    return false;
  }

  function schedulLowUpdate(): boolean {
    if (attachedComponent) {
      if (attachedComponent._lowUpdateTimer === undefined) {
        attachedComponent._lowUpdateTimer = setTimeout(
          () => {
            attachedComponent._lowUpdateTimer = undefined;

            attachedComponent.forceUpdate();
          },
          userConfig.low ? userConfig.low : 1000
        );
      }

      return true;
    }

    return false;
  }

  return (oldValues: any, newValues: any): boolean => {
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
