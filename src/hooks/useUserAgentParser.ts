import {useMemo} from "react";
import {UAParser} from "ua-parser-js";

export const useUserAgentParser = () => useMemo(() => new UAParser().getResult(), []);
