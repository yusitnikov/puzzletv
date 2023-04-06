import {useDiffEffect} from "./useDiffEffect";

export const useEffectExceptInit = (callback: () => void, dependencies: unknown[]) => useDiffEffect(
    (prevDependencies, currentDependencies) => {
        if (prevDependencies.length && currentDependencies.length) {
            callback();
        }
    },
    dependencies
);
