import {useState} from "react";
import {useEventListener} from "./useEventListener";

const getHash = () => window.location.hash.substring(1);

export const useHash = () => {
    const [hash, setHash] = useState(getHash);

    useEventListener(window, "hashchange", () => setHash(getHash));

    return hash;
};
