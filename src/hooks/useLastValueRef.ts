import {useRef} from "react";

export const useLastValueRef = <T>(value: T) => {
    const ref = useRef(value);
    ref.current = value;
    return ref;
};
