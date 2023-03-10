import {createContext, JSXElementConstructor, useContext, useState} from "react";
import {useEventListener} from "./useEventListener";

const HashContext = createContext<string | undefined>(undefined);

const getHash = () => window.location.hash.substring(1);

export const useHash = () => {
    const hashFromContext = useContext(HashContext);

    const [hash, setHash] = useState(getHash);

    useEventListener(window, "hashchange", () => setHash(getHash));

    return hashFromContext ?? hash;
};

interface HashProps {
    _hash?: string;
}

export const WithHashContext = <PropsT,>(Component: JSXElementConstructor<PropsT>) =>
    ({_hash = "", ...props}: PropsT & HashProps) => <HashContext.Provider value={_hash}>
        <Component {...props as PropsT}/>
    </HashContext.Provider>;
