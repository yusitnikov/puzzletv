import {useCallback, useState} from "react";

export const useStateWithStorage = <T>(getter: () => T, setter: (value: T) => void): [T, (value: T) => void] => {
    const [value, setValue] = useState(getter);

    return [
        value,
        useCallback((value) => {
            setValue(value);
            setter(value);
        }, [setValue, setter]),
    ];
};
