import {useDiffEffect} from "./useDiffEffect";

export const useEffectExceptInit = (callback: () => void, dependencies: unknown[]) => useDiffEffect(
    prevDependencies => {
        if (prevDependencies.length) {
            callback();
        }
    },
    dependencies
);
