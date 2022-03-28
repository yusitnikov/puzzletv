import {Dispatch, useCallback, useState} from "react";

export const usePureState = <T>(initialValue: T | (() => T)): [T, Dispatch<T>] => {
    const [value, setValue] = useState(initialValue);

    const setPureValue = useCallback(
        (value: T | ((prevValue: T) => T)) => setValue(prevValue => {
            if (typeof value === "function") {
                value = (value as (prevValue: T) => T)(prevValue);
            }

            return JSON.stringify(value) === JSON.stringify(prevValue) ? prevValue : value;
        }),
        [setValue]
    );

    return [value, setPureValue];
};
