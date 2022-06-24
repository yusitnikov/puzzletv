import {useMemo} from "react";
import {useHash} from "./useHash";
import {parseLink} from "../utils/link";

export const useRoute = () => {
    const hash = useHash();

    return useMemo(() => ({hash, ...parseLink(hash)}), [hash]);
};
