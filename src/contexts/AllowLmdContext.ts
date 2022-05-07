import {createContext, useContext} from "react";

export const AllowLmdContext = createContext<boolean>(false);

export const useAllowLmd = () => useContext(AllowLmdContext);
