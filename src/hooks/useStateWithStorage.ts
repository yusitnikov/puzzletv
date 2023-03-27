import {useCallback, useState} from "react";
import {useEventListener} from "./useEventListener";

export const useStateWithStorage = <T>(getter: () => T, setter: (value: T) => void): [T, (value: T) => void] => {
    const [value, setValue] = useState(getter);

    useEventListener(window, "storage", () => setValue(getter()));

    return [
        value,
        useCallback((value) => {
            setValue(value);
            setter(value);
            window.dispatchEvent(new StorageEvent("storage"));
        }, [setValue, setter]),
    ];
};
