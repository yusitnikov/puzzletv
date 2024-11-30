import { useMemo } from "react";

let id = 0;

export const useAutoIncrementId = () => useMemo(() => ++id, []);
