import {createContext, RefObject, useContext} from "react";

export const PuzzleContainerContext = createContext<RefObject<HTMLDivElement>>({current: null});

export const usePuzzleContainer = () => useContext(PuzzleContainerContext).current!;
