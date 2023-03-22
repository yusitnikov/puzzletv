import {DependencyList, useMemo} from "react";

export const usePureMemo = <T>(initialValue: T | (() => T), dependencies?: DependencyList): T => {
    const usualValue: T = typeof initialValue === "function"
        // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/rules-of-hooks
        ? useMemo(initialValue as (() => T), dependencies)
        : initialValue;

    return useMemo(
        () => usualValue,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(usualValue)]
    );
};
