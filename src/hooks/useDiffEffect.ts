import {useEffect, useRef} from "react";

export const useDiffEffect = <T extends Array<any>>(callback: (prevDependencies: T | []) => void, dependencies: T): void => {
    const dependenciesRef = useRef<T | []>([]);

    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(
        () => {
            callbackRef.current(dependenciesRef.current || []);

            dependenciesRef.current = dependencies;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        dependencies
    );
};
